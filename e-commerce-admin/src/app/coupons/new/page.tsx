"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/shared/ui";
import { useCreateCoupon } from "@/shared/hooks";
import type { DiscountType } from "@/shared/api/couponsApi";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;

  const responseMessage = (
    error as { response?: { data?: { message?: unknown } } }
  ).response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.map((item) => String(item)).join(", ");
  }

  if (responseMessage !== undefined && responseMessage !== null) {
    return String(responseMessage);
  }

  const message = (error as { message?: unknown }).message;
  return message ? String(message) : fallback;
}

function generateCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function NewCouponPage() {
  const router = useRouter();
  const createCoupon = useCreateCoupon();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    usesPerUser: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleGenerateCode = () => {
    setFormData({ ...formData, code: generateCode() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Введите код купона");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Введите размер скидки");
      return;
    }

    const discountValue = Number(formData.discountValue);
    if (formData.discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Процент скидки не может быть больше 100");
      return;
    }

    const minOrderAmount = formData.minOrderAmount
      ? Number(formData.minOrderAmount)
      : undefined;
    if (
      minOrderAmount !== undefined &&
      (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)
    ) {
      toast.error("Минимальная сумма заказа не может быть меньше 0");
      return;
    }

    const maxUses = formData.maxUses ? Number(formData.maxUses) : undefined;
    if (maxUses !== undefined && (!Number.isFinite(maxUses) || maxUses < 0)) {
      toast.error("Лимит использований не может быть меньше 0");
      return;
    }

    const usesPerUser = formData.usesPerUser
      ? Number(formData.usesPerUser)
      : undefined;
    if (
      usesPerUser !== undefined &&
      (!Number.isFinite(usesPerUser) || usesPerUser < 0)
    ) {
      toast.error("Лимит на пользователя не может быть меньше 0");
      return;
    }

    createCoupon.mutate(
      {
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        usesPerUser,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isActive: formData.isActive,
      },
      {
        onSuccess: () => {
          toast.success("Купон создан");
          router.push("/coupons");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Ошибка при создании купона"));
        },
      }
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/coupons"
            className="p-2 hover:bg-secondary-gray rounded-lg transition-colors mt-0.5"
          >
            <svg
              className="w-5 h-5 text-primary-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
              Новый купон
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              Создайте промокод для клиентов
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/coupons" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-center"
              type="button"
            >
              Отмена
            </Button>
          </Link>
          <Button
            variant="primary"
            className="flex-1 sm:flex-none justify-center"
            onClick={handleSubmit}
            isLoading={createCoupon.isPending}
          >
            Создать купон
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Код купона"
                      placeholder="SALE2025"
                      required
                      helperText="Латинские буквы и цифры, без пробелов"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={handleGenerateCode}
                      >
                        Сгенерировать код
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Описание (для администратора)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all min-h-20 resize-y"
                      placeholder="Описание купона..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Скидка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label
                      className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        formData.discountType === "PERCENTAGE"
                          ? "border-primary-orange bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="PERCENTAGE"
                        checked={formData.discountType === "PERCENTAGE"}
                        onChange={() =>
                          setFormData({ ...formData, discountType: "PERCENTAGE" })
                        }
                        className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary-black">
                          Процентная скидка
                        </p>
                        <p className="text-xs text-text-secondary-black">
                          % от суммы заказа
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        formData.discountType === "FIXED"
                          ? "border-primary-orange bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="FIXED"
                        checked={formData.discountType === "FIXED"}
                        onChange={() =>
                          setFormData({ ...formData, discountType: "FIXED" })
                        }
                        className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary-black">
                          Фиксированная сумма
                        </p>
                        <p className="text-xs text-text-secondary-black">
                          ₽ от суммы заказа
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={
                        formData.discountType === "PERCENTAGE"
                          ? "Размер скидки (%)"
                          : "Размер скидки (₽)"
                      }
                      type="number"
                      placeholder={
                        formData.discountType === "PERCENTAGE" ? "10" : "500"
                      }
                      required
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Минимальная сумма заказа (₽)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1000"
                      helperText="0 = без ограничения"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ограничения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Лимит использований (всего)"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="100"
                      helperText="0 = без ограничения"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                    />
                    <Input
                      label="Лимит на пользователя"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1"
                      helperText="Сколько раз один пользователь может использовать"
                      value={formData.usesPerUser}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usesPerUser: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                  />
                  <span className="text-sm text-primary-black">
                    Купон активен
                  </span>
                </label>
              </CardContent>
            </Card>

            {/* Validity Period */}
            <Card>
              <CardHeader>
                <CardTitle>Период действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Дата начала
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Дата окончания
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-text-secondary-black">
                    Оставьте пустым для бессрочного купона
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Предпросмотр</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-primary-orange to-orange-400 rounded-xl text-white">
                  <p className="text-xs opacity-80">Промокод</p>
                  <p className="text-lg font-bold tracking-wider mt-1">
                    {formData.code || "CODE"}
                  </p>
                  <p className="text-sm mt-2">
                    {formData.discountType === "PERCENTAGE"
                      ? `Скидка ${formData.discountValue || "0"}%`
                      : `Скидка ${formData.discountValue || "0"} ₽`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
