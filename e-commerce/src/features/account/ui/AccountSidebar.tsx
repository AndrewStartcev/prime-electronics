"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountTab } from "../model/types";

interface AccountSidebarProps {
  tabs: AccountTab[];
  onLogout?: () => void;
}

export const AccountSidebar = memo(
  ({ tabs, onLogout }: AccountSidebarProps) => {
    const pathname = usePathname();

    const handleLogout = useCallback(() => {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("Вы уверены, что хотите выйти?");
        if (!confirmed) return;
      }

      if (onLogout) {
        onLogout();
      }
    }, [onLogout]);

    return (
      <nav className="flex flex-row lg:flex-col w-full lg:w-[220px] xl:w-[280px] 2xl:w-[325px] shrink-0 overflow-x-auto lg:overflow-x-visible gap-[4px] md:gap-[6px] lg:gap-0 pb-[8px] lg:pb-0 -mx-[16px] px-[16px] md:-mx-[24px] md:px-[24px] lg:mx-0 lg:px-0">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href);

          if (tab.id === "logout") {
            return (
              <button
                key={tab.id}
                onClick={handleLogout}
                className="flex items-center whitespace-nowrap h-[44px] md:h-[48px] lg:h-[60px] xl:h-[68px] px-[16px] md:px-[18px] lg:px-[24px] rounded-[10px] text-left transition-colors hover:bg-[#f5f5f7] shrink-0"
              >
                <span className="font-medium text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] leading-[1.1] text-[#131314]">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center whitespace-nowrap h-[44px] md:h-[48px] lg:h-[60px] xl:h-[68px] px-[16px] md:px-[18px] lg:px-[24px] rounded-[10px] transition-colors shrink-0 ${
                isActive ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
              }`}
            >
              <span className="font-medium text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] leading-[1.1] text-[#131314]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }
);

AccountSidebar.displayName = "AccountSidebar";
