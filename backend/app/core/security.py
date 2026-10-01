"""
Core security utilities: JWT tokens, password hashing, token blacklist.
"""
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.context import CryptContext
from redis.asyncio import Redis

from app.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def verify_token_type(token: str, expected_type: str) -> bool:
    """Verify token type (access/refresh)."""
    payload = decode_token(token)
    if not payload:
        return False
    return payload.get("type") == expected_type


# ─── Token Blacklist (Redis) ─────────────────────────────────────

_redis_client: Optional[Redis] = None


async def get_redis():
    """Get Redis client for token blacklist if URL is provided."""
    global _redis_client
    if not settings.REDIS_URL:
        return None
    if _redis_client is None:
        _redis_client = Redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def blacklist_token(token: str, expires_in: Optional[int] = None) -> None:
    """
    Add token to blacklist in Redis.
    Token expires automatically based on its JWT exp claim.
    """
    redis = await get_redis()
    if not redis:
        return
    
    payload = decode_token(token)
    if not payload:
        return

    exp = payload.get("exp")
    if exp:
        ttl = exp - int(datetime.now(timezone.utc).timestamp())
        if ttl > 0:
            await redis.setex(f"blacklist:{token}", ttl, "1")


async def is_token_blacklisted(token: str) -> bool:
    """Check if token is in blacklist."""
    redis = await get_redis()
    if not redis:
        return False
        
    result = await redis.get(f"blacklist:{token}")
    return result is not None


# ─── Field-level Encryption ──────────────────────────────────────

_encryption_key: Optional[bytes] = None


def get_encryption_key() -> bytes:
    """Get decoded encryption key."""
    global _encryption_key
    if _encryption_key is None:
        _encryption_key = base64.b64decode(settings.FIELD_ENCRYPTION_KEY)
    return _encryption_key


def encrypt_field(value: str) -> str:
    """
    Encrypt a field value using AES-256-GCM.
    Returns base64-encoded ciphertext with nonce.
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)
    ciphertext = aesgcm.encrypt(nonce, value.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_field(encrypted_value: str) -> str:
    """
    Decrypt a field value using AES-256-GCM.
    Expects base64-encoded ciphertext with nonce.
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    key = get_encryption_key()
    aesgcm = AESGCM(key)
    data = base64.b64decode(encrypted_value)
    nonce = data[:12]
    ciphertext = data[12:]
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode()


# ─── HMAC for Student ID Lookup ──────────────────────────────────

_STUDENT_ID_HMAC_KEY: Optional[bytes] = None


def get_student_id_hmac_key() -> bytes:
    """Get HMAC key for student ID hashing (derived from JWT secret)."""
    global _STUDENT_ID_HMAC_KEY
    if _STUDENT_ID_HMAC_KEY is None:
        _STUDENT_ID_HMAC_KEY = hashlib.sha256(settings.JWT_SECRET_KEY.encode()).digest()
    return _STUDENT_ID_HMAC_KEY


def hash_student_id(student_id: str) -> str:
    """Create HMAC-SHA256 hash of student ID for lookup without plaintext."""
    key = get_student_id_hmac_key()
    return hmac.new(key, student_id.encode(), hashlib.sha256).hexdigest()


def verify_student_id_hash(student_id: str, hashed: str) -> bool:
    """Verify a student ID against its HMAC hash."""
    return hmac.compare_digest(hash_student_id(student_id), hashed)


# ─── IP Address Hashing for Audit Logs ───────────────────────────

def hash_ip(ip: str) -> str:
    """Hash IP address for privacy-preserving audit logs."""
    key = get_student_id_hmac_key()  # Reuse HMAC key
    return hmac.new(key, ip.encode(), hashlib.sha256).hexdigest()[:16]


def hash_user_agent(ua: str) -> str:
    """Hash user agent for privacy-preserving audit logs."""
    key = get_student_id_hmac_key()
    return hmac.new(key, ua.encode(), hashlib.sha256).hexdigest()[:16]