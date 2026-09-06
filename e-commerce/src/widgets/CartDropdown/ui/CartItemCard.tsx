import Image from "next/image";
import { CartItem } from "../model";

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
}

export const CartItemCard = ({
  item,
  onRemove,
  onQuantityChange,
}: CartItemCardProps) => {
  return (
    <div className="flex items-center w-full gap-[12px] md:gap-[16px] lg:gap-[20px]">
      <div className="flex gap-[12px] md:gap-[16px] lg:gap-[20px] items-start flex-1">
        <div className="relative product-watermark rounded-[8px] md:rounded-[10px] shrink-0 w-[60px] h-[60px] md:w-[72px] md:h-[72px] lg:w-[84px] lg:h-[84px] bg-[#f5f5f7]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[14px] flex-1 min-w-0">
          <p className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314] line-clamp-2">
            {item.title}
          </p>
          {item.variantLabel && (
            <p className="font-normal text-[12px] md:text-[13px] lg:text-[14px] leading-[1.2] text-[rgba(19,19,20,0.55)]">
              {item.variantLabel}
            </p>
          )}
          <p className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
            {item.price.toLocaleString("ru-RU")} ₽
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[22px] items-end shrink-0">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] hover:opacity-70 transition-opacity"
          aria-label="Удалить"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#131314"
            strokeWidth="1.5"
          >
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, -1)}
            className="bg-[#f5f5f7] flex items-center justify-center w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[38px] lg:h-[38px] rounded-l-[6px] hover:bg-[#e8e8ea] transition-colors"
            aria-label="Уменьшить количество"
          >
            <span className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4] text-[#131314]">
              –
            </span>
          </button>
          <div className="bg-[#f5f5f7] flex items-center justify-center w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[38px] lg:h-[38px]">
            <span className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4] text-[#131314]">
              {item.quantity}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, 1)}
            className="bg-[#f5f5f7] flex items-center justify-center w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[38px] lg:h-[38px] rounded-r-[6px] hover:bg-[#e8e8ea] transition-colors"
            aria-label="Увеличить количество"
          >
            <span className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4] text-[#131314]">
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
