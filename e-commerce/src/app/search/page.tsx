"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/shared/api";
import { getProductUrl } from "@/shared/lib/productUrl";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when search changes
  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`);
      return;
    }
    router.replace("/search");
  }, [debouncedQuery, router]);

  // Fetch search results
  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search-results", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery, 20),
    enabled: debouncedQuery.trim().length > 0,
  });

  // Fetch popular searches
  const { data: popularSearches = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ["search-popular"],
    queryFn: () => searchApi.getPopular(),
    enabled: !debouncedQuery,
  });

  const products = searchData?.results || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[rgba(19,19,20,0.1)]">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex-shrink-0"
            aria-label="Назад"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#131314"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full px-4 py-2.5 pr-10 bg-[#f5f5f7] rounded-[10px] text-[16px] text-primary-black placeholder:text-[rgba(19,19,20,0.4)] focus:outline-none focus:ring-2 focus:ring-primary-orange"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="rgba(19,19,20,0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 19L14.65 14.65"
                  stroke="rgba(19,19,20,0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-10 top-1/2 -translate-y-1/2"
                aria-label="Очистить"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="rgba(19,19,20,0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {!debouncedQuery ? (
          // Popular Searches
          <div>
            <h2 className="text-[18px] font-medium text-primary-black mb-4">
              Популярные запросы
            </h2>
            {isPopularLoading ? (
              <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-2">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="h-[40px] rounded-[10px] bg-[#f5f5f7] animate-pulse"
                  />
                ))}
              </div>
            ) : popularSearches.length > 0 ? (
              <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={`${item.term}-${index}`}
                    onClick={() => setSearchQuery(item.term)}
                    className="w-full px-4 py-2.5 bg-[#f5f5f7] rounded-[10px] text-[14px] text-primary-black hover:bg-[rgba(239,111,46,0.1)] transition-colors text-left break-words leading-[1.2]"
                  >
                    {item.term}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 bg-[#f5f5f7] rounded-[10px] text-[14px] text-[rgba(19,19,20,0.55)]">
                Популярные запросы пока недоступны
              </div>
            )}
          </div>
        ) : isLoading ? (
          // Loading State
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-20 h-20 bg-[#f5f5f7] rounded-[10px]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#f5f5f7] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#f5f5f7] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          // Search Results
          <div>
            <p className="text-[14px] text-[rgba(19,19,20,0.6)] mb-4">
              Найдено товаров: {searchData?.total || products.length}
            </p>
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  className="flex gap-3 p-3 hover:bg-[#f5f5f7] rounded-[10px] transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative product-watermark w-20 h-20 bg-[#f5f5f7] rounded-[10px] flex-shrink-0 overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16 2L2 9L16 16L30 9L16 2Z"
                            stroke="rgba(19,19,20,0.2)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 23L16 30L30 23"
                            stroke="rgba(19,19,20,0.2)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 16L16 23L30 16"
                            stroke="rgba(19,19,20,0.2)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-primary-black line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[16px] font-semibold text-primary-black">
                      {parseFloat(product.price).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // No Results
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4"
            >
              <path
                d="M28 52C40.7025 52 51 41.7025 51 29C51 16.2975 40.7025 6 28 6C15.2975 6 5 16.2975 5 29C5 41.7025 15.2975 52 28 52Z"
                stroke="rgba(19,19,20,0.16)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M58 58L45 45"
                stroke="rgba(19,19,20,0.16)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[18px] text-[rgba(19,19,20,0.4)] text-center">
              По запросу «{debouncedQuery}» ничего не найдено
            </p>
            <p className="text-[14px] text-[rgba(19,19,20,0.4)] text-center mt-2">
              Попробуйте изменить запрос
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SearchPageContent />
    </Suspense>
  );
}
