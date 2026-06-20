from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.db.client import get_client

router = APIRouter()

_VALID_NODES = {
    "what-is-ai", "types-of-ml", "neural-networks", "activations",
    "transformers", "attention", "tokenization", "rag", "embeddings", "retrieval",
}


@router.get("")
async def get_progress(user_id: str = Depends(get_current_user)) -> JSONResponse:
    client = await get_client()
    result = await client.execute(
        "SELECT node_id FROM progress WHERE user_id = ?", [user_id]
    )
    return JSONResponse({"completed": [row["node_id"] for row in result.rows]})


@router.post("/{node_id}")
async def mark_complete(
    node_id: str,
    user_id: str = Depends(get_current_user),
) -> JSONResponse:
    if node_id not in _VALID_NODES:
        raise HTTPException(status_code=404, detail="Unknown node")

    client = await get_client()
    now = datetime.now(timezone.utc).isoformat()
    await client.execute(
        "INSERT OR IGNORE INTO progress (user_id, node_id, completed_at) VALUES (?, ?, ?)",
        [user_id, node_id, now],
    )
    return JSONResponse({"node_id": node_id, "completed": True})


@router.delete("/{node_id}")
async def mark_incomplete(
    node_id: str,
    user_id: str = Depends(get_current_user),
) -> JSONResponse:
    if node_id not in _VALID_NODES:
        raise HTTPException(status_code=404, detail="Unknown node")

    client = await get_client()
    await client.execute(
        "DELETE FROM progress WHERE user_id = ? AND node_id = ?",
        [user_id, node_id],
    )
    return JSONResponse({"node_id": node_id, "completed": False})
