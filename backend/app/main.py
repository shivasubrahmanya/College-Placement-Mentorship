from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, mentors, mentees, posts, resources, chats, leaderboard, admin, upload
from app.routers import websocket_chat
from app.db import engine, Base
from app.config import settings
from app.utils.scheduler import start_scheduler, stop_scheduler
import atexit

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events"""
    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()
    atexit.register(stop_scheduler)


app = FastAPI(
    title=settings.APP_NAME,
    description="College Mentorship Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all localhost variants
# IMPORTANT: This must be added BEFORE routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://[::1]:5173",  # IPv6 localhost
        "http://[::1]:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",  # Allow any localhost port
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(mentors.router)
app.include_router(mentees.router)
app.include_router(posts.router)
app.include_router(resources.router)
app.include_router(chats.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(websocket_chat.router)


@app.get("/")
def root():
    return {"message": "College Mentorship Platform API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/test-cors")
def test_cors():
    """Test endpoint to verify CORS is working"""
    return {
        "message": "CORS test successful",
        "cors_enabled": True,
        "timestamp": "2024-01-01T00:00:00Z"
    }
