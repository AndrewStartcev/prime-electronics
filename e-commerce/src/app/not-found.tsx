import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена - ошибка 404",
  description: "Такой страницы не существует.",
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] bg-white">
      <section className="w-full py-[80px] md:py-[110px] lg:py-[140px]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center px-[16px] text-center">
          <p className="mb-[14px] text-[16px] font-medium text-[#ef6f2e]">
            Ошибка 404
          </p>
          <h1 className="mb-[18px] text-[32px] font-medium leading-[1.1] text-[#131314] md:text-[44px] lg:text-[52px]">
            Такой страницы не существует
          </h1>
          <p className="mb-[32px] max-w-[520px] text-[16px] leading-[1.5] text-[rgba(19,19,20,0.58)] md:text-[18px]">
            Возможно, адрес изменился или страница была удалена. Перейдите на
            главную страницу или в каталог.
          </p>
          <div className="flex flex-col gap-[12px] sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#131314] px-[28px] text-[15px] font-medium text-white transition-colors hover:bg-[#2c2c2e]"
            >
              На главную
            </Link>
            <Link
              href="/categories"
              className="inline-flex h-[52px] items-center justify-center rounded-full border border-[rgba(19,19,20,0.16)] px-[28px] text-[15px] font-medium text-[#131314] transition-colors hover:border-[#ef6f2e] hover:text-[#ef6f2e]"
            >
              В каталог
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
