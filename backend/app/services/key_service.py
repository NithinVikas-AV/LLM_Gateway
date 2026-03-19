# encrypt, store, retrieve keys

import secrets
import hashlib
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.provider_key import ProviderKey
from app.models.universal_key import UniversalKey
from app.models.key_permission import KeyPermission
from app.models.user import User
from app.core.security import encrypt_api_key, decrypt_api_key
from app.schemas.keys import ProviderKeyCreate, UniversalKeyCreate, KeyPermissionCreate

# -- Provider Keys ------------------------------

def add_provider_key(db: Session, user: User, data: ProviderKeyCreate) -> ProviderKey:
    # Check if user already has a key for this provider
    existing = db.query(ProviderKey).filter(
        ProviderKey.user_id == user.id,
        ProviderKey.provider == data.provider,
    ).first()

    encrypted_key, iv = encrypt_api_key(data.api_key)

    if existing:
        # Update Existing Key
        existing.encrypted_key = encrypted_key
        existing.iv = iv
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    # Create new key
    provider_key = ProviderKey(
        user_id=user.id,
        provider=data.provider,
        encrypted_key=encrypted_key,
        iv=iv
    )
    db.add(provider_key)
    db.commit()
    db.refresh(provider_key)
    return provider_key


def get_provider_keys(db: Session, user: User) -> list[ProviderKey]:
    return db.query(ProviderKey).filter(
        ProviderKey.user_id == user.id,
        ProviderKey.is_active == True
    ).all()


def delete_provider_key(db: Session, user: User, provider: str):
    key = db.query(ProviderKey).filter(
        ProviderKey.user_id == user.id,
        ProviderKey.provider == provider
    ).first()

    if not key:
        raise HTTPException(status_code=404, detail="Provider key not found")
    
    # Soft delete - just mark inactive, never hard delete
    key.is_active = False
    db.commit()


def get_decrypted_key(db: Session, user_id, provider: str) -> str:
    key = db.query(ProviderKey).filter(
        ProviderKey.user_id == user_id,
        ProviderKey.provider == provider,
        ProviderKey.is_active == True
    ).first()

    if not key:
        raise HTTPException(
            status_code=404,
            detail=f"No active key found for provider: {provider}"
        )
    
    return decrypt_api_key(key.encrypted_key, key.iv)

# -- Universal Keys ------------------------------

def generate_universal_key() -> tuple[str, str]:
    # raw_key is what we give the user - they user this in their app
    raw_key = "llmgw-" + secrets.token_urlsafe(32)
    # key_hash is what we store — never store raw
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, key_hash


def create_universal_key(db: Session, user: User, data: UniversalKeyCreate) -> dict:
    raw_key, key_hash = generate_universal_key()

    universal_key = UniversalKey(
        user_id=user.id,
        key_hash=key_hash,
        label=data.label
    )
    db.add(universal_key)
    db.commit()
    db.refresh(universal_key)

    # Return raw_key ONCE - we can recover it after this
    return{
        "id": universal_key.id,
        "label": universal_key.label,
        "is_active": universal_key.is_active,
        "created_at": universal_key.created_at,
        "raw_key": raw_key # Shown at creation
    }


def get_universal_keys(db: Session, user: User) -> list[UniversalKey]:
    return db.query(UniversalKey).filter(
        UniversalKey.user_id == user.id,
        UniversalKey.is_active == True
    ).all()


def revoke_universal_key(db: Session, user: User, key_id):
    key = db.query(UniversalKey).filter(
        UniversalKey.id == key_id,
        UniversalKey.user_id == user.id
    ).first()

    if not key:
        raise HTTPException(
            status_code=404,
            detail="Universal key not found"
        )
    
    key.is_active = False
    db.commit()


def lookup_universal_key(db: Session, raw_key: str) -> UniversalKey | None:
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return db.query(UniversalKey).filter(
        UniversalKey.key_hash == key_hash,
        UniversalKey.is_active == True
    ).first()

# -- Key Permissions ------------------------------

def set_key_permission(
        db: Session,
        universal_key_id,
        data: KeyPermissionCreate
) -> KeyPermission:
    existing = db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id,
        KeyPermission.model == data.model
    )

    if existing:
        existing.rpm_limit = data.rpm_limit
        existing.daily_token_limit = data.daily_token_limit
        existing.monthly_cost_limit = data.monthly_cost_limit
        db.commit()
        db.refresh(existing)
        return existing
    
    permission = KeyPermission(
        universal_key_id=universal_key_id,
        model=data.model,
        rpm_limit=data.rpm_limit,
        daily_token_limit=data.daily_token_limit,
        monthly_cost_limit=data.monthly_cost_limit
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


def get_key_permissions(db: Session, universal_key_id) -> list[KeyPermission]:
    return db.query(KeyPermission).filter(
        KeyPermission.universal_key_id == universal_key_id
    ).all()