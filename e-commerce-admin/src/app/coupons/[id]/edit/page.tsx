"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { useCoupon, useUpdateCoupon } from "@/shared/hooks";
import { useState, useEffect } from "react";
import { ArrowLeftIcon } from "lucide-react";
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

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: coupon, isLoading, error } = useCoupon(id);
  const updateCoupon = useUpdateCoupon();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 0,
    minOrderAmount: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (coupon) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "PERCENTAGE",
        discountValue: coupon.discountValue || 0,
        minOrderAmount: coupon.minOrderAmount?.toString() || "",
        maxUses: coupon.maxUses?.toString() || "",
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().split("T")[0]
          : "",
        endDate: coupon.endDate
          ? new Date(coupon.endDate).toISOString().split("T")[0]
          : "",
        isActive: coupon.isActive !== false,
      });
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const discountValue = Number(formData.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error("Введите корректный размер скидки");
      return;
    }

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

    const data = {
      code: formData.code,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      isActive: formData.isActive,
    };

    updateCoupon.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Купон обновлен");
          router.push(`/coupons/${id}`);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Ошибка при сохранении купона"));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </div>
        <Card>
          <CardContent>
            <TableSkeleton rows={8} columns={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Купон не найден
          </h1>
          <p className="text-sm text-text-secondary-black mt-1">
            Купон с указанным ID не существует
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <ErrorMessage
              title="Купон не найден"
              message="Купон с указанным ID не существует или был удален"
            />
            <div className="flex justify-center mt-4">
              <Link href="/coupons">
                <Button variant="outline">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Вернуться к купонам
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/coupons/${id}`}>
          <Button variant="outline" size="sm" className="shrink-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Редактировать купон
          </h1>
          <p className="text-sm text-text-secondary-black mt-1">
            Изменение информации о купоне {coupon.code}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Код купона *
                </label>
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="SUMMER2024"
                  required
                  className="uppercase"
                />
              </div>

              <div>
                <label
                  htmlFor="isActive"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Статус
                </label>
                <div className="flex items-center h-10">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Активен
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Описание купона"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Скидка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Тип скидки *
                </label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="PERCENTAGE">Процент</option>
                  <option value="FIXED">Фиксированная сумма</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Размер скидки *
                </label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: Number(e.target.value),
                    })
                  }
                  placeholder={
                    formData.discountType === "PERCENTAGE"
                      ? "10 (для 10%)"
                      : "1000 (для 1000₽)"
                  }
                  min="0"
                  step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="minOrderAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Минимальная сумма заказа (₽)
              </label>
              <Input
                id="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderAmount: e.target.value })
                }
                placeholder="Не установлена"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ограничения и период действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="maxUses"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Максимальное количество использований
              </label>
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
                placeholder="Неограниченно"
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Дата начала
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Дата окончания
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link href={`/coupons/${id}`}>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateCoupon.isPending}
            className="w-full sm:w-auto"
          >
            Сохранить изменения
          </Button>
        </div>
      </form>
    </div>
  );
}
