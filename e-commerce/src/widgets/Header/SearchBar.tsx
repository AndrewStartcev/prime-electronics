"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CatalogButton } from "@/shared/ui";
import { SearchIcon } from "@/shared/ui/Icons";
import Link from "next/link";
import { searchApi } from "@/shared/api";
import { getProductUrl } from "@/shared/lib/productUrl";
import { useQuery } from "@tanstack/react-query";

interface SearchBarProps {
  isDark?: boolean;
}

export const SearchBar = ({ isDark = false }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch autocomplete results
  const { data: autocompleteData, isLoading } = useQuery({
    queryKey: ["search-autocomplete", debouncedQuery],
    queryFn: () => searchApi.autocomplete(debouncedQuery, 5),
    enabled: debouncedQuery.trim().length > 0,
  });

  // Fetch popular searches
  const { data: popularSearches = [] } = useQuery({
    queryKey: ["search-popular"],
    queryFn: () => searchApi.getPopular(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const products = autocompleteData?.products || [];
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] w-full">
      <CatalogButton isDark={isDark} href="/categories">
        <Image
          src="/icons/catalog.svg"
          alt="Catalogue"
          width={30}
          height={16}
        />
        <span className="font-normal text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] 2xl:text-[18px] leading-[1.1] text-white whitespace-nowrap">
          Каталог
        </span>
      </CatalogButton>
      <div
        ref={containerRef}
        className="relative w-[280px] md:w-[320px] lg:w-[380px] xl:w-[420px] 2xl:w-[579px]"
      >
        <div
          className={`flex w-full items-center gap-[10px] md:gap-[12px] lg:gap-[14px] xl:gap-[20px] px-[12px] py-[10px] md:px-[14px] md:py-[12px] lg:px-[16px] lg:py-[14px] xl:px-[18px] xl:py-[16px] 2xl:px-[24px] 2xl:py-[24px] border-[0.5px] ${
            isDark
              ? "border-[rgba(0,0,0,0.2)]"
              : "border-[rgba(255,255,255,0.4)]"
          } rounded-[60px]`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Искать: Iphone 17 pro"
            className={`flex-1 bg-transparent outline-none font-normal text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] 2xl:text-[18px] leading-[1.1] ${
              isDark
                ? "text-black placeholder:text-[rgba(0,0,0,0.4)]"
                : "text-white placeholder:text-[rgba(255,255,255,0.4)]"
            }`}
          />
          <button type="button" aria-label="Search">
            <SearchIcon className={isDark ? "text-black" : "text-white"} />
          </button>
        </div>
        {isOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-[10px] ${
              isDark
                ? "bg-white border border-[rgba(0,0,0,0.1)]"
                : "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]"
            } rounded-[20px] overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {/* Популярные запросы */}
            {!hasSearchQuery && popularSearches.length > 0 && (
              <div
                className={`p-[20px] border-b ${
                  isDark
                    ? "border-[rgba(0,0,0,0.1)]"
                    : "border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <p
                  className={`text-[14px] ${
                    isDark
                      ? "text-[rgba(0,0,0,0.4)]"
                      : "text-[rgba(255,255,255,0.4)]"
                  } mb-[12px]`}
                >
                  Популярные запросы
                </p>
                <div className="flex flex-wrap gap-[8px]">
                  {popularSearches.slice(0, 5).map((search) => (
                    <button
                      key={search.term}
                      onClick={() => {
                        setSearchQuery(search.term);
                      }}
                      className={`px-[14px] py-[8px] rounded-full text-[14px] transition-colors ${
                        isDark
                          ? "bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)] text-black"
                          : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white"
                      }`}
                    >
                      {search.term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Результаты поиска */}
            <div className="p-[10px]">
              {hasSearchQuery && (
                <p
                  className={`text-[14px] ${
                    isDark
                      ? "text-[rgba(0,0,0,0.4)]"
                      : "text-[rgba(255,255,255,0.4)]"
                  } px-[10px] py-[8px]`}
                >
                  {isLoading
                    ? "Поиск..."
                    : `Результаты для "${searchQuery.trim()}"`}
                </p>
              )}

              {!hasSearchQuery && !isLoading ? (
                <div className="p-[20px] text-center">
                  <p
                    className={
                      isDark
                        ? "text-[rgba(0,0,0,0.4)]"
                        : "text-[rgba(255,255,255,0.4)]"
                    }
                  >
                    Начните вводить для поиска
                  </p>
                </div>
              ) : products.length > 0 ? (
                <div className="flex flex-col">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={getProductUrl(product)}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-[16px] p-[12px] rounded-[12px] transition-colors group ${
                        isDark
                          ? "hover:bg-[rgba(0,0,0,0.05)]"
                          : "hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      <div
                        className={`relative product-watermark w-[50px] h-[50px] rounded-[10px] flex items-center justify-center overflow-hidden ${
                          isDark
                            ? "bg-[rgba(0,0,0,0.05)]"
                            : "bg-[rgba(255,255,255,0.05)]"
                        }`}
                      >
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-[16px] group-hover:text-[#ef6f2e] transition-colors ${
                            isDark ? "text-black" : "text-white"
                          }`}
                        >
                          {product.name}
                        </p>
                        <p
                          className={`text-[13px] ${
                            isDark
                              ? "text-[rgba(0,0,0,0.4)]"
                              : "text-[rgba(255,255,255,0.4)]"
                          }`}
                        >
                          {product.category.title}
                        </p>
                      </div>
                      <p className="text-[14px] text-[#ef6f2e] font-medium">
                        от {parseInt(product.price).toLocaleString("ru-RU")} ₽
                      </p>
                    </Link>
                  ))}
                </div>
              ) : hasSearchQuery && !isLoading ? (
                <div className="p-[20px] text-center">
                  <p
                    className={
                      isDark
                        ? "text-[rgba(0,0,0,0.4)]"
                        : "text-[rgba(255,255,255,0.4)]"
                    }
                  >
                    Ничего не найдено
                  </p>
                </div>
              ) : null}
            </div>

            {/* Показать все результаты */}
            {hasSearchQuery && products.length > 0 && (
              <div
                className={`p-[10px] border-t ${
                  isDark
                    ? "border-[rgba(0,0,0,0.1)]"
                    : "border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center gap-[8px] p-[14px] rounded-[12px] transition-colors ${
                    isDark
                      ? "bg-[rgba(0,0,0,0.05)] hover:bg-[#ef6f2e] text-black hover:text-white"
                      : "bg-[rgba(255,255,255,0.05)] hover:bg-[#ef6f2e] text-white"
                  }`}
                >
                  <SearchIcon />
                  <span>Показать все результаты</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
