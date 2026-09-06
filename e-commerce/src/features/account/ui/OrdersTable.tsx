"use client";

import { memo } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "../model/types";
import { PageTitle, ChevronIcon } from "@/shared/ui";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    PENDING: {
      label: "Ожидает",
      className: "text-[rgba(19,19,20,0.4)]",
    },
    PROCESSING: {
      label: "Обрабатывается",
      className: "text-[rgba(19,19,20,0.4)]",
    },
    CONFIRMED: {
      label: "Подтвержден",
      className: "text-[#131314]",
    },
    PAYED: {
      label: "Оплачен",
      className: "text-[#ef6f2e]",
    },
    ASSEMBLED: {
      label: "Собран",
      className: "text-[#131314]",
    },
    SHIPPED: {
      label: "Выехал",
      className: "text-[#131314]",
    },
    DELIVERED: {
      label: "Выдан",
      className: "text-[#ef6f2e]",
    },
    CANCELLED: {
      label: "Отменен",
      className: "text-[rgba(19,19,20,0.4)]",
    },
  };

const OrderStatusBadge = memo(({ status }: OrderStatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <span
      className={`font-medium text-[14px] md:text-[16px] xl:text-[18px] leading-[1.1] ${config.className}`}
    >
      {config.label}
    </span>
  );
});

OrderStatusBadge.displayName = "OrderStatusBadge";

// Details Icon
const DetailsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

// Status filter button component
const StatusFilterButton = memo(() => (
  <button className="flex items-center gap-[8px] md:gap-[10px] border border-[rgba(19,19,20,0.16)] rounded-[10px] px-[14px] md:px-[20px] py-[10px] md:py-[14px]">
    <span className="font-medium text-[14px] md:text-[16px] xl:text-[18px] leading-[1.1] text-[#131314] whitespace-nowrap">
      Любой статус заказа
    </span>
    <ChevronIcon color="#131314" />
  </button>
));

StatusFilterButton.displayName = "StatusFilterButton";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = memo(({ orders }: OrdersTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  // Mobile card view for small screens
  const MobileOrderCard = ({ order }: { order: Order }) => (
    <Link
      href={`/account/orders/${order.id}`}
      className="block border border-[rgba(19,19,20,0.16)] rounded-[12px] p-[16px] space-y-[12px]"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-[16px] text-[#131314]">
          Заказ №{order.orderNumber}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between text-[14px] text-[rgba(19,19,20,0.6)]">
        <span>{order.date}</span>
        <span>{order.itemsCount} {order.itemsCount === 1 ? "товар" : order.itemsCount < 5 ? "товара" : "товаров"}</span>
      </div>
      {order.customerName && (
        <div className="text-[14px] text-[rgba(19,19,20,0.6)]">
          {order.customerName}
        </div>
      )}
      <div className="font-medium text-[18px] text-[#131314]">
        {formatPrice(order.totalAmount)}
      </div>
    </Link>
  );

  return (
    <div className="flex-1 min-w-0">
      {/* Header with title and filter */}
      <PageTitle rightElement={<StatusFilterButton />} className="mb-[20px]">
        Мои заказы
      </PageTitle>

      {/* Mobile card view */}
      <div className="flex flex-col gap-[12px] lg:hidden">
        {orders.map((order) => (
          <MobileOrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#f5f5f7]">
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314] whitespace-nowrap">
                № Заказа
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314]">
                Статус
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314] whitespace-nowrap">
                Дата добавления
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314] whitespace-nowrap">
                Кол–во товаров
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314]">
                Покупатель
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314] whitespace-nowrap">
                Общая сумма
              </th>
              <th className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] text-left font-medium text-[14px] xl:text-[18px] leading-[1.1] text-[#131314]">
                Детали
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <span className="font-normal text-[14px] xl:text-[18px] leading-[1.3] text-[#131314]">
                    №{order.orderNumber}
                  </span>
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <span className="font-normal text-[14px] xl:text-[18px] leading-[1.3] text-[#131314]">
                    {order.date}
                  </span>
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <span className="font-normal text-[14px] xl:text-[18px] leading-[1.3] text-[#131314]">
                    {order.itemsCount}
                  </span>
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <span className="font-normal text-[14px] xl:text-[18px] leading-[1.3] text-[#131314]">
                    {order.customerName}
                  </span>
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px] whitespace-nowrap">
                  <span className="font-normal text-[14px] xl:text-[18px] leading-[1.3] text-[#131314]">
                    {formatPrice(order.totalAmount)}
                  </span>
                </td>
                <td className="border border-[rgba(19,19,20,0.16)] p-[16px] xl:p-[24px]">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-[rgba(19,19,20,0.4)] hover:text-[#ef6f2e] transition-colors"
                  >
                    <DetailsIcon />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

OrdersTable.displayName = "OrdersTable";
