import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, HTTPException, Response
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.client import db_execute
from app.models.auth import LoginRequest, RegisterRequest

router = APIRouter()

_COOKIE_KEY = "refresh_token"
_COOKIE_PATH = "/api/auth"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_COOKIE_KEY,
        value=token,
        httponly=True,
        samesite="strict",
        path=_COOKIE_PATH,
        secure=settings.environment == "production",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=_COOKIE_KEY,
        path=_COOKIE_PATH,
        httponly=True,
        samesite="strict",
        secure=settings.environment == "production",
    )


async def _cleanup_tokens(user_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    await db_execute(
        "DELETE FROM refresh_tokens WHERE user_id = ? AND (revoked = 1 OR expires_at < ?)",
        [user_id, now],
    )


@router.post("/register", status_code=201)
async def register(body: RegisterRequest) -> JSONResponse:
    result = await db_execute(
        "SELECT id FROM users WHERE email = ?", [body.email]
    )
    if result.rows:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    await db_execute(
        "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        [user_id, body.email, hash_password(body.password), now],
    )

    access_token = create_access_token(user_id)
    raw_refresh, hashed_refresh = create_refresh_token()
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=settings.refresh_token_expire_days)
    ).isoformat()

    await db_execute(
        "INSERT INTO refresh_tokens (token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)",
        [hashed_refresh, user_id, expires_at],
    )

    response = JSONResponse(
        {"access_token": access_token, "token_type": "bearer"}, status_code=201
    )
    _set_refresh_cookie(response, raw_refresh)
    return response


@router.post("/login")
async def login(body: LoginRequest) -> JSONResponse:
    result = await db_execute(
        "SELECT id, password_hash FROM users WHERE email = ?", [body.email]
    )
    if not result.rows or not verify_password(
        body.password, result.rows[0]["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = result.rows[0]["id"]

    await _cleanup_tokens(user_id)

    access_token = create_access_token(user_id)
    raw_refresh, hashed_refresh = create_refresh_token()
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=settings.refresh_token_expire_days)
    ).isoformat()

    await db_execute(
        "INSERT INTO refresh_tokens (token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)",
        [hashed_refresh, user_id, expires_at],
    )

    response = JSONResponse({"access_token": access_token, "token_type": "bearer"})
    _set_refresh_cookie(response, raw_refresh)
    return response


@router.post("/logout")
async def logout(
    refresh_token: str | None = Cookie(default=None),
) -> JSONResponse:
    if refresh_token:
        await db_execute(
            "UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?",
            [hash_token(refresh_token)],
        )

    response = JSONResponse({"message": "Logged out"})
    _clear_refresh_cookie(response)
    return response


@router.post("/refresh")
async def refresh(
    refresh_token: str | None = Cookie(default=None),
) -> JSONResponse:
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    token_hash = hash_token(refresh_token)

    result = await db_execute(
        "SELECT user_id, expires_at, revoked FROM refresh_tokens WHERE token_hash = ?",
        [token_hash],
    )

    if not result.rows:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    row = result.rows[0]

    if row["revoked"]:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    if datetime.now(timezone.utc) > datetime.fromisoformat(row["expires_at"]):
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user_id = row["user_id"]

    await db_execute(
        "UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?", [token_hash]
    )

    await _cleanup_tokens(user_id)

    new_raw, new_hashed = create_refresh_token()
    new_expires = (
        datetime.now(timezone.utc)
        + timedelta(days=settings.refresh_token_expire_days)
    ).isoformat()

    await db_execute(
        "INSERT INTO refresh_tokens (token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)",
        [new_hashed, user_id, new_expires],
    )

    access_token = create_access_token(user_id)
    response = JSONResponse({"access_token": access_token, "token_type": "bearer"})
    _set_refresh_cookie(response, new_raw)
    return response
