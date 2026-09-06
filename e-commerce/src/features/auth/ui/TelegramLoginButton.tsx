"use client";

import { useEffect, useRef } from "react";
import { useTelegramLogin } from "../hooks/useAuth";
import type { TelegramAuthData } from "../api";

interface TelegramLoginButtonProps {
  botName: string;
  onSuccess?: () => void;
  buttonSize?: "large" | "medium" | "small";
  cornerRadius?: number;
  showUserPhoto?: boolean;
  lang?: string;
}

export function TelegramLoginButton({
  botName,
  onSuccess,
  buttonSize = "large",
  cornerRadius = 14,
  showUserPhoto = true,
  lang = "ru",
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const telegramLoginMutation = useTelegramLogin(onSuccess);
  const mutationRef = useRef(telegramLoginMutation);
  mutationRef.current = telegramLoginMutation;

  useEffect(() => {
    if (!botName) return;

    const callbackName = "__telegram_login_callback__";
    (window as any)[callbackName] = (user: TelegramAuthData) => {
      mutationRef.current.mutate(user);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-radius", String(cornerRadius));
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-lang", lang);
    if (!showUserPhoto) {
      script.setAttribute("data-userpic", "false");
    }

    const container = containerRef.current;
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      delete (window as any)[callbackName];
    };
  }, [botName, buttonSize, cornerRadius, showUserPhoto, lang]);

  return (
    <div className="w-full flex flex-col items-center gap-[8px]">
      {botName ? (
        /* Официальный виджет Telegram — работает надёжно */
        <div ref={containerRef} className="flex justify-center w-full" />
      ) : (
        /* Заглушка когда botName не задан */
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-[10px] bg-[#229ED9] opacity-60 cursor-not-allowed text-white py-[14px] md:py-[18px] px-[20px] rounded-[14px] font-normal text-[16px] md:text-[18px] leading-[1.1]"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.943l-2.94-.918c-.64-.203-.653-.64.136-.954l11.49-4.43c.532-.194 1.00.13.948.58z"
              fill="white"
            />
          </svg>
          Войти через Telegram
        </button>
      )}

      {telegramLoginMutation.isPending && (
        <p className="text-[13px] text-[rgba(19,19,20,0.6)]">
          Авторизация через Telegram...
        </p>
      )}

      {telegramLoginMutation.error && (
        <p className="text-[13px] text-red-500 text-center">
          {(telegramLoginMutation.error as any)?.response?.data?.message ||
            "Ошибка авторизации через Telegram"}
        </p>
      )}
    </div>
  );
}
