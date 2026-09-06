import type { Metadata } from "next";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata(
    "/privacy",
    "Политика конфиденциальности",
  );
}

export default async function PrivacyPage() {
  const seo = await resolveStaticPageSeo(
    "/privacy",
    "Политика конфиденциальности",
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[60px] md:py-[100px] lg:py-[140px] xl:py-[180px] 2xl:py-[200px]">
        {/* Header with decorative line */}
        <div className="max-w-[1100px] mx-auto mb-[60px] md:mb-[80px] lg:mb-[100px]">
          <div className="flex items-center gap-[20px] md:gap-[30px] mb-[24px] md:mb-[30px]">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#ef6f2e]"></div>
            <div className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-full bg-[#ef6f2e]"></div>
          </div>
          <h1 className="font-medium text-[32px] md:text-[38px] lg:text-[44px] xl:text-[50px] 2xl:text-[56px] leading-[1.1] text-[#131314] mb-[16px] md:mb-[20px]">
            {seo.h1}
          </h1>
          <p className="font-normal text-[16px] md:text-[18px] lg:text-[20px] leading-[1.5] text-[rgba(19,19,20,0.5)]">
            Мы ценим ваше доверие и заботимся о безопасности ваших персональных
            данных
          </p>
        </div>

        {/* Content */}
        <div className="max-w-[1100px] mx-auto">
          <div className="space-y-[40px] md:space-y-[50px] lg:space-y-[60px]">
            {/* Section 1 */}
            <section className="bg-[#f5f5f7] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-white">
                    1
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Общие положения
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                Настоящая Политика конфиденциальности персональных данных (далее
                – Политика конфиденциальности) действует в отношении всей
                информации, которую интернет-магазин Prime Electronics,
                расположенный на доменном имени prime-electronics.ru, может
                получить о Пользователе во время использования сайта
                интернет-магазина, программ и продуктов интернет-магазина.
              </p>
            </section>

            {/* Section 2 */}
            <section className="border border-[rgba(19,19,20,0.1)] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white border-2 border-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-[#ef6f2e]">
                    2
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Определение терминов
                </h2>
              </div>
              <div className="space-y-[20px] md:space-y-[24px]">
                <div className="pl-[20px] border-l-[3px] border-[#ef6f2e]">
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    <strong className="text-[#131314] font-medium">
                      Персональные данные
                    </strong>{" "}
                    – любая информация, относящаяся к прямо или косвенно
                    определенному или определяемому физическому лицу (субъекту
                    персональных данных).
                  </p>
                </div>
                <div className="pl-[20px] border-l-[3px] border-[#ef6f2e]">
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    <strong className="text-[#131314] font-medium">
                      Обработка персональных данных
                    </strong>{" "}
                    – любое действие (операция) или совокупность действий
                    (операций), совершаемых с использованием средств
                    автоматизации или без использования таких средств с
                    персональными данными.
                  </p>
                </div>
                <div className="pl-[20px] border-l-[3px] border-[#ef6f2e]">
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    <strong className="text-[#131314] font-medium">
                      Конфиденциальность персональных данных
                    </strong>{" "}
                    – обязательное для соблюдения Оператором или иным получившим
                    доступ к персональным данным лицом требование не допускать
                    их распространения без согласия субъекта персональных
                    данных.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-[#f5f5f7] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-white">
                    3
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Какую информацию мы собираем
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)] mb-[16px] md:mb-[20px]">
                Мы можем собирать и обрабатывать следующую информацию о вас:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] md:gap-[16px]">
                <div className="flex items-center gap-[12px] bg-white rounded-[12px] p-[16px] md:p-[20px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef6f2e] flex-shrink-0"></div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(19,19,20,0.7)]">
                    Имя, фамилия и отчество
                  </span>
                </div>
                <div className="flex items-center gap-[12px] bg-white rounded-[12px] p-[16px] md:p-[20px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef6f2e] flex-shrink-0"></div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(19,19,20,0.7)]">
                    Адрес электронной почты
                  </span>
                </div>
                <div className="flex items-center gap-[12px] bg-white rounded-[12px] p-[16px] md:p-[20px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef6f2e] flex-shrink-0"></div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(19,19,20,0.7)]">
                    Номер телефона
                  </span>
                </div>
                <div className="flex items-center gap-[12px] bg-white rounded-[12px] p-[16px] md:p-[20px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef6f2e] flex-shrink-0"></div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(19,19,20,0.7)]">
                    Адрес доставки
                  </span>
                </div>
                <div className="flex items-center gap-[12px] bg-white rounded-[12px] p-[16px] md:p-[20px] md:col-span-2">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef6f2e] flex-shrink-0"></div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.4] text-[rgba(19,19,20,0.7)]">
                    Информация о заказах и покупках
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="border border-[rgba(19,19,20,0.1)] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white border-2 border-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-[#ef6f2e]">
                    4
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Цели сбора и обработки персональной информации
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)] mb-[16px] md:mb-[20px]">
                Мы используем ваши персональные данные для следующих целей:
              </p>
              <div className="space-y-[12px]">
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Обработка и выполнение заказов
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Связь с вами по вопросам заказа
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Предоставление клиентской поддержки
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Отправка информационных и маркетинговых сообщений (с вашего
                    согласия)
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Улучшение наших услуг и персонализация вашего опыта
                  </span>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-[#f5f5f7] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-white">
                    5
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Защита персональных данных
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                Мы принимаем необходимые и достаточные организационные и
                технические меры для защиты персональных данных Пользователя от
                неправомерного или случайного доступа, уничтожения, изменения,
                блокирования, копирования, распространения, а также от иных
                неправомерных действий с ней третьих лиц.
              </p>
            </section>

            {/* Section 6 */}
            <section className="border border-[rgba(19,19,20,0.1)] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white border-2 border-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-[#ef6f2e]">
                    6
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Ваши права
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)] mb-[16px] md:mb-[20px]">
                Вы имеете право:
              </p>
              <div className="space-y-[12px]">
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Получать информацию о ваших персональных данных, которыми мы
                    располагаем
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Требовать исправления неточных данных
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Требовать удаления ваших персональных данных
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Отозвать согласие на обработку персональных данных
                  </span>
                </div>
                <div className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[rgba(239,111,46,0.1)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#ef6f2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                    Подать жалобу в надзорный орган
                  </span>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-[#f5f5f7] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-white">
                    7
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Cookies
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                Сайт интернет-магазина использует файлы cookies для корректного
                функционирования сайта, персонализации контента и рекламы, а
                также для анализа трафика сайта. Вы можете настроить
                использование cookies в своем браузере.
              </p>
            </section>

            {/* Section 8 */}
            <section className="border border-[rgba(19,19,20,0.1)] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white border-2 border-[#ef6f2e] flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-[#ef6f2e]">
                    8
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-[#131314] pt-[6px] md:pt-[8px]">
                  Изменения в Политике конфиденциальности
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-[rgba(19,19,20,0.7)]">
                Мы оставляем за собой право вносить изменения в настоящую
                Политику конфиденциальности. При внесении изменений в актуальной
                редакции указывается дата последнего обновления. Новая редакция
                Политики вступает в силу с момента ее размещения, если иное не
                предусмотрено новой редакцией Политики.
              </p>
            </section>

            {/* Section 9 - Contact */}
            <section className="bg-gradient-to-br from-[#ef6f2e] to-[#d65e23] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px]">
              <div className="flex items-start gap-[16px] md:gap-[20px] mb-[20px] md:mb-[24px]">
                <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-[20px] md:text-[24px] text-[#ef6f2e]">
                    9
                  </span>
                </div>
                <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.2] text-white pt-[6px] md:pt-[8px]">
                  Контактная информация
                </h2>
              </div>
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.7] text-white/90 mb-[16px]">
                По всем вопросам, касающимся обработки персональных данных, вы
                можете обратиться к нам по электронной почте:{" "}
                <a
                  href="mailto:prime.electronic.help@mail.ru"
                  className="text-white font-medium underline hover:no-underline"
                >
                  prime.electronic.help@mail.ru
                </a>
              </p>
              <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] text-white/70">
                Дата последнего обновления: 20 декабря 2025 г.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
