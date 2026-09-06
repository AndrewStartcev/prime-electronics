"use client";

import { UserIcon } from "@/shared/ui/Icons";
import Image from "next/image";
import Link from "next/link";

interface MobileMenuHeaderProps {
  onClose: () => void;
}

export const MobileMenuHeader = ({ onClose }: MobileMenuHeaderProps) => {
  return (
    <div className="flex items-center justify-end py-[25px]">
      <div className="flex items-center gap-[20px]">
        <button className="w-5 h-5">
          <UserIcon />
        </button>
        <Link href="/search" onClick={onClose} className="w-5 h-5 relative">
          <Image
            src="/icons/search-black.svg"
            alt="Search"
            fill
            className="object-contain"
          />
        </Link>
        <Link
          href="/basket"
          onClick={onClose}
          className="w-5 h-5 relative block"
        >
          <Image
            src="/icons/cart-black.svg"
            alt="Cart"
            fill
            className="object-contain"
          />
        </Link>
        <button onClick={onClose} className="w-5 h-5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#131314"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
