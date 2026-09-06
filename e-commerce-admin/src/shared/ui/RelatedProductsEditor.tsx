"use client";

import { ArrowDown, ArrowUp, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useProducts } from "@/shared/hooks";
import type { Product } from "@/shared/api";
import { Button } from "./Button";
import { Input } from "./Input";

export type RelatedProductSelection = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  image?: string | null;
  totalStock?: number;
};

function toSelection(product: Product): RelatedProductSelection {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0]?.url,
    totalStock: product.totalStock,
  };
}

function formatPrice(value: string | number) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? `${new Intl.NumberFormat("ru-RU").format(numericValue)} ₽`
    : "Цена не указана";
}

export function RelatedProductsEditor({
  currentProductId,
  value,
  onChange,
}: {
  currentProductId: string;
  value: RelatedProductSelection[];
  onChange: (value: RelatedProductSelection[]) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: searchResult, isLoading } = useProducts({
    search: search.trim(),
    page: 1,
    limit: 12,
    includeInactive: true,
  });
  const selectedIds = useMemo(
    () => new Set(value.map((item) => item.id)),
    [value],
  );
  const candidates = (searchResult?.data || []).filter(
    (product) => product.id !== currentProductId && !selectedIds.has(product.id),
  );

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary-black">
        Эти товары показываются на витрине первыми в блоке «Дополнительные товары».
      </p>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary-black" />
        <Input
          aria-label="Поиск дополнительного товара"
          placeholder="Найти товар по названию или URL"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-3 text-sm text-text-secondary-black">Поиск товаров...</p>
        ) : candidates.length === 0 ? (
          <p className="p-3 text-sm text-text-secondary-black">
            {search.trim() ? "Совпадений не найдено" : "Введите название нужного товара"}
          </p>
        ) : (
          candidates.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-3 border-b border-gray-100 p-3 last:border-b-0">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 bg-secondary-gray bg-cover bg-center"
                  style={product.images?.[0]?.url ? { backgroundImage: `url(${product.images[0].url})` } : undefined}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-black">{product.name}</p>
                  <p className="text-xs text-text-secondary-black">
                    {formatPrice(product.price)} · остаток {product.totalStock || 0}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange([...value, toSelection(product)])}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-orange text-primary-orange transition-colors hover:bg-primary-orange hover:text-white"
                aria-label={`Добавить ${product.name}`}
                title="Добавить"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-primary-black">Выбранные товары</p>
        {value.length === 0 ? (
          <p className="text-sm text-text-secondary-black">Ручные рекомендации пока не выбраны.</p>
        ) : (
          value.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs text-text-secondary-black">{index + 1}</span>
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 bg-secondary-gray bg-cover bg-center"
                  style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-black">{product.name}</p>
                  <p className="text-xs text-text-secondary-black">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Поднять ${product.name}`}
                  title="Поднять"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Опустить ${product.name}`}
                  title="Опустить"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((item) => item.id !== product.id))}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Удалить ${product.name} из дополнительных`}
                  title="Удалить"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
