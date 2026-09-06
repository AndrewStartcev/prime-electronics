"use client";

import { memo } from "react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const FavoriteButton = memo(
  ({ isFavorite, onClick }: FavoriteButtonProps) => {
    return (
      <button
        onClick={onClick}
        className="absolute top-[10px] right-[10px] md:top-[14px] md:right-[14px] min-[1440px]:right-[12px] min-[1440px]:top-[12px] lg:top-[18px] lg:right-[16px] xl:top-[30px] xl:right-[30px] w-[28px] h-[28px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px] xl:w-[30px] xl:h-[30px] flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-90"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 30 30"
          fill="none"
          className="md:w-[20px] md:h-[20px] lg:w-[20px] lg:h-[20px] min-[1280px]:w-[22px] min-[1280px]:h-[22px] min-[1440px]:w-[24px] min-[1440px]:h-[24px] min-[1920px]:w-[30px] min-[1920px]:h-[30px]"
        >
          <path
            d="M15 26.25L13.125 24.5625C7.5 19.5 4 16.35 4 12.5C4 9.35 6.35 7 9.5 7C11.26 7 13.04 7.91 14.24 9.36H15.76C16.96 7.91 18.74 7 20.5 7C23.65 7 26 9.35 26 12.5C26 16.35 22.5 19.5 16.875 24.5625L15 26.25Z"
            fill={isFavorite ? "#ef6f2e" : "none"}
            stroke={isFavorite ? "#ef6f2e" : "#131314"}
            strokeWidth="1.5"
          />
        </svg>
      </button>
    );
  }
);

FavoriteButton.displayName = "FavoriteButton";
