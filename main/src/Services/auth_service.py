'''
auth_service.py
Python
This module provides authentication services for the Match-a-Fit app, including user verification and password handling.
for Match-a-Fit app
written by Juan Marco Saca Dada
02/06/2025
'''

from Models.LogInModel import LogInModel


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
