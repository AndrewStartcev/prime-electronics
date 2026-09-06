"use client";

import { memo, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = memo(
  ({ label, className, id, ...props }: CheckboxProps) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-[12px]">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "w-[20px] h-[20px] rounded-[4px] border border-[rgba(19,19,20,0.16)] text-[#ef6f2e] focus:ring-[#ef6f2e] focus:ring-offset-0 cursor-pointer",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="font-normal text-[16px] leading-[1.1] text-[#131314] cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
