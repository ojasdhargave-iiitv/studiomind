from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

# Set up paths so Python can find routes and memory
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from memory import init_cognee
from database import connect_db, close_db
from routes.chat import router as chat_router
from routes.ingest import router as ingest_router
from routes.dna import router as dna_router
from routes.graph import router as graph_router
from routes.preferences import router as preferences_router

app = FastAPI(title="StudioMind API", version="1.0.0")

# CORS — allow React dev server on port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    """Initialize Cognee + MongoDB on server start."""
    try:
        await init_cognee()
        print("Cognee engine initialized successfully.")
    except Exception as e:
        print(f"Error initializing Cognee: {e}. Cognee may fail to write nodes until keys are populated.")
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# Register all route groups
app.include_router(chat_router)
app.include_router(ingest_router)
app.include_router(dna_router)
app.include_router(graph_router)
app.include_router(preferences_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
