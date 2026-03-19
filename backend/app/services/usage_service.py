# log tokens, calculate cost

from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from app.models.usage_log import UsageLog
from uuid import UUID

# Pricing per 1000 tokens (update these as providers change pricing)
MODEL_PRICING = {
    "gemini-2.5-flash":         {"input": 0.00015, "output": 0.0006},
    "llama-3.3-70b-versatile":  {"input": 0.00006, "output": 0.00008},
}

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    pricing = MODEL_PRICING.get(model, {"input": 0.001, "output": 0.002})
    cost = (input_tokens / 1000 * pricing["input"]) + (output_tokens / 1000 * pricing["output"])
    return round(cost, 6)

def log_usage(
        db: Session,
        universal_key_id: UUID,
        user_id: UUID,
        model: str,
        provider: str,
        input_tokens: int,
        output_tokens: int,
        status: str = "success"
) -> UsageLog:
    cost = calculate_cost(model, input_tokens, output_tokens)

    log = UsageLog(
        universal_key_id=universal_key_id,
        user_id=user_id,
        model=model,
        provider=provider,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost=cost,
        status=status
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_usage_by_user(db: Session, user_id: UUID) -> list[UsageLog]:
    return db.query(UsageLog).filter(
        UsageLog.user_id == user_id
    ).order_by(UsageLog.created_at.desc()).limit(100).all()

def get_monthly_summary(db: Session, user_id: UUID) -> dict:
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    results = db.query(
        UsageLog.model.label("model"),          # label this too
        func.sum(UsageLog.input_tokens).label("total_input"),
        func.sum(UsageLog.output_tokens).label("total_output"),
        func.sum(UsageLog.cost).label("total_cost"),
        func.count(UsageLog.id).label("total_calls")
    ).filter(
        UsageLog.user_id == user_id,
        extract("month", UsageLog.created_at) == current_month,
        extract("year", UsageLog.created_at) == current_year
    ).group_by(UsageLog.model).all()

    by_model = []
    total = 0.0

    for r in results:
        cost = float(r.total_cost or 0)
        total += cost
        by_model.append({
            "model": r.model,
            "total_input_tokens": r.total_input or 0,
            "total_output_tokens": r.total_output or 0,
            "total_cost_usd": round(cost, 4),
            "total_calls": r.total_calls or 0
        })

    return {
        "month": current_month,
        "year": current_year,
        "by_model": by_model,
        "total_cost_usd": round(total, 4)
    }