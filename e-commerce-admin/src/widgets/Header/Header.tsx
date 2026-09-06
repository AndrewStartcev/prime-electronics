"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { productsApi, type Product } from "@/shared/api";
import { useLogout } from "@/shared/hooks";

export const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logout = useLogout();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await productsApi.getAll({
          search: searchQuery,
          limit: 5,
        });
        setSearchResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setSearchQuery("");
    setShowResults(false);
    setShowSearch(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
      <div className="w-10 lg:hidden" />
      <div className="hidden lg:block w-96" ref={searchRef}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-black z-10"
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
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-secondary-gray text-primary-black placeholder:text-text-secondary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all"
          />
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-text-secondary-black">
                  Поиск...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full px-4 py-3 hover:bg-secondary-gray transition-colors flex items-center gap-3 text-left"
                    >
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary-gray rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-text-secondary-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary-black truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-text-secondary-black">
                          {typeof product.price === "number"
                            ? `${product.price.toLocaleString()} ₸`
                            : product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-text-secondary-black">
                  Товары не найдены
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="lg:hidden p-2 rounded-xl hover:bg-secondary-gray transition-colors"
      >
        <svg
          className="w-6 h-6 text-primary-black"
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
      </button>{" "}
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-primary-black transition-colors hover:border-primary-orange hover:text-primary-orange disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Выйти из админки"
          title="Выйти из админки"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            {logout.isPending ? "Выходим..." : "Выйти"}
          </span>
        </button>
      </div>
      {/* Mobile Search Dropdown */}
      {showSearch && (
        <div className="lg:hidden absolute top-16 left-0 right-0 p-4 bg-white border-b border-gray-100 shadow-md z-30">
          <div className="relative" ref={searchRef}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-black z-10"
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
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-secondary-gray text-primary-black placeholder:text-text-secondary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all"
            />
            {/* Mobile Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-text-secondary-black">
                    Поиск...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full px-4 py-3 hover:bg-secondary-gray transition-colors flex items-center gap-3 text-left"
                      >
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-secondary-gray rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-text-secondary-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-black truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-text-secondary-black">
                            {typeof product.price === "number"
                              ? `${product.price.toLocaleString()} ₸`
                              : product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-text-secondary-black">
                    Товары не найдены
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
