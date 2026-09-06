"use client";

import Image from "next/image";
import Link from "next/link";
import { BasketItem } from "../model";
import { QuantitySelector } from "./QuantitySelector";
import { formatRubPrice } from "@/shared/lib/pricing";
import { getProductUrl } from "@/shared/lib/productUrl";

interface BasketItemCardProps {
  item: BasketItem;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
  onFavorite: (id: string) => void;
}

export const BasketItemCard = ({
  item,
  isSelected,
  isFavorite,
  onSelect,
  onRemove,
  onQuantityChange,
  onFavorite,
}: BasketItemCardProps) => {
  const productHref = getProductUrl({
    id: item.productId,
    slug: item.productSlug,
  });

  const handleFavoriteClick = () => {
    console.log("Favorite clicked for item:", item.id, item);
    onFavorite(item.id);
  };

  const handleRemoveClick = () => {
    console.log("Remove clicked for item:", item.id);
    onRemove(item.id);
  };

  const handleQuantityChangeClick = (delta: number) => {
    console.log("Quantity change for item:", item.id, "delta:", delta);
    onQuantityChange(item.id, delta);
  };

  return (
    <div className="border border-[rgba(19,19,20,0.16)] rounded-[12px] md:rounded-[14px] lg:rounded-[16px] p-[10px] md:p-[12px] lg:p-[16px] flex flex-col lg:flex-row lg:items-center gap-[10px] md:gap-[12px] lg:gap-[16px]">
      {/* Checkbox + Image + Info (Mobile: vertical stack, Desktop: horizontal) */}
      <div className="flex gap-[8px] md:gap-[10px] lg:gap-[14px] flex-1 items-start">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className="shrink-0 mt-[2px] lg:mt-[50px]"
          aria-label={isSelected ? "Убрать из выбранных" : "Выбрать товар"}
        >
          <div
            className={`w-[22px] h-[22px] md:w-[24px] md:h-[24px] lg:w-[26px] lg:h-[26px] rounded-[5px] md:rounded-[6px] border transition-colors flex items-center justify-center ${
              isSelected
                ? "bg-[#ef6f2e] border-[#ef6f2e]"
                : "bg-white border-[rgba(19,19,20,0.4)]"
            }`}
          >
            {isSelected && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] lg:w-[16px] lg:h-[16px]"
              >
                <path
                  d="M3 7L6 10L11 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>

        {/* Image */}
        <Link
          href={productHref}
          className="shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] bg-[#f5f5f7] rounded-[8px] md:rounded-[10px] lg:rounded-[12px] relative overflow-hidden product-watermark"
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain p-[8px] md:p-[10px] lg:p-[12px]"
          />
        </Link>

        {/* Info */}
        <div className="flex flex-col gap-[12px] md:gap-[16px] lg:gap-[20px] flex-1 min-w-0">
          <Link
            href={productHref}
            className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] text-[#131314] line-clamp-2 hover:text-[#ef6f2e] transition-colors"
          >
            {item.title}
          </Link>
          {item.variantLabel && (
            <p className="font-normal text-[12px] md:text-[13px] lg:text-[14px] leading-[1.3] text-[rgba(19,19,20,0.55)]">
              {item.variantLabel}
            </p>
          )}

          {/* Price */}
          <div className="flex flex-col gap-[6px] md:gap-[8px] lg:gap-[10px]">
            <div className="flex items-end gap-[8px] md:gap-[10px] flex-wrap">
              <p className="font-semibold text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                {formatRubPrice(item.price)} ₽
              </p>
            </div>
            {item.oldPrice && (
              <div className="flex items-center gap-[8px] md:gap-[10px]">
                <p className="font-medium text-[12px] md:text-[14px] lg:text-[16px] leading-[1.1] text-[rgba(19,19,20,0.4)] line-through">
                  {item.oldPrice.toLocaleString("ru-RU")} ₽
                </p>
                <div className="bg-[#ef6f2e] rounded-full px-[8px] py-[2px]">
                  <span className="text-white text-[12px] md:text-[13px] lg:text-[14px] font-medium">
                    -
                    {Math.round(
                      ((item.oldPrice - item.price) / item.oldPrice) * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between lg:flex-col lg:items-end lg:gap-[12px] lg:h-full lg:justify-between">
        <div className="flex items-center gap-[4px] md:gap-[6px] order-2 lg:order-1">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="p-[6px] hover:bg-[#f5f5f7] rounded-[6px] transition-colors"
            aria-label={
              isFavorite ? "Убрать из избранного" : "Добавить в избранное"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "#ef6f2e" : "none"}
              className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px]"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke={isFavorite ? "#ef6f2e" : "#131314"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleRemoveClick}
            className="p-[6px] hover:bg-[#f5f5f7] rounded-[6px] transition-colors"
            aria-label="Удалить"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px]"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                stroke="#131314"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Quantity */}
        <div className="order-1 lg:order-2">
          <QuantitySelector
            quantity={item.quantity}
            onChange={handleQuantityChangeClick}
          />
        </div>
      </div>
    </div>
  );
};
