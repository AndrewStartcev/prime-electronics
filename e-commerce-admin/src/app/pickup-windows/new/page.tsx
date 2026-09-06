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
import { usePickupPoints } from "@/shared/hooks/usePickupPoints";
import { useCreatePickupWindow } from "@/shared/hooks/usePickupWindows";
import { toast } from "sonner";

export default function NewPickupWindowPage() {
  const router = useRouter();
  const { data: pickupPointsData, isLoading: isLoadingPoints } =
    usePickupPoints();
  const createWindow = useCreatePickupWindow();

  const [recurring, setRecurring] = useState(false);
  const [formData, setFormData] = useState({
    pointId: "",
    startTime: "10:00",
    endTime: "12:00",
    capacity: 10,
    date: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [weekDays, setWeekDays] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);
  const [errors, setErrors] = useState({
    pointId: "",
    date: "",
    dateRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickupPoints = pickupPointsData?.data || [];
  const selectedPoint = pickupPoints.find((p) => p.id === formData.pointId);

  const handleSubmit = async () => {
    // Validate form
    const newErrors = {
      pointId: "",
      date: "",
      dateRange: "",
    };

    if (!formData.pointId) {
      newErrors.pointId = "Выберите точку самовывоза";
    }

    if (!recurring && !formData.date) {
      newErrors.date = "Укажите дату";
    }

    if (recurring && (!formData.startDate || !formData.endDate)) {
      newErrors.dateRange = "Укажите период";
    }

    if (recurring && formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.dateRange = "Дата начала должна быть раньше даты окончания";
      }
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!recurring) {
        // Single window
        const dateTime = new Date(formData.date);
        const [startHours, startMinutes] = formData.startTime
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = formData.endTime.split(":").map(Number);

        const startTime = new Date(dateTime);
        startTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = new Date(dateTime);
        endTime.setHours(endHours, endMinutes, 0, 0);

        await createWindow.mutateAsync({
          pointId: formData.pointId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          capacity: formData.capacity,
        });

        toast.success("Окно самовывоза создано");
        router.push("/pickup-windows");
      } else {
        // Recurring windows
        const selectedDays = weekDays
          .map((selected, index) => (selected ? index : -1))
          .filter((day) => day !== -1);

        if (selectedDays.length === 0) {
          toast.error("Выберите хотя бы один день недели");
          setIsSubmitting(false);
          return;
        }

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const windows = [];

        // Generate windows for selected days
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const dayOfWeek = date.getDay();
          // Convert Sunday (0) to 6, Monday (1) to 0, etc.
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

          if (selectedDays.includes(adjustedDay)) {
            const [startHours, startMinutes] = formData.startTime
              .split(":")
              .map(Number);
            const [endHours, endMinutes] = formData.endTime
              .split(":")
              .map(Number);

            const startTime = new Date(date);
            startTime.setHours(startHours, startMinutes, 0, 0);

            const endTime = new Date(date);
            endTime.setHours(endHours, endMinutes, 0, 0);

            windows.push({
              pointId: formData.pointId,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              capacity: formData.capacity,
            });
          }
        }

        // Create all windows
        await Promise.all(
          windows.map((window) => createWindow.mutateAsync(window)),
        );

        toast.success(`Создано ${windows.length} окон самовывоза`);
        router.push("/pickup-windows");
      }
    } catch (error: any) {
      console.error("Error creating pickup window:", error);
      toast.error(
        error?.response?.data?.message || "Ошибка при создании окна самовывоза",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeekDayToggle = (index: number) => {
    const newWeekDays = [...weekDays];
    newWeekDays[index] = !newWeekDays[index];
    setWeekDays(newWeekDays);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/pickup-windows"
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
              Новое окно самовывоза
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              Создайте временной слот для самовывоза
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/pickup-windows" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-center"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </Link>
          <Button
            variant="primary"
            className="flex-1 sm:flex-none justify-center"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingPoints}
          >
            {isSubmitting ? "Создание..." : "Создать"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Точка самовывоза</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary-black">
                  Выберите точку <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all ${
                    errors.pointId ? "border-red-500" : "border-gray-200"
                  }`}
                  value={formData.pointId}
                  onChange={(e) => {
                    setFormData({ ...formData, pointId: e.target.value });
                    setErrors({ ...errors, pointId: "" });
                  }}
                  disabled={isLoadingPoints}
                >
                  <option value="">
                    {isLoadingPoints
                      ? "Загрузка..."
                      : "Выберите точку самовывоза"}
                  </option>
                  {pickupPoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
                {errors.pointId && (
                  <p className="text-xs text-red-500 mt-1">{errors.pointId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Время</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Время начала
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Время окончания
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </div>
                </div>

                <Input
                  label="Максимальное количество заказов"
                  type="number"
                  placeholder="10"
                  value={formData.capacity.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  helperText="Максимум заказов, которые можно выдать в это окно"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Период</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      !recurring
                        ? "border-primary-orange bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="period"
                      value="single"
                      checked={!recurring}
                      onChange={() => setRecurring(false)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                    />
                    <div>
                      <p className="text-sm font-medium text-primary-black">
                        Одна дата
                      </p>
                      <p className="text-xs text-text-secondary-black">
                        Создать окно на конкретный день
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      recurring
                        ? "border-primary-orange bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="period"
                      value="recurring"
                      checked={recurring}
                      onChange={() => setRecurring(true)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                    />
                    <div>
                      <p className="text-sm font-medium text-primary-black">
                        Повторяющееся
                      </p>
                      <p className="text-xs text-text-secondary-black">
                        Создать окна на период
                      </p>
                    </div>
                  </label>
                </div>

                {!recurring ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary-black">
                      Дата <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setErrors({ ...errors, date: "" });
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                        errors.date ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-primary-black">
                          Дата начала <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            });
                            setErrors({ ...errors, dateRange: "" });
                          }}
                          min={new Date().toISOString().split("T")[0]}
                          className={`w-full px-4 py-3 rounded-xl border bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                            errors.dateRange
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-primary-black">
                          Дата окончания <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            });
                            setErrors({ ...errors, dateRange: "" });
                          }}
                          min={
                            formData.startDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          className={`w-full px-4 py-3 rounded-xl border bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                            errors.dateRange
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                    </div>
                    {errors.dateRange && (
                      <p className="text-xs text-red-500">{errors.dateRange}</p>
                    )}

                    <div>
                      <label className="text-sm font-medium text-primary-black mb-3 block">
                        Дни недели
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(
                          (day, index) => (
                            <label key={day} className="cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={weekDays[index]}
                                onChange={() => handleWeekDayToggle(index)}
                              />
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-sm text-primary-black peer-checked:bg-primary-orange peer-checked:text-white peer-checked:border-primary-orange transition-colors">
                                {day}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}
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
                <span className="text-sm text-primary-black">Окно активно</span>
              </label>
              <p className="text-xs text-text-secondary-black mt-2">
                Неактивные окна не будут доступны для выбора
              </p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Сводка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Точка</span>
                  <span className="text-primary-black font-medium">
                    {selectedPoint ? selectedPoint.name : "Не выбрана"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Время</span>
                  <span className="text-primary-black font-medium">
                    {formData.startTime} — {formData.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Вместимость</span>
                  <span className="text-primary-black font-medium">
                    {formData.capacity} заказов
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Тип</span>
                  <span className="text-primary-black font-medium">
                    {recurring ? "Повторяющееся" : "Разовое"}
                  </span>
                </div>
                {!recurring && formData.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary-black">Дата</span>
                    <span className="text-primary-black font-medium">
                      {new Date(formData.date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                )}
                {recurring && formData.startDate && formData.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary-black">Период</span>
                    <span className="text-primary-black font-medium text-right">
                      {new Date(formData.startDate).toLocaleDateString("ru-RU")}{" "}
                      — {new Date(formData.endDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="pt-0">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Совет</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Используйте повторяющиеся окна для автоматического
                      создания слотов на регулярной основе
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
