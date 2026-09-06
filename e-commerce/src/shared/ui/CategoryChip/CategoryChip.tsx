import { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface CategoryChipProps extends HTMLAttributes<HTMLElement> {
  label: string;
  active?: boolean;
  variant?: "light" | "dark" | "glass";
  as?: "button" | "span";
}

export const CategoryChip = ({
  label,
  active = false,
  variant = "dark",
  as = "button",
  className,
  ...props
}: CategoryChipProps) => {
  const Tag = as;
  const isLight = variant === "light";
  const isGlass = variant === "glass";

  if (isGlass) {
    return (
      <Tag
        className={cn(
          "relative flex items-center justify-center px-[16px] py-[8px] md:px-5 md:py-[10px] lg:px-4 lg:py-[8px] xl:px-5 xl:py-[10px] 2xl:px-6 2xl:py-[12px] rounded-full font-light text-[13px] md:text-[15px] lg:text-[13px] xl:text-[14px] 2xl:text-[16px] leading-[1.1] transition-all whitespace-nowrap bg-white/5 text-[#131314]",
          className
        )}
        {...props}
      >
        <span
          className="absolute inset-0 rounded-full border border-[rgba(19,19,20,0.15)] pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
        />
        {label}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn(
        "flex items-center justify-center px-[16px] py-[8px] md:px-5 md:py-[10px] lg:px-4 lg:py-[8px] xl:px-5 xl:py-[10px] 2xl:px-6 2xl:py-[12px] rounded-full border font-light text-[13px] md:text-[15px] lg:text-[13px] xl:text-[14px] 2xl:text-[16px] leading-[1.1] transition-all whitespace-nowrap",
        isLight
          ? active
            ? "bg-[rgba(19,19,20,0.02)] border-[rgba(19,19,20,0.15)] text-[#131314]"
            : "bg-[rgba(19,19,20,0.02)] border-[rgba(19,19,20,0.15)] text-[#131314] hover:bg-[rgba(19,19,20,0.05)]"
          : active
          ? "bg-[rgba(255,255,255,0.05)] border-white text-white shadow-[0px_0px_36.48px_0px_inset_rgba(255,255,255,0.2)]"
          : "bg-[rgba(255,255,255,0.05)] border-white text-[rgba(255,255,255,0.4)] hover:text-white",
        className
      )}
      {...props}
    >
      {label}
    </Tag>
  );
};
