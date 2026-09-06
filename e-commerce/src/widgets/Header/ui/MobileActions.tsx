"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/shared/ui";
import { useCart } from "@/shared/hooks";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/api/userApi";

interface MobileActionsProps {
  onMenuClick?: () => void;
  isDark?: boolean;
}

export const MobileActions = ({
  onMenuClick,
  isDark = false,
}: MobileActionsProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: cart } = useCart();
  const { data: userCart = [] } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => userApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const cartItemCount = isAuthenticated ? userCart.length : (cart?.itemCount || 0);

  return (
    <div className="flex items-center">
      <IconButton
        icon={isDark ? "/icons/burger-black.svg" : "/icons/burger.svg"}
        alt="Menu"
        variant="bordered"
        size="lg"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="order-1"
      />
      <IconButton
        icon={isDark ? "/icons/bookmark-dark.svg" : "/icons/bookmark.svg"}
        alt="Favorites"
        variant="bordered"
        size="lg"
        aria-label="Favorites"
        className="order-2"
        onClick={() => router.push("/account/favorites")}
      />
      <div className="relative order-3">
        <div className="relative">
          <IconButton
            icon={isDark ? "/icons/cart-black.svg" : "/icons/cart.svg"}
            alt="Cart"
            variant="bordered"
            size="lg"
            aria-label="Cart"
            onClick={() => router.push("/basket")}
          />
          {cartItemCount > 0 && (
            <span className="absolute -top-[6px] -right-[6px] min-w-[20px] h-[20px] px-[5px] bg-[#ef6f2e] text-white text-[12px] font-semibold rounded-full flex items-center justify-center pointer-events-none">
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
