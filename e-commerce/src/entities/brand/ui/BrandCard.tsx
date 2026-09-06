import Image from "next/image";
import Link from "next/link";
import { CategoryChip } from "@/shared/ui";
import { Brand } from "../model";

type BrandCardProps = Brand;

export const BrandCard = ({
  brand,
  title,
  categories,
  imageUrl,
  accentColor = "#ef6f2e",
  link = `/catalog/${brand}`,
}: BrandCardProps) => {
  return (
    <Link
      href={link}
      className="group relative flex-shrink-0 w-[310px] h-[420px] md:w-[450px] md:h-[550px] lg:w-[620px] lg:h-[680px] xl:w-[788px] xl:h-[788px] rounded-[20px] md:rounded-[25px] lg:rounded-[30px] p-[24px] md:p-[28px] lg:p-[38px] xl:p-[50px] bg-white shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] transition-all duration-300"
    >
      {/* Title */}
      <h2 className="font-medium text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314] mb-[15px] md:mb-[18px] lg:mb-[16px] xl:mb-[24px] 2xl:mb-[30px]">
        {title}
      </h2>

      {/* Category Chips */}
      <div className="flex flex-col gap-[8px] md:gap-[8px] lg:gap-[10px]">
        <div className="flex items-center gap-[8px] md:gap-[8px] lg:gap-[10px] flex-wrap">
          {categories.slice(0, 4).map((cat) => (
            <CategoryChip key={cat} label={cat} variant="glass" as="span" />
          ))}
          {categories.length > 4 && (
            <CategoryChip label="Показать все" variant="glass" as="span" />
          )}
        </div>
      </div>

      {/* Product Image */}
      {imageUrl && (
        <div className="absolute bottom-[24px] right-[24px] w-[200px] h-[180px] md:bottom-[28px] md:right-[28px] md:w-[320px] md:h-[290px] lg:bottom-[38px] lg:right-[38px] lg:w-[430px] lg:h-[400px] xl:bottom-[50px] xl:right-[50px] xl:w-[550px] xl:h-[500px]">
          <Image src={imageUrl} alt={title} fill className="object-contain" />
        </div>
      )}

      {/* Plus Button */}
      <div
        className="absolute bottom-[24px] right-[24px] md:bottom-[28px] md:right-[28px] lg:bottom-[34px] lg:right-[34px] xl:bottom-[40px] xl:right-[40px] w-[34px] h-[34px] md:w-[38px] md:h-[38px] lg:w-[40px] lg:h-[40px] rounded-full flex items-center justify-center transition-all duration-300 hover:opacity-80 group-hover:w-[40px] group-hover:h-[40px] lg:group-hover:w-[44px] lg:group-hover:h-[44px] xl:group-hover:w-[50px] xl:group-hover:h-[50px]"
        style={{ backgroundColor: accentColor }}
        role="img"
        aria-label="View catalog"
      >
        <Image
          src="/icons/plus_icon.svg"
          alt=""
          width={16}
          height={16}
          className="md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
        />
      </div>
    </Link>
  );
};
