"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  RevenueTrendChart,
  OrderStatusChart,
  PaymentMethodsChart,
  DeliveryMethodsChart,
  TopProductsTable,
  TopCategoriesTable,
  OrderHeatmap,
  PeriodComparison,
  StatsOverview,
} from "@/widgets/Analytics";

type Tab = "overview" | "sales" | "products";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Обзор" },
  { key: "sales", label: "Продажи" },
  { key: "products", label: "Товары" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [revenueDays, setRevenueDays] = useState(30);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-black">Аналитика</h1>
          <p className="text-sm text-gray-400 mt-1">
            Полная статистика по вашему магазину
          </p>
        </div>

        <div className="flex bg-white rounded-xl p-1 shadow-card border border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-primary-orange text-white shadow-sm"
                  : "text-gray-400 hover:text-primary-black",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <StatsOverview />
          <PeriodComparison />

          {/* Revenue trend with period selector */}
          <div className="flex items-center justify-end gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRevenueDays(d)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  revenueDays === d
                    ? "bg-primary-orange text-white"
                    : "bg-white text-gray-400 hover:text-primary-black border border-gray-100",
                )}
              >
                {d} дн.
              </button>
            ))}
          </div>
          <RevenueTrendChart days={revenueDays} />
          <OrderHeatmap />
        </div>
      )}

      {/* Tab: Sales */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <PeriodComparison />

          <div className="flex items-center justify-end gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRevenueDays(d)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  revenueDays === d
                    ? "bg-primary-orange text-white"
                    : "bg-white text-gray-400 hover:text-primary-black border border-gray-100",
                )}
              >
                {d} дн.
              </button>
            ))}
          </div>
          <RevenueTrendChart days={revenueDays} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderStatusChart />
            <PaymentMethodsChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeliveryMethodsChart />
            <div /> {/* Spacer for grid alignment */}
          </div>

          <OrderHeatmap />
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopProductsTable limit={10} />
            <TopCategoriesTable limit={10} />
          </div>
        </div>
      )}
    </div>
  );
}
