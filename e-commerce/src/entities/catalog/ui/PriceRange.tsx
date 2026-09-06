"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";

interface PriceRangeProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onChange?: (min: number, max: number) => void;
}

export const PriceRange = memo(
  ({ min, max, currentMin, currentMax, onChange }: PriceRangeProps) => {
    const [minValue, setMinValue] = useState(currentMin ?? min);
    const [maxValue, setMaxValue] = useState(currentMax ?? max);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Update local state when props change
    useEffect(() => {
      if (currentMin !== undefined) setMinValue(currentMin);
      if (currentMax !== undefined) setMaxValue(currentMax);
    }, [currentMin, currentMax]);

    const formatPrice = (value: number) => {
      return value.toLocaleString("ru-RU");
    };

    // Debounced onChange
    const handleChange = useCallback(
      (newMin: number, newMax: number) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onChange?.(newMin, newMax);
        }, 300);
      },
      [onChange]
    );

    const handleMinChange = (value: number) => {
      const newMin = Math.min(value, maxValue - 1000);
      setMinValue(newMin);
      handleChange(newMin, maxValue);
    };

    const handleMaxChange = (value: number) => {
      const newMax = Math.max(value, minValue + 1000);
      setMaxValue(newMax);
      handleChange(minValue, newMax);
    };

    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;

    return (
      <div className="flex flex-col gap-[20px]">
        {/* Values display */}
        <div className="flex items-center justify-between">
          <span className="font-normal text-[18px] leading-[1.1] text-[#131314]">
            {formatPrice(minValue)} ₽
          </span>
          <span className="font-normal text-[18px] leading-[1.1] text-[#131314]">
            {formatPrice(maxValue)} ₽
          </span>
        </div>

        {/* Range slider */}
        <div className="relative h-[20px]">
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-[rgba(19,19,20,0.1)] rounded-full" />

          {/* Active track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-[#ef6f2e] rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min thumb (visual) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white border-2 border-[#ef6f2e] rounded-full pointer-events-none z-[3]"
            style={{ left: `calc(${minPercent}% - 10px)` }}
          />

          {/* Max thumb (visual) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white border-2 border-[#ef6f2e] rounded-full pointer-events-none z-[3]"
            style={{ left: `calc(${maxPercent}% - 10px)` }}
          />

          {/* Min range input — pointer-events only on left half */}
          <input
            type="range"
            min={min}
            max={max}
            value={minValue}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-[4]"
            style={{ pointerEvents: "auto", clipPath: `inset(0 ${100 - (minPercent + maxPercent) / 2}% 0 0)` }}
          />

          {/* Max range input — pointer-events only on right half */}
          <input
            type="range"
            min={min}
            max={max}
            value={maxValue}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-[5]"
            style={{ pointerEvents: "auto", clipPath: `inset(0 0 0 ${(minPercent + maxPercent) / 2}%)` }}
          />
        </div>
      </div>
    );
  }
);

PriceRange.displayName = "PriceRange";
