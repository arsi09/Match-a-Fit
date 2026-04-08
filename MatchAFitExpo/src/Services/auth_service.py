'''
auth_service.py
Python
This module provides authentication services for the Match-a-Fit app, including user verification and password handling.
for Match-a-Fit app
written by Juan Marco Saca Dada
02/06/2025
'''

from Models.LogInModel import LogInModel
from Models.SignUpModel import SignUpModel


def login_user(email: str, password: str):
    if not email or not password:
        return {
            "success": False,
            "error": "Email and password are required"
        }

    user = LogInModel.authenticate(email, password)

    if not user:
        return {
            "success": False,
            "error": "Invalid email or password"
        }

    return {
        "success": True,
        "user": user
    }

def sign_up_user(email: str, password: str, confirm_password: str, age, gender: str):
    model = SignUpModel(
        email=email,
        password=password,
        confirm_password=confirm_password,
        age=age,
        gender=gender
    )

    is_valid, errors = model.validate()

    if not is_valid:
        return {
            "success": False,
            "errors": errors
        }

    return model.save()

