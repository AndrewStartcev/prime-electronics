"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CashbackInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashback: number;
  orderTotal: number;
}

export const CashbackInfoModal = ({
  isOpen,
  onClose,
  cashback,
  orderTotal,
}: CashbackInfoModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const cashbackPercent = 0.01;

  const modal = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-[14px] p-[16px] md:p-[20px] w-full max-w-[360px] shadow-2xl transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[12px] right-[12px] w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
          aria-label="Закрыть"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#131314"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-[10px] mb-[14px]">
          <div className="w-[38px] h-[38px] bg-gradient-to-br from-[#ef6f2e] to-[#ff9a5a] rounded-full flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-[16px] text-[#131314] leading-[1.2]">
              Бонусная программа
            </h2>
            <p className="text-[12px] text-[rgba(19,19,20,0.6)]">
              Копите бонусы с каждой покупки
            </p>
          </div>
        </div>

        {/* Current order cashback */}
        <div className="bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] rounded-[12px] p-[12px] mb-[14px]">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[13px] text-[rgba(19,19,20,0.7)]">
              Сумма заказа
            </span>
            <span className="font-medium text-[14px] text-[#131314]">
              {orderTotal.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[rgba(19,19,20,0.7)]">
              Ваш кешбэк ({cashbackPercent * 100}%)
            </span>
            <div className="flex items-center gap-[4px]">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L12.39 7.26L18 8.27L14 12.14L15.18 18L10 15.27L4.82 18L6 12.14L2 8.27L7.61 7.26L10 2Z"
                  fill="#ef6f2e"
                />
              </svg>
              <span className="font-semibold text-[16px] text-[#ef6f2e]">
                +{cashback} бонусов
              </span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-[14px]">
          <h3 className="font-medium text-[14px] text-[#131314] mb-[10px]">
            Как это работает?
          </h3>

          <div className="space-y-[10px]">
            {[
              {
                n: "1",
                title: "Совершайте покупки",
                desc: `Получайте ${cashbackPercent * 100}% от суммы каждого заказа в виде бонусов`,
              },
              {
                n: "2",
                title: "Накапливайте бонусы",
                desc: "Бонусы начисляются после получения заказа и действуют 1 год",
              },
              {
                n: "3",
                title: "Оплачивайте бонусами",
                desc: "1 бонус = 1 рубль. Оплачивайте до 100% стоимости следующих покупок",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-[10px]">
                <div className="w-[26px] h-[26px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                  <span className="font-semibold text-[12px] text-[#ef6f2e]">
                    {n}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[13px] text-[#131314]">
                    {title}
                  </p>
                  <p className="text-[12px] text-[rgba(19,19,20,0.6)]">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-[#f5f5f7] rounded-[10px] p-[12px] mb-[14px]">
          <div className="flex items-start gap-[8px]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 mt-[1px]"
            >
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="font-medium text-[13px] text-[#131314]">
                Бонусы начисляются автоматически
              </p>
              <p className="text-[12px] text-[rgba(19,19,20,0.6)]">
                Просто авторизуйтесь в личном кабинете, и мы начислим бонусы
                после доставки заказа
              </p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[#131314] text-white py-[12px] rounded-[10px] font-medium text-[14px] hover:bg-[#2c2c2e] transition-colors"
        >
          Понятно
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
