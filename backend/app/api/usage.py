# /usage, cost tracking

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services import usage_service
from app.core.dependencies import require_admin
from app.models.user import User as UserModel

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

@router.get("/admin/all")
def get_all_usage(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    from app.models.usage_log import UsageLog
    from app.models.user import User
    logs = db.query(UsageLog).order_by(UsageLog.created_at.desc()).limit(200).all()
    return [
        {
            "user_id": str(l.user_id),
            "model": l.model,
            "provider": l.provider,
            "input_tokens": l.input_tokens,
            "output_tokens": l.output_tokens,
            "cost_usd": l.cost,
            "status": l.status,
            "created_at": l.created_at
        }
        for l in logs
    ]

@router.get("/admin/summary")
def get_all_users_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    from app.models.usage_log import UsageLog
    from sqlalchemy import func
    
    results = db.query(
        UsageLog.user_id,
        func.sum(UsageLog.cost).label("total_cost"),
        func.sum(UsageLog.input_tokens).label("total_input"),
        func.sum(UsageLog.output_tokens).label("total_output"),
        func.sum(UsageLog.id).label("total_calls")
    ).group_by(UsageLog.user_id).all()

    return [
        {
            "user_id": str(r.user_id),
            "total_cost_usd": round(r.total_cost, 4),
            "total_input_tokens": r.total_input,
            "total_output_tokens": r.total_output,
            "total_calls": r.total_calls,
        }
        for r in results
    ]