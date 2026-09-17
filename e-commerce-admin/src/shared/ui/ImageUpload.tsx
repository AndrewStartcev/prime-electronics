"use client";

import { useRef, useState } from "react";
import { uploadImage } from "../api/upload";
import { apiClient } from "../api/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

function getApiOrigin(): string {
  const baseUrl = String(apiClient.defaults.baseURL || "").trim();
  if (!baseUrl) return "";

  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl.replace(/\/api\/?$/i, "").replace(/\/$/, "");
  }
}

function getStorefrontOrigin(apiOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_STOREFRONT_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (!apiOrigin) return "";

  try {
    const apiUrl = new URL(apiOrigin);

    if (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1") {
      return `${apiUrl.protocol}//${apiUrl.hostname}:3000`;
    }

    if (apiUrl.hostname === "seo-api.prime-electronics.ru") {
      return `${apiUrl.protocol}//seo.prime-electronics.ru`;
    }

    if (apiUrl.hostname === "api.prime-electronics.ru") {
      return `${apiUrl.protocol}//prime-electronics.ru`;
    }

    if (apiUrl.hostname.startsWith("seo-api.")) {
      return `${apiUrl.protocol}//${apiUrl.hostname.replace(/^seo-api\./, "seo.")}`;
    }

    if (apiUrl.hostname.startsWith("api.")) {
      return `${apiUrl.protocol}//${apiUrl.hostname.replace(/^api\./, "")}`;
    }
  } catch {
    return "";
  }

  return "";
}

function resolveImageUrl(value: string): string {
  const url = value.trim();
  if (!url) return "";

  if (/^(data:|blob:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;

  const apiOrigin = getApiOrigin();
  const storefrontOrigin = getStorefrontOrigin(apiOrigin);

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const isLocalUrl = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

      if (isLocalUrl && parsed.pathname.startsWith("/images/uploads/") && apiOrigin) {
        return `${apiOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return url;
    }

    return url;
  }

  const normalizedPath = `/${url.replace(/^\/+/, "")}`;

  if (normalizedPath.startsWith("/images/uploads/") && apiOrigin) {
    return `${apiOrigin}${normalizedPath}`;
  }

  if (storefrontOrigin) {
    return `${storefrontOrigin}${normalizedPath}`;
  }

  return normalizedPath;
}

export function ImageUpload({
  value,
  onChange,
  label = "Изображение",
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const previewUrl = resolveImageUrl(value);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Неверный формат файла. Поддерживаются: JPG, PNG, WEBP, SVG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    setIsUploading(true);
    try {
      toast.info("Загрузка изображения...");
      const result = await uploadImage(file);
      onChange(result.url);
      toast.success("Изображение загружено!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Ошибка при загрузке изображения");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary-black mb-2">
        {label}
      </label>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-[#d66228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            {isUploading ? "Загрузка..." : "Загрузить изображение"}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 border border-border-gray rounded-lg hover:bg-secondary-gray transition-colors"
            >
              Удалить
            </button>
          )}
        </div>

        {value && (
          <div className="w-full h-48 bg-secondary-gray rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <p className="text-xs text-text-secondary-black">
          Поддерживаемые форматы: JPG, PNG, WEBP, SVG. Максимальный размер: 5MB
        </p>
      </div>
    </div>
  );
}
