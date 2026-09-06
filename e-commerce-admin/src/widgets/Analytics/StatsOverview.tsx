"use client";

import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/shared/api/dashboard";
import type { DashboardStats, RecentOrder } from "@/shared/types/analytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

const STAT_CARDS = [
  {
    key: "revenue" as const,
    title: "Выручка",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    format: formatCurrency,
    gradient: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    key: "orders" as const,
    title: "Заказы",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    format: (v: number) => v.toLocaleString("ru-RU"),
    gradient: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    key: "products" as const,
    title: "Товары",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    format: (v: number) => v.toLocaleString("ru-RU"),
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    key: "users" as const,
    title: "Пользователи",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    format: (v: number) => v.toLocaleString("ru-RU"),
    gradient: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
];

const STATUS_BADGE_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-blue-600",
  danger: "bg-red-50 text-red-500",
};

export default function StatsOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, o] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(),
        ]);
        setStats(s);
        setOrders(o);
      } catch {
        // error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Card className="col-span-full">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const stat = stats[card.key];
            return (
              <Card
                key={card.key}
                className="relative overflow-hidden group hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-primary-black tabular-nums">
                      {card.format(stat.value)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-2.5 rounded-xl",
                      card.bgLight,
                      card.textColor,
                    )}
                  >
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                      stat.changeType === "positive"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500",
                    )}
                  >
                    {stat.changeType === "positive" ? (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M6 9V3M6 3L3 6M6 3L9 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M6 3V9M6 9L3 6M6 9L9 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    vs прошлый месяц
                  </span>
                </div>
                {/* Decorative gradient corner */}
                <div
                  className={cn(
                    "absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-[0.07] group-hover:opacity-[0.12] transition-opacity",
                    card.gradient,
                  )}
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardTitle>Последние заказы</CardTitle>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-400 px-6 py-3">
                    ID
                  </th>
                  <th className="text-left font-medium text-gray-400 px-3 py-3">
                    Клиент
                  </th>
                  <th className="text-right font-medium text-gray-400 px-3 py-3">
                    Сумма
                  </th>
                  <th className="text-center font-medium text-gray-400 px-3 py-3">
                    Статус
                  </th>
                  <th className="text-right font-medium text-gray-400 px-6 py-3">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs text-gray-500">
                        #{String(order.id).slice(-6)}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-medium text-primary-black">
                      {order.customer}
                    </td>
                    <td className="px-3 py-3.5 text-right font-semibold tabular-nums text-primary-black">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium",
                          STATUS_BADGE_STYLES[order.statusType] ||
                            "bg-gray-100 text-gray-600",
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-500 text-xs tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
