"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useModal } from "@/shared/hooks";
import { MAX_URL, TELEGRAM_URL } from "@/shared/lib/contactInfo";

export const SocialMessengerWidget = () => {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible, isClosing, handleClose, handleBackdropClick } = useModal(
    isOpen,
    {
      onClose: () => setIsOpen(false),
      animationDuration: 180,
    },
  );

  useEffect(() => {
    const show = () => setIsReady(true);
    const timer = window.setTimeout(show, 3800);

    window.addEventListener("pointerdown", show, { once: true, passive: true });
    window.addEventListener("scroll", show, { once: true, passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", show);
      window.removeEventListener("scroll", show);
    };
  }, []);

  if (!isReady) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-[14px] bottom-[84px] md:right-[20px] md:bottom-[24px] z-[120] w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-gradient-to-br from-[#1ec6e6] via-[#3b82f6] to-[#5b3de6] border border-white/30 shadow-[0_10px_30px_rgba(48,77,255,0.42)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        aria-label="Открыть мессенджеры"
      >
        <span className="w-[34px] h-[34px] md:w-[38px] md:h-[38px] rounded-full bg-white/14 backdrop-blur-[2px] flex items-center justify-center">
          <Image
            src="/icons/max.svg"
            alt="Открыть мессенджеры"
            width={30}
            height={30}
            className="w-[28px] h-[28px] md:w-[30px] md:h-[30px]"
          />
        </span>
      </button>

      {isVisible && (
        <div
          className={`fixed inset-0 z-[999990] flex items-center justify-center p-[16px] md:p-[24px] ${
            isClosing ? "animate-fadeOut" : "animate-fadeIn"
          }`}
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-[rgba(19,19,20,0.5)]" />

          <div
            className={`relative w-full max-w-[760px] bg-[#f3f4f6] rounded-[22px] md:rounded-[26px] p-[18px] md:p-[22px] shadow-[0_25px_70px_rgba(19,19,20,0.32)] ${
              isClosing ? "animate-scaleOut" : "animate-scaleIn"
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-[8px] right-[8px] md:top-[12px] md:right-[12px] w-[30px] h-[30px] md:w-[32px] md:h-[32px] rounded-full bg-[rgba(19,19,20,0.16)] text-[#131314] hover:bg-[rgba(19,19,20,0.24)] transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>

            <h3 className="text-[#1f2937] text-center font-semibold text-[24px] md:text-[40px] leading-[1.06]">
              Свяжитесь с нами напрямую в мессенджерах
            </h3>

            <div className="mt-[14px] md:mt-[18px] grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-[12px] md:gap-[14px]">
              <div className="bg-[#e5e7eb] rounded-[18px] md:rounded-[22px] p-[12px] md:p-[14px]">
                <p className="bg-[#a8cdf8] text-[#1f2937] text-center font-semibold text-[16px] md:text-[22px] rounded-[10px] py-[8px] md:py-[10px]">
                  Сканируйте QR-код телефоном
                </p>
                <div className="mt-[10px] md:mt-[12px] bg-white rounded-[14px] p-[8px] md:p-[10px]">
                  <Image
                    src="/images/social-telegram-qr-v2.png"
                    alt="QR код Prime Electronics"
                    width={512}
                    height={512}
                    className="w-full h-auto rounded-[8px]"
                  />
                </div>
              </div>

              <div className="bg-[#e5e7eb] rounded-[18px] md:rounded-[22px] p-[12px] md:p-[14px] flex flex-col justify-center gap-[10px] md:gap-[12px]">
                <a
                  href={MAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center rounded-[12px] overflow-hidden shadow-[0_6px_16px_rgba(47,80,220,0.22)]"
                >
                  <span className="w-[68px] md:w-[72px] h-[54px] md:h-[56px] bg-gradient-to-r from-[#1ec6e6] to-[#3b82f6] flex items-center justify-center">
                    <Image
                      src="/icons/max.svg"
                      alt="Max"
                      width={34}
                      height={34}
                      className="w-[30px] h-[30px] md:w-[32px] md:h-[32px]"
                    />
                  </span>
                  <span className="h-[54px] md:h-[56px] flex-1 bg-gradient-to-r from-[#3b82f6] to-[#5b3de6] flex items-center justify-center text-white font-semibold leading-none text-[22px] md:text-[20px] group-hover:brightness-110 transition-all">
                    Max
                  </span>
                </a>

                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center rounded-[12px] overflow-hidden shadow-[0_6px_16px_rgba(29,161,242,0.2)]"
                >
                  <span className="w-[68px] md:w-[72px] h-[54px] md:h-[56px] bg-[#2b95d5] flex items-center justify-center">
                    <Image
                      src="/icons/telegram.svg"
                      alt="Telegram"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] md:w-[26px] md:h-[26px]"
                    />
                  </span>
                  <span className="h-[54px] md:h-[56px] flex-1 bg-[#37a7e6] flex items-center justify-center text-white font-semibold leading-none text-[22px] md:text-[20px] group-hover:brightness-110 transition-all">
                    Телеграм
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
