import base64
from Connection.connection import get_supabase_client


class GenerateOutfitModel:

    @staticmethod
    def get_clothing_items_metadata(user_id: int):
        """
        LIGHT query — NO images (prevents timeout)
        """
        supabase = get_supabase_client()

        response = (
            supabase.table("clothing_items")
            .select("id, type, occasion, image_mime")  # ❌ NO image here
            .eq("user_id", user_id)
            .execute()
        )

        return response.data or []

    @staticmethod
    def get_item_with_image(item_id: int):
        """
        Fetch ONE image at a time
        """
        supabase = get_supabase_client()

        response = (
            supabase.table("clothing_items")
            .select("id, image, image_mime, type, occasion")
            .eq("id", item_id)
            .single()
            .execute()
        )

        return response.data

    @staticmethod
    def get_items_for_ai(user_id: int, occasion: str = None):
        """
        Main function used by outfit_ai_service
        """
        metadata_items = GenerateOutfitModel.get_clothing_items_metadata(user_id)

        prepared_items = []

        requested_occasion = (occasion or "").strip().lower()

        for item in metadata_items:
            item_occasion = (item.get("occasion") or "").strip().lower()

            # Filter BEFORE loading image (IMPORTANT)
            if requested_occasion:
                if item_occasion not in [requested_occasion, "versatile", "all"]:
                    continue

            # Now fetch FULL item (with image)
            full_item = GenerateOutfitModel.get_item_with_image(item["id"])

            if not full_item or not full_item.get("image"):
                continue

            try:
                image_bytes = base64.b64decode(full_item["image"])
            except Exception:
                continue

            prepared_items.append({
                "id": full_item["id"],
                "image_bytes": image_bytes,
                "image_mime": full_item.get("image_mime") or "image/jpeg",
                "clothing_type": full_item.get("type"),
                "occasion": full_item.get("occasion"),
            })

        return prepared_items
    @staticmethod
    def get_items_for_display(item_ids: list):
        """
        Gets selected clothing items with image URIs for frontend display
        """
        if not item_ids:
            return []

        supabase = get_supabase_client()

        response = (
            supabase.table("clothing_items")
            .select("id, image, image_mime, type, occasion")
            .in_("id", item_ids)
            .execute()
        )

        display_items = []

        for item in response.data or []:
            image = item.get("image")
            image_mime = item.get("image_mime") or "image/jpeg"

            image_uri = None

            if image:
                image_uri = f"data:{image_mime};base64,{image}"

            display_items.append({
                "id": item.get("id"),
                "type": item.get("type"),
                "occasion": item.get("occasion"),
                "image_uri": image_uri,
            })

        return display_items