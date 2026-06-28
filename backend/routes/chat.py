from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from agent import run_agent
from memory import improve_memory
from database import save_chat_message, get_chat_history, delete_chat_history

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    project_id: str   # e.g. "proj_abc123"
    user_id: str = "user_demo_001"

class FeedbackRequest(BaseModel):
    feedback: str
    project_id: str

@router.post("/chat")
async def chat(body: ChatRequest):
    """
    Chat endpoint. Saves user message to DB, calls agent, saves reply to DB.
    Returns { reply, recalled_memory, suggested_preferences }.
    """
    try:
        await save_chat_message(body.project_id, body.user_id, "user", body.message)

        result = await run_agent(body.message, body.project_id, body.user_id)

        await save_chat_message(body.project_id, body.user_id, "assistant", result["reply"])

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history")
async def chat_history(
    project_id: str = Query(...),
    user_id: str = Query("user_demo_001")
):
    """Returns all chat messages for a project, sorted oldest-first."""
    try:
        messages = await get_chat_history(project_id, user_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/history")
async def clear_history(
    project_id: str = Query(...),
    user_id: str = Query("user_demo_001")
):
    """Deletes all chat history for a project."""
    try:
        await delete_chat_history(project_id, user_id)
        return {"status": "ok", "message": "Chat history cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def feedback(body: FeedbackRequest):
    try:
        await improve_memory(body.feedback, body.project_id)
        return {"status": "ok", "message": "Memory updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
