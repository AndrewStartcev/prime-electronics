import { apiClient } from "./client";

export type UserRole = "USER" | "ADMIN" | "MANAGER" | "EDITOR";
export type BonusOperationType = "INCREASE" | "DECREASE";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    favorites: number;
  };
}

export interface UserFilter {
  page?: number;
  limit?: number;
  role?: UserRole;
  isBanned?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  role?: UserRole;
  isBanned?: boolean;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface AdjustUserBonusDto {
  amount: number;
  description?: string;
}

export interface ChangeUserPasswordDto {
  newPassword: string;
  confirmPassword: string;
}

export interface UserBonusBalanceResponse {
  balance: number;
}

export interface UserBonusAdjustmentResponse {
  success: boolean;
  balance: number;
  operation: {
    id: number;
    amount: number;
    type: BonusOperationType;
    description?: string | null;
    createdAt: string;
  };
}

export const usersApi = {
  getAll: async (filter?: UserFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get("/admin/users", { params: filter });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  getBonusBalance: async (id: string): Promise<UserBonusBalanceResponse> => {
    const response = await apiClient.get(`/admin/users/${id}/bonuses/balance`);
    return response.data;
  },

  accrueBonus: async (
    id: string,
    data: AdjustUserBonusDto,
  ): Promise<UserBonusAdjustmentResponse> => {
    const response = await apiClient.post(`/admin/users/${id}/bonuses/accrue`, data);
    return response.data;
  },

  writeOffBonus: async (
    id: string,
    data: AdjustUserBonusDto,
  ): Promise<UserBonusAdjustmentResponse> => {
    const response = await apiClient.post(`/admin/users/${id}/bonuses/write-off`, data);
    return response.data;
  },

  changePassword: async (
    id: string,
    data: ChangeUserPasswordDto,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/admin/users/${id}/change-password`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post("/admin/users", data);
    return response.data;
  },

  ban: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${id}/ban`);
    return response.data;
  },

  unban: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${id}/unban`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  getStats: async () => {
    const response = await apiClient.get("/admin/users/stats");
    return response.data;
  },
};
