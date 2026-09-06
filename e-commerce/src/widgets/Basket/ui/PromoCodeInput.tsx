"use client";

import { useState } from "react";

interface PromoCodeInputProps {
  onApply: (code: string) => void | Promise<void>;
  error?: string;
  success?: string;
  appliedCode?: string;
  isLoading?: boolean;
}

export const PromoCodeInput = ({
  onApply,
  error,
  success,
  appliedCode,
  isLoading = false,
}: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const trimmedCode = code.trim();
  const isAppliedCodeVisible =
    Boolean(success && appliedCode) &&
    trimmedCode.toLowerCase() === appliedCode?.trim().toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedCode && !isLoading) {
      void onApply(trimmedCode);
    }
  };

  return (
    <div className="flex flex-col gap-[8px] md:gap-[10px] w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Введите промокод"
          className={`w-full border rounded-[10px] md:rounded-[12px] px-[16px] md:px-[20px] py-[14px] md:py-[16px] lg:py-[18px] text-[14px] md:text-[16px] leading-[1.1] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] outline-none transition-colors pr-[44px] md:pr-[48px] ${
            isAppliedCodeVisible
              ? "border-[#22c55e] bg-[#f0fdf4] focus:border-[#16a34a]"
              : "border-[rgba(19,19,20,0.16)] focus:border-[#131314]"
          }`}
        />
        <button
          type="submit"
          disabled={!trimmedCode || isLoading}
          className="absolute right-[16px] md:right-[20px] top-1/2 -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Применить промокод"
        >
          {isLoading ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="animate-spin text-[#ef6f2e]"
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="2"
              />
              <path
                d="M17 10A7 7 0 0 0 10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
      {isAppliedCodeVisible && (
        <div className="flex items-start gap-[8px] rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-[12px] py-[10px] text-[#15803d]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="mt-[1px] shrink-0"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="8" fill="#22c55e" />
            <path
              d="M5.25 9.2L7.65 11.55L12.75 6.45"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col gap-[2px]">
            <p className="font-medium text-[14px] md:text-[15px] leading-[1.15]">
              {success}
            </p>
            <p className="font-normal text-[12px] md:text-[13px] leading-[1.15] text-[#15803d]/70">
              {appliedCode?.toUpperCase()}
            </p>
          </div>
        </div>
      )}
      {error && (
        <p className="font-light text-[14px] md:text-[16px] leading-[1.1] text-[#ef4444]">
          {error}
        </p>
      )}
    </div>
  );
};
