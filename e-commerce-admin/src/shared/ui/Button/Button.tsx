import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-orange  text-white border border-primary-orange hover:bg-[#d66129]",
  secondary:
    "bg-primary-black text-white border border-primary-black hover:bg-[#2c2c2e]",
  outline:
    "bg-transparent text-primary-black border border-primary-black hover:bg-secondary-gray",
  ghost: "bg-transparent text-primary-black hover:bg-secondary-gray",
  danger: "bg-red-500 text-white border border-red-500 hover:bg-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[14px]",
  md: "px-6 py-3 text-[16px]",
  lg: "px-8 py-4 text-[18px]",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        "flex items-center justify-center rounded-xl font-medium leading-[1.1] transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Загрузка...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
