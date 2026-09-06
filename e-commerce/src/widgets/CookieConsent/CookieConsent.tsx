"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "prime_cookie_consent";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted") return;

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    document.cookie = `${COOKIE_CONSENT_KEY}=accepted; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-[12px] bottom-[76px] z-[70] mx-auto max-w-[760px] rounded-[14px] border border-[rgba(19,19,20,0.08)] bg-white p-[12px] shadow-[0_12px_40px_rgba(19,19,20,0.16)] md:bottom-[24px] md:p-[16px]">
      <div className="flex items-center justify-between gap-[10px] md:gap-[18px]">
        <p className="text-[12px] leading-[1.35] text-[rgba(19,19,20,0.72)] md:text-[14px] md:leading-[1.45]">
          Используем cookie для работы сайта, корзины и аналитики. Подробнее — в{" "}
          <Link
            href="/cookies"
            className="font-medium text-[#ef6f2e] hover:text-[#131314] transition-colors"
          >
            политике cookie
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="h-[36px] shrink-0 rounded-[10px] bg-[#131314] px-[14px] text-[13px] font-medium text-white transition-colors hover:bg-[#ef6f2e] md:h-[42px] md:px-[22px] md:text-[14px]"
        >
          ОК
        </button>
      </div>
    </div>
  );
};
