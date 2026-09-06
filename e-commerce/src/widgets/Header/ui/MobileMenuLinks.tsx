"use client";

import Link from "next/link";

interface AdditionalLink {
  href: string;
  label: string;
}

interface MobileMenuLinksProps {
  links: readonly AdditionalLink[];
  onClose: () => void;
}

export const MobileMenuLinks = ({ links, onClose }: MobileMenuLinksProps) => {
  return (
    <nav className="flex flex-col gap-[20px]">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-[16px] font-normal leading-[1.3] text-[#131314]"
          onClick={onClose}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
