"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/shared/ui";
import type { UserRole } from "@/shared/api/usersApi";
import { usersApi } from "@/shared/api/usersApi";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setIsSubmitting(true);
    try {
      await usersApi.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Пользователь создан");
      router.push("/users");
    } catch (err: any) {
      toast.error(err.message || "Ошибка при создании пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/users"
          className="p-2 hover:bg-secondary-gray rounded-lg transition-colors mt-0.5"
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
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Новый пользователь
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Добавление нового пользователя в систему
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Имя *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Иван Иванов"
              required
            />
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              required
            />
            <Input
              label="Телефон"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+7 (999) 123-45-67"
            />
            <Input
              label="Пароль *"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Минимум 6 символов"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary-black">
                Роль
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="USER">Клиент</option>
                <option value="MANAGER">Менеджер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Создать пользователя
          </Button>
        </div>
      </form>
    </div>
  );
}
