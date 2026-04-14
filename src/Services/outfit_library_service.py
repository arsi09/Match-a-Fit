"""
outfit_library_service.py

Purpose:
- Handles outfit library business logic
- Connects routes to OutfitLibraryModel
"""

from Models.OutfitLibraryModel import OutfitLibraryModel


def get_user_outfits(user_id: int):
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }

    outfits = OutfitLibraryModel.get_outfits_by_user(user_id)

    return {
        "success": True,
        "outfits": outfits
    }


def delete_user_outfit(outfit_id: int, user_id: int):
    if not outfit_id or not user_id:
        return {
            "success": False,
            "error": "Outfit ID and user ID are required"
        }

    deleted = OutfitLibraryModel.delete_outfit(outfit_id, user_id)

    if not deleted:
        return {
            "success": False,
            "error": "Failed to delete outfit"
        }

    return {
        "success": True,
        "message": "Outfit deleted successfully"
    }
