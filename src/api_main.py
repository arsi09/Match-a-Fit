"""
api_main.py
Created by Arsi 03/02/2026

Purpose:
- FastAPI application entry point using your EXISTING project structure
- Exposes endpoints for:
    - POST /signup
    - POST /login
    - GET /health
- Includes the photo upload routes from the route file
"""

# Import FastAPI to create the backend app
from fastapi import FastAPI

# Import BaseModel so FastAPI can validate JSON request bodies
from pydantic import BaseModel

# Import CORS middleware so the frontend can access the backend
from fastapi.middleware.cors import CORSMiddleware

# Import your existing auth service functions
from Services.auth_service import login_user, sign_up_user

# Import the photo upload router
from Routes.photo_upload_route import router as photo_upload_router

# Import the outfit generation router
from Routes.Outfit_route import router as outfit_router

# Import the outfit library router
from Routes.outfit_library_route import router as outfit_library_router

#Import the view closet router
from Routes.view_closet_route import router as view_closet_router


# Create the FastAPI app
app = FastAPI()

# Allow requests from your frontend app
# This is useful while testing with React Native / Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    """
    Expected request body for login.
    """
    email: str
    password: str


class SignUpRequest(BaseModel):
    """
    Expected request body for signup.
    """
    firstName: str
    lastName: str
    phnNumber: str
    email: str
    password: str
    confirmPassword: str
    age: int
    gender: str


@app.get("/")
def root():
    """
    Simple route to confirm the API is running.
    """
    return {"message": "Match-a-Fit API is running"}


@app.get("/health")
def health():
    """
    Health check route.
    """
    return {"status": "ok"}


@app.post("/login")
def login(data: LoginRequest):
    """
    Log in a user using email and password.
    """
    return login_user(data.email, data.password)


@app.post("/signup")
def signup(data: SignUpRequest):
    """
    Create a new user account.
    """
    return sign_up_user(
        first_name=data.firstName,
        last_name=data.lastName,
        phn_number=data.phnNumber,
        email=data.email,
        password=data.password,
        confirm_password=data.confirmPassword,
        age=data.age,
        gender=data.gender,
    )

# Add the outfit generation routes to the app
app.include_router(outfit_router)

# Add all photo upload routes to the app
# This includes:
# - POST /photo-upload
# - GET /photo-upload/{item_id}
# - GET /photo-upload/user/{user_id}
# - DELETE /photo-upload/{item_id}
app.include_router(photo_upload_router)

# Add all outfit generation routes to the app
app.include_router(outfit_router)

# Add all outfit library routes to the app
app.include_router(outfit_library_router)

# Add all view closet routes to the app
app.include_router(view_closet_router)