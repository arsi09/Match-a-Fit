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

    # check for existing email using the model layer
    try:
        if LogInModel.find_by_email(model.email):
            return {"success": False, "error": "Email already registered"}
    except Exception as e:
        return {"success": False, "error": f"Database query failed: {e}"}

    # persist via the model
    result = model.save()
    return result
