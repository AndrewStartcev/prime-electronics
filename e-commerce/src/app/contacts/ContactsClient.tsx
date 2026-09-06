import { Breadcrumb } from "@/shared/ui";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  COMPANY_REQUISITES,
  INSTAGRAM_URL,
  MAX_URL,
  TELEGRAM_URL,
  VK_URL,
  WHATSAPP_PHONE_DISPLAY,
  WHATSAPP_URL,
} from "@/shared/lib/contactInfo";

interface Store {
  id: string;
  name: string;
  address: string;
  metro?: string;
  phone: string;
  workHours: string;
  coordinates?: string;
}

interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  link: string;
}

const stores: Store[] = [
  {
    id: "1",
    name: "Prime Electronics на Барклая",
    address: "г. Москва, улица Барклая, 6Ак1",
    metro: "Багратионовская / Парк Победы",
    phone: CONTACT_PHONE_DISPLAY,
    workHours: "Пн-Вс: 11:00 - 21:00",
  },
];

const yandexMapSrc =
  "https://yandex.ru/map-widget/v1/?um=constructor%3Ae6e59f74bc1a223a45fef590b5acdbfb1c487dab8fc87ad7c3b9366dfc5f1202&source=constructor";

const contactMethods: ContactMethod[] = [
  {
    icon: "📞",
    title: "Телефон",
    value: CONTACT_PHONE_DISPLAY,
    link: `tel:${CONTACT_PHONE_TEL}`,
  },
  {
    icon: "✉️",
    title: "Email",
    value: CONTACT_EMAIL,
    link: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: "💬",
    title: "Telegram",
    value: "@PrimeElectronics_ru",
    link: TELEGRAM_URL,
  },
  {
    icon: "📱",
    title: "WhatsApp",
    value: WHATSAPP_PHONE_DISPLAY,
    link: WHATSAPP_URL,
  },
  {
    icon: "◎",
    title: "Instagram",
    value: "@prime_electronics.msk",
    link: INSTAGRAM_URL,
  },
  {
    icon: "VK",
    title: "VK",
    value: "vk.ru/club238735026",
    link: VK_URL,
  },
  {
    icon: "💭",
    title: "MAX",
    value: "Prime Electronics в MAX",
    link: MAX_URL,
  },
];

const features = [
  {
    title: "Быстрый ответ",
    description: "Отвечаем на обращения в течение 15 минут в рабочее время",
  },
  {
    title: "Онлайн-консультация",
    description: "Помогаем с выбором техники прямо на сайте в чате",
  },
  {
    title: "Поддержка 24/7",
    description: "Служба поддержки доступна круглосуточно по электронной почте",
  },
  {
    title: "Персональный менеджер",
    description: "Для корпоративных клиентов — выделенный специалист",
  },
];

