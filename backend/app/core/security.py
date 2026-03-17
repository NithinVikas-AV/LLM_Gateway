# JWT create/verify, AES encrypt/decrypt

import os
import base64
from datetime import datetime, timedelta
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from jose import JWTError, jwt
from app.core.config import settings

# ──────────────────────────────────────────
# JWT — Login tokens
# ──────────────────────────────────────────

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# ──────────────────────────────────────────
# AES-256 — Provider key encryption
# ──────────────────────────────────────────

def get_encryption_key() -> bytes:
    key = settings.ENCRYPTION_KEY.encode()
    # AES-256 needs exactly 32 bytes
    return key[:32].ljust(32, b'0')

def encrypt_api_key(raw_key: str) -> tuple[str, str]:
    key = get_encryption_key()
    iv = os.urandom(16) # random 16-byte IV every time
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()   
    )
    encryptor = cipher.encryptor()

    # AES-CBC needs input length to be multiple of 16 — pad it
    raw_bytes = raw_key.encode()
    pad_length = 16 - (len(raw_bytes) % 16)
    padded = raw_bytes + bytes([pad_length] * pad_length)

    encrypted = encryptor.update(padded) + encryptor.finalize()

    return (
        base64.b64encode(encrypted).decode(),
        base64.b64encode(iv).decode(),
    )

def decrypt_api_key(encrypted_key: str, iv: str) -> str:
    key = get_encryption_key()
    iv_bytes =  base64.b64decode(iv)
    encrypted_bytes = base64.b64decode(encrypted_key)

    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv_bytes),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    padded = decryptor.update(encrypted_bytes) + decryptor.finalize()

    # Remove the padding we added during encryption
    pad_length = padded[-1]
    return padded[:-pad_length].decode()