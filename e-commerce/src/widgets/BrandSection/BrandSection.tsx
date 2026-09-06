"use client";

import Link from "next/link";
import { CategoryChip } from "@/shared/ui";
import Image from "next/image";

interface BrandSectionProps {
  brand: "apple" | "samsung" | "xiaomi";
  title: string;
  categories: string[];
  imageUrl?: string;
  className?: string;
}

const brandColors = {
  apple: "bg-white shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)]",
  samsung: "bg-[#f5f5f7]",
  xiaomi: "bg-[#f5f5f7]",
};

export const BrandSection = ({
  brand,
  title,
  categories,
  imageUrl,
  className,
}: BrandSectionProps) => {
  const appleCategories = [
    "Iphone",
    "Apple Watch",
    "Air Pods",
    "IMac",
    "IPad",
    "MacBook",
    "Mac mini",
  ];

  return (
    <div
      className={`relative container rounded-[20px] md:rounded-[30px] p-[30px] md:p-[50px] lg:p-[70px] xl:p-[100px] ${brandColors[brand]} ${className}`}
    >
      <h2 className="font-medium text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314] mb-[20px] md:mb-[25px] lg:mb-[20px] xl:mb-[24px] 2xl:mb-[30px]">
        {title}
      </h2>
      <div className="flex flex-col gap-[4px] md:gap-[10px]">
        <div className="flex items-center gap-[4px] md:gap-[10px] flex-wrap">
          {(categories || appleCategories).slice(0, 3).map((cat) => (
            <CategoryChip key={cat} label={cat} variant="light" />
          ))}
        </div>
        <div className="flex items-center gap-[4px] md:gap-[10px] flex-wrap">
          {(categories || appleCategories).slice(3, 7).map((cat) => (
            <CategoryChip key={cat} label={cat} variant="light" />
          ))}
        </div>
      </div>
      {imageUrl && (
        <div className="hidden md:block absolute bottom-[40px] md:bottom-[50px] lg:bottom-[60px] xl:bottom-[60px] right-[40px] md:right-[50px] lg:right-[60px] xl:right-[60px] w-[200px] md:w-[280px] lg:w-[340px] xl:w-[400px] h-[200px] md:h-[280px] lg:h-[340px] xl:h-[400px]">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={400}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <Link
        href={`/catalog/${brand}`}
        className="absolute bottom-[20px] md:bottom-[40px] left-[30px] md:left-[50px] lg:left-[70px] xl:left-[100px] w-[30px] h-[30px] md:w-[40px] md:h-[40px] lg:w-[50px] lg:h-[50px] bg-[#131314] rounded-full flex items-center justify-center hover:bg-[#2c2c2e] transition-colors"
        aria-label={`Go to ${title} catalog`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="w-[14px] h-[14px] md:w-[24px] md:h-[24px]"
        >
          <path
            d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
            fill="white"
          />
        </svg>
      </Link>
    </div>
  );
};
