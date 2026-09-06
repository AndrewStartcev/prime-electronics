"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ProductDetail } from "../model";
import { useImageGallery } from "@/shared/hooks";

interface ProductGalleryProps {
  product: ProductDetail;
}

export const ProductGallery = memo(({ product }: ProductGalleryProps) => {
  const { images, title, discount } = product;
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { selectedIndex, selectImage } = useImageGallery({
    totalImages: images.length,
  });

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

  const showPreviousImage = () => {
    if (images.length <= 1) return;
    selectImage((selectedIndex - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    if (images.length <= 1) return;
    selectImage((selectedIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
        return;
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, selectedIndex, images.length]);

  const showNavigation = images.length > 4;
  const showImageNavigation = images.length > 1;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-[10px] md:gap-[14px] lg:gap-[16px] xl:gap-[20px]">
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

        <div className="relative flex-1 order-1 lg:order-2">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="relative product-watermark block w-full aspect-square md:w-[400px] md:h-[460px] lg:w-[380px] lg:h-[440px] xl:w-[500px] xl:h-[580px] 2xl:w-[648px] 2xl:h-[748px] rounded-[14px] md:rounded-[16px] lg:rounded-[16px] xl:rounded-[20px] bg-[#f5f5f7] overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef6f2e] focus-visible:ring-offset-2"
            aria-label={`Увеличить изображение товара ${title}`}
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
          </button>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-[12px] md:p-[24px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Просмотр изображения товара ${title}`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsLightboxOpen(false);
            }
          }}
        >
          <div className="relative flex h-full w-full max-w-[1500px] items-center justify-center">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#131314] shadow-lg transition-transform hover:scale-105 md:h-12 md:w-12"
              aria-label="Закрыть увеличенное изображение"
            >
              <X className="h-6 w-6" />
            </button>

            {showImageNavigation && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#131314] shadow-lg transition-transform hover:scale-105 md:h-14 md:w-14"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            )}

            <div className="relative h-[calc(100vh-96px)] w-[calc(100vw-32px)] max-w-[1300px] md:h-[calc(100vh-120px)] md:w-[calc(100vw-160px)]">
              <Image
                src={images[selectedIndex]}
                alt={`${title} - увеличенное изображение ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {showImageNavigation && (
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#131314] shadow-lg transition-transform hover:scale-105 md:h-14 md:w-14"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            )}

            {showImageNavigation && (
              <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

ProductGallery.displayName = "ProductGallery";
