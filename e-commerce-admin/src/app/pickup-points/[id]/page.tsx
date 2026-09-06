"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { usePickupPoint, useOrders, usePickupPointStock } from "@/shared/hooks";

export default function PickupPointDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: pickupPoint,
    isLoading: isLoadingPoint,
    error: errorPoint,
  } = usePickupPoint(id);
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = useOrders({ pickupPointId: id, page: 1, limit: 10 });
  const { data: stockData, isLoading: isLoadingStock } =
    usePickupPointStock(id);

  if (isLoadingPoint || isLoadingOrders || isLoadingStock) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <Card>
          <CardContent>
            <TableSkeleton rows={5} columns={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorPoint || !pickupPoint) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-black">
            Точка самовывоза не найдена
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить данные"
          message="Точка самовывоза не найдена или произошла ошибка при загрузке данных."
        />
        <Link href="/pickup-points">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  const inventory = stockData || [];
  const todayOrders = ordersData?.data || [];

  // Parse coordinates from coords string or coordinates object
  let coordinates = null;
  if (pickupPoint.coordinates) {
    coordinates = pickupPoint.coordinates;
  } else if (pickupPoint.coords) {
    const [lat, lng] = pickupPoint.coords
      .split(",")
      .map((c: string) => parseFloat(c.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      coordinates = { lat, lng };
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/pickup-points"
            className="p-2 hover:bg-secondary-gray rounded-lg transition-colors shrink-0 mt-0.5"
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg lg:text-2xl font-semibold text-primary-black break-words">
                {pickupPoint.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium shrink-0 ${
                  pickupPoint.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pickupPoint.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {pickupPoint.isActive ? "Активна" : "Неактивна"}
              </span>
            </div>
            <p className="text-sm lg:text-base text-text-secondary-black mt-1 break-words">
              {pickupPoint.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/pickup-points/${pickupPoint.id}/edit`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              className="w-full sm:w-auto justify-center"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span className="hidden sm:inline">Редактировать</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Заказов сегодня</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {todayOrders.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Всего заказов</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {ordersData?.meta?.total || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">
              Товаров на точке
            </p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {inventory.reduce(
                (sum, item) => sum + (item.stockCount || item.quantity || 0),
                0,
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Заказы на сегодня</CardTitle>
                <Link
                  href={`/orders?pickup=${pickupPoint.id}`}
                  className="text-sm text-primary-orange hover:underline"
                >
                  Все заказы
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayOrders.length > 0 ? (
                <div className="space-y-3">
                  {todayOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4 bg-secondary-gray/50 rounded-xl hover:bg-secondary-gray transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-primary-black">
                          Заказ #{String(order.id).slice(0, 8)}
                        </p>
                        <p className="text-xs text-text-secondary-black mt-0.5">
                          {order.user?.email || "Гость"} •{" "}
                          {order.finalTotal
                            ? `${Number(order.finalTotal).toLocaleString("ru-RU")} ₽`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === "DELIVERED" ||
                          order.status === "SHIPPED"
                            ? "success"
                            : order.status === "CANCELLED"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary-black text-center py-8">
                  Заказов на сегодня нет
                </p>
              )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Товары на точке</CardTitle>
                <Link
                  href={`/inventory?pickup=${pickupPoint.id}`}
                  className="text-sm text-primary-orange hover:underline"
                >
                  Управлять остатками
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Товар
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-primary-black">
                        Остаток
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm text-primary-black hover:text-primary-orange"
                          >
                            {item.product?.name ||
                              item.product?.title ||
                              "Товар"}
                          </Link>
                          {item.sku && (
                            <p className="text-xs text-text-secondary-black mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center justify-center min-w-8 px-2 py-1 rounded text-sm font-medium ${
                              (item.stockCount ?? item.quantity ?? 0) === 0
                                ? "bg-red-100 text-red-700"
                                : (item.stockCount ?? item.quantity ?? 0) <= 3
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.stockCount ?? item.quantity ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Время работы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pickupPoint.workingSchedule &&
                Object.keys(pickupPoint.workingSchedule).length > 0 ? (
                  Object.entries(pickupPoint.workingSchedule).map(
                    ([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-text-secondary-black capitalize">
                          {day}
                        </span>
                        <span className="text-primary-black">
                          {hours as string}
                        </span>
                      </div>
                    ),
                  )
                ) : pickupPoint.workingHours ? (
                  <div className="text-sm">
                    <span className="text-primary-black">
                      {pickupPoint.workingHours}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary-black">
                    Не указано
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Местоположение</CardTitle>
            </CardHeader>
            <CardContent>
              {coordinates ? (
                <div className="aspect-video bg-secondary-gray rounded-xl overflow-hidden">
                  <iframe
                    src={`https://yandex.ru/map-widget/v1/?ll=${coordinates.lng},${coordinates.lat}&z=16&l=map&pt=${coordinates.lng},${coordinates.lat},pm2rdm`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    style={{ position: "relative" }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary-gray rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-10 h-10 text-gray-400 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-xs text-text-secondary-black mt-2">
                      Координаты не указаны
                    </p>
                  </div>
                </div>
              )}
              {coordinates && (
                <>
                  <p className="text-xs text-text-secondary-black mt-2">
                    {coordinates.lat}, {coordinates.lng}
                  </p>
                  <a
                    href={`https://yandex.ru/maps/?ll=${coordinates.lng},${coordinates.lat}&z=16`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Открыть на карте
                    </Button>
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {pickupPoint.phone && (
                  <div className="flex flex-col gap-1">
                    <span className="text-text-secondary-black">Телефон</span>
                    <span className="text-primary-black">
                      {pickupPoint.phone}
                    </span>
                  </div>
                )}
                {pickupPoint.url && (
                  <div className="flex flex-col gap-1">
                    <span className="text-text-secondary-black">Ссылка</span>
                    <a
                      href={pickupPoint.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-orange hover:underline break-all"
                    >
                      {pickupPoint.url}
                    </a>
                  </div>
                )}
                {pickupPoint.coords && (
                  <div className="flex flex-col gap-1">
                    <span className="text-text-secondary-black">
                      Координаты
                    </span>
                    <span className="text-primary-black">
                      {pickupPoint.coords}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-text-secondary-black">Создана</span>
                  <span className="text-primary-black">
                    {new Date(pickupPoint.createdAt).toLocaleDateString(
                      "ru-RU",
                    )}
                  </span>
                </div>
                {pickupPoint.updatedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-text-secondary-black">Обновлена</span>
                    <span className="text-primary-black">
                      {new Date(pickupPoint.updatedAt).toLocaleDateString(
                        "ru-RU",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/pickup-windows?pickup=${pickupPoint.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Окна самовывоза
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Деактивировать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
