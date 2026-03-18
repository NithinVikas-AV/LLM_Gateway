# /usage, cost tracking

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services import usage_service

router = APIRouter(prefix="/usage", tags=["usage"])

@router.get("/logs")
def get_my_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return usage_service.get_usage_by_user(db, current_user.id)

@router.get("/summary")
def get_montly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return usage_service.get_monthly_summary(db, current_user.id)