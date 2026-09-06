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
  Skeleton,
  ErrorMessage,
  TablePagination,
  TableSearch,
} from "@/shared/ui";
import { useCoupons, useDeleteCoupon } from "@/shared/hooks";

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useCoupons({ page: 1, limit: 100 });

  const filteredCoupons = data?.data.filter((c) =>
    search
      ? c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      : true
  ) || [];

  const ITEMS_PER_PAGE = 10;
  const couponsTotal = filteredCoupons.length;
  const couponsTotalPages = Math.ceil(couponsTotal / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот купон?")) {
      deleteCoupon.mutate(id);
    }
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Все купоны</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={8} columns={7} />
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
            Купоны
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить купоны"
          message="Произошла ошибка при загрузке списка купонов. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const activeCoupons = data?.data.filter((c) => c.isActive) || [];
  const totalUsage =
    data?.data.reduce((acc, c) => acc + (c.usedCount || 0), 0) || 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Купоны и промокоды
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление скидками и акциями
            {data && ` (${data.meta.total} купонов)`}
          </p>
        </div>
        <Link href="/coupons/new" className="w-full sm:w-auto">
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
            Создать купон
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Всего купонов</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {data?.meta.total || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Активных</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {activeCoupons.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Использований</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {totalUsage.toLocaleString("ru-RU")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Неактивных</p>
            <p className="text-2xl font-semibold text-primary-orange mt-1">
              {(data?.meta.total || 0) - activeCoupons.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <TableSearch
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Поиск по коду купона..."
      />

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все купоны</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Код
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Тип скидки
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Значение
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Использований
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Действует до
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
                {paginatedCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <code className="px-2 py-1 bg-secondary-gray rounded text-sm font-mono text-primary-black">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-black">
                      {coupon.discountType === "PERCENTAGE"
                        ? "Процент"
                        : "Фиксированная сумма"}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-primary-black">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `${
                            coupon.discountValue?.toLocaleString("ru-RU") || 0
                          } ₽`}
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-black">
                      {coupon.usedCount || 0}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary-black">
                      {coupon.endDate ? formatDate(coupon.endDate) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={coupon.isActive ? "success" : "default"}>
                        {coupon.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/coupons/${coupon.id}`}>
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <TablePagination
        page={page}
        totalPages={couponsTotalPages}
        onPageChange={setPage}
        total={couponsTotal}
        label="купонов"
      />
    </div>
  );
}
