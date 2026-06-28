import os
from langchain_core.messages import HumanMessage, SystemMessage
from memory import fetch_memory, save_memory

def get_llm():
    """
    Returns the appropriate LangChain Chat Model based on available environment keys.
    Priority: OpenAI-compatible (Groq, Ollama, etc.) > Gemini > GLM > Anthropic
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    glm_key = os.getenv("GLM_API_KEY") or os.getenv("ZHIPUAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_API_KEY")

    def is_valid(key):
        return bool(key and not key.startswith("PLACEHOLDER") and key.strip() != "")

    # OpenAI/Groq/Ollama first (most common free option)
    if is_valid(openai_key):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            openai_api_key=openai_key,
            openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
            temperature=0.7
        )
    elif is_valid(gemini_key):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="models/gemini-2.5-flash",
            openai_api_key=gemini_key,
            openai_api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
            temperature=0.7
        )
    elif is_valid(glm_key):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("GLM_MODEL", "glm-4.5-air"),
            openai_api_key=glm_key,
            openai_api_base="https://open.bigmodel.cn/api/paas/v4/",
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
        raise RuntimeError("No valid LLM API key found. Set OPENAI_API_KEY, Gemini_API_KEY, GLM_API_KEY, or ANTHROPIC_API_KEY in .env")

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
    # We query for semantic relevance to the last message, and also fetch general styling preferences
    recalled_semantic = await fetch_memory(user_message, project_id)
    recalled_general = await fetch_memory("What are the project's styling, layout, typography, and theme preferences?", project_id)
    
    # Merge recalled memories and filter duplicates to build a cohesive memory section
    recalled_lines = []
    for source in [recalled_general, recalled_semantic]:
        if source:
            for line in source.split("\n"):
                line_stripped = line.strip()
                if line_stripped and line_stripped not in recalled_lines:
                    recalled_lines.append(line_stripped)
                    
    recalled_combined = "\n".join(recalled_lines)
    
    # Step 2: BUILD SYSTEM PROMPT — inject memory into context
    memory_section = recalled_combined if recalled_combined else "No previous memory for this project yet."
    
    system_prompt = f"""You are StudioMind, a creative AI design partner with persistent memory.

WHAT YOU REMEMBER ABOUT THIS PROJECT (DESIGN PREFERENCES & GUIDELINES):
{memory_section}

RULES & CONSTRAINTS:
- CRITICAL: Pay extreme attention to the style choices, Obsidian mode background hex codes (#09090b), margins, card sizes, and typography scales if they are in the project memory above. Incorporate them directly and explicitly in your answers when advising on layout, theme, or spacing.
- Use the memory above to give highly personalized, context-aware design advice.
- Never ask the user for information that is already in your memory.
- If the user's question relates to something in memory, reference it explicitly ("I remember you preferred dark palettes...").
- If memory is empty, ask great discovery questions to start building it.
- Provide detailed, specific, and actionable design advice. Avoid vague suggestions or generic advice.
- Be creative and opinionated. You are a senior design director, not a generalist assistant, so give concrete specs, hex codes, or dimensions when appropriate.
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
      "recalled_memory": recalled_combined
    }
