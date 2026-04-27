from fastapi import APIRouter
from pydantic import BaseModel
from Services.profile_service import (
    get_user_profile,
    update_user_profile,
    change_user_password,
)

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileUpdateRequest(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    phnNumber: str | None = None
    email: str | None = None
    age: str | None = None
    gender: str | None = None


class PasswordUpdateRequest(BaseModel):
    currentPassword: str
    newPassword: str


@router.get("/{user_id}")
def get_profile(user_id: int):
    return get_user_profile(user_id)


@router.put("/{user_id}")
def update_profile(user_id: int, request: ProfileUpdateRequest):
    return update_user_profile(user_id, request.dict())


@router.put("/{user_id}/password")
def change_password(user_id: int, request: PasswordUpdateRequest):
    return change_user_password(user_id, request.dict())