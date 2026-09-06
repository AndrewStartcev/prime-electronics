"use client";

import { memo, useCallback } from "react";

interface AuthCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}

export const AuthCheckbox = memo(
  ({ checked, onChange, children }: AuthCheckboxProps) => {
    const handleChange = useCallback(() => {
      onChange(!checked);
    }, [checked, onChange]);

    return (
      <button
        type="button"
        onClick={handleChange}
        className="flex items-start gap-[10px] md:gap-[14px] w-full text-left"
      >
        <div className="relative w-[20px] h-[20px] md:w-[24px] md:h-[24px] shrink-0 mt-[2px]">
          <div
            className={`absolute inset-0 rounded-[4px] md:rounded-[5px] border-[0.5px] transition-colors ${
              checked
                ? "border-[#ef6f2e] bg-white"
                : "border-[rgba(19,19,20,0.4)] bg-white"
            }`}
          />
          {checked && (
            <>
              <div className="absolute inset-[2px] md:inset-[2.4px] rounded-[2.5px] md:rounded-[3px] bg-[#ef6f2e]" />
              <svg
                className="absolute inset-[3px] md:inset-[4px] text-white"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </div>
        <span className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[#131314]">
          {children}
        </span>
      </button>
    );
  }
);

AuthCheckbox.displayName = "AuthCheckbox";
