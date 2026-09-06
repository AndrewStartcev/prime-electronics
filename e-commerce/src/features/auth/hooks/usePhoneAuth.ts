import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestStore } from "@/shared/stores/useGuestStore";
import { formatPhone } from "@/shared/lib/formatPhone";
import {
  buildVerificationAttemptKey,
  getPhoneAuthErrorMessage,
  shouldSubmitVerificationCode,
} from "./phoneVerificationGuard";

type Step = "phone" | "code";

const EMPTY_GUEST_CART = {
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  total: 0,
};

interface UsePhoneAuthReturn {
  step: Step;
  phone: string;
  setPhone: (phone: string) => void;
  code: string;
  setCode: (code: string) => void;
  handleSendCode: (e?: React.FormEvent) => void;
  handleVerifyCode: (e?: React.FormEvent) => void;
  handleResendCode: () => void;
  handleBack: () => void;
  isLoading: boolean;
  error: string | null;
  resendTimer: number;
  canResend: boolean;
}

export const usePhoneAuth = (onSuccess?: () => void): UsePhoneAuthReturn => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhoneRaw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmittedVerificationRef = useRef<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const setPhone = useCallback((value: string) => {
    setPhoneRaw(formatPhone(value));
    setError(null);
    lastSubmittedVerificationRef.current = null;
  }, []);

  const setCodeValue = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 4);
    setCode(sanitized);
    setError(null);

    if (sanitized.length < 4) {
      lastSubmittedVerificationRef.current = null;
    }
  }, []);

  const startResendTimer = useCallback((seconds = 60) => {
    setResendTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const enterPhoneMutation = useMutation({
    mutationFn: () => authService.enterPhone({ phone }),
    onSuccess: () => {
      setStep("code");
      setCode("");
      setError(null);
      lastSubmittedVerificationRef.current = null;
      startResendTimer(60);
    },
    onError: (err: any) => {
      setError(
        getPhoneAuthErrorMessage(
          err.response?.data?.message,
          "Ошибка отправки кода",
        ),
      );
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: () => authService.verifyCode({ phone, code }),
    onSuccess: async (response) => {
      try {
        const merged = await useGuestStore.getState().mergeCartToUser();
        if (merged) {
          queryClient.setQueryData(["cart", "guest"], EMPTY_GUEST_CART);
        }
      } catch (mergeError) {
        console.error("Guest cart merge failed after verify:", mergeError);
      }

      setUser(response.user);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userCart"] }),
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
      ]);
      lastSubmittedVerificationRef.current = null;
      onSuccess?.();
    },
    onError: (err: any) => {
      setError(
        getPhoneAuthErrorMessage(err.response?.data?.message, "Неверный код"),
      );
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: () => authService.resendCode({ phone }),
    onSuccess: () => {
      setCode("");
      setError(null);
      lastSubmittedVerificationRef.current = null;
      startResendTimer(60);
    },
    onError: (err: any) => {
      setError(
        getPhoneAuthErrorMessage(
          err.response?.data?.message,
          "Ошибка повторной отправки",
        ),
      );
    },
  });

  const sendCode = enterPhoneMutation.mutate;
  const verifyCode = verifyCodeMutation.mutate;
  const resendCode = resendCodeMutation.mutate;

  const handleSendCode = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (enterPhoneMutation.isPending) return;
      if (!phone || phone.replace(/\D/g, "").length < 11) {
        setError("Введите корректный номер телефона");
        return;
      }
      sendCode();
    },
    [phone, enterPhoneMutation.isPending, sendCode],
  );

  const handleVerifyCode = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!code || code.length < 4) {
        setError("Введите 4-значный код");
        return;
      }

      if (
        !shouldSubmitVerificationCode({
          phone,
          code,
          isPending: verifyCodeMutation.isPending,
          lastSubmittedKey: lastSubmittedVerificationRef.current,
        })
      ) {
        return;
      }

      lastSubmittedVerificationRef.current = buildVerificationAttemptKey(
        phone,
        code,
      );
      verifyCode();
    },
    [phone, code, verifyCodeMutation.isPending, verifyCode],
  );

  const handleResendCode = useCallback(() => {
    if (resendTimer > 0) return;
    if (resendCodeMutation.isPending) return;
    resendCode();
  }, [resendTimer, resendCodeMutation.isPending, resendCode]);

  const handleBack = useCallback(() => {
    setStep("phone");
    setCode("");
    setError(null);
    lastSubmittedVerificationRef.current = null;
  }, []);

  return {
    step,
    phone,
    setPhone,
    code,
    setCode: setCodeValue,
    handleSendCode,
    handleVerifyCode,
    handleResendCode,
    handleBack,
    isLoading:
      enterPhoneMutation.isPending || verifyCodeMutation.isPending,
    error,
    resendTimer,
    canResend: resendTimer === 0 && !resendCodeMutation.isPending,
  };
};
