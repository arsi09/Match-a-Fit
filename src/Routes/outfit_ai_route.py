"""
outfit_ai_route.py

Purpose:
- Expose AI outfit generation endpoint
- Accept user_id, occasion, and optional weather
- Return outfit recommendations from the AI service
"""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from Services.outfit_ai_service import generate_outfit_recommendations

router = APIRouter(prefix="/outfits", tags=["AI Outfits"])


class OutfitGenerationRequest(BaseModel):
    user_id: int
    occasion: str
    weather: Optional[str] = None


@router.post("/generate")
def generate_outfit(request: OutfitGenerationRequest):
    """
    Generate outfit recommendations for a user based on their closet.
    Weather is optional and is passed directly into the prompt.
    """
    return generate_outfit_recommendations(
        user_id=request.user_id,
        occasion=request.occasion,
        weather=request.weather
    )