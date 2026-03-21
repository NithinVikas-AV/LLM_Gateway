# check/increment Redis counters

# Notice the three different types of limits and how they each work differently. 
# RPM uses Redis with a 60-second TTL — fast, in-memory, resets automatically. 
# Daily tokens also uses Redis with a 24-hour TTL. 
# Monthly cost queries the usage_logs table directly because that data needs to be permanent and accurate — Redis is too volatile for billing data.

from redis import Redis
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.key_permission import KeyPermission
from app.models.usage_log import UsageLog
from app.core.redis_client import get_redis

def _rpm_key(universal_key_id: str) -> str:
    return f"ratelimit:{universal_key_id}:rpm"

def _daily_tokens_key(universal_key_id: str, model: str) -> str:
    return f"ratelimit:{universal_key_id}:{model}:daily_tokens"

def check_and_increment_rpm(universal_key_id: str, model: str, db: Session):
    r: Redis = get_redis()

    permission = db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id,
        KeyPermission.model == model
    ).first()

    # None = unlimited — skip check entirely
    if permission and permission.rpm_limit is None:
        key = _rpm_key(str(universal_key_id))
        pipe = r.pipeline()
        pipe.incr(key)
        pipe.expire(key, 60)
        pipe.execute()
        return

    rpm_limit = permission.rpm_limit if permission else 60
    key = _rpm_key(str(universal_key_id))
    current = r.get(key)
    current_count = int(current) if current else 0

    if current_count >= rpm_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {rpm_limit} requests/minute for model {model}"
        )

    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    pipe.execute()


def check_daily_token_limit(universal_key_id: str, model: str, db: Session):
    r: Redis = get_redis()

    permission = db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id,
        KeyPermission.model == model
    ).first()

    # None = unlimited — skip check
    if permission and permission.daily_token_limit is None:
        return

    daily_limit = permission.daily_token_limit if permission else 100000
    key = _daily_tokens_key(str(universal_key_id), model)
    current = r.get(key)
    current_tokens = int(current) if current else 0

    if current_tokens >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily token limit of {daily_limit} exceeded for model {model}"
        )


def check_monthly_cost_limit(universal_key_id: str, model: str, db: Session):
    permission = db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id,
        KeyPermission.model == model
    ).first()

    # None = unlimited — skip check
    if not permission or permission.monthly_cost_limit is None:
        return

    from sqlalchemy import func, extract
    from datetime import datetime

    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    monthly_cost = db.query(func.sum(UsageLog.cost)).filter(
        UsageLog.universal_key_id == universal_key_id,
        UsageLog.model == model,
        extract("month", UsageLog.created_at) == current_month,
        extract("year", UsageLog.created_at) == current_year
    ).scalar() or 0.0

    if monthly_cost >= permission.monthly_cost_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly cost limit of ${permission.monthly_cost_limit} exceeded"
        )
    
def increment_token_usage(universal_key_id: str, model: str, tokens_used: int):
    r: Redis = get_redis()
    key = _daily_tokens_key(str(universal_key_id), model)

    pipe = r.pipeline()
    pipe.incrby(key, tokens_used)
    pipe.expire(key, 86400) # 24 hours TTL
    pipe.execute()

def check_monthly_cost_limit(universal_key_id: str, model: str, db: Session):
    permission = db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id,
        KeyPermission.model == model
    ).first()

    # No permission or unlimited — skip
    if not permission or permission.monthly_cost_limit is None:
        return

    from sqlalchemy import func, extract
    from datetime import datetime
    from app.models.usage_log import UsageLog

    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    monthly_cost = db.query(func.sum(UsageLog.cost)).filter(
        UsageLog.universal_key_id == universal_key_id,
        UsageLog.model == model,
        extract("month", UsageLog.created_at) == current_month,
        extract("year", UsageLog.created_at) == current_year
    ).scalar() or 0.0

    # Only compare if monthly_cost_limit is actually a number
    if permission.monthly_cost_limit is not None and monthly_cost >= permission.monthly_cost_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly cost limit of ${permission.monthly_cost_limit} exceeded"
        )