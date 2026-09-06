import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = ({
  children,
  padding = "md",
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-card",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("pb-4 border-b border-gray-100", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn("text-lg font-semibold text-primary-black", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
};
