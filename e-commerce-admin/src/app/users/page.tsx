"use client";

import Link from "next/link";
import { useState } from "react";
import type { UserRole } from "@/shared/api/usersApi";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
  TablePagination,
  TableSearch,
} from "@/shared/ui";
import { useUsers } from "@/shared/hooks";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useUsers({ page, limit: 10, role, search: search || undefined });

  const roleLabels: Record<string, string> = {
    ADMIN: "Администратор",
    MANAGER: "Менеджер",
    EDITOR: "Менеджер",
    USER: "Клиент",
  };

  const roleVariants: Record<string, "danger" | "warning" | "default"> = {
    ADMIN: "danger",
    MANAGER: "warning",
    EDITOR: "warning",
    USER: "default",
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Все пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Пользователи
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить пользователей"
          message="Произошла ошибка при загрузке списка пользователей. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const users = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Пользователи
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление пользователями системы
            {meta && ` (${meta.total} пользователей)`}
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={role || ""}
            onChange={(e) =>
              setRole(e.target.value ? (e.target.value as UserRole) : undefined)
            }
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Все роли</option>
            <option value="ADMIN">Администраторы</option>
            <option value="MANAGER">Менеджеры</option>
            <option value="USER">Клиенты</option>
          </select>
          <Link href="/users/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto justify-center"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Добавить пользователя
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <TableSearch
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Поиск пользователей..."
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Пользователь
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Роль
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Заказы
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-gray rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-black">
                            {(user.name || user.email)
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary-black">
                          {user.name || "Без имени"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary-black">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleVariants[user.role] || "default"}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-black">
                      {user._count?.orders || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          !user.isBanned
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {!user.isBanned ? "Активен" : "Заблокирован"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/users/${user.id}`}>
                          <button className="p-2 hover:bg-secondary-gray rounded-lg transition-colors">
                            <svg
                              className="w-4 h-4 text-primary-black"
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
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && (
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              total={meta.total}
              label="пользователей"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
