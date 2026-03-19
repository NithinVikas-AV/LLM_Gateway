# /gateway/chat (the proxy)

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.gateway import GatewayRequest, GatewayResponse
from app.services.gateway_service import process_gateway_request
from app.services.key_service import lookup_universal_key

router = APIRouter(prefix="/gateway", tags=["gateway"])

@router.post("/chat", response_model=GatewayResponse)
async def chat(
    request: GatewayRequest,
    x_api_key: str = Header(..., description="Your Universal API key"),
    db: Session = Depends(get_db)
):
    # Employees authenticate with their universal key in the header
    # not with a JWT - this is a machine-machine call
    universal_key = lookup_universal_key(db, x_api_key)

    if not universal_key:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    
    return await process_gateway_request(request, universal_key, db)