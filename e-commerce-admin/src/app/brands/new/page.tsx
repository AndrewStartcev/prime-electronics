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
  Textarea,
} from "@/shared/ui";
import { useCreateBrand } from "@/shared/hooks";
import { uploadApi } from "@/shared/api";

export default function NewBrandPage() {
  const router = useRouter();
  const createBrand = useCreateBrand();

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });
  const [logo, setLogo] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setLogo(result.url);
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      return;
    }

    try {
      await createBrand.mutateAsync({
        name: formData.name,
        logo: logo || undefined,
        isActive: formData.isActive,
      });
      router.push("/brands");
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/brands"
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
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
              Новый бренд
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              Заполните информацию о бренде
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/brands" className="flex-1 sm:flex-none">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto justify-center"
            >
              Отмена
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 sm:flex-none justify-center"
            disabled={createBrand.isPending}
          >
            {createBrand.isPending ? "Создание..." : "Создать бренд"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Название бренда"
                  placeholder="Введите название бренда"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Логотип</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logo && (
                  <div className="relative w-32 h-32 group">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-xl bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  </div>
                )}
                {!logo && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                    <div className="px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-accent-yellow transition-colors">
                      {uploading ? (
                        <span className="text-sm text-text-secondary-black">
                          Загрузка...
                        </span>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 mx-auto mb-2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-text-secondary-black">
                            Нажмите для загрузки логотипа
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">
                    Активен (отображается на сайте)
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
