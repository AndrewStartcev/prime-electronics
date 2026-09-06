"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronIcon } from "@/shared/ui/Icons";

interface FooterAccordionProps {
  title: string;
  links: Array<{ label: string; href: string }>;
  defaultOpen?: boolean;
}

export const FooterAccordion = ({
  title,
  links,
  defaultOpen = false,
}: FooterAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col border-b border-[#2F2F30] lg:border-0 pb-[14px]">
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
        className="flex items-center justify-between lg:mb-[24px] lg:cursor-default cursor-pointer"
      >
        <h3 className="font-normal text-[16px] md:text-[18px] leading-[1.3] text-white">
          {title}
        </h3>
        <ChevronIcon
          direction={isOpen ? "up" : "down"}
          className={`lg:hidden w-[16px] h-[16px] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          color="white"
        />
      </div>
      <nav
        className={`flex flex-col gap-0 font-light text-[14px] md:text-[18px] leading-[2.2] text-[rgba(255,255,255,0.6)] overflow-hidden transition-all duration-300 ${
          isOpen
            ? "max-h-[500px] opacity-100 mt-[14px]"
            : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100 lg:mt-0"
        }`}
      >
        {links.map((link, index) => (
          <Link
            key={link.href || index}
            href={link.href}
            className="hover:text-white transition-colors py-[4px]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
