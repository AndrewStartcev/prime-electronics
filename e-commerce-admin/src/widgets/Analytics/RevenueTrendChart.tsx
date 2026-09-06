"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useRevenueTrend } from "@/shared/hooks/useAnalytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-3 text-sm">
      <p className="font-medium text-primary-black mb-1.5">
        {label ? formatDate(label) : ""}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">
            {entry.dataKey === "revenue" ? "Выручка" : "Заказы"}:
          </span>
          <span className="font-medium text-primary-black">
            {entry.dataKey === "revenue"
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueTrendChart({ days = 30 }: { days?: number }) {
  const { data, isLoading, isError } = useRevenueTrend(days);

  const chartData = useMemo(() => {
    if (!data?.trend) return [];
    return data.trend.map((p) => ({
      ...p,
      dateFormatted: formatDate(p.date),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-xl" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="col-span-full">
        <p className="text-center py-12 text-gray-400">
          Не удалось загрузить данные
        </p>
      </Card>
    );
  }

  const { summary } = data;

  return (
    <Card className="col-span-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <CardTitle>Динамика выручки</CardTitle>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-gray-400">Всего выручка</span>
            <span className="font-bold text-primary-black text-lg">
              {formatCurrency(summary.totalRevenue)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400">Ср. в день</span>
            <span className="font-bold text-primary-black text-lg">
              {formatCurrency(summary.avgDailyRevenue)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400">Всего заказов</span>
            <span className="font-bold text-primary-black text-lg">
              {summary.totalOrders}
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef6f2e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef6f2e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}к` : String(v)
            }
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) =>
              value === "revenue" ? "Выручка" : "Заказы"
            }
            iconType="circle"
            wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#ef6f2e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{ r: 5, fill: "#ef6f2e", strokeWidth: 0 }}
          />
          <Area
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {summary.peakDay && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Пик продаж:{" "}
            <span className="font-medium text-primary-black">
              {formatDate(summary.peakDay.date)}
            </span>{" "}
            — {formatCurrency(summary.peakDay.revenue)} (
            {summary.peakDay.orders} заказов)
          </p>
        </div>
      )}
    </Card>
  );
}
