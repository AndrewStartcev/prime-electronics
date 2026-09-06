"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { apiClient } from "@/shared/api/apiClient";
import { formatPhone } from "@/shared/lib/formatPhone";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim()) newErrors.email = true;
    if (!formData.message.trim()) newErrors.message = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await apiClient.post("/users/form", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim(),
      });
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined;

      setSubmitError(
        (Array.isArray(message) ? message.join(", ") : message) ||
          "Не удалось отправить сообщение. Попробуйте позже.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f5f5f7] rounded-[20px] md:rounded-[24px] p-[24px] md:p-[32px] lg:p-[40px] flex flex-col gap-[20px] md:gap-[24px]"
    >
      <div className="flex flex-col gap-[8px]">
        <label
          htmlFor="name"
          className="font-medium text-[15px] md:text-[16px] text-[#131314]"
        >
          Имя *
        </label>
        {errors.name && (
          <span className="bg-[#ff3b30] text-white text-[13px] md:text-[14px] font-medium px-[12px] py-[6px] rounded-[8px] w-fit">
            Заполните поле
          </span>
        )}
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (e.target.value.trim())
              setErrors((prev) => ({ ...prev, name: false }));
          }}
          className={`bg-white rounded-[12px] px-[16px] md:px-[20px] py-[14px] md:py-[16px] font-normal text-[15px] md:text-[16px] text-[#131314] border ${errors.name ? "border-[#ff3b30]" : "border-[rgba(19,19,20,0.1)]"} focus:border-[#ef6f2e] focus:outline-none transition-colors`}
          placeholder="Введите ваше имя"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="email"
            className="font-medium text-[15px] md:text-[16px] text-[#131314]"
          >
            Email *
          </label>
          {errors.email && (
            <span className="bg-[#ff3b30] text-white text-[13px] md:text-[14px] font-medium px-[12px] py-[6px] rounded-[8px] w-fit">
              Заполните поле
            </span>
          )}
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (e.target.value.trim())
                setErrors((prev) => ({ ...prev, email: false }));
            }}
            className={`bg-white rounded-[12px] px-[16px] md:px-[20px] py-[14px] md:py-[16px] font-normal text-[15px] md:text-[16px] text-[#131314] border ${errors.email ? "border-[#ff3b30]" : "border-[rgba(19,19,20,0.1)]"} focus:border-[#ef6f2e] focus:outline-none transition-colors`}
            placeholder="example@mail.ru"
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="phone"
            className="font-medium text-[15px] md:text-[16px] text-[#131314]"
          >
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: formatPhone(e.target.value),
              })
            }
            className="bg-white rounded-[12px] px-[16px] md:px-[20px] py-[14px] md:py-[16px] font-normal text-[15px] md:text-[16px] text-[#131314] border border-[rgba(19,19,20,0.1)] focus:border-[#ef6f2e] focus:outline-none transition-colors"
            placeholder="+7 (___) ___-__-__"
          />
        </div>
      </div>
      <div className="flex flex-col gap-[8px]">
        <label
          htmlFor="message"
          className="font-medium text-[15px] md:text-[16px] text-[#131314]"
        >
          Сообщение *
        </label>
        {errors.message && (
          <span className="bg-[#ff3b30] text-white text-[13px] md:text-[14px] font-medium px-[12px] py-[6px] rounded-[8px] w-fit">
            Заполните поле
          </span>
        )}
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (e.target.value.trim())
              setErrors((prev) => ({ ...prev, message: false }));
          }}
          rows={6}
          className={`bg-white rounded-[12px] px-[16px] md:px-[20px] py-[14px] md:py-[16px] font-normal text-[15px] md:text-[16px] text-[#131314] border ${errors.message ? "border-[#ff3b30]" : "border-[rgba(19,19,20,0.1)]"} focus:border-[#ef6f2e] focus:outline-none transition-colors resize-none`}
          placeholder="Опишите ваш вопрос или пожелание"
        />
      </div>
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-[12px] md:p-[16px] text-red-600 text-[13px] md:text-[14px]">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-[12px] p-[12px] md:p-[16px] text-green-600 text-[13px] md:text-[14px]">
          Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее
          время.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || submitSuccess}
        className="bg-[#ef6f2e] text-white font-medium text-[16px] md:text-[17px] lg:text-[18px] px-[32px] md:px-[40px] py-[14px] md:py-[16px] lg:py-[18px] rounded-[60px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "Отправка..."
          : submitSuccess
            ? "Отправлено"
            : "Отправить сообщение"}
      </button>
    </form>
  );
}
