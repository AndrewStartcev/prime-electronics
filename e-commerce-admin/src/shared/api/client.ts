import axios from "axios";
import { clearAdminSession, setCookie } from "@/shared/lib/adminSession";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.prime-electronics.ru/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function parseRoleFromAccessToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const data = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof data.role === "string" ? data.role.toUpperCase() : null;
  } catch {
    return null;
  }
}

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_access_token")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we have a refresh token
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_refresh_token")
          : null;

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("admin_access_token", accessToken);
          localStorage.setItem("admin_refresh_token", newRefreshToken);
          setCookie("admin_access_token", accessToken, 7);
          setCookie("admin_refresh_token", newRefreshToken, 30);

          const role = parseRoleFromAccessToken(accessToken);
          if (role) {
            localStorage.setItem("admin_role", role);
            setCookie("admin_role", role, 30);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          console.error("Token refresh failed:", refreshError);
          handleLogout();
        }
      } else {
        // No refresh token - logout immediately
        handleLogout();
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to handle logout
let isLoggingOut = false;

function handleLogout() {
  if (typeof window !== "undefined" && !isLoggingOut) {
    isLoggingOut = true;
    clearAdminSession();

    // Only redirect if not already on login page
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
}
