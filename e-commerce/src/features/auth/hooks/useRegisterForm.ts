import { useState, useCallback } from "react";
import { useRegister } from "./useAuth";

interface RegisterFormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface UseRegisterFormReturn {
  formData: RegisterFormData;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setAgreeToTerms: (agreeToTerms: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  errors: Partial<Record<keyof RegisterFormData, string>>;
  validate: () => boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: RegisterFormData = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: true,
};

export const useRegisterForm = (
  onSuccess?: () => void
): UseRegisterFormReturn => {
  const [formData, setFormData] = useState<RegisterFormData>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const registerMutation = useRegister(onSuccess);

  const setName = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const setPhone = useCallback((phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    setErrors((prev) => ({ ...prev, email: undefined }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    setErrors((prev) => ({ ...prev, password: undefined }));
  }, []);

  const setConfirmPassword = useCallback((confirmPassword: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword }));
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
  }, []);

  const setAgreeToTerms = useCallback((agreeToTerms: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms }));
    setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.phone) {
      newErrors.phone = "Телефон обязателен";
    }

    if (!formData.email) {
      newErrors.email = "E-mail обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный e-mail";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Необходимо согласие с условиями";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      registerMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
    },
    [formData, validate, registerMutation]
  );

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    registerMutation.reset();
  }, [registerMutation]);

  return {
    formData,
    setName,
    setPhone,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAgreeToTerms,
    handleSubmit,
    resetForm,
    errors,
    validate,
    isLoading: registerMutation.isPending,
    error: registerMutation.error
      ? (registerMutation.error as any).response?.data?.message ||
        "Ошибка регистрации"
      : null,
  };
};
