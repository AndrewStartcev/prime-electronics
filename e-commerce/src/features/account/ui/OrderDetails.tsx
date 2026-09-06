"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { OrderDetail } from "../model/types";
import { InfoButtonWithModal } from "@/shared/ui";

interface OrderDetailsProps {
  order: OrderDetail;
  isCancelling?: boolean;
  onCancel?: () => void;
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  PROCESSING: "Обрабатывается",
  CONFIRMED: "Подтвержден",
  PAYED: "Оплачен",
  ASSEMBLED: "Собран",
  SHIPPED: "Выехал",
  DELIVERED: "Выдан",
  CANCELLED: "Отменён",
};

const statusStyles: Record<string, string> = {
  PENDING: "text-[rgba(19,19,20,0.4)]",
  PROCESSING: "text-[rgba(19,19,20,0.4)]",
  CONFIRMED: "text-[#131314]",
  PAYED: "text-[#ef6f2e]",
  ASSEMBLED: "text-[#131314]",
  SHIPPED: "text-[#131314]",
  DELIVERED: "text-[#ef6f2e]",
  CANCELLED: "text-[rgba(19,19,20,0.4)]",
};

function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU") + " ₽";
}

function OrderProductCard({
  productId,
  name,
  image,
  price,
}: {
  productId: string;
  name: string;
  image: string;
  price: number;
}) {
  return (
    <Link
      href={`/product/${productId}`}
      className="flex items-center gap-3 md:gap-5 py-4 md:py-5 border-b border-[rgba(19,19,20,0.1)] last:border-0 rounded-xl transition-colors hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef6f2e]"
      aria-label={`Открыть карточку товара ${name}`}
    >
      <div className="relative product-watermark w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-[#f5f5f7] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col gap-1.5 md:gap-2 flex-1 min-w-0">
        <p className="text-[13px] md:text-sm leading-[140%] text-[#131314] line-clamp-3">
          {name}
        </p>
        <p className="text-[13px] md:text-sm font-medium text-[#131314]">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-start py-2.5 md:py-3 border-b border-[rgba(19,19,20,0.1)] last:border-0 gap-3">
      <span className="text-[13px] md:text-sm text-[rgba(19,19,20,0.6)] shrink-0">
        {label}
      </span>
      <span
        className={`text-[13px] md:text-sm text-right min-w-0 break-words ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

export const OrderDetails = memo(function OrderDetails({
  order,
  isCancelling = false,
  onCancel,
}: OrderDetailsProps) {
  const canCancel = ["PENDING", "PROCESSING"].includes(order.status);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-[rgba(19,19,20,0.6)] hover:text-[#131314] transition-colors mb-4 md:mb-5"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Вернуться к заказам
      </Link>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-medium text-[#131314] mb-4 md:mb-5">
        Детали заказа
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
        {/* Products list */}
        <div className="flex-1 min-w-0 order-2 lg:order-1">
          {order.products.map((product) => (
            <OrderProductCard
              key={product.id}
              productId={product.productId}
              name={product.name}
              image={product.image}
              price={product.price}
            />
          ))}
        </div>

        {/* Order info card */}
        <div className="w-full lg:w-[420px] xl:w-[500px] 2xl:w-[547px] flex-shrink-0 bg-white rounded-[16px] md:rounded-[20px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.05)] p-4 md:p-6 h-fit order-1 lg:order-2">
          <InfoRow
            label="№ заказа"
            value={order.orderNumber}
            valueClassName="font-medium text-[#131314]"
          />
          <InfoRow
            label="Статус:"
            value={statusLabels[order.status]}
            valueClassName={statusStyles[order.status]}
          />
          <InfoRow
            label="Дата добавления:"
            value={`${order.date} ; ${order.time}`}
            valueClassName="text-[#131314]"
          />
          <InfoRow
            label="Кол-во товаров:"
            value={`${order.itemsCount} шт.`}
            valueClassName="text-[#131314]"
          />
          {order.customerName && (
            <InfoRow
              label="Покупатель:"
              value={order.customerName}
              valueClassName="text-[#131314]"
            />
          )}
          <InfoRow
            label="Адрес:"
            value={order.address}
            valueClassName="text-[#131314]"
          />
          <InfoRow
            label="Доставка:"
            value={formatPrice(order.deliveryCost)}
            valueClassName="text-[#ef6f2e]"
          />
          <InfoRow
            label="Оплата:"
            value={order.paymentMethod}
            valueClassName="text-[#131314]"
          />
          <InfoRow
            label="Оплата бонусами:"
            value={`- ${order.bonusUsed} бонусов`}
            valueClassName="text-[#ef6f2e]"
          />
          <div className="flex justify-between items-center py-2.5 md:py-3 border-b border-[rgba(19,19,20,0.1)]">
            <span className="text-[13px] md:text-sm text-[rgba(19,19,20,0.6)] flex items-center gap-1">
              Кешбэк за заказ
              <InfoButtonWithModal title="Кешбэк за заказ" iconSize={16}>
                <div className="space-y-[16px]">
                  <div className="bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-[14px] p-[16px] md:p-[20px]">
                    <div className="flex items-center justify-between mb-[12px]">
                      <span className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.7)]">
                        Начислено бонусов
                      </span>
                      <span className="font-semibold text-[18px] md:text-[20px] text-[#22c55e]">
                        +{order.cashback}
                      </span>
                    </div>
                    <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                      Бонусы начислены за этот заказ
                    </p>
                  </div>

                  <div className="space-y-[12px]">
                    <h3 className="font-medium text-[16px] md:text-[18px] text-[#131314]">
                      Как использовать бонусы?
                    </h3>

                    <div className="flex gap-[12px]">
                      <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0 text-[14px]">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                          Добавьте товары в корзину
                        </p>
                        <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                          Выберите понравившиеся товары
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-[12px]">
                      <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0 text-[14px]">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                          Активируйте списание
                        </p>
                        <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                          На оформлении включите "Списать бонусы"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-[12px]">
                      <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0 text-[14px]">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                          Получите скидку
                        </p>
                        <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                          1 бонус = 1 рубль скидки
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f5f5f7] rounded-[12px] p-[14px] md:p-[16px]">
                    <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                      📌 Бонусы действительны в течение 1 года с момента
                      начисления
                    </p>
                  </div>
                </div>
              </InfoButtonWithModal>
            </span>
            <span className="text-[13px] md:text-sm text-[#22c55e]">
              + {order.cashback} бонусов
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-3 md:pt-4">
            <span className="text-base md:text-lg font-medium text-[#131314]">
              Итого:
            </span>
            <span className="text-base md:text-lg font-medium text-[#131314]">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
          {canCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="mt-4 w-full rounded-[12px] border border-[#ef4444] px-4 py-3 text-[14px] md:text-[15px] font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[#ef4444]"
            >
              {isCancelling ? "Отменяем..." : "Отменить заказ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
