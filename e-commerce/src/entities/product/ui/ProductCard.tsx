"use client";

import { memo, useCallback, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Product } from "../model";
import { ImageSlider } from "./ImageSlider";
import { Sticker } from "./Sticker";
import { FavoriteButton } from "./FavoriteButton";
import { StockStatus } from "./StockStatus";
import { Price } from "./Price";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import {
  useGuestStore,
  useGuestFavoritesStore,
  useCartNotificationStore,
} from "@/shared/stores";
import { userApi, type UserCartItem } from "@/shared/api/userApi";
import { favoriteApi } from "@/shared/api/favoriteApi";
import {
  useCart,
  useAddToCart,
  useRemoveFromCart,
} from "@/shared/hooks";
import { getProductUrl } from "@/shared/lib/productUrl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSimEsimDisplay, isSimAttribute } from "../lib/simEsim";

interface ProductCardProps extends Product {
  comingSoon?: boolean;
  onFavoriteClick?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  className?: string;
  showAttributes?: boolean;
  imagePriority?: boolean;
}

const EMPTY_USER_CART: UserCartItem[] = [];

export const ProductCard = memo(
  ({
    id,
    slug,
    title,
    description,
    price,
    images,
    inStock = true,
    isNew = false,
    isSale = false,
    isFavorite = false,
    comingSoon,
    attributes,
    onFavoriteClick,
    onAddToCart,
    className,
    showAttributes = true,
    imagePriority = false,
  }: ProductCardProps) => {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    const { isInitialized: guestInitialized, initialize: initializeGuest } =
      useGuestStore();
    const showCartNotification = useCartNotificationStore((s) => s.show);
    const {
      isFavorite: isGuestFavorite,
      toggleFavorite: toggleGuestFavorite,
      initialize: initializeGuestFavorites,
      initialized: guestFavoritesInitialized,
    } = useGuestFavoritesStore();

    // Use cached cart data
    const { data: guestCart } = useCart();
    const { data: userCart = EMPTY_USER_CART } = useQuery({
      queryKey: ["userCart"],
      queryFn: () => userApi.getCart(),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
    const addToCartMutation = useAddToCart();
    const removeFromCartMutation = useRemoveFromCart();

    const [isAdding, setIsAdding] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isFav, setIsFav] = useState(isFavorite);

    // Initialize guest favorites on mount
    useEffect(() => {
      if (!isAuthenticated && !guestFavoritesInitialized) {
        initializeGuestFavorites();
      }
    }, [isAuthenticated, guestFavoritesInitialized, initializeGuestFavorites]);

    // Update favorite state based on guest or auth
    useEffect(() => {
      if (isAuthenticated) {
        setIsFav(isFavorite);
      } else {
        setIsFav(isGuestFavorite(id));
      }
    }, [isAuthenticated, isFavorite, id, isGuestFavorite]);

    const userCartItem = useMemo(
      () => userCart.find((item) => item.productId === id),
      [userCart, id],
    );

    // Check if item is in cart
    useEffect(() => {
      if (isAuthenticated) {
        setIsInCart(Boolean(userCartItem));
        return;
      }

      setIsInCart(
        guestCart?.items.some((item) => item.productId === id) ?? false,
      );
    }, [isAuthenticated, userCartItem, guestCart?.items, id]);

    const handleFavoriteClick = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onFavoriteClick) {
          onFavoriteClick(id);
          return;
        }

        // Default behavior
        try {
          if (isAuthenticated) {
            // For authenticated users
            const currentlyFav = await favoriteApi.isFavorite(id);
            if (currentlyFav) {
              await favoriteApi.removeFromFavorites(id);
              setIsFav(false);
            } else {
              await favoriteApi.addToFavorites(id);
              setIsFav(true);
            }
          } else {
            // For guest users
            toggleGuestFavorite(id);
            setIsFav(isGuestFavorite(id));
          }
        } catch (error) {
          console.error("Failed to toggle favorite:", error);
        }
      },
      [
        onFavoriteClick,
        id,
        isAuthenticated,
        toggleGuestFavorite,
        isGuestFavorite,
      ],
    );

    const handleAddToCart = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdding) return;

        const wasInCart = isInCart;

        try {
          setIsAdding(true);
          // Optimistically update UI immediately
          setIsInCart(!wasInCart);

          // If already in cart, remove it
          if (wasInCart) {
            if (onAddToCart) {
              onAddToCart(id);
            } else {
              if (isAuthenticated) {
                if (userCartItem) {
                  await userApi.removeFromCart(userCartItem.id);
                }
                // Инвалидируем кэш корзины для немедленного обновления
                await queryClient.invalidateQueries({ queryKey: ["userCart"] });
                console.log("Product removed from user cart");
              } else {
                await removeFromCartMutation.mutateAsync(id);
                console.log("Product removed from guest cart");
              }
            }
          } else {
            // Add to cart
            if (onAddToCart) {
              onAddToCart(id);
            } else {
              // Default behavior: add to cart via API
              if (isAuthenticated) {
                await userApi.addToCart(id, 1);
                // Инвалидируем кэш корзины для немедленного обновления
                await queryClient.invalidateQueries({ queryKey: ["userCart"] });
              } else {
                // For guest users, ensure session is initialized first
                if (!guestInitialized) {
                  await initializeGuest();
                }

                await addToCartMutation.mutateAsync({ productId: id, quantity: 1 });
              }
              showCartNotification();
            }
          }
        } catch (error) {
          console.error("Failed to toggle cart:", error);
          // Rollback optimistic update on error
          setIsInCart(wasInCart);
        } finally {
          setIsAdding(false);
        }
      },
      [
        onAddToCart,
        id,
        isAuthenticated,
        isAdding,
        isInCart,
        userCartItem,
        addToCartMutation,
        removeFromCartMutation,
        guestInitialized,
        initializeGuest,
        queryClient,
        showCartNotification,
      ],
    );

    const productHref = getProductUrl({ id, slug });

    const handleCardClick = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        if (e.defaultPrevented) return;

        const target = e.target as HTMLElement;
        if (
          target.closest(
            'a, button, input, textarea, select, [role="button"], [data-no-card-navigation]',
          )
        ) {
          return;
        }

        router.push(productHref, { scroll: true });
      },
      [productHref, router],
    );

    const simDisplay = useMemo(
      () => getSimEsimDisplay({ attributes, title }),
      [attributes, title],
    );

    const cardAttributes = useMemo(() => {
      const visibleAttributes = (attributes || []).filter(
        (attr) => !isSimAttribute(attr),
      );
      const highlightedAttributes = visibleAttributes.filter(
        (attr) => attr.showInCard,
      );

      return (
        highlightedAttributes.length > 0
          ? highlightedAttributes
          : visibleAttributes
      ).slice(0, 3);
    }, [attributes]);

    return (
      <article
        data-href={productHref}
        onClick={handleCardClick}
        className={cn(
          "group flex h-full flex-col w-full cursor-pointer bg-white p-[12px] md:p-[10px] lg:p-[12px] xl:p-[14px] 2xl:p-[16px] 3xl:p-[20px] rounded-[16px] md:rounded-[14px] lg:rounded-[16px] xl:rounded-[18px] 2xl:rounded-[24px] 3xl:rounded-[30px] transition-all duration-300 hover:shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)]",
          className,
        )}
      >
        {/* Image Section */}
        <div className="relative">
          <Link
            href={productHref}
            scroll
            aria-label={`Открыть товар: ${title}`}
          >
            <ImageSlider images={images} alt={title} priority={imagePriority} />
          </Link>
          {isNew && <Sticker type="new" />}
          {isSale && !isNew && <Sticker type="sale" />}
          <FavoriteButton isFavorite={isFav} onClick={handleFavoriteClick} />
        </div>
        <div className="flex flex-1 flex-col gap-[10px] md:gap-[10px] lg:gap-[10px] xl:gap-[12px] 2xl:gap-[14px] 3xl:gap-[20px] mt-[12px] md:mt-[12px] lg:mt-[14px] xl:mt-[16px] 2xl:mt-[18px] 3xl:mt-[30px]">
          <Link
            href={productHref}
            scroll
            aria-label={`Открыть товар: ${title}`}
            className="font-medium text-[14px] md:text-[14px] lg:text-[13px] xl:text-[14px] 2xl:text-[18px] 3xl:text-[22px] leading-[1.3] text-[#131314] line-clamp-3 min-h-[55px] md:min-h-[55px] lg:min-h-[51px] xl:min-h-[55px] 2xl:min-h-[70px] 3xl:min-h-[86px] transition-colors hover:text-[#ef6f2e]"
            title={title}
          >
            {title}
          </Link>
          {description && (
            <p className="text-[11px] md:text-[11px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] leading-[1.4] text-[#131314]/60 line-clamp-2">
              {description}
            </p>
          )}
          {simDisplay && (
            <div className="flex items-baseline justify-between gap-[6px] text-[11px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] leading-[1.3]">
              <span className="text-[#131314]/40 truncate shrink-0">
                SIM / eSIM
              </span>
              <span className="border-b border-dotted border-[#131314]/15 flex-1 min-w-[12px] translate-y-[-3px]" />
              <span className="text-[#131314] truncate text-right max-w-[60%]">
                {simDisplay}
              </span>
            </div>
          )}
          {showAttributes && cardAttributes.length > 0 && (
            <div className="hidden md:flex flex-col gap-[3px] xl:gap-[4px] 2xl:gap-[5px]">
              {cardAttributes.map((attr, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-[6px] text-[11px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] leading-[1.3]"
                >
                  <span className="text-[#131314]/40 truncate shrink-0">
                    {attr.name}
                  </span>
                  <span className="border-b border-dotted border-[#131314]/15 flex-1 min-w-[12px] translate-y-[-3px]" />
                  <span className="text-[#131314] truncate text-right max-w-[50%]">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-auto flex flex-col gap-[8px] md:contents md:mt-0">
            <div className="flex w-full items-center justify-between gap-[8px]">
              <div className="flex-1 min-w-0">
                <Price price={price} comingSoon={comingSoon} />
              </div>
              <div className="shrink-0 hidden md:block">
                <StockStatus inStock={!comingSoon && inStock} />
              </div>
            </div>
            <div className="md:hidden flex flex-col gap-[8px]">
              <StockStatus inStock={!comingSoon && inStock} />
              <button
                onClick={handleAddToCart}
                className={cn(
                  "h-[42px] w-full rounded-[14px] px-[14px] text-[13px] font-medium leading-none text-white whitespace-nowrap transition-all active:scale-[0.98]",
                  isInCart
                    ? "bg-primary-orange hover:bg-[#d96328]"
                    : "bg-[#131314] hover:bg-[#2c2c2e]",
                )}
                aria-label={isInCart ? "Товар в корзине" : "Добавить в корзину"}
              >
                {isInCart ? "В корзине" : "В корзину"}
              </button>
            </div>
          </div>

          {/* Add to Cart Button - hidden on mobile, visible on desktop hover */}
          <div className="hidden md:block h-[36px] lg:h-[40px] xl:h-[44px] 2xl:h-[48px] min-[1440px]:h-[56px] mt-[4px] lg:mt-[6px] xl:mt-[8px] 2xl:mt-[10px] min-[1440px]:mt-[12px]">
            <button
              onClick={handleAddToCart}
              className={cn(
                "opacity-0 group-hover:opacity-100 flex items-center justify-center h-full text-white px-[12px] lg:px-[16px] xl:px-[20px] 2xl:px-[24px] min-[1440px]:px-[28px] py-[10px] lg:py-[12px] xl:py-[14px] 2xl:py-[16px] min-[1440px]:py-[18px] rounded-[60px] font-normal text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] min-[1440px]:text-[16px] leading-[1.1] transition-all duration-300 whitespace-nowrap",
                isInCart
                  ? "bg-primary-orange hover:bg-[#d96328]"
                  : "bg-[#131314] hover:bg-[#2c2c2e]",
              )}
            >
              {isInCart ? "В корзине" : "В корзину"}
            </button>
          </div>
        </div>
      </article>
    );
  },
);

ProductCard.displayName = "ProductCard";
