/**
 * Controllers/AuthController.JS
 * Frontend controller responsible for auth-related API calls.
 * - signUp(payload): POST /auth/signup
 * Returns a normalized object: { success: boolean, message?: string, data?: any, error?: string }
 *
 * NOTE: move `API_BASE` to a shared config (`View/Services/Config/apiConfig.js`) when available.
 */

const API_BASE = 'https://vditmcedjuuphmalidpw.supabase.com'; // change to your backend URL or use apiConfig

async function signUp(payload) {
  if (!payload || !payload.email || !payload.password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      // ignore JSON parse errors
    }

    if (!res.ok) {
      const errorMsg = body && body.message ? body.message : (body && body.error ? body.error : `Request failed with status ${res.status}`);
      return { success: false, error: errorMsg };
    }

    return { success: true, message: body?.message || 'Account created', data: body };
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
}

module.exports = { signUp };