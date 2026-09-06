"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar, OrdersTable } from "@/features/account";
import { accountTabs } from "@/features/account";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi } from "@/shared/api/userApi";
import type { UserOrder } from "@/shared/api/userApi";
import type { OrderStatus } from "@/features/account/model/types";
import { OrdersPageSkeleton } from "@/shared/ui";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingOrders(true);
        const ordersData = await userApi.getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return <OrdersPageSkeleton />;
  }

  // Transform API orders to component format
  const transformedOrders = orders.map((order) => ({
    id: String(order.id),
    orderNumber: String(order.id),
    status: order.status as OrderStatus,
    date: new Date(order.createdAt).toLocaleDateString("ru-RU"),
    itemsCount: order.items.length,
    customerName: order.buyer || "",
    totalAmount: parseFloat(order.finalTotal) || 0,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      <AccountSidebar tabs={accountTabs} onLogout={handleLogout} />

      {isLoading || isLoadingOrders ? (
        <div className="flex-1">
          <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px] animate-pulse">
            <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
            <div className="flex flex-col gap-[16px]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-[80px] bg-gray-100 rounded-[12px] p-[20px]"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-[8px]">
                      <div className="h-[20px] w-[120px] bg-gray-200 rounded" />
                      <div className="h-[16px] w-[80px] bg-gray-200 rounded" />
                    </div>
                    <div className="h-[24px] w-[100px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <OrdersTable orders={transformedOrders} />
      )}
    </div>
  );
}
