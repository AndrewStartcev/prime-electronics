import { ProductColor } from "../model";
import { getColorSwatchStyle } from "../lib/variantOptions";

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  selectedColorName: string;
}

export const ColorSelector = ({
  colors,
  selectedColor,
  onColorSelect,
  selectedColorName,
}: ColorSelectorProps) => {
  // Don't render if no colors available
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px] md:gap-[16px] lg:gap-[19px]">
      <div className="flex items-center gap-[6px] md:gap-[7px] lg:gap-[8px]">
        <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.34)]">
          Выбрать цвет:
        </span>
        <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
          {selectedColorName}
        </span>
      </div>
      <div className="flex items-center gap-[10px] md:gap-[12px] lg:gap-[15px]">
        {colors.map((color) => {
          const swatchStyle = getColorSwatchStyle(color.name, color.image);

          return (
            <button
              key={color.id}
              type="button"
              title={color.name}
              aria-label={`Выбрать цвет ${color.name}`}
              onClick={() => onColorSelect(color.id)}
              className="relative flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full transition-colors md:h-[38px] md:w-[38px] lg:h-[44px] lg:w-[44px]"
            >
              <div
                className="h-[28px] w-[28px] rounded-full border border-[rgba(19,19,20,0.14)] bg-cover bg-center md:h-[34px] md:w-[34px] lg:h-[40px] lg:w-[40px]"
                style={{
                  ...swatchStyle,
                  borderColor: swatchStyle.borderColor,
                }}
              />
              {selectedColor === color.id && (
                <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#ef6f2e]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
