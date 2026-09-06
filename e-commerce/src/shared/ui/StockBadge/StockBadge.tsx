interface StockBadgeProps {
  inStock?: boolean;
}

export const StockBadge = ({ inStock = false }: StockBadgeProps) => {
  if (!inStock) return null;

  return (
    <div className="flex items-center gap-[8px] md:gap-[9px] lg:gap-[10px]">
      <div className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px] bg-[#ef6f2e] rounded-[4px] lg:rounded-[5px] flex items-center justify-center">
        <svg
          className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[14px] lg:h-[14px]"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M5.25 9.625L2.625 7L1.75 7.875L5.25 11.375L12.25 4.375L11.375 3.5L5.25 9.625Z"
            fill="white"
          />
        </svg>
      </div>
      <span className="font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] text-[#131314]">
        В наличии
      </span>
    </div>
  );
};
