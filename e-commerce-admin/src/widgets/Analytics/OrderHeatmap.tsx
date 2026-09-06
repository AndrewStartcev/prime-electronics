"use client";

import { useMemo } from "react";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useOrderHeatmap } from "@/shared/hooks/useAnalytics";
import { cn } from "@/shared/lib/utils";

function getHeatColor(count: number, maxValue: number): string {
  if (count === 0) return "bg-gray-50";
  const intensity = count / maxValue;
  if (intensity < 0.15) return "bg-orange-50";
  if (intensity < 0.3) return "bg-orange-100";
  if (intensity < 0.5) return "bg-orange-200";
  if (intensity < 0.7) return "bg-orange-300";
  if (intensity < 0.85) return "bg-orange-400";
  return "bg-primary-orange";
}

function getTextColor(count: number, maxValue: number): string {
  if (count === 0) return "text-gray-300";
  const intensity = count / maxValue;
  if (intensity < 0.5) return "text-orange-700";
  return "text-white";
}

export default function OrderHeatmap() {
  const { data, isLoading, isError } = useOrderHeatmap();

  const hours = useMemo(() => {
    const h = [];
    for (let i = 0; i < 24; i++) h.push(i);
    return h;
  }, []);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="col-span-full">
        <p className="text-center py-12 text-gray-400">Ошибка загрузки</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-full" padding="none">
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle>Тепловая карта заказов</CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Активность по дням и часам (30 дней)
          </p>
        </div>
        <span className="text-sm text-gray-400">
          Всего:{" "}
          <span className="font-semibold text-primary-black">
            {data.totalOrders}
          </span>{" "}
          заказов
        </span>
      </div>

      <div className="px-6 pb-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1">
            <div className="w-12 flex-shrink-0" />
            {hours.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px] text-gray-400 tabular-nums"
              >
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {data.data.map((dayData) => {
              const hourMap = new Map(
                dayData.hours.map((h) => [h.hour, h.count]),
              );
              return (
                <div key={dayData.dayIndex} className="flex items-center gap-1">
                  <div className="w-12 flex-shrink-0 text-xs font-medium text-gray-500 text-right pr-2">
                    {dayData.day}
                  </div>
                  {hours.map((h) => {
                    const count = hourMap.get(h) || 0;
                    return (
                      <div
                        key={h}
                        className={cn(
                          "flex-1 aspect-square rounded-[4px] flex items-center justify-center text-[9px] font-semibold transition-all cursor-default",
                          getHeatColor(count, data.maxValue),
                          getTextColor(count, data.maxValue),
                        )}
                        title={`${dayData.day} ${h}:00 — ${count} заказов`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-4">
            <span className="text-[10px] text-gray-400 mr-1">Меньше</span>
            <div className="w-4 h-4 rounded-sm bg-gray-50 border border-gray-100" />
            <div className="w-4 h-4 rounded-sm bg-orange-100" />
            <div className="w-4 h-4 rounded-sm bg-orange-200" />
            <div className="w-4 h-4 rounded-sm bg-orange-300" />
            <div className="w-4 h-4 rounded-sm bg-orange-400" />
            <div className="w-4 h-4 rounded-sm bg-primary-orange" />
            <span className="text-[10px] text-gray-400 ml-1">Больше</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
