# /auth/google, /auth/callback

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from app.db.session import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

config = Config(environ={
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET,
})

oauth = OAuth(config)
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/google", operation_id="google_login")
async def login_with_google(request: Request):
    redirect_url = "http://localhost:8000/auth/callback"
    return await oauth.google.authorize_redirect(request, redirect_url)

@router.get("/callback", operation_id="google_callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        raise HTTPException(status_code=400, detail="Google auth failed")
    
    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not get user info")
    
    # Check if the user already exists
    user = db.query(User).filter(User.email == user_info["email"]).first()

    if not user:
        # First time login - create the user
        user = User(
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
            role="employee" # default role, admin upgrade manually
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT
    access_token = create_access_token({
        "sub": user.email,
        "role": user.role
    })

    # Redirect to frontend with token in URL
    return RedirectResponse(
        url=f"http://localhost:5173/auth/success?token={access_token}"
    )

@router.get("/me", operation_id="get_current_user_me")
async def get_me(db: Session = Depends(get_db)):
    pass # we'll wire this up with get_current_user next step