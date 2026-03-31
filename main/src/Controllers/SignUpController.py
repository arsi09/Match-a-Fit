"""
SignUpController.py

Server-side controller for handling sign-up requests.
Receives data from frontend, validates using SignUpModel, and manages the flow.

Author: Juan Marco Saca Dada
Date: 03/03/2026
"""

from typing import Dict, Any, Optional
from Services.auth_service import sign_up


class SignUpController:
    """
    Manages sign-up request handling.
    
    Responsibilities:
    - Receive sign-up data from frontend via API
    - Call auth_service.sign_up() to process the request
    - Return appropriate response to frontend
    """

    @staticmethod
    def process_signup(
        email: str,
        password: str,
        confirm_password: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process sign-up request from the frontend.
        
        Flow:
        1. Validate data types and presence
        2. Call auth_service.sign_up() to validate and persist
        3. Return response (success or error)
        
        Args:
            email (str): User's email address
            password (str): User's password
            confirm_password (str, optional): Password confirmation
            age (int, optional): User's age
            gender (str, optional): User's gender (male, female, other)
            first_name (str, optional): User's first name
            last_name (str, optional): User's last name
        
        Returns:
            Dict with keys:
            - success (bool): Whether the sign-up succeeded
            - message (str, optional): Success message
            - error (str, optional): Error message
            - data (dict, optional): Created user data
        
        Example:
            result = SignUpController.process_signup(
                email="user@example.com",
                password="secure123",
                confirm_password="secure123",
                age=25,
                gender="male"
            )
            if result['success']:
                print(f"User created: {result['data']}")
            else:
                print(f"Error: {result['error']}")
        """
        try:
            # Validate required fields are present
            if not email or not password:
                return {
                    "success": False,
                    "error": "Email and password are required."
                }

            # Call the auth service to handle validation and database operations
            result = sign_up(
                email=email,
                password=password,
                confirm_password=confirm_password,
                age=age,
                gender=gender,
                first_name=first_name,
                last_name=last_name,
            )

            # Return the result from auth_service
            return result

        except Exception as e:
            # Catch unexpected errors
            return {
                "success": False,
                "error": f"Sign-up failed: {str(e)}"
            }

    @staticmethod
    def validate_email_availability(email: str) -> Dict[str, Any]:
        """
        Check if an email is already registered.
        Useful for real-time validation on the frontend.
        
        Args:
            email (str): Email to check
        
        Returns:
            Dict with:
            - available (bool): Whether email is available
            - message (str): Status message
        
        Example:
            result = SignUpController.validate_email_availability("user@example.com")
            if result['available']:
                print("Email is available for sign-up")
            else:
                print("Email is already registered")
        """
        try:
            from Models.LogInModel import LogInModel
            
            # Try to find existing user with this email
            existing_user = LogInModel.find_by_email(email.strip().lower())
            
            if existing_user:
                return {
                    "available": False,
                    "message": "Email is already registered"
                }
            else:
                return {
                    "available": True,
                    "message": "Email is available"
                }
        
        except Exception as e:
            return {
                "available": False,
                "message": f"Could not check email availability: {str(e)}"
            }
