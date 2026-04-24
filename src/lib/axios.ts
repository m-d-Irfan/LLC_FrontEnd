import axios from "axios";
import Cookies from "js-cookie";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://llc-backend-rpyz.onrender.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});


// ── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("educore_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: token refresh on 401 ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = Cookies.get("educore_refresh");
      if (!refresh) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${API_BASE}/api/auth/token/refresh/`,
          { refresh },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess: string = data.access;
        Cookies.set("educore_access", newAccess, { expires: 1, secure: true, sameSite: "strict" });
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export function clearAuth() {
  Cookies.remove("educore_access");
  Cookies.remove("educore_refresh");
  Cookies.remove("educore_role");
}

export default apiClient;
