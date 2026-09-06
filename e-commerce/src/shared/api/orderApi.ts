import { apiClient } from "./apiClient";

export interface CreateOrderDto {
  couponCode?: string;
  comment?: string;
}

export interface SelectPickupDto {
  pointId: string;
  pickupTime: string; // ISO date string
}

// Finalize order DTO (new 2-step flow)
export interface FinalizeOrderDto {
  deliveryMethod: "PICKUP" | "DELIVERY";
  buyer: string;
  email: string;
  phone: string;
  paymentMethod: "ROBOKASSA" | "CASH";
  // PICKUP-specific (required if deliveryMethod === "PICKUP")
  pointId?: string;
  pickupTime?: string;
  // DELIVERY-specific (required if deliveryMethod === "DELIVERY")
  address?: string;
  entrance?: string;
  comment?: string;
  deliveryTime?: string;
  deliveryCost?: number;
}

// Quick buy (1-click) DTO - works with cart items
export interface QuickBuyDto {
  buyer: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    slug?: string | null;
    title: string;
    sku: string;
    images: string[];
  };
}

export interface Order {
  id: number;
  userId: string;
  total: number;
  discount: number;
  finalTotal: number;
  status: string;
  pointId: string | null;
  windowId: string | null;
  couponId: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  pickupPoint?: {
    id: string;
    title: string;
    address: string;
    coords: {
      lat: number;
      lng: number;
    };
  };
  pickupWindow?: {
    id: string;
    date: string;
    timeFrom: string;
    timeTo: string;
  };
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };
}

export const orderApi = {
  // Initialize order from basket
  initOrder: async (
    data: CreateOrderDto,
    isGuest: boolean = false,
  ): Promise<Order> => {
    const endpoint = isGuest ? "/guest/orders/init" : "/orders/init";
    const response = await apiClient.post<Order>(endpoint, data);
    return response.data;
  },

  // Select pickup point and time (system will assign window automatically)
  selectPickup: async (
    orderId: number,
    data: SelectPickupDto,
  ): Promise<Order> => {
    const response = await apiClient.post<Order>(
      `/orders/${orderId}/pickup`,
      data,
    );
    return response.data;
  },

  // Finalize order (new 2-step flow) - handles delivery, contact info, and payment
  finalizeOrder: async (
    orderId: number,
    data: FinalizeOrderDto,
    isGuest: boolean = false,
  ): Promise<Order> => {
    const endpoint = isGuest
      ? `/guest/orders/${orderId}/finalize`
      : `/orders/${orderId}/finalize`;
    const response = await apiClient.post<Order>(endpoint, data);
    return response.data;
  },

  // Apply coupon to order
  applyCoupon: async (
    orderId: number,
    couponCode: string,
    isGuest: boolean = false,
  ): Promise<Order> => {
    const endpoint = isGuest
      ? `/guest/orders/${orderId}/coupon`
      : `/orders/${orderId}/coupon`;
    const response = await apiClient.post<Order>(endpoint, {
      code: couponCode,
    });
    return response.data;
  },

  // Remove coupon from order
  removeCoupon: async (
    orderId: number,
    isGuest: boolean = false,
  ): Promise<Order> => {
    const endpoint = isGuest
      ? `/guest/orders/${orderId}/coupon`
      : `/orders/${orderId}/coupon`;
    const response = await apiClient.delete<Order>(endpoint);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>("/orders/my");
    return response.data;
  },

  // Get order by ID
  getById: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  // Quick buy (1-click purchase) - creates order from cart
  quickBuy: async (
    data: QuickBuyDto,
    isGuest: boolean = false,
  ): Promise<Order> => {
    const endpoint = isGuest ? "/guest/orders/quick-buy" : "/orders/quick-buy";
    const response = await apiClient.post<Order>(endpoint, data);
    return response.data;
  },
};
