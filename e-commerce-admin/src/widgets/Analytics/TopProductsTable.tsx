"use client";

import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useAnalyticsTopProducts } from "@/shared/hooks/useAnalytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TopProductsTable({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, isError } = useAnalyticsTopProducts(limit);

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

  const maxRevenue = Math.max(...data.map((p) => p.revenue), 1);

  return (
    <Card padding="none">
      <div className="p-6 pb-0">
        <CardTitle>Топ товаров</CardTitle>
        <p className="text-sm text-gray-400 mt-1">За последние 30 дней</p>
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
                  Товар
                </th>
                <th className="text-right font-medium text-gray-400 px-3 py-3">
                  Продано
                </th>
                <th className="text-right font-medium text-gray-400 px-3 py-3">
                  Заказы
                </th>
                <th className="text-right font-medium text-gray-400 px-6 py-3 min-w-[180px]">
                  Выручка
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((product) => (
                <tr
                  key={product.productId}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        product.rank <= 3
                          ? "bg-primary-orange text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.rank}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-primary-black line-clamp-2">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-gray-600">
                    {product.unitsSold} шт
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-gray-600">
                    {product.ordersCount}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-semibold text-primary-black tabular-nums">
                        {formatCurrency(product.revenue)}
                      </span>
                      <div className="w-full max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-orange rounded-full transition-all"
                          style={{
                            width: `${(product.revenue / maxRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
