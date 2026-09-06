"use client";

import { useEffect, useState } from "react";
import { MobileMenuHeader } from "./ui/MobileMenuHeader";
import { MobileMenuActions } from "./ui/MobileMenuActions";
import { MobileMenuQuickLinks } from "./ui/MobileMenuQuickLinks";
import { MobileMenuLinks } from "./ui/MobileMenuLinks";
import { MobileMenuContacts } from "./ui/MobileMenuContacts";
import { quickLinks, additionalLinks } from "./model/menuLinks";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      // Small delay to trigger animation after mounting
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Always restore scroll immediately as a safety measure
      document.body.style.overflow = "";
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => {
        clearTimeout(timer);
        // Ensure overflow is restored even if effect is cleaned up
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 left-0 w-full h-full bg-white z-[70] md:hidden overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAnimating ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col min-h-full px-4 pb-6">
          <MobileMenuHeader onClose={onClose} />
          <MobileMenuActions onClose={onClose} />
          <MobileMenuQuickLinks links={quickLinks} onClose={onClose} />
          <div className="h-[0.5px] bg-[#D9D9D9] my-[20px]" />
          <MobileMenuLinks links={additionalLinks} onClose={onClose} />
          <div className="h-[0.5px] bg-[#D9D9D9] my-[20px]" />
          <MobileMenuContacts />
        </div>
      </div>
    </>
  );
};
