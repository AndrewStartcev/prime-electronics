import { apiClient } from "@/shared/api";

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface EnterPhoneData {
  phone: string;
}

export interface VerifyCodeData {
  phone: string;
  code: string;
}

export interface ResendCodeData {
  phone: string;
}

export interface EnterPhoneResponse {
  message: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  telegramId?: string;
  avatar?: string;
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const AUTH_STORAGE_MODE_KEY = "auth_storage_mode";
type AuthStorageMode = "local" | "session";

/** Очищает номер телефона от форматирования: +7 (775) 993-25-87 → +77759932587 */
function cleanPhone(phone: string): string {
  return "+" + phone.replace(/\D/g, "");
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/user/login", {
      email: data.email,
      password: data.password,
    });

    // Сохраняем токены и данные пользователя
    this.saveAuthData(response.data, data.rememberMe);

    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/user/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });

    // Сохраняем токены после регистрации
    this.saveAuthData(response.data, true);

    return response.data;
  }

  async enterPhone(data: EnterPhoneData): Promise<EnterPhoneResponse> {
    const response = await apiClient.post<EnterPhoneResponse>(
      "/auth/enter",
      { phone: cleanPhone(data.phone) },
    );
    return response.data;
  }

  async verifyCode(data: VerifyCodeData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/verify",
      { phone: cleanPhone(data.phone), code: data.code },
    );
    this.saveAuthData(response.data, true);
    return response.data;
  }

  async resendCode(data: ResendCodeData): Promise<EnterPhoneResponse> {
    const response = await apiClient.post<EnterPhoneResponse>(
      "/auth/resend",
      { phone: cleanPhone(data.phone) },
    );
    return response.data;
  }

  async telegramLogin(data: TelegramAuthData): Promise<AuthResponse> {
    console.log("[Telegram Auth] Отправка данных:", data);
    try {
      const response = await apiClient.post<AuthResponse>("/auth/telegram", data);
      console.log("[Telegram Auth] Ответ сервера:", response.status, response.data);

      // Telegram авторизация всегда сохраняется в localStorage
      this.saveAuthData(response.data, true);

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      console.error("[Telegram Auth] Ошибка:", {
        status: axiosError?.response?.status,
        data: axiosError?.response?.data,
        message: axiosError?.message,
      });
      throw error;
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", {
      refreshToken,
    });

    // Обновляем токены в активном хранилище пользователя
    const storageMode = this.getCurrentStorageMode();
    const storage = storageMode === "session" ? sessionStorage : localStorage;
    storage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    storage.setItem(AUTH_STORAGE_MODE_KEY, storageMode);
    if (storageMode === "local") {
      sessionStorage.removeItem(AUTH_STORAGE_MODE_KEY);
    } else {
      localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    this.clearAuthData();
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;

    const mode = this.getCurrentStorageMode();
    if (mode === "local") {
      return (
        localStorage.getItem(AUTH_TOKEN_KEY) ||
        sessionStorage.getItem(AUTH_TOKEN_KEY)
      );
    }

    return (
      sessionStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY)
    );
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    const mode = this.getCurrentStorageMode();
    if (mode === "local") {
      return (
        localStorage.getItem(REFRESH_TOKEN_KEY) ||
        sessionStorage.getItem(REFRESH_TOKEN_KEY)
      );
    }

    return (
      sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
      localStorage.getItem(REFRESH_TOKEN_KEY)
    );
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const mode = this.getCurrentStorageMode();
    const userStr =
      mode === "local"
        ? localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
        : sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveAuthData(data: AuthResponse, rememberMe?: boolean): void {
    this.clearAuthData();

    const storageMode: AuthStorageMode = rememberMe ? "local" : "session";
    const storage = storageMode === "local" ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    storage.setItem(AUTH_STORAGE_MODE_KEY, storageMode);
  }

  private getCurrentStorageMode(): AuthStorageMode {
    const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
    const localMode = localStorage.getItem(
      AUTH_STORAGE_MODE_KEY,
    ) as AuthStorageMode | null;
    const sessionMode = sessionStorage.getItem(
      AUTH_STORAGE_MODE_KEY,
    ) as AuthStorageMode | null;

    if (sessionMode === "session" && sessionToken) return "session";
    if (localMode === "local" && localToken) return "local";

    if (sessionToken && !localToken) return "session";
    return "local";
  }

  private clearAuthData(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  }
}

export const authService = new AuthService();
