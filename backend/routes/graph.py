from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from memory import get_memory_graph, get_memory_visualization

router = APIRouter(prefix="/api/memory", tags=["memory"])

@router.get("/graph")
async def memory_graph(project_id: str = Query(..., description="Project ID to fetch memory graph for")):
    """
    Returns the Cognee memory provenance graph (nodes + edges) for a project.
    This shows the analyzed keypoints extracted from chat history as a connected graph.
    """
    try:
        result = await get_memory_graph(project_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visualize")
async def memory_visualize(project_id: str = Query(..., description="Project ID to visualize memory graph for")):
    """
    Generates and returns an HTML visualization of the memory provenance graph.
    Returns the HTML content directly for embedding in an iframe.
    """
    try:
        result = await get_memory_visualization(project_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
