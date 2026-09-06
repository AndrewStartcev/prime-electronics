"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface ImageSliderProps {
  images: string[];
  alt: string;
  priority?: boolean;
}

export const ImageSlider = memo(
  ({ images, alt, priority = false }: ImageSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setActiveIndex(0);
  }, []);

  return (
    <div
      className="relative product-watermark w-full aspect-square bg-white rounded-[14px] md:rounded-[16px] lg:rounded-[16px] xl:rounded-[18px] 2xl:rounded-[20px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image */}
      <Image
        src={images[activeIndex]}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-contain p-3 md:p-3 lg:p-3 xl:p-4 2xl:p-4 transition-opacity duration-200"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />

      {/* Hover Zones - only show on hover if multiple images - desktop only */}
      {images.length > 1 && isHovered && (
        <div className="hidden md:flex absolute inset-0">
          {images.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-full cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Pagination Dots - always show on mobile, hover on desktop */}
      {images.length > 1 && (
        <div
          className={cn(
            "absolute bottom-[10px] md:bottom-[14px] lg:bottom-[14px] xl:bottom-[16px] 2xl:bottom-[20px] left-1/2 -translate-x-1/2 flex gap-[3px] md:gap-[4px] items-center transition-opacity duration-200",
            "md:opacity-0 md:group-hover:opacity-100",
            isHovered ? "md:opacity-100" : "",
          )}
        >
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all duration-200",
                index === activeIndex
                  ? "w-[22px] md:w-[24px] lg:w-[24px] xl:w-[26px] 2xl:w-[30px] h-[5px] md:h-[5px] lg:h-[5px] xl:h-[5px] 2xl:h-[6px] bg-[#131314]"
                  : "w-[5px] md:w-[5px] lg:w-[5px] xl:w-[5px] 2xl:w-[6px] h-[5px] md:h-[5px] lg:h-[5px] xl:h-[5px] 2xl:h-[6px] bg-[rgba(19,19,20,0.16)]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
  },
);

ImageSlider.displayName = "ImageSlider";
