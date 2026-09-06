"use client";

import { memo, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type CardVariant = "shadow" | "border";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  shadow:
    "bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)]",
  border: "border border-[rgba(19,19,20,0.16)] rounded-[20px]",
};

const paddingStyles = {
  sm: "p-[20px]",
  md: "p-[24px]",
  lg: "p-[40px]",
};

export const Card = memo(
  ({ children, variant = "border", className, padding = "md" }: CardProps) => {
    return (
      <div
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
