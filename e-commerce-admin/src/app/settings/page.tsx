import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from "@/shared/ui";

// Права доступа согласно ТЗ раздел 3.2
const permissions = [
  {
    key: "products_manage",
    label: "Управление товарами",
    admin: true,
    manager: true,
  },
  {
    key: "categories_manage",
    label: "Управление категориями",
    admin: true,
    manager: true,
  },
  {
    key: "orders_manage",
    label: "Управление заказами",
    admin: true,
    manager: true,
  },
  {
    key: "users_view",
    label: "Просмотр пользователей",
    admin: true,
    manager: true,
  },
  {
    key: "users_manage",
    label: "Управление пользователями",
    admin: true,
    manager: false,
  },
  {
    key: "pickup_manage",
    label: "Управление точками самовывоза",
    admin: true,
    manager: true,
  },
  {
    key: "coupons_manage",
    label: "Управление купонами",
    admin: true,
    manager: false,
  },
  {
    key: "reviews_manage",
    label: "Модерация отзывов",
    admin: true,
    manager: true,
  },
  {
    key: "reports_view",
    label: "Просмотр отчетов",
    admin: true,
    manager: true,
  },
  {
    key: "settings_manage",
    label: "Настройки системы",
    admin: true,
    manager: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
          Настройки
        </h1>
        <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
          Управление настройками магазина и правами доступа
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-orange border-b-2 border-primary-orange whitespace-nowrap">
          Общие
        </button>
        <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary-black hover:text-primary-black whitespace-nowrap">
          Роли и права
        </button>
        <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary-black hover:text-primary-black whitespace-nowrap">
          Уведомления
        </button>
        <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary-black hover:text-primary-black whitespace-nowrap">
          Интеграции
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Общие настройки</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                label="Название магазина"
                placeholder="Введите название"
                defaultValue="E-Commerce Store"
              />
              <Input
                label="Email магазина"
                type="email"
                placeholder="store@example.com"
                defaultValue="store@example.com"
              />
              <Input
                label="Телефон"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                defaultValue="+7 (999) 999-99-99"
              />
              <Button variant="primary" type="submit">
                Сохранить изменения
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bonus Settings - согласно ТЗ раздел 2.7 */}
        <Card>
          <CardHeader>
            <CardTitle>Бонусная система</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                label="Процент начисления бонусов"
                type="number"
                placeholder="5"
                defaultValue="5"
                helperText="Процент от суммы заказа, начисляемый в виде бонусов"
              />
              <Input
                label="Максимальная оплата бонусами (%)"
                type="number"
                placeholder="30"
                defaultValue="30"
                helperText="Какую часть заказа можно оплатить бонусами"
              />
              <Input
                label="Срок действия бонусов (дней)"
                type="number"
                placeholder="365"
                defaultValue="365"
              />
              <Button variant="primary" type="submit">
                Сохранить
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Store Address */}
        <Card>
          <CardHeader>
            <CardTitle>Контактные данные</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                label="Город"
                placeholder="Введите город"
                defaultValue="Москва"
              />
              <Input
                label="Юридический адрес"
                placeholder="Введите адрес"
                defaultValue="ул. Примерная, д. 1"
              />
              <Input
                label="ИНН"
                placeholder="0000000000"
                defaultValue="7712345678"
              />
              <Button variant="primary" type="submit">
                Сохранить
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Валюта и формат</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary-black">
                  Валюта
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all">
                  <option value="RUB">Российский рубль (₽)</option>
                  <option value="USD">Доллар США ($)</option>
                  <option value="EUR">Евро (€)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary-black">
                  Язык
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Button variant="primary" type="submit">
                Сохранить настройки
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Опасная зона</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <h4 className="font-medium text-red-700">Очистить кэш</h4>
                <p className="text-sm text-red-600 mt-1">
                  Очистка кэша может временно замедлить работу сайта
                </p>
                <Button variant="danger" size="sm" className="mt-3">
                  Очистить кэш
                </Button>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <h4 className="font-medium text-red-700">Сбросить настройки</h4>
                <p className="text-sm text-red-600 mt-1">
                  Это действие нельзя отменить
                </p>
                <Button variant="danger" size="sm" className="mt-3">
                  Сбросить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Matrix - ТЗ раздел 3.2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Матрица прав доступа</CardTitle>
            <Badge variant="default">Только для просмотра</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Право доступа
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary-black">
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                      Администратор
                    </span>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary-black">
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                      Менеджер
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.key} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-primary-black">
                      {perm.label}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm.admin ? (
                        <svg
                          className="w-5 h-5 text-green-600 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm.manager ? (
                        <svg
                          className="w-5 h-5 text-green-600 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
