"""
view_closet_route.py

Purpose:
- API routes for closet items
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel

from Services.view_closet_service import (
    get_user_clothing_items,
    delete_user_clothing_item,
)

router = APIRouter(
    prefix="/view-closet",
    tags=["View Closet"]
)


class DeleteClothingItemRequest(BaseModel):
    item_id: int
    user_id: int


@router.get("/user/{user_id}")
def load_clothing_items(
    user_id: int,
    page: int = Query(1),
    limit: int = Query(10)
):
    return get_user_clothing_items(user_id, page, limit)


@router.delete("/delete")
def delete_clothing_item(payload: DeleteClothingItemRequest):
    return delete_user_clothing_item(payload.item_id, payload.user_id)