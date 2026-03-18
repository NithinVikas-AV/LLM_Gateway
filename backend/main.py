from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import auth
from app.core.config import settings

app = FastAPI(title="LLM Gateway", version="1.0.0")

# Session middleware - required for Oauth redirect flow
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS - allow React Frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"status": "LLM Gateway running"}