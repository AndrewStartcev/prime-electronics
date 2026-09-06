"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { useCoupon, useDeleteCoupon } from "@/shared/hooks";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react";

export default function CouponDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: coupon, isLoading, error } = useCoupon(id);
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = async () => {
    if (confirm("Вы уверены, что хотите удалить этот купон?")) {
      deleteCoupon.mutate(id, {
        onSuccess: () => {
          router.push("/coupons");
        },
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/coupons">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
              Купон: {coupon.code}
            </h1>
            <p className="text-sm text-text-secondary-black mt-1">
              Подробная информация о купоне
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/coupons/${id}/edit`}>
            <Button variant="outline" className="w-full lg:w-auto">
              <PencilIcon className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteCoupon.isPending}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Код купона
                </label>
                <code className="block mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono">
                  {coupon.code}
                </code>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Статус
                </label>
                <div className="mt-1">
                  <Badge
                    variant={coupon.isActive ? "success" : "default"}
                    className="text-sm"
                  >
                    {coupon.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              </div>
            </div>

            {coupon.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Описание
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {coupon.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Тип скидки
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {coupon.discountType === "PERCENTAGE"
                    ? "Процент"
                    : "Фиксированная сумма"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Размер скидки
                </label>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue?.toLocaleString("ru-RU") || 0} ₽`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Минимальная сумма заказа
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {coupon.minOrderAmount
                    ? `${coupon.minOrderAmount.toLocaleString("ru-RU")} ₽`
                    : "Не установлена"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Использований
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {coupon.usedCount || 0}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Дата начала
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(coupon.startDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Дата окончания
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(coupon.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                Использований
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {coupon.usedCount || 0}
              </p>
              {coupon.maxUses && (
                <p className="text-xs text-blue-600 mt-1">
                  из {coupon.maxUses} максимальных
                </p>
              )}
            </div>

            {coupon.maxUses && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                  Осталось использований
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {coupon.maxUses - (coupon.usedCount || 0)}
                </p>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Создан:</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(coupon.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Обновлен:</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(coupon.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
