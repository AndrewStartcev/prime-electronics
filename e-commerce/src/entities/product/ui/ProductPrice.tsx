import { formatRubPrice } from "@/shared/lib/pricing";

interface ProductPriceProps {
  price: number;
  oldPrice?: number;
}

export const ProductPrice = ({
  price,
  oldPrice,
}: ProductPriceProps) => {
  return (
    <div className="flex flex-col gap-[10px] md:gap-[12px] lg:gap-[14px]">
      <div className="flex flex-wrap items-end gap-[12px] md:gap-[16px] lg:gap-[14px] xl:gap-[20px] 2xl:gap-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="font-medium text-[12px] md:text-[14px] lg:text-[13px] xl:text-[16px] 2xl:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.55)]">
            Цена
          </span>
          <span className="font-medium text-[28px] md:text-[34px] lg:text-[32px] xl:text-[38px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
            {formatRubPrice(price)} ₽
          </span>
        </div>
        {oldPrice && (
          <span className="font-medium text-[16px] md:text-[20px] lg:text-[18px] xl:text-[22px] 2xl:text-[26px] leading-[1.3] text-[rgba(19,19,20,0.34)] line-through">
            {formatRubPrice(oldPrice)} ₽
          </span>
        )}
      </div>
    </div>
  );
};
