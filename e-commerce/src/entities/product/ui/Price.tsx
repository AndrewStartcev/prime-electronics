import { memo } from "react";
import { formatRubPrice } from "@/shared/lib/pricing";

interface PriceProps {
  price: number;
  oldPrice?: number;
}

export const Price = memo(({ price, oldPrice }: PriceProps) => {
  return (
    <div className="flex flex-col gap-[3px] md:gap-[4px] lg:gap-[2px] xl:gap-[4px] 2xl:gap-[6px]">
      <div className="flex items-baseline gap-[6px] md:gap-[6px] lg:gap-[2px] xl:gap-[6px] 2xl:gap-[8px] flex-wrap">
        <span className="font-semibold text-[20px] md:text-[20px] lg:text-[14px] xl:text-[16px] 2xl:text-[22px] 3xl:text-[24px] leading-none text-[#131314] whitespace-nowrap">
          {formatRubPrice(price)}
        </span>
        <span className="font-semibold text-[16px] md:text-[16px] lg:text-[12px] xl:text-[14px] 2xl:text-[18px] 3xl:text-[24px] leading-none text-[#131314]">
          ₽
        </span>
        {oldPrice && (
          <span className="font-normal text-[11px] md:text-[12px] lg:text-[9px] xl:text-[11px] 2xl:text-[14px] 3xl:text-[17px] leading-none text-[rgba(19,19,20,0.4)] line-through whitespace-nowrap ml-[2px]">
            {formatRubPrice(oldPrice)} ₽
          </span>
        )}
      </div>
    </div>
  );
});

Price.displayName = "Price";
