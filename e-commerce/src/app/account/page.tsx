"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar, AccountCard, ProfileHeader } from "@/features/account";
import { accountTabs, accountCards } from "@/features/account";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi } from "@/shared/api/userApi";
import type { UserProfile, UserOrder, UserCart, LoyaltyInfo } from "@/shared/api/userApi";
import { AccountPageSkeleton } from "@/shared/ui";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [cart, setCart] = useState<UserCart | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingData(true);
        const [profileData, ordersData, cartData, favCount, loyalty] = await Promise.all(
          [
            userApi.getProfile(),
            userApi.getOrders(),
            userApi.getCart(),
            userApi.getFavoritesCount(),
            userApi.getLoyaltyInfo().catch(() => null),
          ]
        );
        setProfile(profileData);
        setOrders(ordersData);
        setCart({ items: cartData });
        setFavoritesCount(favCount);
        setLoyaltyInfo(loyalty);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return <AccountPageSkeleton />;
  }

  const displayUser = profile
    ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bonusBalance: loyaltyInfo?.balance ?? 0,
        tierName: loyaltyInfo?.tier?.name,
        cashbackRate: loyaltyInfo?.cashbackRate,
      }
    : {
        id: user?.id || "",
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bonusBalance: loyaltyInfo?.balance ?? 0,
        tierName: loyaltyInfo?.tier?.name,
        cashbackRate: loyaltyInfo?.cashbackRate,
      };

  // Update account cards with real data
  const updatedAccountCards = accountCards.map((card) => {
    if (card.id === "orders") {
      return {
        ...card,
        subtitle:
          orders.length > 0 ? `${orders.length} заказов` : "Нет заказов",
      };
    }
    if (card.id === "favorites") {
      return {
        ...card,
        subtitle:
          favoritesCount > 0 ? `${favoritesCount} товара` : "Нет товаров",
      };
    }
    return card;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      <AccountSidebar tabs={accountTabs} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
        {isLoading || isLoadingData ? (
          <>
            {/* Profile Header Skeleton */}
            <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[16px] md:p-[20px] xl:p-[24px] animate-pulse">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-[16px] md:gap-[20px]">
                <div className="flex flex-col gap-[16px] md:gap-[24px] flex-1">
                  <div className="flex flex-col gap-[8px] md:gap-[14px]">
                    <div className="h-[16px] md:h-[18px] w-[100px] md:w-[120px] bg-gray-200 rounded" />
                    <div className="h-[26px] md:h-[34px] w-[200px] md:w-[300px] bg-gray-200 rounded" />
                  </div>
                  <div className="flex flex-wrap gap-[8px] md:gap-[10px]">
                    <div className="h-[36px] md:h-[42px] w-[160px] md:w-[200px] bg-gray-200 rounded-[8px]" />
                    <div className="h-[36px] md:h-[42px] w-[120px] md:w-[150px] bg-gray-200 rounded-[8px]" />
                  </div>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[24px] md:items-end">
                  <div className="h-[60px] md:h-[76px] w-[140px] md:w-[162px] bg-gray-200 rounded-[10px]" />
                </div>
              </div>
            </div>

            {/* Cards Skeleton */}
            <div className="flex flex-col sm:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-[200px] bg-white border border-[rgba(19,19,20,0.16)] rounded-[20px] p-[24px]"
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="h-[34px] w-[34px] bg-gray-200 rounded" />
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[28px] w-[150px] bg-gray-200 rounded" />
                      <div className="h-[24px] w-[100px] bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <ProfileHeader user={displayUser} />
            <div className="flex flex-col sm:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
              {updatedAccountCards.map((card) => (
                <AccountCard key={card.id} data={card} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
