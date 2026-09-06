"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { useLogin } from "@/shared/hooks";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-orange rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-primary-black">
            Админ-панель
          </h1>
          <p className="text-text-secondary-black mt-1">
            Войдите в систему для продолжения
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {login.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-red-900 font-medium text-sm">
                    Ошибка входа
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Неверный email или пароль. Пожалуйста, попробуйте еще раз.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                />
                <span className="text-sm text-primary-black">
                  Запомнить меня
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-orange hover:underline"
              >
                Забыли пароль?
              </a>
            </div>

            <Button
              variant="primary"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-secondary-black mt-6">
          © 2025 E-Commerce. Все права защищены.
        </p>
      </div>
    </div>
  );
}
