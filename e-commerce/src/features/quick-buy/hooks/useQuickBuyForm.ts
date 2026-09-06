"use client";

import { useState } from "react";
import { orderApi } from "@/shared/api/orderApi";
import { userApi } from "@/shared/api/userApi";
import { guestApi } from "@/shared/api/guestApi";
import { formatPhone, isValidPhone } from "@/shared/lib/formatPhone";
import { useAuthStore } from "@/shared/stores/useAuthStore";

interface UseQuickBuyFormProps {
  productId: string;
  quantity?: number;
  cartItemOptions?: {
    variantKey?: string;
    variantLabel?: string;
  };
  onSuccess?: () => void;
}

export const useQuickBuyForm = ({
  productId,
  quantity = 1,
  cartItemOptions,
  onSuccess,
}: UseQuickBuyFormProps) => {
  const { isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setName = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    if (error) setError("");
  };

  const setPhone = (phone: string) => {
    const formatted = formatPhone(phone);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (error) setError("");
  };

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError("Введите ваше имя");
      return false;
    }

    if (!isValidPhone(formData.phone)) {
      setError("Введите корректный номер телефона");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Add product to cart (if not authenticated, use guest cart)
      if (isAuthenticated) {
        await userApi.addToCart(productId, quantity, cartItemOptions);
      } else {
        await guestApi.addToCart(productId, quantity, cartItemOptions);
      }

      // 2. Create quick buy order from cart
      await orderApi.quickBuy(
        {
          buyer: formData.name,
          phone: formData.phone,
        },
        !isAuthenticated, // isGuest
      );

      setSuccess(true);

      // Delay to show success message
      setTimeout(() => {
        setFormData({ name: "", phone: "" });
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err: unknown) {
      console.error("Quick buy error:", err);
      const parsedError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        parsedError.response?.data?.message ||
        parsedError.message ||
        "Произошла ошибка. Попробуйте позже.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFormData({ name: "", phone: "" });
    setError("");
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    formData,
    setName,
    setPhone,
    handleSubmit,
    isLoading,
    error,
    success,
    reset,
  };
};
