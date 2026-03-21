#  Redis connection

import redis
from app.core.config import settings

def get_redis():
    return redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        ssl_cert_reqs=None
    )