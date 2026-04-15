"""
view_closet_route.py

Purpose:
- Get all closet items for one user
- Delete a closet item
"""

from fastapi import APIRouter, HTTPException
from Models.ViewClosetModel import ViewClosetModel

router = APIRouter(
    prefix="/view-closet",
    tags=["view-closet"]
)


@router.get("/user/{user_id}")
def get_user_closet(user_id: int):
    try:
        items = ViewClosetModel.get_items_by_user_id(user_id)
        return {"items": items}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/{item_id}")
def delete_closet_item(item_id: int):
    try:
        ViewClosetModel.delete_item(item_id)
        return {"success": True}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))