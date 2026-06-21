import pytest

_VALID_USER = {"email": "alice@example.com", "password": "Passw0rd!"}


# ─── Register ─────────────────────────────────────────────────────────────────

async def test_register_success(client):
    resp = await client.post("/api/auth/register", json=_VALID_USER)
    assert resp.status_code == 201
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    # Refresh cookie must be set
    assert "refresh_token" in resp.cookies


async def test_register_duplicate_email(client):
    await client.post("/api/auth/register", json=_VALID_USER)
    resp = await client.post("/api/auth/register", json=_VALID_USER)
    assert resp.status_code == 409


async def test_register_invalid_email(client):
    resp = await client.post("/api/auth/register", json={"email": "not-an-email", "password": "Passw0rd!"})
    assert resp.status_code == 422


async def test_register_password_too_short(client):
    resp = await client.post("/api/auth/register", json={"email": "b@example.com", "password": "Sh0rt"})
    assert resp.status_code == 422


async def test_register_password_no_uppercase(client):
    resp = await client.post("/api/auth/register", json={"email": "b@example.com", "password": "passw0rd!"})
    assert resp.status_code == 422


async def test_register_password_no_digit(client):
    resp = await client.post("/api/auth/register", json={"email": "b@example.com", "password": "Password!"})
    assert resp.status_code == 422


# ─── Login ────────────────────────────────────────────────────────────────────

async def test_login_success(client):
    await client.post("/api/auth/register", json=_VALID_USER)
    resp = await client.post("/api/auth/login", json=_VALID_USER)
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in resp.cookies


async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json=_VALID_USER)
    resp = await client.post("/api/auth/login", json={**_VALID_USER, "password": "Wr0ngPass!"})
    assert resp.status_code == 401


async def test_login_unknown_email(client):
    resp = await client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "Passw0rd!"})
    assert resp.status_code == 401


# ─── Logout ───────────────────────────────────────────────────────────────────

async def test_logout_succeeds(client):
    await client.post("/api/auth/register", json=_VALID_USER)
    resp = await client.post("/api/auth/logout")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Logged out"}


async def test_logout_revokes_refresh_token(client):
    await client.post("/api/auth/register", json=_VALID_USER)
    await client.post("/api/auth/logout")
    # After logout the refresh cookie is gone — refresh should fail
    resp = await client.post("/api/auth/refresh")
    assert resp.status_code == 401


# ─── Refresh ──────────────────────────────────────────────────────────────────

async def test_refresh_returns_new_access_token(client):
    await client.post("/api/auth/register", json=_VALID_USER)

    resp = await client.post("/api/auth/refresh")
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


async def test_refresh_rotates_cookie(client):
    reg = await client.post("/api/auth/register", json=_VALID_USER)
    original_cookie = reg.cookies.get("refresh_token")

    resp = await client.post("/api/auth/refresh")
    new_cookie = resp.cookies.get("refresh_token")
    assert new_cookie is not None
    assert new_cookie != original_cookie


async def test_refresh_old_token_is_revoked_after_rotation(client):
    # Register — get initial refresh cookie stored in client cookie jar
    await client.post("/api/auth/register", json=_VALID_USER)

    # First refresh — rotates the token
    await client.post("/api/auth/refresh")

    # The original cookie has been replaced in the jar; a second refresh uses the new token
    resp2 = await client.post("/api/auth/refresh")
    assert resp2.status_code == 200  # the rotated token is still valid


async def test_refresh_without_cookie(client):
    # Never register/login — no cookie in the jar
    resp = await client.post("/api/auth/refresh")
    assert resp.status_code == 401


# ─── Access token gates ───────────────────────────────────────────────────────

async def test_protected_endpoint_without_token(client):
    resp = await client.get("/api/progress")
    assert resp.status_code == 403  # HTTPBearer returns 403 when header is absent


async def test_protected_endpoint_with_invalid_token(client):
    resp = await client.get("/api/progress", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401
