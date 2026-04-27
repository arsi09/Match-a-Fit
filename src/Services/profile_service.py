"""
profile_service.py

Purpose:
- Handles profile business logic
- Converts database field names into frontend field names
- Handles password change using the same hash logic as SignUpModel
"""

import uuid
import hashlib

from Models.ProfileModel import ProfileModel


def format_user(user):
    return {
        "id": user.get("id"),
        "firstName": user.get("first_name") or "",
        "lastName": user.get("last_name") or "",
        "phnNumber": user.get("phn_number") or "",
        "email": user.get("email") or "",
        "age": str(user.get("age")) if user.get("age") is not None else "",
        "gender": user.get("gender") or "",
    }


def get_user_profile(user_id: int):
    if not user_id:
        return {
            "success": False,
            "message": "User ID is required",
        }

    user = ProfileModel.get_user_by_id(user_id)

    if not user:
        return {
            "success": False,
            "message": "User not found",
        }

    return {
        "success": True,
        "message": "Profile loaded successfully",
        "profile": format_user(user),
    }


def update_user_profile(user_id: int, profile_data: dict):
    if not user_id:
        return {
            "success": False,
            "message": "User ID is required",
        }

    try:
        updated_rows = ProfileModel.update_user_profile(user_id, profile_data)

        updated_user = ProfileModel.get_user_by_id(user_id)

        if not updated_user:
            return {
                "success": False,
                "message": "Profile update failed. User not found after update.",
            }

        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": format_user(updated_user),
            "debugUpdatedRows": updated_rows,
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
        }


def hash_password(password: str, salt: str):
    """
    Must match SignUpModel.hash_password exactly:

    hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    """
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def verify_password(plain_password: str, stored_hash: str, stored_salt: str):
    entered_hash = hash_password(plain_password, stored_salt)
    return entered_hash == stored_hash


def change_user_password(user_id: int, password_data: dict):
    current_password = password_data.get("currentPassword")
    new_password = password_data.get("newPassword")

    if not user_id:
        return {
            "success": False,
            "message": "User ID is required.",
        }

    if not current_password or not new_password:
        return {
            "success": False,
            "message": "Current password and new password are required.",
        }

    if len(new_password) < 8:
        return {
            "success": False,
            "message": "New password must be at least 8 characters.",
        }

    try:
        user = ProfileModel.get_user_password_data(user_id)

        if not user:
            return {
                "success": False,
                "message": "User not found.",
            }

        stored_hash = user.get("password_hash")
        stored_salt = user.get("salt")

        if not stored_hash or not stored_salt:
            return {
                "success": False,
                "message": "Password data is missing for this user.",
            }

        if not verify_password(current_password, stored_hash, stored_salt):
            return {
                "success": False,
                "message": "Current password is incorrect.",
            }

        new_salt = uuid.uuid4().hex
        new_hash = hash_password(new_password, new_salt)

        updated_rows = ProfileModel.update_user_password(
            user_id,
            new_hash,
            new_salt
        )

        if not updated_rows:
            return {
                "success": False,
                "message": "Password update failed. Check RLS policy.",
            }

        return {
            "success": True,
            "message": "Password updated successfully.",
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
        }