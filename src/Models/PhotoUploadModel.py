'''
PhotoUploadModel.py

This model handles photo upload data for the Match-a-Fit app.

Purpose:
- Save uploaded clothing photos into the database
- Retrieve uploaded clothing items from the database
- Delete uploaded clothing items if needed
'''

import base64
from Connection.connection import get_supabase_client


class PhotoUploadModel:
    def __init__(
        self,
        id=None,
        image=None,
        image_filename=None,
        image_mime=None,
        clothing_type=None,
        occasion=None,
        user_id=None,
        uploaded_at=None
    ):
        self.id = id
        self.image = image
        self.image_filename = image_filename
        self.image_mime = image_mime
        self.clothing_type = clothing_type
        self.occasion = occasion
        self.user_id = user_id
        self.uploaded_at = uploaded_at

    @staticmethod
    def create(image_bytes, image_filename, image_mime, clothing_type, occasion, user_id):
        supabase = get_supabase_client()

        try:
            encoded_image = base64.b64encode(image_bytes).decode("utf-8")

            response = supabase.table("clothing_items").insert({
                "image": encoded_image,
                "image_filename": image_filename,
                "image_mime": image_mime,
                "type": clothing_type,
                "occasion": occasion,
                "user_id": user_id
            }).execute()

            if not response.data:
                return {
                    "success": False,
                    "error": "Insert failed"
                }

            row = response.data[0]

            return {
                "success": True,
                "id": row.get("id"),
                "uploaded_at": row.get("uploaded_at")
            }

        except Exception as e:
            print("SUPABASE INSERT ERROR:", e)
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_by_id(item_id):
        supabase = get_supabase_client()

        try:
            response = supabase.table("clothing_items").select("*").eq("id", item_id).execute()

            if not response.data:
                return None

            row = response.data[0]
            image_data = row.get("image")
            decoded_image = base64.b64decode(image_data) if image_data else None

            return PhotoUploadModel(
                id=row.get("id"),
                image=decoded_image,
                image_filename=row.get("image_filename"),
                image_mime=row.get("image_mime"),
                clothing_type=row.get("type"),
                occasion=row.get("occasion"),
                user_id=row.get("user_id"),
                uploaded_at=row.get("uploaded_at")
            )

        except Exception as e:
            print("SUPABASE GET BY ID ERROR:", e)
            return None

    @staticmethod
    def get_all_by_user(user_id):
        supabase = get_supabase_client()

        try:
            response = (
                supabase
                .table("clothing_items")
                .select("id, image_filename, image_mime, type, occasion, user_id, uploaded_at")
                .eq("user_id", user_id)
                .order("uploaded_at", desc=True)
                .execute()
            )

            items = []

            for row in response.data:
                items.append({
                    "id": row.get("id"),
                    "image_filename": row.get("image_filename"),
                    "image_mime": row.get("image_mime"),
                    "clothing_type": row.get("type"),
                    "occasion": row.get("occasion"),
                    "user_id": row.get("user_id"),
                    "uploaded_at": row.get("uploaded_at")
                })

            return items

        except Exception as e:
            print("SUPABASE GET ALL ERROR:", e)
            return []

    @staticmethod
    def delete(item_id):
        supabase = get_supabase_client()

        try:
            response = supabase.table("clothing_items").delete().eq("id", item_id).execute()

            if not response.data:
                return {
                    "success": False,
                    "error": "Item not found"
                }

            deleted_row = response.data[0]

            return {
                "success": True,
                "deleted_id": deleted_row.get("id")
            }

        except Exception as e:
            print("SUPABASE DELETE ERROR:", e)
            return {
                "success": False,
                "error": str(e)
            }