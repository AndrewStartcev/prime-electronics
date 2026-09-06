"use client";

import { memo, useCallback } from "react";

interface FilterCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const FilterCheckbox = memo(
  ({ label, checked = false, onChange }: FilterCheckboxProps) => {
    const handleChange = useCallback(() => {
      onChange?.(!checked);
    }, [onChange, checked]);

    return (
      <button
        type="button"
        onClick={handleChange}
        aria-pressed={checked}
        className="flex w-full items-start gap-[12px] md:gap-[20px] text-left group"
      >
        <div className="relative mt-[1px] h-[24px] w-[24px] shrink-0 md:mt-0 md:h-[30px] md:w-[30px]">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-[6px] md:rounded-[8px] border transition-colors ${
              checked
                ? "border-[#ef6f2e] bg-[#ef6f2e]"
                : "border-[rgba(19,19,20,0.16)]"
            }`}
          />
          {/* Inner checkbox */}
          <div
            className={`absolute inset-[2px] md:inset-[3px] rounded-[4px] md:rounded-[5px] transition-colors ${
              checked ? "bg-[#ef6f2e]" : "bg-white"
            }`}
          />
          {/* Checkmark */}
          {checked && (
            <svg
              className="absolute inset-0 m-auto w-[12px] h-[12px] md:w-[14px] md:h-[14px] text-white"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="block min-w-0 flex-1 truncate font-normal text-[14px] md:text-[18px] leading-[1.3] text-left text-[#131314] transition-colors group-hover:text-[#ef6f2e]">
          {label}
        </span>
      </button>
    );
  }
);

FilterCheckbox.displayName = "FilterCheckbox";
