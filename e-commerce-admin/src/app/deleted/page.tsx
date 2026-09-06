"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  useDeletedProducts,
  useRestoreProduct,
  useDeletedBrands,
  useRestoreBrand,
  useDeletedCategories,
  useRestoreCategory,
  useDeletedCoupons,
  useRestoreCoupon,
} from "@/shared/hooks";
import { toast } from "sonner";

type Tab = "products" | "brands" | "categories" | "coupons";

const tabs: { key: Tab; label: string }[] = [
  { key: "products", label: "Товары" },
  { key: "brands", label: "Бренды" },
  { key: "categories", label: "Категории" },
  { key: "coupons", label: "Купоны" },
];

function daysLeft(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime();
  const now = Date.now();
  const days = 7 - Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export default function DeletedPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [page, setPage] = useState(1);

  const products = useDeletedProducts({ page: tab === "products" ? page : 1, limit: 10 });
  const brands = useDeletedBrands({ page: tab === "brands" ? page : 1, limit: 10 });
  const categories = useDeletedCategories({ page: tab === "categories" ? page : 1, limit: 10 });
  const coupons = useDeletedCoupons({ page: tab === "coupons" ? page : 1, limit: 10 });

  const restoreProduct = useRestoreProduct();
  const restoreBrand = useRestoreBrand();
  const restoreCategory = useRestoreCategory();
  const restoreCoupon = useRestoreCoupon();

  const handleRestore = async (type: Tab, id: string) => {
    try {
      if (type === "products") await restoreProduct.mutateAsync(id);
      else if (type === "brands") await restoreBrand.mutateAsync(id);
      else if (type === "categories") await restoreCategory.mutateAsync(id);
      else if (type === "coupons") await restoreCoupon.mutateAsync(id);
      toast.success("Восстановлено");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Не удалось восстановить");
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
  };

  const currentData =
    tab === "products" ? products :
    tab === "brands" ? brands :
    tab === "categories" ? categories :
    coupons;

  const isLoading = currentData.isLoading;
  const error = currentData.error;
  const items = currentData.data?.data || [];
  const meta = currentData.data?.meta;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
          Недавно удалённые
        </h1>
        <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
          Удалённые элементы хранятся 7 дней, после чего удаляются безвозвратно
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "primary" : "outline"}
            size="sm"
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find((t) => t.key === tab)?.label}
            {meta && ` (${meta.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : error ? (
            <ErrorMessage
              title="Ошибка загрузки"
              message="Не удалось загрузить удалённые элементы"
            />
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-text-secondary-black">
              Нет удалённых элементов
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Название
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Удалено
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Осталось дней
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => {
                      const name =
                        item.name || item.title || item.code || "Без названия";
                      const days = item.deletedAt ? daysLeft(item.deletedAt) : 0;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-primary-black font-medium">
                            {name}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-secondary-black">
                            {item.deletedAt
                              ? new Date(item.deletedAt).toLocaleDateString("ru-RU")
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={days <= 2 ? "danger" : days <= 4 ? "warning" : "success"}>
                              {days} дн.
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRestore(tab, item.id)}
                              disabled={
                                restoreProduct.isPending ||
                                restoreBrand.isPending ||
                                restoreCategory.isPending ||
                                restoreCoupon.isPending
                              }
                            >
                              Восстановить
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {meta && (
                <TablePagination
                  page={page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  total={meta.total}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
