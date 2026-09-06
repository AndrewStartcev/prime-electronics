"use client";

import { memo, useEffect } from "react";
import { useModal } from "@/shared/hooks";
import { CloseIcon } from "@/shared/ui";
import { useQuickBuyForm } from "../hooks/useQuickBuyForm";
import { CONTACT_PHONE_DISPLAY } from "@/shared/lib/contactInfo";

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
  productPrice?: number;
  cartItemOptions?: {
    variantKey?: string;
    variantLabel?: string;
  };
}

export const QuickBuyModal = memo(
  ({
    isOpen,
    onClose,
    productId,
    productName,
    productPrice,
    cartItemOptions,
  }: QuickBuyModalProps) => {
    const { isVisible, isClosing, handleClose, handleBackdropClick } = useModal(
      isOpen,
      { onClose },
    );

    const {
      formData,
      setName,
      setPhone,
      handleSubmit,
      isLoading,
      error,
      success,
      reset,
    } = useQuickBuyForm({
      productId,
      cartItemOptions,
      onSuccess: () => {
        handleClose();
      },
    });

    // Block body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
      if (!isOpen) {
        reset();
      }
    }, [isOpen, reset]);

    if (!isOpen && !isVisible) return null;

    return (
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Modal */}
        <div
          className={`relative bg-white rounded-[16px] md:rounded-[20px] shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transition-all duration-300 ${
            isClosing
              ? "scale-95 opacity-0 translate-y-4"
              : "scale-100 opacity-100 translate-y-0"
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-[16px] right-[16px] md:top-[20px] md:right-[20px] w-[24px] h-[24px] md:w-[30px] md:h-[30px] flex items-center justify-center text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors z-10"
          >
            <CloseIcon />
          </button>

          {success ? (
            <div className="flex flex-col items-center gap-[20px] p-[40px] md:p-[48px]">
              <div className="w-[64px] h-[64px] bg-[#22c55e] rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-[20px] md:text-[24px] text-[#131314] mb-[8px]">
                  Заказ успешно оформлен!
                </h3>
                <p className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.6)]">
                  Наш менеджер свяжется с вами в ближайшее время
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[20px] md:gap-[24px] p-[24px] md:p-[32px]"
            >
              {/* Title */}
              <div className="text-center">
                <h2 className="font-medium text-[20px] md:text-[26px] leading-[1.3] text-[#131314] mb-[8px]">
                  Купить в 1 клик
                </h2>
                <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                  Оставьте свои контакты, и мы свяжемся с вами
                </p>
              </div>

              {/* Product Info */}
              {productName && (
                <div className="bg-[#f5f5f7] rounded-[12px] p-[16px]">
                  <div className="text-[14px] md:text-[15px] text-[#131314] font-medium mb-[4px]">
                    {productName}
                  </div>
                  {productPrice && (
                    <div className="text-[16px] md:text-[18px] font-medium text-[#ef6f2e]">
                      {productPrice.toLocaleString("ru-RU")} ₽
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-[12px] p-[12px] md:p-[14px] text-red-600 text-[13px] md:text-[14px]">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div className="flex flex-col gap-[14px]">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                    Ваше имя <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="w-full px-[16px] py-[14px] md:py-[16px] bg-[#f5f5f7] rounded-[12px] text-[14px] md:text-[15px] text-[#131314] placeholder:text-[rgba(19,19,20,0.3)] focus:outline-none focus:ring-2 focus:ring-[#ef6f2e] transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={CONTACT_PHONE_DISPLAY}
                    className="w-full px-[16px] py-[14px] md:py-[16px] bg-[#f5f5f7] rounded-[12px] text-[14px] md:text-[15px] text-[#131314] placeholder:text-[rgba(19,19,20,0.3)] focus:outline-none focus:ring-2 focus:ring-[#ef6f2e] transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ef6f2e] hover:bg-[#d96328] disabled:bg-[rgba(19,19,20,0.2)] text-white px-[24px] py-[16px] md:py-[18px] rounded-[60px] font-medium text-[15px] md:text-[16px] transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? "Оформление заказа..." : "Оформить заказ"}
              </button>

              {/* Info Text */}
              <p className="text-[12px] md:text-[13px] text-[rgba(19,19,20,0.5)] text-center leading-[1.5]">
                Нажимая кнопку, вы соглашаетесь с условиями{" "}
                <a
                  href="/privacy"
                  className="text-[#ef6f2e] hover:underline"
                  target="_blank"
                >
                  политики конфиденциальности
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  },
);

QuickBuyModal.displayName = "QuickBuyModal";
