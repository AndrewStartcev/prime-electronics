"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ProductDetail } from "../model";
import { useImageGallery } from "@/shared/hooks";

interface ProductGalleryProps {
  product: ProductDetail;
}

export const ProductGallery = memo(({ product }: ProductGalleryProps) => {
  const { images, title, discount } = product;
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const {
    selectedIndex,
    isZoomed,
    zoomPosition,
    selectImage,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useImageGallery({ totalImages: images.length });

  const scrollThumbnails = (direction: -1 | 1) => {
    const strip = thumbnailStripRef.current;
    if (!strip) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    strip.scrollBy({
      top: isDesktop ? direction * Math.max(120, strip.clientHeight * 0.72) : 0,
      left: isDesktop ? 0 : direction * Math.max(90, strip.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  const showNavigation = images.length > 4;

  return (
    <div className="flex flex-col lg:flex-row gap-[10px] md:gap-[14px] lg:gap-[16px] xl:gap-[20px]">
      {/* Thumbnails: horizontal carousel on mobile, bounded vertical carousel on desktop */}
      <div className="order-2 lg:order-1 flex min-w-0 items-center gap-2 lg:flex-col lg:items-stretch">
        {showNavigation && (
          <button
            type="button"
            onClick={() => scrollThumbnails(-1)}
            className="hidden lg:flex h-8 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#131314] transition-colors hover:bg-[#ebebed]"
            aria-label="Предыдущие изображения"
            title="Предыдущие изображения"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}

        {showNavigation && (
          <button
            type="button"
            onClick={() => scrollThumbnails(-1)}
            className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#131314] transition-colors hover:bg-[#ebebed]"
            aria-label="Предыдущие изображения"
            title="Предыдущие изображения"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={thumbnailStripRef}
          className="flex min-w-0 flex-1 gap-[8px] overflow-x-auto scroll-smooth scrollbar-hide pb-2 md:gap-[10px] lg:max-h-[380px] lg:flex-none lg:flex-col lg:gap-[10px] lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 xl:max-h-[520px] xl:gap-[12px] 2xl:max-h-[688px]"
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectImage(index)}
              className={cn(
                "relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] 2xl:w-[122px] 2xl:h-[122px] rounded-[10px] md:rounded-[12px] lg:rounded-[12px] xl:rounded-[14px] overflow-hidden bg-[#f5f5f7] transition-all shrink-0",
                selectedIndex === index
                  ? "border-2 border-[#ef6f2e]"
                  : "border border-transparent hover:border-[rgba(19,19,20,0.16)]",
              )}
              aria-label={`Показать изображение ${index + 1} из ${images.length}`}
              aria-current={selectedIndex === index ? "true" : undefined}
            >
              <Image
                src={image}
                alt={`${title} - ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 60px, (max-width: 1024px) 80px, (max-width: 1280px) 80px, (max-width: 1536px) 100px, 122px"
              />
            </button>
          ))}
        </div>

        {showNavigation && (
          <button
            type="button"
            onClick={() => scrollThumbnails(1)}
            className="hidden lg:flex h-8 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#131314] transition-colors hover:bg-[#ebebed]"
            aria-label="Следующие изображения"
            title="Следующие изображения"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        )}

        {showNavigation && (
          <button
            type="button"
            onClick={() => scrollThumbnails(1)}
            className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#131314] transition-colors hover:bg-[#ebebed]"
            aria-label="Следующие изображения"
            title="Следующие изображения"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Image with Zoom */}
      <div className="relative flex-1 order-1 lg:order-2">
        <div
          className="relative product-watermark w-full aspect-square md:w-[400px] md:h-[460px] lg:w-[380px] lg:h-[440px] xl:w-[500px] xl:h-[580px] 2xl:w-[648px] 2xl:h-[748px] rounded-[14px] md:rounded-[16px] lg:rounded-[16px] xl:rounded-[20px] bg-[#f5f5f7] overflow-hidden lg:cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={images[selectedIndex]}
            alt={title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 400px, (max-width: 1280px) 380px, (max-width: 1536px) 500px, 648px"
            priority
          />

          {discount && (
            <div className="absolute top-[12px] right-[12px] md:top-[16px] md:right-[16px] lg:top-[16px] lg:right-[16px] xl:top-[20px] xl:right-[20px] 2xl:top-[24px] 2xl:right-[24px] bg-[#131314] rounded-[40px] px-[10px] py-[6px] md:px-[12px] md:py-[8px] lg:px-[10px] lg:py-[6px] xl:px-[14px] xl:py-[10px]">
              <span className="font-normal text-[12px] md:text-[14px] lg:text-[12px] xl:text-[14px] 2xl:text-[16px] leading-[1.4] text-white">
                Скидка –{discount}%
              </span>
            </div>
          )}
        </div>

        {isZoomed && (
          <div
            className="hidden xl:block absolute top-0 left-[calc(100%+20px)] w-[280px] h-[280px] 2xl:w-[320px] 2xl:h-[320px] rounded-[14px] border-2 border-[#f5f5f7] bg-[#f5f5f7] overflow-hidden z-10 pointer-events-none"
            style={{
              backgroundImage: `url(${images[selectedIndex]})`,
              backgroundSize: "300%",
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
});

ProductGallery.displayName = "ProductGallery";
