"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { usePayments, usePaymentStats } from "@/shared/hooks";
import {
  PaymentStatus,
  PaymentMethod,
  type PaymentFilters,
} from "@/shared/api/paymentsApi";

const statusLabels: Record<string, string> = {
  PENDING: "В обработке",
  COMPLETED: "Успешно",
  REFUNDED: "Возврат",
};

const statusVariants: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  COMPLETED: "success",
  REFUNDED: "danger",
};

const methodLabels: Record<string, string> = {
  ROBOKASSA: "Robokassa",
  CASH: "Наличные",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [method, setMethod] = useState<PaymentMethod | undefined>(undefined);

  const filters: PaymentFilters = { page, limit: 20, status, method };

  const { data, isLoading, error } = usePayments(filters);
  const { data: stats, isLoading: statsLoading } = usePaymentStats();

  const payments = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const completedStats = stats?.byStatus.find(
    (s) => s.status === PaymentStatus.COMPLETED,
  );
  const refundedStats = stats?.byStatus.find(
    (s) => s.status === PaymentStatus.REFUNDED,
  );
  const pendingStats = stats?.byStatus.find(
    (s) => s.status === PaymentStatus.PENDING,
  );

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Транзакции
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить транзакции"
          message="Произошла ошибка при загрузке списка транзакций. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Транзакции
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            История платежей и возвратов
            {data && ` (${data.total} транзакций)`}
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto justify-center">
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Экспорт
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Оборот за месяц</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {statsLoading ? (
                <span className="inline-block h-8 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                formatCurrency(stats?.totalAmount || 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">
              Успешных платежей
            </p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {statsLoading ? (
                <span className="inline-block h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                (completedStats?.count || 0).toLocaleString("ru-RU")
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Возвратов</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {statsLoading ? (
                <span className="inline-block h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                (refundedStats?.count || 0).toLocaleString("ru-RU")
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">В обработке</p>
            <p className="text-2xl font-semibold text-orange-600 mt-1">
              {statsLoading ? (
                <span className="inline-block h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                (pendingStats?.count || 0).toLocaleString("ru-RU")
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-primary-black">Метод:</label>
              <select
                value={method || ""}
                onChange={(e) => {
                  setMethod(
                    e.target.value
                      ? (e.target.value as PaymentMethod)
                      : undefined,
                  );
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              >
                <option value="">Все</option>
                <option value={PaymentMethod.ROBOKASSA}>Robokassa</option>
                <option value={PaymentMethod.CASH}>Наличные</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-primary-black">Статус:</label>
              <select
                value={status || ""}
                onChange={(e) => {
                  setStatus(
                    e.target.value
                      ? (e.target.value as PaymentStatus)
                      : undefined,
                  );
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              >
                <option value="">Все</option>
                <option value={PaymentStatus.COMPLETED}>Успешно</option>
                <option value={PaymentStatus.PENDING}>В обработке</option>
                <option value={PaymentStatus.REFUNDED}>Возврат</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        ID транзакции
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Заказ
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Сумма
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Провайдер
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Дата
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-text-secondary-black"
                        >
                          Транзакции не найдены
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <code className="text-sm font-mono text-primary-black">
                              {String(payment.id).slice(0, 8)}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/orders/${payment.orderId}`}
                              className="text-sm text-primary-orange hover:underline"
                            >
                              #{payment.orderId}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-sm font-medium ${
                                payment.status === PaymentStatus.REFUNDED
                                  ? "text-red-600"
                                  : "text-primary-black"
                              }`}
                            >
                              {payment.status === PaymentStatus.REFUNDED
                                ? "-"
                                : ""}
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-secondary-black">
                            {methodLabels[payment.method] || payment.method}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-secondary-black">
                            {new Date(payment.createdAt).toLocaleDateString(
                              "ru-RU",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                statusVariants[payment.status] || "warning"
                              }
                            >
                              {statusLabels[payment.status] || payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-secondary-black">
                    Страница {data?.page || 1} из {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Вперед
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
