"""
outfit_ai_service.py
"""

import json

from Models.GenerateOutfitModel import GenerateOutfitModel
from Models.GenerateOutfitSaveModel import GenerateOutfitSaveModel
from Connection.ai_connection import GeminiClient
from Services.prompts import assemble_styling_prompt


def get_user_clothing_items_for_ai(user_id: int, occasion: str = None):
    if not user_id:
        return {"success": False, "error": "User ID is required"}

    prepared_items = GenerateOutfitModel.get_items_for_ai(user_id, occasion)

    if not prepared_items:
        return {
            "success": False,
            "error": "No matching clothing items found"
        }

    return {"success": True, "items": prepared_items}


def normalize_ai_outfits(raw_outfits):
    if isinstance(raw_outfits, dict):
        raw_outfits = [raw_outfits]

    if not isinstance(raw_outfits, list):
        return []

    cleaned = []

    for outfit in raw_outfits:
        if isinstance(outfit, dict):
            cleaned.append(outfit)
        elif isinstance(outfit, list):
            for o in outfit:
                if isinstance(o, dict):
                    cleaned.append(o)

    return cleaned


def filter_valid_item_ids(item_ids, prepared_items):
    valid_ids = {int(item["id"]) for item in prepared_items}

    clean_ids = []

    for i in item_ids:
        try:
            i = int(i)
            if i in valid_ids:
                clean_ids.append(i)
        except:
            continue

    return clean_ids


def generate_outfit_recommendations(user_id: int, occasion: str, weather: str = None):
    clothing_response = get_user_clothing_items_for_ai(user_id, occasion)

    if not clothing_response["success"]:
        return clothing_response

    prepared_items = clothing_response["items"]

    try:
        text_prompt = assemble_styling_prompt(
            occasion=occasion,
            weather=weather,
            clothing_items=prepared_items
        )

        # print("PROMPT SENT TO GEMINI:")
        # print(text_prompt)

        gemini = GeminiClient()
        ai_response = gemini.generate_outfits(prepared_items, text_prompt)

        # print("AI RESPONSE:")
        # print(ai_response.get("response_text"))

        if not ai_response.get("success"):
            return ai_response

        try:
            raw_outfits = json.loads(ai_response.get("response_text", "[]"))
        except:
            raw_outfits = []

        outfits = normalize_ai_outfits(raw_outfits)

        saved_outfits = []
        final_outfits = []

        for outfit in outfits:
            if not isinstance(outfit, dict):
                continue

            item_ids = outfit.get("item_ids", [])

            if not isinstance(item_ids, list):
                continue

            item_ids = filter_valid_item_ids(item_ids, prepared_items)

            if not item_ids:
                continue

            outfit["item_ids"] = item_ids

            outfit["items"] = GenerateOutfitModel.get_items_for_display(item_ids)

            saved = GenerateOutfitSaveModel.save_generated_outfit(
                user_id=user_id,
                item_ids=item_ids,
                occasion=occasion,
                style_tip=outfit.get("style_tip")
            )

            if saved:
                outfit["saved_outfit_id"] = saved.get("id")
                saved_outfits.append(saved)

            final_outfits.append(outfit)

        ai_response["outfits"] = final_outfits
        ai_response["saved_outfits"] = saved_outfits

        return ai_response

    except Exception as e:
        return {"success": False, "error": str(e)}