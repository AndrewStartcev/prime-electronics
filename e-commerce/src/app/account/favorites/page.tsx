"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductCard } from "@/entities/product";
import { favoriteApi } from "@/shared/api/favoriteApi";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestFavoritesStore } from "@/shared/stores";
import { productApi } from "@/shared/api";
import Image from "next/image";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    getFavoritesList: getGuestFavorites,
    clearFavorites: clearGuestFavorites,
    initialize: initializeGuestFavorites,
    initialized: guestFavoritesInitialized,
  } = useGuestFavoritesStore();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize guest favorites
  useEffect(() => {
    if (!isAuthenticated && !guestFavoritesInitialized) {
      initializeGuestFavorites();
    }
  }, [isAuthenticated, guestFavoritesInitialized, initializeGuestFavorites]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      // Don't load if guest favorites are not initialized yet
      if (!isAuthenticated && !guestFavoritesInitialized) {
        return;
      }

      try {
        setLoading(true);

        if (isAuthenticated) {
          // Load from API for authenticated users
          const favData = await favoriteApi.getFavorites();
          const transformedFavorites = favData.map((fav) => ({
            id: fav.product.id,
            slug: fav.product.slug,
            title: fav.product.name,
            description: fav.product.description?.trim() || undefined,
            price: parseFloat(fav.product.price),
            images: fav.product.image
              ? [fav.product.image]
              : ["/images/placeholder-product.png"],
            inStock: fav.product.inStock,
            isNew: false,
            isSale: fav.product.isOnSale,
            isFavorite: true,
          }));
          setFavorites(transformedFavorites);
        } else {
          // Load from localStorage for guest users
          const guestFavIds = getGuestFavorites();
          if (guestFavIds.length > 0) {
            // Fetch products by IDs
            const productPromises = guestFavIds.map((id) =>
              productApi.getById(id).catch(() => null)
            );
            const products = await Promise.all(productPromises);

            const transformedFavorites = products
              .filter((p) => p !== null)
              .map((p: any) => ({
                id: p.id,
                slug: p.slug,
                title: p.name,
                description: p.description?.trim() || undefined,
                price: parseFloat(p.price),
                images:
                  p.images.length > 0
                    ? p.images.map((img: any) => img.url)
                    : ["/images/placeholder-product.png"],
                inStock: p.totalStock > 0,
                isNew:
                  new Date(p.createdAt) >
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                isSale: p.isOnSale,
                isFavorite: true,
              }));
            setFavorites(transformedFavorites);
          } else {
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, getGuestFavorites, guestFavoritesInitialized]);

  const handleRemoveAll = async () => {
    try {
      if (isAuthenticated) {
        // Remove all from API
        await Promise.all(
          favorites.map((fav) => favoriteApi.removeFromFavorites(fav.id))
        );
      } else {
        // Clear guest favorites
        clearGuestFavorites();
      }
      setFavorites([]);
    } catch (error) {
      console.error("Failed to remove all favorites:", error);
    }
  };

  const handleFavoriteClick = useCallback(
    async (id: string) => {
      try {
        if (isAuthenticated) {
          await favoriteApi.removeFromFavorites(id);
        }
        // Remove from local state
        setFavorites((prev) => prev.filter((fav) => fav.id !== id));
      } catch (error) {
        console.error("Failed to remove favorite:", error);
      }
    },
    [isAuthenticated]
  );

  if (loading) {
    return (
      <>
        <h2 className="text-primary-black text-[26px] font-medium leading-[1.1] mb-6">
          Избранные товары
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[8px] md:gap-x-[12px] lg:gap-x-[20px] xl:gap-x-[40px] gap-y-[16px] md:gap-y-[24px] lg:gap-y-[30px] xl:gap-y-[50px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-[12px] animate-pulse"
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-primary-black text-[26px] font-medium leading-[1.1] mb-6">
        Избранные товары
      </h2>
      {favorites.length > 0 ? (
        <>
          {/* Remove All Button */}
          <button
            onClick={handleRemoveAll}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border border-[rgba(19,19,20,0.16)] mb-[15px] hover:border-primary-orange hover:text-primary-orange transition-colors group"
          >
            <span className="text-primary-black text-base leading-[1.3] group-hover:text-primary-orange transition-colors">
              Удалить все
            </span>
            <Image
              src="/icons/trash.svg"
              alt="Delete"
              width={17}
              height={17}
              className="group-hover:opacity-100 transition-opacity"
            />
          </button>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[8px] md:gap-[12px] lg:gap-[20px] xl:gap-[40px] gap-y-[16px] md:gap-y-[24px] lg:gap-y-[30px] xl:gap-y-[50px]">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] bg-[#f5f5f7] rounded-full flex items-center justify-center mb-[20px] md:mb-[24px] lg:mb-[30px]">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] lg:w-[56px] lg:h-[56px]"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="rgba(19,19,20,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[rgba(19,19,20,0.4)] text-lg font-medium">
            Ваш список избранного пуст
          </p>
        </div>
      )}
    </>
  );
}
