"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { CatalogNav } from "./CatalogNav";
import { UserActions } from "./UserActions";
import { MenuIcon } from "@/shared/ui/Icons";
import { MobileMenu } from "./MobileMenu";

interface HeaderProps {
  variant?: "dark" | "light";
}

export const Header = ({ variant }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Auto-detect dark mode for /catalog and /categories routes
  const isDark = variant
    ? variant === "dark"
    : pathname?.startsWith("/catalog") ||
      pathname?.startsWith("/categories") ||
      pathname?.startsWith("/blog") ||
      pathname?.startsWith("/about") ||
      pathname?.startsWith("/search") ||
      pathname?.startsWith("/basket") ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register") ||
      pathname?.startsWith("/product") ||
      pathname?.startsWith("/account") ||
      pathname?.startsWith("/promotions") ||
      pathname?.startsWith("/trade-in") ||
      pathname?.startsWith("/delivery") ||
      pathname?.startsWith("/warranty") ||
      pathname?.startsWith("/contacts");

  return (
    <header className="w-full relative z-[200]">
      <div className="hidden md:block">
        <TopBar />
      </div>
      <div
        className={`w-full relative ${
          isDark ? "bg-white" : "bg-black border-b border-[rgba(19,19,20,0.1)]"
        }`}
      >
        <div className="max-w-[1920px] mx-auto hidden md:flex items-start px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[10px] md:py-[12px] lg:py-[14px] xl:py-[16px] 2xl:py-[20px]">
          <div className="w-full grid grid-cols-[1fr_auto_1fr] items-start gap-[12px] lg:gap-[16px] xl:gap-[20px]">
            <div className="flex justify-start min-w-0">
              <Logo variant={isDark ? "dark" : "light"} />
            </div>
            <div className="flex flex-col items-center min-w-0 justify-self-center">
              <SearchBar isDark={isDark} />
              <div className="mt-[10px] lg:mt-[12px] xl:mt-[14px] w-full">
                <CatalogNav isDark={isDark} />
              </div>
            </div>
            <div className="flex justify-end min-w-0">
              <UserActions variant="desktop" isDark={isDark} />
            </div>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto h-[70px] flex md:hidden items-center justify-between px-[16px]">
          <Logo variant={isDark ? "dark" : "light"} />
          <UserActions
            variant="mobile"
            isDark={isDark}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
