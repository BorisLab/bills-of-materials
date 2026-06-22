from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup tables on startup for MVP
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Bill of Materials API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import upload, quotes, components

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(upload.router, prefix="/api", tags=["bom"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(components.router, prefix="/api/components", tags=["components"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Bill of Materials API"}
