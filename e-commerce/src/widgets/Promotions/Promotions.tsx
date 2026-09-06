"use client";

import {
  PromotionCard,
  promotionsData,
  type Promotion,
} from "@/entities/promotion";
import { useSlider } from "@/shared/hooks/useSlider";

interface PromotionsSectionProps {
  title?: string;
  promotions?: Promotion[];
}

export const PromotionsSection = ({
  title = "Акции",
  promotions = promotionsData,
}: PromotionsSectionProps) => {
  const { sliderRef, handlers, isDragging } =
    useSlider({
      sensitivity: 1.5,
      momentumMultiplier: 15,
      friction: 0.95,
      infinite: true,
    });

  // Triple the items for infinite loop: [copy] [original] [copy]
  const items = [...promotions, ...promotions, ...promotions];

  return (
    <section className="w-full py-[40px] md:py-[50px] lg:py-[55px] xl:py-[60px] overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        <div className="flex items-center gap-[10px] md:gap-[16px] lg:gap-[20px] mb-[30px] md:mb-[35px] lg:mb-[32px] xl:mb-[40px] 2xl:mb-[60px]">
          <h2 className="font-medium text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
            {title}
          </h2>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto">
        <div
          ref={sliderRef}
          {...handlers}
          className={`flex gap-[10px] md:gap-[15px] lg:gap-[18px] xl:gap-[20px] overflow-x-auto scrollbar-hide select-none pl-[16px] md:pl-[24px] lg:pl-[40px] xl:pl-[60px] 2xl:pl-[120px] pr-[16px] md:pr-[24px] lg:pr-[40px] xl:pr-[60px] 2xl:pr-[120px] ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((promotion, index) => (
            <div
              key={`${promotion.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[340px] lg:w-[340px] xl:w-[400px] 2xl:w-[540px]"
            >
              <PromotionCard {...promotion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
