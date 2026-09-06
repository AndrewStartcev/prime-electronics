"use client";

import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { BasketItem } from "./model";
import { BasketItemCard, OrderSummary, QuickOrderModal } from "./ui";
import Image from "next/image";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi, type UserCartItem } from "@/shared/api/userApi";
import { favoriteApi } from "@/shared/api/favoriteApi";
import { orderApi } from "@/shared/api/orderApi";
import { couponApi } from "@/shared/api/couponApi";
import {
  cartKeys,
  useCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "@/shared/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestFavoritesStore, useGuestStore } from "@/shared/stores";
import { CartSkeleton } from "@/shared/ui";
import { RegisterModal } from "@/features/auth";
import { useAuthModals } from "@/features/auth/hooks";
import type { PaymentMethodChoice } from "@/shared/lib/pricing";

const EMPTY_USER_CART: UserCartItem[] = [];

const getCartUnitPrice = (
  lineTotal: string | number | null | undefined,
  quantity: number,
  fallback: string | number | null | undefined,
) => {
  const total = Number(lineTotal);
  if (Number.isFinite(total) && quantity > 0) {
    return total / quantity;
  }

  const fallbackPrice = Number(fallback);
  return Number.isFinite(fallbackPrice) ? fallbackPrice : 0;
};

export const Basket = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Loyalty data
  const { data: loyaltyData } = useQuery({
    queryKey: ["loyaltyInfo"],
    queryFn: () => userApi.getLoyaltyInfo(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Guest cart with caching
  const { data: guestCart, isLoading: guestCartLoading } = useCart();
  const guestInitialized = useGuestStore((state) => state.isInitialized);
  const removeFromGuestCart = useRemoveFromCart();
  const updateGuestCart = useUpdateCartItem();

  // User cart - always refetch on mount to ensure fresh data
  const { data: userCart = EMPTY_USER_CART, isLoading: userCartLoading } =
    useQuery({
      queryKey: ["userCart"],
      queryFn: () => userApi.getCart(),
      enabled: isAuthenticated,
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });

  const [items, setItems] = useState<BasketItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccess, setPromoSuccess] = useState<string>("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPromoApplying, setIsPromoApplying] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodChoice>("cash");
  const isLoading = isAuthenticated ? userCartLoading : false;

  const { isRegisterOpen, openRegister, closeModals } = useAuthModals();

  const {
    toggleFavorite: toggleGuestFavorite,
    isFavorite: isGuestFavorite,
    initialize: initializeGuestFavorites,
    initialized: guestFavoritesInitialized,
  } = useGuestFavoritesStore();

  // Get user favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ["userFavorites"],
    queryFn: () => favoriteApi.getFavorites(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize guest favorites on page load to keep heart state in sync
  useEffect(() => {
    if (!isAuthenticated && !guestFavoritesInitialized) {
      initializeGuestFavorites();
    }
  }, [isAuthenticated, guestFavoritesInitialized, initializeGuestFavorites]);

  // Check if item is in favorites
  const checkIsFavorite = (productId: string): boolean => {
    if (isAuthenticated) {
      return userFavorites.some((fav) => fav.productId === productId);
    }
    return isGuestFavorite(productId);
  };

  // Load cart data based on auth status
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Wait for data to load before making decisions
    if (isAuthenticated && userCartLoading) return;
    if (!isAuthenticated && (!guestInitialized || guestCartLoading)) return;

    if (isAuthenticated) {
      if (userCart && userCart.length > 0) {
        const basketItems: BasketItem[] = userCart.map((item) => ({
          id: item.id,
          productId: item.productId,
          productSlug: item.product.slug,
          title: item.product.name,
          variantLabel: item.variantLabel,
          price: getCartUnitPrice(
            item.price,
            item.quantity,
            item.product.price,
          ),
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || "/images/iphone17.png",
          inStock: item.product.isActive,
        }));
        setItems(basketItems);
        setSelectedItems(new Set(basketItems.map((item) => item.id)));
      } else {
        setItems([]);
        setSelectedItems(new Set());
      }
    } else {
      if (guestCart?.items && guestCart.items.length > 0) {
        const basketItems: BasketItem[] = guestCart.items.map((item) => ({
          id: item.id,
          productId: item.product.id,
          productSlug: item.product.slug,
          title: item.product.name,
          variantLabel: item.variantLabel,
          price: getCartUnitPrice(
            item.subtotal,
            item.quantity,
            item.product.price,
          ),
          quantity: item.quantity,
          image: item.product.image || "/images/iphone17.png",
          inStock: true,
        }));
        setItems(basketItems);
        setSelectedItems(new Set(basketItems.map((item) => item.id)));
      } else {
        setItems([]);
        setSelectedItems(new Set());
      }
    }
  }, [
    isAuthenticated,
    userCartLoading,
    guestInitialized,
    guestCartLoading,
    guestCart,
    userCart,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRemove = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Optimistically update UI
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    try {
      if (isAuthenticated) {
        await userApi.removeFromCart(id);
        // Invalidate user cart cache to refetch
        await queryClient.invalidateQueries({ queryKey: ["userCart"] });
      } else {
        await removeFromGuestCart.mutateAsync(item.id);
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Rollback on error
      setItems((prev) => [...prev, item]);
    }
  };

  const handleQuantityChange = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const previousQuantity = item.quantity;
    const newQuantity = Math.max(1, item.quantity + delta);
    if (newQuantity === previousQuantity) return;

    // Optimistically update UI
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );

    // Sync with API
    try {
      if (isAuthenticated) {
        await userApi.updateCartItem(id, newQuantity);
        await queryClient.invalidateQueries({ queryKey: ["userCart"] });
      } else {
        await updateGuestCart.mutateAsync({
          productId: item.id,
          quantity: newQuantity,
        });
      }
    } catch (error) {
      // Rollback on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: previousQuantity } : item,
        ),
      );
      console.error("Failed to update quantity:", error);
    }
  };

  const handleFavorite = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (!isAuthenticated) {
      // For guest users, toggle guest favorites with productId
      toggleGuestFavorite(item.productId);
      return;
    }

    try {
      const isCurrentlyFavorite = userFavorites.some(
        (fav) => fav.productId === item.productId,
      );

      if (isCurrentlyFavorite) {
        await favoriteApi.removeFromFavorites(item.productId);
      } else {
        await favoriteApi.addToFavorites(item.productId);
      }

      // Refresh favorites everywhere (basket, header counter, favorites page)
      await queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Calculate totals
  const selectedTotal = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cashbackRate = loyaltyData?.cashbackRate ?? 0.01;
  const cashback = Math.round(selectedTotal * cashbackRate);

  // Download cart as text file
  const handleDownload = useCallback(() => {
    const selectedItemsList = items.filter((item) =>
      selectedItems.has(item.id),
    );
    if (selectedItemsList.length === 0) {
      alert("Выберите товары для скачивания");
      return;
    }

    let content = "КОРЗИНА - Prime Electronics\n";
    content += "================================\n\n";
    content += `Дата: ${new Date().toLocaleDateString("ru-RU")}\n\n`;
    content += "Товары:\n";
    content += "--------------------------------\n";

    selectedItemsList.forEach((item, index) => {
      content += `${index + 1}. ${item.title}\n`;
      content += `   Цена: ${item.price.toLocaleString("ru-RU")} ₽\n`;
      content += `   Количество: ${item.quantity}\n`;
      content += `   Сумма: ${(item.price * item.quantity).toLocaleString(
        "ru-RU",
      )} ₽\n`;
      content += "--------------------------------\n";
    });

    content += `\nИТОГО: ${selectedTotal.toLocaleString("ru-RU")} ₽\n`;
    content += `Кешбэк: ${cashback} бонусов\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cart-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items, selectedItems, selectedTotal, cashback]);

  // Print cart
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Share cart
  const handleShare = useCallback(async () => {
    const shareData = {
      title: "Моя корзина - Prime Electronics",
      text: `Моя корзина на ${selectedTotal.toLocaleString("ru-RU")} ₽`,
      url: window.location.href,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Ссылка скопирована в буфер обмена");
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  }, [selectedTotal]);

  // Quick order submit - uses quick-buy API for each item
  const handleQuickOrderSubmit = useCallback(
    async (phone: string, name: string) => {
      const selectedItemsList = items.filter((i) => selectedItems.has(i.id));

      if (selectedItemsList.length === 0) {
        throw new Error("Выберите товары для заказа");
      }

      // Quick buy now uses cart-based approach
      await orderApi.quickBuy(
        {
          buyer: name,
          phone,
        },
        !isAuthenticated,
      );

      // Clear cart after successful order
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
      queryClient.invalidateQueries({ queryKey: cartKeys.guest() });
    },
    [isAuthenticated, items, selectedItems, queryClient],
  );

  const getCouponErrorMessage = (error: unknown) => {
    const parsedError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const message = parsedError.response?.data?.message || parsedError.message;

    if (message === "Coupon not found") {
      return "Промокод не найден";
    }
    if (message === "Coupon is not active") {
      return "Промокод сейчас не активен";
    }
    if (message === "Coupon is not yet valid") {
      return "Промокод пока недоступен";
    }
    if (message === "Coupon has expired") {
      return "Срок действия промокода истек";
    }
    if (message === "Coupon usage limit reached") {
      return "Лимит использования промокода исчерпан";
    }

    return "Не удалось применить промокод";
  };

  const formatCouponDiscount = (coupon: {
    type?: string;
    value?: number | string;
  }) => {
    const numericValue = Number(coupon.value);
    if (!Number.isFinite(numericValue)) return "";

    if (coupon.type === "PERCENTAGE") {
      return `${numericValue}%`;
    }

    return `${numericValue.toLocaleString("ru-RU")} ₽`;
  };

  const handleApplyPromo = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;

    setIsPromoApplying(true);
    setPromoError("");
    setPromoSuccess("");
    setAppliedPromoCode("");

    try {
      const result = await couponApi.validate(normalizedCode);
      const discountText = formatCouponDiscount(result.coupon);
      setAppliedPromoCode(result.coupon.code || normalizedCode);
      setPromoSuccess(
        discountText
          ? `Промокод применен: скидка ${discountText}`
          : "Промокод применен",
      );
    } catch (error) {
      setPromoError(getCouponErrorMessage(error));
    } finally {
      setIsPromoApplying(false);
    }
  };

  // Handle checkout - works for both authenticated and guest users
  const handleCheckout = async () => {
    setCheckoutError("");

    if (items.length === 0 || selectedItems.size === 0) {
      setCheckoutError("Выберите товары для оформления заказа");
      return;
    }

    // Require authentication for checkout
    if (!isAuthenticated) {
      openRegister();
      return;
    }

    setIsCheckoutLoading(true);

    try {
      // Refetch cart to ensure checkout receives the latest cart data.
      await queryClient.invalidateQueries({ queryKey: ["userCart"] });

      const checkoutParams = new URLSearchParams();
      if (appliedPromoCode) {
        checkoutParams.set("promoCode", appliedPromoCode);
      }
      checkoutParams.set("paymentMethod", paymentMethod);

      const queryString = checkoutParams.toString();
      router.push(queryString ? `/checkout?${queryString}` : "/checkout");
    } catch (error: unknown) {
      console.error("[Checkout] Failed to open checkout:", error);
      const parsedError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        parsedError.response?.data?.message ||
        parsedError.message ||
        "Не удалось перейти к оформлению. Попробуйте еще раз.";
      setCheckoutError(
        message === "Cart is empty"
          ? "Корзина пуста. Добавьте товары и попробуйте снова."
          : message,
      );
      // Scroll to error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Handle quick order
  const handleQuickOrderOpen = () => {
    if (items.length === 0 || selectedItems.size === 0) {
      setCheckoutError("Выберите товары для заказа");
      return;
    }

    console.log("[QuickOrder] Opening modal...", {
      itemsCount: items.length,
      selectedCount: selectedItems.size,
    });
    setIsQuickOrderOpen(true);
  };

  const handleNavigateToCategories = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    window.location.href = "/categories";
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] min-h-[900px] mx-auto md:min-h-0">
        <div className="mb-[20px] md:mb-[30px] lg:mb-[40px]">
          <a
            href="/categories"
            onClick={handleNavigateToCategories}
            className="flex items-center gap-[4px] md:gap-[6px] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors group"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="rotate-90 scale-y-[-1]"
            >
              <path
                d="M1.8 3.5L5 6.7L8.2 3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4]">
              Вернуться к покупкам
            </span>
          </a>
        </div>
        <h1 className="font-medium text-[32px] md:text-[38px] lg:text-[46px] leading-[1.1] text-[#131314] mb-[20px] md:mb-[30px] lg:mb-[40px]">
          Корзина
        </h1>
        <div className="max-w-[900px]">
          <CartSkeleton />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[900px] flex-col items-center justify-center py-[60px] md:min-h-0 md:py-[80px] lg:py-[100px] gap-[20px] md:gap-[24px] lg:gap-[30px]">
        <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] bg-[#f5f5f7] rounded-full flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] text-[rgba(19,19,20,0.4)]"
          >
            <path
              d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] text-[#131314]">
            Корзина пуста
          </p>
          <p className="font-normal text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[rgba(19,19,20,0.4)] mt-[8px]">
            Добавьте товары в корзину
          </p>
        </div>
        <a
          href="/categories"
          onClick={handleNavigateToCategories}
          className="bg-[#131314] text-white px-[24px] md:px-[32px] lg:px-[40px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[12px] md:rounded-[14px] font-normal text-[16px] md:text-[18px] lg:text-[20px] leading-[1.1] hover:bg-[#2c2c2e] transition-colors"
        >
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px] md:gap-[30px] lg:gap-[40px]">
      {/* Header */}
      <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]">
        <a
          href="/categories"
          onClick={handleNavigateToCategories}
          className="flex items-center gap-[4px] md:gap-[6px] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors group"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="rotate-90 scale-y-[-1]"
          >
            <path
              d="M1.8 3.5L5 6.7L8.2 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4]">
            Вернуться к покупкам
          </span>
        </a>
        <div className="w-full flex items-center justify-between">
          <h1 className="font-medium text-[32px] md:text-[38px] lg:text-[46px] leading-[1.1] text-[#131314]">
            Корзина
          </h1>
          <div className="flex items-center justify-end gap-[8px] md:gap-[10px] mb-[16px] md:mb-[18px] lg:mb-[20px]">
            <button
              onClick={handleDownload}
              className="w-[36px] h-[36px] md:w-[38px] md:h-[38px] lg:w-[40px] lg:h-[40px] flex items-center justify-center rounded-[8px] border border-[rgba(19,19,20,0.16)] hover:bg-[#f5f5f7] transition-colors"
              aria-label="Скачать"
              title="Скачать список товаров"
            >
              <Image
                src="/icons/download.svg"
                alt="Download"
                width={20}
                height={20}
              />
            </button>
            <button
              onClick={handlePrint}
              className="w-[36px] h-[36px] md:w-[38px] md:h-[38px] lg:w-[40px] lg:h-[40px] flex items-center justify-center rounded-[8px] border border-[rgba(19,19,20,0.16)] hover:bg-[#f5f5f7] transition-colors"
              aria-label="Печать"
              title="Распечатать корзину"
            >
              <Image
                src="/icons/print.svg"
                alt="Print"
                width={20}
                height={20}
              />
            </button>
            {/* Share Icon */}
            <button
              onClick={handleShare}
              className="w-[36px] h-[36px] md:w-[38px] md:h-[38px] lg:w-[40px] lg:h-[40px] flex items-center justify-center rounded-[8px] border border-[rgba(19,19,20,0.16)] hover:bg-[#f5f5f7] transition-colors"
              aria-label="Поделиться"
              title="Поделиться корзиной"
            >
              <Image
                src="/icons/share.svg"
                alt="Share"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-[20px] md:gap-[24px] lg:gap-[30px]">
        <div className="flex-1">
          <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]">
            {items.map((item) => (
              <BasketItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                isFavorite={checkIsFavorite(item.productId)}
                onSelect={handleSelect}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-[380px] xl:w-[500px] 2xl:w-[547px] shrink-0 lg:sticky lg:top-[20px] lg:self-start">
          {checkoutError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[12px] px-[16px] py-[12px] mb-[12px] text-[14px]">
              {checkoutError}
            </div>
          )}
          <OrderSummary
            total={selectedTotal}
            cashback={cashback}
            promoError={promoError}
            promoSuccess={promoSuccess}
            appliedPromoCode={appliedPromoCode}
            isPromoApplying={isPromoApplying}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onApplyPromo={handleApplyPromo}
            onQuickOrder={handleQuickOrderOpen}
            onCheckout={handleCheckout}
            isCheckoutLoading={isCheckoutLoading}
          />
        </div>
      </div>

      {/* Quick Order Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        total={selectedTotal}
        itemsCount={items.filter((i) => selectedItems.has(i.id)).length}
        onSubmit={handleQuickOrderSubmit}
      />

      {/* Auth Modal */}
      <RegisterModal isOpen={isRegisterOpen} onClose={closeModals} />
    </div>
  );
};
