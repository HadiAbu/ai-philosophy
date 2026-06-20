from app.db.client import get_client

_SCHEMA = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id           TEXT PRIMARY KEY,
        email        TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at   TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS progress (
        user_id      TEXT NOT NULL,
        node_id      TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        PRIMARY KEY (user_id, node_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_hash TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked    INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
]


async def run_migrations() -> None:
    client = await get_client()
    for statement in _SCHEMA:
        await client.execute(statement.strip())
