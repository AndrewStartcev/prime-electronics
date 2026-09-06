"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import {
  usePickupPoint,
  useUpdatePickupPoint,
  usePickupPointStock,
} from "@/shared/hooks";

export default function EditPickupPointPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: pickupPoint, isLoading, error } = usePickupPoint(id);
  const { data: stockData, isLoading: isLoadingStock } =
    usePickupPointStock(id);
  const updatePickupPoint = useUpdatePickupPoint();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    coords: "",
    workingSchedule: {} as Record<string, { from: string; to: string }>,
    url: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    coords: "",
  });

  useEffect(() => {
    if (pickupPoint) {
      // Parse coords from API response - it can be either coords string or coordinates object
      let coordsString = "";
      if ((pickupPoint as any).coords) {
        coordsString = (pickupPoint as any).coords;
      } else if (pickupPoint.coordinates) {
        coordsString = `${pickupPoint.coordinates.lat},${pickupPoint.coordinates.lng}`;
      }

      setFormData({
        name: pickupPoint.name || "",
        address: pickupPoint.address || "",
        coords: coordsString,
        workingSchedule: (pickupPoint as any).workingSchedule || {},
        url: (pickupPoint as any).url || "",
        isActive: pickupPoint.isActive !== false,
      });
    }
  }, [pickupPoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {
      name: "",
      address: "",
      coords: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Название точки обязательно";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Адрес обязателен";
    }

    if (!formData.coords.trim() || !formData.coords.includes(",")) {
      newErrors.coords = "Координаты обязательны (широта и долгота)";
    }

    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.name || newErrors.address || newErrors.coords) {
      return;
    }

    updatePickupPoint.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          router.push(`/pickup-points/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
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

  if (error || !pickupPoint) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Точка самовывоза не найдена
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить данные"
          message="Точка самовывоза не найдена или произошла ошибка при загрузке данных."
        />
        <Link href="/pickup-points">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const [lat, lng] = formData.coords.split(",");

  return (
    <div className="space-y-4 lg:space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Link
              href={`/pickup-points/${id}`}
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
                Редактировать точку самовывоза
              </h1>
              <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
                {pickupPoint.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/pickup-points/${id}`} className="flex-1 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto justify-center"
              >
                Отмена
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 sm:flex-none justify-center"
              disabled={updatePickupPoint.isPending}
            >
              {updatePickupPoint.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      label={
                        <span>
                          Название точки <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="ТЦ Метрополис"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors({ ...errors, name: "" });
                      }}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      label={
                        <span>
                          Адрес <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="г. Москва, улица Барклая, 6Ак1"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        setErrors({ ...errors, address: "" });
                      }}
                      required
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={
                          <span>
                            Широта <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="43.2380"
                        value={lat || ""}
                        onChange={(e) => {
                          const newLat = e.target.value;
                          setFormData({
                            ...formData,
                            coords: `${newLat},${lng || ""}`,
                          });
                          setErrors({ ...errors, coords: "" });
                        }}
                        required
                      />
                      <Input
                        label={
                          <span>
                            Долгота <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="76.9450"
                        value={lng || ""}
                        onChange={(e) => {
                          const newLng = e.target.value;
                          setFormData({
                            ...formData,
                            coords: `${lat || ""},${newLng}`,
                          });
                          setErrors({ ...errors, coords: "" });
                        }}
                        required
                      />
                    </div>
                    {errors.coords && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.coords}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary-black mt-2">
                      Введите координаты точки самовывоза. Вы можете получить их
                      на{" "}
                      <a
                        href="https://yandex.ru/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-orange hover:underline"
                      >
                        Яндекс.Картах
                      </a>{" "}
                      или{" "}
                      <a
                        href="https://www.google.com/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-orange hover:underline"
                      >
                        Google Maps
                      </a>
                    </p>
                  </div>

                  <Input
                    label="URL (необязательно)"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Обязательные поля</strong> отмечены{" "}
                      <span className="text-red-500">*</span>. Убедитесь, что
                      все обязательные поля заполнены перед сохранением.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Режим работы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekDays.map((day) => {
                    const schedule = formData.workingSchedule[day] || {
                      from: "10:00",
                      to: "22:00",
                    };
                    return (
                      <div
                        key={day}
                        className="flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        <span className="text-sm text-primary-black font-medium w-20">
                          {day}
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={schedule.from}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingSchedule: {
                                  ...formData.workingSchedule,
                                  [day]: {
                                    ...schedule,
                                    from: e.target.value,
                                  },
                                },
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
                          />
                          <span className="text-sm text-text-secondary-black">
                            —
                          </span>
                          <input
                            type="time"
                            value={schedule.to}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingSchedule: {
                                  ...formData.workingSchedule,
                                  [day]: { ...schedule, to: e.target.value },
                                },
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
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
                    Точка активна
                  </span>
                </label>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Товары на точке</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStock ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : stockData && stockData.length > 0 ? (
                  <div className="space-y-2">
                    {stockData.slice(0, 5).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-secondary-gray/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-black truncate">
                            {item.product?.name || "Товар"}
                          </p>
                          <p className="text-xs text-text-secondary-black">
                            SKU: {item.sku}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center justify-center min-w-8 px-2 py-1 rounded text-sm font-medium ${
                            item.stockCount === 0
                              ? "bg-red-100 text-red-700"
                              : item.stockCount <= 3
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.stockCount}
                        </span>
                      </div>
                    ))}
                    {stockData.length > 5 && (
                      <p className="text-xs text-text-secondary-black text-center pt-2">
                        И еще {stockData.length - 5} товаров
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary-black text-center py-4">
                    Товары не добавлены
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
