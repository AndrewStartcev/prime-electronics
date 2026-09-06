"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartDropdown } from "@/widgets/CartDropdown";
import { RegisterModal } from "@/features/auth";
import { useAuthModals } from "@/features/auth/hooks";
import { useAuthStore, useCompareStore } from "@/shared/stores";
import { useCart } from "@/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/api/userApi";

interface DesktopActionsProps {
  onProfileClick?: () => void;
  isDark?: boolean;
  withModals?: boolean;
}

export const DesktopActions = ({
  onProfileClick,
  isDark = false,
  withModals = false,
}: DesktopActionsProps) => {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRegisterOpen,
    openRegister,
    closeModals,
  } = useAuthModals();

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsClosing(false);
    setIsCartOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsClosing(true);
    timeoutRef.current = setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
    }, 150);
  }, []);

  const { isAuthenticated, user } = useAuthStore();
  const { data: cart } = useCart();
  const { data: userCart = [] } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => userApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const cartItemCount = isAuthenticated ? userCart.length : (cart?.itemCount || 0);
  const compareItems = useCompareStore((state) => state.compareItems);
  const compareCount = compareItems.length;

  console.log("[DesktopActions] Auth state:", { isAuthenticated, user });

  const handleProfileClick = useCallback(() => {
    console.log(
      "[DesktopActions] Profile click, isAuthenticated:",
      isAuthenticated,
    );

    // Если пользователь авторизован, всегда переходим в личный кабинет
    if (isAuthenticated) {
      router.push("/account");
      return;
    }

    // Если не авторизован
    if (withModals) {
      openRegister();
    } else if (onProfileClick) {
      onProfileClick();
    } else {
      // По умолчанию открываем регистрацию
      router.push("/register");
    }
  }, [withModals, onProfileClick, openRegister, isAuthenticated, router]);

  return (
    <>
      <div className="flex items-center gap-[10px] md:gap-[12px] lg:gap-[18px] xl:gap-[20px]">
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-[8px] hover:opacity-80 transition-opacity"
          aria-label="Profile"
        >
          <span className="w-[36px] h-[36px] lg:w-[40px] lg:h-[40px] rounded-full bg-[#ef6f2e] flex items-center justify-center transition-transform hover:scale-105">
            <img
              src="/icons/user.svg"
              alt="Profile"
              width={20}
              height={20}
              className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] brightness-0 invert"
            />
          </span>
        </button>
        <Link
          href="/account/favorites"
          className="hover:opacity-80 transition-opacity"
          aria-label="Favorites"
        >
          <img
            src={isDark ? "/icons/bookmark-dark.svg" : "/icons/bookmark.svg"}
            alt="Favorites"
            className="w-[20px] h-[20px]"
          />
        </Link>
        <Link
          href="/compare"
          className="hover:opacity-80 transition-opacity relative"
          aria-label="Compare"
        >
          <img
            src={isDark ? "/icons/compare-dark.svg" : "/icons/compare.svg"}
            alt="Compare"
            className="w-[20px] h-[20px]"
          />
          {compareCount > 0 && (
            <span className="absolute -top-[6px] -right-[6px] bg-primary-orange text-white text-[10px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center">
              {compareCount}
            </span>
          )}
        </Link>
        <div
          className="relative flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/basket"
            className="hover:opacity-80 transition-opacity relative"
            aria-label="Cart"
          >
            <img
              src={isDark ? "/icons/cart-dark.svg" : "/icons/cart.svg"}
              alt="Cart"
              className="w-[20px] h-[20px]"
            />
            {cartItemCount > 0 && (
              <span className="absolute -top-[4px] -right-[4px] min-w-[18px] h-[18px] px-[4px] bg-[#ef6f2e] text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
          {isCartOpen && (
            <CartDropdown
              isClosing={isClosing}
              onClose={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setIsCartOpen(false);
                  setIsClosing(false);
                }, 150);
              }}
            />
          )}
        </div>
      </div>

      {withModals && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={closeModals}
        />
      )}
    </>
  );
};
