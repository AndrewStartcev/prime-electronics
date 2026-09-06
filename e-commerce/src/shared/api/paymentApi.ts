import { apiClient } from "./apiClient";

export enum PaymentMethod {
  ROBOKASSA = "ROBOKASSA",
  CASH = "CASH",
}

export interface CreatePaymentDto {
  orderId: number;
  paymentMethod: PaymentMethod;
}

export interface Payment {
  id: string;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    userId: string;
    total: number;
    status: string;
  };
}

export const paymentApi = {
  // Create payment
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await apiClient.post<Payment>("/payments", data);
    return response.data;
  },

  // Get user's payments
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>("/payments/my");
    return response.data;
  },

  // Get payment by order ID
  getByOrderId: async (orderId: number): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/payments/order/${orderId}`);
    return response.data;
  },
};
