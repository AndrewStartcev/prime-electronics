import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type ButtonVariant = "default" | "hover" | "accent" | "disabled";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: " text-white border border-white hover:bg-[#2c2c2e]",
  hover: "bg-[#2c2c2e] text-white border border-white",
  accent: "bg-[#ef6f2e] text-white border border-[#ef6f2e] hover:bg-[#d66129]",
  disabled: "bg-gray-400 text-gray-200 cursor-not-allowed",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-6 py-3 text-[16px]",
  md: "px-8 py-4 text-[18px]",
  lg: "px-[34px] py-[34px] text-[18px]",
};

export const Button = ({
  children,
  variant = "default",
  size = "md",
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const currentVariant = disabled ? "disabled" : variant;

  return (
    <button
      className={cn(
        "flex items-center justify-center rounded-[60px] font-normal leading-[1.1] transition-colors",
        variantClasses[currentVariant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
