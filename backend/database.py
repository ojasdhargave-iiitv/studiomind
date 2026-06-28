import os
import asyncio

_client = None
_db = None
_fallback_store = {}  # { "proj_test": [{"role":"user","content":"..."}, ...] }
_connected = False

async def connect_db():
    global _client, _db, _connected
    mongo_url = os.getenv("mongodb")
    if not mongo_url:
        print("MongoDB URL not found. Using in-memory chat storage.")
        return
    # Retry MongoDB connection up to 3 times
    for attempt in range(3):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            _client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=8000)
            await _client.server_info()
            _db = _client.StudioMind
            _connected = True
            print("MongoDB connected successfully.")
            return
        except Exception as e:
            print(f"MongoDB connection attempt {attempt+1}/3 failed ({e}).")
            _client = None
            _db = None
            if attempt < 2:
                await asyncio.sleep(2)
    print("MongoDB connection failed after 3 attempts. Using in-memory chat storage (data will NOT persist across server restarts).")

async def close_db():
    global _client
    if _client:
        _client.close()

async def save_chat_message(project_id: str, user_id: str, role: str, content: str):
    if _connected:
        try:
            await _db.chat_history.insert_one({
                "project_id": project_id,
                "user_id": user_id,
                "role": role,
                "content": content,
            })
            return
        except Exception as e:
            print(f"MongoDB save failed ({e}). Falling back to in-memory storage.")
            pass
    # Fallback: in-memory
    key = f"{project_id}_{user_id}"
    if key not in _fallback_store:
        _fallback_store[key] = []
    _fallback_store[key].append({"role": role, "content": content})

async def get_chat_history(project_id: str, user_id: str = "user_demo_001"):
    if _connected:
        try:
            cursor = _db.chat_history.find(
                {"project_id": project_id, "user_id": user_id},
                sort=[("_id", 1)]
            ).limit(200)
            messages = []
            async for doc in cursor:
                messages.append({"role": doc["role"], "content": doc["content"]})
            return messages
        except Exception:
            pass
    # Fallback: in-memory
    key = f"{project_id}_{user_id}"
    return _fallback_store.get(key, [])

async def delete_chat_history(project_id: str, user_id: str = "user_demo_001"):
    if _connected:
        try:
            await _db.chat_history.delete_many({"project_id": project_id, "user_id": user_id})
            return
        except Exception:
            pass
    key = f"{project_id}_{user_id}"
    _fallback_store.pop(key, None)
