import Link from "next/link";
import { Promotion } from "../model";
import { PromotionBadge } from "./PromotionBadge";
import Image from "next/image";

const variantStyles = {
  dark: "bg-black",
  charcoal: "bg-[#131314]",
  accent: "bg-gradient-to-b from-[#ef6f2e] to-[#ef6f2e]",
  orange: "bg-[#ef6f2e]",
};

type PromotionCardProps = Promotion;

const PlusCircle = ({
  variant,
  isFullCard = false,
}: {
  variant: Promotion["variant"];
  isFullCard?: boolean;
}) => {
  const backgroundClass = variant === "accent" && !isFullCard ? "bg-black" : "bg-[#ef6f2e]";
  const sizeClass = isFullCard
    ? "bottom-[24px] right-[24px] md:bottom-[32px] md:right-[32px] lg:bottom-[40px] lg:right-[40px] w-[44px] h-[44px] md:w-[56px] md:h-[56px] lg:w-[60px] lg:h-[60px]"
    : "bottom-[20px] right-[20px] md:bottom-[30px] md:right-[30px] lg:bottom-[40px] lg:right-[40px] w-[30px] h-[30px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px]";

  return (
    <div
      aria-hidden="true"
      className={`absolute ${sizeClass} z-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${backgroundClass}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px] text-white"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const PromotionCard = ({
  type,
  title,
  subtitle,
  imageUrl,
  imageMode = "decorative",
  badgeLabel,
  headline,
  link,
  variant = "dark",
}: PromotionCardProps) => {
  const isFullCardImage = imageMode === "full-card" && imageUrl;
  const cardHeightClass = "h-[352px] md:h-[550px] lg:h-[788px]";
  const backgroundClass = isFullCardImage ? "bg-black" : variantStyles[variant];

  return (
    <Link
      href={link}
      aria-label={title}
      className={`relative block rounded-[20px] overflow-hidden ${cardHeightClass} ${backgroundClass} group`}
    >
      {isFullCardImage ? (
        <>
          <div className="absolute inset-x-[24px] top-[24px] z-10 flex flex-col items-start md:inset-x-[40px] md:top-[40px] lg:inset-x-[48px] lg:top-[52px]">
            <span className="inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full border border-white/80 bg-[#ef6f2e] px-[22px] py-[10px] text-[18px] font-normal leading-[1.15] text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] md:px-[30px] md:py-[13px] md:text-[24px] lg:px-[32px] lg:py-[14px] lg:text-[26px]">
              {badgeLabel ?? "Акция"}
            </span>
            <h3 className="mt-[24px] max-w-[92%] text-[23px] font-medium leading-[1.18] text-white md:mt-[32px] md:max-w-[88%] md:text-[30px] lg:mt-[38px] lg:text-[36px]">
              {headline ?? title}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[200px] md:h-[350px] lg:h-[500px]">
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain object-bottom"
            />
          </div>
          <PlusCircle variant={variant} isFullCard />
        </>
      ) : (
        <>
          <div className="absolute top-[20px] left-[20px] right-[20px] md:top-[40px] md:left-[40px] md:right-[40px] lg:top-[60px] lg:left-[60px] lg:right-[60px] flex flex-col gap-[14px] md:gap-[20px] lg:gap-[30px] z-10">
            <PromotionBadge type={type} />
            <h3 className="font-medium text-[18px] md:text-[26px] lg:text-[36px] leading-[1.3] text-white max-w-[240px] md:max-w-[380px] lg:max-w-[508px]">
              {title}
            </h3>
          </div>
          {imageUrl && (
            <div className="absolute bottom-0 left-0 right-0 h-[200px] md:h-[350px] lg:h-[500px]">
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain object-bottom"
              />
            </div>
          )}

          <PlusCircle variant={variant} />
        </>
      )}

      {subtitle && <span className="sr-only">{subtitle}</span>}
    </Link>
  );
};
