"""
SignUpModel.py

Server-side model for sign-up data validation and DB record preparation.
Designed to be used by `Services.auth_service.sign_up`.
"""
import re
import uuid
import hashlib
from typing import Optional, Tuple, List, Dict, Any

from Connection.connection import get_supabase_client

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PASSWORD_MIN_LENGTH = 8
ALLOWED_GENDERS = {"male", "female", "other"}
MIN_AGE = 13


class SignUpModel:
    def __init__(
        self,
        email: str,
        password: str,
        confirm_password: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> None:
        self.email = (email or "").strip().lower()
        self.password = password or ""
        self.confirm_password = confirm_password
        self.age = age
        self.gender = (gender or "").strip().lower() if gender else None
        self.first_name = (first_name or "").strip() or None
        self.last_name = (last_name or "").strip() or None

    def validate(self) -> Tuple[bool, List[str]]:
        """Return (is_valid, errors).

        Validation rules mirror the frontend `SignUpModel`:
        - email format
        - password length and optional confirm match
        - age present, integer and >= MIN_AGE
        - gender must be one of the allowed values
        """
        errors: List[str] = []

        # email
        if not self.email:
            errors.append("Email is required.")
        elif not EMAIL_REGEX.match(self.email):
            errors.append("Email is invalid.")

        # password
        if not self.password:
            errors.append("Password is required.")
        elif len(self.password) < PASSWORD_MIN_LENGTH:
            errors.append(f"Password must be at least {PASSWORD_MIN_LENGTH} characters.")

        # confirm password (only checked when provided)
        if self.confirm_password is not None and self.password != self.confirm_password:
            errors.append("Passwords do not match.")

        # age
        if self.age is None or self.age == "":
            errors.append("Age is required.")
        else:
            try:
                age_number = int(self.age)
                if age_number < MIN_AGE:
                    errors.append(f"You must be at least {MIN_AGE} years old.")
            except Exception:
                errors.append("Age must be a whole number.")

        # gender
        if not self.gender:
            errors.append("Gender is required.")
        elif self.gender not in ALLOWED_GENDERS:
            errors.append("Gender must be one of: male, female, other.")

        return (len(errors) == 0, errors)

    @staticmethod
    def generate_salt() -> str:
        return uuid.uuid4().hex

    @staticmethod
    def hash_password(password: str, salt: str) -> str:
        return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

    def to_db_record(self) -> Dict[str, Any]:
        """Return a dict ready to insert into the `users` table.

        - generates salt and password_hash
        - omits confirm_password
        """
        salt = self.generate_salt()
        password_hash = self.hash_password(self.password, salt)

        record: Dict[str, Any] = {
            "email": self.email,
            "password_hash": password_hash,
            "salt": salt,
        }

        if self.age is not None and self.age != "":
            try:
                record["age"] = int(self.age)
            except Exception:
                # leave validation to `validate()` — caller should check before insert
                pass

        if self.gender:
            record["gender"] = self.gender
        if self.first_name:
            record["first_name"] = self.first_name
        if self.last_name:
            record["last_name"] = self.last_name

        return record

    def save(self) -> Dict[str, Any]:
        """Insert the user record into the database using `Connection.connection.get_supabase_client()`.

        Returns a normalized dict: { success: bool, message?: str, data?: any, error?: str }
        """
        client = get_supabase_client()
        record = self.to_db_record()
        try:
            inserted = client.table("users").insert(record).execute()
            if getattr(inserted, "error", None):
                return {"success": False, "error": str(inserted.error)}
            return {"success": True, "message": "Account created", "data": inserted.data}
        except Exception as e:
            return {"success": False, "error": f"Insert failed: {e}"}

    def __repr__(self) -> str:  # pragma: no cover - convenience only
        return f"SignUpModel(email={self.email!r}, age={self.age!r}, gender={self.gender!r})"
