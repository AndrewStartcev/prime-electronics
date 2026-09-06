"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { userApi } from "@/shared/api/userApi";
import { useCart } from "@/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import CatalogueIcon from "@/shared/ui/Icons/CatalogueIcon";
import SearchIcon from "@/shared/ui/Icons/SearchIcon";
import HomeIcon from "@/shared/ui/Icons/HomeIcon";
import CartIcon from "@/shared/ui/Icons/CartIcon";
import UserIcon from "@/shared/ui/Icons/UserIcon";

const menuItems = [
  {
    id: "search",
    label: "Поиск",
    icon: <SearchIcon />,
    href: "/search",
  },
  {
    id: "cart",
    label: "Корзина",
    icon: <CartIcon />,
    href: "/basket",
    badge: 2,
  },
  {
    id: "home",
    label: "Главная",
    icon: <HomeIcon />,
    href: "/",
    isMain: true,
  },
  {
    id: "account",
    label: "Кабинет",
    icon: <UserIcon />,
    href: "/account",
  },
  {
    id: "catalog",
    label: "Каталог",
    icon: <CatalogueIcon />,
    href: "/categories",
  },
];

export const MobileBottomMenu = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { data: guestCart } = useCart();
  const isModalOpen = useModalStore((state) => state.isModalOpen);

  // User cart with caching
  const { data: userCart = [] } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => userApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const cartCount = isAuthenticated
    ? userCart.length
    : guestCart?.itemCount || 0;
  const hiddenOnRoutes = ["/checkout"];
  const isHiddenRoute = hiddenOnRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isHiddenRoute) {
    return null;
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 h-[64px] rounded-t-xl bg-white shadow-[0px_-2px_20px_0px_rgba(19,19,20,0.08)] md:hidden z-50 transition-transform duration-300 ${
        isModalOpen ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-[375px] mx-auto h-full flex items-center justify-around">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          if (item.isMain) {
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={false}
                className="relative flex flex-col items-center justify-center w-[56px] h-full"
              >
                <div className="absolute -top-[19px] bg-[#ef6f2e] rounded-[12px] size-[44px] flex items-center justify-center">
                  {item.icon}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              className="relative flex flex-col items-center justify-center gap-[4px] min-w-[48px] h-full px-[4px]"
            >
              <div
                className={`size-[20px] flex items-center justify-center ${
                  isActive ? "text-[#ef6f2e]" : "text-[rgba(19,19,20,0.45)]"
                }`}
              >
                {item.icon}
              </div>
              <p
                className={`font-normal text-[11px] leading-[1.1] text-center ${
                  isActive ? "text-[#ef6f2e] font-medium" : "text-[rgba(19,19,20,0.45)]"
                }`}
              >
                {item.label}
              </p>
              {item.badge && item.id === "cart" && cartCount > 0 && (
                <div className="absolute top-[8px] right-[0px] size-[14px] bg-[#ef6f2e] rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px] font-medium leading-none">
                    {cartCount}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
