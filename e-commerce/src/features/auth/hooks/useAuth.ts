import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  type AuthResponse,
  type LoginData,
  type RegisterData,
  type TelegramAuthData,
} from "../api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestStore } from "@/shared/stores/useGuestStore";

const EMPTY_GUEST_CART = {
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  total: 0,
};

const usePostAuthSync = (onSuccess?: () => void) => {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return async (response: AuthResponse) => {
    // Persisted guest session can exist even when store state is not hydrated yet.
    try {
      const merged = await useGuestStore.getState().mergeCartToUser();
      if (merged) {
        queryClient.setQueryData(["cart", "guest"], EMPTY_GUEST_CART);
      }
    } catch (error) {
      console.error("Guest cart merge failed:", error);
    }

    setUser(response.user);

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["userCart"] }),
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
    ]);

    onSuccess?.();
  };
};

export const useLogin = (onSuccess?: () => void) => {
  const postAuthSync = usePostAuthSync(onSuccess);

  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: async (response) => {
      await postAuthSync(response);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });
};

export const useRegister = (onSuccess?: () => void) => {
  const postAuthSync = usePostAuthSync(onSuccess);

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: async (response) => {
      await postAuthSync(response);
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });
};

export const useTelegramLogin = (onSuccess?: () => void) => {
  const postAuthSync = usePostAuthSync(onSuccess);

  return useMutation({
    mutationFn: (data: TelegramAuthData) => authService.telegramLogin(data),
    onSuccess: async (response) => {
      await postAuthSync(response);
    },
    onError: (error: any) => {
      console.error("Telegram login error:", error);
    },
  });
};
