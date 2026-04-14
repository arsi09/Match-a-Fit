"""
outfit_route.py
created by: Arsi 04/13/2026
Purpose:
- Provide an API endpoint that generates outfit suggestions
- This route only runs when the user clicks "Generate Outfits" in the app
"""

# Import APIRouter to define route endpoints
from fastapi import APIRouter

# Import the outfit service
from Services.outfit_ai_service import generate_outfit_recommendations

# Create the router object
router = APIRouter()


@router.get("/generate-outfits/{user_id}")
def generate_outfits_route(user_id: int, occasion: str = None):
    """
    Generate outfit recommendations for a user.

    URL example:
    /generate-outfits/5
    /generate-outfits/5?occasion=Casual
    """

    try:
        # Call the service layer
        return generate_outfit_recommendations(user_id, occasion)

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }