from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from memory import ingest_url

router = APIRouter(prefix="/api", tags=["ingest"])

class IngestRequest(BaseModel):
    url: str         # Full URL: "https://dribbble.com/shots/..."
    project_id: str

@router.post("/ingest")
async def ingest(body: IngestRequest):
    """
    Ingests a URL into project memory via cognee.remember(url).
    Frontend calls this from the Inspiration board when user pastes a reference URL.
    """
    try:
        await ingest_url(body.url, body.project_id)
        return {"status": "ok", "message": f"URL ingested into project {body.project_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
