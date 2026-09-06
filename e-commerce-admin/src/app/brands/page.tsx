"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TableSkeleton,
  ErrorMessage,
  TablePagination,
  TableSearch,
} from "@/shared/ui";
import { useAdminAccess, useBrands, useDeleteBrand } from "@/shared/hooks";

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useBrands({ page: 1, limit: 100 });

  const filteredBrands = data?.data.filter((b) =>
    search
      ? b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.slug.toLowerCase().includes(search.toLowerCase())
      : true
  ) || [];

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = filteredBrands.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const deleteBrand = useDeleteBrand();
  const [deleteError, setDeleteError] = useState("");
  const { canDeleteBrands } = useAdminAccess();

  const handleDelete = async (id: string) => {
    if (!canDeleteBrands) {
      setDeleteError("У менеджера нет прав на удаление брендов");
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить этот бренд?")) return;
    setDeleteError("");
    try {
      await deleteBrand.mutateAsync(id);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Не удалось удалить бренд";
      setDeleteError(
        msg.includes("associated products")
          ? "Невозможно удалить бренд — у него есть товары. Сначала переместите или удалите товары."
          : msg
      );
    }
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
            <CardTitle>Все бренды</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-black">Бренды</h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить бренды"
          message="Произошла ошибка при загрузке списка брендов. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary-black">Бренды</h1>
          <p className="text-text-secondary-black mt-1">
            Управление брендами товаров
          </p>
        </div>
        <Link href="/brands/new">
          <Button variant="primary">
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
            Добавить бренд
          </Button>
        </Link>
      </div>

      {/* Search */}
      <TableSearch
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Поиск брендов..."
      />

      {/* Delete Error */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-red-400 hover:text-red-600 ml-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все бренды ({data?.meta.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">
                    Лого
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">
                    Название
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">
                    Товаров
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/brands/${brand.id}`}
                        className="font-medium text-primary-black hover:text-accent-yellow"
                      >
                        {brand.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary-black">
                      {brand._count?.products || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          brand.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {brand.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/brands/${brand.id}`}>
                          <Button variant="outline" size="sm">
                            Редактировать
                          </Button>
                        </Link>
                        {canDeleteBrands && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(brand.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={filteredBrands.length}
            label="брендов"
          />
        </CardContent>
      </Card>
    </div>
  );
}
