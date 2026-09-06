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
import {
  usePickupWindows,
  useDeletePickupWindow,
  usePickupPoints,
} from "@/shared/hooks";

export default function PickupWindowsPage() {
  const [page, setPage] = useState(1);
  const [pointId, setPointId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = usePickupWindows({
    page,
    limit: 10,
    pointId,
    startDate,
    endDate: startDate, // same day filter
  });
  const { data: pointsData } = usePickupPoints({ limit: 100 });
  const deleteWindow = useDeletePickupWindow();

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить это окно?")) {
      deleteWindow.mutate(id);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Окна самовывоза</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} columns={5} />
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
            Окна самовывоза
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить окна самовывоза"
          message="Произошла ошибка при загрузке списка окон. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const windows = data?.data || [];
  const meta = data?.meta;
  const points = pointsData?.data || [];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Окна самовывоза
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление временными слотами для выдачи
            {meta ? ` (${meta.total} окон)` : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Link href="/pickup-windows/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto justify-center"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Добавить окно
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-primary-black">Дата:</label>
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) => {
                  setStartDate(e.target.value || undefined);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-primary-black">Точка:</label>
              <select
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
                value={pointId || ""}
                onChange={(e) => {
                  setPointId(e.target.value || undefined);
                  setPage(1);
                }}
              >
                <option value="">Все точки</option>
                {points.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </div>
            {(startDate || pointId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setPointId(undefined);
                  setPage(1);
                }}
              >
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Windows Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {startDate
              ? `Окна на ${formatDate(startDate + "T00:00:00")}`
              : "Все окна"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {windows.length === 0 ? (
            <div className="py-12 text-center text-text-secondary-black">
              Окна самовывоза не найдены
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Точка
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Время
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Заполненность
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
                    {windows.map((window) => {
                      const fillPercent =
                        window.capacity > 0
                          ? (window.reserved / window.capacity) * 100
                          : 0;
                      const isFull = window.reserved >= window.capacity;

                      return (
                        <tr
                          key={window.id}
                          className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-primary-black font-medium">
                            {window.pickupPoint?.name ?? "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-primary-black">
                            {formatTime(window.startTime)} —{" "}
                            {formatTime(window.endTime)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isFull
                                      ? "bg-red-500"
                                      : fillPercent > 70
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(fillPercent, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-text-secondary-black">
                                {window.reserved}/{window.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={isFull ? "warning" : "success"}>
                              {isFull ? "Заполнено" : "Доступно"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(window.id)}
                                disabled={deleteWindow.isPending}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 text-red-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-secondary-black">
                    Страница {meta.page} из {meta.totalPages}
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
                      disabled={page === meta.totalPages}
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
