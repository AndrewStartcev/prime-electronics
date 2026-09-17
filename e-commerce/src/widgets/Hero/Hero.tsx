import { CategoryChip } from "@/shared/ui";
import Link from "next/link";

const quickLinks = [
  { label: "iPhone 17 Pro Max", href: "/catalog/iphone-17-pro-max" },
  { label: "iPhone 17 Pro", href: "/catalog/iphone-17-pro" },
  { label: "iPhone Air", href: "/catalog/iphone-air-1" },
  { label: "iPhone 17", href: "/catalog/iphone-17" },
  { label: "Dyson", href: "/catalog/dyson" },
  { label: "Samsung", href: "/catalog/samsung" },
  { label: "Apple", href: "/catalog/apple" },
  { label: "JBL", href: "/catalog/jbl" },
];

export const Hero = () => {
  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* Background Video */}
      {/* Background Video */}
      <div className="absolute inset-0 rounded-none lg:rounded-bl-[20px] lg:rounded-br-[20px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/75" />
      </div>
      <div className="max-w-[1920px] mx-auto relative px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        {/* Desktop layout (lg+) */}
        <div className="hidden lg:flex items-center min-h-[500px] xl:min-h-[620px] 2xl:min-h-[760px] 3xl:min-h-[900px] pt-[32px] xl:pt-[40px] 2xl:pt-[56px]">
          {/* Content */}
          <div className="max-w-[500px] xl:max-w-[600px] 2xl:max-w-[750px] 3xl:max-w-[900px] pb-[24px] xl:pb-[32px] 2xl:pb-[44px] 3xl:pb-[56px]">
            {/* Product Variants */}
            <div className="flex items-center gap-[6px] xl:gap-[8px] 2xl:gap-[10px] mb-[16px] xl:mb-[24px] 2xl:mb-[50px] 3xl:mb-[86px] flex-wrap">
              {quickLinks.map((item) => (
                <Link key={item.label} href={item.href}>
                <CategoryChip
                  label={item.label}
                  active={true}
                  variant="dark"
                  as="span"
                />
                </Link>
              ))}
            </div>

            {/* Hero Content */}
            <div className="flex flex-col gap-[10px] xl:gap-[14px] mb-[20px] xl:mb-[30px] 2xl:mb-[60px]">
              <h1 className="font-normal text-[28px] xl:text-[34px] 2xl:text-[46px] 3xl:text-[56px] leading-[1.1] bg-gradient-to-r from-white to-[#ef6f2e] bg-clip-text text-transparent">
                Премиум–устройства для тех, кто ценит совершенство.
              </h1>
            </div>

            {/* CTA Button */}
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-[60px] border border-[rgba(255,255,255,0.4)] px-[20px] py-[16px] font-normal text-[13px] leading-[1.1] text-white transition-colors hover:bg-[#2c2c2e] xl:px-[24px] xl:py-[20px] xl:text-[14px] 2xl:px-[28px] 2xl:py-[24px] 2xl:text-[16px]"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex lg:hidden flex-col pt-[70px] md:pt-[60px] pb-[30px] md:pb-[40px] min-h-[560px] md:min-h-[500px]">
          <div className="max-w-[343px] md:max-w-[500px]">
            <div className="flex items-center gap-[6px] md:gap-[6px] mb-[20px] md:mb-[24px] flex-wrap">
              {quickLinks.map((item) => (
                <Link key={item.label} href={item.href}>
                <CategoryChip
                  label={item.label}
                  active={true}
                  variant="dark"
                  as="span"
                />
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-[14px] mb-[30px] md:mb-[32px]">
              <h1 className="font-normal text-[32px] md:text-[34px] leading-[1.1] bg-gradient-to-r from-white to-[#ef6f2e] bg-clip-text text-transparent">
                Премиум–устройства для тех, кто ценит совершенство.
              </h1>
            </div>
            <Link
              href="/catalog"
              className="inline-flex max-w-[191px] items-center justify-center rounded-[60px] border border-[rgba(255,255,255,0.4)] px-[24px] py-[24px] font-normal text-[16px] leading-[1.1] text-white transition-colors hover:bg-[#2c2c2e] md:w-auto"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
