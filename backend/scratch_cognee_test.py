import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from memory import init_cognee, save_memory, fetch_memory

async def test():
    await init_cognee()
    project_id = "test_proj_123"
    
    print("Saving test memory...")
    await save_memory("Style Choice Obsidian Mode (#09090b) Typography Outfit Title + Inter Body Layout specs 48px margins, 12px cards Inspiration Dribbble reference shot", project_id)
    
    print("Recalling memory...")
    recalled_semantic = await fetch_memory("What did we say about Obsidian Mode and style choice?", project_id)
    print("Recalled Semantic:", repr(recalled_semantic))
    
    recalled_general = await fetch_memory("What are the project's styling, layout, typography, and theme preferences?", project_id)
    print("Recalled General:", repr(recalled_general))

if __name__ == "__main__":
    asyncio.run(test())
