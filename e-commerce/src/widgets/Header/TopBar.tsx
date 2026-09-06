"use client";

import Link from "next/link";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from "@/shared/lib/contactInfo";

const topMenuItems = [
  { label: "О компании", href: "/about" },
  { label: "Акции", href: "/promotions" },
  { label: "Трейд-ин", href: "/trade-in" },
  { label: "Доставка и Оплата", href: "/delivery" },
  { label: "Гарантия", href: "/warranty" },
  { label: "Контакты", href: "/contacts" },
];

export const TopBar = () => {
  return (
    <div className="w-full bg-[#2c2c2e] h-[30px] md:h-[32px] lg:h-[36px] xl:h-[36px] 2xl:h-[40px]">
      <div className="max-w-[1920px] mx-auto h-full flex items-center justify-between gap-[18px] px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        <a
          href={`tel:${CONTACT_PHONE_TEL}`}
          className="hidden lg:inline-flex font-medium text-[13px] xl:text-[14px] 2xl:text-[16px] leading-[1.1] text-white hover:text-[#ef6f2e] transition-colors whitespace-nowrap"
        >
          {CONTACT_PHONE_DISPLAY}
        </a>
        <nav className="flex items-center gap-[12px] md:gap-[14px] lg:gap-[18px] xl:gap-[20px] 2xl:gap-[30px]">
          {topMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-light text-[11px] md:text-[12px] lg:text-[13px] xl:text-[13px] 2xl:text-[16px] leading-[1.1] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
