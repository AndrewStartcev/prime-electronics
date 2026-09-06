import { apiClient } from "./client";
import { clearAdminSession } from "@/shared/lib/adminSession";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/admin/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    clearAdminSession();
  },

  getProfile: async (): Promise<Admin> => {
    const response = await apiClient.get("/admin/users/profile");
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};
