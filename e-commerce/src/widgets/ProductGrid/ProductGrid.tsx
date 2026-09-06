"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { ProductCard, type Product } from "@/entities/product";
import { productApi } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestFavoritesStore } from "@/shared/stores";
import { favoriteApi } from "@/shared/api/favoriteApi";

interface ProductGridProps {
  title?: string;
  showAllLink?: string;
  products?: Product[];
}

export const ProductGrid = memo(
  ({
    title = "Популярные товары",
    showAllLink,
    products: initialProducts,
  }: ProductGridProps) => {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [loading, setLoading] = useState(!initialProducts);

    useEffect(() => {
      if (!initialProducts) {
        const fetchProducts = async () => {
          try {
            setLoading(true);
            const response = await productApi.getAll({
              sortBy: "popularity",
              limit: 6,
              page: 1,
            });

            const transformedProducts = response.data.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.name,
              description: p.description?.trim() || undefined,
              price: parseFloat(p.price),
              images:
                p.images && p.images.length > 0
                  ? p.images.map((img) => img.url)
                  : ["/images/iphone17.png"],
              inStock: p.totalStock > 0,
              isNew:
                new Date(p.createdAt) >
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              isSale: p.isOnSale,
              isFavorite: false,
              attributes: p.attributes?.map((a) => ({
                name: a.name,
                value: a.value,
                showInCard: a.showInCard,
              })),
            }));

            setProducts(transformedProducts);
          } catch (error) {
            console.error("Failed to fetch products:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchProducts();
      }
    }, [initialProducts]);

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
            // For authenticated users
            const isFav = await favoriteApi.isFavorite(id);
            if (isFav) {
              await favoriteApi.removeFromFavorites(id);
            } else {
              await favoriteApi.addToFavorites(id);
            }
            // Update products state to reflect the change
            setProducts((prev) =>
              prev.map((p) => (p.id === id ? { ...p, isFavorite: !isFav } : p)),
            );
          } else {
            // For guest users
            toggleGuestFavorite(id);
            // Update products state for UI
            setProducts((prev) =>
              prev.map((p) =>
                p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
              ),
            );
          }
        } catch (error) {
          console.error("Failed to toggle favorite:", error);
        }
      },
      [isAuthenticated, toggleGuestFavorite],
    );

    if (loading) {
      return (
        <section className="w-full py-[40px] md:py-[50px] lg:py-[55px] xl:py-[60px]">
          <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
            <div className="flex items-center gap-[16px] md:gap-[20px] mb-[28px] md:mb-[28px] lg:mb-[32px] xl:mb-[40px] 2xl:mb-[60px]">
              <h2 className="font-medium text-[24px] md:text-[26px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
                {title}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[12px] md:gap-x-[12px] lg:gap-x-[16px] xl:gap-x-[24px] 2xl:gap-x-[40px] gap-y-[20px] md:gap-y-[24px] lg:gap-y-[24px] xl:gap-y-[30px] 2xl:gap-y-[50px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-[12px] animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-[40px] md:py-[50px] lg:py-[55px] xl:py-[60px]">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
          {/* Section Header */}
          <div className="flex items-center gap-[16px] md:gap-[20px] mb-[28px] md:mb-[28px] lg:mb-[32px] xl:mb-[40px] 2xl:mb-[60px]">
            <h2 className="font-medium text-[24px] md:text-[26px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[12px] md:gap-x-[12px] lg:gap-x-[16px] xl:gap-x-[24px] 2xl:gap-x-[40px] gap-y-[20px] md:gap-y-[24px] lg:gap-y-[24px] xl:gap-y-[30px] 2xl:gap-y-[50px]">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                {...product}
                imagePriority={index < 4}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
          </div>
        </div>
      </section>
    );
  },
);

ProductGrid.displayName = "ProductGrid";
