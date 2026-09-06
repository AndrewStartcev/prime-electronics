"use client";

import { memo } from "react";
import Link from "next/link";
import { AccountCardData } from "../model/types";
import { ArrowIcon } from "@/shared/ui";

interface AccountCardProps {
  data: AccountCardData;
}

const FavoritesIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const OrdersIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const HelpIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const iconMap = {
  favorites: FavoritesIcon,
  orders: OrdersIcon,
  help: HelpIcon,
};

export const AccountCard = memo(({ data }: AccountCardProps) => {
  const IconComponent = iconMap[data.icon];

  return (
    <Link
      href={data.href}
      className={`relative flex flex-col gap-[16px] md:gap-[20px] p-[16px] md:p-[20px] xl:p-[24px] rounded-[16px] md:rounded-[20px] w-full sm:flex-1 min-h-[160px] md:h-[200px] border transition-colors hover:border-[#ef6f2e] ${
        data.isActive ? "border-[#ef6f2e]" : "border-[rgba(19,19,20,0.16)]"
      }`}
    >
      {/* Icon */}
      <div className="text-[rgba(19,19,20,0.4)]">
        <IconComponent />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[4px] mt-auto">
        <h3 className="font-medium text-[18px] md:text-[20px] xl:text-[22px] leading-[1.3] text-[#131314]">
          {data.title}
        </h3>
        <p className="font-normal text-[14px] md:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
          {data.subtitle}
        </p>
      </div>

      {/* Arrow */}
      <div className="absolute bottom-[16px] right-[16px] md:bottom-[24px] md:right-[24px] text-[rgba(19,19,20,0.2)]">
        <ArrowIcon direction="down" />
      </div>
    </Link>
  );
});

AccountCard.displayName = "AccountCard";
