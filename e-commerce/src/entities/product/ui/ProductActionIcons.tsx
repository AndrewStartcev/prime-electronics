"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestFavoritesStore } from "@/shared/stores/useGuestFavoritesStore";
import { useCompareStore } from "@/shared/stores/useCompareStore";
import { favoriteApi } from "@/shared/api/favoriteApi";

interface ProductActionIconsProps {
  productId: string;
  productTitle?: string;
}

export const ProductActionIcons = ({
  productId,
  productTitle,
}: ProductActionIconsProps) => {
  const { isAuthenticated } = useAuthStore();
  const {
    initialize,
    isFavorite: isGuestFavorite,
    toggleFavorite: toggleGuestFavorite,
  } = useGuestFavoritesStore();
  const compareItems = useCompareStore((state) => state.compareItems);
  const toggleCompare = useCompareStore((state) => state.toggleCompare);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showCompareToast, setShowCompareToast] = useState(false);
  const [compareToastMessage, setCompareToastMessage] = useState("");

  const inCompare = useMemo(
    () => compareItems.includes(productId),
    [compareItems, productId],
  );

  useEffect(() => {
    // Initialize guest favorites on mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && productId) {
      checkFavorite();
    } else if (productId) {
      // For guests, check localStorage
      setIsFavorite(isGuestFavorite(productId));
    }
  }, [isAuthenticated, productId, isGuestFavorite]);

  const checkFavorite = async () => {
    try {
      const result = await favoriteApi.isFavorite(productId);
      setIsFavorite(result);
    } catch (error) {
      console.error("Failed to check favorite:", error);
    }
  };

  const handleShareClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const shareUrl = window.location.href;
      const shareTitle = productTitle || "Товар";

      // Try native share API first (for mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `Посмотрите этот товар: ${shareTitle}`,
            url: shareUrl,
          });
          return;
        } catch (error) {
          // User cancelled or share failed, fallback to clipboard
          if ((error as Error).name !== "AbortError") {
            console.error("Share failed:", error);
          }
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        // Final fallback - select and copy
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    },
    [productTitle],
  );

  const handleCompareClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const wasInCompare = inCompare;
      toggleCompare(productId);

      if (wasInCompare) {
        setCompareToastMessage("Удалено из сравнения");
      } else {
        setCompareToastMessage("Добавлено к сравнению");
      }
      setShowCompareToast(true);
      setTimeout(() => setShowCompareToast(false), 2000);
    },
    [productId, inCompare, toggleCompare],
  );

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // Guest user - use localStorage
    if (!isAuthenticated) {
      toggleGuestFavorite(productId);
      setIsFavorite(!isFavorite);
      return;
    }

    // Authenticated user - use API
    try {
      setIsLoading(true);

      if (isFavorite) {
        await favoriteApi.removeFromFavorites(productId);
        setIsFavorite(false);
      } else {
        await favoriteApi.addToFavorites(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] shrink-0">
      {/* Share Button */}
      <button
        onClick={handleShareClick}
        className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[40px] lg:h-[40px] border border-[rgba(19,19,20,0.16)] rounded-[6px] md:rounded-[7px] lg:rounded-[8px] flex items-center justify-center hover:bg-[rgba(19,19,20,0.05)] transition-colors"
        title="Поделиться"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
        >
          <path
            d="M15 7a3 3 0 100-6 3 3 0 000 6zM5 13a3 3 0 100-6 3 3 0 000 6zM15 19a3 3 0 100-6 3 3 0 000 6zM7.59 11.51l4.83 2.98M12.41 5.51L7.59 8.49"
            stroke="#131314"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Compare Button */}
      <button
        onClick={handleCompareClick}
        className={`w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[40px] lg:h-[40px] border rounded-[6px] md:rounded-[7px] lg:rounded-[8px] flex items-center justify-center transition-colors ${
          inCompare
            ? "border-[#ef6f2e] bg-[#ef6f2e]/10"
            : "border-[rgba(19,19,20,0.16)] hover:bg-[rgba(19,19,20,0.05)]"
        }`}
        title={inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
        >
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke={inCompare ? "#ef6f2e" : "#131314"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isLoading}
        className={`w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[40px] lg:h-[40px] border rounded-[6px] md:rounded-[7px] lg:rounded-[8px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isFavorite
            ? "border-[#ef6f2e] bg-[#ef6f2e]/10"
            : "border-[rgba(19,19,20,0.16)] hover:bg-[rgba(19,19,20,0.05)]"
        }`}
        title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
        >
          <path
            d="M10 17.5l-1.25-1.125C5 13 2.5 10.9 2.5 8.25c0-2.1 1.65-3.75 3.75-3.75 1.18 0 2.31.55 3.05 1.42h1.4c.74-.87 1.87-1.42 3.05-1.42 2.1 0 3.75 1.65 3.75 3.75 0 2.65-2.5 4.75-6.25 8.125L10 17.5z"
            stroke={isFavorite ? "#ef6f2e" : "#131314"}
            strokeWidth="1.5"
            fill={isFavorite ? "#ef6f2e" : "none"}
          />
        </svg>
      </button>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-[#131314] text-white text-[12px] rounded-[6px] whitespace-nowrap z-50 animate-fade-in">
          Ссылка скопирована
        </div>
      )}

      {/* Compare Toast */}
      {showCompareToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#131314] text-white text-[12px] rounded-[6px] whitespace-nowrap z-50 animate-fade-in">
          {compareToastMessage}
        </div>
      )}
    </div>
  );
};

ProductActionIcons.displayName = "ProductActionIcons";
