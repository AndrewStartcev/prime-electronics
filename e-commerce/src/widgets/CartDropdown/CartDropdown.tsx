"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CartItemCard } from "./ui/CartItemCard";
import { CartItem } from "./model";
import { Divider, CartSkeleton } from "@/shared/ui";
import { useAuthStore, useGuestStore } from "@/shared/stores";
import { userApi, type UserCartItem } from "@/shared/api/userApi";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/shared/hooks";

interface CartDropdownProps {
  isClosing?: boolean;
  onClose?: () => void;
}

const EMPTY_USER_CART: UserCartItem[] = [];

const getCartUnitPrice = (
  lineTotal: string | number | null | undefined,
  quantity: number,
  fallback: string | number | null | undefined,
) => {
  const total = Number(lineTotal);
  if (Number.isFinite(total) && quantity > 0) return total / quantity;

  const fallbackPrice = Number(fallback);
  return Number.isFinite(fallbackPrice) ? fallbackPrice : 0;
};

export const CartDropdown = ({
  isClosing = false,
  onClose,
}: CartDropdownProps) => {
  const { isAuthenticated } = useAuthStore();
  const { initialize: initializeGuest } = useGuestStore();

  // Guest cart with caching
  const { data: guestCart, isLoading: guestCartLoading } = useCart();
  const updateGuestCart = useUpdateCartItem();
  const removeFromGuestCart = useRemoveFromCart();

  // User cart with caching
  const {
    data: userCart = EMPTY_USER_CART,
    isLoading: userCartLoading,
    refetch: refetchUserCart,
  } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => userApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Initialize guest session once
  useEffect(() => {
    if (!isAuthenticated) {
      initializeGuest();
    }
  }, [isAuthenticated, initializeGuest]);

  const handleRemove = async (id: string) => {
    if (isAuthenticated) {
      await userApi.removeFromCart(id);
      await refetchUserCart();
    } else {
      await removeFromGuestCart.mutateAsync(id);
    }
  };

  const handleQuantityChange = async (id: string, delta: number) => {
    if (isAuthenticated) {
      const item = userCart.find((item) => item.id === id);
      if (item) {
        const newQuantity = Math.max(1, item.quantity + delta);
        if (newQuantity === item.quantity) return;

        await userApi.updateCartItem(id, newQuantity);
        await refetchUserCart();
      }
    } else {
      const item = guestCart?.items.find((item) => item.id === id);
      if (item) {
        const newQuantity = Math.max(1, item.quantity + delta);
        if (newQuantity === item.quantity) return;

        await updateGuestCart.mutateAsync({
          productId: id,
          quantity: newQuantity,
        });
      }
    }
  };

  // Transform cart items to CartItem format
  const items: CartItem[] = isAuthenticated
    ? userCart.map((item) => ({
        id: item.id,
        title: item.product.name,
        variantLabel: item.variantLabel,
        image: item.product.images?.[0]?.url || "/images/iphone17.png",
        price: getCartUnitPrice(item.price, item.quantity, item.product.price),
        quantity: item.quantity,
      }))
    : guestCart?.items.map((item) => ({
        id: item.id,
        title: item.product.name,
        variantLabel: item.variantLabel,
        image: item.product.image || "/images/iphone17.png",
        price: getCartUnitPrice(
          item.subtotal,
          item.quantity,
          item.product.price,
        ),
        quantity: item.quantity,
      })) || [];

  const total = isAuthenticated
    ? userCart.reduce((sum, item) => sum + Number(item.price), 0)
    : guestCart?.total || 0;

  const animationClass = isClosing ? "animate-fadeOut" : "animate-fadeIn";
  const isLoading = isAuthenticated ? userCartLoading : guestCartLoading;

  if (isLoading) {
    return (
      <div
        className={`absolute right-0 top-full mt-[8px] md:mt-[10px] lg:mt-[12px] w-[calc(100vw-32px)] max-w-[400px] md:max-w-[500px] lg:max-w-[600px] bg-white rounded-[8px] md:rounded-[10px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[16px] md:p-[20px] lg:p-[24px] z-50 ${animationClass} opacity-0 [animation-fill-mode:forwards]`}
      >
        <p className="font-medium text-[20px] md:text-[24px] lg:text-[26px] leading-[1.3] text-[#131314] mb-4">
          Корзина
        </p>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`absolute right-0 top-full mt-[8px] md:mt-[10px] lg:mt-[12px] w-[calc(100vw-32px)] max-w-[400px] md:max-w-[500px] lg:max-w-[600px] bg-white rounded-[8px] md:rounded-[10px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[16px] md:p-[20px] lg:p-[24px] z-50 ${animationClass} opacity-0 [animation-fill-mode:forwards]`}
      >
        <p className="text-[16px] md:text-[18px] lg:text-[20px] text-[rgba(19,19,20,0.4)] text-center">
          Корзина пуста
        </p>
      </div>
    );
  }

  return (
    <div
      className={`absolute right-0 top-full mt-[8px] md:mt-[10px] lg:mt-[12px] w-[calc(100vw-32px)] max-w-[400px] md:max-w-[500px] lg:max-w-[600px] bg-white rounded-[8px] md:rounded-[10px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[16px] md:p-[20px] lg:p-[24px] z-50 ${animationClass} opacity-0 [animation-fill-mode:forwards]`}
    >
      <div className="flex flex-col gap-[16px] md:gap-[20px] lg:gap-[24px]">
        <p className="font-medium text-[20px] md:text-[24px] lg:text-[26px] leading-[1.3] text-[#131314]">
          Корзина
        </p>
        <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[21px] max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id}>
              <CartItemCard
                item={item}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
              />
              {index < items.length - 1 && (
                <Divider className="mt-[16px] md:mt-[18px] lg:mt-[21px]" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px] md:gap-[16px] lg:gap-[20px] mt-[16px] md:mt-[20px] lg:mt-[24px]">
        <div className="flex gap-[12px] md:gap-[16px] lg:gap-[20px] items-center">
          <p className="font-medium text-[20px] md:text-[24px] lg:text-[26px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
            Итого:
          </p>
          <p className="font-medium text-[20px] md:text-[24px] lg:text-[26px] leading-[1.3] text-[#131314]">
            {Math.round(total).toLocaleString("ru-RU")} ₽
          </p>
        </div>
        <Link
          href="/basket"
          onClick={onClose}
          className="bg-[#131314] text-white px-[20px] py-[16px] md:px-[22px] md:py-[18px] lg:px-[24px] lg:py-[20px] rounded-[12px] md:rounded-[13px] lg:rounded-[14px] font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] hover:bg-[#2c2c2e] transition-colors whitespace-nowrap sm:flex-1 text-center"
        >
          Перейти к оформлению
        </Link>
      </div>
    </div>
  );
};
