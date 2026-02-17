"""FastAPI application for Match-a-Fit (development server)

Endpoints:
- POST /auth/signup -> delegates to Services.auth_service.sign_up

Run locally with:
  uvicorn app:app --reload --port 8000

The `Connection.connection.get_supabase_client()` is reused for DB access.
"""
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field

from Services import auth_service

app = FastAPI(title="Match-a-Fit API (dev)")


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    age: Optional[int] = None
    gender: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


@app.post("/auth/signup")
async def signup(payload: SignUpRequest):
    result = auth_service.sign_up(
        email=payload.email,
        password=payload.password,
        age=payload.age,
        gender=payload.gender,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error") or "Sign up failed")

    return {"message": result.get("message"), "data": result.get("data")}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)