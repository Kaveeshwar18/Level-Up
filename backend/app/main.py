from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import db_helper
from app.routers import auth, habits, goals, expenses, journal, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await db_helper.connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await db_helper.close_mongo_connection()

app = FastAPI(
    title="LifeTracker AI API",
    description="Backend API for LifeTracker AI personal productivity platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"  # Allow all during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(goals.router)
app.include_router(expenses.router)
app.include_router(journal.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to LifeTracker AI API",
        "status": "healthy"
    }
