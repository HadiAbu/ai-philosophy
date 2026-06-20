import libsql_client

from app.core.config import settings

_client: libsql_client.Client | None = None


async def get_client() -> libsql_client.Client:
    global _client
    if _client is None:
        # libsql-client uses WebSocket for libsql:// URLs (unreliable with Turso);
        # https:// forces the stable HTTP transport instead.
        http_url = settings.turso_url.replace("libsql://", "https://")
        _client = libsql_client.create_client(
            url=http_url,
            auth_token=settings.turso_auth_token,
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
