'''
photo_upload_service.py

This module provides photo upload services for the Match-a-Fit app.

Purpose:
- Validate uploaded clothing photo data
- Pass clean data to the PhotoUploadModel
- Return responses back to the route layer
'''

# Import the model that talks to the database
from Models.PhotoUploadModel import PhotoUploadModel


def upload_photo(
    image_bytes: bytes,
    image_filename: str,
    image_mime: str,
    clothing_type: str,
    occasion: str,
    user_id: int
):
    """
    Validate and save one uploaded clothing photo.

    Parameters:
    - image_bytes: actual image data in bytes
    - image_filename: original file name, like shirt.jpg
    - image_mime: image type, like image/jpeg
    - clothing_type: type of clothing, like Shirt or Pants
    - occasion: clothing occasion, like Casual or Formal
    - user_id: ID of the user uploading the image

    Returns:
    - success response from the model if saved
    - error response if required data is missing
    """

    # Make sure an image was actually uploaded
    if not image_bytes:
        return {
            "success": False,
            "error": "Image is required"
        }

    # Make sure the file has a name
    if not image_filename:
        return {
            "success": False,
            "error": "Image filename is required"
        }

    # Make sure the file type exists
    if not image_mime:
        return {
            "success": False,
            "error": "Image MIME type is required"
        }

    # Make sure the clothing type was provided
    if not clothing_type or not str(clothing_type).strip():
        return {
            "success": False,
            "error": "Clothing type is required"
        }

    # Make sure the occasion was provided
    if not occasion or not str(occasion).strip():
        return {
            "success": False,
            "error": "Occasion is required"
        }

    # Make sure the user_id exists
    if user_id is None:
        return {
            "success": False,
            "error": "User ID is required"
        }

    # Clean up text values before saving
    cleaned_clothing_type = str(clothing_type).strip()
    cleaned_occasion = str(occasion).strip()

    # Call the model to save the uploaded photo into the database
    return PhotoUploadModel.create(
        image_bytes=image_bytes,
        image_filename=image_filename,
        image_mime=image_mime,
        clothing_type=cleaned_clothing_type,
        occasion=cleaned_occasion,
        user_id=user_id
    )


def get_photo_by_id(item_id: int):
    """
    Get one uploaded clothing item by its ID.

    Parameter:
    - item_id: ID of the uploaded clothing item

    Returns:
    - PhotoUploadModel object if found
    - None if not found
    """

    # Make sure the item ID is valid
    if not item_id:
        return None

    # Ask the model for the item
    return PhotoUploadModel.get_by_id(item_id)


def get_photos_by_user(user_id: int):
    """
    Get all uploaded clothing items for one user.

    Parameter:
    - user_id: ID of the user

    Returns:
    - success response with list of items
    - error response if user_id is missing
    """

    # Make sure the user_id exists
    if not user_id:
        return {
            "success": False,
            "error": "User ID is required"
        }

    # Get all uploaded items for that user
    items = PhotoUploadModel.get_all_by_user(user_id)

    # Return the result in a consistent format
    return {
        "success": True,
        "items": items
    }


def delete_photo(item_id: int):
    """
    Delete one uploaded clothing item by its ID.

    Parameter:
    - item_id: ID of the uploaded clothing item

    Returns:
    - success or error response from the model
    """

    # Make sure the item ID was provided
    if not item_id:
        return {
            "success": False,
            "error": "Item ID is required"
        }

    # Call the model to delete the item
    return PhotoUploadModel.delete(item_id)