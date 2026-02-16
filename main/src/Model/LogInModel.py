import sys
import os

# Ensure the parent `src` directory is on sys.path so `from Connection...` works
this_dir = os.path.dirname(os.path.abspath(__file__))
src_root = os.path.abspath(os.path.join(this_dir, ".."))
if src_root not in sys.path:
    sys.path.insert(0, src_root)

from Connection.connection import get_supabase_client
from typing import Optional, Dict, Any


class LogInModel:
    """Simple wrapper around Supabase auth for sign-up / sign-in flows.

    Methods return a dict with either `data` (success) or `error` (string).
    This keeps the model resilient to minor client API differences.
    """

    def __init__(self, client: Optional[Any] = None) -> None:
        self.client = client or get_supabase_client()

    def sign_up(self, email: str, password: str) -> Dict[str, Any]:
        try:
            # client.api may expose different method names depending on version
            if hasattr(self.client.auth, "sign_up"):
                res = self.client.auth.sign_up({"email": email, "password": password})
            else:
                res = self.client.auth.sign_up(email=email, password=password)
            return {"data": getattr(res, "data", res)}
        except Exception as e:
            return {"error": str(e)}

    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        try:
            # prefer the newer "sign_in_with_password" when available
            if hasattr(self.client.auth, "sign_in_with_password"):
                res = self.client.auth.sign_in_with_password({"email": email, "password": password})
            elif hasattr(self.client.auth, "sign_in"):
                res = self.client.auth.sign_in(email=email, password=password)
            else:
                raise RuntimeError("No supported auth.sign_in method found on client")
            return {"data": getattr(res, "data", getattr(res, "user", res))}
        except Exception as e:
            return {"error": str(e)}

    def get_user(self, access_token: str) -> Dict[str, Any]:
        try:
            if hasattr(self.client.auth, "get_user"):
                res = self.client.auth.get_user(access_token)
                return {"data": getattr(res, "data", res)}
            # fallback: try to call user endpoint via rest if needed
            return {"error": "get_user not supported by client"}
        except Exception as e:
            return {"error": str(e)}

    def sign_out(self) -> Dict[str, Any]:
        try:
            if hasattr(self.client.auth, "sign_out"):
                res = self.client.auth.sign_out()
                return {"data": getattr(res, "data", res)}
            return {"error": "sign_out not supported by client"}
        except Exception as e:
            return {"error": str(e)}


def example_usage():
    m = LogInModel()
    # replace with real values when testing
    # print(m.sign_up("james_bond@mi6.com.uk", "passwrod here"))
    print("LogInModel initialized (API call commented to avoid rate limit)")


if __name__ == "__main__":
    example_usage()
import os
import re
import json
import base64
import hashlib
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

# /c:/Users/jsaca/OneDrive/Documentos/GitHub/Match-a-Fit-app/main/src/Model/LogInModel.py

PBKDF2_ITERATIONS = 100_000
SALT_BYTES = 16
USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,50}$")


@dataclass
class LogInModel:
    username: str = ""
    password_hash: str = ""
    salt: str = ""

    def set_password(self, raw_password: str) -> None:
        """Hash raw_password and store hash and salt (base64)."""
        raw = raw_password.encode("utf-8")
        salt_bytes = os.urandom(SALT_BYTES)
        dk = hashlib.pbkdf2_hmac("sha256", raw, salt_bytes, PBKDF2_ITERATIONS)
        self.salt = base64.b64encode(salt_bytes).decode("utf-8")
        self.password_hash = base64.b64encode(dk).decode("utf-8")

    def verify_password(self, raw_password: str) -> bool:
        """Verify raw_password against stored hash and salt."""
        if not self.password_hash or not self.salt:
            return False
        salt_bytes = base64.b64decode(self.salt.encode("utf-8"))
        dk = hashlib.pbkdf2_hmac(
            "sha256", raw_password.encode("utf-8"), salt_bytes, PBKDF2_ITERATIONS
        )
        return base64.b64encode(dk).decode("utf-8") == self.password_hash

    def validate_username(self) -> bool:
        """Basic username validation: 3-50 chars, alnum + _ . -"""
        return bool(USERNAME_RE.match(self.username))

    @staticmethod
    def validate_password_strength(raw_password: str) -> bool:
        """Basic password strength: min 8 chars. Extend as needed."""
        return len(raw_password or "") >= 8

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "LogInModel":
        return cls(
            username=data.get("username", ""),
            password_hash=data.get("password_hash", ""),
            salt=data.get("salt", ""),
        )

    def save_to_file(self, path: str) -> None:
        """Save model to JSON file (overwrites)."""
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(self.to_dict(), indent=2), encoding="utf-8")

    @classmethod
    def load_from_file(cls, path: str) -> Optional["LogInModel"]:
        """Load model from JSON file. Returns None if file missing/invalid."""
        p = Path(path)
        if not p.exists():
            return None
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            return cls.from_dict(data)
        except Exception:
            return None