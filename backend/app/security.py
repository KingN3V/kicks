import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ADMIN_PASSWORD_HASH,
    ADMIN_USERNAME,
    ALGORITHM,
    SECRET_KEY,
)

MAX_PASSWORD_BYTES = 72  # bcrypt can't handle more than this


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    raw = password.encode()
    if len(raw) > MAX_PASSWORD_BYTES:
        return False
    try:
        return bcrypt.checkpw(raw, hashed.encode())
    except ValueError:
        return False  # the stored hash is malformed (e.g. the placeholder)


def authenticate_admin(username: str, password: str) -> bool:
    # Run both checks every time so a wrong username isn't faster to reject
    user_ok = secrets.compare_digest(username.encode(), ADMIN_USERNAME.encode())
    pass_ok = verify_password(password, ADMIN_PASSWORD_HASH)
    return user_ok and pass_ok


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None  # bad signature, expired, or garbage
    return payload.get("sub")