"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardTitle } from "@/shared/ui/Card/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useOrderStatus } from "@/shared/hooks/useAnalytics";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { label: string; count: number; percentage: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-3 text-sm">
      <p className="font-medium text-primary-black">{d.label}</p>
      <p className="text-gray-500">
        {d.count} заказов ({d.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

export default function OrderStatusChart() {
  const { data, isLoading, isError } = useOrderStatus();

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="flex items-center justify-center">
          <Skeleton className="h-52 w-52 rounded-full" />
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
        <CardTitle>Статусы заказов</CardTitle>
        <span className="text-sm text-gray-400">Всего: {data.total}</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="w-52 h-52 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.distribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {data.distribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2">
          {data.distribution.map((item) => (
            <div key={item.status} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 flex-1 truncate">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-primary-black tabular-nums">
                {item.count}
              </span>
              <span className="text-xs text-gray-400 w-12 text-right tabular-nums">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
