import { Breadcrumb } from "@/shared/ui";
import type { Metadata } from "next";
import Image from "next/image";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

const features: AboutFeature[] = [
  {
    icon: "/icons/check.svg",
    title: "Эксклюзивные новинки",
    description:
      "Всегда в наличии последние модели премиальной электроники раньше, чем у конкурентов. Официальные поставки и выгодные цены.",
  },
  {
    icon: "/icons/check.svg",
    title: "Гарантия подлинности",
    description:
      "100% оригинальная техника с официальной гарантией производителя и полной поддержкой авторизованных сервисных центров.",
  },
  {
    icon: "/icons/check.svg",
    title: "Выгодные условия",
    description:
      "Гибкие варианты оплаты, рассрочка без переплат и персональные предложения для каждого клиента.",
  },
  {
    icon: "/icons/check.svg",
    title: "Экспертная поддержка",
    description:
      "Профессиональные консультации по выбору техники и помощь в настройке устройств от наших специалистов.",
  },
  {
    icon: "/icons/check.svg",
    title: "Быстрая доставка",
    description:
      "Доставка по всей России, самовывоз в день заказа из наших магазинов в удобное для вас время.",
  },
  {
    icon: "/icons/check.svg",
    title: "Программа лояльности",
    description:
      "Накопительные бонусы, специальные акции и эксклюзивные предложения для постоянных клиентов.",
  },
];

const stats = [
  { value: "7+", label: "лет на рынке" },
  { value: "50 000+", label: "довольных клиентов" },
  { value: "1 000+", label: "товаров в наличии" },
  { value: "99%", label: "положительных отзывов" },
];

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/about", "О компании");
}

export default async function AboutPage() {
  const seo = await resolveStaticPageSeo("/about", "О компании");
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "О компании" },
  ];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        {/* Page Title */}
        <h1 className="font-medium text-[32px] md:text-[40px] lg:text-[46px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]">
          {seo.h1}
        </h1>

        {/* Hero Section */}
        <div className="flex flex-col xl:grid xl:grid-cols-2 gap-[30px] md:gap-[40px] lg:gap-[48px] xl:gap-[80px] items-start xl:items-center mb-[40px] md:mb-[50px] lg:mb-[60px] xl:mb-[80px]">
          <div className="flex flex-col gap-[20px] md:gap-[24px] lg:gap-[30px]">
            <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.1] bg-gradient-to-r from-[#131314] to-[#ef6f2e] bg-clip-text text-transparent">
              Prime Electronics — ваш надежный проводник в мире современных
              технологий
            </h2>
            <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px] font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.6)]">
              <p>
                Мы предлагаем только премиальную электронику от ведущих мировых
                брендов: новейшие смартфоны, планшеты, ноутбуки, умные часы и
                аксессуары с официальной гарантией. Наша миссия — делать высокие
                технологии доступными каждому.
              </p>
              <p>
                Команда Prime Electronics состоит из опытных специалистов,
                которые увлечены технологиями и готовы поделиться своими
                знаниями. Мы помогаем подобрать идеальное устройство под любые
                потребности и бюджет, обеспечивая высокий уровень сервиса на
                всех этапах покупки.
              </p>
              <p>
                Покупая в Prime Electronics, вы выбираете качество, уверенность
                и профессиональный подход. У нас всегда актуальные модели,
                индивидуальное обслуживание и забота о каждом клиенте.
              </p>
            </div>
          </div>
          <div className="w-full max-w-[980px] xl:max-w-none mx-auto xl:mx-0">
            <Image
              src="/images/prime_banner.png"
              alt="Prime Electronics"
              width={3892}
              height={1940}
              className="hidden xl:block rounded-[20px] w-full h-auto"
            />
            <Image
              src="/images/banner_mob.png"
              alt="Prime Electronics"
              width={1372}
              height={920}
              className="xl:hidden rounded-[20px] w-full h-auto"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-[16px] md:gap-[20px] lg:gap-[24px] xl:gap-[30px] mb-[40px] md:mb-[50px] lg:mb-[60px] xl:mb-[80px]">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[30px] xl:p-[36px] flex flex-col items-center justify-center text-center gap-[8px] md:gap-[10px] lg:gap-[12px]"
            >
              <div className="font-semibold text-[28px] md:text-[34px] lg:text-[34px] xl:text-[40px] 2xl:text-[46px] leading-[1] whitespace-nowrap tabular-nums text-[#ef6f2e]">
                {stat.value}
              </div>
              <div className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.3] text-[rgba(19,19,20,0.6)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-[40px] md:mb-[50px] lg:mb-[60px] xl:mb-[70px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] lg:gap-[24px] xl:gap-[30px]">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px] flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
              >
                <div className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] lg:w-[36px] lg:h-[36px]">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={36}
                    height={36}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] xl:text-[22px] leading-[1.2] text-[#131314]">
                  {feature.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] lg:text-[16px] xl:text-[17px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#131314] to-[#ef6f2e] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] text-center">
      
          <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px] max-w-[800px] mx-auto">
            Посетите наши магазины или закажите онлайн — мы всегда рады помочь
            вам найти идеальное устройство
          </p>
          <a
            href="/catalog"
            className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity"
          >
            Перейти в каталог
          </a>
        </div>
      </div>
    </main>
  );
}
