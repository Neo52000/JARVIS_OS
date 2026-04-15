"""Jarvis Business OS — Main API Server."""
import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from core.orchestrator import orchestrator
from core.memory import chroma_store as memory
from api.routes import pod, local_business, voice, clients, scheduler as sched_routes, delivery
from core import scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOGS_DIR / "jarvis.log"),
    ],
)
log = logging.getLogger("jarvis")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("=== Jarvis Business OS starting ===")
    log.info(f"LLM: {'Ollama (local)' if settings.USE_LOCAL_LLM else 'Mistral API'}")
    log.info(f"Mistral key: {'configured' if settings.MISTRAL_API_KEY else 'MISSING'}")
    scheduler.start()
    log.info("Scheduler started")
    yield
    scheduler.stop()
    log.info("=== Jarvis Business OS shutting down ===")


app = FastAPI(
    title="Jarvis Business OS",
    description="AI-powered business execution system with multi-agent orchestration",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pod.router)
app.include_router(local_business.router)
app.include_router(voice.router)
app.include_router(clients.router)
app.include_router(sched_routes.router)
app.include_router(delivery.router)

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")


class ChatRequest(BaseModel):
    message: str
    agent: str | None = None
    context: str = ""


class MemoryRequest(BaseModel):
    text: str
    metadata: dict | None = None


@app.get("/")
async def root():
    index = frontend_dir / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"message": "Jarvis Business OS is running", "docs": "/docs"}


@app.get("/landing")
async def landing():
    landing_file = frontend_dir / "landing.html"
    if landing_file.exists():
        return FileResponse(str(landing_file))
    return {"message": "Landing page not found"}


@app.post("/chat")
async def chat(req: ChatRequest):
    result = await orchestrator.route(req.message, agent_name=req.agent, context=req.context)
    return {
        "status": "ok",
        "agent": result.agent,
        "response": result.output,
        "success": result.success,
    }


@app.get("/agents")
async def list_agents():
    return {"agents": orchestrator.list_agents()}


@app.get("/logs")
async def get_logs(limit: int = 20):
    return {"logs": orchestrator.get_log(limit)}


@app.post("/memory/store")
async def store_memory(req: MemoryRequest):
    doc_id = memory.store(req.text, req.metadata)
    return {"status": "ok", "id": doc_id}


@app.get("/memory/search")
async def search_memory(q: str, limit: int = 5):
    results = memory.search(q, n_results=limit)
    return {"status": "ok", "results": results}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "llm": "local" if settings.USE_LOCAL_LLM else "mistral",
        "api_key_set": bool(settings.MISTRAL_API_KEY),
        "agents": len(orchestrator.list_agents()),
    }
