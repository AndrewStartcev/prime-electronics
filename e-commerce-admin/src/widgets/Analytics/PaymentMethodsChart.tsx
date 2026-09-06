"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { usePaymentMethods } from "@/shared/hooks/useAnalytics";

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
      <p className="text-gray-500">Доля: {d.percentage.toFixed(1)}%</p>
    </div>
  );
}

export default function PaymentMethodsChart() {
  const { data, isLoading, isError } = usePaymentMethods();

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-44 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
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
        <CardTitle>Способы оплаты</CardTitle>
        <span className="text-sm text-gray-400">Всего: {data.total}</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data.breakdown}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            horizontal={false}
          />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 13, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
            {data.breakdown.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
        {data.breakdown.map((item) => (
          <div
            key={item.method}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.label}</span>
            </div>
            <span className="font-medium text-primary-black">
              {formatCurrency(item.revenue)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
