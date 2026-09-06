"use client";

import { memo } from "react";
import { ChevronIcon } from "@/shared/ui";
import { useAccordion } from "@/shared/hooks";

interface FilterAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FilterAccordion = memo(
  ({ title, children, defaultOpen = false }: FilterAccordionProps) => {
    const { isOpen, toggle } = useAccordion(defaultOpen);

    return (
      <div className="border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] md:rounded-[14px] mb-[8px] md:mb-[10px]">
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center justify-between gap-[12px] p-[16px] md:p-[24px] text-left hover:bg-[rgba(19,19,20,0.02)] transition-colors rounded-[10px] md:rounded-[14px]"
        >
          <span className="block min-w-0 flex-1 font-medium text-[14px] md:text-[18px] leading-[1.1] text-left text-[#131314]">
            {title}
          </span>
          <ChevronIcon
            direction={isOpen ? "up" : "down"}
            color="#131314"
            className="shrink-0 transition-transform w-[16px] h-[16px] md:w-[20px] md:h-[20px]"
          />
        </button>
        {isOpen && (
          <div className="px-[16px] pb-[16px] md:px-[24px] md:pb-[24px] flex flex-col gap-[16px] md:gap-[20px]">
            {children}
          </div>
        )}
      </div>
    );
  }
);

FilterAccordion.displayName = "FilterAccordion";
