'''
auth_service.py
Python
This module provides authentication services for the Match-a-Fit app, including user verification and password handling.
for Match-a-Fit app
written by Juan Marco Saca Dada
02/06/2025
'''

from Models.LogInModel import User
from Connection.connection import get_supabase_client
from typing import Optional

def authenticate_user(email: str, password: str) -> Optional[User]:
    supabase = get_supabase_client()

    query = (supabase.table("users").select("id", "email", "password_hash", "salt").eq("email", email).limit(1).execute())
    
    data = query.data

    if not data:
        return None
    
    row = data[0]

    user = User(id=row["id"], email=row["email"], password_hash=row["password_hash"], salt=row["salt"])

    if not user.verify_password(password):
        return None
    
    return user
