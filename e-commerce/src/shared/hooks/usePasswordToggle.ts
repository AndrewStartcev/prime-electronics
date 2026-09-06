import { useState, useCallback } from "react";

interface UsePasswordToggleReturn {
  showPassword: boolean;
  togglePassword: () => void;
  inputType: "text" | "password";
}

export const usePasswordToggle = (
  initialVisible = false
): UsePasswordToggleReturn => {
  const [showPassword, setShowPassword] = useState(initialVisible);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    showPassword,
    togglePassword,
    inputType: showPassword ? "text" : "password",
  };
};
