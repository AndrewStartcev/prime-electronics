"use client";

import { memo, useCallback, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";
import { formatPhone } from "@/shared/lib/formatPhone";
import { usePasswordToggle } from "@/shared/hooks";

// Eye icon for password visibility toggle
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    className="text-[rgba(19,19,20,0.4)]"
  >
    {visible ? (
      <>
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="1"
          y1="1"
          x2="23"
          y2="23"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

interface FormInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  variant?: "default" | "compact";
}

export const FormInput = memo(
  ({
    label,
    hint,
    error,
    required = false,
    type = "text",
    className,
    onChange,
    variant = "default",
    ...props
  }: FormInputProps) => {
    const { showPassword, togglePassword, inputType } = usePasswordToggle();
    const isPassword = type === "password";
    const isPhone = type === "tel";

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (isPhone) {
          onChange?.(formatPhone(newValue));
        } else {
          onChange?.(newValue);
        }
      },
      [onChange, isPhone],
    );

    const inputStyles =
      variant === "compact"
        ? "w-full min-w-0 border border-[rgba(19,19,20,0.16)] rounded-[10px] px-[24px] py-[20px] font-normal text-[18px] leading-[1.1] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] focus:border-[#ef6f2e] focus:outline-none transition-colors"
        : "w-full border border-[rgba(19,19,20,0.16)] rounded-[14px] px-[24px] py-[24px] pr-[50px] font-normal text-[18px] leading-[1.1] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] focus:border-[#ef6f2e] focus:outline-none transition-colors";

    const inputElement = (
      <div className="relative">
        <input
          type={isPassword ? inputType : type}
          className={cn(inputStyles, className)}
          onChange={handleChange}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-[24px] top-1/2 -translate-y-1/2"
          >
            <EyeIcon visible={showPassword} />
          </button>
        )}
      </div>
    );

    if (!label) {
      return inputElement;
    }

    return (
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-col gap-[12px]">
          <label className="font-normal text-[16px] leading-[1.4] text-[#131314]">
            {label}
            {required && <span className="text-[#ef6f2e]">*</span>}
          </label>
          {inputElement}
        </div>
        {hint && !error && (
          <p className="font-normal text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)]">
            {hint}
          </p>
        )}
        {error && (
          <p className="font-normal text-[16px] leading-[1.4] text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
