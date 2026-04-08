"""
api_main.py
Created by Arsi 03/02/2026
Purpose:
- FastAPI application entry point using your EXISTING project structure.
- Exposes endpoints for:
    - POST /signup
    - POST /login
    - GET  /health
"""

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from Services.auth_service import login_user, sign_up_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    password: str
    confirmPassword: str
    age: int
    gender: str


@app.get("/")
def root():
    return {"message": "Match-a-Fit API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/login")
def login(data: LoginRequest):
    return login_user(data.email, data.password)


@app.post("/signup")
def signup(data: SignUpRequest):
    return sign_up_user(
        email=data.email,
        password=data.password,
        confirm_password=data.confirmPassword,
        age=data.age,
        gender=data.gender,
    )