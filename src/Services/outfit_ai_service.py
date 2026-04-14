"""
outfit_ai_service.py
created by: Arsi 04/13/2026
Purpose:
- Pull a user's clothing items from the database
- Prepare image bytes + metadata for Gemini
- Send the prepared items to Gemini
- Return outfit recommendations
"""

# Import the photo upload model so we can read clothing items from the DB
from Models.PhotoUploadModel import PhotoUploadModel

# Import the Gemini client
from Connection.ai_connection import GeminiClient


def get_user_clothing_items_for_ai(user_id: int):
    """
    Get all clothing items for one user and prepare them for Gemini.

    Parameters:
    - user_id: the ID of the user

    Returns:
    - dict containing success flag and prepared clothing items
    """

    # Validate the user ID
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }

    # Get lightweight item list first
    items = PhotoUploadModel.get_all_by_user(user_id)

    # If no items exist, return an error
    if not items:
        return {
            "success": False,
            "error": "No clothing items found for this user"
        }

    # This list will hold full Gemini-ready items
    prepared_items = []

    # Loop through each item summary and fetch the full image record
    for item in items:
        full_item = PhotoUploadModel.get_by_id(item["id"])

        # Skip if the full item was not found
        if not full_item:
            continue

        # Skip if the item has no image bytes
        if not full_item.image:
            continue

        # Build the item structure Gemini needs
        prepared_items.append({
            "id": full_item.id,
            "image_bytes": full_item.image,
            "image_mime": full_item.image_mime,
            "clothing_type": full_item.clothing_type,
            "occasion": full_item.occasion,
            "user_id": full_item.user_id,
            "uploaded_at": full_item.uploaded_at
        })

    # If nothing valid was prepared, return an error
    if not prepared_items:
        return {
            "success": False,
            "error": "No valid clothing images were found for this user"
        }

    return {
        "success": True,
        "items": prepared_items
    }


def generate_outfit_recommendations(user_id: int, occasion: str = None):
    """
    Main service function that:
    1. pulls the user's clothes from the DB
    2. prepares them for Gemini
    3. asks Gemini to generate outfits

    Parameters:
    - user_id: the user's ID
    - occasion: optional occasion filter

    Returns:
    - dict with outfit suggestions or error
    """

    # First pull and prepare the user's clothing items
    clothing_response = get_user_clothing_items_for_ai(user_id)

    # If that failed, return immediately
    if not clothing_response["success"]:
        return clothing_response

    # Extract prepared items
    prepared_items = clothing_response["items"]

    try:
        # Create Gemini client
        gemini = GeminiClient()

        # Send prepared items to Gemini
        ai_response = gemini.generate_outfits(prepared_items, occasion)

        # Return Gemini's result directly for now
        return ai_response

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }