# StudioMind

AI design partner with persistent memory. Uses Cognee for knowledge graphs, FastAPI backend, React frontend.

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables

Copy the env template and fill in your keys:

```bash
cp .env.example .env
```

**Required — pick ONE free provider:**

| Variable | Description | Get it at |
|---|---|---|
| `OPENAI_API_KEY` | Groq / OpenAI / Ollama key | https://console.groq.com/keys (free) |
| `OPENAI_API_BASE` | API base URL | `https://api.groq.com/openai/v1` |
| `OPENAI_MODEL` | Model name | `llama-3.1-8b-instant` (or any Groq model) |

**Alternatives (uncomment and set one of these instead):**

| Variable | Description |
|---|---|
| `Gemini_API_KEY` | Google Gemini (free) — https://aistudio.google.com/apikey |
| `GLM_API_KEY` | Zhipu GLM |
| `ANTHROPIC_API_KEY` | Anthropic Claude |

**Cognee (already configured for local use):**

| Variable | Value |
|---|---|
| `COGNEE_ENV` | `local` |
| `ENABLE_BACKEND_ACCESS_CONTROL` | `false` |
| `CACHING` | `false` |

### 3. Run

```bash
# Terminal 1 — backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/chat` | Send a chat message |
| POST | `/api/feedback` | Thumbs up/down feedback |
| POST | `/api/ingest` | Ingest a URL into memory |
| GET | `/api/dna` | Get cross-project Style DNA |
| GET | `/api/memory/graph` | Get Cognee provenance graph (nodes + edges) |
| GET | `/api/memory/visualize` | HTML graph visualization |
| POST | `/api/preferences` | Save a design preference to permanent memory |
| GET | `/api/preferences` | Fetch all saved preferences |

## How It Works

1. User chats → agent recalls project memory + user preferences from Cognee
2. LLM responds with design advice
3. Exchange saved to Cognee graph
4. When the agent detects a design decision, a popup asks to confirm it as a permanent preference
5. Confirmed preferences persist across all projects via Cognee's user-scoped memory


# ── Database ──
mongodb=

# ── Cognee settings ──
COGNEE_ENV=local
ENABLE_BACKEND_ACCESS_CONTROL=false
CACHING=false

# Use Groq instead (OpenAI-compatible)
OPENAI_API_KEY=
OPENAI_API_BASE=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.1-8b-instant

# To swap models, just change OPENAI_MODEL (e.g. llama-3.3-70b-versatile, qwen/qwen3-32b)