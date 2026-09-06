import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/entities/blog";

interface BlogCardProps extends BlogPost {
  variant?: "large" | "small";
}

export const BlogCard = ({
  title,
  excerpt,
  imageUrl,
  link,
  variant = "small",
}: BlogCardProps) => {
  const isLarge = variant === "large";

  return (
    <Link href={link} className="block group">
      <article
        className={`flex flex-col transition-shadow p-[20px] duration-300 group-hover:shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] rounded-[12px] md:rounded-[16px] lg:rounded-[20px] ${
          isLarge
            ? "gap-[16px] md:gap-[20px] lg:gap-[24px] xl:gap-[30px] min-[1440px]:gap-[32px] w-full"
            : "gap-[14px] md:gap-[16px] lg:gap-[18px] xl:gap-[20px] min-[1440px]:gap-[22px] w-full"
        }`}
      >
        <div
          className={`rounded-[12px] md:rounded-[16px] lg:rounded-[20px] overflow-hidden relative transform transition-transform duration-300 group-hover:scale-[1.02] ${
            isLarge
              ? "h-[200px] md:h-[300px] lg:h-[400px]   2xl:h-[533px] min-[1440px]:h-[280px] min-[1680px]:h-[350px] min-[1280px]:h-[250px]"
              : "h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] 2xl:h-[257px] min-[1440px]:h-[180px]"
          }`}
        >
          <Image
            src={imageUrl || "/images/blog.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-[12px] md:gap-[14px] lg:gap-[16px] xl:gap-[20px] min-[1440px]:gap-[22px]">
          <h3
            className={`font-medium ${
              isLarge
                ? "text-[18px] md:text-[22px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] min-[1440px]:text-[30px] min-[1680px]:text-[38px]"
                : "text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] min-[1440px]:text-[24px]"
            } leading-[1.3] text-[#131314] transition-colors group-hover:text-[#ef6f2e]`}
          >
            {title}
          </h3>
          <p
            className={`${
              isLarge ? "font-normal" : "font-light"
            } text-[13px] md:text-[14px] lg:text-[16px] xl:text-[18px] min-[1440px]:text-[19px] leading-[1.3] text-[rgba(19,19,20,0.4)]`}
          >
            {excerpt}
          </p>
          <div className="flex items-center gap-[8px] md:gap-[10px] lg:gap-[20px] w-fit">
            <span className="font-medium text-[13px] md:text-[14px] lg:text-[16px] xl:text-[18px] min-[1440px]:text-[19px] leading-[1.1] text-[#131314] group-hover:text-[#ef6f2e] transition-colors">
              Читать статью
            </span>
            <div className="w-5 h-5 md:w-6 md:h-6 border-[0.5px] border-[#131314] rounded-full flex items-center justify-center rotate-[-90deg] group-hover:border-[#ef6f2e] group-hover:bg-[#ef6f2e] transition-all">
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                className="md:w-[14px] md:h-[14px]"
              >
                <path
                  d="M4.33 5.15L7 7.81L9.67 5.15L10.5 5.97L7 9.47L3.5 5.97L4.33 5.15Z"
                  fill="currentColor"
                  className="group-hover:fill-white transition-colors"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
