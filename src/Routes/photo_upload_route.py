'''
photo_upload_route.py

This module provides API routes for photo uploads.

Purpose:
- Receive uploaded clothing photos from the frontend
- Pass the data to the photo upload service
- Return responses back to the frontend
'''

# Import FastAPI tools for routes and file uploads
from fastapi import APIRouter, UploadFile, File, Form

# Import Response so image bytes can be sent back directly
from fastapi.responses import Response

# Import the service functions
from Services.photo_upload_service import (
    upload_photo,
    get_photo_by_id,
    get_photos_by_user,
    delete_photo
)

# Create a router object for photo upload routes
router = APIRouter()


@router.post("/photo-upload")
async def upload_photo_route(
    user_id: int = Form(...),
    clothing_type: str = Form(...),
    occasion: str = Form(...),
    image: UploadFile = File(...)
):
    """
    Upload one clothing photo and save it in the database.

    Expected form data:
    - user_id
    - clothing_type
    - occasion
    - image
    """
    try:
        # Read the uploaded file into raw bytes
        image_bytes = await image.read()

        # Send the data to the service layer
        return upload_photo(
            image_bytes=image_bytes,
            image_filename=image.filename,
            image_mime=image.content_type,
            clothing_type=clothing_type,
            occasion=occasion,
            user_id=user_id
        )

    except Exception as e:
        # Return an error if something goes wrong
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/photo-upload/{item_id}")
def get_photo_route(item_id: int):
    """
    Return the actual image bytes for one uploaded clothing item.
    """
    try:
        # Ask the service for the item
        item = get_photo_by_id(item_id)

        # If no item exists, return an error
        if not item:
            return {
                "success": False,
                "error": "Item not found"
            }

        # Return the raw image bytes with the correct MIME type
        return Response(
            content=item.image,
            media_type=item.image_mime
        )

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/photo-upload/user/{user_id}")
def get_user_photos_route(user_id: int):
    """
    Return all uploaded clothing items for one user.
    """
    try:
        # Ask the service for all uploaded items for this user
        return get_photos_by_user(user_id)

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.delete("/photo-upload/{item_id}")
def delete_photo_route(item_id: int):
    """
    Delete one uploaded clothing item by its ID.
    """
    try:
        # Ask the service to delete the item
        return delete_photo(item_id)

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }