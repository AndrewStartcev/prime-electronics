"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useDeliveryMethods } from "@/shared/hooks/useAnalytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      count: number;
      revenue: number;
      percentage: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-3 text-sm">
      <p className="font-medium text-primary-black mb-1">{d.label}</p>
      <p className="text-gray-500">Заказы: {d.count}</p>
      <p className="text-gray-500">Выручка: {formatCurrency(d.revenue)}</p>
    </div>
  );
}

const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent ?? 0) * 100;
  if (percentage < 5) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {percentage.toFixed(0)}%
    </text>
  );
}

export default function DeliveryMethodsChart() {
  const { data, isLoading, isError } = useDeliveryMethods();

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <p className="text-center py-12 text-gray-400">Ошибка загрузки</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <CardTitle>Способы доставки</CardTitle>
        <span className="text-sm text-gray-400">Всего: {data.total}</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.breakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                stroke="none"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.breakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3">
          {data.breakdown.map((item) => (
            <div
              key={item.method}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-primary-black">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-black">
                  {item.count} заказов
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
