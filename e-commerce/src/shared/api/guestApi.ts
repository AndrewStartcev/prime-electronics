import { apiClient } from "./apiClient";

export interface GuestAuthRequest {
  fingerprint: string;
  userAgent?: string;
}

export interface GuestAuthResponse {
  guest: {
    id: string;
    fingerprint: string;
    isGuest: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface GuestCartItem {
  id: string;
  productId: string;
  quantity: number;
  variantKey?: string | null;
  variantLabel?: string | null;
  unitPrice?: string | number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    oldPrice: string | null;
    image: string | null;
    category: {
      id: string;
      title: string;
      slug: string;
    };
  };
  subtotal: number;
}

export interface GuestCartResponse {
  items: GuestCartItem[];
  itemCount: number;
  totalQuantity: number;
  total: number;
}

export interface AddCartItemOptions {
  variantKey?: string;
  variantLabel?: string;
}

export const guestApi = {
  /**
   * Authenticate as guest using device fingerprint
   */
  auth: async (fingerprint: string): Promise<GuestAuthResponse> => {
    const response = await apiClient.post<GuestAuthResponse>("/auth/guest", {
      fingerprint,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
    return response.data;
  },

  /**
   * Refresh guest tokens
   */
  refreshTokens: async (
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post("/auth/guest/refresh", {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Merge guest cart to user cart after login
   */
  mergeCart: async (guestSessionId: string): Promise<{ merged: number }> => {
    const response = await apiClient.post("/auth/guest/merge", {
      guestSessionId,
    });
    return response.data;
  },

  /**
   * Get guest cart
   */
  getCart: async (): Promise<GuestCartResponse> => {
    const response = await apiClient.get<GuestCartResponse>("/guest/cart");
    return response.data;
  },

  /**
   * Add item to guest cart
   */
  addToCart: async (
    productId: string,
    quantity: number = 1,
    options: AddCartItemOptions = {},
  ): Promise<GuestCartItem> => {
    const response = await apiClient.post<GuestCartItem>("/guest/cart/items", {
      productId,
      quantity,
      ...options,
    });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    productId: string,
    quantity: number,
  ): Promise<GuestCartItem> => {
    const response = await apiClient.patch<GuestCartItem>(
      `/guest/cart/items/${productId}`,
      {
        quantity,
      },
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId: string): Promise<void> => {
    await apiClient.delete(`/guest/cart/items/${productId}`);
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete("/guest/cart");
  },
};
