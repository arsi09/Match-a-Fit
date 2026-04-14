'''
outfit_route.py

Created by Arsi 04/13/2026

This module provides API routes for generating outfit recommendations.

Purpose:
- Trigger AI outfit generation ONLY when user requests it
- Call the outfit AI service
- Return outfit suggestions to the frontend
'''

from fastapi import APIRouter

# Import the main function from your AI service
from Services.outfit_ai_service import generate_outfit_recommendations

# Create router
router = APIRouter()


@router.get("/generate-outfits/{user_id}")
def generate_outfits_route(user_id: int, occasion: str = None):
    """
    Generate outfit recommendations for a user.

    Parameters:
    - user_id: ID of the user
    - occasion: optional (Casual, Formal, Gym, etc.)

    This route ONLY runs when the frontend calls it.
    """

    try:
        # Call the AI service
        return generate_outfit_recommendations(user_id, occasion)

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }