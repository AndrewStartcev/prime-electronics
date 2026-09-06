"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useCartNotificationStore } from "@/shared/stores";
import { userApi } from "@/shared/api/userApi";
import { useAddToCart } from "@/shared/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { QuickBuyModal } from "@/features/quick-buy";
import { getProductCartActionKey } from "../lib/cartActionKey";

interface ProductActionsProps {
  productId: string;
  productName?: string;
  productPrice?: number;
  cartItemOptions?: {
    variantKey?: string;
    variantLabel?: string;
  };
}

export const ProductActions = ({
  productId,
  productName,
  productPrice,
  cartItemOptions,
}: ProductActionsProps) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToCartMutation = useAddToCart();
  const showCartNotification = useCartNotificationStore((s) => s.show);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const cartActionKey = getProductCartActionKey(productId, cartItemOptions);

  useEffect(() => {
    setIsAdded(false);
  }, [cartActionKey]);

  const handleAddToCart = async () => {
    if (isAdding || isAdded) return;

    try {
      setIsAdding(true);

      if (isAuthenticated) {
        await userApi.addToCart(productId, 1, cartItemOptions);
        // Инвалидируем кэш корзины для немедленного обновления
        queryClient.invalidateQueries({ queryKey: ["userCart"] });
      } else {
        await addToCartMutation.mutateAsync({
          productId,
          quantity: 1,
          ...cartItemOptions,
        });
      }

      setIsAdded(true);
      showCartNotification();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // TODO: Show error notification
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] md:gap-[12px] lg:gap-[10px] xl:gap-[14px] mt-[16px] md:mt-[20px] lg:mt-[16px] xl:mt-[20px] 2xl:mt-[24px]">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isAdded}
          className={`${
            isAdded
              ? "bg-[#ef6f2e] hover:bg-[#d96328]"
              : "bg-[#131314] hover:bg-[#2c2c2e]"
          } text-white px-[28px] py-[14px] md:px-[32px] md:py-[15px] lg:px-[28px] lg:py-[14px] xl:px-[36px] xl:py-[16px] 2xl:px-[44px] 2xl:py-[18px] rounded-[60px] font-normal text-[15px] md:text-[16px] lg:text-[15px] xl:text-[17px] 2xl:text-[19px] leading-[1.4] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAdding
            ? "Добавление..."
            : isAdded
              ? "Добавлено в корзину"
              : "Добавить в корзину"}
        </button>
        <button
          onClick={() => setIsQuickBuyOpen(true)}
          className="border-2 border-[#131314] px-[28px] py-[14px] md:px-[32px] md:py-[15px] lg:px-[28px] lg:py-[14px] xl:px-[36px] xl:py-[16px] 2xl:px-[44px] 2xl:py-[18px] rounded-[60px] font-normal text-[15px] md:text-[16px] lg:text-[15px] xl:text-[17px] 2xl:text-[19px] leading-[1.4] text-[#131314] hover:bg-[rgba(19,19,20,0.05)] transition-colors whitespace-nowrap"
        >
          Купить в 1 клик
        </button>
      </div>

      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        cartItemOptions={cartItemOptions}
      />
    </>
  );
};
