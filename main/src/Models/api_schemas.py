"""
api_schemas.py
created by Arsi 03/02/2026
Purpose:
- Defines the request/response schemas (contracts) for your FastAPI endpoints.
- Ensures consistent input validation and consistent response shape.

Used by:
- src/api_main.py
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class SignUpRequest(BaseModel):
    """
    SignUpRequest

    Purpose:
        Validates the JSON body for /auth/signup.

    Fields:
        - email: validated email string
        - password: raw password (frontend sends it)
        - confirmPassword: second password field (must match)
        - age: integer
        - gender: string (expected: male/female/other based on your SignUpModel)
        - first_name, last_name: optional fields (supported by your auth_service.sign_up signature)
    """
    email: EmailStr
    password: str = Field(min_length=1)
    confirmPassword: str = Field(min_length=1)
    age: Optional[int] = None
    gender: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class LoginRequest(BaseModel):
    """
    LoginRequest

    Purpose:
        Validates the JSON body for /auth/login.

    Fields:
        - email: validated email string
        - password: raw password
    """
    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    """
    UserOut

    Purpose:
        Standard “user object” returned to the frontend after login/signup.

    Important:
        Your React Native code stores:
            response.user.id

        So 'id' MUST exist.
    """
    id: int
    email: EmailStr
    age: Optional[int] = None
    gender: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AuthResponse(BaseModel):
    """
    AuthResponse

    Purpose:
        Standard response shape for both /auth/signup and /auth/login.

    Frontend expects:
        response.token
        response.user.id
    """
    token: str
    user: UserOut