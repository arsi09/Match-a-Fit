"""
ViewClosetModel.py

Purpose:
- Get all clothing items for a specific user
- Delete one clothing item
- Convert base64 image text into a frontend-friendly data URI
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from Connection.connection import get_supabase_client


class ViewClosetModel:
    """
    Handles database logic for viewing closet items.
    """

    TABLE_NAME = "clothing_items"

    @staticmethod
    def _safe_response_data(response: Any) -> List[Dict[str, Any]]:
        if response is None:
            return []

        data = getattr(response, "data", None)

        if isinstance(data, list):
            return data

        return []

    @staticmethod
    def build_photo_uri(raw_photo: Any, mime_type: Optional[str] = None) -> Optional[str]:
        """
        Converts image text from the database into a React Native-friendly URI.
        """
        if raw_photo is None:
            return None

        raw_photo = str(raw_photo).strip()

        if not raw_photo:
            return None

        if raw_photo.startswith("data:image"):
            return raw_photo

        mime = str(mime_type or "image/jpeg").strip()
        return f"data:{mime};base64,{raw_photo}"

    @classmethod
    def normalize_clothing_item(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        raw_photo = item.get("image")
        mime_type = item.get("image_mime")

        return {
            "id": item.get("id"),
            "type": item.get("type") or "Unknown",
            "occasion": item.get("occasion") or "Casual",
            "user_id": item.get("user_id"),
            "uploaded_at": item.get("uploaded_at"),
            "image_mime": mime_type or "image/jpeg",
            "image_filename": item.get("image_filename"),
            "photoUri": cls.build_photo_uri(raw_photo, mime_type),
        }

    @classmethod
    def get_items_by_user_id(cls, user_id: int) -> List[Dict[str, Any]]:
        if not user_id:
            return []

        supabase = get_supabase_client()

        response = (
            supabase.table(cls.TABLE_NAME)
            .select("id, image, image_filename, image_mime, type, occasion, user_id, uploaded_at")
            .eq("user_id", user_id)
            .order("uploaded_at", desc=True)
            .execute()
        )

        rows = cls._safe_response_data(response)
        return [cls.normalize_clothing_item(row) for row in rows]

    @classmethod
    def delete_item(cls, item_id: int) -> bool:
        if not item_id:
            return False

        supabase = get_supabase_client()

        response = (
            supabase.table(cls.TABLE_NAME)
            .delete()
            .eq("id", item_id)
            .execute()
        )

        return response is not None