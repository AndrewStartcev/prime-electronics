import { useState, useCallback } from "react";
import { useLogin } from "./useAuth";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface UseLoginFormReturn {
  formData: LoginFormData;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberMe: (rememberMe: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  isLoading: boolean;
  error: string | null;
}

const initialState: LoginFormData = {
  email: "",
  password: "",
  rememberMe: true,
};

export const useLoginForm = (onSuccess?: () => void): UseLoginFormReturn => {
  const [formData, setFormData] = useState<LoginFormData>(initialState);
  const loginMutation = useLogin(onSuccess);

  const setEmail = useCallback((email: string) => {
    setFormData((prev) => ({ ...prev, email }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setFormData((prev) => ({ ...prev, password }));
  }, []);

  const setRememberMe = useCallback((rememberMe: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
    },
    [formData, loginMutation]
  );

  const resetForm = useCallback(() => {
    setFormData(initialState);
    loginMutation.reset();
  }, [loginMutation]);

  return {
    formData,
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
    resetForm,
    isLoading: loginMutation.isPending,
    error: loginMutation.error
      ? (loginMutation.error as any).response?.data?.message || "Ошибка входа"
      : null,
  };
};
