import { Breadcrumb } from "@/shared/ui";
import type { Metadata } from "next";
import {
  Wrench,
  Laptop,
  Search,
  Battery,
  Zap,
  CheckCircle2,
  Eye,
  Shield,
  LucideIcon,
} from "lucide-react";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

interface WarrantyCase {
  title: string;
  description: string;
  icon: LucideIcon;
}

const warrantyCases: WarrantyCase[] = [
  {
    icon: Wrench,
    title: "Производственный брак",
    description:
      "Любые дефекты, возникшие по вине производителя: неисправность экрана, батареи, камер, динамиков и других компонентов",
  },
  {
    icon: Laptop,
    title: "Программные сбои",
    description:
      "Проблемы с операционной системой, зависания, ошибки обновления и другие программные неполадки",
  },
  {
    icon: Search,
    title: "Заводские дефекты",
    description:
      "Скрытые дефекты, проявившиеся в процессе эксплуатации: отклеивание экрана, проблемы с корпусом",
  },
  {
    icon: Battery,
    title: "Проблемы с зарядкой",
    description:
      "Неисправность разъема зарядки, проблемы с беспроводной зарядкой, быстрый разряд батареи",
  },
];

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: Benefit[] = [
  {
    icon: Zap,
    title: "Быстрый ремонт",
    description: "Средний срок ремонта — 5-7 дней, экспресс-ремонт — 1-3 дня",
  },
  {
    icon: CheckCircle2,
    title: "Оригинальные запчасти",
    description:
      "Используем только оригинальные комплектующие от производителя",
  },
  {
    icon: Eye,
    title: "Прозрачность",
    description: "Информируем о статусе ремонта на каждом этапе",
  },
  {
    icon: Shield,
    title: "Гарантия на ремонт",
    description: "3 месяца гарантии на выполненные работы",
  },
];

const warrantyServiceExclusions = [
  {
    title: "Неправильное использование",
    description:
      "подключение с нарушением инструкции, эксплуатация устройства в нештатных режимах.",
  },
  {
    title: "Внешние факторы",
    description:
      "скачки напряжения, стихийные бедствия, иные сторонние обстоятельства.",
  },
  {
    title: "Физические воздействия",
    description:
      "механические дефекты, тепловые повреждения (перегрев) устройства.",
  },
  {
    title: "Форсирование режимов (оверклокинг)",
    description:
      "выход из строя процессора, материнской платы и других компонентов в результате «разгона» гарантии не подлежит.",
  },
];

const additionalWarrantyRemovalCases = [
  "Обнаружены следы самостоятельного вскрытия, ремонта или любого вмешательства в конструкцию устройства.",
  "Имеются повреждения от ударов, падений или иного механического воздействия.",
  "Заводские серийные номера удалены, испорчены, затерты или содержат следы исправлений.",
];

const steps = [
  {
    number: "01",
    title: "Обнаружение проблемы",
    description:
      "При обнаружении неисправности свяжитесь с нами любым удобным способом",
  },
  {
    number: "02",
    title: "Диагностика",
    description:
      "Привезите устройство в сервисный центр или закажите бесплатный курьер для диагностики",
  },
  {
    number: "03",
    title: "Решение проблемы",
    description:
      "После диагностики мы отремонтируем или заменим устройство в соответствии с условиями гарантии",
  },
  {
    number: "04",
    title: "Получение устройства",
    description:
      "Заберите отремонтированное устройство или получите его с доставкой",
  },
];

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata(
    "/warranty",
    "Гарантия и сервисное обслуживание",
  );
}

