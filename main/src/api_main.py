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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

# Load .env (optional, matches connection.py behavior)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Import your existing auth functions
from Services.auth_service import sign_up, authenticate_user

#  Import schemas 
from Models.api_schemas import SignUpRequest, LoginRequest, AuthResponse, UserOut

# JWT helper (new file we added)
from Services.jwt_service import create_access_token


def _get_cors_origins() -> list[str]:
    """
    _get_cors_origins()

    Purpose:
        Reads allowed CORS origins from env for React Native / browser clients.

    Behavior:
        - If CORS_ORIGINS is missing: defaults to "*" (allow all)
        - If set: expects comma-separated origins
          Example:
            CORS_ORIGINS=http://localhost:3000,http://192.168.1.25:19006

    Returns:
        List[str] of allowed origins
    """
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*" or raw == "":
        return ["*"]
    return [x.strip() for x in raw.split(",") if x.strip()]


app = FastAPI(title="Match-a-Fit API")

# Enable CORS so your React Native app can call this server
origins = _get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """
    health()

    Purpose:
        Quick sanity endpoint to confirm the server is running.

    Returns:
        { "ok": True }
    """
    return {"ok": True}


@app.post("/auth/signup", response_model=AuthResponse)
def api_signup(payload: SignUpRequest):
    """
    api_signup(payload)

    Purpose:
        HTTP endpoint that creates a new user account.

    What it does:
        1. Confirms password == confirmPassword (server-side check)
        2. Calls your existing Services.auth_service.sign_up(...)
        3. Interprets the result from sign_up():
            - If success False: raise HTTP 400 with error message
            - If success True: extract the inserted user record
        4. Creates a JWT token
        5. Returns:
            { token: "...", user: {...} }

    Important:
        Your current sign_up() returns a dict like:
            {"success": True, "message": "...", "data": inserted.data}

        Where inserted.data is usually a list of inserted rows.
    """

    # Always verify confirmPassword server-side
    if payload.password != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = sign_up(
        email=str(payload.email),
        password=payload.password,
        age=payload.age,
        gender=payload.gender,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )

    # sign_up() does NOT raise exceptions for validation failures,
    # it returns success False. So we convert that to an HTTP error.
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Signup failed"))

    # Supabase insert result is typically a list of inserted rows
    data = result.get("data") or []
    if isinstance(data, list) and len(data) > 0:
        row = data[0]
    elif isinstance(data, dict):
        row = data
    else:
        # If the insert succeeded but returned no row data, we can't build a proper response
        raise HTTPException(status_code=500, detail="Signup succeeded but no user data was returned")

    # Ensure required fields exist
    if "id" not in row or "email" not in row:
        raise HTTPException(status_code=500, detail="User record missing required fields (id/email)")

    user_out = UserOut(
        id=int(row["id"]),
        email=row["email"],
        age=row.get("age"),
        gender=row.get("gender"),
        first_name=row.get("first_name"),
        last_name=row.get("last_name"),
    )

    token = create_access_token(user_id=user_out.id, email=user_out.email)

    return AuthResponse(token=token, user=user_out)


@app.post("/auth/login", response_model=AuthResponse)
def api_login(payload: LoginRequest):
    """
    api_login(payload)

    Purpose:
        HTTP endpoint that authenticates an existing user.

    What it does:
        1. Calls your existing Services.auth_service.authenticate_user(...)
           - Returns a LogInModel instance on success
           - Returns None on failure
        2. If user is None -> HTTP 401 Invalid credentials
        3. If user is valid -> create JWT token
        4. Returns:
            { token: "...", user: {...} }

    Notes about your current LogInModel:
        It selects only:
          id, first_name, last_name, email, password_hash, salt
        So this endpoint can return first_name/last_name/email/id reliably.
        age/gender are not in LogInModel (unless you expand the SELECT later).
    """

    user = authenticate_user(email=str(payload.email), password=payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Convert LogInModel -> UserOut
    user_out = UserOut(
        id=int(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
    )

    token = create_access_token(user_id=user_out.id, email=user_out.email)

    return AuthResponse(token=token, user=user_out)