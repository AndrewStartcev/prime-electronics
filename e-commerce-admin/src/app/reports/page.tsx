import { Card, CardContent, CardHeader, CardTitle, Button } from "@/shared/ui";

// Reports will be implemented with real API
const salesData: any[] = [];
const topProducts: any[] = [];
const topCategories: any[] = [];

export default function ReportsPage() {
  const maxSales =
    salesData.length > 0 ? Math.max(...salesData.map((d) => d.value)) : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Отчеты и аналитика
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Статистика продаж и популярности товаров
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm">
            <option value="year">За год</option>
            <option value="quarter">За квартал</option>
            <option value="month">За месяц</option>
            <option value="week">За неделю</option>
          </select>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none justify-center"
          >
            <svg
              className="w-5 h-5 sm:mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Экспорт</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Общая выручка</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              ₽ 24,610,000
            </p>
            <p className="text-sm text-green-600 mt-1">
              +18.5% к прошлому году
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Всего заказов</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              12,456
            </p>
            <p className="text-sm text-green-600 mt-1">
              +12.3% к прошлому году
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Средний чек</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              ₽ 19,750
            </p>
            <p className="text-sm text-green-600 mt-1">+5.2% к прошлому году</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Конверсия</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              3.8%
            </p>
            <p className="text-sm text-red-600 mt-1">-0.3% к прошлому году</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {salesData.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-primary-orange/20 hover:bg-primary-orange/40 rounded-t transition-colors relative group"
                  style={{ height: `${(item.value / maxSales) * 100}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary-orange rounded-t transition-all"
                    style={{ height: "100%" }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ₽ {(item.value / 1000000).toFixed(1)}M
                  </div>
                </div>
                <span className="text-xs text-text-secondary-black">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Топ товаров</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 bg-secondary-gray rounded-full flex items-center justify-center text-xs font-medium text-primary-black">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-black">
                      {product.name}
                    </p>
                    <p className="text-xs text-text-secondary-black">
                      {product.sales} продаж
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-black">
                    ₽ {(product.revenue / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-primary-black">
                      {category.name}
                    </span>
                    <span className="text-sm font-medium text-primary-black">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-orange rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Товары с низким остатком</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Товар
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    SKU
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Точка
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Остаток
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-primary-black">
                    iPhone 15 Pro Max 256GB
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary-black">
                    IP15PM-256-BLK
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    ТЦ Метрополис
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    2 шт.
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                      Критический
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-primary-black">
                    AirPods Pro 2
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary-black">
                    APP2-WHT
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    Барклая, 6Ак1
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    5 шт.
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700">
                      Низкий
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-primary-black">
                    MacBook Air M3
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary-black">
                    MBA-M3-256-SLV
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    ТЦ Метрополис
                  </td>
                  <td className="py-3 px-4 text-sm text-primary-black">
                    3 шт.
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700">
                      Низкий
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
