from fastapi import APIRouter, HTTPException, Query
from memory import get_style_dna

router = APIRouter(prefix="/api", tags=["dna"])

@router.get("/dna")
async def dna(user_id: str = Query(..., description="The user's ID to fetch cross-project DNA")):
    """
    Returns the user's Style DNA — cross-project memory traversal via Cognee graph.
    Called by the StyleDNA page on mount.
    """
    try:
        result = await get_style_dna(user_id)
        return {"dna": result}  # { "dna": "Consistent use of dark palettes..." }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
