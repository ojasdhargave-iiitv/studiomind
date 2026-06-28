import cognee
import os
from cognee.api.v1.visualize.memory_provenance import get_memory_provenance_graph, visualize_memory_provenance

def is_valid_key(key: str) -> bool:
    return bool(key and not key.startswith("PLACEHOLDER") and key.strip() != "")

async def init_cognee():
    """Call this once at app startup. Configures Cognee with API keys and providers."""
    # Bypass the connection check that can timeout or fail due to model naming checks
    os.environ["COGNEE_SKIP_CONNECTION_TEST"] = "true"
    
    openai_key = os.getenv("OPENAI_API_KEY")
    glm_key = os.getenv("GLM_API_KEY") or os.getenv("ZHIPUAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_API_KEY")

    # OpenAI/Groq/Ollama first (most common free option)
    if is_valid_key(openai_key):
        api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        cognee.config.set_llm_provider("openai")
        cognee.config.set_llm_model(os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
        cognee.config.set_llm_api_key(openai_key)
        cognee.config.set_llm_endpoint(api_base)
        if api_base == "https://api.openai.com/v1":
            cognee.config.set_embedding_provider("openai")
            cognee.config.set_embedding_model(os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"))
            cognee.config.set_embedding_api_key(openai_key)
            cognee.config.set_embedding_endpoint(api_base)
            print("Cognee configured for OpenAI (LLM + embeddings).")
        else:
            cognee.config.set_embedding_provider("local")
            cognee.config.set_embedding_model("sentence-transformers/all-MiniLM-L6-v2")
            print(f"Cognee configured for {api_base} (LLM) + local embeddings.")
    elif is_valid_key(gemini_key):
        os.environ["GEMINI_API_KEY"] = gemini_key
        cognee.config.set_llm_provider("gemini")
        cognee.config.set_llm_model("gemini/gemini-2.5-flash")
        cognee.config.set_llm_api_key(gemini_key)
        cognee.config.set_embedding_provider("gemini")
        cognee.config.set_embedding_model("gemini/gemini-embedding-2")
        cognee.config.set_embedding_api_key(gemini_key)
        print("Cognee configured for Google Gemini (native).")
    elif is_valid_key(glm_key):
        cognee.config.set_llm_provider("openai")
        cognee.config.set_llm_endpoint("https://open.bigmodel.cn/api/paas/v4/")
        cognee.config.set_llm_api_key(glm_key)
        glm_model = os.getenv("GLM_MODEL", "glm-4.5-air")
        if not glm_model.startswith("openai/"):
            glm_model = f"openai/{glm_model}"
        cognee.config.set_llm_model(glm_model)
        cognee.config.set_embedding_provider("openai")
        cognee.config.set_embedding_endpoint("https://open.bigmodel.cn/api/paas/v4/")
        cognee.config.set_embedding_api_key(glm_key)
        glm_embed = os.getenv("GLM_EMBEDDING_MODEL", "embedding-2")
        if not glm_embed.startswith("openai/"):
            glm_embed = f"openai/{glm_embed}"
        cognee.config.set_embedding_model(glm_embed)
        print("Cognee configured for GLM AI (Zhipu).")
        
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
    await cognee.remember(text, dataset_name=f"project_{project_id}", run_in_background=True)

async def fetch_memory(query: str, project_id: str) -> str:
    """
    Retrieves semantically relevant memory for a query.
    Returns a string (may be empty if nothing relevant found).
    Call this BEFORE every LLM call.
    """
    try:
        results = await cognee.recall(
            query_text=query,
            datasets=[f"project_{project_id}"]
        )
        if not results:
            return ""
        return "\n".join([str(r) for r in results])
    except Exception as e:
        return ""

async def ingest_url(url: str, project_id: str) -> None:
    """
    Ingests a URL (Dribbble, Behance, Pinterest, etc.) into project memory.
    Cognee fetches and parses the page content automatically.
    """
    await cognee.remember(url, dataset_name=f"project_{project_id}", run_in_background=True)

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
    try:
        results = await cognee.recall(
            query_text="What are the consistent design patterns, color preferences, typography choices, and aesthetic tendencies across all projects?",
            datasets=[f"user_{user_id}"]
        )
        if not results:
            return ""
        return "\n".join([str(r) for r in results])
    except Exception as e:
        return ""

async def delete_project_memory(project_id: str) -> None:
    """
    Permanently removes all memory for a project.
    Called when user deletes a project from the dashboard.
    """
    await cognee.forget(dataset_name=f"project_{project_id}")

async def get_memory_graph(project_id: str) -> dict:
    """
    Returns the knowledge graph (nodes + edges) for a project's memory.
    Uses cognee's memory provenance graph to extract analyzed keypoints.
    """
    try:
        nodes, edges = await get_memory_provenance_graph(
            include_memory=True,
            scope_user_ids=["default"]
        )
        return {
            "nodes": [
                {"id": n.id, "properties": n.properties} for n in nodes
            ],
            "edges": [
                {"source": e.source, "target": e.target, "relation": e.relation, "properties": e.properties}
                for e in edges
            ]
        }
    except Exception as e:
        return {"nodes": [], "edges": [], "error": str(e)}

async def get_memory_visualization(project_id: str, file_path: str = None) -> str:
    """
    Generates an HTML visualization of the memory provenance graph.
    Returns the path to the generated HTML file.
    """
    try:
        result = await visualize_memory_provenance(
            destination_file_path=file_path,
            include_memory=True,
            scope_user_ids=["default"]
        )
        return result
    except Exception as e:
        return f"Error: {e}"
