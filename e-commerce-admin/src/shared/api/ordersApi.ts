import { apiClient } from "./client";

export type OrderStatus =
  | "CART"
  | "PENDING"
  | "PAID"
  | "PAYED"
  | "PROCESSING"
  | "CONFIRMED"
  | "ASSEMBLED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    images: Array<{
      id: string;
      url: string;
      alt: string;
      sortOrder: number;
    }>;
    slug: string;
  };
}

export interface Order {
  id: number;
  userId: string | null;
  sessionId: string | null;
  status: OrderStatus;
  total: string;
  discount: string;
  finalTotal: string;
  bonusUsed: string;
  bonusEarned: string;
  bonusAccrualScheduledAt?: string | null;
  bonusAccrualAvailableAt?: string | null;
  bonusAccruedAt?: string | null;
  email?: string;
  phone?: string;
  buyer?: string;
  deliveryMethod: string;
  paymentMethod: string;
  address?: string;
  pointId?: string | null;
  windowId?: string | null;
  payLater: boolean;
  couponId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  pickupPoint?: {
    id: string;
    name: string;
    address: string;
  };
  pickupWindow?: {
    id: string;
    start: string;
    end: string;
  };
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
}

export interface OrderFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
  pickupPointId?: string;
  startDate?: string;
  endDate?: string;
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

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
}

export const ordersApi = {
  getAll: async (filter?: OrderFilter): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get("/admin/orders", { params: filter });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: UpdateOrderStatusDto,
  ): Promise<Order> => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, data);
    return response.data;
  },

  getStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get("/admin/orders/stats");
    return response.data;
  },
};
