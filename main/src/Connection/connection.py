'''
connection.py
Python
This module provides a shared Supabase client connection and a simple test function to verify connectivity.
for Match-a-Fit app
written by Juan Marco Saca Dada
02/06/2025
'''

from supabase import create_client, Client
import os
import threading
from typing import Tuple, Any, Optional
try:
	# optional: load .env into environment if present
	from dotenv import load_dotenv
	load_dotenv()
except Exception:
	pass


# Default to environment variables but fall back to the provided values
DEFAULT_SUPABASE_URL = os.getenv(
	"SUPABASE_URL",
	"https://vditmcedjuuphmalidpw.supabase.co",
)
DEFAULT_SUPABASE_KEY = os.getenv(
	"SUPABASE_KEY",
	"sb_publishable_lu1DZ3v-baU8XzzQgVEGtA_xJHM8eAG",
)


_supabase_client: Optional[Client] = None
_supabase_lock = threading.Lock()


def get_supabase_client(url: Optional[str] = None, key: Optional[str] = None) -> Client:
		"""Return a shared Supabase `Client`.

		- If `url` or `key` are provided, a new client for those values is returned
			(useful for testing or temporary connections).
		- Otherwise a module-level cached client is created once and reused
			(thread-safe).
		"""
		global _supabase_client
		# Explicit override: create a one-off client
		if url or key:
				use_url = url or DEFAULT_SUPABASE_URL
				use_key = key or DEFAULT_SUPABASE_KEY
				return create_client(use_url, use_key)

		# Return cached client (create if necessary)
		if _supabase_client is None:
				with _supabase_lock:
						if _supabase_client is None:
								_supabase_client = create_client(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY)
		return _supabase_client


def test_connection(client: Optional[Client] = None) -> Tuple[bool, Any]:
	"""Run a lightweight test against the Supabase REST API.

	This queries a small slice of a likely table (`profiles`) and returns a tuple
	(success: bool, response_or_error).
	If the table doesn't exist the request may still succeed but return an error
	object — this function treats any transport/exception as a failure.
	"""
	client = client or get_supabase_client()
	candidate_tables = ["profiles", "outfits", "users"]
	last_error = None
	for table in candidate_tables:
		try:
			res = client.table(table).select("*").limit(1).execute()
			if getattr(res, "error", None):
				last_error = res.error
				# If table wasn't found, try the next candidate
				continue
			return True, {"table": table, "data": res.data}
		except Exception as e:
			last_error = str(e)
			continue
	return False, last_error or "No candidate tables found or unknown error"


if __name__ == "__main__":
	# Quick CLI test when run directly
	cli_client = get_supabase_client()
	ok, info = test_connection(cli_client)
	if ok:
		print("Supabase connection: OK")
		print(info)
	else:
		print("Supabase connection: FAILED")
		print(info)

