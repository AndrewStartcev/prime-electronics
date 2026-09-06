"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AuthInput } from "@/features/auth/ui/AuthInput";
import { TelegramLoginButton } from "@/features/auth/ui/TelegramLoginButton";
import { usePhoneAuth } from "@/features/auth/hooks/usePhoneAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

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
    router.push("/account");
  });

  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [step]);

  useEffect(() => {
    if (code.length === 4 && step === "code") {
      handleVerifyCode();
    }
  }, [code, step, handleVerifyCode]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px] bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[20px] md:p-[40px]">
        <div className="flex flex-col gap-[20px] md:gap-[24px] w-full md:w-[520px] mx-auto">
          {step === "phone" ? (
            <form
              onSubmit={handleSendCode}
              className="flex flex-col gap-[20px] md:gap-[24px]"
            >
              <h1 className="font-medium text-[20px] md:text-[26px] leading-[1.3] text-[#131314] text-center w-full">
                Регистрация
              </h1>

              <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] text-center">
                Введите номер телефона, и мы отправим вам код подтверждения
              </p>

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

              {/* Switch to Login */}
              <Link
                href="/login"
                className="w-full bg-[#f5f5f7] rounded-[14px] p-[18px] md:p-[24px] flex flex-col sm:flex-row items-center justify-center gap-[4px] sm:gap-[14px]"
              >
                <span className="font-medium text-[16px] md:text-[18px] leading-[1.1] text-[#131314]">
                  Уже есть аккаунт?
                </span>
                <span className="font-medium text-[16px] md:text-[18px] leading-[1.1] text-[#ef6f2e] underline">
                  Войти
                </span>
              </Link>

              {/* Terms Text */}
              <p className="font-normal text-[14px] md:text-[16px] leading-[1.3] text-[rgba(19,19,20,0.4)] text-center">
                Нажимая на кнопку, вы соглашаетесь на{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="underline hover:text-[#131314]"
                >
                  обработку персональных данных
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
                  botName={
                    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ||
                    "prime_electronics_bot"
                  }
                  onSuccess={() => {
                    router.push("/account");
                  }}
                />
              </div>

              {/* Back to Home */}
              <div className="text-center">
                <Link
                  href="/"
                  className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
                >
                  ← Вернуться на главную
                </Link>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyCode}
              className="flex flex-col gap-[20px] md:gap-[24px]"
            >
              <h1 className="font-medium text-[20px] md:text-[26px] leading-[1.3] text-[#131314] text-center w-full">
                Введите код
              </h1>

              <p className="font-normal text-[14px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)] text-center">
                Код отправлен на номер{" "}
                <span className="text-[#131314] font-medium">{phone}</span>
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-[14px] p-[12px] md:p-[16px] text-red-600 text-[12px] md:text-[14px]">
                  {error}
                </div>
              )}

              {/* Code input */}
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
}
