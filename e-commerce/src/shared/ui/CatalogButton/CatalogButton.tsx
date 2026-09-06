"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface CatalogButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isDark?: boolean;
  href?: string;
}

export const CatalogButton = ({
  children,
  onClick,
  isDark = false,
  href,
}: CatalogButtonProps) => {
  const className = `relative flex items-center justify-center gap-[12px] lg:gap-[16px] xl:gap-[20px] px-[18px] py-[14px] lg:px-[24px] lg:py-[18px] xl:px-[30px] xl:py-[22px] rounded-[60px] ${
    isDark
      ? "bg-black hover:bg-[rgba(0,0,0,0.85)]"
      : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)]"
  } transition-all duration-300 min-w-[120px] lg:min-w-[140px] xl:min-w-[163px] h-[48px] lg:h-[56px] xl:h-[68px]`;

  const content = (
    <>
      {/* SVG Border - visible on left/right, fades on top/bottom */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 163 68"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Vertical gradient - fades at top and bottom */}
          <linearGradient
            id="catalogVertGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="68"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="25%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Full rounded rect with vertical gradient stroke */}
        <rect
          x="1"
          y="1"
          width="161"
          height="66"
          rx="33"
          ry="33"
          fill="none"
          stroke="url(#catalogVertGrad)"
          strokeWidth="1"
        />
      </svg>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-[12px] lg:gap-[16px] xl:gap-[20px]">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};
