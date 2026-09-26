from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from .schemas import HealthResponse
from .routers import chat, diet, gym

app = FastAPI(
    title="AI Fitness Hub API",
    description="Unified High-Performance API for Virtual Gym Buddy, AI Dietician, and Gym Recommender.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS to accept requests from local Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register module routers under /api prefix
app.include_router(chat.router, prefix="/api")
app.include_router(diet.router, prefix="/api")
app.include_router(gym.router, prefix="/api")

@app.get("/", tags=["General"])
async def root():
    return {
        "app": "AI Fitness Hub Engine",
        "status": "online",
        "docs": "/docs",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
