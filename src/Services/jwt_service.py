"""
jwt_service.py
created by Arsi 03/02/2026
Purpose:
- Create JWT access tokens for authenticated users.
- Keep token logic in one place so the API endpoints stay clean.

This is used by:
- src/api_main.py (login + signup endpoints)
"""

from datetime import datetime, timedelta, timezone
import os
import jwt

# Optional: load .env if present (matches your connection.py approach)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


def _get_jwt_settings() -> tuple[str, str, int]:
    """
    _get_jwt_settings()

    Purpose:
        Reads JWT settings from environment variables.

    What it does:
        - JWT_SECRET: key used to sign tokens
        - JWT_ALG: signing algorithm (default HS256)
        - JWT_EXPIRES_MIN: token lifetime in minutes (default 1440 = 24 hours)

    Returns:
        (secret, algorithm, expires_minutes)

    Why it matters:
        Keeping these values in environment variables is safer than hardcoding.
    """
    secret = os.getenv("JWT_SECRET", "dev-secret-change-me")
    alg = os.getenv("JWT_ALG", "HS256")
    expires_min = int(os.getenv("JWT_EXPIRES_MIN", "1440"))
    return secret, alg, expires_min


def create_access_token(user_id: int, email: str) -> str:
    """
    create_access_token(user_id, email)

    Purpose:
        Generates a signed JWT token for a user after successful login/signup.

    What it does:
        1. Builds a JWT payload with:
            - sub: the user ID (subject)
            - email: user's email
            - iat: issued-at time
            - exp: expiration time
        2. Signs the token using JWT_SECRET and JWT_ALG.
        3. Returns the token as a string.

    Used by:
        - /auth/signup
        - /auth/login

    Returns:
        JWT token string
    """
    secret, alg, expires_min = _get_jwt_settings()

    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_min)).timestamp()),
    }

    return jwt.encode(payload, secret, algorithm=alg)