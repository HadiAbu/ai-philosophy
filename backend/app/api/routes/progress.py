from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.api.deps import get_user_id
from app.db.client import db_execute

router = APIRouter()

_VALID_NODES = {
    "what-is-ai", "types-of-ml", "neural-networks", "activations",
    "transformers", "attention", "tokenization", "fine-tuning", "rag", "embeddings", "retrieval",
    "prompt-engineering", "hallucinations", "use-cases",
}


@router.get("")
async def get_progress(user_id: str = Depends(get_user_id)) -> JSONResponse:
    result = await db_execute(
        "SELECT node_id FROM progress WHERE user_id = ?", [user_id]
    )
    return JSONResponse({"completed": [row["node_id"] for row in result.rows]})


@router.post("/{node_id}")
async def mark_complete(
    node_id: str,
    user_id: str = Depends(get_user_id),
) -> JSONResponse:
    if node_id not in _VALID_NODES:
        raise HTTPException(status_code=404, detail="Unknown node")

    now = datetime.now(timezone.utc).isoformat()
    await db_execute(
        "INSERT OR IGNORE INTO progress (user_id, node_id, completed_at) VALUES (?, ?, ?)",
        [user_id, node_id, now],
    )
    return JSONResponse({"node_id": node_id, "completed": True})


@router.delete("/{node_id}")
async def mark_incomplete(
    node_id: str,
    user_id: str = Depends(get_user_id),
) -> JSONResponse:
    if node_id not in _VALID_NODES:
        raise HTTPException(status_code=404, detail="Unknown node")

    await db_execute(
        "DELETE FROM progress WHERE user_id = ? AND node_id = ?",
        [user_id, node_id],
    )
    return JSONResponse({"node_id": node_id, "completed": False})
