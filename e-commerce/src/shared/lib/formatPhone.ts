/**
 * Форматирует номер телефона в российском формате +7 (XXX) XXX-XX-XX
 * @param value - входное значение
 * @returns отформатированный номер телефона
 */
export const formatPhone = (value: string): string => {
  // Убираем все нецифровые символы
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";

  // Если номер начинается с 8, заменяем на 7.
  // Если пользователь вводит или вставляет мобильный номер с 9,
  // считаем его российским номером без кода страны и добавляем 7.
  let normalizedDigits = digits;
  if (digits.startsWith("8") && digits.length > 1) {
    normalizedDigits = "7" + digits.slice(1);
  } else if (digits.startsWith("9")) {
    normalizedDigits = "7" + digits;
  }

  // Форматируем номер
  if (normalizedDigits.length <= 1) {
    return `+${normalizedDigits}`;
  }
  if (normalizedDigits.length <= 4) {
    return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1)}`;
  }
  if (normalizedDigits.length <= 7) {
    return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4)}`;
  }
  if (normalizedDigits.length <= 9) {
    return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7)}`;
  }

  // Ограничиваем 11 цифрами (стандартный российский номер)
  return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
};

/**
 * Извлекает только цифры из форматированного номера телефона
 * @param value - форматированный номер
 * @returns только цифры
 */
export const getPhoneDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Проверяет, является ли номер телефона валидным (минимум 11 цифр)
 * @param phone - номер телефона
 * @returns true если номер валидный
 */
export const isValidPhone = (phone: string): boolean => {
  const digits = getPhoneDigits(phone);
  return digits.length >= 11;
};
