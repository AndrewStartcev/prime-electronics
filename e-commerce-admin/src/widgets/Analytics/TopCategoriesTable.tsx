"use client";

import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useAnalyticsTopCategories } from "@/shared/hooks/useAnalytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_COLORS = [
  "#ef6f2e",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
];

export default function TopCategoriesTable({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, isError } = useAnalyticsTopCategories(limit);

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-44 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <p className="text-center py-12 text-gray-400">Ошибка загрузки</p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-6 pb-0">
        <CardTitle>Топ категорий</CardTitle>
        <p className="text-sm text-gray-400 mt-1">По выручке за 30 дней</p>
      </div>

      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-medium text-gray-400 px-6 py-3 w-10">
                  #
                </th>
                <th className="text-left font-medium text-gray-400 px-3 py-3">
                  Категория
                </th>
                <th className="text-right font-medium text-gray-400 px-3 py-3">
                  Продано
                </th>
                <th className="text-right font-medium text-gray-400 px-3 py-3">
                  Доля
                </th>
                <th className="text-right font-medium text-gray-400 px-6 py-3">
                  Выручка
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((cat, idx) => {
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                return (
                  <tr
                    key={cat.categoryId}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {cat.rank}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-medium text-primary-black">
                        {cat.title}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-gray-600">
                      {cat.units} шт
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-gray-500 w-12 text-right">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-primary-black tabular-nums">
                      {formatCurrency(cat.revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
