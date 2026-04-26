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
            normalized_email = email.strip().lower()
            #print("=== FIND BY EMAIL DEBUG ===")
            #print("Email being searched:", normalized_email)

            res = (
                client.table("users")
                .select("id, first_name, last_name, email, password_hash, salt")
                .eq("email", normalized_email)
                .limit(1)
                .execute()
            )

            data = getattr(res, "data", None)
            #print("Raw DB data:", data)

            if not data:
                #print("No user found in DB")
                return None

            row = data[0]
            #print("Row found:", row)

            return cls(
                id=row.get("id"),
                first_name=row.get("first_name"),
                last_name=row.get("last_name"),
                email=row.get("email"),
                password_hash=row.get("password_hash"),
                salt=row.get("salt"),
            )
        except Exception as e:
            #print("find_by_email exception:", str(e))
            return None

    @classmethod
    def authenticate(cls, email: str, password: str) -> Optional[dict]:
        #print("=== AUTHENTICATE DEBUG ===")
        user = cls.find_by_email(email)

        if not user:
            #print("Authentication failed: user not found")
            return None

        if not user.verify_password(password):
            #print("Authentication failed: password mismatch")
            return None

        #print("Authentication succeeded")
        return user.to_safe_dict()