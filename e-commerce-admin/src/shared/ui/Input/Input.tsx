import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId =
      id ||
      (typeof label === "string"
        ? label.toLowerCase().replace(/\s+/g, "-")
        : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-primary-black"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white",
            "text-primary-black placeholder:text-text-secondary-black",
            "focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
        {helperText && !error && (
          <span className="text-sm text-text-secondary-black">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
