import Link from "next/link";
import Image from "next/image";
import { Category } from "../model";

interface CategoryCardProps extends Category {
  variant?: "white" | "gray";
  mobileImageSize?: "default" | "large";
  presentation?: "default" | "carousel";
}

// sm: 2 chips, md: 3, lg: 3, xl: 4
const SM_LIMIT = 2;
const MD_LIMIT = 3;
const LG_LIMIT = 3;
const XL_LIMIT = 4;

const getChipVisibility = (index: number) => {
  if (index < SM_LIMIT) return "";
  if (index < MD_LIMIT) return "hidden md:flex";
  if (index < LG_LIMIT) return "hidden lg:flex";
  if (index < XL_LIMIT) return "hidden xl:flex";
  return "hidden";
};

const getMoreChipContent = (total: number) => {
  const smMore = total - SM_LIMIT;
  const mdMore = total - MD_LIMIT;
  const lgMore = total - LG_LIMIT;
  const xlMore = total - XL_LIMIT;

  return { smMore, mdMore, lgMore, xlMore };
};

export const CategoryCard = ({
  name,
  slug,
  subcategories,
  subcategoryLinks,
  description,
  imageUrl,
  variant = "white",
  mobileImageSize = "default",
  presentation = "default",
}: CategoryCardProps) => {
  const bgClass =
    variant === "white"
      ? "bg-white shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)]"
      : "bg-[#f5f5f7]";
  const chipClass =
    "bg-[rgba(19,19,20,0.02)] border border-[#131314] px-[12px] py-[8px] md:px-[24px] md:py-[14px] lg:px-[16px] lg:py-[8px] xl:px-[20px] xl:py-[10px] 2xl:px-[24px] 2xl:py-[14px] rounded-[60px] font-light text-[11px] md:text-[14px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px] leading-[1.1]";
  const cardHref = `/catalog/${slug}`;
  const sizeClass =
    presentation === "carousel"
      ? "aspect-[4/3] md:aspect-auto md:h-[340px] lg:h-[350px] xl:h-[370px] 2xl:h-[380px]"
      : "aspect-[4/3] md:aspect-auto md:h-[352px] lg:h-[320px] xl:h-[380px] 2xl:h-[500px]";
  const paddingClass =
    presentation === "carousel"
      ? "p-[18px] md:p-[28px] lg:p-[32px] xl:p-[38px] 2xl:p-[42px]"
      : "p-[18px] md:p-[30px] lg:p-[28px] xl:p-[36px] 2xl:p-[50px]";
  const imageWrapperClass =
    presentation === "carousel"
      ? "absolute right-[-10px] bottom-[-6px] w-[68%] h-[82%] md:right-[-18px] md:bottom-[-14px] md:w-[62%] md:h-[84%]"
      : mobileImageSize === "large"
        ? "absolute right-[-10px] bottom-[-6px] w-[68%] h-[82%] md:right-0 md:bottom-0 md:w-[50%] md:h-[80%]"
        : "absolute right-0 bottom-0 w-[45%] md:w-[50%] h-[70%] md:h-[80%]";
  const imageSizes =
    presentation === "carousel"
      ? "(max-width: 768px) 70vw, 38vw"
      : mobileImageSize === "large"
        ? "(max-width: 768px) 70vw, 25vw"
        : "(max-width: 768px) 45vw, 25vw";

  return (
    <article
      className={`relative rounded-[20px] md:rounded-[30px] lg:rounded-[24px] xl:rounded-[28px] 2xl:rounded-[30px] ${paddingClass} ${sizeClass} flex flex-col overflow-hidden ${bgClass}`}
    >
      <Link
        href={cardHref}
        prefetch={false}
        className="absolute inset-0 z-0"
        aria-label={`Перейти в категорию ${name}`}
      />

      {/* Category Image */}
      {imageUrl && (
        <div className={`${imageWrapperClass} pointer-events-none`}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain object-right-bottom"
            sizes={imageSizes}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-medium text-[20px] md:text-[26px] lg:text-[24px] xl:text-[28px] 2xl:text-[36px] leading-[1.3] text-[#131314] mb-[10px] md:mb-[20px] lg:mb-[16px] xl:mb-[20px] 2xl:mb-[24px] relative z-10">
        <Link
          href={cardHref}
          prefetch={false}
          className="relative z-20 transition-colors hover:text-[#ef6f2e]"
        >
          {name}
        </Link>
      </h3>

      {/* Subcategory chips - responsive count per breakpoint */}
      <div className="flex flex-wrap gap-[6px] md:gap-[10px] mb-auto relative z-10 max-w-[55%] md:max-w-[60%]">
        {subcategories.slice(0, XL_LIMIT).map((sub, index) => {
          const href = subcategoryLinks?.[sub];
          const visibilityClass = getChipVisibility(index);

          if (href) {
            return (
              <Link
                key={sub}
                href={href}
                prefetch={false}
                className={`${chipClass} text-[#131314] relative z-20 hover:bg-[rgba(19,19,20,0.06)] transition-colors ${visibilityClass}`}
              >
                {sub}
              </Link>
            );
          }

          return (
            <span
              key={sub}
              className={`${chipClass} text-[#131314] ${visibilityClass}`}
            >
              {sub}
            </span>
          );
        })}
        {(() => {
          const { smMore, mdMore, lgMore, xlMore } = getMoreChipContent(
            subcategories.length,
          );
          const chipClass =
            "bg-[rgba(19,19,20,0.02)] border border-[#131314] px-[12px] py-[8px] md:px-[24px] md:py-[14px] lg:px-[16px] lg:py-[8px] xl:px-[20px] xl:py-[10px] 2xl:px-[24px] 2xl:py-[14px] rounded-[60px] font-light text-[11px] md:text-[14px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px] leading-[1.1] text-[#8a8a8e]";
          return (
            <>
              {smMore > 0 && (
                <Link
                  href={cardHref}
                  prefetch={false}
                  className={`${chipClass} flex md:hidden relative z-20 hover:bg-[rgba(19,19,20,0.06)] transition-colors`}
                >
                  +{smMore} ещё
                </Link>
              )}
              {mdMore > 0 && (
                <Link
                  href={cardHref}
                  prefetch={false}
                  className={`${chipClass} hidden md:flex lg:hidden relative z-20 hover:bg-[rgba(19,19,20,0.06)] transition-colors`}
                >
                  +{mdMore} ещё
                </Link>
              )}
              {lgMore > 0 && (
                <Link
                  href={cardHref}
                  prefetch={false}
                  className={`${chipClass} hidden lg:flex xl:hidden relative z-20 hover:bg-[rgba(19,19,20,0.06)] transition-colors`}
                >
                  +{lgMore} ещё
                </Link>
              )}
              {xlMore > 0 && (
                <Link
                  href={cardHref}
                  prefetch={false}
                  className={`${chipClass} hidden xl:flex relative z-20 hover:bg-[rgba(19,19,20,0.06)] transition-colors`}
                >
                  +{xlMore} ещё
                </Link>
              )}
            </>
          );
        })()}
      </div>

      {/* Bottom section */}
      <div className="flex items-end justify-between mt-auto relative z-10">
        {/* Description - Hidden on mobile */}
        <Link
          href={cardHref}
          prefetch={false}
          className="relative z-20 hidden max-w-[180px] font-normal text-[14px] leading-[1.3] text-[#131314] transition-colors hover:text-[#ef6f2e] md:block md:max-w-[221px] md:text-[16px] lg:text-[14px] xl:text-[15px] 2xl:text-[18px]"
        >
          {description}
        </Link>

        {/* Arrow button */}
        <Link
          href={cardHref}
          prefetch={false}
          className="relative z-20 w-[34px] h-[34px] md:w-[40px] md:h-[40px] rounded-full bg-[#131314] flex items-center justify-center hover:bg-[#ef6f2e] transition-colors ml-auto md:ml-0"
          aria-label={`Открыть категорию ${name}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="text-white transform -rotate-45 md:w-[16px] md:h-[16px]"
          >
            <path
              d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33334M12.6667 8L8.00001 12.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};
