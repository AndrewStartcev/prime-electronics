"use client";

import { use } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  StatusDropdown,
} from "@/shared/ui";
import { useOrder, useUpdateOrderStatus } from "@/shared/hooks/useOrders";
import {
  usePaymentByOrder,
  useUpdatePaymentStatus,
} from "@/shared/hooks/usePayments";
import { PaymentStatus } from "@/shared/api/paymentsApi";
import {
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  OrderStatus,
} from "@/entities/order/model/types";
import { useState } from "react";

const statusVariants: Record<
  OrderStatus,
  "default" | "success" | "warning" | "danger"
> = {
  PENDING: "warning",
  PROCESSING: "default",
  CONFIRMED: "success",
  PAYED: "success",
  ASSEMBLED: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const paymentStatusVariants: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger"
> = {
  PENDING: "warning",
  COMPLETED: "success",
  REFUNDED: "danger",
};

const cancellableOrderStatuses: OrderStatus[] = ["PENDING", "PROCESSING"];
const cancelDisabledReason = "Отмена доступна только до статуса Подтвержден";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);

  const { data: order, isLoading, error } = useOrder(id);
  const { data: payment, isLoading: isLoadingPayment } =
    usePaymentByOrder(orderId);
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-orange border-r-transparent"></div>
          <p className="mt-4 text-sm text-text-secondary-black">
            Загрузка заказа...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-primary-black">
            Заказ не найден
          </p>
          <p className="mt-2 text-sm text-text-secondary-black">
            Заказ #{id} не существует или был удален
          </p>
          <Link href="/orders">
            <Button className="mt-4">Вернуться к списку заказов</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    if (selectedStatus === "CANCELLED" && !canCancelOrder) return;

    await updateOrderStatus.mutateAsync({
      id: id,
      data: { status: selectedStatus },
    });
    setSelectedStatus("");
  };

  const handleMarkAsPaid = async () => {
    if (!payment || payment.method !== "CASH") return;

    setIsUpdatingPayment(true);
    try {
      await updatePaymentStatus.mutateAsync({
        orderId,
        data: { status: PaymentStatus.COMPLETED },
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const canMarkAsPaid =
    payment && payment.method === "CASH" && payment.status === "PENDING";
  const canCancelOrder = cancellableOrderStatuses.includes(
    order.status as OrderStatus,
  );
  const disabledStatusReasons = canCancelOrder
    ? undefined
    : ({ CANCELLED: cancelDisabledReason } as Partial<
        Record<OrderStatus, string>
      >);

  const bonusAmount = Number(order.bonusEarned || 0);
  const bonusAvailableAt = order.bonusAccrualAvailableAt
    ? new Date(order.bonusAccrualAvailableAt)
    : null;
  const bonusAccruedAt = order.bonusAccruedAt
    ? new Date(order.bonusAccruedAt)
    : null;
  const formatRub = (value: number) =>
    value.toLocaleString("ru-RU").replace(/,/g, " ");
  const formatDateTime = (value: Date) => value.toLocaleString("ru-RU");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="text-text-secondary-black hover:text-primary-black"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-primary-black">
              Заказ #{order.id}
            </h1>
            <Badge
              variant={
                statusVariants[order.status as keyof typeof statusVariants] ||
                "default"
              }
            >
              {orderStatusLabels[
                order.status as keyof typeof orderStatusLabels
              ] || order.status}
            </Badge>
            {order.buyer && !order.email && !order.address && (
              <Badge variant="info" className="gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Купить в 1 клик
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary-black mt-1">
            Создан: {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Печать
          </Button>
          <div className="flex items-center gap-2">
            <StatusDropdown
              value={selectedStatus}
              onChange={(status) => setSelectedStatus(status)}
              currentStatus={order.status as OrderStatus}
              disabledStatusReasons={disabledStatusReasons}
            />
            {selectedStatus && (
              <Button
                onClick={handleStatusChange}
                disabled={updateOrderStatus.isPending}
                size="sm"
              >
                {updateOrderStatus.isPending ? "Обновление..." : "Применить"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Товары в заказе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-secondary-gray/50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt || item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-sm font-medium text-primary-black hover:text-primary-orange"
                      >
                        {item.product?.name || `Товар #${item.productId}`}
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-black">
                        ₽{" "}
                        {Number(item.price)
                          .toLocaleString("ru-RU")
                          .replace(/,/g, " ")}
                      </p>
                      <p className="text-xs text-text-secondary-black">
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary-black w-28 text-right">
                      ₽{" "}
                      {(Number(item.price) * item.quantity)
                        .toLocaleString("ru-RU")
                        .replace(/,/g, " ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary-black">Подытог</span>
                    <span className="text-primary-black">
                      ₽{" "}
                      {Number(order.total)
                        .toLocaleString("ru-RU")
                        .replace(/,/g, " ")}
                    </span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary-black">Скидка</span>
                      <span className="text-red-600">
                        - ₽{" "}
                        {Number(order.discount)
                          .toLocaleString("ru-RU")
                          .replace(/,/g, " ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-gray-100">
                    <span className="text-primary-black">Итого</span>
                    <span className="text-primary-black">
                      ₽{" "}
                      {Number(order.finalTotal)
                        .toLocaleString("ru-RU")
                        .replace(/,/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Buy Alert */}
          {order.buyer && !order.email && !order.address && (
            <Card className="border-2 border-primary-orange bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-orange">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Заказ "Купить в 1 клик"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Клиент оформил заказ через форму быстрого заказа. Необходимо
                    связаться с клиентом для подтверждения.
                  </p>
                  <div className="p-3 bg-white rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-gray-600">Имя:</span>
                      <span className="text-sm font-medium text-right">
                        {order.buyer}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-gray-600">Телефон:</span>
                      <a
                        href={`tel:${order.phone}`}
                        className="text-sm font-medium text-primary-orange hover:underline"
                      >
                        {order.phone}
                      </a>
                    </div>
                  </div>
                  {order.phone && (
                    <a
                      href={`tel:${order.phone}`}
                      className="flex items-center justify-center w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Позвонить сейчас
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Покупатель</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-gray rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-black">
                      {(order.buyer || order.user?.name || "Гость")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    {order.userId ? (
                      <Link
                        href={`/users/${order.userId}`}
                        className="text-sm font-medium text-primary-black hover:text-primary-orange"
                      >
                        {order.buyer || order.user?.name || "Гость"}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-primary-black">
                        {order.buyer || "Гость"}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary-black">
                      {order.email || order.user?.email || "Нет email"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary-black">Телефон</span>
                    {order.phone || order.user?.phone ? (
                      <a
                        href={`tel:${order.phone || order.user?.phone}`}
                        className="text-primary-orange hover:underline font-medium"
                      >
                        {order.phone || order.user?.phone}
                      </a>
                    ) : (
                      <span className="text-text-secondary-black">
                        Не указан
                      </span>
                    )}
                  </div>
                  {order.buyer && (
                    <div className="flex items-center justify-between text-sm mb-2 p-2 bg-blue-50 rounded-lg">
                      <span className="text-blue-700 text-xs font-medium">
                        💡 Заказ "Купить в 1 клик"
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary-black">Доставка</span>
                    <span className="text-primary-black">
                      {order.deliveryMethod === "DELIVERY"
                        ? "Доставка"
                        : "Самовывоз"}
                    </span>
                  </div>
                  {order.address && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary-black">Адрес</span>
                      <span className="text-primary-black text-right">
                        {order.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Оплата</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Always show payment method from order */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary-black">
                    Способ оплаты
                  </span>
                  <span className="text-primary-black font-medium">
                    {order.paymentMethod === "CASH"
                      ? "💵 Наличные"
                      : "💳 Робокасса"}
                  </span>
                </div>

                {!isLoadingPayment && payment && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary-black">
                        Статус оплаты
                      </span>
                      <Badge variant={paymentStatusVariants[payment.status]}>
                        {paymentStatusLabels[payment.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary-black">Сумма</span>
                      <span className="text-primary-black font-medium">
                        ₽{" "}
                        {Number(payment.amount)
                          .toLocaleString("ru-RU")
                          .replace(/,/g, " ")}
                      </span>
                    </div>

                    {/* Mark as Paid Button for CASH payments */}
                    {canMarkAsPaid && (
                      <div className="pt-3 border-t border-gray-100">
                        <Button
                          onClick={handleMarkAsPaid}
                          disabled={isUpdatingPayment}
                          className="w-full"
                        >
                          {isUpdatingPayment ? (
                            <>
                              <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                              Обновление...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Отметить как оплачено
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-text-secondary-black mt-2 text-center">
                          Статус заказа автоматически изменится на
                          &quot;Оплачен&quot;
                        </p>
                      </div>
                    )}

                    {payment.status === "COMPLETED" &&
                      payment.method === "CASH" && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <svg
                              className="w-5 h-5 text-green-600 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-xs text-green-700">
                              Оплата наличными получена
                            </p>
                          </div>
                        </div>
                      )}
                  </>
                )}

                {isLoadingPayment && (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-orange border-r-transparent"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bonus Info */}
          <Card>
            <CardHeader>
              <CardTitle>Бонусы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary-black">
                    К начислению
                  </span>
                  <span className="text-primary-black font-medium">
                    {formatRub(bonusAmount)} бонусов
                  </span>
                </div>

                {!order.userId ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-text-secondary-black">
                    Гостевой заказ: бонусы начисляются только
                    зарегистрированным пользователям.
                  </div>
                ) : bonusAccruedAt ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      Начислено
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {formatDateTime(bonusAccruedAt)}
                    </p>
                  </div>
                ) : bonusAvailableAt ? (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-primary-orange">
                      Ожидает начисления
                    </p>
                    <p className="text-xs text-primary-orange mt-1">
                      Начислится после {formatDateTime(bonusAvailableAt)}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-text-secondary-black">
                    Начисление появится после смены статуса заказа на
                    &quot;Выдан&quot;.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pickup Info */}
          {order.pickupPoint && (
            <Card>
              <CardHeader>
                <CardTitle>Самовывоз</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-primary-black">
                      {order.pickupPoint.name}
                    </p>
                    <p className="text-xs text-text-secondary-black mt-0.5">
                      {order.pickupPoint.address}
                    </p>
                  </div>
                  {order.pickupWindow && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-text-secondary-black">
                        Окно самовывоза
                      </p>
                      <p className="text-sm font-medium text-primary-black mt-0.5">
                        {new Date(order.pickupWindow.start).toLocaleString(
                          "ru-RU",
                        )}{" "}
                        -{" "}
                        {new Date(order.pickupWindow.end).toLocaleString(
                          "ru-RU",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Отправить уведомление
                </Button>
                <Button
                  variant="outline"
                  disabled={!canCancelOrder || updateOrderStatus.isPending}
                  className="w-full justify-start text-red-600 hover:bg-red-50 disabled:hover:bg-transparent"
                  onClick={() => {
                    if (!canCancelOrder) return;
                    if (confirm("Вы уверены, что хотите отменить заказ?")) {
                      updateOrderStatus.mutate({
                        id: id,
                        data: { status: "CANCELLED" },
                      });
                    }
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Отменить заказ
                </Button>
                {!canCancelOrder && (
                  <p className="text-xs text-text-secondary-black">
                    {cancelDisabledReason}.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
