"use client";

import { memo, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageTitleProps {
  children: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export const PageTitle = memo(
  ({ children, rightElement, className }: PageTitleProps) => {
    if (rightElement) {
      return (
        <div className="flex items-center justify-between mb-[30px]">
          <h2
            className={cn(
              "font-medium text-[26px] leading-[1.3] text-[#131314]",
              className
            )}
          >
            {children}
          </h2>
          {rightElement}
        </div>
      );
    }

    return (
      <h2
        className={cn(
          "font-medium text-[26px] leading-[1.3] text-[#131314] mb-[24px]",
          className
        )}
      >
        {children}
      </h2>
    );
  }
);

PageTitle.displayName = "PageTitle";
