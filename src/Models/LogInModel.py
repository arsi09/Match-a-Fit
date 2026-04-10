import hashlib
from typing import Optional

from Connection.connection import get_supabase_client


class LogInModel:
    def __init__(self, id, first_name, last_name, email, password_hash, salt):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password_hash = password_hash
        self.salt = salt or ""

    def verify_password(self, password: str) -> bool:
        hashed = hashlib.sha256((password + self.salt).encode("utf-8")).hexdigest()
        return hashed == self.password_hash

    def to_safe_dict(self) -> dict:
        return {
            "id": self.id,
            "username": f"{self.first_name} {self.last_name}".strip(),
            "email": self.email,
        }

    @classmethod
    def find_by_email(cls, email: str) -> Optional["LogInModel"]:
        client = get_supabase_client()

        try:
            res = (
                client.table("users")
                .select("id, first_name, last_name, email, password_hash, salt")
                .eq("email", email.strip().lower())
                .limit(1)
                .execute()
            )

            data = getattr(res, "data", None)
            if not data:
                return None

            row = data[0]

            return cls(
                id=row.get("id"),
                first_name=row.get("first_name"),
                last_name=row.get("last_name"),
                email=row.get("email"),
                password_hash=row.get("password_hash"),
                salt=row.get("salt"),
            )
        except Exception:
            return None

    @classmethod
    def authenticate(cls, email: str, password: str) -> Optional[dict]:
        user = cls.find_by_email(email)

        if not user:
            return None

        if not user.verify_password(password):
            return None

        return user.to_safe_dict()