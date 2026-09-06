"use client";

import Image from "next/image";
import Link from "next/link";
import { HomeIcon } from "@/shared/ui/Icons";

interface QuickLink {
  href: string;
  label: string;
  icon: "home" | "bookmark" | "cart";
}

interface MobileMenuQuickLinksProps {
  links: readonly QuickLink[];
  onClose: () => void;
}

export const MobileMenuQuickLinks = ({
  links,
  onClose,
}: MobileMenuQuickLinksProps) => {
  const getIcon = (iconName: "home" | "bookmark" | "cart") => {
    switch (iconName) {
      case "home":
        return <HomeIcon />;
      case "bookmark":
        return (
          <div className="relative w-[20px] h-[20px]">
            <Image
              src="/icons/bookmark-dark.svg"
              alt="Favorites"
              fill
              className="object-contain"
            />
          </div>
        );
      case "cart":
        return (
          <div className="relative w-[20px] h-[20px]">
            <Image
              src="/icons/cart-black.svg"
              alt="Cart"
              fill
              className="object-contain"
            />
          </div>
        );
    }
  };

  return (
    <nav className="flex flex-col gap-[20px] mt-[36px]">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-[14px]"
          onClick={onClose}
        >
          {getIcon(link.icon)}
          <span className="text-[16px] font-medium leading-[1.3] text-[#131314]">
            {link.label}
          </span>
        </Link>
      ))}
    </nav>
  );
};
