"""
outfit_library_route.py

Purpose:
- API routes for outfit library
"""

from fastapi import APIRouter
from pydantic import BaseModel

from Services.outfit_library_service import get_user_outfits, delete_user_outfit

router = APIRouter(
    prefix="/outfit-library",
    tags=["Outfit Library"]
)


class DeleteOutfitRequest(BaseModel):
    outfit_id: int
    user_id: int


@router.get("/user/{user_id}")
def load_outfits(user_id: int):
    return get_user_outfits(user_id)


@router.delete("/delete")
def delete_outfit(payload: DeleteOutfitRequest):
    return delete_user_outfit(payload.outfit_id, payload.user_id)