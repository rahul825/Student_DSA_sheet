const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "dsa_sheet_token";

// Fired when the server rejects our token, so the app can log the user out.
export const AUTH_EXPIRED_EVENT = "auth:expired";

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

export async function request(path, { method = "GET", body, params } = {}) {
  const token = tokenStore.get();
  const query = params ? `?${new URLSearchParams(params)}` : "";

  let res;
  try {
    res = await fetch(`${API_URL}${path}${query}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Please check that the API is running.");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}
