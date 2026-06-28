import httpx
import asyncio

async def main():
    try:
        async with httpx.AsyncClient() as client:
            print("Sending message to chat endpoint...")
            response = await client.post(
                "http://127.0.0.1:8000/api/chat",
                json={"message": "hello", "project_id": "proj_test123"},
                timeout=30.0
            )
            print("Status Code:", response.status_code)
            print("Response:", response.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
