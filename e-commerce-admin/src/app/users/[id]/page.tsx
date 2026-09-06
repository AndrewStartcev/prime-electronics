"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Textarea,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import {
  useUser,
  useUpdateUser,
  useChangeUserPassword,
  useBanUser,
  useUnbanUser,
  useUserBonusBalance,
  useAccrueUserBonus,
  useWriteOffUserBonus,
} from "@/shared/hooks";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  EDITOR: "Менеджер",
  USER: "Пользователь",
};

const roleVariants: Record<string, "danger" | "warning" | "default"> = {
  ADMIN: "danger",
  MANAGER: "warning",
  EDITOR: "warning",
  USER: "default",
};

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: user, isLoading, error } = useUser(id);
  const { data: bonusBalance, isLoading: isBonusBalanceLoading } = useUserBonusBalance(id);
  const updateUser = useUpdateUser();
  const changeUserPassword = useChangeUserPassword();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const accrueUserBonus = useAccrueUserBonus();
  const writeOffUserBonus = useWriteOffUserBonus();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusDescription, setBonusDescription] = useState("");
  const [bonusError, setBonusError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const isBonusActionPending = accrueUserBonus.isPending || writeOffUserBonus.isPending;

  const handleEdit = () => {
    if (user) {
      setEditForm({ name: user.name || "", phone: user.phone || "" });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateUser.mutate(
      { id, data: { name: editForm.name, phone: editForm.phone } },
      {
        onSuccess: () => {
          toast.success("Пользователь обновлен");
          setIsEditing(false);
        },
        onError: () => {
          toast.error("Ошибка при обновлении пользователя");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleToggleBan = () => {
    if (!user) return;

    if (user.isBanned) {
      if (confirm("Разблокировать пользователя?")) {
        unbanUser.mutate(id, {
          onSuccess: () => toast.success("Пользователь разблокирован"),
          onError: () => toast.error("Ошибка при разблокировке"),
        });
      }
    } else {
      if (confirm("Заблокировать пользователя?")) {
        banUser.mutate(id, {
          onSuccess: () => toast.success("Пользователь заблокирован"),
          onError: () => toast.error("Ошибка при блокировке"),
        });
      }
    }
  };

  const parseBonusAmount = () => {
    const normalized = bonusAmount.trim();
    if (!/^\d+$/.test(normalized)) {
      setBonusError("Введите целое число бонусов");
      return null;
    }

    const value = Number.parseInt(normalized, 10);
    if (!Number.isFinite(value) || value <= 0) {
      setBonusError("Количество бонусов должно быть больше нуля");
      return null;
    }

    setBonusError("");
    return value;
  };

  const extractApiErrorMessage = (unknownError: unknown, fallback: string) => {
    const message = (unknownError as any)?.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
    return fallback;
  };

  const handleBonusAction = (type: "accrue" | "write-off") => {
    const amount = parseBonusAmount();
    if (!amount) return;

    const data = {
      amount,
      description: bonusDescription.trim() || undefined,
    };

    const mutation = type === "accrue" ? accrueUserBonus : writeOffUserBonus;

    mutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success(
            type === "accrue"
              ? "Бонусы успешно начислены"
              : "Бонусы успешно списаны",
          );
          setBonusAmount("");
          setBonusDescription("");
        },
        onError: (unknownError) => {
          toast.error(
            extractApiErrorMessage(
              unknownError,
              type === "accrue"
                ? "Не удалось начислить бонусы"
                : "Не удалось списать бонусы",
            ),
          );
        },
      },
    );
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Пароль должен быть не короче 6 символов");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    changeUserPassword.mutate(
      { id, data: passwordForm },
      {
        onSuccess: () => {
          toast.success("Пароль пользователя изменен");
          setPasswordForm({ newPassword: "", confirmPassword: "" });
        },
        onError: (unknownError) => {
          toast.error(
            extractApiErrorMessage(
              unknownError,
              "Не удалось изменить пароль пользователя",
            ),
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <Card>
          <CardContent>
            <TableSkeleton rows={6} columns={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Пользователь не найден
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить пользователя"
          message="Пользователь с указанным ID не существует или произошла ошибка загрузки."
        />
        <Link href="/users">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/users"
            className="p-2 hover:bg-secondary-gray rounded-lg transition-colors"
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary-gray rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-primary-black">
                {(user.name || user.email)
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-primary-black">
                  {user.name || "Без имени"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                    !user.isBanned
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      !user.isBanned ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {!user.isBanned ? "Активен" : "Заблокирован"}
                </span>
              </div>
              <p className="text-text-secondary-black mt-1">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                isLoading={updateUser.isPending}
              >
                Сохранить
              </Button>
            </div>
          ) : (
            <Button variant="primary" onClick={handleEdit}>
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Роль</p>
            <div className="mt-1">
              <Badge variant={roleVariants[user.role] || "default"}>
                {roleLabels[user.role] || user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Заказов</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {user._count?.orders || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Дата регистрации</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info / Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Редактирование" : "Контактная информация"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Имя"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Имя пользователя"
                  />
                  <Input
                    label="Телефон"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-secondary-black">Имя</p>
                    <p className="text-sm text-primary-black mt-0.5">
                      {user.name || "Не указано"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary-black">Email</p>
                    <p className="text-sm text-primary-black mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary-black">Телефон</p>
                    <p className="text-sm text-primary-black mt-0.5">
                      {user.phone || "Не указан"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary-black">
                      Дата регистрации
                    </p>
                    <p className="text-sm text-primary-black mt-0.5">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Бонусы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 px-4 py-3 bg-secondary-gray/30">
                  <p className="text-xs text-text-secondary-black">Текущий баланс</p>
                  <p className="text-2xl font-semibold text-primary-black mt-1">
                    {isBonusBalanceLoading ? "..." : bonusBalance?.balance || 0}
                  </p>
                </div>

                <Input
                  label="Количество бонусов"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Например, 500"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  disabled={isBonusActionPending}
                />

                <Textarea
                  label="Комментарий (необязательно)"
                  placeholder="Причина операции"
                  rows={3}
                  value={bonusDescription}
                  onChange={(e) => setBonusDescription(e.target.value)}
                  disabled={isBonusActionPending}
                />

                {bonusError ? (
                  <p className="text-sm text-red-500">{bonusError}</p>
                ) : null}

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleBonusAction("accrue")}
                    isLoading={accrueUserBonus.isPending}
                    disabled={isBonusActionPending}
                  >
                    Начислить бонусы
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleBonusAction("write-off")}
                    isLoading={writeOffUserBonus.isPending}
                    disabled={isBonusActionPending}
                  >
                    Списать бонусы
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Смена пароля</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Новый пароль"
                  type="password"
                  minLength={6}
                  placeholder="Минимум 6 символов"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  disabled={changeUserPassword.isPending}
                />

                <Input
                  label="Повторите пароль"
                  type="password"
                  minLength={6}
                  placeholder="Повтор нового пароля"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={changeUserPassword.isPending}
                />

                {passwordError ? (
                  <p className="text-sm text-red-500">{passwordError}</p>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={changeUserPassword.isPending}
                >
                  Изменить пароль
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    user.isBanned
                      ? "text-green-600 hover:bg-green-50"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  onClick={handleToggleBan}
                  isLoading={banUser.isPending || unbanUser.isPending}
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
                  {user.isBanned ? "Разблокировать" : "Заблокировать"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
