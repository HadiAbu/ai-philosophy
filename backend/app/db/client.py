import libsql_client

from app.core.config import settings

_client: libsql_client.Client | None = None


def _make_client() -> libsql_client.Client:
    # libsql-client uses WebSocket for libsql:// URLs (unreliable with Turso);
    # https:// forces the stable HTTP transport instead.
    http_url = settings.turso_url.replace("libsql://", "https://")
    return libsql_client.create_client(url=http_url, auth_token=settings.turso_auth_token)


async def get_client() -> libsql_client.Client:
    global _client
    if _client is None:
        _client = _make_client()
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        try:
            await _client.close()
        except Exception:
            pass
        _client = None


async def db_execute(statement: str, args: list | None = None):
    """Execute with one reconnect retry on transport failure."""
    global _client
    for attempt in range(2):
        if _client is None:
            _client = _make_client()
        try:
            return await _client.execute(statement, args or [])
        except Exception:
            if attempt == 0:
                await close_client()
            else:
                raise
