"""
ProfileModel.py

Purpose:
- Fetch user profile information from Supabase
- Update user profile information in Supabase
"""

from Connection.connection import get_supabase_client


class ProfileModel:
    @staticmethod
    def get_user_by_id(user_id: int):
        supabase = get_supabase_client()

        response = (
            supabase.table("users")
            .select("id, first_name, last_name, age, email, gender, phn_number")
            .eq("id", user_id)
            .single()
            .execute()
        )
        
        return response.data

    @staticmethod
    def update_user_profile(user_id: int, profile_data: dict):
        supabase = get_supabase_client()

        update_data = {
            "first_name": profile_data.get("firstName"),
            "last_name": profile_data.get("lastName"),
            "phn_number": profile_data.get("phnNumber"),
            "email": profile_data.get("email"),
            "gender": profile_data.get("gender"),
        }

        age = profile_data.get("age")

        if age not in [None, ""]:
            update_data["age"] = int(age)

        clean_update_data = {
            key: value
            for key, value in update_data.items()
            if value is not None
        }

        response = (
            supabase.table("users")
            .update(clean_update_data)
            .eq("id", user_id)
            .execute()
        )

        if not response.data:
            raise Exception("Supabase update returned no data. Check RLS policy, user_id, or column names.")

        return response.data
    
    @staticmethod
    def get_user_password_data(user_id: int):
        supabase = get_supabase_client()

        response = (
            supabase.table("users")
            .select("id, password_hash, salt")
            .eq("id", user_id)
            .single()
            .execute()
        )

        return response.data


    @staticmethod
    def update_user_password(user_id: int, password_hash: str, salt: str):
        supabase = get_supabase_client()

        response = (
            supabase.table("users")
            .update({
                "password_hash": password_hash,
                "salt": salt,
            })
            .eq("id", user_id)
            .execute()
        )

        return response.data