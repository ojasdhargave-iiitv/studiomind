from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from memory import save_user_preference, fetch_user_preferences

router = APIRouter(prefix="/api", tags=["preferences"])

class PreferenceRequest(BaseModel):
    user_id: str
    key: str
    value: str
    category: str = "general"
    source: str = "popup"

@router.post("/preferences")
async def save_preference(body: PreferenceRequest):
    try:
        await save_user_preference(body.user_id, {
            "key": body.key,
            "value": body.value,
            "category": body.category,
            "source": body.source
        })
        return {"status": "ok", "message": f"Preference '{body.key}={body.value}' saved to your permanent memory."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preferences")
async def get_preferences(user_id: str = Query(..., description="User ID to fetch preferences for")):
    try:
        prefs = await fetch_user_preferences(user_id)
        return {"preferences": prefs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
