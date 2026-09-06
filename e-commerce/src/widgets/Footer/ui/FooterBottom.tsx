"use client";

import { SocialIcon } from "@/shared/ui/SocialIcon";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  COMPANY_REQUISITES,
  MAX_URL,
  TELEGRAM_URL,
  VK_URL,
  WHATSAPP_URL,
} from "@/shared/lib/contactInfo";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterBottomProps {
  quickLinks?: Array<{ label: string; href: string }>;
}

const ONLINE_PAYMENT_UNAVAILABLE_NOTICE =
  "По техническим причинам, оплата онлайн недоступна.";

export const FooterBottom = ({ quickLinks = [] }: FooterBottomProps) => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Mobile contacts section */}
      <div className="lg:hidden flex flex-col gap-[16px] mb-[20px] md:mb-[30px]">
        {/* Mobile Logo */}
        <button
          onClick={handleLogoClick}
          className="mb-[10px] w-fit cursor-pointer"
          aria-label="На главную"
        >
          <Image
            src="/prime.svg"
            alt="Prime Electronics"
            width={120}
            height={40}
            className="h-[40px] w-[120px]"
          />
        </button>

        <a
          href={`tel:${CONTACT_PHONE_TEL}`}
          className="flex items-center gap-[10px] group"
        >
          <Image
            src="/icons/phone.svg"
            alt="Phone"
            width={12}
            height={12}
            className="h-[12px] w-[12px] shrink-0"
          />
          <span className="font-medium text-[16px] md:text-[18px] leading-[1.1] text-white group-hover:text-[#ef6f2e] transition-colors">
            {CONTACT_PHONE_DISPLAY}
          </span>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-light text-[13px] md:text-[14px] leading-[1.3] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
        >
          {CONTACT_EMAIL}
        </a>
        <a
          href="https://yandex.ru/maps/?text=г.+Москва,+улица+Барклая,+6Ак1"
          target="_blank"
          rel="noopener noreferrer"
          className="not-italic font-light text-[13px] md:text-[14px] leading-[1.3] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
        >
          г. Москва, улица Барклая, 6Ак1
        </a>
        <div className="flex flex-col gap-[4px] font-light text-[13px] md:text-[14px] leading-[1.3] text-[rgba(255,255,255,0.6)]">
          <span>Метро: Багратионовская / Парк Победы</span>
          <span>Пн-Вс: 11:00 - 21:00</span>
        </div>
        <div className="flex items-center gap-[10px] mt-[10px]">
          <SocialIcon name="telegram" href={TELEGRAM_URL} size={36} />
          <SocialIcon name="whatsapp" href={WHATSAPP_URL} size={36} />
          <SocialIcon name="vk" href={VK_URL} size={36} />
          <SocialIcon name="max" href={MAX_URL} size={36} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[14px] md:text-[16px] leading-[1.3] text-[#ef6f2e] hover:text-white transition-colors"
          >
            Наш канал в телеграмме
          </a>
        </div>
      </div>

      {quickLinks.length > 0 && (
        <nav className="hidden flex-wrap gap-x-[18px] gap-y-[10px] lg:mb-[34px] lg:flex">
          {quickLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              prefetch={false}
              className="font-light text-[13px] md:text-[14px] lg:text-[16px] leading-[1.3] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="w-full h-[1px] bg-[#2F2F30] mb-[20px] md:mb-[30px] lg:mb-[60px]" />

      {/* Desktop: row layout, Mobile: column layout */}
      <div className="flex flex-col gap-[14px] lg:flex-row lg:justify-between">
        <p className="font-light text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.34)] lg:w-[438px]">
          © {currentYear} Prime Electronics — интернет-бутик техники. Все права
          защищены.
        </p>
        <div className="flex flex-col gap-[14px] lg:flex-row lg:gap-[40px] xl:gap-[80px] 2xl:gap-[142px]">
          <p className="font-light text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.34)] lg:w-[425px]">
            Сайт носит сугубо информационный характер и не является публичной
            офертой, определяемой Статьей 437 (2) ГК РФ.
          </p>
          <p className="font-light text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.34)]">
            <Link
              href="/privacy"
              prefetch={false}
              className="hover:text-white transition-colors"
            >
              Политика обработки персональных данных
            </Link>
            <span className="mx-[8px] text-[rgba(255,255,255,0.18)]">/</span>
            <Link
              href="/cookies"
              prefetch={false}
              className="hover:text-white transition-colors"
            >
              Политика cookie
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[6px] text-[12px] font-light leading-[1.35] text-[rgba(255,255,255,0.42)] md:text-[13px] lg:grid-cols-3">
        <p>ИП: {COMPANY_REQUISITES.soleProprietor}</p>
        <p>ИНН: {COMPANY_REQUISITES.inn}</p>
        <p>ОГРНИП: {COMPANY_REQUISITES.ogrnip}</p>
      </div>

      <div className="mt-[20px] mb-[20px] flex flex-col gap-[8px] lg:mt-[28px]">
        <Image
          src="/images/payments.png"
          alt="Payments"
          width={229}
          height={24}
          className="h-[24px] w-[229px]"
        />
        <p className="font-light text-[12px] md:text-[14px] lg:text-[15px] leading-[1.35] text-[rgba(255,255,255,0.5)] max-w-[360px]">
          {ONLINE_PAYMENT_UNAVAILABLE_NOTICE}
        </p>
      </div>

      <div className="mt-[32px] flex justify-end border-t border-[#2F2F30] pt-[14px] md:pt-[16px]">
        <a
          href="https://cortexdigital.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex whitespace-nowrap font-light text-[11px] leading-[1.3] text-[rgba(255,255,255,0.34)] transition-colors hover:text-white md:text-[12px]"
        >
          Разработка сайта: CortexDigital
        </a>
      </div>
    </>
  );
};
