from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """JWT-only dependency — used by endpoints that always require a real account."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


async def get_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    x_anon_id: str | None = Header(default=None),
) -> str:
    """Feature-flagged dependency.

    REQUIRE_AUTH=true  → validates JWT Bearer token (existing behaviour).
    REQUIRE_AUTH=false → reads X-Anon-Id header (localStorage UUID from browser).
    """
    if not settings.require_auth:
        if not x_anon_id or len(x_anon_id) > 64:
            raise HTTPException(status_code=400, detail="X-Anon-Id header required")
        return x_anon_id

    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id
