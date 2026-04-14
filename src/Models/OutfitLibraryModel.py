"""
OutfitLibraryModel.py

Purpose:
- Handles outfit library database operations
- Loads outfits for a user from the outfits table
- Deletes outfits
- Looks up related clothing items
- Converts image text stored in the database into frontend-friendly data URIs
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from Connection.connection import get_supabase_client


class OutfitLibraryModel:
    """
    Handles database logic for saved outfits.
    """

    OUTFITS_TABLE = "outfits"
    CLOTHING_TABLE = "clothing_items"  # Change this if your real clothing table name is different

    @staticmethod
    def _safe_response_data(response: Any) -> List[Dict[str, Any]]:
        """
        Safely returns response.data as a list.
        """
        if response is None:
            return []

        data = getattr(response, "data", None)

        if isinstance(data, list):
            return data

        return []

    @staticmethod
    def build_photo_uri(raw_photo: Any) -> Optional[str]:
        """
        Converts image text from the database into a React Native-friendly URI.

        If the DB already stores a full data URI, keep it.
        If it stores raw base64 like '/9j/4AAQSk...', convert it into:
        data:image/jpeg;base64,/9j/4AAQSk...
        """
        if raw_photo is None:
            return None

        raw_photo = str(raw_photo).strip()

        if not raw_photo:
            return None

        if raw_photo.startswith("data:image"):
            return raw_photo

        return f"data:image/jpeg;base64,{raw_photo}"

    @classmethod
    def get_clothing_item_by_id(cls, item_id: Optional[int]) -> Optional[Dict[str, Any]]:
        """
        Loads one clothing item by ID from the clothing table.
        """
        if not item_id:
            return None

        supabase = get_supabase_client()

        response = (
            supabase.table(cls.CLOTHING_TABLE)
            .select("*")
            .eq("id", item_id)
            .limit(1)
            .execute()
        )

        items = cls._safe_response_data(response)

        if not items:
            return None

        return items[0]

    @classmethod
    def normalize_clothing_item(
        cls,
        item: Optional[Dict[str, Any]],
        fallback_label: str
    ) -> Optional[Dict[str, Any]]:
        """
        Converts one clothing row into the object shape the frontend expects.
        """
        if not item or not isinstance(item, dict):
            return None

        raw_photo = (
            item.get("photo")
            or item.get("image")
            or item.get("image_text")
            or item.get("photo_text")
            or item.get("photo_base64")
            or item.get("image_base64")
        )

        label = (
            item.get("name")
            or item.get("title")
            or item.get("category")
            or fallback_label
        )

        return {
            "id": item.get("id"),
            "label": label,
            "category": item.get("category") or fallback_label,
            "color": item.get("color"),
            "occasion": item.get("occasion"),
            "photoUri": cls.build_photo_uri(raw_photo),
        }

    @classmethod
    def normalize_outfit(cls, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts one outfit row into the format the frontend screen expects.
        """
        upper_item = cls.get_clothing_item_by_id(record.get("upper_item_id"))
        lower_item = cls.get_clothing_item_by_id(record.get("lower_item_id"))
        footwear_item = cls.get_clothing_item_by_id(record.get("footwear_item_id"))

        return {
            "id": record.get("id"),
            "user_id": record.get("user_id"),
            "occasion": record.get("occasion") or "Casual",
            "timeOfDay": "Anytime",
            "createdAt": record.get("created_at"),
            "items": {
                "Shirt": cls.normalize_clothing_item(upper_item, "Shirt"),
                "Pants": cls.normalize_clothing_item(lower_item, "Pants"),
                "Footwear": cls.normalize_clothing_item(footwear_item, "Footwear"),
            },
        }

    @classmethod
    def get_outfits_by_user(cls, user_id: int) -> List[Dict[str, Any]]:
        """
        Loads all outfits for one user from the outfits table.
        Newest first.
        """
        if not user_id:
            return []

        supabase = get_supabase_client()

        response = (
            supabase.table(cls.OUTFITS_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        rows = cls._safe_response_data(response)

        return [cls.normalize_outfit(row) for row in rows]

    @classmethod
    def delete_outfit(cls, outfit_id: int, user_id: int) -> bool:
        """
        Deletes one outfit if it belongs to the user.
        """
        if not outfit_id or not user_id:
            return False

        supabase = get_supabase_client()

        response = (
            supabase.table(cls.OUTFITS_TABLE)
            .delete()
            .eq("id", outfit_id)
            .eq("user_id", user_id)
            .execute()
        )

        return response is not None

    @staticmethod
    def filter_by_occasion(
        outfits: List[Dict[str, Any]],
        occasion: str = "All"
    ) -> List[Dict[str, Any]]:
        """
        Optional backend-side filtering helper.
        """
        if not isinstance(outfits, list):
            return []

        if not occasion or str(occasion).strip().lower() == "all":
            return outfits

        selected = str(occasion).strip().lower()

        return [
            outfit
            for outfit in outfits
            if str(outfit.get("occasion", "")).strip().lower() == selected
        ]