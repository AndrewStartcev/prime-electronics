"use client";

import { memo } from "react";
import { User } from "../model/types";

interface BonusBalanceProps {
  balance: number;
}

export const BonusBalance = memo(({ balance }: BonusBalanceProps) => (
  <div className="flex flex-col gap-[10px] md:gap-[14px] items-start md:items-end w-full md:w-auto">
    <p className="font-normal text-[14px] md:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
      Баланс бонусов
    </p>
    <div className="bg-[#ef6f2e] flex gap-[10px] items-center p-[10px] md:p-[12px] xl:p-[14px] rounded-[10px] w-fit">
      {/* Gift Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="text-white shrink-0"
      >
        <path
          d="M17.5 6.66667H2.5V17.5H17.5V6.66667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.66667V17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 6.66667H2.5L3.33333 2.5H16.6667L17.5 6.66667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66667 2.5C6.66667 2.5 10 2.5 10 6.66667C10 2.5 13.3333 2.5 13.3333 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-medium text-[14px] md:text-[16px] xl:text-[18px] leading-[1.1] text-white whitespace-nowrap">
        {balance} бонусов
      </span>
    </div>
  </div>
));

BonusBalance.displayName = "BonusBalance";

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader = memo(({ user }: ProfileHeaderProps) => (
  <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[16px] md:p-[20px] xl:p-[24px] flex flex-col md:flex-row md:justify-between md:items-start gap-[16px] md:gap-[20px]">
    {/* Left - User Info */}
    <div className="flex flex-col gap-[16px] md:gap-[20px] xl:gap-[24px]">
      <div className="flex flex-col gap-[8px] md:gap-[10px] xl:gap-[14px]">
        <p className="font-normal text-[14px] md:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
          Личные данные
        </p>
        <h2 className="font-medium text-[20px] md:text-[22px] xl:text-[26px] leading-[1.3] text-[#131314]">
          {user.name}
        </h2>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-[8px] md:gap-[10px]">
        {user.email && (
          <span className="bg-[#f5f5f7] px-[10px] py-[6px] md:py-[8px] rounded-[8px] font-normal text-[13px] md:text-[15px] xl:text-[18px] leading-[1.3] text-[#131314]">
            {user.email}
          </span>
        )}
        {user.phone && (
          <span className="bg-[#f5f5f7] px-[10px] py-[6px] md:py-[8px] rounded-[8px] font-normal text-[13px] md:text-[15px] xl:text-[18px] leading-[1.3] text-[#131314]">
            {user.phone}
          </span>
        )}
      </div>
    </div>

    {/* Right - Bonus & Tier */}
    <div className="flex flex-col gap-[12px] md:gap-[16px] xl:gap-[24px] md:items-end">
      <BonusBalance balance={user.bonusBalance} />
      {user.tierName && (
        <div className="flex items-center gap-[8px]">
          <span className="bg-[#f5f5f7] px-[12px] py-[6px] rounded-[8px] font-medium text-[12px] md:text-[13px] xl:text-[14px] leading-[1.3] text-[#131314]">
            {user.tierName}
          </span>
          <span className="font-normal text-[12px] md:text-[13px] xl:text-[14px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
            Кешбэк {((user.cashbackRate ?? 0.01) * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  </div>
));

ProfileHeader.displayName = "ProfileHeader";
