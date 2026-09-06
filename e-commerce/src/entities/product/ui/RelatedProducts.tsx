"use client";

import { useCallback, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Product } from "../model";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestFavoritesStore } from "@/shared/stores";
import { favoriteApi } from "@/shared/api/favoriteApi";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export const RelatedProducts = ({
  products,
  title = "Похожие товары",
}: RelatedProductsProps) => {
  const { isAuthenticated } = useAuthStore();
  const {
    toggleFavorite: toggleGuestFavorite,
    initialize: initializeGuestFavorites,
    initialized: guestFavoritesInitialized,
  } = useGuestFavoritesStore();

  // Initialize guest favorites
  useEffect(() => {
    if (!isAuthenticated && !guestFavoritesInitialized) {
      initializeGuestFavorites();
    }
  }, [isAuthenticated, guestFavoritesInitialized, initializeGuestFavorites]);

  const handleFavoriteClick = useCallback(
    async (id: string) => {
      try {
        if (isAuthenticated) {
          const isFav = await favoriteApi.isFavorite(id);
          if (isFav) {
            await favoriteApi.removeFromFavorites(id);
          } else {
            await favoriteApi.addToFavorites(id);
          }
        } else {
          toggleGuestFavorite(id);
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
      }
    },
    [isAuthenticated, toggleGuestFavorite],
  );

  return (
    <section className="mt-[40px] md:mt-[50px] lg:mt-[50px] xl:mt-[60px] 2xl:mt-[80px]">
      <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[26px] xl:text-[32px] 2xl:text-[46px] leading-[1.2] text-[#131314] mb-[24px] md:mb-[28px] lg:mb-[24px] xl:mb-[32px] 2xl:mb-[40px]">
        {title}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-[10px] md:gap-[14px] lg:gap-[12px] xl:gap-[16px] 2xl:gap-[20px]">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onFavoriteClick={handleFavoriteClick}
          />
        ))}
      </div>
    </section>
  );
};
