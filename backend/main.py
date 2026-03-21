from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import auth, keys, usage, gateway, users
from app.core.config import settings

app = FastAPI(title="LLM Gateway", version="1.0.0")

app.include_router(auth.router)
app.include_router(keys.router)
app.include_router(usage.router)
app.include_router(gateway.router)
app.include_router(users.router)

# Session middleware - required for Oauth redirect flow
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS - allow React Frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://llmgateway-production.up.railway.app",
        "https://llmgateway-production-e66c.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"status": "LLM Gateway running"}