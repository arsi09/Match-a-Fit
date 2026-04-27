"""
ViewClosetModel.py

Purpose:
- Get clothing items for a specific user
- Delete one clothing item
- Convert image text stored in the database into frontend-friendly data URIs
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from Connection.connection import get_supabase_client


class ViewClosetModel:
    CLOTHING_TABLE = "clothing_items"

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
        Converts base64 image text from the database into a React Native-friendly URI.
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
    def normalize_item(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Makes every database item consistent before sending it to the frontend.
        """
        return {
            "id": item.get("id"),
            "user_id": item.get("user_id"),
            "type": item.get("type") or "Other",
            "occasion": item.get("occasion") or "Casual",
            "uploaded_at": item.get("uploaded_at"),
            "image": item.get("image"),
            "image_mime": item.get("image_mime"),
            "image_filename": item.get("image_filename"),

            # Frontend can use this directly:
            # <Image source={{ uri: item.photoUri }} />
            "photoUri": cls.build_photo_uri(
                item.get("image"),
                item.get("image_mime")
            ),
        }

    @classmethod
    def get_items_by_user_id(
        cls,
        user_id: int,
        page: int = 1,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Gets closet items for one user using pagination.

        This prevents the backend from loading the entire closet at once.
        Since images are stored as base64 text, loading too many rows can
        cause Supabase/Postgres timeout errors.
        """
        if not user_id:
            return []

        supabase = get_supabase_client()

        try:
            page = max(int(page), 1)
            limit = max(int(limit), 1)

            # Optional safety cap so the frontend cannot request too many base64 images at once.
            limit = min(limit, 10)

            start = (page - 1) * limit
            end = start + limit - 1

            response = (
                supabase.table(cls.CLOTHING_TABLE)
                .select("id, image, image_filename, image_mime, type, occasion, user_id, uploaded_at")
                .eq("user_id", user_id)
                .range(start, end)
                .execute()
            )

            rows = cls._safe_response_data(response)

            print(
                f"Closet items found for user {user_id}: "
                f"{len(rows)} items on page {page}"
            )

            return [cls.normalize_item(row) for row in rows]

        except Exception as e:
            print("Error getting closet items:", e)
            return []

    @classmethod
    def delete_item(cls, item_id: int, user_id: int) -> bool:
        """
        Deletes one clothing item only if it belongs to the logged-in user.
        """
        if not item_id or not user_id:
            return False

        supabase = get_supabase_client()

        try:
            response = (
                supabase.table(cls.CLOTHING_TABLE)
                .delete()
                .eq("id", item_id)
                .eq("user_id", user_id)
                .execute()
            )

            return response is not None

        except Exception as e:
            print("Error deleting closet item:", e)
            return False

    @staticmethod
    def filter_by_type(
        items: List[Dict[str, Any]],
        selected_type: str = "All"
    ) -> List[Dict[str, Any]]:
        """
        Filters closet items by clothing type.
        """
        if not isinstance(items, list):
            return []

        if not selected_type or str(selected_type).strip().lower() == "all":
            return items

        selected = str(selected_type).strip().lower()

        return [
            item
            for item in items
            if str(item.get("type", "")).strip().lower() == selected
        ]