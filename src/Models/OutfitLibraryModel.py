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
        Converts base64 image text from the database into a React Native image URI.
        """
        if raw_photo is None:
            return None

        raw_photo = str(raw_photo).strip()

        if not raw_photo:
            return None

        # If it is already a full data URI, return it as-is.
        if raw_photo.startswith("data:image"):
            return raw_photo

        mime = str(mime_type or "image/jpeg").strip()
        return f"data:{mime};base64,{raw_photo}"

    @classmethod
    def get_clothing_item_by_id(cls, item_id: Optional[int]) -> Optional[Dict[str, Any]]:
        """
        Gets one clothing item from clothing_items using its ID.
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
        Converts a clothing_items row into the format the frontend can display.
        """
        if not item or not isinstance(item, dict):
            return None

        raw_photo = item.get("image")
        mime_type = item.get("image_mime")
        item_type = item.get("type")

        label = (
            item.get("name")
            or item.get("title")
            or item_type
            or fallback_label
        )

        return {
            "id": item.get("id"),
            "label": label,
            "category": item_type or fallback_label,
            "occasion": item.get("occasion"),
            "photoUri": cls.build_photo_uri(raw_photo, mime_type),
        }

    @classmethod
    def normalize_outfit(cls, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts one outfits table row into a frontend-ready outfit object.

        DB mapping:
        - upper_item_id    -> Upper
        - lower_item_id    -> Lower
        - layer_item_id    -> Layer
        - footwear_item_id -> Footwear
        """

        upper_item = cls.get_clothing_item_by_id(record.get("upper_item_id"))
        lower_item = cls.get_clothing_item_by_id(record.get("lower_item_id"))
        layer_item = cls.get_clothing_item_by_id(record.get("layer_item_id"))
        footwear_item = cls.get_clothing_item_by_id(record.get("footwear_item_id"))

        items = {}

        normalized_upper = cls.normalize_clothing_item(upper_item, "Upper")
        normalized_lower = cls.normalize_clothing_item(lower_item, "Lower")
        normalized_layer = cls.normalize_clothing_item(layer_item, "Layer")
        normalized_footwear = cls.normalize_clothing_item(footwear_item, "Footwear")

        # Only add the category if that item exists in the outfit row.
        if normalized_upper:
            items["Upper"] = normalized_upper

        if normalized_lower:
            items["Lower"] = normalized_lower

        if normalized_layer:
            items["Layer"] = normalized_layer

        if normalized_footwear:
            items["Footwear"] = normalized_footwear

        return {
            "id": record.get("id"),
            "user_id": record.get("user_id"),
            "occasion": record.get("occasion") or "Casual",
            "timeOfDay": "Anytime",
            "createdAt": record.get("created_at"),
            "styleTip": record.get("style_tip"),
            "items": items,
        }

    @classmethod
    def get_outfits_by_user(cls, user_id: int) -> List[Dict[str, Any]]:
        """
        Loads all saved outfits for one user.
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
        Deletes one saved outfit for one user.
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
        Filters saved outfits by occasion.
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