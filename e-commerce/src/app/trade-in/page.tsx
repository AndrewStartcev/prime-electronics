import { Breadcrumb } from "@/shared/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  metadataFromSeo,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

interface TradeInStep {
  number: string;
  title: string;
  description: string;
}

interface AcceptedBrand {
  name: string;
  logo: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const steps: TradeInStep[] = [
  {
    number: "01",
    title: "Оценка устройства",
    description:
      "Ответьте на несколько вопросов о состоянии вашего устройства или посетите наш магазин для бесплатной оценки",
  },
  {
    number: "02",
    title: "Получение предложения",
    description:
      "Мы проверим устройство и сделаем вам выгодное предложение по выкупу в течение 5-10 минут",
  },
  {
    number: "03",
    title: "Выбор нового устройства",
    description:
      "Выберите новую технику из нашего каталога и получите дополнительную скидку при обмене",
  },
  {
    number: "04",
    title: "Оформление сделки",
    description:
      "Мы безопасно удалим ваши данные со старого устройства и оформим покупку нового со скидкой",
  },
];

const acceptedBrands: AcceptedBrand[] = [
  { name: "Apple", logo: "/images/brands/apple-brand-2026.png" },
];

const benefits = [
  {
    icon: "/icons/check.svg",
    title: "Максимальная выкупная цена",
    description:
      "Предлагаем одни из самых высоких цен на рынке за вашу технику",
  },
  {
    icon: "/icons/check.svg",
    title: "Быстрая оценка",
    description: "Определим стоимость вашего устройства за 5-10 минут",
  },
  {
    icon: "/icons/check.svg",
    title: "Дополнительная скидка",
    description: "Получите до 30% скидки на новое устройство при обмене",
  },
  {
    icon: "/icons/check.svg",
    title: "Безопасность данных",
    description: "Гарантируем полное удаление всех ваших личных данных",
  },
  {
    icon: "/icons/check.svg",
    title: "Любое состояние",
    description: "Принимаем устройства в любом состоянии, даже с дефектами",
  },
  {
    icon: "/icons/check.svg",
    title: "Без скрытых условий",
    description: "Прозрачные условия сделки без дополнительных комиссий",
  },
];

const faqs: FAQ[] = [
  {
    question: "Какие устройства вы принимаете?",
    answer:
      "Мы принимаем смартфоны, планшеты, ноутбуки, умные часы и наушники Apple.",
  },
  {
    question: "Как определяется стоимость устройства?",
    answer:
      "Стоимость зависит от модели, года выпуска, состояния экрана, корпуса, батареи и работоспособности всех функций. Наши специалисты проведут диагностику и предложат честную цену.",
  },
  {
    question: "Можно ли сдать устройство с дефектами?",
    answer:
      "Да, мы принимаем устройства с дефектами: разбитым экраном, царапинами, проблемами с батареей. Цена будет скорректирована в зависимости от характера повреждений.",
  },
  {
    question: "Сколько времени занимает процесс?",
    answer:
      "Оценка и диагностика занимают 5-10 минут. Если вы сразу выбираете новое устройство, вся процедура обмена займет около 30-40 минут.",
  },
];

export const dynamic = "force-dynamic";

function localizeTradeInText(value: string): string {
  return value.replace(/Trade-in/g, "Трейд-ин").replace(/trade-in/g, "трейд-ин");
}

async function resolveTradeInSeo() {
  const seo = await resolveStaticPageSeo(
    "/trade-in",
    "Трейд-ин: обменяй старое на новое",
  );

  return {
    title: localizeTradeInText(seo.title),
    description: localizeTradeInText(seo.description),
    h1: localizeTradeInText(seo.h1),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromSeo(await resolveTradeInSeo(), {
    canonicalPath: "/trade-in",
  });
}

export default async function TradeInPage() {
  const seo = await resolveTradeInSeo();
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Трейд-ин" },
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
        <h1 className="font-medium text-[32px] md:text-[40px] lg:text-[46px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[16px] md:mb-[20px] lg:mb-[24px] xl:mb-[30px]">
          {seo.h1}
        </h1>

        {/* Subtitle */}
        <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.6)] mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] max-w-[900px]">
          Обменяйте вашу старую технику на новую с выгодой до 30%. Быстрая
          оценка, честная цена и безопасная передача данных.
        </p>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#131314] to-[#ef6f2e] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[50px] xl:gap-[60px] items-center">
            <div className="flex-1 text-white">
              <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] mb-[16px] md:mb-[20px] lg:mb-[24px]">
                Получите до 30% скидки на новое устройство
              </h2>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px]">
                Сдайте ваш старый смартфон, планшет или ноутбук и получите
                выгодное предложение на покупку новой техники
              </p>
              <a
                href="#calculator"
                className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity"
              >
                Оценить устройство
              </a>
            </div>
            <div className="w-full lg:w-[400px] xl:w-[500px]">
              <div className="rounded-[20px] overflow-hidden">
                <Image
                  src="/images/tradein.png"
                  alt="Трейд-ин"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] md:gap-[24px] lg:gap-[28px] xl:gap-[32px]">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[24px] md:p-[28px] lg:p-[32px] flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
              >
                <div className="font-bold text-[40px] md:text-[46px] lg:text-[52px] leading-[1] text-[#ef6f2e]">
                  {step.number}
                </div>
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] xl:text-[22px] leading-[1.2] text-[#131314]">
                  {step.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Brands */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Принимаем технику Apple
          </h2>
          <div className="flex flex-wrap justify-center gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {acceptedBrands.map((brand, index) => (
              <div
                key={index}
                className="w-full max-w-[220px] bg-white border border-[#f0f0f0] shadow-[0_10px_30px_rgba(19,19,20,0.06)] rounded-[20px] p-[24px] md:p-[28px] lg:p-[32px] flex items-center justify-center aspect-square"
              >
                <div className="text-center flex flex-col items-center gap-[8px]">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={220}
                    height={140}
                    className="w-full max-w-[150px] h-[86px] md:h-[96px] lg:h-[106px] object-contain"
                  />
                  <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] text-[#131314]">
                    {brand.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Преимущества трейд-ин в Prime Electronics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] lg:gap-[24px] xl:gap-[30px]">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px] flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
              >
                <div className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] lg:w-[36px] lg:h-[36px]">
                  <Image
                    src={benefit.icon}
                    alt={benefit.title}
                    width={36}
                    height={36}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] xl:text-[22px] leading-[1.2] text-[#131314]">
                  {benefit.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] lg:text-[16px] xl:text-[17px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Часто задаваемые вопросы
          </h2>
          <div className="flex flex-col gap-[16px] md:gap-[20px] max-w-[1000px] mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px]"
              >
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314] mb-[12px] md:mb-[14px] lg:mb-[16px]">
                  {faq.question}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] lg:text-[17px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div
          id="calculator"
          className="bg-gradient-to-r from-[#ef6f2e] to-[#131314] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] text-center"
        >
          <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.2] text-white mb-[16px] md:mb-[20px] lg:mb-[24px]">
            Готовы обменять свое устройство?
          </h2>
          <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px] max-w-[800px] mx-auto">
            Посетите наш магазин для бесплатной оценки или свяжитесь с нами для
            получения предварительной консультации
          </p>
          <div className="flex flex-col sm:flex-row gap-[12px] md:gap-[16px] justify-center items-center">
            <Link
              href="/contacts"
              className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
            >
              Найти магазин
            </Link>
            <Link
              href="/catalog"
              className="inline-block bg-transparent border-2 border-white text-white font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[12px] md:py-[14px] lg:py-[16px] rounded-[60px] hover:bg-white hover:text-[#131314] transition-all w-full sm:w-auto text-center"
            >
              Смотреть каталог
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
