"""
outfit_ai_service.py

Purpose:
- Pull a user's clothing items from the database
- Prepare image bytes + metadata for Gemini
- Send the prepared items to Gemini
- Return outfit recommendations
"""

import json

from Models.PhotoUploadModel import PhotoUploadModel
from Connection.ai_connection import GeminiClient
from Services.prompts import assemble_styling_prompt


def get_user_clothing_items_for_ai(user_id: int, occasion: str = None):
    """
    Get clothing items and prepare them for Gemini.
    Filters by occasion before sending items to the AI.
    """
    if not user_id:
        return {"success": False, "error": "User ID is required"}

    items = PhotoUploadModel.get_all_by_user(user_id)

    if not items:
        return {"success": False, "error": "No clothing items found."}

    prepared_items = []

    for item in items:
        full_item = PhotoUploadModel.get_by_id(item["id"])

        if not full_item or not full_item.image:
            continue

        if occasion:
            item_occasion = (full_item.occasion or "").strip().lower()
            requested_occasion = occasion.strip().lower()

            # Allow exact match, versatile, or all
            if item_occasion not in [requested_occasion, "versatile", "all"]:
                continue

        prepared_items.append({
            "id": full_item.id,
            "image_bytes": full_item.image,   # already decoded in PhotoUploadModel.get_by_id()
            "image_mime": full_item.image_mime,
            "clothing_type": full_item.clothing_type,
            "occasion": full_item.occasion
        })

    if not prepared_items:
        return {
            "success": False,
            "error": "No matching clothing items found for this occasion."
        }

    return {"success": True, "items": prepared_items}


def generate_outfit_recommendations(user_id: int, occasion: str, weather: str = None):
    """
    Main service function.
    Builds the prompt, sends data to Gemini, and parses the AI response.
    """
    clothing_response = get_user_clothing_items_for_ai(user_id, occasion)

    if not clothing_response["success"]:
        return clothing_response

    prepared_items = clothing_response["items"]

    try:
        text_prompt = assemble_styling_prompt(occasion, weather)

        gemini = GeminiClient()
        ai_response = gemini.generate_outfits(prepared_items, text_prompt)

        if ai_response.get("success"):
            try:
                ai_response["outfits"] = json.loads(ai_response["response_text"])
            except Exception:
                ai_response["outfits"] = []

        return ai_response

    except Exception as e:
        return {"success": False, "error": str(e)}