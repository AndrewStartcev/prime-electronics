"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { OrderDetails } from "@/features/account/ui/OrderDetails";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi } from "@/shared/api/userApi";
import type { UserOrder } from "@/shared/api/userApi";
import type { OrderStatus } from "@/features/account/model/types";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setIsLoadingOrder(true);
        setCancelError(null);
        const orderData = await userApi.getOrder(id);
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to load order:", error);
        router.push("/account/orders");
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadOrder();
  }, [isAuthenticated, id, router]);

  const handleCancelOrder = async () => {
    if (!id || isCancellingOrder) return;

    const confirmed = window.confirm("Отменить заказ?");
    if (!confirmed) return;

    try {
      setIsCancellingOrder(true);
      setCancelError(null);
      const updatedOrder = await userApi.cancelOrder(id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setCancelError("Заказ можно отменить только до подтверждения.");
    } finally {
      setIsCancellingOrder(false);
    }
  };

  if (isLoading || isLoadingOrder || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || !order) {
    return null;
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH: "Наличные",
    ROBOKASSA: "Банковская карта",
  };

  // Transform API order to component format
  const transformedOrder = {
    id: String(order.id),
    orderNumber: String(order.id),
    status: order.status as OrderStatus,
    date: new Date(order.createdAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    }),
    time: order.pickupWindow || "Не выбрано",
    itemsCount: order.items.length,
    customerName: order.buyer || "",
    totalAmount: parseFloat(order.finalTotal) || 0,
    address: order.address || order.pickupPoint?.address || "Не выбран пункт выдачи",
    deliveryCost: 0,
    paymentMethod: paymentMethodLabels[order.paymentMethod] || order.paymentMethod,
    bonusUsed: parseFloat(order.bonusUsed) || 0,
    cashback: parseFloat(order.bonusEarned) || 0,
    products: order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      price: parseFloat(item.price) || 0,
      quantity: item.quantity,
      image: item.product.images?.[0]?.url || "/placeholder.png",
    })),
  };

  return (
    <>
      {cancelError && (
        <div className="mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">
          {cancelError}
        </div>
      )}
      <OrderDetails
        order={transformedOrder}
        isCancelling={isCancellingOrder}
        onCancel={handleCancelOrder}
      />
    </>
  );
}
