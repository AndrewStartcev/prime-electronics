"use client";

import { memo, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#131314] text-white hover:bg-[#2c2c2e]",
  secondary: "bg-[#f5f5f7] text-[#131314] hover:bg-[#e8e8ea]",
  outline: "border border-[#131314] text-[#131314] hover:bg-[#f5f5f7]",
};

export const SubmitButton = memo(
  ({
    children,
    variant = "outline",
    fullWidth = false,
    className,
    ...props
  }: SubmitButtonProps) => {
    return (
      <button
        className={cn(
          "px-[20px] py-[20px] rounded-[12px] font-normal text-[18px] leading-[1.1] transition-colors",
          variantStyles[variant],
          fullWidth ? "w-full" : "self-end",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SubmitButton.displayName = "SubmitButton";
