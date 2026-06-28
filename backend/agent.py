import os
import re
from langchain_core.messages import HumanMessage, SystemMessage
from memory import fetch_memory, save_memory, fetch_user_preferences

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

async def run_agent(user_message: str, project_id: str, user_id: str = "user_demo_001") -> dict:
    """
    Main agent function. Called by the /chat route.
    
    Flow:
     1. Recall relevant memory from Cognee (project + user scope)
     2. Build system prompt with injected memory
     3. Call LLM 
     4. Remember this exchange
     5. Detect preference keypoints from the chat
     6. Return reply + recalled_memory + suggested_preferences
    
    Returns:
        {
            "reply": str,
            "recalled_memory": str,
            "suggested_preferences": [{"question": "...", "options": ["...","..."], "key": "...", "category": "..."}]
        }
    """
    
    # Step 1: RECALL — project scope + user scope (cross-project preferences)
    recalled_semantic = await fetch_memory(user_message, project_id)
    recalled_general = await fetch_memory("What are the project's styling, layout, typography, and theme preferences?", project_id)
    user_prefs = await fetch_user_preferences(user_id)
    
    # Merge project memories
    recalled_lines = []
    for source in [recalled_general, recalled_semantic]:
        if source:
            for line in source.split("\n"):
                line_stripped = line.strip()
                if line_stripped and line_stripped not in recalled_lines:
                    recalled_lines.append(line_stripped)
    recalled_combined = "\n".join(recalled_lines)
    
    # Format user-level preferences
    user_prefs_text = "\n".join([f"- {p.get('key','')}: {p.get('value','')} ({p.get('category','')})" for p in user_prefs]) if user_prefs else "None yet"
    
    # Step 2: BUILD SYSTEM PROMPT — inject both project and user memory
    memory_section = recalled_combined if recalled_combined else "No previous memory for this project yet."
    
    system_prompt = f"""You are StudioMind, a creative AI design partner with persistent memory.

PROJECT MEMORY:
{memory_section}

YOUR PERMANENT MEMORY ABOUT THIS USER (ACROSS ALL PROJECTS):
{user_prefs_text}

RULES & CONSTRAINTS:
- Reference both project-specific and user-wide preferences when relevant.
- When the user makes a decision about a design style, color, typography, or layout — explicitly acknowledge it as a preference decision.
- At the END of your response, if you detected any new design preference decision, add a line in EXACTLY this format:
  ---PREFERENCE_DETECTED---
  key=<short_key> | value=<the_choice> | category=<color|typography|layout|aesthetic|brand> | question=<MCQ question to confirm> | options=<option1>|<option2>|<option3>
  ---END_PREFERENCE---
  Only add this if the user clearly made a choice. One line per preference detected.
- If no clear decision was made, do NOT add the preference block.
- Use memory above for personalized advice. Never ask for info already in memory.
- Be specific, opinionated. Give hex codes, dimensions, font names.""" 

    # Step 3: CALL LLM
    llm = get_llm()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    response = llm.invoke(messages)
    full_reply = response.content
    
    # Step 4: PARSE preference suggestions from the response
    suggested_preferences = []
    pref_block_pattern = r"---PREFERENCE_DETECTED---\n(.+?)\n---END_PREFERENCE---"
    pref_block_match = re.search(pref_block_pattern, full_reply, re.DOTALL)
    
    if pref_block_match:
        pref_text = pref_block_match.group(1).strip()
        # Parse the preference line
        pref_parts = pref_text.split(" | ")
        pref_data = {}
        for part in pref_parts:
            if "=" in part:
                k, v = part.split("=", 1)
                pref_data[k.strip()] = v.strip()
        if pref_data.get("key") and pref_data.get("value"):
            suggested_preferences.append({
                "key": pref_data["key"],
                "value": pref_data["value"],
                "category": pref_data.get("category", "general"),
                "question": pref_data.get("question", f"Save this {pref_data.get('category', 'design')} preference?"),
                "options": pref_data.get("options", "Yes|Not now").split("|")
            })
        # Remove the preference block from the visible reply
        reply = full_reply[:pref_block_match.start()].strip()
    else:
        reply = full_reply
    
    # Step 5: REMEMBER this exchange
    memory_entry = f"User asked: {user_message}\nAssistant responded: {reply}"
    await save_memory(memory_entry, project_id)
    
    # Step 6: RETURN
    return {
      "reply": reply,
      "recalled_memory": recalled_combined,
      "suggested_preferences": suggested_preferences
    }
