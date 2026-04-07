"""
api_main.py
Created by Arsi 03/02/2026
Purpose:
- FastAPI application entry point using your EXISTING project structure.
- Exposes endpoints for:
    - POST /auth/signup
    - POST /auth/login
    - GET  /health

Uses existing logic from:
- src/Services/auth_service.py
- src/Models/SignUpModel.py
- src/Models/LogInModel.py
- src/Connection/connection.py

"""
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from Services.auth_service import login_user

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


@app.get("/")
def root():
    return {"message": "Match-a-Fit API is running"}


@app.post("/login")
def login(data: LoginRequest):
    return login_user(data.email, data.password)