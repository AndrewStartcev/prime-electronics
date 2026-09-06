import { create } from "zustand";
import {
  guestApi,
  type GuestCartItem,
  type GuestCartResponse,
} from "../api/guestApi";
import { getOrCreateFingerprint } from "../lib/fingerprint";

interface GuestSession {
  id: string;
  fingerprint: string;
  isGuest: boolean;
}

interface GuestState {
  session: GuestSession | null;
  cart: GuestCartResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number
  ) => Promise<GuestCartItem | null>;
  updateCartItem: (
    productId: string,
    quantity: number
  ) => Promise<GuestCartItem | null>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  mergeCartToUser: () => Promise<boolean>;
  reset: () => void;
}

const GUEST_SESSION_KEY = "guest_session";
const GUEST_ACCESS_TOKEN_KEY = "guest_access_token";
const GUEST_REFRESH_TOKEN_KEY = "guest_refresh_token";

function getStoredSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeSession(session: GuestSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

function storeGuestTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(GUEST_REFRESH_TOKEN_KEY, refreshToken);
}

function getGuestAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_ACCESS_TOKEN_KEY);
}

function clearGuestData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_SESSION_KEY);
  localStorage.removeItem(GUEST_ACCESS_TOKEN_KEY);
  localStorage.removeItem(GUEST_REFRESH_TOKEN_KEY);
}

export const useGuestStore = create<GuestState>((set, get) => ({
  session: null,
  cart: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      // Check if we already have a session
      const storedSession = getStoredSession();
      const storedToken = getGuestAccessToken();

      if (storedSession && storedToken) {
        // Use existing session
        set({ session: storedSession, isInitialized: true, isLoading: false });
        // Fetch cart in background
        get().fetchCart();
        return;
      }

      // Create new guest session
      const fingerprint = await getOrCreateFingerprint();
      if (!fingerprint) {
        throw new Error("Could not generate fingerprint");
      }

      const response = await guestApi.auth(fingerprint);

      // Store session and tokens
      storeSession(response.guest);
      storeGuestTokens(response.accessToken, response.refreshToken);

      set({
        session: response.guest,
        isInitialized: true,
        isLoading: false,
      });

      // Fetch cart
      get().fetchCart();
    } catch (error) {
      console.error("Failed to initialize guest session:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to initialize",
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  refreshTokens: async () => {
    try {
      const refreshToken = localStorage.getItem(GUEST_REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await guestApi.refreshTokens(refreshToken);
      storeGuestTokens(response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      console.error("Failed to refresh guest tokens:", error);
      // Clear session and reinitialize
      get().reset();
      await get().initialize();
      return false;
    }
  },

  fetchCart: async () => {
    const { session } = get();
    if (!session) return;

    try {
      const cart = await guestApi.getCart();
      console.log("Fetched guest cart:", cart);
      set({ cart });
    } catch (error) {
      console.error("Failed to fetch guest cart:", error);
    }
  },

  addToCart: async (productId: string, quantity = 1) => {
    const { session } = get();
    if (!session) {
      console.error("No guest session");
      return null;
    }

    try {
      const item = await guestApi.addToCart(productId, quantity);
      // Refresh cart
      get().fetchCart();
      return item;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add to cart",
      });
      return null;
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const { session } = get();
    if (!session) return null;

    try {
      const item = await guestApi.updateCartItem(productId, quantity);
      // Refresh cart
      get().fetchCart();
      return item;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update cart",
      });
      return null;
    }
  },

  removeFromCart: async (productId: string) => {
    const { session } = get();
    if (!session) return false;

    try {
      await guestApi.removeFromCart(productId);
      // Refresh cart
      get().fetchCart();
      return true;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to remove from cart",
      });
      return false;
    }
  },

  clearCart: async () => {
    const { session } = get();
    if (!session) return false;

    try {
      await guestApi.clearCart();
      set({ cart: { items: [], itemCount: 0, totalQuantity: 0, total: 0 } });
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to clear cart",
      });
      return false;
    }
  },

  mergeCartToUser: async () => {
    const { session } = get();
    const activeSession = session || getStoredSession();
    if (!activeSession?.id) return false;

    try {
      await guestApi.mergeCart(activeSession.id);
      // Clear guest data after merge
      clearGuestData();
      set({ session: null, cart: null, isInitialized: false });
      return true;
    } catch (error) {
      console.error("Failed to merge cart:", error);
      return false;
    }
  },

  reset: () => {
    clearGuestData();
    set({
      session: null,
      cart: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  },
}));

// Export helper to get guest session ID
export function getGuestSessionId(): string | null {
  const stored = getStoredSession();
  return stored?.id || null;
}

// Export helper to check if guest has cart items
export function hasGuestCartItems(): boolean {
  const store = useGuestStore.getState();
  return (store.cart?.itemCount || 0) > 0;
}
