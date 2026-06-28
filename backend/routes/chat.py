from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent import run_agent
from memory import improve_memory

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    project_id: str   # e.g. "proj_abc123"

class FeedbackRequest(BaseModel):
    feedback: str     # "thumbsup: <message content>" or "thumbsdown: <message content>"
    project_id: str

@router.post("/chat")
async def chat(body: ChatRequest):
    """
    Main chat endpoint. Calls the LangChain agent which uses Cognee recall + LLM.
    Returns the reply and what was recalled from memory.
    """
    try:
        result = await run_agent(body.message, body.project_id)
        return result  # { "reply": "...", "recalled_memory": "..." }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def feedback(body: FeedbackRequest):
    """
    Called when user clicks 👍 or 👎. Calls cognee.improve() to refine memory.
    """
    try:
        await improve_memory(body.feedback, body.project_id)
        return {"status": "ok", "message": "Memory updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
