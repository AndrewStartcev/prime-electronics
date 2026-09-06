"use client";

import { useState } from "react";
import { Divider } from "@/shared/ui";
import { PromoCodeInput } from "./PromoCodeInput";
import { CashbackInfoModal } from "./CashbackInfoModal";
import {
  CARD_SURCHARGE_PERCENT,
  calculatePaymentMethodTotal,
  calculatePaymentSurchargeAmount,
  formatRubPrice,
  type PaymentMethodChoice,
} from "@/shared/lib/pricing";
import { TELEGRAM_URL, WHATSAPP_PHONE_DIGITS } from "@/shared/lib/contactInfo";

interface OrderSummaryProps {
  total: number;
  cashback: number;
  promoError?: string;
  promoSuccess?: string;
  appliedPromoCode?: string;
  isPromoApplying?: boolean;
  paymentMethod: PaymentMethodChoice;
  onPaymentMethodChange: (method: PaymentMethodChoice) => void;
  onApplyPromo: (code: string) => void | Promise<void>;
  onQuickOrder?: () => void;
  onCheckout?: () => void;
  isCheckoutLoading?: boolean;
}

export const OrderSummary = ({
  total,
  cashback,
  promoError,
  promoSuccess,
  appliedPromoCode,
  isPromoApplying,
  paymentMethod,
  onPaymentMethodChange,
  onApplyPromo,
  onQuickOrder,
  onCheckout,
  isCheckoutLoading = false,
}: OrderSummaryProps) => {
  const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);
  const paymentSurcharge = calculatePaymentSurchargeAmount(
    total,
    paymentMethod,
  );
  const displayedTotal = calculatePaymentMethodTotal(total, paymentMethod);

  return (
    <>
      <div className="bg-white rounded-[14px] md:rounded-[16px] lg:rounded-[18px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[14px] md:p-[18px] lg:p-[24px] flex flex-col gap-[14px] md:gap-[16px] lg:gap-[18px]">
        {/* Total */}
        <div className="flex items-center justify-between">
          <p className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.3] text-[#131314]">
            Итого:
          </p>
          <p className="font-medium text-[22px] md:text-[26px] lg:text-[30px] leading-[1.3] text-[#131314] text-right">
            {formatRubPrice(displayedTotal)} ₽
          </p>
        </div>

        <div className="bg-[#f7f7f8] rounded-[10px] md:rounded-[12px] p-[10px] md:p-[12px]">
          <p className="text-[13px] md:text-[14px] font-medium text-[#131314] mb-[8px]">
            Способ оплаты
          </p>
          <div className="grid grid-cols-2 gap-[8px]">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("cash")}
              className={`rounded-[9px] px-[10px] py-[10px] text-[13px] md:text-[14px] font-medium transition-colors ${
                paymentMethod === "cash"
                  ? "bg-[#ef6f2e] text-white"
                  : "bg-white text-[#131314]"
              }`}
            >
              Наличными
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange("card")}
              className={`rounded-[9px] px-[10px] py-[10px] text-[13px] md:text-[14px] font-medium transition-colors ${
                paymentMethod === "card"
                  ? "bg-[#ef6f2e] text-white"
                  : "bg-white text-[#131314]"
              }`}
            >
              По карте
            </button>
          </div>
          {paymentMethod === "card" && (
            <p className="text-[11px] md:text-[12px] text-[rgba(19,19,20,0.55)] mt-[8px]">
              К сумме товаров добавлено +{CARD_SURCHARGE_PERCENT}%:{" "}
              {formatRubPrice(paymentSurcharge)} ₽
            </p>
          )}
        </div>

        {/* Cashback */}
        <div className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]">
          <Divider />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px] md:gap-[10px]">
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                Кешбэк за заказ
              </p>
              <button
                onClick={() => setIsCashbackModalOpen(true)}
                className="group relative hover:opacity-70 transition-opacity"
                aria-label="Информация о кешбэке"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-[rgba(19,19,20,0.4)] group-hover:text-[#ef6f2e] transition-colors"
                >
                  <circle cx="10" cy="10" r="8" stroke="currentColor" />
                  <path
                    d="M10 9V14M10 6.5V7"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-[8px] md:gap-[10px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L12.39 7.26L18 8.27L14 12.14L15.18 18L10 15.27L4.82 18L6 12.14L2 8.27L7.61 7.26L10 2Z"
                  fill="#ef6f2e"
                />
              </svg>
              <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#ef6f2e]">
                {cashback} бонусов
              </p>
            </div>
          </div>
          <Divider />
        </div>

        {/* Promo Code */}
        <PromoCodeInput
          onApply={onApplyPromo}
          error={promoError}
          success={promoSuccess}
          appliedCode={appliedPromoCode}
          isLoading={isPromoApplying}
        />

        {/* Buttons */}
        <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]">
          <button
            type="button"
            onClick={onCheckout}
            disabled={isCheckoutLoading}
            className="w-full bg-[#131314] text-white px-[20px] md:px-[24px] lg:px-[28px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[10px] md:rounded-[12px] lg:rounded-[14px] font-normal text-[16px] md:text-[18px] lg:text-[20px] leading-[1.4] hover:bg-[#2c2c2e] active:bg-[#3c3c3e] transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isCheckoutLoading
              ? "Подготовка заказа..."
              : "Перейти к оформлению"}
          </button>
          <button
            type="button"
            onClick={onQuickOrder}
            className="w-full bg-white border border-[#131314] text-[#131314] px-[20px] md:px-[24px] lg:px-[28px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[10px] md:rounded-[12px] lg:rounded-[14px] font-normal text-[16px] md:text-[18px] lg:text-[20px] leading-[1.4] hover:bg-[#f5f5f7] active:bg-[#ebebed] transition-colors touch-action-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            Купить в 1 клик
          </button>
        </div>

        {/* Help Section */}
        <div className="flex flex-col items-center gap-[12px] md:gap-[14px] lg:gap-[16px] mt-[16px] md:mt-[20px] lg:mt-[24px]">
          <div className="text-center">
            <p className="font-medium text-[16px] md:text-[18px] lg:text-[20px] leading-[1.3] text-[#131314]">
              Нужна помощь или есть вопрос?
            </p>
            <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.3] text-[rgba(19,19,20,0.4)] mt-[2px]">
              Напишите нам
            </p>
          </div>
          <div className="flex items-center gap-[8px] md:gap-[10px]">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[32px] h-[32px] md:w-[34px] md:h-[34px] bg-[#ef6f2e] rounded-[5px] md:rounded-[6px] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Telegram"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="white"
                className="w-[12px] h-[12px] md:w-[14px] md:h-[14px]"
              >
                <path d="M5.5 8.5L5.12 12.05C5.47 12.05 5.62 11.9 5.8 11.72L7.29 10.29L10.41 12.51C11.04 12.86 11.48 12.68 11.65 11.93L13.44 3.42C13.68 2.49 13.12 2.12 12.49 2.37L1.49 6.66C0.59 7.01 0.6 7.51 1.33 7.74L4.4 8.69L10.73 4.7C11.03 4.5 11.3 4.61 11.08 4.82L5.5 8.5Z" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_DIGITS}?text=Здравствуйте! У меня вопрос по корзине.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[32px] h-[32px] md:w-[34px] md:h-[34px] bg-[#ef6f2e] rounded-[5px] md:rounded-[6px] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="WhatsApp"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="white"
                className="w-[12px] h-[12px] md:w-[14px] md:h-[14px]"
              >
                <path d="M7 0C3.13 0 0 3.13 0 7C0 8.64 0.5 10.16 1.36 11.42L0.47 13.74C0.37 14 0.6 14.28 0.88 14.21L3.35 13.55C4.47 14.16 5.7 14.5 7 14.5C10.87 14.5 14 11.37 14 7.5S10.87 0 7 0ZM10.44 9.67C10.28 10.08 9.57 10.44 9.1 10.53C8.34 10.67 7.79 10.55 6.41 9.87C4.64 9.02 3.51 7.21 3.41 7.08C3.31 6.95 2.59 5.96 2.59 4.93C2.59 3.9 3.1 3.4 3.3 3.19C3.5 2.98 3.73 2.93 3.88 2.93H4.32C4.46 2.93 4.66 2.88 4.85 3.34C5.05 3.83 5.51 4.86 5.56 4.96C5.61 5.06 5.65 5.19 5.57 5.32C5.09 6.16 4.57 6.11 4.82 6.53C5.64 7.86 6.46 8.31 7.64 8.91C7.87 9.03 8.01 9.01 8.14 8.85C8.27 8.69 8.71 8.17 8.87 7.93C9.03 7.69 9.19 7.73 9.41 7.81C9.63 7.89 10.66 8.4 10.89 8.51C11.12 8.63 11.27 8.68 11.32 8.78C11.37 8.88 11.37 9.26 11.21 9.67H10.44Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Cashback Info Modal */}
      <CashbackInfoModal
        isOpen={isCashbackModalOpen}
        onClose={() => setIsCashbackModalOpen(false)}
        cashback={cashback}
        orderTotal={total}
      />
    </>
  );
};
