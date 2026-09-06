"use client";

import { useState, useEffect } from "react";
import { formatPhone, isValidPhone } from "@/shared/lib/formatPhone";

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  itemsCount: number;
  onSubmit: (phone: string, name: string) => void | Promise<void>;
}

export const QuickOrderModal = ({
  isOpen,
  onClose,
  total,
  itemsCount,
  onSubmit,
}: QuickOrderModalProps) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    }

    document.body.style.overflow = "";
    const timer = window.setTimeout(() => setIsAnimating(false), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      setError("Введите корректный номер телефона");
      return;
    }

    if (!name.trim()) {
      setError("Введите ваше имя");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(phone, name);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPhone("");
        setName("");
      }, 2000);
    } catch (err) {
      console.error("[QuickOrder] Failed to submit quick order:", err);
      const parsedError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        parsedError.response?.data?.message ||
          parsedError.message ||
          "Произошла ошибка. Попробуйте позже.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        className={`relative bg-white rounded-[16px] md:rounded-[20px] p-[20px] md:p-[28px] lg:p-[32px] w-full max-w-[420px] shadow-2xl transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
          aria-label="Закрыть"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#131314"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-[16px] py-[20px]">
            <div className="w-[64px] h-[64px] bg-[#22c55e] rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12L10 17L20 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-[20px] md:text-[22px] text-[#131314]">
                Заявка принята!
              </p>
              <p className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.6)] mt-[4px]">
                Мы свяжемся с вами в ближайшее время
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-medium text-[22px] md:text-[26px] lg:text-[28px] text-[#131314] mb-[8px]">
              Купить в 1 клик
            </h2>
            <p className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.6)] mb-[20px]">
              Оставьте свои данные и мы перезвоним для оформления заказа
            </p>

            {/* Order summary */}
            <div className="bg-[#f5f5f7] rounded-[12px] p-[14px] md:p-[16px] mb-[20px]">
              <div className="flex justify-between items-center">
                <span className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.6)]">
                  {itemsCount}{" "}
                  {itemsCount === 1
                    ? "товар"
                    : itemsCount < 5
                      ? "товара"
                      : "товаров"}
                </span>
                <span className="font-semibold text-[18px] md:text-[20px] text-[#131314]">
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Ваше имя"
                  className="w-full border border-[rgba(19,19,20,0.16)] rounded-[10px] md:rounded-[12px] px-[16px] py-[14px] md:py-[16px] text-[14px] md:text-[16px] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] outline-none focus:border-[#131314] transition-colors"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full border border-[rgba(19,19,20,0.16)] rounded-[10px] md:rounded-[12px] px-[16px] py-[14px] md:py-[16px] text-[14px] md:text-[16px] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] outline-none focus:border-[#131314] transition-colors"
                />
              </div>

              {error && <p className="text-[14px] text-[#ef4444]">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#131314] text-white py-[14px] md:py-[16px] rounded-[10px] md:rounded-[12px] font-medium text-[16px] md:text-[18px] hover:bg-[#2c2c2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Отправка..." : "Оформить заказ"}
              </button>

              <p className="text-[12px] md:text-[13px] text-[rgba(19,19,20,0.4)] text-center">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a href="/privacy" className="underline hover:text-[#131314]">
                  политикой конфиденциальности
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
