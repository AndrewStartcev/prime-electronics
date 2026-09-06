"use client";

import { useState, useEffect, useRef } from "react";
import { useModalStore } from "@/shared/stores/useModalStore";

interface PriceRangeSheetProps {
  onChange?: (min: number, max: number) => void;
}

export const PriceRangeSheet = ({ onChange }: PriceRangeSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { openPriceRange, closePriceRange, isPriceRangeOpen } = useModalStore();

  const MIN_PRICE = 0;
  const MAX_PRICE = 219000;

  const [minValue, setMinValue] = useState(MIN_PRICE);
  const [maxValue, setMaxValue] = useState(MAX_PRICE);
  const [minPercent, setMinPercent] = useState(0);
  const [maxPercent, setMaxPercent] = useState(100);

  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  // Sync with global modal state
  useEffect(() => {
    if (isPriceRangeOpen && !isOpen && !isClosing) {
      const timer = window.setTimeout(() => setIsOpen(true), 0);

      return () => window.clearTimeout(timer);
    }
  }, [isPriceRangeOpen, isOpen, isClosing]);

  const handleClose = () => {
    setIsClosing(true);
    closePriceRange();
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleApply = () => {
    onChange?.(minValue, maxValue);
    handleClose();
  };

  const handleReset = () => {
    setMinValue(0);
    setMaxValue(219000);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          openPriceRange();
        }}
        className="shrink-0 flex h-[40px] items-center gap-[10px] border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] px-[14px] hover:bg-[rgba(19,19,20,0.02)] transition-colors md:h-[44px] md:px-[24px]"
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
                Стоимость
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

            {/* Range Slider */}
            <div className="px-[16px] py-[24px]">
              <div className="relative pb-[50px]">
                {/* Background Track */}
                <div className="bg-[#f5f5f7] h-[44px] rounded-[10px] flex items-center px-[14px] mb-[30px]">
                  {/* Min Value */}
                  <span className="font-medium text-[14px] leading-[1.3] text-[#131314]">
                    {minValue.toLocaleString()}
                  </span>

                  {/* Max Value - Right aligned */}
                  <span className="ml-auto font-medium text-[14px] leading-[1.3] text-[#131314] text-right">
                    {maxValue.toLocaleString()}
                  </span>
                </div>

                {/* Range Slider Container */}
                <div className="relative h-[20px]">
                  {/* Track Background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-[1px] bg-[rgba(19,19,20,0.16)]" />

                  {/* Active Track */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-[1px] bg-[rgba(19,19,20,0.4)]"
                    style={{
                      left: `${minPercent}%`,
                      right: `${100 - maxPercent}%`,
                    }}
                  />

                  {/* Min Slider */}
                  <input
                    ref={minRef}
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={minValue}
                    onChange={(e) => {
                      const value = Math.min(
                        Number(e.target.value),
                        maxValue - 1000
                      );
                      setMinValue(value);
                      setMinPercent((value / MAX_PRICE) * 100);
                    }}
                    className="absolute w-full h-[20px] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[0.5px] [&::-webkit-slider-thumb]:border-[rgba(19,19,20,0.4)] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_#ef6f2e_inset] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[0.5px] [&::-moz-range-thumb]:border-[rgba(19,19,20,0.4)] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_0_4px_#ef6f2e_inset]"
                    style={{ zIndex: minValue > MAX_PRICE - 1000 ? 5 : 3 }}
                  />

                  {/* Max Slider */}
                  <input
                    ref={maxRef}
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={maxValue}
                    onChange={(e) => {
                      const value = Math.max(
                        Number(e.target.value),
                        minValue + 1000
                      );
                      setMaxValue(value);
                      setMaxPercent((value / MAX_PRICE) * 100);
                    }}
                    className="absolute w-full h-[20px] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[0.5px] [&::-webkit-slider-thumb]:border-[rgba(19,19,20,0.4)] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_#ef6f2e_inset] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[0.5px] [&::-moz-range-thumb]:border-[rgba(19,19,20,0.4)] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_0_4px_#ef6f2e_inset]"
                    style={{ zIndex: 4 }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[11px] px-[16px] py-[17px] border-t border-[rgba(19,19,20,0.1)]">
              <button
                onClick={handleReset}
                className="flex-1 bg-[#f5f5f7] text-[#131314] font-normal text-[16px] leading-[1.1] py-[14px] rounded-[12px] hover:bg-[#e5e5e7] transition-all active:scale-[0.98]"
              >
                Сбросить
              </button>
              <button
                onClick={handleApply}
                className="flex-1 bg-[#131314] text-white font-normal text-[16px] leading-[1.1] py-[14px] rounded-[12px] hover:bg-[#2c2c2e] transition-all active:scale-[0.98]"
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
