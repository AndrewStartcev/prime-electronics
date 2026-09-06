"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar, accountTabs } from "@/features/account";
import { Card, PageTitle, FormInput, SubmitButton } from "@/shared/ui";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi } from "@/shared/api/userApi";
import type { UserProfile } from "@/shared/api/userApi";

export default function PersonalDataPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  // Delivery address state (localStorage)
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [intercom, setIntercom] = useState("");
  const [addressComment, setAddressComment] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingProfile(true);
        const profileData = await userApi.getProfile();
        setProfile(profileData);
        setContactName(profileData.name || "");
        setContactPhone(profileData.phone || "");
        setContactEmail(profileData.email || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  // Load delivery address from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("delivery_address");
      if (saved) {
        const data = JSON.parse(saved);
        setAddress(data.address || "");
        setApartment(data.apartment || "");
        setEntrance(data.entrance || "");
        setFloor(data.floor || "");
        setIntercom(data.intercom || "");
        setAddressComment(data.comment || "");
      }
    } catch {}
  }, []);

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

  const handleContactSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    setContactSaving(true);

    try {
      const updated = await userApi.updateProfile({
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
      });
      setProfile(updated);
      setContactSuccess("Данные успешно сохранены");
    } catch (error: any) {
      setContactError(
        error.response?.data?.message || "Не удалось сохранить данные",
      );
    } finally {
      setContactSaving(false);
    }
  };

  const handleAddressSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressSuccess("");

    try {
      localStorage.setItem(
        "delivery_address",
        JSON.stringify({
          address,
          apartment,
          entrance,
          floor,
          intercom,
          comment: addressComment,
        }),
      );
      setAddressSuccess("Адрес успешно сохранён");
    } finally {
      setAddressSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      <AccountSidebar tabs={accountTabs} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
        {isLoading || isLoadingProfile ? (
          <>
            {/* Top Section Skeleton - Two columns */}
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
              {/* Contact Data Skeleton */}
              <Card className="flex-1 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="flex flex-col gap-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32 mt-4"></div>
              </Card>

              {/* Delivery Address Skeleton */}
              <Card className="flex-1 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="flex flex-col gap-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32 mt-4"></div>
              </Card>
            </div>

          </>
        ) : !profile ? null : (
          <>
            {/* Top Section - Two columns */}
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
              {/* Contact Data */}
              <Card className="flex-1">
                <PageTitle>Контактные данные</PageTitle>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContactSave(e);
                  }}
                  className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
                >
                  <FormInput
                    label="Ваше имя"
                    value={contactName}
                    onChange={(val) => setContactName(val)}
                    variant="compact"
                  />

                  <FormInput
                    label="Телефон"
                    type="tel"
                    value={contactPhone}
                    onChange={(val) => setContactPhone(val)}
                    hint="Необходим для уточнения деталей заказа"
                    variant="compact"
                  />

                  <FormInput
                    label="E-mail"
                    type="email"
                    value={contactEmail}
                    onChange={(val) => setContactEmail(val)}
                    hint="Является также логином для входа на сайт"
                    variant="compact"
                  />

                  {contactError && (
                    <p className="text-red-500 text-sm">{contactError}</p>
                  )}
                  {contactSuccess && (
                    <p className="text-green-500 text-sm">{contactSuccess}</p>
                  )}

                  <SubmitButton type="submit" disabled={contactSaving}>
                    {contactSaving ? "Сохранение..." : "Сохранить изменения"}
                  </SubmitButton>
                </form>
              </Card>

              {/* Delivery Address */}
              <Card className="flex-1">
                <PageTitle>Адрес доставки</PageTitle>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddressSave(e);
                  }}
                  className="flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px]"
                >
                  <FormInput
                    label="Введите адрес"
                    placeholder="Город, улица, дом"
                    value={address}
                    onChange={(val) => setAddress(val)}
                    variant="compact"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] md:gap-[16px] lg:gap-[20px]">
                    <FormInput
                      placeholder="Квартира"
                      value={apartment}
                      onChange={(val) => setApartment(val)}
                      variant="compact"
                      className="w-full"
                    />
                    <FormInput
                      placeholder="Подъезд"
                      value={entrance}
                      onChange={(val) => setEntrance(val)}
                      variant="compact"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] md:gap-[16px] lg:gap-[20px]">
                    <FormInput
                      placeholder="Этаж"
                      value={floor}
                      onChange={(val) => setFloor(val)}
                      variant="compact"
                      className="w-full"
                    />
                    <FormInput
                      placeholder="Домофон"
                      value={intercom}
                      onChange={(val) => setIntercom(val)}
                      variant="compact"
                      className="w-full"
                    />
                  </div>

                  <FormInput
                    label="Комментарий"
                    placeholder="Текст"
                    value={addressComment}
                    onChange={(val) => setAddressComment(val)}
                    hint="Можете закрепить постоянный комментарий ко всем заказам"
                    variant="compact"
                  />

                  {addressSuccess && (
                    <p className="text-green-500 text-sm">{addressSuccess}</p>
                  )}

                  <SubmitButton type="submit" disabled={addressSaving}>
                    {addressSaving ? "Сохранение..." : "Сохранить изменения"}
                  </SubmitButton>
                </form>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
