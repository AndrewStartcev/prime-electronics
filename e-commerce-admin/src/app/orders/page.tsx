"use client";

import Link from "next/link";
import { useState } from "react";
import type { OrderStatus } from "@/shared/api/ordersApi";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
  TablePagination,
} from "@/shared/ui";
import { useOrders } from "@/shared/hooks";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const { data, isLoading, error } = useOrders({ page, limit: 10, status });

  const statusLabels: Record<string, string> = {
    PENDING: "Обрабатывается",
    PROCESSING: "Обрабатывается",
    CONFIRMED: "Подтвержден",
    PAYED: "Оплачен",
    ASSEMBLED: "Собран",
    SHIPPED: "Выехал",
    DELIVERED: "Выдан",
    CANCELLED: "Отменен",
  };

  const statusVariants: Record<
    string,
    "warning" | "info" | "success" | "danger"
  > = {
    PENDING: "warning",
    PROCESSING: "info",
    CONFIRMED: "info",
    PAYED: "success",
    ASSEMBLED: "info",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "danger",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Все заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} columns={7} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Заказы
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить заказы"
          message="Произошла ошибка при загрузке списка заказов. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Заказы
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление заказами клиентов
            {meta && ` (${meta.total} заказов)`}
          </p>
        </div>
        <select
          value={status || ""}
          onChange={(e) =>
            setStatus(
              e.target.value ? (e.target.value as OrderStatus) : undefined,
            )
          }
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Все статусы</option>
          <option value="PENDING">Обрабатывается</option>
          <option value="PROCESSING">Обрабатывается</option>
          <option value="CONFIRMED">Подтвержден</option>
          <option value="PAYED">Оплачен</option>
          <option value="ASSEMBLED">Собран</option>
          <option value="SHIPPED">Выехал</option>
          <option value="DELIVERED">Выдан</option>
          <option value="CANCELLED">Отменен</option>
        </select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все заказы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Номер
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Клиент
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Дата
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Сумма
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-primary-black font-medium">
                      <div className="flex items-center gap-2">
                        #{String(order.id).slice(0, 8)}
                        {order.buyer && !order.email && !order.address && (
                          <Badge variant="info" className="text-xs">
                            1-клик
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-black">
                      <div>
                        <div>{order.buyer || order.user?.name || "Гость"}</div>
                        {order.phone && (
                          <a
                            href={`tel:${order.phone}`}
                            className="text-xs text-primary-orange hover:underline"
                          >
                            {order.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary-black">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-black">
                      {Number(order.finalTotal).toLocaleString("ru-RU")} ₽
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariants[order.status] || "info"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/orders/${order.id}`}>
                        <button className="p-2 hover:bg-secondary-gray rounded-lg transition-colors">
                          <svg
                            className="w-4 h-4 text-primary-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && (
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              total={meta.total}
              label="заказов"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
