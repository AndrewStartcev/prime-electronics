"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  TELEGRAM_URL,
} from "@/shared/lib/contactInfo";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 md:w-14 md:h-14 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#131314] mb-4">
            Заказ успешно оформлен!
          </h1>

          {orderId && (
            <p className="text-xl md:text-2xl text-[#ef6f2e] font-medium mb-6">
              Номер заказа: #{orderId}
            </p>
          )}

          <div className="bg-[#f5f5f7] rounded-2xl p-6 md:p-8 mb-8 text-left">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#ef6f2e] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-[#131314] mb-2">
                  Мы скоро свяжемся с вами
                </h3>
                <p className="text-[rgba(19,19,20,0.6)] text-base md:text-lg">
                  Наш менеджер перезвонит вам в течение 15 минут, в рабочее
                  время с 11:00 до 21:00, для подтверждения заказа и уточнения
                  деталей доставки.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#131314] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-[#131314] mb-2">
                  Оплата при получении
                </h3>
                <p className="text-[rgba(19,19,20,0.6)] text-base md:text-lg">
                  Вы сможете оплатить заказ наличными или картой при получении
                  товара.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-[#131314] mb-2">
                  Гарантия качества
                </h3>
                <p className="text-[rgba(19,19,20,0.6)] text-base md:text-lg">
                  Все товары имеют официальную гарантию. Вы можете проверить
                  товар перед оплатой.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#131314] hover:bg-[#2c2c2e] text-white px-8 py-4 rounded-xl font-medium text-lg transition-colors"
            >
              На главную
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center bg-white border-2 border-[#131314] text-[#131314] hover:bg-[#f5f5f7] px-8 py-4 rounded-xl font-medium text-lg transition-colors"
            >
              Продолжить покупки
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[rgba(19,19,20,0.1)]">
            <p className="text-[rgba(19,19,20,0.4)] text-sm md:text-base">
              Если у вас есть вопросы, свяжитесь с нами:
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#ef6f2e] hover:underline"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141a.506.506 0 01.171.325c.016.093.036.306.02.472z" />
                </svg>
                Telegram
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="flex items-center gap-2 text-[#ef6f2e] hover:underline"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ef6f2e] border-r-transparent"></div>
            <p className="mt-4 text-lg text-[rgba(19,19,20,0.6)]">
              Загрузка...
            </p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
