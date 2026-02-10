import sys
import os

# Ensure the parent `src` directory is on sys.path so `from Connection...` works
this_dir = os.path.dirname(os.path.abspath(__file__))
src_root = os.path.abspath(os.path.join(this_dir, ".."))
if src_root not in sys.path:
	sys.path.insert(0, src_root)

# Filter out leftover debug lines from any imported module
_orig_stdout = sys.stdout
class _FilterStdout:
	def write(self, s):
		try:
			if isinstance(s, str) and (
				s.startswith("DEBUG: response type:") or
				s.startswith("DEBUG: hasattr data:") or
				s.startswith("DEBUG: getattr error:")
			):
				return
		except Exception:
			pass
		_orig_stdout.write(s)
	def flush(self):
		_orig_stdout.flush()
sys.stdout = _FilterStdout()

from Connection.connection import get_supabase_client

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
