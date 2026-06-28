import cognee
import os

def is_valid_key(key: str) -> bool:
    return bool(key and not key.startswith("PLACEHOLDER") and key.strip() != "")

async def init_cognee():
    """Call this once at app startup. Configures Cognee with API keys and providers."""
    openai_key = os.getenv("OPENAI_API_KEY")
    glm_key = os.getenv("GLM_API_KEY") or os.getenv("ZHIPUAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    if is_valid_key(glm_key):
        # Configure Cognee for GLM AI (Zhipu) using its OpenAI-compatible interface
        cognee.config.set_llm_provider("openai")
        cognee.config.set_llm_endpoint("https://open.bigmodel.cn/api/paas/v4/")
        cognee.config.set_llm_api_key(glm_key)
        cognee.config.set_llm_model(os.getenv("GLM_MODEL", "glm-4-flash"))
        
        cognee.config.set_embedding_provider("openai")
        cognee.config.set_embedding_endpoint("https://open.bigmodel.cn/api/paas/v4/")
        cognee.config.set_embedding_api_key(glm_key)
        cognee.config.set_embedding_model(os.getenv("GLM_EMBEDDING_MODEL", "embedding-2"))
        print("Cognee configured for GLM AI (Zhipu).")
        
    elif is_valid_key(openai_key):
        # Configure Cognee for OpenAI (ChatGPT)
        cognee.config.set_llm_provider("openai")
        cognee.config.set_llm_model(os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
        cognee.config.set_llm_api_key(openai_key)
        if os.getenv("OPENAI_API_BASE"):
            cognee.config.set_llm_endpoint(os.getenv("OPENAI_API_BASE"))
            
        cognee.config.set_embedding_provider("openai")
        cognee.config.set_embedding_model(os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"))
        cognee.config.set_embedding_api_key(openai_key)
        if os.getenv("OPENAI_API_BASE"):
            cognee.config.set_embedding_endpoint(os.getenv("OPENAI_API_BASE"))
        print("Cognee configured for OpenAI.")
        
    elif is_valid_key(anthropic_key):
        # Configure Cognee for Anthropic
        cognee.config.set_llm_provider("anthropic")
        cognee.config.set_llm_model("claude-3-5-sonnet-20241022")
        cognee.config.set_llm_api_key(anthropic_key)
        print("Cognee configured for Anthropic.")

async def save_memory(text: str, project_id: str) -> None:
    """
    Stores text into the project-scoped memory namespace.
    dataset_name ensures memories from different projects don't bleed into each other.
    Call this AFTER every LLM response to remember the exchange.
    """
    await cognee.remember(text, dataset_name=f"project_{project_id}")

async def fetch_memory(query: str, project_id: str) -> str:
    """
    Retrieves semantically relevant memory for a query.
    Returns a string (may be empty if nothing relevant found).
    Call this BEFORE every LLM call.
    """
    results = await cognee.recall(
        query=query,
        dataset_name=f"project_{project_id}"
    )
    if not results:
        return ""
    return "\n".join([str(r) for r in results])

async def ingest_url(url: str, project_id: str) -> None:
    """
    Ingests a URL (Dribbble, Behance, Pinterest, etc.) into project memory.
    Cognee fetches and parses the page content automatically.
    """
    await cognee.remember(url, dataset_name=f"project_{project_id}")

async def improve_memory(feedback: str, project_id: str) -> None:
    """
    Called when user clicks 👍 or 👎 on an assistant message.
    feedback string format: "thumbsup: <the message content>" or "thumbsdown: <the message content>"
    """
    await cognee.improve(feedback, dataset_name=f"project_{project_id}")

async def get_style_dna(user_id: str) -> str:
    """
    Cross-project recall — traverses ALL of a user's projects via graph search.
    Used for the Style DNA page.
    dataset_name uses user_id (not project_id) to span all projects.
    """
    results = await cognee.recall(
        query="What are the consistent design patterns, color preferences, typography choices, and aesthetic tendencies across all projects?",
        dataset_name=f"user_{user_id}"
    )
    if not results:
        return ""
    return "\n".join([str(r) for r in results])

async def delete_project_memory(project_id: str) -> None:
    """
    Permanently removes all memory for a project.
    Called when user deletes a project from the dashboard.
    """
    await cognee.forget(dataset_name=f"project_{project_id}")
