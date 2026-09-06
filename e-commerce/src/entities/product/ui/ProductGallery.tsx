"use client";

import { memo } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { ProductDetail } from "../model";
import { useImageGallery } from "@/shared/hooks";

interface ProductGalleryProps {
  product: ProductDetail;
}

export const ProductGallery = memo(({ product }: ProductGalleryProps) => {
  const { images, title, discount } = product;
  const {
    selectedIndex,
    isZoomed,
    zoomPosition,
    selectImage,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useImageGallery({ totalImages: images.length });

  return (
    <div className="flex flex-col lg:flex-row gap-[10px] md:gap-[14px] lg:gap-[16px] xl:gap-[20px]">
      {/* Thumbnails - horizontal on mobile, vertical on desktop */}
      <div className="flex lg:flex-col gap-[8px] md:gap-[10px] lg:gap-[10px] xl:gap-[12px] order-2 lg:order-1 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => selectImage(index)}
            className={cn(
              "relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] 2xl:w-[122px] 2xl:h-[122px] rounded-[10px] md:rounded-[12px] lg:rounded-[12px] xl:rounded-[14px] overflow-hidden bg-[#f5f5f7] transition-all shrink-0",
              selectedIndex === index
                ? "border-2 border-[#ef6f2e]"
                : "border border-transparent hover:border-[rgba(19,19,20,0.16)]",
            )}
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

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-[12px] right-[12px] md:top-[16px] md:right-[16px] lg:top-[16px] lg:right-[16px] xl:top-[20px] xl:right-[20px] 2xl:top-[24px] 2xl:right-[24px] bg-[#131314] rounded-[40px] px-[10px] py-[6px] md:px-[12px] md:py-[8px] lg:px-[10px] lg:py-[6px] xl:px-[14px] xl:py-[10px]">
              <span className="font-normal text-[12px] md:text-[14px] lg:text-[12px] xl:text-[14px] 2xl:text-[16px] leading-[1.4] text-white">
                Скидка –{discount}%
              </span>
            </div>
          )}
        </div>

        {/* Zoom Preview - desktop only */}
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
