type SubmitGuardInput = {
  phone: string;
  code: string;
  isPending: boolean;
  lastSubmittedKey: string | null;
};

export function buildVerificationAttemptKey(phone: string, code: string): string {
  return `${phone.replace(/\D/g, "")}:${code}`;
}

export function shouldSubmitVerificationCode({
  phone,
  code,
  isPending,
  lastSubmittedKey,
}: SubmitGuardInput): boolean {
  if (isPending) return false;
  if (!/^\d{4}$/.test(code)) return false;

  return buildVerificationAttemptKey(phone, code) !== lastSubmittedKey;
}

export function getPhoneAuthErrorMessage(
  message: unknown,
  fallback: string,
): string {
  if (typeof message !== "string" || !message.trim()) {
    return fallback;
  }

  if (message === "Too many failed attempts. Please request a new code.") {
    return "Слишком много попыток. Запросите новый код.";
  }

  if (message === "Invalid or expired code") {
    return "Неверный или устаревший код";
  }

  return message;
}
