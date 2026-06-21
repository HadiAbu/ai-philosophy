from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.db.client import db_execute

router = APIRouter()


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)) -> JSONResponse:
    result = await db_execute(
        "SELECT id, email, created_at FROM users WHERE id = ?",
        [user_id],
    )
    if not result.rows:
        raise HTTPException(status_code=404, detail="User not found")
    row = result.rows[0]
    return JSONResponse({
        "id": row["id"],
        "email": row["email"],
        "created_at": row["created_at"],
    })
