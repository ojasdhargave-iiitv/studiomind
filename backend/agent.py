import os
from langchain_core.messages import HumanMessage, SystemMessage
from memory import fetch_memory, save_memory

def get_llm():
    """
    Returns the appropriate LangChain Chat Model based on available environment keys.
    Supports GLM AI, OpenAI (ChatGPT), and Anthropic.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    glm_key = os.getenv("GLM_API_KEY") or os.getenv("ZHIPUAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    def is_valid(key):
        return bool(key and not key.startswith("PLACEHOLDER") and key.strip() != "")

    if is_valid(glm_key):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("GLM_MODEL", "glm-4-flash"),
            openai_api_key=glm_key,
            openai_api_base="https://open.bigmodel.cn/api/paas/v4/",
            temperature=0.7
        )
    elif is_valid(openai_key):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            openai_api_key=openai_key,
            openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
            temperature=0.7
        )
    elif is_valid(anthropic_key):
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            anthropic_api_key=anthropic_key,
            temperature=0.7,
            max_tokens=1024
        )
    else:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            anthropic_api_key="sk-ant-dummykeyplaceholder",
            temperature=0.7,
            max_tokens=1024
        )

async def run_agent(user_message: str, project_id: str) -> dict:
    """
    Main agent function. Called by the /chat route.
    
    Flow:
    1. Recall relevant memory from Cognee
    2. Build system prompt with injected memory
    3. Call Claude via LangChain
    4. Save the exchange back to memory
    5. Return reply + recalled_memory (for the frontend memory panel)
    
    Returns:
        {
            "reply": str,           # Claude's response
            "recalled_memory": str  # What Cognee fetched (shown in UI memory panel)
        }
    """
    
    # Step 1: RECALL — always do this before calling LLM
    recalled = await fetch_memory(user_message, project_id)
    
    # Step 2: BUILD SYSTEM PROMPT — inject memory into context
    memory_section = recalled if recalled else "No previous memory for this project yet."
    
    system_prompt = f"""You are StudioMind, a creative AI design partner with persistent memory.

WHAT YOU REMEMBER ABOUT THIS PROJECT:
{memory_section}

RULES:
- Use the memory above to give highly personalized, context-aware design advice.
- Never ask the user for information that is already in your memory.
- If the user's question relates to something in memory, reference it explicitly ("I remember you preferred dark palettes...").
- If memory is empty, ask great discovery questions to start building it.
- Be concise, creative, and opinionated. You are a senior designer, not a generalist assistant.
- Focus on design: typography, color, layout, spacing, hierarchy, motion, brand feel."""

    # Step 3: CALL LLM via LangChain
    llm = get_llm()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    response = llm.invoke(messages)
    reply = response.content
    
    # Step 4: REMEMBER this exchange (both sides)
    memory_entry = f"User asked: {user_message}\nAssistant responded: {reply}"
    await save_memory(memory_entry, project_id)
    
    # Step 5: RETURN — include recalled_memory so frontend can show it in MemoryPanel
    return {
      "reply": reply,
      "recalled_memory": recalled
    }