export default async function WarrantyPage() {
  const seo = await resolveStaticPageSeo(
    "/warranty",
    "Гарантия и сервисное обслуживание",
  );
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Гарантия" },
  ];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        {/* Hero Section */}
        <div className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
          <h1 className="font-semibold text-[28px] md:text-[40px] lg:text-[48px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[16px] md:mb-[20px] lg:mb-[24px] xl:mb-[30px] max-w-[800px]">
            {seo.h1}
          </h1>
          <p className="font-normal text-[15px] md:text-[17px] lg:text-[18px] leading-[1.6] text-[rgba(19,19,20,0.55)] max-w-[720px]">
            Мы гарантируем качество каждого устройства и предоставляем полный
            спектр сервисных услуг. Ваше спокойствие — наша забота.
          </p>
        </div>

        {/* What is Covered */}
        <div className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
          <h2 className="font-semibold text-[24px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.15] text-[#131314] mb-[12px] md:mb-[16px] text-center">
            Гарантийные случаи
          </h2>
          <p className="text-center text-[14px] md:text-[16px] text-[rgba(19,19,20,0.5)] mb-[28px] md:mb-[36px] lg:mb-[48px] max-w-[480px] mx-auto leading-[1.5]">
            На что распространяется гарантийное обслуживание
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] md:gap-[16px] lg:gap-[20px]">
            {warrantyCases.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-[#f8f8fa] hover:bg-white border border-transparent hover:border-[#e8e8ea] rounded-[20px] md:rounded-[24px] p-[20px] md:p-[24px] lg:p-[28px] flex flex-col gap-[14px] md:gap-[16px] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-[14px] bg-[#ef6f2e]/10 flex items-center justify-center">
                    <Icon className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] text-[#ef6f2e]" />
                  </div>
                  <div className="flex flex-col gap-[6px] md:gap-[8px]">
                    <h3 className="font-semibold text-[16px] md:text-[18px] lg:text-[19px] leading-[1.25] text-[#131314]">
                      {item.title}
                    </h3>
                    <p className="font-normal text-[13px] md:text-[14px] lg:text-[15px] leading-[1.5] text-[rgba(19,19,20,0.5)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warranty Service Terms */}
        <div className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-[24px] md:rounded-[28px] p-[24px] md:p-[32px] lg:p-[40px] xl:p-[48px]">
            <div className="flex items-center gap-[12px] mb-[20px] md:mb-[24px] lg:mb-[28px]">
              <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-[12px] bg-[#ef6f2e]/10 flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-[#ef6f2e]" />
              </div>
              <h3 className="font-semibold text-[18px] md:text-[22px] lg:text-[24px] leading-[1.2] text-[#131314]">
                Условия гарантийного обслуживания
              </h3>
            </div>
            <div className="flex flex-col gap-[22px] md:gap-[26px]">
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  1. Основные обязательства
                </h4>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)]">
                  Продавец обеспечивает проведение гарантийного ремонта и
                  технического обслуживания товара в течение всего
                  установленного гарантийного срока.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  2. Что не покрывается гарантией
                </h4>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)] mb-[14px]">
                  Гарантия не действует при возникновении следующих повреждений
                  и ситуаций:
                </p>
                <ul className="flex flex-col gap-[12px] md:gap-[14px] lg:gap-[16px]">
                  {warrantyServiceExclusions.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-[12px] font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.5] text-[rgba(19,19,20,0.55)]"
                    >
                      <div className="w-[20px] h-[20px] flex-shrink-0 mt-[2px] rounded-full bg-[#ef6f2e]/10 flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M5 2V5.4M5 7.7V8"
                            stroke="#ef6f2e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span>
                        <span className="font-semibold text-[#131314]">
                          {item.title}:
                        </span>{" "}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  3. Допустимые нормы состояния экрана
                </h4>
                <div className="flex flex-col gap-[10px] font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)]">
                  <p>
                    Наличие до 4 (четырех) «битых» или выпавших точек на
                    ЖК-дисплее не признается существенным недостатком для iPad,
                    iPhone, MacBook, iMac и других устройств с
                    жидкокристаллическими экранами.
                  </p>
                  <p>
                    Данный пункт согласован с Законом о защите прав потребителей
                    и Постановлением Правительства РФ № 55 от 19.01.1998 г.
                    (ред. от 20.10.1998 г.) «Об утверждении Перечня
                    непродовольственных товаров надлежащего качества, не
                    подлежащих возврату или обмену».
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  4. Дополнительные случаи снятия с гарантии
                </h4>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)] mb-[14px]">
                  Сервисное обслуживание не предоставляется, если:
                </p>
                <ul className="flex flex-col gap-[12px] md:gap-[14px] lg:gap-[16px]">
                  {additionalWarrantyRemovalCases.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-[12px] font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.5] text-[rgba(19,19,20,0.55)]"
                    >
                      <div className="w-[20px] h-[20px] flex-shrink-0 mt-[2px] rounded-full bg-[#ef6f2e]/10 flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M5 2V5.4M5 7.7V8"
                            stroke="#ef6f2e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  5. Порядок определения причин поломки
                </h4>
                <div className="flex flex-col gap-[10px] font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)]">
                  <p>
                    Диагностика причин возникновения дефектов проводится
                    специалистами гарантийного отдела магазина.
                  </p>
                  <p>
                    Если клиент не согласен с их заключением, он вправе
                    организовать независимую экспертизу в порядке, установленном
                    Законом о защите прав потребителей.
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  6. Особые условия для периферии
                </h4>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)]">
                  Гарантийное обслуживание мониторов, принтеров, сканеров и
                  иного периферийного оборудования, где гарантия предоставляется
                  производителем, осуществляется в авторизованных сервисных
                  центрах с момента покупки. Доставка оборудования в сервисный
                  центр и обратно производится за счет покупателя.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314] mb-[10px]">
                  7. Согласие с условиями
                </h4>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-[rgba(19,19,20,0.58)]">
                  Совершая покупку, вы автоматически подтверждаете, что
                  ознакомлены и согласны с настоящими правилами гарантийного
                  обслуживания.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
          <h2 className="font-semibold text-[24px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.15] text-[#131314] mb-[12px] md:mb-[16px] text-center">
            Как воспользоваться гарантией
          </h2>
          <p className="text-center text-[14px] md:text-[16px] text-[rgba(19,19,20,0.5)] mb-[28px] md:mb-[36px] lg:mb-[48px] max-w-[480px] mx-auto leading-[1.5]">
            Простой процесс в 4 шага
          </p>

          {/* Mobile: vertical timeline, Desktop: horizontal grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[20px] lg:gap-[24px]">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-[#f8f8fa] hover:bg-white border border-transparent hover:border-[#e8e8ea] rounded-[24px] p-[28px] lg:p-[32px] flex flex-col gap-[16px] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="font-extrabold text-[52px] lg:text-[60px] leading-[1] text-[#ef6f2e]/15">
                  {step.number}
                </div>
                <h3 className="font-semibold text-[17px] lg:text-[19px] xl:text-[20px] leading-[1.25] text-[#131314] -mt-[8px]">
                  {step.title}
                </h3>
                <p className="font-normal text-[14px] lg:text-[15px] leading-[1.5] text-[rgba(19,19,20,0.5)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile timeline */}
          <div className="flex flex-col md:hidden">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-[16px]">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#ef6f2e] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-[2px] flex-1 bg-[#ef6f2e]/15 my-[4px]" />
                  )}
                </div>
                <div
                  className={`pb-[28px] ${index === steps.length - 1 ? "pb-0" : ""}`}
                >
                  <h3 className="font-semibold text-[16px] leading-[1.25] text-[#131314] mt-[9px] mb-[6px]">
                    {step.title}
                  </h3>
                  <p className="font-normal text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
          <h2 className="font-semibold text-[24px] md:text-[30px] lg:text-[36px] xl:text-[42px] leading-[1.15] text-[#131314] mb-[12px] md:mb-[16px] text-center">
            Преимущества нашего сервиса
          </h2>
          <p className="text-center text-[14px] md:text-[16px] text-[rgba(19,19,20,0.5)] mb-[28px] md:mb-[36px] lg:mb-[48px] max-w-[480px] mx-auto leading-[1.5]">
            Почему клиенты выбирают нас
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] md:gap-[16px] lg:gap-[20px] xl:gap-[24px]">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group bg-[#f8f8fa] hover:bg-white border border-transparent hover:border-[#e8e8ea] rounded-[20px] md:rounded-[24px] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px] flex flex-col gap-[14px] md:gap-[16px] lg:gap-[18px] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] lg:w-[52px] lg:h-[52px] rounded-[14px] bg-[#ef6f2e]/10 flex items-center justify-center">
                    <Icon className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] text-[#ef6f2e]" />
                  </div>
                  <h3 className="font-semibold text-[16px] md:text-[18px] lg:text-[19px] xl:text-[20px] leading-[1.25] text-[#131314]">
                    {benefit.title}
                  </h3>
                  <p className="font-normal text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] leading-[1.5] text-[rgba(19,19,20,0.5)]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden bg-[#131314] rounded-[24px] md:rounded-[28px] lg:rounded-[32px] p-[28px] md:p-[40px] lg:p-[56px] xl:p-[64px] text-center">
          {/* Decorative gradient blobs */}
          <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-[#ef6f2e]/20 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] md:w-[250px] md:h-[250px] rounded-full bg-[#ef6f2e]/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-semibold text-[22px] md:text-[28px] lg:text-[34px] xl:text-[40px] leading-[1.2] text-white mb-[12px] md:mb-[16px] lg:mb-[20px]">
              Нужна помощь с гарантийным обслуживанием?
            </h2>
            <p className="font-normal text-[14px] md:text-[16px] lg:text-[17px] leading-[1.5] text-[rgba(255,255,255,0.55)] mb-[24px] md:mb-[32px] lg:mb-[40px] max-w-[600px] mx-auto">
              Свяжитесь с нами, и мы поможем решить любой вопрос по гарантийному
              обслуживанию вашего устройства
            </p>
            <div className="flex flex-col sm:flex-row gap-[10px] md:gap-[14px] justify-center items-center">
              <a
                href="/contacts"
                className="inline-block bg-[#ef6f2e] text-white font-semibold text-[15px] md:text-[16px] lg:text-[17px] px-[28px] md:px-[36px] lg:px-[44px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[14px] hover:bg-[#d95f22] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center"
              >
                Связаться с нами
              </a>
              <a
                href="/catalog"
                className="inline-block bg-white/10 backdrop-blur-sm border border-white/15 text-white font-semibold text-[15px] md:text-[16px] lg:text-[17px] px-[28px] md:px-[36px] lg:px-[44px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[14px] hover:bg-white/20 active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center"
              >
                Перейти в каталог
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
