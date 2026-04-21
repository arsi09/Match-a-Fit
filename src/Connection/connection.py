"""
connection.py
made by: Arsi 
This module provides:
- A shared (singleton) Supabase client connection
- Thread-safe initialization
- Environment variable loading (.env support)
- A test function to verify database connectivity

Project: Match-a-Fit
"""

# Enables forward type hints (optional but clean)
from __future__ import annotations

# Standard library imports
import os                     # Used for reading environment variables
import threading              # Used to make client initialization thread-safe
import psycopg2               # Used for raw PostgreSQL connections (BYTEA support)
from typing import Tuple, Any, Optional  # Type hints
from dotenv import load_dotenv
# Supabase Python SDK
from supabase import create_client, Client



# ------------------------------------------------------------
# Load Environment Variables (.env support)
# ------------------------------------------------------------
# If python-dotenv is installed, this will load variables
# from a ".env" file into the environment automatically.
# If dotenv is not installed, the code will continue silently.
try:
    from dotenv import load_dotenv
    from pathlib import Path
    # Walk up directories until .env is found (handles any nesting depth)
    env_path = Path(__file__).resolve().parent
    while env_path != env_path.parent:
        candidate = env_path / ".env"
        if candidate.exists():
            load_dotenv(candidate)
            break
        env_path = env_path.parent
except Exception:
    print("Warning: python-dotenv is not installed or .env file not found. Environment variables may not be loaded.")
    pass


# ------------------------------------------------------------
# Configuration Variables
# ------------------------------------------------------------
# These read from environment variables.
DEFAULT_SUPABASE_URL = os.getenv("SUPABASE_URL").strip() 
DEFAULT_SUPABASE_KEY = os.getenv("SUPABASE_KEY").strip() 

#print("SUPABASE_KEY exists:", bool(DEFAULT_SUPABASE_KEY))

# ------------------------------------------------------------
# Validation Function
# ------------------------------------------------------------
def _validate_config(url: str, key: str) -> None:
    """
    Validates that Supabase URL and key exist and look correct.

    Raises ValueError if configuration is invalid.
    """

    # Check if URL is missing
    if not url:
        raise ValueError(
            "SUPABASE_URL is empty.\n"
            "Add it to your .env file or environment variables.\n"
            "Example:\n"
            "SUPABASE_URL=https://<project-ref>.supabase.co"
        )

    # Check if key is missing
    if not key:
        raise ValueError(
            "SUPABASE_KEY is empty.\n"
            "Add it to your .env file or environment variables."
        )

    # Basic sanity check for URL format
    if not url.startswith("https://") or ".supabase.co" not in url:
        raise ValueError(
            f"SUPABASE_URL looks incorrect: {url}\n"
            "Expected format: https://<project-ref>.supabase.co"
        )


# ------------------------------------------------------------
# Singleton Client Setup (Thread-Safe)
# ------------------------------------------------------------

# This variable will hold the cached Supabase client.
# It starts as None and gets created only once.
_supabase_client: Optional[Client] = None

# This lock prevents race conditions in multi-threaded apps.
_supabase_lock = threading.Lock()


def get_supabase_client(url: Optional[str] = None, key: Optional[str] = None) -> Client:
    """
    Returns a Supabase Client instance.

    Behavior:
    - If url or key are passed → create a temporary client (no caching).
    - Otherwise → create a single shared client (cached) and reuse it.

    This makes it efficient and thread-safe.
    """
    global _supabase_client

    # --------------------------------------------------------
    # Case 1: Temporary / Override Client
    # --------------------------------------------------------
    # If caller provides custom url or key,
    # create a one-time client and return it.
    if url is not None or key is not None:
        use_url = (url or DEFAULT_SUPABASE_URL).strip()
        use_key = (key or DEFAULT_SUPABASE_KEY).strip()

        # Validate before creating client
        _validate_config(use_url, use_key)

        return create_client(use_url, use_key)

    # --------------------------------------------------------
    # Case 2: Cached Singleton Client
    # --------------------------------------------------------
    # If client hasn't been created yet, create it safely.
    if _supabase_client is None:

        # Lock prevents two threads from creating client simultaneously
        with _supabase_lock:

            # Double-check pattern (important for thread safety)
            if _supabase_client is None:

                # Validate configuration
                _validate_config(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY)

                # Create and cache client
                _supabase_client = create_client(
                    DEFAULT_SUPABASE_URL,
                    DEFAULT_SUPABASE_KEY
                )

    # Return cached client
    return _supabase_client


# ------------------------------------------------------------
# Connection Test Function
# ------------------------------------------------------------
def test_connection(
    client: Optional[Client] = None,
    tables: Optional[list[str]] = None,
) -> Tuple[bool, Any]:
    """
    Tests connectivity to Supabase by querying a table.

    Returns:
        (True, data) if successful
        (False, error_info) if failed

    Important Notes:
    - If Row Level Security (RLS) is enabled,
      you may get permission errors.
    - If the table does not exist,
      you will get a "relation does not exist" error.
    """

    # Use provided client or create/get cached one
    client = client or get_supabase_client()

    # Choose which table(s) to test
    # Default is "clothing_items" unless overridden via environment variable
    default_table = os.getenv("SUPABASE_TEST_TABLE", "clothing_items").strip()
    candidate_tables = tables or [default_table]

    last_error: Any = None

    # Try each candidate table
    for table in candidate_tables:
        try:
            # Perform lightweight query
            res = client.table(table).select("*").limit(1).execute()

            # Check for Supabase-level error
            err = getattr(res, "error", None)

            if err:
                # Save error but continue trying other tables
                last_error = {"table": table, "error": err}
                continue

            # Success
            return True, {
                "table": table,
                "data": getattr(res, "data", None)
            }

        except Exception as e:
            # Catch transport/network or SDK exceptions
            last_error = {"table": table, "exception": str(e)}
            continue

    # If all tables fail, return last error encountered
    return False, last_error or "Unknown error"


# ------------------------------------------------------------
# Raw PostgreSQL Connection
# ------------------------------------------------------------
def get_db_connection():
    """
    Returns a raw PostgreSQL connection.

    Use this for models that need:
    - conn.cursor()
    - cursor.execute(...)
    - BYTEA image storage
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "").strip(),
        port=os.getenv("DB_PORT", "5432").strip(),
        dbname=os.getenv("DB_NAME", "").strip(),
        user=os.getenv("DB_USER", "").strip(),
        password=os.getenv("DB_PASSWORD", "").strip(),
        sslmode="require"
    )


# ------------------------------------------------------------
# CLI Debug Mode
# ------------------------------------------------------------
# If you run this file directly:
# python connection.py
#
# It will attempt to connect and print debug info.
if __name__ == "__main__":

    # Show current working directory
    print("Current Working Directory:", os.getcwd())

    # Show whether environment variables loaded (without exposing secrets)
    print("SUPABASE_URL set:", bool(DEFAULT_SUPABASE_URL))
    print("SUPABASE_KEY set:", bool(DEFAULT_SUPABASE_KEY))

    if DEFAULT_SUPABASE_URL:
        print("SUPABASE_URL:", DEFAULT_SUPABASE_URL)

    try:
        # Attempt to create client
        cli_client = get_supabase_client()

        # Run test
        ok, info = test_connection(cli_client)

        if ok:
            print("\nSupabase connection: OK")
            print(info)
        else:
            print("\nSupabase connection: FAILED")
            print(info)

    except Exception as e:
        print("\nSupabase connection: FAILED (configuration error)")
        print(str(e))


