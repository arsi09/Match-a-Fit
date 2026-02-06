from Connection.connection import get_supabase_client
import sys
import os

from typing import List, Dict, Any, Optional


def fetch_user_names(limit: int = 10) -> List[Dict[str, Any]]:
	"""Return a list of rows with `first_name` and `last_name` from `users` table.

	The function returns an empty list on error and prints the error to stdout.
	"""
	client = get_supabase_client()
	try:
		# request only the two fields we need
		res = client.table("users").select("first_name,last_name").limit(limit).execute()
		if getattr(res, "error", None):
			print("Supabase error:", res.error)
			return []
		return res.data or []
	except Exception as e:
		print("Exception while querying Supabase:", e)
		return []


if __name__ == "__main__":
	rows = fetch_user_names(limit=5)
	if not rows:
		print("No rows returned or an error occurred.")
	else:
		for r in rows:
			fn = r.get("first_name") or r.get("firstName") or r.get("firstname")
			ln = r.get("last_name") or r.get("lastName") or r.get("lastname")
			print(fn, ln)
