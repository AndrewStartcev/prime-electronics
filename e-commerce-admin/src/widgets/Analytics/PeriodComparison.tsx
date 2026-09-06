"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { usePeriodComparison } from "@/shared/hooks/useAnalytics";
import { cn } from "@/shared/lib/utils";

type Period = "day" | "week" | "month";

const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "day", label: "День" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

interface MetricCardProps {
  title: string;
  current: number;
  previous: number;
  change: number;
  format?: "currency" | "number";
}

function MetricCard({
  title,
  current,
  previous,
  change,
  format = "number",
}: MetricCardProps) {
  const isPositive = change >= 0;
  const fmt = format === "currency" ? formatCurrency : formatNumber;

  return (
    <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <p className="text-2xl font-bold text-primary-black tabular-nums">
        {fmt(current)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400 tabular-nums">
          Было: {fmt(previous)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500",
          )}
        >
          {isPositive ? (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 9V3M6 3L3 6M6 3L9 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 3V9M6 9L3 6M6 9L9 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function PeriodComparison() {
  const [period, setPeriod] = useState<Period>("month");
  const { data, isLoading, isError } = usePeriodComparison(period);

  return (
    <Card className="col-span-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <CardTitle>Сравнение периодов</CardTitle>
          {data && (
            <p className="text-sm text-gray-400 mt-1">{data.periodLabel}</p>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                period === tab.key
                  ? "bg-white text-primary-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="text-center py-8 text-gray-400">Ошибка загрузки</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Выручка"
            current={data.revenue.current}
            previous={data.revenue.previous}
            change={data.revenue.change}
            format="currency"
          />
          <MetricCard
            title="Заказы"
            current={data.orders.current}
            previous={data.orders.previous}
            change={data.orders.change}
          />
          <MetricCard
            title="Новые пользователи"
            current={data.newUsers.current}
            previous={data.newUsers.previous}
            change={data.newUsers.change}
          />
          <MetricCard
            title="Средний чек"
            current={data.avgOrderValue.current}
            previous={data.avgOrderValue.previous}
            change={data.avgOrderValue.change}
            format="currency"
          />
        </div>
      )}
    </Card>
  );
}
