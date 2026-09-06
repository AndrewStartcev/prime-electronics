"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialIcon } from "@/shared/ui/SocialIcon";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  MAX_URL,
  TELEGRAM_URL,
  VK_URL,
  WHATSAPP_URL,
} from "@/shared/lib/contactInfo";

export const FooterContacts = () => {
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="hidden lg:flex flex-col gap-[24px]">
      <button
        onClick={handleLogoClick}
        className="leading-[1.1] cursor-pointer w-fit"
        aria-label="На главную"
      >
        <Image
          src="/prime.svg"
          alt="Prime Electronics"
          width={150}
          height={50}
          className="h-[50px] w-[150px]"
        />
      </button>

      <div className="flex flex-col gap-[11px] mt-[20px] md:mt-[40px] flex-1">
        <Link
          href={`tel:${CONTACT_PHONE_TEL}`}
          className="flex items-center gap-[10px] md:gap-[14px] group"
        >
          <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
            <path
              d="M11.0371 7.87663C10.3024 7.87663 9.58104 7.76172 8.89745 7.53581C8.56248 7.42156 8.1507 7.52638 7.94626 7.73634L6.59698 8.75491C5.03221 7.91963 4.06833 6.95606 3.24446 5.40303L4.23305 4.08891C4.48989 3.83241 4.58202 3.45772 4.47164 3.10616C4.24477 2.41897 4.12952 1.69794 4.12952 0.962937C4.12955 0.431969 3.69758 0 3.16665 0H0.962904C0.431968 0 0 0.431969 0 0.962906C0 7.04884 4.95117 12 11.0371 12C11.568 12 12 11.568 12 11.0371V8.8395C12 8.30859 11.568 7.87663 11.0371 7.87663Z"
              fill="white"
            />
          </svg>
          <span className="font-medium text-[18px] leading-[1.1] text-white group-hover:text-[#ef6f2e] transition-colors">
            {CONTACT_PHONE_DISPLAY}
          </span>
        </Link>

        <Link
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-light text-[14px] md:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
        >
          {CONTACT_EMAIL}
        </Link>

        <a
          href="https://yandex.ru/maps/?text=г.+Москва,+улица+Барклая,+6Ак1"
          target="_blank"
          rel="noopener noreferrer"
          className="not-italic font-light text-[14px] md:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors mt-[20px] lg:mt-auto"
        >
          г. Москва, улица Барклая, 6Ак1
        </a>

        <div className="flex flex-col gap-[4px] font-light text-[14px] md:text-[18px] leading-[1.3] text-[rgba(255,255,255,0.6)]">
          <span>Метро: Багратионовская / Парк Победы</span>
          <span>Пн-Вс: 11:00 - 21:00</span>
        </div>

        <div className="flex flex-col gap-[8px] mt-[18px]">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[14px] md:text-[18px] leading-[1.3] text-[#ef6f2e] hover:text-white transition-colors"
          >
            Наш канал в телеграмме
          </a>
        </div>

        <div className="flex items-center gap-[12px] mt-[14px]">
          <span className="text-white text-[16px] md:text-[18px] leading-[1.2]">
            Мы в соцсетях
          </span>
          <SocialIcon name="telegram" href={TELEGRAM_URL} size={34} />
          <SocialIcon name="whatsapp" href={WHATSAPP_URL} size={34} />
          <SocialIcon name="vk" href={VK_URL} size={34} />
          <SocialIcon name="max" href={MAX_URL} size={34} />
        </div>
      </div>
    </div>
  );
};
