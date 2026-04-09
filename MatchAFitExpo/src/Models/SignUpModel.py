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
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        confirm_password: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        phn_number: Optional[str] = None,
    ) -> None:
        self.first_name = (first_name or "").strip()
        self.last_name = (last_name or "").strip()
        self.email = (email or "").strip().lower()
        self.password = password or ""
        self.confirm_password = confirm_password
        self.age = age
        self.gender = (gender or "").strip().lower() if gender else None
        self.phn_number = (phn_number or "").strip() or None

    def validate(self) -> Tuple[bool, List[str]]:
        """Return (is_valid, errors)."""
        errors: List[str] = []

        # first name
        if not self.first_name:
            errors.append("First name is required.")
        elif len(self.first_name) > 50:
            errors.append("First name must be less than 50 characters.")

        # last name
        if not self.last_name:
            errors.append("Last name is required.")
        elif len(self.last_name) > 50:
            errors.append("Last name must be less than 50 characters.")

        # phone number
        if not self.phn_number:
            errors.append("Phone number is required.")

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

        # confirm password
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
        """Return a dict ready to insert into the `users` table."""
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
                pass

        if self.gender:
            record["gender"] = self.gender
        if self.first_name:
            record["first_name"] = self.first_name
        if self.last_name:
            record["last_name"] = self.last_name
        if self.phn_number:
            record["phn_number"] = self.phn_number

        return record

    def save(self) -> Dict[str, Any]:
        """
        Insert the user record into the database.

        Returns:
        {
            success: bool,
            message?: str,
            data?: any,
            error?: str
        }
        """
        client = get_supabase_client()
        record = self.to_db_record()

        try:
            inserted = client.table("users").insert(record).execute()

            if getattr(inserted, "error", None):
                error_text = str(inserted.error).lower()

                if "duplicate" in error_text or "unique" in error_text:
                    return {
                        "success": False,
                        "error": "An account with that email already exists."
                    }

                return {
                    "success": False,
                    "error": str(inserted.error)
                }

            return {
                "success": True,
                "message": "Account created",
                "data": inserted.data
            }

        except Exception as e:
            error_text = str(e).lower()

            if "duplicate" in error_text or "unique" in error_text:
                return {
                    "success": False,
                    "error": "An account with that email already exists."
                }

            return {
                "success": False,
                "error": f"Insert failed: {e}"
            }

    def __repr__(self) -> str:
        return f"SignUpModel(email={self.email!r}, age={self.age!r}, gender={self.gender!r})"