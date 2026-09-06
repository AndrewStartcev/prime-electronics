"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProductUrl } from "@/shared/lib/productUrl";

interface FavoriteCardProps {
  id: string;
  slug?: string | null;
  title: string;
  price: number;
  image: string;
  inStock: boolean;
  onRemove?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const FavoriteCard = ({
  id,
  slug,
  title,
  price,
  image,
  inStock,
  onRemove,
  onAddToCart,
}: FavoriteCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [image, image, image, image]; // Mock multiple images
  const productHref = getProductUrl({ id, slug });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Image Container */}
      <div className="relative product-watermark w-full aspect-square rounded-[14px] bg-secondary-gray overflow-hidden group">
        <Link href={productHref}>
          <Image src={image} alt={title} fill className="object-cover" />
        </Link>

        {/* Image Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`rounded-full ${
                index === currentImageIndex
                  ? "w-5 h-1 bg-primary-black"
                  : "w-1 h-1 bg-[rgba(19,19,20,0.16)]"
              }`}
            />
          ))}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onRemove?.(id)}
          className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center z-10"
          aria-label="Remove from favorites"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 17.5C9.77778 17.5 9.58333 17.4167 9.41667 17.25C7.19444 15.3056 5.45833 13.6458 4.20833 12.2708C2.95833 10.8958 2.33333 9.625 2.33333 8.45833C2.33333 7.51389 2.64583 6.72222 3.27083 6.08333C3.89583 5.44444 4.66667 5.125 5.58333 5.125C6.18056 5.125 6.74306 5.26389 7.27083 5.54167C7.79861 5.81944 8.25 6.20833 8.625 6.70833H11.375C11.75 6.20833 12.2014 5.81944 12.7292 5.54167C13.2569 5.26389 13.8194 5.125 14.4167 5.125C15.3333 5.125 16.1042 5.44444 16.7292 6.08333C17.3542 6.72222 17.6667 7.51389 17.6667 8.45833C17.6667 9.625 17.0417 10.8958 15.7917 12.2708C14.5417 13.6458 12.8056 15.3056 10.5833 17.25C10.4167 17.4167 10.2222 17.5 10 17.5Z"
              fill="#131314"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5">
        {/* Title */}
        <Link href={productHref}>
          <h3 className="text-primary-black text-base font-medium leading-[1.3] line-clamp-3 min-h-[63px]">
            {title}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="flex flex-col">
          {/* Price */}
          <div className="h-[30px] flex items-center py-2.5">
            <p className="text-primary-black text-[22px] font-semibold leading-[1.3]">
              {price.toLocaleString("ru-RU")} ₽
            </p>
          </div>

          {/* Stock Status and Cart Button */}
          <div className="flex items-center justify-between gap-9">
            {/* In Stock Badge */}
            {inStock && (
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-primary-orange rounded flex items-center justify-center">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.125 7.5625L2.0625 5.5L1.375 6.1875L4.125 8.9375L9.625 3.4375L8.9375 2.75L4.125 7.5625Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-primary-black text-sm leading-[1.3]">
                  В наличии
                </span>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart?.(id)}
              className="w-[34px] h-[34px] bg-primary-black rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors"
              aria-label="Add to cart"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.25 15.75C4.8375 15.75 4.48438 15.6031 4.19063 15.3094C3.89688 15.0156 3.75 14.6625 3.75 14.25C3.75 13.8375 3.89688 13.4844 4.19063 13.1906C4.48438 12.8969 4.8375 12.75 5.25 12.75C5.6625 12.75 6.01563 12.8969 6.30938 13.1906C6.60313 13.4844 6.75 13.8375 6.75 14.25C6.75 14.6625 6.60313 15.0156 6.30938 15.3094C6.01563 15.6031 5.6625 15.75 5.25 15.75ZM12.75 15.75C12.3375 15.75 11.9844 15.6031 11.6906 15.3094C11.3969 15.0156 11.25 14.6625 11.25 14.25C11.25 13.8375 11.3969 13.4844 11.6906 13.1906C11.9844 12.8969 12.3375 12.75 12.75 12.75C13.1625 12.75 13.5156 12.8969 13.8094 13.1906C14.1031 13.4844 14.25 13.8375 14.25 14.25C14.25 14.6625 14.1031 15.0156 13.8094 15.3094C13.5156 15.6031 13.1625 15.75 12.75 15.75ZM4.65 3.75L6.525 7.875H11.7L13.875 3.75H4.65ZM3.9 2.25H15.15C15.45 2.25 15.6781 2.38125 15.8344 2.64375C15.9906 2.90625 16.0125 3.175 15.9 3.45L13.35 8.4C13.2375 8.625 13.0781 8.8 12.8719 8.925C12.6656 9.05 12.4375 9.1125 12.1875 9.1125H6.225L5.25 10.875H14.25V12.375H5.25C4.7 12.375 4.26563 12.1531 3.95313 11.7094C3.64063 11.2656 3.6 10.7875 3.825 10.275L5.025 8.1L2.25 2.25H0.75V0.75H3.075L3.9 2.25Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