export default function ContactsClient({ initialH1 }: { initialH1?: string }) {
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Контакты" },
  ];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] pt-[24px] pb-[80px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        {/* Page Title */}
        <h1 className="font-medium text-[32px] md:text-[40px] lg:text-[46px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[16px] md:mb-[20px] lg:mb-[24px] xl:mb-[30px]">
          {initialH1 || "Контакты"}
        </h1>

        {/* Subtitle */}
        <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.6)] mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] max-w-[900px]">
          Свяжитесь с нами любым удобным способом. Мы всегда рады помочь вам с
          выбором техники и ответить на все вопросы.
        </p>

        {/* Contact Methods */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Способы связи
          </h2>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="min-w-0 bg-[#f5f5f7] rounded-[20px] p-[24px] md:p-[28px] lg:p-[32px] flex flex-col gap-[16px] hover:bg-[#ebebed] transition-colors"
              >
                <div className="text-[36px] md:text-[40px] lg:text-[44px]">
                  {method.icon}
                </div>
                <h3 className="min-w-0 font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314]">
                  {method.title}
                </h3>
                <p className="min-w-0 max-w-full font-normal text-[15px] md:text-[16px] leading-[1.4] text-[#ef6f2e] [overflow-wrap:anywhere]">
                  {method.value}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Stores */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Наш магазин в Москве
          </h2>

          {/* Yandex Map */}
          <div className="rounded-[20px] md:rounded-[24px] lg:rounded-[30px] h-[300px] md:h-[400px] lg:h-[500px] mb-[24px] md:mb-[30px] lg:mb-[36px] overflow-hidden">
            <iframe
              src={yandexMapSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              title="г. Москва, улица Барклая, 6Ак1"
            />
          </div>

          <div className="grid grid-cols-1 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {stores.map((store) => (
              <div
                key={store.id}
                className="grid grid-cols-1 gap-[18px] rounded-[20px] bg-[#f5f5f7] p-[24px] md:p-[28px] lg:grid-cols-3 lg:gap-[28px] lg:p-[32px]"
              >
                <div className="flex flex-col justify-between gap-[12px]">
                  <h3 className="font-medium text-[22px] leading-[1.2] text-[#131314] md:text-[24px] lg:text-[26px]">
                    {store.name}
                  </h3>
                  <span className="text-[14px] leading-[1.4] text-[rgba(19,19,20,0.5)]">
                    Магазин и пункт самовывоза
                  </span>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[14px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                      Адрес:
                    </span>
                    <span className="font-normal text-[15px] md:text-[16px] text-[#131314]">
                      {store.address}
                    </span>
                  </div>
                  {store.metro && (
                    <div className="flex flex-col gap-[4px]">
                      <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                        Метро:
                      </span>
                      <span className="font-normal text-[15px] md:text-[16px] text-[#131314]">
                        {store.metro}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[14px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                      Телефон:
                    </span>
                    <a
                      href={`tel:${CONTACT_PHONE_TEL}`}
                      className="font-normal text-[15px] md:text-[16px] text-[#ef6f2e] hover:opacity-80 transition-opacity"
                    >
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-normal text-[14px] md:text-[15px] text-[rgba(19,19,20,0.6)]">
                      Режим работы:
                    </span>
                    <span
                      className="block max-w-full truncate font-normal text-[15px] md:text-[16px] text-[#131314]"
                      title={store.workHours}
                    >
                      {store.workHours}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Напишите нам
          </h2>
          <div className="max-w-[800px] mx-auto">
            <ContactForm />
          </div>
        </div>

        {/* Features */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px] text-center">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#f5f5f7] rounded-[20px] p-[24px] md:p-[28px] flex flex-col gap-[12px] md:gap-[14px]"
              >
                <h3 className="font-medium text-[18px] md:text-[19px] lg:text-[20px] leading-[1.2] text-[#131314]">
                  {feature.title}
                </h3>
                <p className="font-normal text-[15px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Information */}
        <div className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          <h2 className="font-medium text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[30px] lg:mb-[36px] xl:mb-[42px]">
            Реквизиты
          </h2>
          <div className="bg-[#f5f5f7] rounded-[20px] md:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
            <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 md:gap-[20px]">
              <div className="flex flex-col gap-[8px]">
                <span className="font-medium text-[15px] md:text-[16px] text-[rgba(19,19,20,0.6)]">
                  ИП:
                </span>
                <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] text-[#131314]">
                  {COMPANY_REQUISITES.soleProprietor}
                </span>
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className="font-medium text-[15px] md:text-[16px] text-[rgba(19,19,20,0.6)]">
                  ИНН:
                </span>
                <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] text-[#131314]">
                  {COMPANY_REQUISITES.inn}
                </span>
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className="font-medium text-[15px] md:text-[16px] text-[rgba(19,19,20,0.6)]">
                  ОГРНИП:
                </span>
                <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] text-[#131314]">
                  {COMPANY_REQUISITES.ogrnip}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#131314] to-[#ef6f2e] rounded-[20px] md:rounded-[24px] lg:rounded-[30px] p-[30px] md:p-[40px] lg:p-[50px] xl:p-[60px] text-center">
          <h2 className="font-medium text-[24px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.2] text-white mb-[16px] md:mb-[20px] lg:mb-[24px]">
            Приходите в наш магазин!
          </h2>
          <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(255,255,255,0.8)] mb-[24px] md:mb-[28px] lg:mb-[32px] max-w-[800px] mx-auto">
            Посетите наш магазин, чтобы посмотреть и протестировать устройства
            вживую. Наши эксперты помогут с выбором.
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-white text-[#131314] font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] lg:px-[48px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </main>
  );
}
