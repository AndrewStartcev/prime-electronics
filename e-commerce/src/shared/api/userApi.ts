import { apiClient } from "./apiClient";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOrder {
  id: number;
  status: string;
  createdAt: string;
  total: string;
  discount: string;
  finalTotal: string;
  buyer: string | null;
  email: string | null;
  phone: string | null;
  deliveryMethod: string;
  paymentMethod: string;
  address: string | null;
  entrance: string | null;
  comment: string | null;
  deliveryTime: string | null;
  bonusUsed: string;
  bonusEarned: string;
  items: {
    id: string;
    quantity: number;
    price: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: {
        id: string;
        url: string;
        alt: string;
        sortOrder: number;
      }[];
    };
  }[];
  pointId: string | null;
  pickupPoint?: {
    id: string;
    name: string;
    address: string;
  };
  pickupWindow?: string;
}

export interface UserCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  unitPrice?: string | number | null;
  variantKey?: string | null;
  variantLabel?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    isActive: boolean;
    images: {
      id: string;
      url: string;
      sortOrder: number;
    }[];
  };
}

export interface UserCart {
  items: UserCartItem[];
  totalAmount?: number;
  itemsCount?: number;
}

export interface LoyaltyTier {
  name: string;
  cashbackRate: number;
  minSpent: number;
}

export interface LoyaltyInfo {
  balance: number;
  totalSpent: number;
  tier: LoyaltyTier;
  cashbackRate: number;
  nextTier: LoyaltyTier | null;
  remainingToNextTier: number | null;
}

export interface BonusTransaction {
  id: number;
  amount: number;
  type: "INCREASE" | "DECREASE";
  description: string | null;
  createdAt: string;
  order: {
    id: number;
    orderNumber: string;
    finalTotal: number;
  } | null;
}

export interface BonusHistoryResponse {
  data: BonusTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface CashbackPreview {
  cashbackRate: number;
  cashbackAmount: number;
  tierName: string;
}

const isNotFoundError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 404;

const getCart = async (): Promise<UserCartItem[]> => {
  const response = await apiClient.get("/orders/cart");
  return response.data;
};

const resolveCartItemId = async (idOrProductId: string) => {
  const cart = await getCart();
  return (
    cart.find(
      (item) => item.id === idOrProductId || item.productId === idOrProductId,
    )?.id || idOrProductId
  );
};

export const userApi = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<UserProfile> => {
    const response = await apiClient.patch("/users/profile", data);
    return response.data;
  },

  // Get user orders
  getOrders: async (): Promise<UserOrder[]> => {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  // Get specific order
  getOrder: async (orderId: string): Promise<UserOrder> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order before confirmation
  cancelOrder: async (orderId: string): Promise<UserOrder> => {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Get user cart
  getCart,

  // Add item to cart
  addToCart: async (
    productId: string,
    quantity: number = 1,
    options: { variantKey?: string; variantLabel?: string } = {},
  ) => {
    const response = await apiClient.post("/orders/cart/items", {
      productId,
      quantity,
      ...options,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, quantity: number) => {
    try {
      const response = await apiClient.patch(`/orders/cart/items/${itemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;

      const resolvedItemId = await resolveCartItemId(itemId);
      if (resolvedItemId === itemId) throw error;

      const response = await apiClient.patch(
        `/orders/cart/items/${resolvedItemId}`,
        { quantity },
      );
      return response.data;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: string) => {
    try {
      const response = await apiClient.delete(`/orders/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;

      const resolvedItemId = await resolveCartItemId(itemId);
      if (resolvedItemId === itemId) throw error;

      const response = await apiClient.delete(
        `/orders/cart/items/${resolvedItemId}`,
      );
      return response.data;
    }
  },

  // Clear cart
  clearCart: async () => {
    const response = await apiClient.delete("/orders/cart");
    return response.data;
  },

  // Initialize order
  initOrder: async () => {
    const response = await apiClient.post("/orders/init");
    return response.data;
  },

  // Select pickup point and window
  selectPickup: async (
    orderId: string,
    pickupPointId: string,
    pickupWindow: string,
  ) => {
    const response = await apiClient.post(`/orders/${orderId}/pickup`, {
      pickupPointId,
      pickupWindow,
    });
    return response.data;
  },

  // Get favorites count
  getFavoritesCount: async (): Promise<number> => {
    const response = await apiClient.get("/favorites/count");
    return response.data.count;
  },

  // Loyalty program
  getLoyaltyInfo: async (): Promise<LoyaltyInfo> => {
    const response = await apiClient.get("/loyalty");
    return response.data;
  },

  getBonusHistory: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<BonusHistoryResponse> => {
    const response = await apiClient.get("/loyalty/history", {
      params: { page, limit },
    });
    return response.data;
  },

  previewCashback: async (total: number): Promise<CashbackPreview> => {
    const response = await apiClient.get("/loyalty/preview", {
      params: { total },
    });
    return response.data;
  },
};
