import { Breadcrumb } from "@/shared/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

interface DeliveryOption {
  icon: string;
  title: string;
  description: string;
  price: string;
  time: string;
}

interface DeliveryZone {
  zone: string;
  price: string;
  time: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    icon: "/icons/check.svg",
    title: "Курьерская доставка",
    description:
      "Доставим заказ в удобный интервал: до МКАД — от 590 ₽, за МКАД — от 990 ₽",
    price: "От 590 ₽",
    time: "В день заказа или на следующий день",
  },
  {
    icon: "/icons/check.svg",
    title: "Самовывоз из магазина",
    description: "Заберите заказ в нашем магазине в удобное время без очередей",
    price: "Бесплатно",
    time: "Через 2 часа после оформления",
  },
  {
    icon: "/icons/check.svg",
    title: "Экспресс-доставка",
    description: "Срочная доставка по Москве в кратчайшие сроки",
    price: "От 990 ₽",
    time: "В течение 3 часов",
  },
];

const deliveryZones: DeliveryZone[] = [
  {
    zone: "До МКАД",
    price: "От 590 ₽",
    time: "В день заказа",
  },
  {
    zone: "За МКАД",
    price: "От 990 ₽",
    time: "В день заказа или на следующий день",
  },
  {
    zone: "Московская область",
    price: "От 990 ₽",
    time: "1-2 дня",
  },
  {
    zone: "Регионы России",
    price: "От 350 ₽ (зависит от региона)",
    time: "2-7 дней",
  },
];

const features = [
  {
    icon: "/icons/check.svg",
    title: "Проверка при получении",
    description:
      "Проверьте комплектацию и состояние товара в присутствии курьера",
  },
  {
    icon: "/icons/check.svg",
    title: "Гибкий график",
    description:
      "Выберите удобное время доставки или измените его в любой момент",
  },
  {
    icon: "/icons/check.svg",
    title: "SMS-уведомления",
    description: "Получайте уведомления о статусе заказа и времени доставки",
  },
  {
    icon: "/icons/check.svg",
    title: "Безопасная упаковка",
    description: "Все товары упаковываются в фирменную защитную упаковку",
  },
  {
    icon: "/icons/check.svg",
    title: "Оплата при получении",
    description: "Оплатите заказ наличными при получении",
  },
  {
    icon: "/icons/check.svg",
    title: "Банковской картой",
    description: "По техническим причинам, оплата онлайн недоступна.",
  },
];

const steps = [
  {
    number: "01",
    title: "Оформление заказа",
    description: "Добавьте товары в корзину и выберите удобный способ доставки",
  },
  {
    number: "02",
    title: "Подтверждение",
    description:
      "Мы свяжемся с вами для подтверждения заказа и уточнения деталей",
  },
  {
    number: "03",
    title: "Сборка и упаковка",
    description: "Соберем ваш заказ и упакуем в защитную фирменную упаковку",
  },
  {
    number: "04",
    title: "Доставка",
    description: "Курьер доставит заказ в указанное время и место",
  },
];

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/delivery", "Доставка и оплата");
}

export default async function DeliveryPage() {
  const seo = await resolveStaticPageSeo("/delivery", "Доставка и оплата");
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Доставка и оплата" },
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
          Мы предлагаем удобные способы доставки по Москве, Московской области и
          всей России. Быстро, надежно и с заботой о вашем времени.
        </p>

        {/* Delivery Options */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Способы доставки
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] md:gap-[20px] lg:gap-[24px] xl:gap-[30px]">
            {deliveryOptions.map((option, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px] flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
              >
                <div className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] lg:w-[36px] lg:h-[36px]">
                  <Image
                    src={option.icon}
                    alt={option.title}
                    width={36}
                    height={36}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] xl:text-[22px] leading-[1.2] text-[#131314]">
                  {option.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {option.description}
                </p>
                <div className="flex flex-col gap-[8px] pt-[8px] border-t border-[rgba(19,19,20,0.1)]">
                  <div className="flex justify-between items-center">
                    <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                      Стоимость:
                    </span>
                    <span className="font-medium text-[15px] md:text-[16px] text-[#131314]">
                      {option.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                      Срок:
                    </span>
                    <span className="font-medium text-[15px] md:text-[16px] text-[#131314]">
                      {option.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Зоны и стоимость доставки
          </h2>
          <div className="bg-[#f5f5f7] rounded-[20px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(19,19,20,0.1)]">
                    <th className="text-left font-medium text-[16px] md:text-[17px] lg:text-[18px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                      Зона доставки
                    </th>
                    <th className="text-left font-medium text-[16px] md:text-[17px] lg:text-[18px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                      Стоимость
                    </th>
                    <th className="text-left font-medium text-[16px] md:text-[17px] lg:text-[18px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                      Срок доставки
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone, index) => (
                    <tr
                      key={index}
                      className={
                        index !== deliveryZones.length - 1
                          ? "border-b border-[rgba(19,19,20,0.05)]"
                          : ""
                      }
                    >
                      <td className="font-normal text-[15px] md:text-[16px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                        {zone.zone}
                      </td>
                      <td className="font-normal text-[15px] md:text-[16px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                        {zone.price}
                      </td>
                      <td className="font-normal text-[15px] md:text-[16px] text-[#131314] p-[16px] md:p-[20px] lg:p-[24px]">
                        {zone.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Как происходит доставка
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

        {/* Features */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Преимущества нашей доставки
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

        {/* Payment Methods */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Способы оплаты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            <div className="bg-[#f5f5f7] rounded-[20px] p-[24px] md:p-[28px] lg:p-[32px]">
              <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314] mb-[12px] md:mb-[14px] lg:mb-[16px]">
                Банковской картой
              </h3>
              <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] mb-[16px]">
                По техническим причинам, оплата онлайн недоступна.
              </p>
              <div className="flex gap-[8px]">
                <div className="text-[24px]">💳</div>
              </div>
            </div>
            <div className="bg-[#f5f5f7] rounded-[20px] p-[24px] md:p-[28px] lg:p-[32px]">
              <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314] mb-[12px] md:mb-[14px] lg:mb-[16px]">
                Наличными
              </h3>
              <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] mb-[16px]">
                Оплатите заказ наличными курьеру или в магазине
              </p>
              <div className="text-[24px]">💵</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#131314] to-[#ef6f2e] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] text-center">
          <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.2] text-white mb-[16px] md:mb-[20px] lg:mb-[24px]">
            Остались вопросы о доставке?
          </h2>
          <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px] max-w-[800px] mx-auto">
            Свяжитесь с нами любым удобным способом, и мы с радостью ответим на
            все ваши вопросы
          </p>
          <div className="flex flex-col sm:flex-row gap-[12px] md:gap-[16px] justify-center items-center">
            <Link
              href="/contacts"
              className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
            >
              Связаться с нами
            </Link>
            <Link
              href="/catalog"
              className="inline-block bg-transparent border-2 border-white text-white font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[12px] md:py-[14px] lg:py-[16px] rounded-[60px] hover:bg-white hover:text-[#131314] transition-all w-full sm:w-auto text-center"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
