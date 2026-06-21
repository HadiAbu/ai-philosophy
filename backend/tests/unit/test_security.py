from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_password,
    hash_token,
    verify_password,
)


def test_hash_and_verify_password():
    hashed = hash_password("Password123")
    assert verify_password("Password123", hashed)


def test_verify_wrong_password():
    hashed = hash_password("Password123")
    assert not verify_password("WrongPassword1", hashed)


def test_verify_invalid_hash_does_not_raise():
    assert not verify_password("Password123", "not-a-bcrypt-hash")


def test_create_and_decode_access_token():
    token = create_access_token("user-abc-123")
    assert decode_access_token(token) == "user-abc-123"


def test_decode_expired_token():
    expire = datetime.now(timezone.utc) - timedelta(seconds=1)
    payload = {"sub": "user-123", "exp": expire, "type": "access"}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    assert decode_access_token(token) is None


def test_decode_token_wrong_type():
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {"sub": "user-123", "exp": expire, "type": "refresh"}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    assert decode_access_token(token) is None


def test_decode_garbage_string():
    assert decode_access_token("not.a.jwt.at.all") is None


def test_decode_token_wrong_secret():
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {"sub": "user-123", "exp": expire, "type": "access"}
    token = jwt.encode(payload, "wrong-secret", algorithm=settings.jwt_algorithm)
    assert decode_access_token(token) is None


def test_create_refresh_token_format():
    raw, hashed = create_refresh_token()
    assert isinstance(raw, str) and len(raw) > 0
    assert len(hashed) == 64  # SHA-256 hex digest is always 64 chars
    assert raw != hashed


def test_create_refresh_token_unique():
    raw1, _ = create_refresh_token()
    raw2, _ = create_refresh_token()
    assert raw1 != raw2


def test_hash_token_matches_refresh_token_hash():
    raw, hashed = create_refresh_token()
    assert hash_token(raw) == hashed


def test_hash_token_deterministic():
    assert hash_token("same-input") == hash_token("same-input")
