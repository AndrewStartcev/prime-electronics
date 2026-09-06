"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/shared/ui";
import { pickupPointsApi } from "@/shared/api/pickupPointsApi";

interface WorkingDay {
  enabled: boolean;
  from: string;
  to: string;
}

const DAYS = {
  Пн: "Понедельник",
  Вт: "Вторник",
  Ср: "Среда",
  Чт: "Четверг",
  Пт: "Пятница",
  Сб: "Суббота",
  Вс: "Воскресенье",
};

export default function NewPickupPointPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [workingSchedule, setWorkingSchedule] = useState<
    Record<string, WorkingDay>
  >({
    Пн: { enabled: true, from: "10:00", to: "22:00" },
    Вт: { enabled: true, from: "10:00", to: "22:00" },
    Ср: { enabled: true, from: "10:00", to: "22:00" },
    Чт: { enabled: true, from: "10:00", to: "22:00" },
    Пт: { enabled: true, from: "10:00", to: "22:00" },
    Сб: { enabled: true, from: "10:00", to: "22:00" },
    Вс: { enabled: false, from: "10:00", to: "22:00" },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Формируем объект workingSchedule только с включенными днями
      const schedule: Record<string, { from: string; to: string }> = {};
      Object.entries(workingSchedule).forEach(([key, value]) => {
        if (value.enabled) {
          schedule[key] = { from: value.from, to: value.to };
        }
      });

      const coords = `${latitude},${longitude}`;

      await pickupPointsApi.create({
        name,
        address,
        coords,
        workingSchedule: schedule,
        isActive,
      });

      router.push("/pickup-points");
    } catch (error) {
      console.error("Failed to create pickup point:", error);
      alert("Ошибка при создании точки самовывоза");
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingDay = (
    day: string,
    field: keyof WorkingDay,
    value: boolean | string,
  ) => {
    setWorkingSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-3">
        <Link href="/pickup-points">
          <button className="p-2 hover:bg-secondary-gray rounded-xl transition-colors mt-0.5">
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
          </button>
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Новая точка самовывоза
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Создание нового пункта выдачи
          </p>
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
                  <Input
                    label="Название точки"
                    placeholder="ТЦ Метрополис"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Адрес"
                    placeholder="Ленинградское шоссе, д. 16А"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Широта"
                      placeholder="55.8234"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                    <Input
                      label="Долгота"
                      placeholder="37.4971"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
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
                  {Object.entries(DAYS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 w-32">
                        <input
                          type="checkbox"
                          checked={workingSchedule[key].enabled}
                          onChange={(e) =>
                            updateWorkingDay(key, "enabled", e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-primary-black">
                          {label}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={workingSchedule[key].from}
                          onChange={(e) =>
                            updateWorkingDay(key, "from", e.target.value)
                          }
                          disabled={!workingSchedule[key].enabled}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50"
                        />
                        <span className="text-text-secondary-black">—</span>
                        <input
                          type="time"
                          value={workingSchedule[key].to}
                          onChange={(e) =>
                            updateWorkingDay(key, "to", e.target.value)
                          }
                          disabled={!workingSchedule[key].enabled}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Публикация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-black">Статус</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-primary-black">
                        Активна
                      </span>
                    </label>
                  </div>
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? "Создание..." : "Создать точку"}
                    </Button>
                    <Link href="/pickup-points">
                      <Button variant="outline" fullWidth type="button">
                        Отменить
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
