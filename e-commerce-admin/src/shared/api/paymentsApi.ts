import { apiClient } from "./client";

export enum PaymentMethod {
  ROBOKASSA = "ROBOKASSA",
  CASH = "CASH",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REFUNDED = "REFUNDED",
}

export interface Payment {
  id: string;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    userId: string;
    total: number;
    status: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    };
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  byStatus: {
    status: PaymentStatus;
    count: number;
    totalAmount: number;
  }[];
  byMethod: {
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }[];
}

export interface UpdatePaymentStatusDto {
  status: PaymentStatus;
}

export const paymentsApi = {
  // Get all payments with filters (admin)
  getAll: async (filters?: PaymentFilters): Promise<PaymentListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.method) params.append("method", filters.method);
    if (filters?.search) params.append("search", filters.search);

    const response = await apiClient.get<PaymentListResponse>(
      `/admin/payments?${params.toString()}`,
    );
    return response.data;
  },

  // Get payment by ID (admin)
  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/admin/payments/${id}`);
    return response.data;
  },

  // Get payment by order ID (admin)
  getByOrderId: async (orderId: number): Promise<Payment> => {
    const response = await apiClient.get<Payment>(
      `/admin/payments/order/${orderId}`,
    );
    return response.data;
  },

  // Update payment status (admin) - for marking CASH payments as completed
  updateStatus: async (
    orderId: number,
    data: UpdatePaymentStatusDto,
  ): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(
      `/admin/payments/order/${orderId}/status`,
      data,
    );
    return response.data;
  },

  // Get payment statistics (admin)
  getStats: async (): Promise<PaymentStats> => {
    const response = await apiClient.get<PaymentStats>(
      "/admin/payments/statistics",
    );
    return response.data;
  },
};
