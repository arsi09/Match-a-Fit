'''
auth_service.py
Python
This module provides authentication services for the Match-a-Fit app, including user verification and password handling.
for Match-a-Fit app
written by Juan Marco Saca Dada
02/06/2025
'''

import hashlib
import uuid
from typing import Optional, Dict, Any

from Models.LogInModel import LogInModel
from Models.SignUpModel import SignUpModel
from Connection.connection import get_supabase_client


def authenticate_user(email: str, password: str) -> Optional[LogInModel]:
    """Return a LogInModel instance when credentials are valid, otherwise None.

    Uses the model's `find_by_email` method so the controller/service layer doesn't access
    the DB client directly.
    """
    user = LogInModel.find_by_email(email)
    if not user:
        return None
    if not user.verify_password(password):
        return None
    return user


def sign_up(email: str, password: str, age: Optional[int] = None, gender: Optional[str] = None, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Dict[str, Any]:
    """Create a new user in the `users` table using `SignUpModel` for validation and record creation."""
    # create model and validate
    model = SignUpModel(
        email=email,
        password=password,
        confirm_password=None,
        age=age,
        gender=gender,
        first_name=first_name,
        last_name=last_name,
    )

    valid, errors = model.validate()
    if not valid:
        return {"success": False, "error": "; ".join(errors)}

    supabase = get_supabase_client()

    # check for existing email
    try:
        existing = supabase.table("users").select("id").eq("email", model.email).limit(1).execute()
        if getattr(existing, "data", None):
            return {"success": False, "error": "Email already registered"}
    except Exception as e:
        return {"success": False, "error": f"Database query failed: {e}"}

    record = model.to_db_record()

    try:
        inserted = supabase.table("users").insert(record).execute()
        if getattr(inserted, "error", None):
            return {"success": False, "error": str(inserted.error)}

        return {"success": True, "message": "Account created", "data": inserted.data}
    except Exception as e:
        return {"success": False, "error": f"Insert failed: {e}"}
