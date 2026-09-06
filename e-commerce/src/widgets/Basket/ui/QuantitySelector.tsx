interface QuantitySelectorProps {
  quantity: number;
  onChange: (delta: number) => void;
  size?: "sm" | "md" | "lg";
}

export const QuantitySelector = ({
  quantity,
  onChange,
  size = "md",
}: QuantitySelectorProps) => {
  const sizeClasses = {
    sm: "w-[32px] h-[32px] text-[14px] md:w-[36px] md:h-[36px] md:text-[15px] lg:w-[38px] lg:h-[38px] lg:text-[16px]",
    md: "w-[36px] h-[36px] text-[14px] md:w-[40px] md:h-[40px] md:text-[16px] lg:w-[44px] lg:h-[44px] lg:text-[17px]",
    lg: "w-[40px] h-[40px] text-[15px] md:w-[44px] md:h-[44px] md:text-[17px] lg:w-[48px] lg:h-[48px] lg:text-[18px]",
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => onChange(-1)}
        disabled={quantity <= 1}
        className={`${sizeClasses[size]} bg-[#f5f5f7] flex items-center justify-center rounded-l-[8px] md:rounded-l-[10px] hover:bg-[#e8e8ea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Уменьшить количество"
      >
        <span className="font-medium leading-[1.1] text-[#131314]">–</span>
      </button>
      <div
        className={`${sizeClasses[size]} bg-[#f5f5f7] flex items-center justify-center`}
      >
        <span className="font-medium leading-[1.1] text-[#131314] text-center">
          {quantity}
        </span>
      </div>
      <button
        onClick={() => onChange(1)}
        className={`${sizeClasses[size]} bg-[rgba(19,19,20,0.1)] flex items-center justify-center rounded-r-[8px] md:rounded-r-[10px] hover:bg-[rgba(19,19,20,0.16)] transition-colors`}
        aria-label="Увеличить количество"
      >
        <span className="font-medium leading-[1.1] text-[#131314]">+</span>
      </button>
    </div>
  );
};
