"""
GenerateOutfitSaveModel.py

Purpose:
- Save AI-generated outfits into the outfits table
- Match clothing item IDs to the correct outfit columns
"""

from Connection.connection import get_supabase_client


class GenerateOutfitSaveModel:

    @staticmethod
    def get_clothing_item_by_id(item_id: int):
        """
        Gets one clothing item so we can check its clothing type.
        This does NOT use .single() because .single() crashes if 0 rows are found.
        """
        supabase = get_supabase_client()

        response = (
            supabase.table("clothing_items")
            .select("id, type")
            .eq("id", item_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return response.data[0]

        return None

    @staticmethod
    def save_generated_outfit(
        user_id: int,
        item_ids: list,
        occasion: str,
        style_tip: str = None
    ):
        """
        Saves one generated outfit into the outfits table.

        The AI gives us item IDs.
        This function checks each item's type and places it into:
        - upper_item_id
        - lower_item_id
        - footwear_item_id
        - layer_item_id
        """
        supabase = get_supabase_client()

        upper_item_id = None
        lower_item_id = None
        footwear_item_id = None
        layer_item_id = None

        for item_id in item_ids:
            item = GenerateOutfitSaveModel.get_clothing_item_by_id(item_id)

            if not item:
                continue

            clothing_type = (item.get("type") or "").strip().lower()

            if clothing_type in [
                "shirt",
                "top",
                "t-shirt",
                "tee",
                "blouse",
                "sweater", 
                "dress", 
                "dresses"
            ]:
                upper_item_id = item_id

            elif clothing_type in [
                "pants",
                "jeans",
                "shorts",
                "skirt",
                "trousers"
            ]:
                lower_item_id = item_id

            elif clothing_type in [
                "shoes",
                "shoe",
                "footwear",
                "sneakers",
                "boots",
                "heels"
            ]:
                footwear_item_id = item_id

            elif any(word in clothing_type for word in [
               "jacket",
                "hoodie",
                "coat",
                "blazer",
                "layer",
                "cardigan",
                "outerwear"
            ]):
                layer_item_id = item_id

        data = {
            "user_id": user_id,
            "upper_item_id": upper_item_id,
            "lower_item_id": lower_item_id,
            "footwear_item_id": footwear_item_id,
            "layer_item_id": layer_item_id,
            "occasion": occasion,
            "style_tip": style_tip,
        }

        response = (
            supabase.table("outfits")
            .insert(data)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None