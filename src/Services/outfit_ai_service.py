'''
outfit_ai_service.py
Created by Arsi 04/13/2026
This service prepares a user's uploaded clothing items
and sends them to an AI model so the AI can suggest outfit pairs.

Purpose:
- Pull clothing images from the database
- Organize items by type and occasion
- Prepare image data for AI input
- Send the clothing data to an AI function
- Return outfit recommendations
'''

# Import base64 so image bytes can be converted into strings for AI payloads
import base64

# Import the photo model so we can read clothing items from the DB
from Models.PhotoUploadModel import PhotoUploadModel


def get_user_clothing_items_for_ai(user_id: int):
    """
    Get all clothing items for one user and prepare them for AI use.

    Parameter:
    - user_id: the ID of the logged-in user

    Returns:
    - success response with clothing items prepared for AI
    - error response if no items exist
    """

    # Validate that a user ID was provided
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }

    # Get all clothing items for the user
    items = PhotoUploadModel.get_all_by_user(user_id)

    # If no items were found, return an error
    if not items:
        return {
            "success": False,
            "error": "No clothing items found for this user"
        }

    # Prepare a new list that will contain full AI-ready item data
    ai_ready_items = []

    # Loop through each clothing item
    for item in items:
        # Pull the full item record so we can get the actual image bytes
        full_item = PhotoUploadModel.get_by_id(item["id"])

        # Skip this item if something went wrong
        if not full_item or not full_item.image:
            continue

        # Convert raw image bytes back into base64 string for AI input
        encoded_image = base64.b64encode(full_item.image).decode("utf-8")

        # Add a clean structured item for the AI
        ai_ready_items.append({
            "id": full_item.id,
            "image_base64": encoded_image,
            "image_mime": full_item.image_mime,
            "clothing_type": full_item.clothing_type,
            "occasion": full_item.occasion,
            "user_id": full_item.user_id,
            "uploaded_at": full_item.uploaded_at
        })

    # If all items failed to load properly, return an error
    if not ai_ready_items:
        return {
            "success": False,
            "error": "No valid clothing images were found"
        }

    # Return the AI-ready clothing items
    return {
        "success": True,
        "items": ai_ready_items
    }


def group_clothing_items(items: list):
    """
    Group clothing items by clothing type.

    Parameter:
    - items: list of AI-ready clothing items

    Returns:
    - dictionary where keys are clothing types
      and values are lists of items in that category
    """

    # Create an empty dictionary for grouped clothing
    grouped = {}

    # Loop through each item
    for item in items:
        # Normalize the clothing type
        clothing_type = str(item.get("clothing_type", "")).strip().lower()

        # Skip items with missing type
        if not clothing_type:
            continue

        # If this type is not already in the dictionary, create a list for it
        if clothing_type not in grouped:
            grouped[clothing_type] = []

        # Add the item to the correct clothing type group
        grouped[clothing_type].append(item)

    return grouped


def build_ai_prompt(grouped_items: dict, occasion: str = None):
    """
    Build a text prompt for the AI model.

    Parameters:
    - grouped_items: clothing items grouped by type
    - occasion: optional occasion filter like Casual or Formal

    Returns:
    - text prompt string
    """

    # Start building the prompt
    prompt = (
        "You are a fashion outfit assistant. "
        "Based on the uploaded clothing items, create matching outfit pairs. "
        "Try to combine tops, bottoms, shoes, and outerwear when available. "
        "Only use the clothing items provided. "
    )

    # If an occasion is provided, include it in the prompt
    if occasion:
        prompt += f"Focus on outfits appropriate for the occasion: {occasion}. "

    # Add instructions for the output format
    prompt += (
        "Return outfit suggestions as a structured list. "
        "For each outfit, include the item IDs used and a short explanation of why the items match."
    )

    return prompt


def send_items_to_ai(items: list, occasion: str = None):
    """
    Send the prepared clothing items to the AI model.

    Parameters:
    - items: list of AI-ready clothing items
    - occasion: optional occasion filter

    Returns:
    - success response with AI outfit suggestions
    - error response if something goes wrong

    NOTE:
    This function currently contains a placeholder implementation.
    Replace the mock AI section with your real AI API call later.
    """

    # Group the clothing items by type
    grouped_items = group_clothing_items(items)

    # Build the text instructions for the AI
    prompt = build_ai_prompt(grouped_items, occasion)

    try:
        # ---------------------------------------------------------
        # PLACEHOLDER AI LOGIC
        # ---------------------------------------------------------
        # Right now, this section mocks what the AI would do.
        # Later, you will replace this with a real AI API call.
        #
        # Example future flow:
        # - Send prompt
        # - Send image_base64 for each item
        # - Ask AI to return matching outfit combinations
        # ---------------------------------------------------------

        mock_outfits = []

        # Example simple pairing logic:
        # Pair first shirt/top with first pants/bottom if they exist
        tops = grouped_items.get("shirt", []) + grouped_items.get("top", [])
        bottoms = grouped_items.get("pants", []) + grouped_items.get("shorts", []) + grouped_items.get("jeans", [])

        # If at least one top and one bottom exist, create a simple outfit suggestion
        if tops and bottoms:
            mock_outfits.append({
                "outfit_name": "Suggested Outfit 1",
                "items": [
                    {
                        "id": tops[0]["id"],
                        "clothing_type": tops[0]["clothing_type"]
                    },
                    {
                        "id": bottoms[0]["id"],
                        "clothing_type": bottoms[0]["clothing_type"]
                    }
                ],
                "explanation": "These items were paired because they form a basic top-and-bottom outfit combination."
            })

        # Return the mocked AI result
        return {
            "success": True,
            "prompt_used": prompt,
            "outfits": mock_outfits
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_outfit_recommendations(user_id: int, occasion: str = None):
    """
    Main function to generate outfit recommendations for one user.

    Parameters:
    - user_id: the ID of the logged-in user
    - occasion: optional occasion filter

    Returns:
    - success response with outfit suggestions
    - error response if something fails
    """

    # First, pull the user's clothing items from the database
    clothing_response = get_user_clothing_items_for_ai(user_id)

    # If pulling the items failed, return that error immediately
    if not clothing_response["success"]:
        return clothing_response

    # Extract the prepared items
    items = clothing_response["items"]

    # Send those items to the AI logic
    return send_items_to_ai(items, occasion)