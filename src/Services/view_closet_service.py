"""
view_closet_service.py

Purpose:
- Handles closet business logic
- Connects routes to ViewClosetModel
"""

from Models.ViewClosetModel import ViewClosetModel


def get_user_clothing_items(user_id: int):
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }

    items = ViewClosetModel.get_items_by_user_id(user_id)

    return {
        "success": True,
        "items": items
    }


def delete_user_clothing_item(item_id: int, user_id: int):
    if not item_id or not user_id:
        return {
            "success": False,
            "error": "Item ID and user ID are required"
        }

    deleted = ViewClosetModel.delete_item(item_id, user_id)

    if not deleted:
        return {
            "success": False,
            "error": "Failed to delete clothing item"
        }

    return {
        "success": True,
        "message": "Clothing item deleted successfully"
    }