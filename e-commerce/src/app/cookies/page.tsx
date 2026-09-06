import { Breadcrumb } from "@/shared/ui";
import type { Metadata } from "next";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

const sections = [
  {
    title: "Что такое cookie",
    text: "Cookie — небольшие файлы, которые сайт сохраняет в браузере. Они помогают запоминать корзину, избранное, настройки сессии и корректно показывать страницы.",
  },
  {
    title: "Зачем мы их используем",
    text: "Prime Electronics использует обязательные cookie для работы сайта, аналитические cookie для понимания качества сервиса и технические идентификаторы для безопасности заказов.",
  },
  {
    title: "Как управлять cookie",
    text: "Вы можете ограничить или удалить cookie в настройках браузера. После отключения часть функций сайта, включая корзину и авторизацию, может работать нестабильно.",
  },
  {
    title: "Срок хранения",
    text: "Технические cookie хранятся в течение срока сессии или до одного года, если это нужно для сохранения выбранных настроек и стабильной работы сайта.",
  },
];

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata(
    "/cookies",
    "Политика использования cookie",
  );
}

export default async function CookiesPage() {
  const seo = await resolveStaticPageSeo(
    "/cookies",
    "Политика использования cookie",
  );

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1920px] px-[16px] py-[24px] md:px-[40px] md:py-[32px] lg:px-[40px] lg:py-[40px] xl:px-[60px] xl:py-[60px] 2xl:px-[120px]">
        <Breadcrumb
          items={[
            { label: "Главная", href: "/" },
            { label: "Политика cookie" },
          ]}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px]"
        />

        <div className="max-w-[980px]">
          <h1 className="mb-[16px] text-[32px] font-medium leading-[1.1] text-[#131314] md:text-[40px] lg:text-[46px] xl:text-[56px]">
            {seo.h1}
          </h1>
          <p className="mb-[32px] text-[16px] leading-[1.55] text-[rgba(19,19,20,0.62)] md:text-[18px] lg:mb-[44px]">
            Документ описывает, какие cookie и похожие технологии используются
            на сайте prime-electronics.ru и как пользователь может ими
            управлять.
          </p>

          <div className="grid grid-cols-1 gap-[14px] md:gap-[18px]">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="rounded-[14px] bg-[#f5f5f7] p-[20px] md:p-[26px]"
              >
                <div className="mb-[12px] flex items-center gap-[12px]">
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[#ef6f2e] text-[14px] font-medium text-white">
                    {index + 1}
                  </span>
                  <h2 className="text-[20px] font-medium leading-[1.2] text-[#131314] md:text-[24px]">
                    {section.title}
                  </h2>
                </div>
                <p className="text-[15px] leading-[1.6] text-[rgba(19,19,20,0.64)] md:text-[16px]">
                  {section.text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
