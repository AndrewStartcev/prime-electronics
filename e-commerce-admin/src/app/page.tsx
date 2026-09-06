"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/shared/ui";
import { dashboardApi } from "@/shared/api";
import type { DashboardStats, RecentOrder } from "@/shared/types/dashboard";

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Иконки для статистики
  const icons = {
    revenue: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    orders: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    products: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Главная
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Загрузка данных...
          </p>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex gap-4 pb-3 border-b border-gray-100">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              {/* Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-32 flex-1" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Главная
          </h1>
        </div>
        
        {/* Beautiful Error Card */}
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="pt-0">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Не удалось загрузить данные
              </h3>
              <p className="text-red-700 mb-6 max-w-md">
                {error || "Произошла ошибка при загрузке данных панели управления. Пожалуйста, попробуйте обновить страницу."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Обновить страницу
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Общая выручка",
      value: formatCurrency(stats.revenue.value),
      change: formatChange(stats.revenue.change),
      changeType: stats.revenue.changeType,
      icon: icons.revenue,
      key: "revenue",
    },
    {
      title: "Заказы",
      value: stats.orders.value.toString(),
      change: formatChange(stats.orders.change),
      changeType: stats.orders.changeType,
      icon: icons.orders,
      key: "orders",
    },
    {
      title: "Товары",
      value: stats.products.value.toString(),
      change: formatChange(stats.products.change),
      changeType: stats.products.changeType,
      icon: icons.products,
      key: "products",
    },
    {
      title: "Пользователи",
      value: stats.users.value.toString(),
      change: formatChange(stats.users.change),
      changeType: stats.users.changeType,
      icon: icons.users,
      key: "users",
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
          Главная
        </h1>
        <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
          Добро пожаловать в панель управления
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary-black">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-primary-black mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change} с прошлого месяца
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-orange/10 rounded-xl flex items-center justify-center text-primary-orange">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Клиент
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Сумма
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-primary-black font-medium">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-black">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-black">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={order.statusType}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 px-4 text-center text-text-secondary-black"
                    >
                      Нет заказов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
