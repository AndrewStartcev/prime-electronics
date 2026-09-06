import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.prime-electronics.ru/api";
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const AUTH_STORAGE_MODE_KEY = "auth_storage_mode";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

function clearUserAuthData() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_MODE_KEY);
}

function getCurrentUserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const localMode = localStorage.getItem(AUTH_STORAGE_MODE_KEY);
  const sessionMode = sessionStorage.getItem(AUTH_STORAGE_MODE_KEY);

  if (sessionMode === "session" && sessionToken) return sessionStorage;
  if (localMode === "local" && localToken) return localStorage;
  if (sessionToken && !localToken) return sessionStorage;
  if (localToken) return localStorage;

  return null;
}

function getUserToken(): string | null {
  const storage = getCurrentUserStorage();
  if (!storage) return null;
  return storage.getItem(AUTH_TOKEN_KEY);
}

function getUserRefreshToken(): string | null {
  const storage = getCurrentUserStorage();
  if (!storage) return null;
  return storage.getItem(REFRESH_TOKEN_KEY);
}

function setRefreshedUserTokens(accessToken: string, refreshToken: string) {
  const storage = getCurrentUserStorage() || localStorage;
  const mode = storage === sessionStorage ? "session" : "local";

  storage.setItem(AUTH_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  storage.setItem(AUTH_STORAGE_MODE_KEY, mode);

  if (mode === "local") {
    sessionStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  } else {
    localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  }
}

function notifyAuthExpired() {
  window.dispatchEvent(new Event("auth:expired"));
}

// Request interceptor для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage/sessionStorage in browser environment
    if (typeof window !== "undefined") {
      // Check for user token first
      const userToken = getUserToken();

      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      } else {
        // Fall back to guest token for guest-specific routes
        const guestToken = localStorage.getItem("guest_access_token");
        if (guestToken) {
          config.headers.Authorization = `Bearer ${guestToken}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок и refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        const userToken = getUserToken();

        // If it's a user token that expired, try to refresh
        if (userToken) {
          const userRefreshToken = getUserRefreshToken();

          if (userRefreshToken) {
            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return apiClient(originalRequest);
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: userRefreshToken,
              });

              const { accessToken, refreshToken } = response.data;

              // Save new tokens to the same storage where old ones were
              setRefreshedUserTokens(accessToken, refreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              processQueue(null, accessToken);
              isRefreshing = false;

              return apiClient(originalRequest);
            } catch (refreshError) {
              processQueue(refreshError, null);
              isRefreshing = false;

              // Refresh failed — clear auth and notify app
              clearUserAuthData();
              notifyAuthExpired();
              return Promise.reject(refreshError);
            }
          }

          // No refresh token — clear auth and notify app
          clearUserAuthData();
          notifyAuthExpired();
          return Promise.reject(error);
        }

        // If it's a guest token that expired, try to refresh
        const guestRefreshToken = localStorage.getItem("guest_refresh_token");

        if (guestRefreshToken) {
          if (isRefreshing) {
            // Queue requests while refreshing
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Try to refresh the guest token
            const response = await axios.post(`${API_URL}/auth/guest/refresh`, {
              refreshToken: guestRefreshToken,
            });

            const { accessToken, refreshToken } = response.data;

            // Store new tokens
            localStorage.setItem("guest_access_token", accessToken);
            localStorage.setItem("guest_refresh_token", refreshToken);

            // Update authorization header
            apiClient.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            isRefreshing = false;

            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            // Clear guest data and reinitialize
            localStorage.removeItem("guest_session");
            localStorage.removeItem("guest_access_token");
            localStorage.removeItem("guest_refresh_token");

            // Force reinitialize guest session
            console.log("Guest token refresh failed, need to reinitialize");

            return Promise.reject(refreshError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
