"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartNotificationStore } from "@/shared/stores";
import { cartKeys } from "@/shared/hooks";

export const CartNotification = () => {
  const { visible, hide } = useCartNotificationStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(hide, 5000);
    return () => clearTimeout(timer);
  }, [visible, hide]);

  if (!visible) return null;

  const handleGoToCart = async () => {
    hide();
    // Keep cache fresh, but never block navigation if this fails.
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartKeys.guest() }),
        queryClient.invalidateQueries({ queryKey: ["userCart"] }),
      ]);
    } catch {
      // Ignore cache errors, navigation must still happen.
    }

    if (window.location.pathname.startsWith("/basket")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fallback for browsers/environments where smooth scroll may be ignored.
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return;
    }

    window.location.assign("/basket");
  };

  return (
    <div className="fixed bottom-[80px] md:bottom-[24px] left-1/2 z-[9999] w-[calc(100%-32px)] max-w-[480px] pointer-events-none" style={{ transform: "translateX(-50%)" }}>
      <div className="pointer-events-auto bg-[#131314] text-white rounded-[16px] px-[20px] py-[16px] shadow-[0px_8px_40px_rgba(0,0,0,0.3)] flex items-center gap-[16px] animate-toast-slide-up">
        {/* Check icon */}
        <div className="shrink-0 w-[36px] h-[36px] rounded-full bg-[#ef6f2e] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.75 9.75L6.75 12.75L14.25 5.25"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text + actions */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium leading-[1.3] mb-[8px]">
            Ваш товар добавлен в корзину
          </p>
          <div className="flex items-center gap-[12px] flex-wrap">
            <button
              onClick={handleGoToCart}
              className="text-[13px] font-medium text-[#ef6f2e] hover:text-[#d96328] transition-colors whitespace-nowrap"
            >
              Перейти в корзину
            </button>
            <span className="text-[rgba(255,255,255,0.3)] text-[12px]">|</span>
            <button
              onClick={hide}
              className="text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors whitespace-nowrap"
            >
              Вернуться на сайт
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={hide}
          className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          aria-label="Закрыть"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 2L12 12M12 2L2 12"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
