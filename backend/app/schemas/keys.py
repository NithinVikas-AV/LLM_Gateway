# These define what data looks like coming in and going out of your API.
# Notice that ProviderKeyResponse never includes the actual key — not even the encrypted version. 
# The user can see they have a key saved, but can never read it back. That's intentional.

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

# -- Provider Keys ------------------------------

class ProviderKeyCreate(BaseModel):
    provider: str # "openai", "gemini", "anthropic"
    api_key: str

class ProviderKeyResponse(BaseModel):
    id: UUID
    provider: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True # lets Pydantic read SQLAlchemy objects

# -- Universal Keys ------------------------------

class UniversalKeyCreate(BaseModel):
    label: Optional[str] = None  # e.g. "project-gateway"

class UniversalKeyResponse(BaseModel):
    id: UUID
    label: Optional[str]
    is_active: bool
    created_at: datetime
    raw_key: Optional[str] = None # only returned once at creation

    class Config:
        from_attributes = True
    
# -- Key Permission ------------------------------

class KeyPermissionCreate(BaseModel):
    model: str
    rpm_limit: int = 60
    daily_token_limit: int = 100000
    monthly_cost_limit: float = 10.0

class KeyPermissionResponse(BaseModel):
    id: UUID
    model: str
    rpm_limit: int
    daily_token_limit: int
    monthly_cost_limit: float

    class Config:
        from_attributes = True