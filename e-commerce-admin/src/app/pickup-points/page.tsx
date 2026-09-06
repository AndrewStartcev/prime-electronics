"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  GridSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { usePickupPoints, useDeletePickupPoint } from "@/shared/hooks";

export default function PickupPointsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePickupPoints({ page, limit: 12 });
  const deletePickupPoint = useDeletePickupPoint();

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту точку?")) {
      deletePickupPoint.mutate(id);
    }
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
        <GridSkeleton items={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Точки самовывоза
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить точки самовывоза"
          message="Произошла ошибка при загрузке списка пунктов выдачи. Пожалуйста, попробуйте обновить страницу."
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
            Точки самовывоза
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление пунктами выдачи заказов
            {data && ` (${data.meta.total} точек)`}
          </p>
        </div>
        <Link href="/pickup-points/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto justify-center">
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
            Добавить точку
          </Button>
        </Link>
      </div>

      {/* Points Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {data?.data.map((point) => (
          <Card key={point.id}>
            <CardContent className="pt-0">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-orange/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-orange"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <Badge variant={point.isActive ? "success" : "default"}>
                  {point.isActive ? "Активна" : "Неактивна"}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-primary-black">
                {point.name}
              </h3>
              <p className="text-sm text-text-secondary-black mt-1">
                {point.address}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {point.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary-black">Телефон</span>
                    <span className="font-medium text-primary-black">
                      {point.phone}
                    </span>
                  </div>
                )}
                {point.workingHours && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-text-secondary-black">
                      Режим работы
                    </span>
                    <span className="font-medium text-primary-black">
                      {point.workingHours}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Link href={`/pickup-points/${point.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    Редактировать
                  </Button>
                </Link>
                <button
                  onClick={() => handleDelete(point.id)}
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
                <Link href={`/pickup-windows?point=${point.id}`}>
                  <Button variant="ghost" size="sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary-black">
            Страница {data.meta.page} из {data.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
