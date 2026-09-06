"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCompareStore } from "@/shared/stores/useCompareStore";
import { productApi, ProductDetailResponse } from "@/shared/api";
import { userApi } from "@/shared/api/userApi";
import { Button } from "@/shared/ui/Button";
import { useAddToCart, cartKeys } from "@/shared/hooks";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getProductUrl } from "@/shared/lib/productUrl";
import { useQueryClient } from "@tanstack/react-query";

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const [products, setProducts] = useState<ProductDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set());
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const addToCartMutation = useAddToCart();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProducts = async () => {
      if (compareItems.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const productPromises = compareItems.map((id) =>
          productApi.getById(id).catch(() => null),
        );
        const results = await Promise.all(productPromises);
        const validProducts = results.filter(
          (p): p is ProductDetailResponse => p !== null,
        );
        setProducts(validProducts);

        // Sync store: remove IDs that failed to load
        const validIds = validProducts.map((p) => p.id);
        const invalidIds = compareItems.filter((id) => !validIds.includes(id));
        invalidIds.forEach((id) => removeFromCompare(id));
      } catch (error) {
        console.error("Failed to load compare products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [compareItems]);

  // Collect all unique attributes
  const allAttributes = Array.from(
    new Set(products.flatMap((p) => (p.attributes || []).map((a) => a.name))),
  );

  // Check if attribute values differ between products
  const attributesDiffer = (attrName: string): boolean => {
    const values = products.map(
      (p) => p.attributes.find((a) => a.name === attrName)?.value || "-",
    );
    return new Set(values).size > 1;
  };

  // Filter attributes based on showDifferencesOnly
  const displayedAttributes = showDifferencesOnly
    ? allAttributes.filter(attributesDiffer)
    : allAttributes;

  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString("ru-RU").replace(/,/g, " ");
  };

  const handleAddToCart = async (productId: string | undefined) => {
    if (
      !productId ||
      addingProducts.has(productId) ||
      addedProducts.has(productId)
    )
      return;

    try {
      setAddingProducts((prev) => new Set(prev).add(productId));

      if (isAuthenticated) {
        await userApi.addToCart(productId, 1);
        queryClient.invalidateQueries({ queryKey: ["userCart"] });
      } else {
        addToCartMutation.mutate({ productId, quantity: 1 });
      }

      setAddedProducts((prev) => new Set(prev).add(productId));

      // Reset "added" state after 2 seconds
      setTimeout(() => {
        setAddedProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 2000);

      console.log("Product added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const getProductsWord = (count: number) => {
    if (count === 1) return "товар";
    if (count >= 2 && count <= 4) return "товара";
    return "товаров";
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[50px]">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-[20px] md:mb-[30px]">
          <div className="h-[14px] w-[60px] bg-gray-200 rounded animate-pulse"></div>
          <div className="h-[14px] w-[8px] bg-gray-200 rounded animate-pulse"></div>
          <div className="h-[14px] w-[80px] bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Header skeleton */}
        <div className="mb-[24px] md:mb-[32px] lg:mb-[40px]">
          <div className="h-[32px] md:h-[36px] w-[250px] md:w-[320px] bg-gray-200 rounded animate-pulse mb-[8px]"></div>
          <div className="h-[16px] w-[180px] bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Mobile: Product cards skeleton */}
        <div className="lg:hidden mb-[24px]">
          <div className="flex gap-[12px] overflow-x-auto pb-[12px] -mx-[16px] px-[16px] md:-mx-[24px] md:px-[24px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[140px] md:w-[160px]">
                <div className="bg-white rounded-[16px] p-[12px] shadow-[0px_4px_20px_0px_rgba(19,19,20,0.08)]">
                  <div className="aspect-square bg-gray-200 rounded-[12px] mb-[8px] animate-pulse"></div>
                  <div className="h-[14px] bg-gray-200 rounded animate-pulse mb-[6px]"></div>
                  <div className="h-[14px] w-[80px] bg-gray-200 rounded animate-pulse mb-[4px]"></div>
                  <div className="h-[16px] w-[100px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Attributes skeleton */}
        <div className="lg:hidden">
          <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] overflow-hidden">
            <div className="bg-secondary-gray p-[16px] md:p-[20px]">
              <div className="flex items-center gap-[12px] mb-[12px]">
                <div className="w-[60px] h-[60px] bg-gray-200 rounded-[12px] animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-[15px] bg-gray-200 rounded animate-pulse mb-[8px]"></div>
                  <div className="h-[18px] w-[100px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-[44px] bg-gray-200 rounded-[60px] animate-pulse"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-[16px] md:p-[20px]"
                >
                  <div className="h-[14px] w-[120px] bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-[14px] w-[80px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Table skeleton */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-[240px] p-[24px] bg-secondary-gray text-left align-top">
                      <div className="h-[15px] w-[120px] bg-gray-200 rounded animate-pulse"></div>
                    </th>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <th
                        key={i}
                        className="p-[24px] bg-secondary-gray text-left align-top min-w-[260px]"
                      >
                        <div className="aspect-square bg-gray-200 rounded-[16px] mb-[16px] animate-pulse"></div>
                        <div className="h-[15px] bg-gray-200 rounded animate-pulse mb-[8px]"></div>
                        <div className="h-[13px] w-[80px] bg-gray-200 rounded animate-pulse mb-[8px]"></div>
                        <div className="h-[20px] w-[120px] bg-gray-200 rounded animate-pulse mb-[16px]"></div>
                        <div className="h-[44px] bg-gray-200 rounded-[60px] animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="p-[20px] sticky left-0 bg-inherit border-r border-gray-100">
                        <div className="h-[14px] w-[140px] bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <td key={j} className="p-[20px]">
                          <div className="h-[14px] bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Empty state
  if (compareItems.length === 0) {
    return (
      <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[50px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] md:text-[14px] mb-[20px] md:mb-[30px]">
          <Link
            href="/"
            className="text-text-secondary-black hover:text-primary-orange transition-colors"
          >
            Главная
          </Link>
          <span className="text-text-secondary-black">/</span>
          <span className="text-primary-black">Сравнение</span>
        </div>

        <h1 className="text-[24px] md:text-[28px] lg:text-[32px] xl:text-[36px] font-bold text-primary-black mb-[40px] md:mb-[60px]">
          Сравнение товаров
        </h1>

        <div className="flex flex-col items-center justify-center py-[60px] md:py-[80px] lg:py-[100px]">
          <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-secondary-gray rounded-full flex items-center justify-center mb-[24px] md:mb-[32px]">
            <svg
              className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] text-text-secondary-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-[18px] md:text-[20px] lg:text-[24px] font-semibold text-primary-black mb-[12px] text-center">
            Нет товаров для сравнения
          </h2>
          <p className="text-[14px] md:text-[16px] text-text-secondary-black text-center mb-[32px] max-w-[400px]">
            Добавьте товары в сравнение, нажав на иконку{" "}
            <span className="inline-flex items-center justify-center w-[20px] h-[20px] bg-secondary-gray rounded">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 14V17M3 17H6M3 17L6.5 13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 6V3M17 3H14M17 3L13.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{" "}
            на карточке товара
          </p>
          <Link href="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[50px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] md:text-[14px] mb-[20px] md:mb-[30px]">
        <Link
          href="/"
          className="text-text-secondary-black hover:text-primary-orange transition-colors"
        >
          Главная
        </Link>
        <span className="text-text-secondary-black">/</span>
        <span className="text-primary-black">Сравнение</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] lg:gap-[24px] mb-[24px] md:mb-[32px] lg:mb-[40px]">
        <div>
          <h1 className="text-[24px] md:text-[28px] lg:text-[32px] xl:text-[36px] font-bold text-primary-black">
            Сравнение товаров
          </h1>
          <p className="text-[14px] md:text-[16px] text-text-secondary-black mt-[4px] md:mt-[8px]">
            {products.length} {getProductsWord(products.length)} в сравнении
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[12px] md:gap-[16px]">
          {/* Toggle for differences only */}
          <label className="flex items-center gap-[8px] md:gap-[10px] cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[44px] h-[24px] bg-gray-200 rounded-full peer peer-checked:bg-primary-orange transition-colors"></div>
              <div className="absolute left-[2px] top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow transition-transform peer-checked:translate-x-[20px]"></div>
            </div>
            <span className="text-[13px] md:text-[14px] text-text-secondary-black group-hover:text-primary-black transition-colors">
              Только различия
            </span>
          </label>

          {/* Clear all button */}
          <button
            onClick={clearCompare}
            className="flex items-center gap-[6px] px-[16px] py-[10px] text-[13px] md:text-[14px] font-medium text-text-secondary-black border border-gray-200 rounded-[12px] hover:border-primary-orange hover:text-primary-orange transition-colors"
          >
            <svg
              className="w-[16px] h-[16px]"
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
            Очистить
          </button>
        </div>
      </div>

      {/* Mobile: Horizontal scroll products */}
      <div className="lg:hidden mb-[24px]">
        <div className="flex gap-[12px] overflow-x-auto pb-[12px] snap-x snap-mandatory scrollbar-hide -mx-[16px] px-[16px] md:-mx-[24px] md:px-[24px]">
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => setActiveProductIndex(index)}
              className={`flex-shrink-0 w-[140px] md:w-[160px] snap-start cursor-pointer transition-all ${
                activeProductIndex === index
                  ? "ring-2 ring-primary-orange rounded-[16px]"
                  : ""
              }`}
            >
              <div className="relative bg-white rounded-[16px] p-[12px] shadow-[0px_4px_20px_0px_rgba(19,19,20,0.08)]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(product.id);
                  }}
                  className="absolute top-[8px] right-[8px] w-[24px] h-[24px] bg-secondary-gray rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
                >
                  <svg
                    className="w-[12px] h-[12px] text-text-secondary-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="relative product-watermark aspect-square bg-secondary-gray rounded-[12px] mb-[8px] overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={140}
                      height={140}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-[32px] h-[32px] text-gray-300"
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
                </div>

                <p className="text-[12px] md:text-[13px] font-medium text-primary-black line-clamp-2 mb-[4px]">
                  {product.name}
                </p>
                <p className="text-[14px] md:text-[15px] font-bold text-primary-black">
                  {formatPrice(product.price)} ₽
                </p>
              </div>
            </div>
          ))}

          {/* Add product placeholder for mobile */}
          {products.length < 4 && (
            <Link
              href="/catalog"
              className="flex-shrink-0 w-[140px] md:w-[160px] snap-start"
            >
              <div className="relative bg-white rounded-[16px] p-[12px] shadow-[0px_4px_20px_0px_rgba(19,19,20,0.08)] border-2 border-dashed border-gray-200 hover:border-primary-orange transition-colors h-full min-h-[180px]">
                <div className="aspect-square bg-secondary-gray/50 rounded-[12px] mb-[8px] flex items-center justify-center">
                  <div className="w-[48px] h-[48px] bg-primary-orange/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-[24px] h-[24px] text-primary-orange"
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
                  </div>
                </div>
                <p className="text-[12px] md:text-[13px] font-medium text-text-secondary-black text-center">
                  Добавить товар
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: Attributes list for selected product */}
      <div className="lg:hidden">
        <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] overflow-hidden">
          {/* Product header */}
          <div className="bg-secondary-gray p-[16px] md:p-[20px]">
            <div className="flex items-center gap-[12px]">
              <div className="relative product-watermark w-[60px] h-[60px] bg-white rounded-[12px] overflow-hidden flex-shrink-0">
                {products[activeProductIndex]?.images?.[0]?.url ? (
                  <Image
                    src={products[activeProductIndex].images[0].url}
                    alt={products[activeProductIndex].name}
                    width={60}
                    height={60}
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={getProductUrl(products[activeProductIndex])}
                  className="text-[14px] md:text-[15px] font-medium text-primary-black hover:text-primary-orange line-clamp-2"
                >
                  {products[activeProductIndex]?.name}
                </Link>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[16px] md:text-[18px] font-bold text-primary-black">
                    {formatPrice(products[activeProductIndex]?.price || 0)} ₽
                  </span>
                  {products[activeProductIndex]?.oldPrice && (
                    <span className="text-[13px] text-text-secondary-black line-through">
                      {formatPrice(products[activeProductIndex].oldPrice)} ₽
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="default"
              className={`w-full mt-[12px] ${
                addedProducts.has(products[activeProductIndex]?.id || "")
                  ? "!bg-[#ef6f2e] hover:!bg-[#d96328]"
                  : "!bg-[#2c2c2e] hover:!bg-[#1a1a1c]"
              }`}
              size="sm"
              onClick={() => handleAddToCart(products[activeProductIndex]?.id)}
              disabled={
                !products[activeProductIndex]?.id ||
                addingProducts.has(products[activeProductIndex]?.id || "")
              }
            >
              {addingProducts.has(products[activeProductIndex]?.id || "")
                ? "Добавление..."
                : addedProducts.has(products[activeProductIndex]?.id || "")
                  ? "Добавлено"
                  : "В корзину"}
            </Button>
          </div>

          {/* Attributes */}
          <div className="divide-y divide-gray-100">
            {displayedAttributes.length > 0 ? (
              displayedAttributes.map((attrName) => {
                const attr = products[activeProductIndex]?.attributes.find(
                  (a) => a.name === attrName,
                );
                const differs = attributesDiffer(attrName);
                return (
                  <div
                    key={attrName}
                    className="flex items-center justify-between p-[16px] md:p-[20px]"
                  >
                    <span className="text-[13px] md:text-[14px] text-text-secondary-black">
                      {attrName}
                    </span>
                    <span
                      className={`text-[13px] md:text-[14px] font-medium ${differs ? "text-primary-orange" : "text-primary-black"}`}
                    >
                      {attr?.value || "—"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-[32px] text-center text-text-secondary-black">
                {showDifferencesOnly
                  ? "Все характеристики одинаковые"
                  : "Нет характеристик для сравнения"}
              </div>
            )}
          </div>
        </div>

        {/* Swipe hint */}
        <p className="text-[12px] text-text-secondary-black text-center mt-[16px]">
          Выберите товар выше для просмотра характеристик
        </p>
      </div>

      {/* Desktop: Full comparison table */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col className="w-[200px] xl:w-[240px]" />
                {products.map((p) => (
                  <col key={p.id} className="w-[240px] xl:w-[280px]" />
                ))}
                {products.length < 4 && (
                  <col className="w-[200px] xl:w-[240px]" />
                )}
              </colgroup>
              {/* Products header row */}
              <thead>
                <tr>
                  <th className="p-[20px] xl:p-[24px] bg-secondary-gray text-left align-top sticky left-0 z-10">
                    <span className="text-[14px] xl:text-[15px] font-medium text-text-secondary-black">
                      Характеристики
                    </span>
                  </th>
                  {products.map((product) => (
                    <th
                      key={product.id}
                      className="p-[20px] xl:p-[24px] bg-secondary-gray text-left align-top"
                    >
                      <div className="relative flex flex-col h-full">
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-[8px] -right-[8px] w-[28px] h-[28px] bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all z-10 group"
                        >
                          <svg
                            className="w-[12px] h-[12px] text-text-secondary-black group-hover:text-red-500 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        {/* Product Image — фиксированный размер */}
                        <Link href={getProductUrl(product)} className="block">
                          <div className="relative product-watermark w-[160px] h-[160px] xl:w-[180px] xl:h-[180px] mx-auto bg-white rounded-[14px] mb-[12px] overflow-hidden hover:shadow-md transition-shadow">
                            {product.images?.[0]?.url ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={180}
                                height={180}
                                className="w-full h-full object-contain p-[8px]"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-[48px] h-[48px] text-gray-200"
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
                          </div>
                        </Link>

                        {/* Product Info — фикс высота для выравнивания */}
                        <Link
                          href={getProductUrl(product)}
                          className="block text-[13px] xl:text-[14px] font-medium text-primary-black hover:text-primary-orange transition-colors mb-[6px] line-clamp-3 h-[54px] xl:h-[60px]"
                        >
                          {product.name}
                        </Link>

                        {/* Brand — фикс высота */}
                        <p className="text-[11px] xl:text-[12px] text-text-secondary-black mb-[6px] h-[16px]">
                          {product.brand?.name || "\u00A0"}
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-[6px] mb-[12px] h-[24px]">
                          <span className="text-[16px] xl:text-[18px] font-bold text-primary-black whitespace-nowrap">
                            {formatPrice(product.price)} ₽
                          </span>
                          {product.oldPrice && (
                            <span className="text-[12px] text-text-secondary-black line-through whitespace-nowrap">
                              {formatPrice(product.oldPrice)} ₽
                            </span>
                          )}
                        </div>

                        {/* Add to Cart — всегда внизу */}
                        <div className="mt-auto">
                          <Button
                            variant="default"
                            className={`w-full ${
                              addedProducts.has(product.id)
                                ? "!bg-[#ef6f2e] hover:!bg-[#d96328]"
                                : "!bg-[#2c2c2e] hover:!bg-[#1a1a1c]"
                            }`}
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={
                              !product.id || addingProducts.has(product.id)
                            }
                          >
                            {addingProducts.has(product.id)
                              ? "Добавление..."
                              : addedProducts.has(product.id)
                                ? "Добавлено"
                                : "В корзину"}
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Add product placeholder for desktop */}
                  {products.length < 4 && (
                    <th className="p-[20px] xl:p-[24px] bg-secondary-gray text-left align-top">
                      <Link href="/catalog" className="block group">
                        <div className="w-[160px] h-[160px] xl:w-[180px] xl:h-[180px] mx-auto bg-white rounded-[14px] mb-[12px] border-2 border-dashed border-gray-200 group-hover:border-primary-orange transition-colors flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-[56px] h-[56px] bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-[12px] group-hover:bg-primary-orange/20 transition-colors">
                              <svg
                                className="w-[24px] h-[24px] text-primary-orange"
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
                            </div>
                            <p className="text-[13px] font-medium text-text-secondary-black group-hover:text-primary-orange transition-colors">
                              Добавить
                            </p>
                          </div>
                        </div>
                        <p className="text-[12px] text-text-secondary-black text-center leading-relaxed">
                          Выберите товар из каталога
                        </p>
                      </Link>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Attributes rows */}
              <tbody>
                {displayedAttributes.length > 0 ? (
                  displayedAttributes.map((attrName, index) => {
                    const differs = attributesDiffer(attrName);
                    return (
                      <tr
                        key={attrName}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } hover:bg-secondary-gray/30 transition-colors`}
                      >
                        <td className="p-[14px] xl:p-[18px] text-[13px] xl:text-[14px] font-medium text-text-secondary-black sticky left-0 bg-inherit border-r border-gray-100">
                          {attrName}
                        </td>
                        {products.map((product) => {
                          const attr = product.attributes.find(
                            (a) => a.name === attrName,
                          );
                          return (
                            <td
                              key={product.id}
                              className={`p-[14px] xl:p-[18px] text-[13px] xl:text-[14px] ${
                                differs
                                  ? "text-primary-orange font-medium"
                                  : "text-primary-black"
                              }`}
                            >
                              {attr?.value || "—"}
                            </td>
                          );
                        })}
                        {/* Empty cell for placeholder column */}
                        {products.length < 4 && (
                          <td className="p-[14px] xl:p-[18px] text-[13px] xl:text-[14px] text-gray-300 text-center">
                            —
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={
                        products.length + 1 + (products.length < 4 ? 1 : 0)
                      }
                      className="p-[60px] text-center text-[14px] xl:text-[16px] text-text-secondary-black"
                    >
                      {showDifferencesOnly
                        ? "Все характеристики выбранных товаров одинаковые"
                        : "Нет характеристик для сравнения"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom hint for desktop */}
      <div className="hidden lg:block mt-[24px]">
        <p className="text-[13px] text-text-secondary-black text-center">
          {showDifferencesOnly
            ? `Показаны только различающиеся характеристики (${displayedAttributes.length} из ${allAttributes.length})`
            : `Всего ${allAttributes.length} ${
                allAttributes.length === 1
                  ? "характеристика"
                  : allAttributes.length < 5
                    ? "характеристики"
                    : "характеристик"
              }`}
        </p>
      </div>
    </main>
  );
}
