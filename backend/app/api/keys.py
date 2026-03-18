# /keys CRUD endpoints

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.keys import(
    ProviderKeyCreate, KeyPermissionResponse,
    UniversalKeyCreate, UniversalKeyResponse,
    KeyPermissionCreate, ProviderKeyResponse
)
from app.services import key_service

router = APIRouter(prefix="/keys", tags=["keys"])

# -- Provider Keys ------------------------------

@router.post("/provider", response_model=ProviderKeyResponse)
def add_provider_key(
    data: ProviderKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.add_provider_key(db, current_user, data)

@router.get("/provider", response_model=list[ProviderKeyResponse])
def list_provider_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.get_provider_keys(db, current_user)

@router.delete("/provider/{provider}")
def delete_provider_key(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    key_service.delete_provider_key(db, current_user, provider)
    return {"message": f"{provider} key removed"}

# -- Universal Keys ------------------------------

@router.post("/universal", response_model=dict)
def create_universal_key(
    data: UniversalKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.create_universal_key(db, current_user, data)

@router.get("/universal", response_model=list[UniversalKeyResponse])
def list_universal_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.get_universal_keys(db, current_user)

@router.delete("/universal/{key_id}")
def revoke_universal_key(
    key_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    key_service.revoke_universal_key(db, current_user, key_id)
    return {"message": "Key Revoked"}

# -- Key Permissions ------------------------------

@router.post("universal/{key_id}/permissions", response_model=KeyPermissionResponse)
def set_permission(
    key_id: UUID,
    data: KeyPermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.set_key_permission(db, key_id, data)

@router.get("/universal/{key_id}/permissions", response_model=list[KeyPermissionResponse])
def get_permissions(
    key_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return key_service.get_key_permissions(db, key_id)