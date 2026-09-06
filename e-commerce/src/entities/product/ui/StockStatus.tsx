import { memo } from "react";

interface StockStatusProps {
  inStock: boolean;
}

export const StockStatus = memo(({ inStock }: StockStatusProps) => {
  if (!inStock) return null;

  return (
    <div className="flex items-center gap-[6px] md:gap-[6px] lg:gap-[4px] xl:gap-[6px] 2xl:gap-[8px]">
      <div className="w-[16px] h-[16px] md:w-[16px] md:h-[16px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] 2xl:w-[18px] 2xl:h-[18px] bg-[#ef6f2e] rounded-[3px] md:rounded-[4px] flex items-center justify-center shrink-0">
        <svg
          className="w-[9px] h-[9px] md:w-[10px] md:h-[10px] lg:w-[8px] lg:h-[8px] xl:w-[10px] xl:h-[10px] 2xl:w-[11px] 2xl:h-[11px]"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M5.25 9.625L2.625 7L1.75 7.875L5.25 11.375L12.25 4.375L11.375 3.5L5.25 9.625Z"
            fill="white"
          />
        </svg>
      </div>
      <p className="font-normal text-[12px] md:text-[12px] lg:text-[11px] xl:text-[12px] 2xl:text-[15px] 3xl:text-[16px] leading-none text-[#131314] whitespace-nowrap">
        В наличии
      </p>
    </div>
  );
});

StockStatus.displayName = "StockStatus";
