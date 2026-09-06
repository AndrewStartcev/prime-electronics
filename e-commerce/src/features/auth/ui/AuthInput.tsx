"use client";

import { memo, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { formatPhone } from "@/shared/lib/formatPhone";
import { usePasswordToggle } from "@/shared/hooks";

interface AuthInputProps {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "password";
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const AuthInput = memo(
  ({
    label,
    placeholder,
    type = "text",
    required = false,
    hint,
    value,
    onChange,
    error,
  }: AuthInputProps) => {
    const { showPassword, togglePassword, inputType } = usePasswordToggle();
    const isPassword = type === "password";
    const isPhone = type === "tel";

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (isPhone) {
          onChange(formatPhone(newValue));
        } else {
          onChange(newValue);
        }
      },
      [onChange, isPhone],
    );

    return (
      <div className="flex flex-col gap-[10px] w-full">
        <div className="flex flex-col gap-[12px] w-full">
          <label className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[#131314]">
            {label}
            {required && <span className="text-[#ef6f2e]">*</span>}
          </label>
          <div
            className={cn(
              "flex items-center justify-between px-[16px] md:px-[24px] py-[16px] md:py-[20px] rounded-[10px] border transition-colors",
              error
                ? "border-red-500"
                : "border-[rgba(19,19,20,0.16)] focus-within:border-[#131314]",
            )}
          >
            <input
              type={isPassword ? inputType : type}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              className="flex-1 font-normal text-[16px] md:text-[18px] leading-[1.1] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] outline-none bg-transparent"
            />
            {isPassword && (
              <button
                type="button"
                onClick={togglePassword}
                className="ml-[10px] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {showPassword ? (
                    <path
                      d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      fill="currentColor"
                    />
                  ) : (
                    <path
                      d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM2.5 2.5l15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
        {hint && !error && (
          <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)]">
            {hint}
          </p>
        )}
        {error && (
          <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
