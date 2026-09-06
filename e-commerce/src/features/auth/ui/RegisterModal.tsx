"use client";

import { memo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "./AuthInput";
import { TelegramLoginButton } from "./TelegramLoginButton";
import { CloseIcon } from "@/shared/ui";
import { useModal } from "@/shared/hooks";
import { usePhoneAuth } from "../hooks/usePhoneAuth";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal = memo(
  ({ isOpen, onClose }: RegisterModalProps) => {
    const router = useRouter();
    const { isVisible, isClosing, handleClose, handleBackdropClick } = useModal(
      isOpen,
      { onClose },
    );

    const {
      step,
      phone,
      setPhone,
      code,
      setCode,
      handleSendCode,
      handleVerifyCode,
      handleResendCode,
      handleBack,
      isLoading,
      error,
      resendTimer,
      canResend,
    } = usePhoneAuth(() => {
      handleClose();
      router.push("/account");
      router.refresh();
    });

    const codeInputRef = useRef<HTMLInputElement>(null);

    // Focus code input when step changes to "code"
    useEffect(() => {
      if (step === "code") {
        setTimeout(() => codeInputRef.current?.focus(), 100);
      }
    }, [step]);

    // Auto-submit when 4 digits entered
    useEffect(() => {
      if (code.length === 4 && step === "code") {
        handleVerifyCode();
      }
    }, [code, step, handleVerifyCode]);

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
          className={`relative bg-white rounded-[20px] shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto transition-all duration-300 ${
            isClosing
              ? "scale-95 opacity-0 translate-y-4"
              : "scale-100 opacity-100 translate-y-0"
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleClose();
            }}
            aria-label="Закрыть окно авторизации"
            className="absolute top-[16px] right-[16px] md:top-[20px] md:right-[20px] w-[24px] h-[24px] md:w-[30px] md:h-[30px] flex items-center justify-center text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors z-10"
          >
            <CloseIcon />
          </button>

          <div className="flex flex-col gap-[20px] md:gap-[24px] p-[20px] md:p-[40px] w-full md:w-[520px] mx-auto">
            {step === "phone" ? (
              /* Step 1: Phone number */
              <form
                onSubmit={handleSendCode}
                className="flex flex-col gap-[20px] md:gap-[24px]"
              >
                <h2 className="font-medium text-[20px] md:text-[26px] leading-[1.3] text-[#131314] text-center w-full">
                  Вход или регистрация
                </h2>

                <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] text-center">
                  Введите номер телефона, и мы отправим вам код подтверждения
                </p>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-[14px] p-[12px] md:p-[16px] text-red-600 text-[12px] md:text-[14px]">
                    {error}
                  </div>
                )}

                <AuthInput
                  label="Телефон"
                  placeholder="+7 ( ___ ) ___ - __ - __"
                  type="tel"
                  required
                  value={phone}
                  onChange={setPhone}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#131314] text-white rounded-[14px] p-[18px] md:p-[24px] font-normal text-[16px] md:text-[18px] leading-[1.1] hover:bg-[#2c2c2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Отправка..." : "Получить код"}
                </button>

                {/* Terms Text */}
                <p className="font-normal text-[14px] md:text-[16px] leading-[1.3] text-[rgba(19,19,20,0.4)] text-center">
                  Нажимая на кнопку, вы соглашаетесь на{" "}
                  <a href="/privacy" target="_blank" className="underline hover:text-[#131314]">
                    обработку персональных данных
                  </a>{" "}
                  и{" "}
                  <a href="/privacy" target="_blank" className="underline hover:text-[#131314]">
                    с публичной офертой
                  </a>
                </p>

                {/* Telegram Login */}
                <div className="flex flex-col items-center gap-[12px]">
                  <div className="flex items-center gap-[12px] w-full">
                    <div className="flex-1 h-[1px] bg-[rgba(19,19,20,0.1)]" />
                    <span className="font-normal text-[13px] md:text-[14px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
                      или
                    </span>
                    <div className="flex-1 h-[1px] bg-[rgba(19,19,20,0.1)]" />
                  </div>
                  <TelegramLoginButton
                    botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "prime_electronics_bot"}
                    onSuccess={() => {
                      handleClose();
                      router.push("/account");
                      router.refresh();
                    }}
                  />
                </div>
              </form>
            ) : (
              /* Step 2: Code verification */
              <form
                onSubmit={handleVerifyCode}
                className="flex flex-col gap-[20px] md:gap-[24px]"
              >
                <h2 className="font-medium text-[20px] md:text-[26px] leading-[1.3] text-[#131314] text-center w-full">
                  Введите код
                </h2>

                <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] text-center">
                  Код отправлен на номер{" "}
                  <span className="text-[#131314] font-medium">{phone}</span>
                </p>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-[14px] p-[12px] md:p-[16px] text-red-600 text-[12px] md:text-[14px]">
                    {error}
                  </div>
                )}

                {/* Code input - 4 digit */}
                <div className="flex flex-col gap-[12px] items-center">
                  <div className="flex items-center justify-center gap-[10px]">
                    <input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={4}
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setCode(val);
                      }}
                      placeholder="0000"
                      className="w-[200px] text-center font-medium text-[32px] md:text-[40px] leading-[1] tracking-[0.3em] text-[#131314] placeholder:text-[rgba(19,19,20,0.15)] outline-none bg-transparent border-b-2 border-[rgba(19,19,20,0.16)] focus:border-[#131314] transition-colors py-[8px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.length < 4}
                  className="w-full bg-[#131314] text-white rounded-[14px] p-[18px] md:p-[24px] font-normal text-[16px] md:text-[18px] leading-[1.1] hover:bg-[#2c2c2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Проверка..." : "Подтвердить"}
                </button>

                {/* Resend & Back */}
                <div className="flex flex-col items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend}
                    className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[#131314] underline hover:text-[#ef6f2e] transition-colors disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0
                      ? `Отправить повторно через ${resendTimer} сек`
                      : "Отправить код повторно"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
                  >
                    Изменить номер
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  },
);

RegisterModal.displayName = "RegisterModal";
