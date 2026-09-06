"use client";

import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar, accountTabs } from "@/features/account";
import {
  Card,
  PageTitle,
  FormInput,
  SubmitButton,
  Checkbox,
} from "@/shared/ui";
import { useAuthStore } from "@/shared/stores/useAuthStore";

interface SubscriptionOption {
  id: string;
  label: string;
  checked: boolean;
}

const SubscriptionsPage = memo(function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [subscriptions, setSubscriptions] = useState<SubscriptionOption[]>([
    { id: "promotions", label: "Акции", checked: true },
    { id: "news", label: "Новости магазина", checked: false },
    { id: "newProducts", label: "Новинки товаров", checked: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }

  const handleSubscriptionChange = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, checked: !sub.checked } : sub
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      // TODO: Implement API call to save subscriptions
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Настройки подписки сохранены");
    } catch (error) {
      setMessage("Не удалось сохранить настройки");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      <AccountSidebar tabs={accountTabs} onLogout={handleLogout} />

      <div className="flex-1">
        <Card variant="shadow" padding="lg">
          <PageTitle>Настройки подписки</PageTitle>

          <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[48px]">
            {/* Left column - Email */}
            <div className="flex-1 max-w-[567px]">
              <form onSubmit={handleSave} className="flex flex-col gap-[24px]">
                <FormInput
                  label="E-mail для подписки"
                  type="email"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  placeholder="Введите e-mail"
                  hint="Является также логином для входа на сайт"
                />

                <div className="flex flex-col gap-[16px]">
                  <p className="text-[16px] text-[rgba(19,19,20,0.6)]">
                    Рубрики подписки
                  </p>

                  <div className="flex flex-col gap-[20px]">
                    {subscriptions.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center gap-[20px] cursor-pointer"
                      >
                        <div
                          onClick={() => handleSubscriptionChange(sub.id)}
                          className={`w-[30px] h-[30px] rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                            sub.checked
                              ? "bg-[#ef6f2e] border-[#ef6f2e]"
                              : "border-[rgba(19,19,20,0.16)] bg-white"
                          }`}
                        >
                          {sub.checked && (
                            <svg
                              width="16"
                              height="12"
                              viewBox="0 0 16 12"
                              fill="none"
                            >
                              <path
                                d="M1 6L6 11L15 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-[18px] leading-[1.3] text-[#131314]">
                          {sub.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {message && (
                  <p
                    className={`text-sm ${
                      message.includes("Не удалось")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <SubmitButton type="submit" disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </SubmitButton>

                <p className="text-[14px] leading-[1.4] text-[rgba(19,19,20,0.4)]">
                  Нажимая на кнопку, вы соглашаетесь на обработку персональных
                  данных и с публичной офертой
                </p>
              </form>
            </div>

            {/* Right column - Info */}
            <div className="flex-1 max-w-[567px]">
              <p className="text-[16px] leading-[1.4] text-[rgba(19,19,20,0.6)]">
                После добавления или изменения адреса подписки вам будет выслан
                код подтверждения. Подписка будет не активной до ввода кода
                подтверждения.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

export default SubscriptionsPage;
