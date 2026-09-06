import { Breadcrumb } from "@/shared/ui";
import { PromotionCard, promotionsData } from "@/entities/promotion";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

interface PromoSection {
  id: string;
  title: string;
  description: string;
  image: string;
  items: {
    icon: string;
    text: string;
  }[];
}

const promoSections: PromoSection[] = [
  {
    id: "cashback",
    title: "Программа кешбэка",
    description:
      "Получайте баллы за каждую покупку и используйте их для оплаты следующих заказов",
    image: "/images/cards_mock.png",
    items: [
      { icon: "/icons/check.svg", text: "1% кешбэка на все покупки" },
      {
        icon: "/icons/check.svg",
        text: "Оплата бонусами до 100% стоимости",
      },
      { icon: "/icons/check.svg", text: "Бонусы не сгорают" },
      {
        icon: "/icons/check.svg",
        text: "Дополнительные баллы в день рождения",
      },
    ],
  },
  {
    id: "trade-in",
    title: "Трейд-ин",
    description:
      "Обменяйте старую технику на новую с выгодой. Быстрая оценка и максимальная цена выкупа",
    image: "/images/tradein.png",
    items: [
      { icon: "/icons/check.svg", text: "Оценка устройства за 5 минут" },
      {
        icon: "/icons/check.svg",
        text: "Выкуп техники Apple",
      },
      { icon: "/icons/check.svg", text: "Скидка до 30% на новое устройство" },
      { icon: "/icons/check.svg", text: "Безопасная передача данных" },
    ],
  },
  {
    id: "special",
    title: "Подарки к покупкам",
    description:
      "К выбранным смартфонам добавляем полезные аксессуары: чехол и защитное стекло Remax",
    image: "/images/promotions/gift-bundle-card.png",
    items: [
      { icon: "/icons/check.svg", text: "Скидки до 40% на хиты продаж" },
      {
        icon: "/icons/check.svg",
        text: "Чехол и стекло в подарок к выбранным моделям",
      },
      { icon: "/icons/check.svg", text: "Кэшбэк за заказ бонусами" },
    ],
  },
  {
    id: "express-delivery",
    title: "Экспресс-доставка",
    description:
      "Срочно привезём заказ по Москве: быстро подтверждаем, аккуратно упаковываем и передаём курьеру.",
    image: "/images/promotions/express-delivery-card.png",
    items: [
      {
        icon: "/icons/check.svg",
        text: "Доставка по Москве в кратчайшие сроки",
      },
      {
        icon: "/icons/check.svg",
        text: "Стоимость рассчитывается по зоне доставки",
      },
      {
        icon: "/icons/check.svg",
        text: "Курьер заранее связывается перед приездом",
      },
    ],
  },
];

const benefits = [
  {
    title: "Накопительная система",
    description: "Чем больше покупаете — тем выше процент кешбэка",
  },
  {
    title: "Персональные акции",
    description: "Специальные предложения на основе ваших интересов",
  },
  {
    title: "Ранний доступ",
    description: "Первыми узнавайте о новинках и распродажах",
  },
];

const fullCardSectionIds = new Set(["special", "express-delivery"]);

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata(
    "/promotions",
    "Акции и специальные предложения",
  );
}

export default async function PromotionsPage() {
  const seo = await resolveStaticPageSeo(
    "/promotions",
    "Акции и специальные предложения",
  );
  const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Акции" }];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        {/* Page Title */}
        <h1 className="font-medium text-[32px] md:text-[40px] lg:text-[46px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[16px] md:mb-[20px] lg:mb-[24px] xl:mb-[30px]">
          {seo.h1}
        </h1>

        {/* Subtitle */}
        <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.6)] mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] max-w-[900px]">
          Экономьте на покупках премиальной техники с нашими выгодными
          предложениями. Кешбэк, трейд-ин и эксклюзивные акции для наших
          клиентов.
        </p>

        {/* Promotion Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] xl:gap-[24px] mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          {promotionsData.slice(0, 6).map((promotion) => (
            <PromotionCard key={promotion.id} {...promotion} />
          ))}
        </div>

        {/* Promo Sections */}
        <div className="flex flex-col gap-[40px] md:gap-[50px] lg:gap-[60px] xl:gap-[70px] mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          {promoSections.map((section, index) => {
            const isFullCardSection = fullCardSectionIds.has(section.id);

            return (
              <div
                key={section.id}
                id={section.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-[30px] md:gap-[40px] lg:gap-[50px] xl:gap-[60px] items-center`}
              >
                {/* Content */}
                <div className="flex-1 flex flex-col gap-[20px] md:gap-[24px] lg:gap-[28px]">
                  <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314]">
                    {section.title}
                  </h2>
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.6)]">
                    {section.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] md:gap-[14px] lg:gap-[16px]">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-[12px]">
                        <div className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] flex-shrink-0 mt-[2px]">
                          <Image
                            src={item.icon}
                            alt="Check"
                            width={24}
                            height={24}
                            className="w-full h-full"
                          />
                        </div>
                        <p className="font-normal text-[15px] md:text-[16px] lg:text-[17px] leading-[1.4] text-[#131314]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div className="flex-1 w-full">
                  <div
                    className={`relative rounded-[20px] md:rounded-[24px] lg:rounded-[30px] overflow-hidden flex items-center justify-center ${
                      isFullCardSection
                        ? "bg-[#050505] aspect-[3/4] max-w-[560px] mx-auto"
                        : "bg-[#f5f5f7] aspect-[4/3] lg:aspect-[3/2]"
                    }`}
                  >
                    {!isFullCardSection && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,111,46,0.12),transparent_46%)]" />
                    )}
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`relative ${
                        isFullCardSection
                          ? "object-fill"
                          : "object-contain p-[26px] md:p-[34px] lg:p-[42px]"
                      } ${
                        section.id === "trade-in"
                          ? "object-bottom"
                          : "object-center"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Grid */}
        <div className="mb-[40px] md:mb-[50px] lg:mb-[60px] xl:mb-[70px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Дополнительные преимущества
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[28px] flex flex-col gap-[12px] md:gap-[14px] lg:gap-[16px]"
              >
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314]">
                  {benefit.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#ef6f2e] to-[#131314] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] text-center">
          <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.2] text-white mb-[16px] md:mb-[20px] lg:mb-[24px]">
            Не упустите выгодные предложения!
          </h2>
          <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px] max-w-[800px] mx-auto">
            Подпишитесь на рассылку, чтобы первыми узнавать о новых акциях и
            получать эксклюзивные промокоды
          </p>
          <div className="flex flex-col sm:flex-row gap-[12px] md:gap-[16px] justify-center items-center">
            <Link
              href="/catalog"
              className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/register"
              className="inline-block bg-transparent border-2 border-white text-white font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[12px] md:py-[14px] lg:py-[16px] rounded-[60px] hover:bg-white hover:text-[#131314] transition-all w-full sm:w-auto text-center"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
