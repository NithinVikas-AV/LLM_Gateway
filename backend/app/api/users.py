from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.usage_log import UsageLog
from sqlalchemy import func

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "picture": u.picture,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": f"{user.email} deactivated"}


@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": f"{user.email} activated"}


@router.get("/usage")
def all_usage_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    results = db.query(
        UsageLog.user_id,
        func.sum(UsageLog.cost).label("total_cost"),
        func.count(UsageLog.id).label("total_calls"),
        func.sum(UsageLog.input_tokens + UsageLog.output_tokens).label("total_tokens")
    ).group_by(UsageLog.user_id).all()

    return [
        {
            "user_id": str(r.user_id),
            "total_cost_usd": round(r.total_cost or 0, 4),
            "total_calls": r.total_calls,
            "total_tokens": r.total_tokens,
        }
        for r in results
    ]