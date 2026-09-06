"use client";

import { useState, useEffect, ReactNode } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const InfoModal = ({
  isOpen,
  onClose,
  title,
  children,
}: InfoModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-[16px] md:rounded-[20px] p-[20px] md:p-[28px] lg:p-[32px] w-full max-w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
          aria-label="Закрыть"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#131314"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2 className="font-semibold text-[20px] md:text-[24px] text-[#131314] mb-[16px] pr-[40px]">
          {title}
        </h2>

        {children}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-[20px] bg-[#131314] text-white py-[14px] md:py-[16px] rounded-[12px] font-medium text-[16px] md:text-[18px] hover:bg-[#2c2c2e] transition-colors"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};

interface InfoButtonWithModalProps {
  title: string;
  children: ReactNode;
  className?: string;
  iconSize?: number;
}

export const InfoButtonWithModal = ({
  title,
  children,
  className = "",
  iconSize,
}: InfoButtonWithModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeStyle = iconSize
    ? { width: iconSize, height: iconSize }
    : undefined;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`group relative hover:opacity-70 transition-opacity ${className}`}
        aria-label={`Информация: ${title}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`text-[rgba(19,19,20,0.4)] group-hover:text-[#ef6f2e] transition-colors ${
            iconSize
              ? ""
              : "w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
          }`}
          style={sizeStyle}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 9V14M10 6.5V7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <InfoModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        {children}
      </InfoModal>
    </>
  );
};
