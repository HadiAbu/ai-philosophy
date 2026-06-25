import os

# Must be set before any app module is imported so Settings() can initialise.
os.environ.setdefault("TURSO_URL", "libsql://test.localhost")
os.environ.setdefault("TURSO_AUTH_TOKEN", "test-token")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-testing-that-is-long-enough")

import pytest_asyncio
import aiosqlite
from contextlib import ExitStack
from unittest.mock import AsyncMock, patch
from httpx import ASGITransport, AsyncClient

_SCHEMA = """\
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_id, node_id)
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0
);
"""


class _Result:
    """Minimal stand-in for libsql_client's ResultSet."""
    def __init__(self, rows):
        self.rows = rows


@pytest_asyncio.fixture
async def client():
    """
    Yields an httpx.AsyncClient wired to the FastAPI app with:
    - An in-memory SQLite DB replacing every db_execute call
    - Migrations and DB teardown mocked out
    """
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.executescript(_SCHEMA)
    await conn.commit()

    async def fake_execute(statement: str, args=None):
        async with conn.execute(statement, args or []) as cursor:
            rows = await cursor.fetchall()
        await conn.commit()
        return _Result(rows)

    stack = ExitStack()
    stack.enter_context(patch("app.db.client.db_execute", fake_execute))
    stack.enter_context(patch("app.api.routes.auth.db_execute", fake_execute))
    stack.enter_context(patch("app.api.routes.progress.db_execute", fake_execute))
    stack.enter_context(patch("app.api.routes.users.db_execute", fake_execute))
    stack.enter_context(patch("app.db.migrations.run_migrations", new=AsyncMock()))
    stack.enter_context(patch("app.db.client.close_client", new=AsyncMock()))

    try:
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac
    finally:
        stack.close()
        await conn.close()
