import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatRubPrice } from "@/shared/lib/pricing";
import type { ProductModificationOption } from "../model";

interface ModificationSelectorProps {
  options: ProductModificationOption[];
  onSelect: (optionId: string) => void;
}

export const ModificationSelector = ({
  options,
  onSelect,
}: ModificationSelectorProps) => {
  if (!options || options.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px] md:gap-[18px] lg:gap-[24px]">
      <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
        Модификация
      </span>
      <div className="flex flex-wrap items-center gap-[6px] md:gap-[8px]">
        {options.map((option) => {
          const content = (
            <>
              <span className="whitespace-nowrap">{option.label}</span>
              <span
                className={cn(
                  "inline-flex h-[16px] w-[16px] items-center justify-center rounded-full",
                  option.isCurrent
                    ? "bg-white/80 text-[#ef6f2e]"
                    : "bg-[#fff4ee] text-[#ef6f2e]",
                )}
              >
                <Info className="h-[11px] w-[11px]" strokeWidth={2.4} />
              </span>
            </>
          );

          const className = cn(
            "inline-flex min-h-[34px] items-center gap-[6px] rounded-[8px] border px-[10px] py-[8px] text-[13px] md:text-[14px] leading-[1.1] transition-colors",
            option.isCurrent
              ? "border-[#ef6f2e] bg-[#ef6f2e] font-medium text-white"
              : "border-[#ef6f2e] bg-white font-medium text-[#ef6f2e] hover:bg-[#fff4ee]",
          );

          if (option.isCurrent) {
            return (
              <span
                key={option.id}
                className={className}
                title={`${option.label} — ${formatRubPrice(option.price)} ₽`}
                aria-current="true"
              >
                {content}
              </span>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={className}
              title={`${option.label} — ${formatRubPrice(option.price)} ₽`}
              aria-pressed={false}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
