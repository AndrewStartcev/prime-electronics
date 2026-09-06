"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/shared/api/orderApi";
import { getProductUrl } from "@/shared/lib/productUrl";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getById(orderId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ef6f2e] border-r-transparent"></div>
          <p className="mt-4 text-lg text-[rgba(19,19,20,0.6)]">
            Загрузка заказа...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h1 className="text-2xl font-bold text-[#131314] mb-2">
            Заказ не найден
          </h1>
          <p className="text-[rgba(19,19,20,0.6)] mb-6">
            Заказ #{id} не существует или был удален
          </p>
          <Link
            href="/"
            className="inline-block bg-[#ef6f2e] hover:bg-[#d96329] text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const isCashPayment = order.payment?.method === "CASH";
  const isPaymentPending = order.payment?.status === "PENDING";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
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
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#131314] mb-3">
            Заказ успешно оформлен!
          </h1>
          <p className="text-lg text-[rgba(19,19,20,0.6)]">
            Номер заказа:{" "}
            <span className="font-semibold text-[#131314]">#{order.id}</span>
          </p>
        </div>

        {/* Cash Payment Warning */}
        {isCashPayment && isPaymentPending && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-orange-50 border-l-4 border-[#ef6f2e] p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#ef6f2e]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#131314] mb-2">
                    Оплата наличными при получении
                  </h3>
                  <p className="text-[rgba(19,19,20,0.8)]">
                    Приготовьте наличные к моменту получения заказа. Оплата
                    производится курьеру или в пункте самовывоза.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#131314]">
                  Детали заказа
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <Link
                      key={item.id}
                      href={getProductUrl({
                        id: String(item.product?.id ?? item.productId),
                        slug: item.product?.slug,
                      })}
                      className="flex items-center gap-4 p-4 bg-[#f5f5f7] rounded-xl transition-colors hover:bg-[#ededf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef6f2e]"
                      aria-label={`Открыть карточку товара ${
                        item.product?.title || `Товар #${item.productId}`
                      }`}
                    >
                      <div className="relative product-watermark w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
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
                        <p className="font-medium text-[#131314]">
                          {item.product?.title || `Товар #${item.productId}`}
                        </p>
                        <p className="text-sm text-[rgba(19,19,20,0.6)] mt-1">
                          Количество: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[#131314]">
                        {(Number(item.price) * item.quantity).toLocaleString(
                          "ru-RU",
                        )}{" "}
                        ₽
                      </p>
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[rgba(19,19,20,0.6)]">Подытог</span>
                      <span className="text-[#131314]">
                        {Number(order.total).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[rgba(19,19,20,0.6)]">
                          Скидка
                        </span>
                        <span className="text-red-600">
                          - {Number(order.discount).toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-gray-200">
                      <span className="text-[#131314]">Итого</span>
                      <span className="text-[#131314]">
                        {Number(order.finalTotal).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info */}
            {order.payment && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-[#131314]">
                    Оплата
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[rgba(19,19,20,0.6)]">Способ</span>
                    <span className="font-medium text-[#131314]">
                      {order.payment.method === "CASH"
                        ? "Наличными"
                        : "Онлайн оплата"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[rgba(19,19,20,0.6)]">Статус</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.payment.status === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.payment.status === "PENDING"
                        ? "Ожидает оплаты"
                        : "Оплачено"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[rgba(19,19,20,0.6)]">Сумма</span>
                    <span className="font-semibold text-[#131314]">
                      {Number(order.payment.amount).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Info */}
            {order.pickupPoint && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-[#131314]">
                    Самовывоз
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <p className="font-medium text-[#131314] mb-1">
                      {order.pickupPoint.title}
                    </p>
                    <p className="text-sm text-[rgba(19,19,20,0.6)]">
                      {order.pickupPoint.address}
                    </p>
                  </div>
                  {order.pickupWindow && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-[rgba(19,19,20,0.6)] mb-1">
                        Окно самовывоза
                      </p>
                      <p className="font-medium text-[#131314]">
                        {new Date(order.pickupWindow.date).toLocaleDateString(
                          "ru-RU",
                        )}
                        , {order.pickupWindow.timeFrom} —{" "}
                        {order.pickupWindow.timeTo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full text-center bg-[#131314] hover:bg-[#2c2c2e] text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Продолжить покупки
              </Link>
              <Link
                href="/account/orders"
                className="block w-full text-center bg-white hover:bg-gray-50 text-[#131314] border border-gray-200 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Мои заказы
              </Link>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#131314]">
              Что дальше?
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#ef6f2e] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#131314] mb-2">
                    Подтверждение заказа
                  </h3>
                  <p className="text-sm text-[rgba(19,19,20,0.6)]">
                    Наш менеджер перезвонит вам в течение 15 минут, в рабочее
                    время с 11:00 до 21:00, для подтверждения заказа и
                    уточнения деталей доставки.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#ef6f2e] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#131314] mb-2">
                    Обработка заказа
                  </h3>
                  <p className="text-sm text-[rgba(19,19,20,0.6)]">
                    Мы подготовим ваш заказ к выдаче
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#ef6f2e] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#131314] mb-2">
                    Получение заказа
                  </h3>
                  <p className="text-sm text-[rgba(19,19,20,0.6)]">
                    Заберите заказ в выбранное время
                    {isCashPayment && " и оплатите наличными"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
