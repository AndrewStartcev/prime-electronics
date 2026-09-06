"use client";

import { useEffect, useState } from "react";
import { useModalStore } from "@/shared/stores/useModalStore";

interface SortOption {
  id: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { id: "new", label: "Сначала новые" },
  { id: "popular", label: "Популярные" },
  { id: "price-asc", label: "Сначала недорогие" },
  { id: "price-desc", label: "Сначала дорогие" },
];

interface CatalogSortProps {
  onChange?: (sortId: string) => void;
}

export const CatalogSort = ({ onChange }: CatalogSortProps) => {
  const [selected, setSelected] = useState<SortOption>(sortOptions[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { openSort, closeSort, isSortOpen } = useModalStore();

  // Sync with global modal state
  useEffect(() => {
    if (isSortOpen && !isOpen && !isClosing) {
      const timer = window.setTimeout(() => setIsOpen(true), 0);

      return () => window.clearTimeout(timer);
    }
  }, [isSortOpen, isOpen, isClosing]);

  const handleClose = () => {
    setIsClosing(true);
    closeSort();
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSelect = (option: SortOption) => {
    setSelected(option);
    handleClose();
    onChange?.(option.id);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          openSort();
        }}
        className="flex items-center gap-[10px] border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] px-[14px] py-[10px] md:px-[24px] md:py-[14px] hover:bg-[rgba(19,19,20,0.02)] transition-colors"
      >
        <span className="font-normal text-[16px] md:text-[18px] leading-[1.3] text-[#131314]">
          Цена
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className="md:w-[20px] md:h-[20px]"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="#131314"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          {/* Backdrop with fade animation */}
          <div
            className={`fixed inset-0 bg-black/50 z-[300] ${
              isClosing ? "animate-fadeOut" : "animate-fadeIn"
            }`}
            onClick={handleClose}
          />

          {/* Bottom Sheet with slide-up animation */}
          <div
            className={`fixed inset-x-0 bottom-0 bg-white z-[310] rounded-t-[20px] shadow-[0_-4px_24px_rgba(0,0,0,0.15)] ${
              isClosing ? "animate-slideOutBottom" : "animate-slideInBottom"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[16px] py-[22px] border-b border-[rgba(19,19,20,0.1)]">
              <h3 className="font-medium text-[20px] leading-[1.3] text-[#131314]">
                Показывать сначала
              </h3>
              <button
                onClick={handleClose}
                className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-60 transition-opacity"
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
            </div>

            {/* Options */}
            <div className="px-[16px] py-[18px] space-y-[14px]">
              {sortOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-[10px] cursor-pointer group"
                >
                  {/* Custom Radio Button */}
                  <div className="relative w-[24px] h-[24px] flex-shrink-0">
                    <div
                      className={`w-full h-full rounded-full border-[1.5px] transition-all ${
                        selected.id === option.id
                          ? "border-[#ef6f2e]"
                          : "border-[rgba(19,19,20,0.2)] group-hover:border-[rgba(19,19,20,0.4)]"
                      }`}
                    />
                    {selected.id === option.id && (
                      <div className="absolute inset-[4.8px] bg-[#ef6f2e] rounded-full animate-zoomIn" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="sort"
                    checked={selected.id === option.id}
                    onChange={() => handleSelect(option)}
                    className="sr-only"
                  />
                  <span className="font-normal text-[16px] leading-[1.3] text-[#131314] whitespace-nowrap">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Apply Button */}
            <div className="px-[16px] py-[17px] border-t border-[rgba(19,19,20,0.1)]">
              <button
                onClick={handleClose}
                className="w-full bg-[#ef6f2e] text-white font-medium text-[16px] leading-[1.1] py-[15px] rounded-[10px] hover:bg-[#d65e23] transition-all active:scale-[0.98]"
              >
                Применить
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
