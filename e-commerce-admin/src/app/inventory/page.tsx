"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui";
import {
  useAdminAccess,
  useCreateStock,
  usePickupPoints,
  usePickupPointStock,
  useProducts,
  useUpdateStock,
} from "@/shared/hooks";
import type { Product } from "@/shared/api";

const getStockBadgeClassName = (stock: number) => {
  if (stock === 0) return "bg-red-100 text-red-700";
  if (stock <= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const getStockStatusLabel = (stock: number) => {
  if (stock === 0) return "Нет в наличии";
  if (stock <= 5) return "Низкий остаток";
  return "В наличии";
};

const buildStockSku = (product: Product, pointId: string) => {
  const source = (product.slug || product.id).toUpperCase();
  const normalized =
    source.replace(/[^A-Z0-9_-]/g, "").slice(0, 16) || "PRODUCT";
  const suffix =
    pointId.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() ||
    "POINT";

  return `${normalized}-${suffix}`;
};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("");
  const [editingStockProductId, setEditingStockProductId] = useState<
    string | null
  >(null);
  const [editingStockValue, setEditingStockValue] = useState("");
  const [savingStockProductId, setSavingStockProductId] = useState<
    string | null
  >(null);
  const { isManager } = useAdminAccess();
  const { data, isLoading, refetch: refetchProducts } = useProducts({
    page,
    limit: 50,
  });
  const { data: pickupPointsData, isLoading: isPickupPointsLoading } =
    usePickupPoints({
      page: 1,
      limit: 200,
    });
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  const products = data?.data || [];
  const activePickupPoints = useMemo(
    () => (pickupPointsData?.data || []).filter((point) => point.isActive),
    [pickupPointsData],
  );
  const primaryPickupPoint = activePickupPoints[0];
  const primaryPointId = primaryPickupPoint?.id || "";
  const {
    data: primaryPointStock = [],
    isLoading: isPrimaryPointStockLoading,
    refetch: refetchPrimaryPointStock,
  } = usePickupPointStock(primaryPointId);

  const stockByProductId = useMemo(() => {
    const map = new Map<string, { stockCount: number; sku: string }>();

    for (const stock of primaryPointStock) {
      map.set(stock.productId, {
        stockCount: stock.stockCount ?? stock.quantity ?? 0,
        sku: stock.sku || "",
      });
    }

    return map;
  }, [primaryPointStock]);
  const isInventoryLoading =
    isLoading ||
    isPickupPointsLoading ||
    Boolean(primaryPointId && isPrimaryPointStockLoading);

  const resolveProductStock = (product: Product) => {
    if (primaryPointId && !isPrimaryPointStockLoading) {
      return stockByProductId.get(product.id)?.stockCount ?? 0;
    }

    return product.totalStock ?? 0;
  };

  const filtered = useMemo(() => {
    let result = products;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || p.title || "").toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    if (stockFilter === "in_stock") {
      result = result.filter((p) => resolveProductStock(p) > 5);
    } else if (stockFilter === "low") {
      result = result.filter(
        (p) => resolveProductStock(p) > 0 && resolveProductStock(p) <= 5
      );
    } else if (stockFilter === "out") {
      result = result.filter((p) => resolveProductStock(p) === 0);
    }

    return result;
  }, [
    products,
    search,
    stockFilter,
    primaryPointId,
    isPrimaryPointStockLoading,
    stockByProductId,
  ]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => resolveProductStock(p) > 0).length;
    const low = products.filter(
      (p) => resolveProductStock(p) > 0 && resolveProductStock(p) <= 5
    ).length;
    const out = products.filter((p) => resolveProductStock(p) === 0).length;
    return { total, inStock, low, out };
  }, [products, primaryPointId, isPrimaryPointStockLoading, stockByProductId]);

  const startEditingStock = (
    event: React.MouseEvent,
    product: Product,
  ) => {
    event.stopPropagation();

    if (isManager) {
      toast.error("У менеджера нет прав на редактирование остатков");
      return;
    }

    if (!primaryPickupPoint) {
      toast.error("Нет активной точки для учета остатков");
      return;
    }

    if (savingStockProductId === product.id) return;

    setEditingStockProductId(product.id);
    setEditingStockValue(String(resolveProductStock(product)));
  };

  const cancelEditingStock = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setEditingStockProductId(null);
    setEditingStockValue("");
  };

  const saveStock = async (product: Product) => {
    if (isManager) {
      toast.error("У менеджера нет прав на редактирование остатков");
      return;
    }

    if (!primaryPickupPoint) {
      toast.error("Нет активной точки для учета остатков");
      return;
    }

    const parsedStock = Number(editingStockValue);

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      toast.error("Укажите корректный остаток");
      return;
    }

    try {
      setSavingStockProductId(product.id);
      const existingStock = stockByProductId.get(product.id);

      if (existingStock) {
        await updateStock.mutateAsync({
          productId: product.id,
          pointId: primaryPickupPoint.id,
          data: { stockCount: parsedStock },
        });
      } else {
        await createStock.mutateAsync({
          productId: product.id,
          pointId: primaryPickupPoint.id,
          sku: buildStockSku(product, primaryPickupPoint.id),
          stockCount: parsedStock,
        });
      }

      await Promise.all([refetchPrimaryPointStock(), refetchProducts()]);
      toast.success("Остаток обновлен");
      setEditingStockProductId(null);
      setEditingStockValue("");
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast.error("Не удалось обновить остаток");
    } finally {
      setSavingStockProductId(null);
    }
  };

  const handleExport = () => {
    const csvRows = [
      ["Название", "ID", "Остаток", "Цена", "Статус"].join(","),
      ...filtered.map((p) =>
        [
          `"${(p.name || p.title || "").replace(/"/g, '""')}"`,
          p.id,
          p.totalStock ?? 0,
          p.price,
          p.isActive ? "Активен" : "Неактивен",
        ].join(",")
      ),
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = () => {
      alert(
        "Функция импорта будет доступна в следующем обновлении. Пока используйте ручное редактирование остатков."
      );
    };
    input.click();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Остатки товаров
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление остатками товаров ({filtered.length} из{" "}
            {products.length})
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none justify-center"
            onClick={handleImport}
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="hidden sm:inline">Импорт</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none justify-center"
            onClick={handleExport}
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Экспорт</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Всего товаров</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {isInventoryLoading ? "..." : stats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">В наличии</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {isInventoryLoading ? "..." : stats.inStock}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Низкий остаток</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {isInventoryLoading ? "..." : stats.low}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Нет в наличии</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">
              {isInventoryLoading ? "..." : stats.out}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-primary-black">Статус:</label>
              <select
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="">Все</option>
                <option value="in_stock">В наличии</option>
                <option value="low">Низкий остаток</option>
                <option value="out">Нет в наличии</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Остатки товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Товар
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Цена
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary-black">
                    Остаток
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary-black">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {isInventoryLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary-black">
                      Загрузка...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary-black">
                      {search || stockFilter
                        ? "Товары не найдены"
                        : "Нет товаров"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const stock = resolveProductStock(product);
                    const isEditingStock = editingStockProductId === product.id;
                    const isSavingStock = savingStockProductId === product.id;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-medium text-primary-black hover:text-primary-orange"
                          >
                            {product.name || product.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-primary-black">
                          {typeof product.price === "string"
                            ? Number(product.price).toLocaleString("ru-RU")
                            : product.price?.toLocaleString("ru-RU")}{" "}
                          ₽
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditingStock ? (
                            <div className="inline-flex items-center justify-center gap-2">
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={editingStockValue}
                                onChange={(e) =>
                                  setEditingStockValue(
                                    e.target.value.replace(/[^\d]/g, ""),
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    void saveStock(product);
                                  }
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    cancelEditingStock();
                                  }
                                }}
                                className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                autoFocus
                                disabled={isSavingStock}
                              />
                              <button
                                type="button"
                                onClick={() => void saveStock(product)}
                                disabled={isSavingStock}
                                className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-sm text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
                              >
                                {isSavingStock ? "..." : "OK"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingStock}
                                disabled={isSavingStock}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => startEditingStock(e, product)}
                              className={`inline-flex items-center justify-center gap-1 min-w-8 px-2 py-1 rounded text-sm font-medium transition-colors hover:ring-2 hover:ring-primary-orange/20 ${getStockBadgeClassName(
                                stock,
                              )}`}
                              title={
                                primaryPickupPoint
                                  ? `Изменить остаток: ${primaryPickupPoint.name}`
                                  : "Нет активной точки для учета остатков"
                              }
                            >
                              <span>{stock}</span>
                              <svg
                                className="h-3.5 w-3.5"
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
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStockBadgeClassName(
                              stock,
                            )}`}
                          >
                            {getStockStatusLabel(stock)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/products/${product.id}`}>
                            <button
                              className="p-2 hover:bg-secondary-gray rounded-lg transition-colors"
                              title="Открыть карточку товара"
                            >
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary-black">
            Страница {page} из {data.meta.totalPages}
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
              disabled={page >= data.meta.totalPages}
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
