import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  guestApi,
  type GuestCartResponse,
  type GuestCartItem,
} from "../api/guestApi";
import { useAuthStore, useGuestStore } from "../stores";

// Query keys для кеширования
export const cartKeys = {
  all: ["cart"] as const,
  guest: () => [...cartKeys.all, "guest"] as const,
};

const getGuestItemUnitPrice = (item: GuestCartItem) =>
  Number(item.unitPrice) ||
  (item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0) ||
  Number(item.product.price);

const EMPTY_GUEST_CART: GuestCartResponse = {
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  total: 0,
};

/**
 * Hook для получения корзины с кешированием
 */
export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useGuestStore((state) => state.session);
  const cart = useGuestStore((state) => state.cart);
  const isInitialized = useGuestStore((state) => state.isInitialized);
  const isLoading = useGuestStore((state) => state.isLoading);
  const initialize = useGuestStore((state) => state.initialize);

  useEffect(() => {
    if (isAuthenticated) return;
    if (!isInitialized && !isLoading) {
      void initialize();
    }
  }, [initialize, isAuthenticated, isInitialized, isLoading]);

  return useQuery<GuestCartResponse>({
    queryKey: cartKeys.guest(),
    queryFn: async () => {
      if (!session) {
        return EMPTY_GUEST_CART;
      }
      return await guestApi.getCart();
    },
    enabled: !isAuthenticated && isInitialized && !!session,
    placeholderData: (previousData) => previousData ?? cart ?? EMPTY_GUEST_CART,
    staleTime: 0, // Данные всегда считаются устаревшими для немедленного обновления
    gcTime: 5 * 60 * 1000, // 5 минут - время хранения в кеше
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchOnMount: true, // Обновлять при монтировании компонента
  });
}

/**
 * Hook для добавления товара в корзину
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const session = useGuestStore((state) => state.session);

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      variantKey,
      variantLabel,
    }: {
      productId: string;
      quantity?: number;
      variantKey?: string;
      variantLabel?: string;
    }) => {
      if (!session) {
        throw new Error("No guest session");
      }
      return await guestApi.addToCart(productId, quantity, {
        variantKey,
        variantLabel,
      });
    },
    onMutate: async ({ productId, quantity = 1, variantKey }) => {
      // Отменяем текущие запросы для избежания конфликтов
      await queryClient.cancelQueries({ queryKey: cartKeys.guest() });

      // Сохраняем предыдущее состояние для отката
      const previousCart = queryClient.getQueryData<GuestCartResponse>(
        cartKeys.guest(),
      );

      // Оптимистичное обновление
      if (previousCart) {
        queryClient.setQueryData<GuestCartResponse>(cartKeys.guest(), (old) => {
          if (!old) return previousCart;

          // Проверяем, есть ли товар уже в корзине
          const existingItemIndex = old.items.findIndex(
            (item) =>
              item.productId === productId &&
              (item.variantKey || "") === (variantKey || ""),
          );

          let newItems: GuestCartItem[];
          if (existingItemIndex >= 0) {
            // Товар уже есть - увеличиваем количество
            newItems = old.items.map((item, index) =>
              index === existingItemIndex
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    subtotal:
                      getGuestItemUnitPrice(item) * (item.quantity + quantity),
                  }
                : item,
            );
          } else {
            // Нового товара еще нет - нужно будет обновить после ответа API
            // Просто вернем старое состояние, но отметим что изменения будут
            return old;
          }

          return {
            ...old,
            items: newItems,
            itemCount: newItems.length,
            totalQuantity: newItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            ),
            total: newItems.reduce((sum, item) => sum + item.subtotal, 0),
          };
        });
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.guest(), context.previousCart);
      }
    },
    onSettled: () => {
      // Обновляем данные в любом случае для получения актуальной информации с сервера
      queryClient.invalidateQueries({ queryKey: cartKeys.guest() });
    },
  });
}

/**
 * Hook для обновления количества товара в корзине
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const session = useGuestStore((state) => state.session);

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      if (!session) {
        throw new Error("No guest session");
      }
      return await guestApi.updateCartItem(productId, quantity);
    },
    onMutate: async ({ productId, quantity }) => {
      // Оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: cartKeys.guest() });

      const previousCart = queryClient.getQueryData<GuestCartResponse>(
        cartKeys.guest(),
      );

      if (previousCart) {
        queryClient.setQueryData<GuestCartResponse>(cartKeys.guest(), {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === productId || item.productId === productId
              ? {
                  ...item,
                  quantity,
                  subtotal: getGuestItemUnitPrice(item) * quantity,
                }
              : item,
          ),
        });
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.guest(), context.previousCart);
      }
    },
    onSettled: () => {
      // Обновляем данные в любом случае
      queryClient.invalidateQueries({ queryKey: cartKeys.guest() });
    },
  });
}

/**
 * Hook для удаления товара из корзины
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const session = useGuestStore((state) => state.session);

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!session) {
        throw new Error("No guest session");
      }
      return await guestApi.removeFromCart(productId);
    },
    onMutate: async (productId) => {
      // Оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: cartKeys.guest() });

      const previousCart = queryClient.getQueryData<GuestCartResponse>(
        cartKeys.guest(),
      );

      if (previousCart) {
        const newItems = previousCart.items.filter(
          (item) => item.id !== productId && item.productId !== productId,
        );
        queryClient.setQueryData<GuestCartResponse>(cartKeys.guest(), {
          ...previousCart,
          items: newItems,
          itemCount: newItems.length,
          totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
          total: newItems.reduce((sum, item) => sum + item.subtotal, 0),
        });
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.guest(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.guest() });
    },
  });
}

/**
 * Hook для очистки корзины
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const session = useGuestStore((state) => state.session);

  return useMutation({
    mutationFn: async () => {
      if (!session) {
        throw new Error("No guest session");
      }
      return await guestApi.clearCart();
    },
    onSuccess: () => {
      // Обновляем кеш на пустую корзину
      queryClient.setQueryData<GuestCartResponse>(cartKeys.guest(), {
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        total: 0,
      });
    },
  });
}

/**
 * Hook для слияния корзины гостя с пользователем
 */
export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestSessionId: string) => {
      return await guestApi.mergeCart(guestSessionId);
    },
    onSuccess: () => {
      // Очищаем кеш корзины гостя
      queryClient.removeQueries({ queryKey: cartKeys.guest() });
    },
  });
}
