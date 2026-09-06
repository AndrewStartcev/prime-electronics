"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { InfoButtonWithModal } from "@/shared/ui";
import { formatPhone } from "@/shared/lib/formatPhone";
import {
  formatDeliveryPrice,
  getDeliveryPrice,
  getDeliveryZone,
  getDeliveryZoneLabel,
} from "@/shared/lib/delivery";
import {
  CARD_SURCHARGE_PERCENT,
  calculatePaymentMethodTotal,
  calculatePaymentSurchargeAmount,
  formatRubPrice,
  type PaymentMethodChoice,
} from "@/shared/lib/pricing";
import { useCart } from "@/shared/hooks";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { userApi } from "@/shared/api/userApi";
import { orderApi, type FinalizeOrderDto } from "@/shared/api/orderApi";
import {
  couponApi,
  type CouponValidationResponse,
} from "@/shared/api/couponApi";
import { pickupPointApi, PickupPoint } from "@/shared/api/pickupPointApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getYandexEventCoords,
  getYandexPageEventCoords,
  normalizeYandexPair,
  shouldIgnoreYandexMapDomClick,
} from "./mapUtils";

type DeliveryMethod = "delivery" | "pickup";
type MapProviderType = "yandex" | "osm";
type CheckoutFieldKey = "fullName" | "phone" | "email" | "address" | "pickup";
type CheckoutFieldErrors = Partial<Record<CheckoutFieldKey, string>>;
type CheckoutCoupon = CouponValidationResponse["coupon"];

interface AddressSuggestion {
  value: string;
  title: string;
  subtitle?: string;
  coords?: [number, number];
}

const YMAPS_API_KEY = "e3e20b7a-3c59-4c1e-a6df-cb4ef6f4b4ea";

const buildOsmEmbedUrl = (coords: [number, number]) => {
  const [lat, lon] = coords;
  const delta = 0.015;
  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;

  const params = new URLSearchParams({
    bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
    layer: "mapnik",
    marker: `${lat},${lon}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
};

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variantLabel?: string | null;
}

const getCartUnitPrice = (
  lineTotal: string | number | null | undefined,
  quantity: number,
  fallbackPrice: string | number | null | undefined,
) => {
  const quantityValue = Math.max(quantity, 1);
  const lineTotalValue = Number(lineTotal);
  if (Number.isFinite(lineTotalValue) && lineTotalValue > 0) {
    return lineTotalValue / quantityValue;
  }

  const fallbackValue = Number(fallbackPrice);
  return Number.isFinite(fallbackValue) ? fallbackValue : 0;
};

const checkoutFieldOrder: CheckoutFieldKey[] = [
  "fullName",
  "phone",
  "email",
  "address",
  "pickup",
];

const checkoutInputClassName = (hasError: boolean, extra = "") =>
  [
    "border rounded-[12px] md:rounded-[14px] p-[16px] md:p-[20px] lg:p-[24px] font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] outline-none transition-colors",
    hasError
      ? "border-red-500 bg-red-50/40 focus:border-red-500 focus:ring-4 focus:ring-red-100"
      : "border-[rgba(19,19,20,0.16)] focus:border-[#ef6f2e]",
    extra,
  ]
    .filter(Boolean)
    .join(" ");

const buildDeliveryAddress = (
  address: string,
  entrance: string,
  floor: string,
  apartment: string,
) => {
  const parts = [
    address.trim(),
    entrance.trim() ? `подъезд ${entrance.trim()}` : "",
    floor.trim() ? `этаж ${floor.trim()}` : "",
    apartment.trim() ? `кв. ${apartment.trim()}` : "",
  ].filter(Boolean);

  return parts.join(", ");
};

const normalizePromoCode = (value: string) => value.trim().toUpperCase();

const getCouponErrorMessage = (error: unknown) => {
  const parsedError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  const message = parsedError.response?.data?.message || parsedError.message;

  if (message === "Coupon not found") {
    return "Промокод не найден";
  }
  if (message === "Coupon is not active") {
    return "Промокод сейчас не активен";
  }
  if (message === "Coupon is not yet valid") {
    return "Промокод пока недоступен";
  }
  if (message === "Coupon has expired") {
    return "Срок действия промокода истек";
  }
  if (message === "Coupon usage limit reached") {
    return "Лимит использования промокода исчерпан";
  }

  return "Не удалось проверить промокод";
};

const formatCouponDiscount = (coupon: {
  type?: string;
  value?: number | string;
}) => {
  const numericValue = Number(coupon.value);
  if (!Number.isFinite(numericValue)) return "";

  if (coupon.type === "PERCENTAGE") {
    return `${numericValue}%`;
  }

  return `${formatRubPrice(numericValue)} ₽`;
};

const calculateCouponDiscount = (
  coupon: CheckoutCoupon | null,
  baseTotal: number,
) => {
  if (!coupon) return 0;

  const numericValue = Number(coupon.value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0;

  if (coupon.type === "PERCENTAGE") {
    return Math.min(baseTotal, Math.round(baseTotal * (numericValue / 100)));
  }

  return Math.min(baseTotal, Math.round(numericValue));
};

const FieldError = ({ id, message }: { id: string; message?: string }) => {
  if (!message) return null;

  return (
    <p
      id={id}
      className="text-[13px] md:text-[14px] leading-[1.35] text-red-600"
    >
      {message}
    </p>
  );
};

export const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Get orderId from URL
  const orderIdFromUrl = searchParams.get("orderId");
  const promoCodeFromUrl = searchParams.get("promoCode") || "";
  const paymentMethodFromUrl: PaymentMethodChoice =
    searchParams.get("paymentMethod") === "card" ? "card" : "cash";

  // Получаем данные корзины
  const { data: guestCart, isLoading: guestCartLoading } = useCart();

  const { data: userCart = [], isLoading: userCartLoading } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => userApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Получаем пункты выдачи
  const { data: pickupPointsData } = useQuery({
    queryKey: ["pickupPoints"],
    queryFn: () => pickupPointApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const pickupPoints = pickupPointsData?.data || [];

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodChoice>(paymentMethodFromUrl);
  const [useBonuses, setUseBonuses] = useState(true);
  const [manualAddress, setManualAddress] = useState(false);

  // Loyalty data
  const { data: loyaltyData } = useQuery({
    queryKey: ["loyaltyInfo"],
    queryFn: () => userApi.getLoyaltyInfo(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState(promoCodeFromUrl);
  const [validatedCoupon, setValidatedCoupon] = useState<CheckoutCoupon | null>(
    null,
  );
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isPromoChecking, setIsPromoChecking] = useState(false);
  const [comment, setComment] = useState("");
  const [address, setAddress] = useState("");
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [selectedPickupPoint, setSelectedPickupPoint] =
    useState<PickupPoint | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("17:00-22:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const fullNameFieldRef = useRef<HTMLDivElement | null>(null);
  const phoneFieldRef = useRef<HTMLDivElement | null>(null);
  const emailFieldRef = useRef<HTMLDivElement | null>(null);
  const addressFieldRef = useRef<HTMLDivElement | null>(null);
  const pickupFieldRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const skipNextMapActionEndRef = useRef(false);
  const suggestionsRequestIdRef = useRef(0);
  const skipNextSuggestionsLoadRef = useRef(false);
  const mapAddressUpdateTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const validatePromoCode = useCallback(async (code: string) => {
    const normalizedCode = normalizePromoCode(code);

    if (!normalizedCode) {
      setValidatedCoupon(null);
      setPromoSuccess("");
      setPromoError("Введите промокод");
      return false;
    }

    setIsPromoChecking(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const result = await couponApi.validate(normalizedCode);
      const coupon = {
        ...result.coupon,
        code: result.coupon.code || normalizedCode,
      };
      const discountText = formatCouponDiscount(coupon);

      setPromoCode(coupon.code);
      setValidatedCoupon(coupon);
      setUseBonuses(false);
      setPromoSuccess(
        discountText
          ? `Промокод проверен: скидка ${discountText}`
          : "Промокод проверен",
      );

      return true;
    } catch (error) {
      setValidatedCoupon(null);
      setPromoError(getCouponErrorMessage(error));
      return false;
    } finally {
      setIsPromoChecking(false);
    }
  }, []);

  const handlePromoCodeChange = useCallback((value: string) => {
    setPromoCode(value.toUpperCase());
    setValidatedCoupon(null);
    setPromoError("");
    setPromoSuccess("");
  }, []);

  useEffect(() => {
    setPaymentMethod(paymentMethodFromUrl);
  }, [paymentMethodFromUrl]);
  const initialMapCenterRef = useRef<[number, number]>([55.7558, 37.6177]);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [isAddressSuggestionsLoading, setIsAddressSuggestionsLoading] =
    useState(false);
  const [isAddressSuggestionsOpen, setIsAddressSuggestionsOpen] =
    useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [mapProvider, setMapProvider] = useState<MapProviderType>("yandex");
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialMapCenterRef.current,
  );
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(
    null,
  );
  const mapInitFallbackTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const applyCoordsToMap = useCallback((coords: [number, number]) => {
    initialMapCenterRef.current = coords;
    setMapCenter(coords);
    setDeliveryCoords(coords);
    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates(coords);
    }
    if (mapRef.current) {
      skipNextMapActionEndRef.current = true;
      mapRef.current.setCenter(coords, 16, { duration: 300 });
    }
  }, []);

  // Auto-select first pickup point when switching to pickup
  useEffect(() => {
    if (
      deliveryMethod === "pickup" &&
      pickupPoints.length > 0 &&
      !selectedPickupPoint
    ) {
      setSelectedPickupPoint(pickupPoints[0]);
    }
  }, [deliveryMethod, pickupPoints, selectedPickupPoint]);

  // Преобразуем данные корзины в единый формат
  useEffect(() => {
    if (isAuthenticated && userCart && userCart.length > 0) {
      const items: CartItem[] = userCart.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        title: item.product.name,
        price: getCartUnitPrice(item.price, item.quantity, item.product.price),
        quantity: item.quantity,
        image: item.product.images?.[0]?.url || "/images/iphone17.png",
        variantLabel: item.variantLabel,
      }));
      setCartItems(items);
    } else if (
      !isAuthenticated &&
      guestCart?.items &&
      guestCart.items.length > 0
    ) {
      const items: CartItem[] = guestCart.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        title: item.product.name,
        price: getCartUnitPrice(
          item.subtotal,
          item.quantity,
          item.product.price,
        ),
        quantity: item.quantity,
        image: item.product.image || "/images/iphone17.png",
        variantLabel: item.variantLabel,
      }));
      setCartItems(items);
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, guestCart?.items, userCart]);

  // Рассчитываем итоговые суммы
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryZone = getDeliveryZone(deliveryMethod, deliveryCoords, address);
  const deliveryPrice = getDeliveryPrice(
    deliveryMethod,
    deliveryCoords,
    address,
  );
  const deliveryPriceLabel = formatDeliveryPrice(deliveryPrice);
  const deliveryZoneLabel = getDeliveryZoneLabel(deliveryZone);
  const deliveryPriceHint =
    deliveryMethod === "delivery" && (deliveryCoords || address.trim())
      ? `${deliveryZoneLabel} — ${deliveryPriceLabel}`
      : "До МКАД — от 590 ₽, за МКАД — от 990 ₽";
  const pickupPointForDisplay = selectedPickupPoint || pickupPoints[0] || null;
  const pickupAddress = pickupPointForDisplay?.address || "";
  const checkoutAddressTitle =
    deliveryMethod === "pickup" ? "Адрес самовывоза:" : "Адрес доставки:";
  const deliveryAddress = buildDeliveryAddress(
    address,
    entrance,
    floor,
    apartment,
  );
  const checkoutAddressValue =
    deliveryMethod === "pickup"
      ? pickupAddress || "Не выбран пункт самовывоза"
      : deliveryAddress || "Не указан";
  const normalizedPromoCode = normalizePromoCode(promoCode);
  const isPromoValidated = Boolean(
    validatedCoupon &&
    normalizedPromoCode &&
    normalizePromoCode(validatedCoupon.code) === normalizedPromoCode,
  );
  const promoDiscount = isPromoValidated
    ? calculateCouponDiscount(validatedCoupon, subtotal)
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const bonusesAvailable = loyaltyData?.balance ?? 0;
  const cashbackRate = loyaltyData?.cashbackRate ?? 0.01;
  const bonuses =
    useBonuses && !isPromoValidated
      ? Math.min(bonusesAvailable, Math.floor(discountedSubtotal))
      : 0;
  const cashback = Math.floor(discountedSubtotal * cashbackRate);
  const paymentSurcharge = calculatePaymentSurchargeAmount(
    discountedSubtotal,
    paymentMethod,
  );
  const payableSubtotal = calculatePaymentMethodTotal(
    discountedSubtotal,
    paymentMethod,
  );
  const totalPrice = Math.max(0, payableSubtotal + deliveryPrice - bonuses);

  const isLoading = isAuthenticated ? userCartLoading : guestCartLoading;

  const scrollToFieldError = useCallback((field: CheckoutFieldKey) => {
    const fieldRefs: Record<
      CheckoutFieldKey,
      React.RefObject<HTMLDivElement | null>
    > = {
      fullName: fullNameFieldRef,
      phone: phoneFieldRef,
      email: emailFieldRef,
      address: addressFieldRef,
      pickup: pickupFieldRef,
    };

    requestAnimationFrame(() => {
      const target = fieldRefs[field].current;
      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const focusTarget = target.querySelector<HTMLElement>(
        "input, textarea, button",
      );
      focusTarget?.focus({ preventScroll: true });
    });
  }, []);

  const clearFieldError = useCallback((field: CheckoutFieldKey) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setOrderError(null);
  }, []);

  // Validate form
  const validateForm = () => {
    const nextErrors: CheckoutFieldErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Укажите ФИО покупателя.";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Укажите корректный e-mail, например name@mail.ru.";
    }

    if (!phoneValue.trim() || phoneValue.replace(/\D/g, "").length < 11) {
      nextErrors.phone = "Укажите номер телефона полностью.";
    }

    if (deliveryMethod === "delivery" && !address.trim()) {
      nextErrors.address = "Укажите адрес доставки или выберите его на карте.";
    }

    if (
      deliveryMethod === "pickup" &&
      !selectedPickupPoint &&
      pickupPoints.length === 0
    ) {
      nextErrors.pickup = "Сейчас нет доступных пунктов самовывоза.";
    }

    const firstErrorField = checkoutFieldOrder.find(
      (field) => nextErrors[field],
    );
    setFieldErrors(nextErrors);

    if (firstErrorField) {
      setOrderError("Заполните обязательные поля, выделенные красным.");
      scrollToFieldError(firstErrorField);
      return false;
    }

    setOrderError(null);
    return true;
  };

  // Handle order submission - NEW 2-step flow
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    if (normalizedPromoCode && !isPromoValidated) {
      const message = "Проверьте промокод перед оформлением заказа.";
      setPromoError("Сначала проверьте промокод.");
      setOrderError(message);
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderId = orderIdFromUrl
        ? parseInt(orderIdFromUrl)
        : (await orderApi.initOrder({}, false)).id;

      // Step 1: Apply promo code if provided
      if (isPromoValidated && validatedCoupon) {
        try {
          await orderApi.applyCoupon(orderId, validatedCoupon.code);
        } catch (error) {
          const couponMessage = getCouponErrorMessage(error);
          setPromoError(couponMessage);
          setOrderError(couponMessage);
          return;
        }
      }

      // Step 2: Finalize order with all details in one call
      const finalizeData: FinalizeOrderDto = {
        deliveryMethod: deliveryMethod === "pickup" ? "PICKUP" : "DELIVERY",
        buyer: fullName,
        email: email,
        phone: phoneValue,
        paymentMethod: paymentMethod === "cash" ? "CASH" : "ROBOKASSA",
        comment: comment.trim() || undefined,
        entrance: entrance.trim() || undefined,
        deliveryTime: selectedTimeSlot || undefined,
        deliveryCost: deliveryPrice,
      };

      if (deliveryMethod === "pickup") {
        const point = selectedPickupPoint || pickupPoints[0];
        if (point) {
          const pickupTime = new Date(selectedDate);
          const [startHour] = selectedTimeSlot.split("-")[0].split(":");
          pickupTime.setHours(parseInt(startHour), 0, 0, 0);

          finalizeData.pointId = point.id;
          finalizeData.pickupTime = pickupTime.toISOString();
        }
      } else if (deliveryMethod === "delivery") {
        finalizeData.address = deliveryAddress || address;
      }

      await orderApi.finalizeOrder(orderId, finalizeData);

      // Clear cart cache
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
      queryClient.invalidateQueries({ queryKey: ["guestCart"] });

      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      setOrderError(
        error?.response?.data?.message ||
          "Произошла ошибка при оформлении заказа. Попробуйте еще раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyResolvedAddress = useCallback((newAddress: string) => {
    const normalizedAddress = newAddress.trim();
    if (!normalizedAddress) return;

    skipNextSuggestionsLoadRef.current = true;
    setAddressSuggestions([]);
    setIsAddressSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    setAddress((currentAddress) => {
      if (currentAddress === normalizedAddress) {
        return currentAddress;
      }

      return normalizedAddress;
    });
  }, []);

  const loadServerAddressFromCoords = useCallback(
    async (coords: [number, number]) => {
      try {
        const params = new URLSearchParams({
          lat: coords[0].toString(),
          lon: coords[1].toString(),
        });
        const response = await fetch(
          `/api/address-reverse?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) return null;

        const payload = (await response.json()) as { address?: string | null };
        const serverAddress = payload.address?.trim();
        return serverAddress || null;
      } catch (error) {
        console.error("Ошибка fallback reverse geocoding:", error);
        return null;
      }
    },
    [],
  );

  // Функция для получения адреса по координатам
  const getAddressFromCoords = useCallback(
    async (coords: [number, number]) => {
      try {
        const serverAddress = await loadServerAddressFromCoords(coords);
        if (serverAddress) {
          applyResolvedAddress(serverAddress);
          return;
        }

        if (!ymapsRef.current) return;
        const result = await ymapsRef.current.geocode(coords);
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const newAddress = firstGeoObject.getAddressLine();
          if (newAddress) {
            applyResolvedAddress(newAddress);
          }
        }
      } catch (error) {
        console.error("Ошибка геокодирования:", error);
      }
    },
    [applyResolvedAddress, loadServerAddressFromCoords],
  );

  // Функция для получения координат по адресу
  const getCoordsFromAddress = useCallback(
    async (addressStr: string): Promise<[number, number] | null> => {
      if (!ymapsRef.current || !addressStr.trim()) return null;
      try {
        const result = await ymapsRef.current.geocode(addressStr);
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          if (
            Array.isArray(coords) &&
            coords.length >= 2 &&
            Number.isFinite(Number(coords[0])) &&
            Number.isFinite(Number(coords[1]))
          ) {
            const normalizedCoords: [number, number] = [
              Number(coords[0]),
              Number(coords[1]),
            ];
            applyCoordsToMap(normalizedCoords);
            return normalizedCoords;
          }
        }
      } catch (error) {
        console.error("Ошибка геокодирования адреса:", error);
      }
      return null;
    },
    [applyCoordsToMap],
  );

  const scheduleMapAddressSync = useCallback(
    (coords: [number, number]) => {
      if (mapAddressUpdateTimeoutRef.current) {
        clearTimeout(mapAddressUpdateTimeoutRef.current);
      }

      mapAddressUpdateTimeoutRef.current = setTimeout(() => {
        void getAddressFromCoords(coords);
      }, 250);
    },
    [getAddressFromCoords],
  );

  const syncMapSelection = useCallback(
    (rawCoords: unknown) => {
      const coords = normalizeYandexPair(rawCoords);
      if (!coords) return;

      applyCoordsToMap(coords);
      scheduleMapAddressSync(coords);
    },
    [applyCoordsToMap, scheduleMapAddressSync],
  );

  const loadServerAddressSuggestions = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `/api/address-suggestions?q=${encodeURIComponent(query)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) return [];

      const payload = (await response.json()) as {
        suggestions?: AddressSuggestion[];
      };
      return Array.isArray(payload?.suggestions) ? payload.suggestions : [];
    } catch (error) {
      console.error("Ошибка fallback-подсказок адреса:", error);
      return [];
    }
  }, []);

  const resolveCoordsFromServer = useCallback(
    async (query: string): Promise<[number, number] | null> => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return null;

      const suggestions = await loadServerAddressSuggestions(query);
      if (!suggestions.length) return null;

      const exactMatch = suggestions.find(
        (item) => item.value.trim().toLowerCase() === normalizedQuery,
      );
      if (exactMatch?.coords) return exactMatch.coords;

      const startsWithMatch = suggestions.find((item) =>
        item.value.trim().toLowerCase().startsWith(normalizedQuery),
      );
      if (startsWithMatch?.coords) return startsWithMatch.coords;

      return suggestions.find((item) => item.coords)?.coords || null;
    },
    [loadServerAddressSuggestions],
  );

  const loadAddressSuggestions = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim();

      if (normalizedQuery.length < 2) {
        setAddressSuggestions([]);
        setIsAddressSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
        setIsAddressSuggestionsLoading(false);
        return;
      }

      const ymaps = ymapsRef.current;

      const requestId = ++suggestionsRequestIdRef.current;
      setIsAddressSuggestionsOpen(true);
      setActiveSuggestionIndex(-1);
      setIsAddressSuggestionsLoading(true);

      try {
        let rawSuggestions: AddressSuggestion[] = [];

        const serverSuggestions =
          await loadServerAddressSuggestions(normalizedQuery);
        rawSuggestions = [...serverSuggestions];

        if (requestId !== suggestionsRequestIdRef.current) return;

        let suggestItems: any[] = [];
        if (ymaps && typeof ymaps.suggest === "function") {
          try {
            const result = await ymaps.suggest(normalizedQuery, { results: 6 });
            suggestItems = Array.isArray(result) ? result : [];
          } catch (suggestError) {
            console.warn(
              "ymaps.suggest недоступен, используем geocode fallback:",
              suggestError,
            );
          }
        }

        if (Array.isArray(suggestItems) && suggestItems.length > 0) {
          const ymapsSuggestions = suggestItems
            .map((item: any) => {
              const title = (item?.value || item?.displayName || "")
                .toString()
                .trim();
              if (!title) return null;
              const subtitle = item?.subtitle?.toString()?.trim() || undefined;
              return {
                value: title,
                title,
                subtitle,
              };
            })
            .filter(Boolean) as AddressSuggestion[];

          rawSuggestions = [...rawSuggestions, ...ymapsSuggestions];
        }

        if (requestId !== suggestionsRequestIdRef.current) return;

        if (rawSuggestions.length === 0 && ymaps) {
          const geoQueries = Array.from(
            new Set([
              normalizedQuery,
              `Москва ${normalizedQuery}`,
              `Россия, Москва, ${normalizedQuery}`,
              `улица ${normalizedQuery}, Москва`,
            ]),
          );

          for (const geoQuery of geoQueries) {
            const geocodeResult = await ymaps.geocode(geoQuery, {
              results: 8,
            });
            const geoObjects = geocodeResult?.geoObjects?.toArray?.() || [];

            const geocodeSuggestions = geoObjects
              .map((obj: any) => {
                const title =
                  obj?.getAddressLine?.()?.toString().trim() ||
                  obj?.properties?.get?.("name")?.toString().trim() ||
                  "";
                if (!title) return null;

                const subtitle =
                  obj?.properties?.get?.("description")?.toString().trim() ||
                  undefined;
                const coords = obj?.geometry?.getCoordinates?.();

                return {
                  value: title,
                  title,
                  subtitle,
                  coords: Array.isArray(coords)
                    ? (coords as [number, number])
                    : undefined,
                };
              })
              .filter(Boolean) as AddressSuggestion[];

            rawSuggestions = [...rawSuggestions, ...geocodeSuggestions];
            if (rawSuggestions.length >= 6) break;
          }
        }

        if (requestId !== suggestionsRequestIdRef.current) return;

        const deduped = new Map<string, AddressSuggestion>();
        rawSuggestions.forEach((suggestion) => {
          const key = suggestion.value.trim().toLowerCase();
          if (!key || deduped.has(key)) return;
          deduped.set(key, suggestion);
        });

        const uniqueSuggestions = Array.from(deduped.values()).slice(0, 6);
        setAddressSuggestions(uniqueSuggestions);
        setIsAddressSuggestionsOpen(true);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if (requestId === suggestionsRequestIdRef.current) {
          setAddressSuggestions([]);
          setIsAddressSuggestionsOpen(true);
        }
        console.error("Ошибка загрузки подсказок адреса:", error);
      } finally {
        if (requestId === suggestionsRequestIdRef.current) {
          setIsAddressSuggestionsLoading(false);
        }
      }
    },
    [loadServerAddressSuggestions],
  );

  // Инициализация Яндекс Карт
  useEffect(() => {
    let cleanupMapContainerClick: (() => void) | null = null;

    const switchToOsmFallback = () => {
      setMapProvider("osm");
    };

    const clearInitFallbackTimer = () => {
      if (mapInitFallbackTimeoutRef.current) {
        clearTimeout(mapInitFallbackTimeoutRef.current);
        mapInitFallbackTimeoutRef.current = null;
      }
    };

    const ensureInitFallbackTimer = () => {
      clearInitFallbackTimer();
      mapInitFallbackTimeoutRef.current = setTimeout(() => {
        if (!mapRef.current) {
          switchToOsmFallback();
        }
      }, 4500);
    };

    const initMap = () => {
      const ymaps = (window as any).ymaps;
      if (!ymaps) {
        switchToOsmFallback();
        return;
      }
      ymapsRef.current = ymaps;
      setMapProvider("yandex");

      const mapContainer = document.getElementById("yandex-map");
      if (!mapContainer || mapRef.current) return;

      try {
        const map = new ymaps.Map("yandex-map", {
          center: initialMapCenterRef.current,
          zoom: 12,
          controls: ["zoomControl", "geolocationControl"],
        });

        mapRef.current = map;
        clearInitFallbackTimer();

        const placemark = new ymaps.Placemark(
          initialMapCenterRef.current,
          {},
          {
            preset: "islands#orangeCircleDotIcon",
            draggable: true,
          },
        );

        placemarkRef.current = placemark;
        map.geoObjects.add(placemark);

        placemark.events.add("dragend", () => {
          const coords = placemark.geometry.getCoordinates();
          console.log("Placemark dragged to:", coords);
          syncMapSelection(coords);
        });

        map.events.add("click", (e: unknown) => {
          const coords = getYandexEventCoords(e, map);
          syncMapSelection(coords);
        });

        const handleMapContainerClick = (event: MouseEvent) => {
          if (shouldIgnoreYandexMapDomClick(event.target)) return;

          const coords = getYandexPageEventCoords(map, event);
          syncMapSelection(coords);
        };

        mapContainer.addEventListener("click", handleMapContainerClick, true);
        cleanupMapContainerClick = () => {
          mapContainer.removeEventListener(
            "click",
            handleMapContainerClick,
            true,
          );
        };

        map.events.add("actionend", () => {
          if (skipNextMapActionEndRef.current) {
            skipNextMapActionEndRef.current = false;
            return;
          }

          const center = map.getCenter();
          const coords = normalizeYandexPair(center);
          if (!coords) return;

          if (placemarkRef.current) {
            placemarkRef.current.geometry.setCoordinates(coords);
          }
          initialMapCenterRef.current = coords;
          setMapCenter(coords);
          scheduleMapAddressSync(coords);
        });
      } catch (error) {
        console.error("Не удалось инициализировать Яндекс.Карты:", error);
        switchToOsmFallback();
      }
    };

    if (typeof window !== "undefined") {
      if ((window as any).ymaps) {
        ensureInitFallbackTimer();
        (window as any).ymaps.ready(initMap);
      } else {
        const existingScript = document.querySelector(
          'script[src*="api-maps.yandex.ru"]',
        ) as HTMLScriptElement | null;
        let script = existingScript;
        const handleYmapsLoaded = () => {
          const ymaps = (window as any).ymaps;
          if (!ymaps) {
            switchToOsmFallback();
            return;
          }
          ymaps.ready(initMap);
          if (script) {
            script.dataset.ymapsLoaded = "true";
          }
        };
        const handleYmapsLoadError = () => {
          switchToOsmFallback();
        };

        if (!existingScript) {
          script = document.createElement("script");
          script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YMAPS_API_KEY}&suggest_apikey=${YMAPS_API_KEY}&lang=ru_RU`;
          script.async = true;
          script.addEventListener("load", handleYmapsLoaded);
          script.addEventListener("error", handleYmapsLoadError);
          document.body.appendChild(script);
        } else if (existingScript.dataset.ymapsLoaded === "true") {
          handleYmapsLoaded();
        } else {
          existingScript.addEventListener("load", handleYmapsLoaded);
          existingScript.addEventListener("error", handleYmapsLoadError);
        }
        ensureInitFallbackTimer();

        return () => {
          cleanupMapContainerClick?.();
          clearInitFallbackTimer();
          script?.removeEventListener("load", handleYmapsLoaded);
          script?.removeEventListener("error", handleYmapsLoadError);
        };
      }
    }

    return () => {
      cleanupMapContainerClick?.();
      clearInitFallbackTimer();
      if (mapAddressUpdateTimeoutRef.current) {
        clearTimeout(mapAddressUpdateTimeoutRef.current);
      }
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [scheduleMapAddressSync, syncMapSelection]);

  useEffect(() => {
    if (deliveryMethod !== "delivery") {
      setAddressSuggestions([]);
      setIsAddressSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      setIsAddressSuggestionsLoading(false);
      return;
    }

    if (skipNextSuggestionsLoadRef.current) {
      skipNextSuggestionsLoadRef.current = false;
      return;
    }

    const query = address.trim();
    if (query.length < 2) {
      setAddressSuggestions([]);
      setIsAddressSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      void loadAddressSuggestions(query);
    }, 220);

    return () => clearTimeout(timer);
  }, [address, deliveryMethod, loadAddressSuggestions]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryCoords(null);
    setAddress(e.target.value);
    clearFieldError("address");
  };

  const handleAddressFocus = () => {
    const query = address.trim();
    if (deliveryMethod !== "delivery" || query.length < 2) return;
    void loadAddressSuggestions(query);
  };

  const handleAddressBlur = () => {
    setTimeout(() => setIsAddressSuggestionsOpen(false), 180);
    if (address.trim()) {
      void (async () => {
        const serverCoords = await resolveCoordsFromServer(address);
        if (serverCoords) {
          applyCoordsToMap(serverCoords);
          return;
        }
        await getCoordsFromAddress(address);
      })();
    }
  };

  const handleAddressSuggestionSelect = async (
    suggestion: AddressSuggestion,
  ) => {
    skipNextSuggestionsLoadRef.current = true;
    setAddress(suggestion.value);
    clearFieldError("address");
    setAddressSuggestions([]);
    setIsAddressSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    if (suggestion.coords) {
      applyCoordsToMap(suggestion.coords);
      return;
    }

    const serverCoords = await resolveCoordsFromServer(suggestion.value);
    if (serverCoords) {
      applyCoordsToMap(serverCoords);
      return;
    }

    await getCoordsFromAddress(suggestion.value);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isAddressSuggestionsOpen && addressSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < addressSuggestions.length - 1 ? prev + 1 : 0,
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : addressSuggestions.length - 1,
        );
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsAddressSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (isAddressSuggestionsOpen && activeSuggestionIndex >= 0) {
        const suggestion = addressSuggestions[activeSuggestionIndex];
        if (suggestion) {
          void handleAddressSuggestionSelect(suggestion);
          return;
        }
      }
      if (address.trim()) {
        void (async () => {
          const serverCoords = await resolveCoordsFromServer(address);
          if (serverCoords) {
            applyCoordsToMap(serverCoords);
            return;
          }
          await getCoordsFromAddress(address);
        })();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6f2e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back navigation */}
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[120px] 2xl:pt-[140px]">
        <Link
          href="/basket"
          className="flex items-center gap-[6px] mb-[20px] group"
        >
          <div className="w-[10px] h-[10px] flex items-center justify-center rotate-90">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 0L4.29289 0.707107L7.58579 4H0V5H7.58579L4.29289 8.29289L5 9L10 4.5L5 0Z"
                fill="rgba(19,19,20,0.4)"
              />
            </svg>
          </div>
          <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)] group-hover:text-[#ef6f2e] transition-colors">
            Вернуться к корзине
          </p>
        </Link>

        <h1 className="font-medium text-[28px] md:text-[32px] lg:text-[38px] xl:text-[42px] 2xl:text-[46px] leading-[1.1] text-[#131314] mb-[30px] md:mb-[36px] lg:mb-[42px] xl:mb-[48px] 2xl:mb-[52px]">
          Оформление заказа
        </h1>
      </div>

      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] flex flex-col lg:flex-row gap-[30px] md:gap-[40px] relative pb-[40px] md:pb-[60px] lg:pb-[80px]">
        {/* Left column - Form */}
        <div className="flex-1 w-full lg:max-w-[calc(100%-547px-40px)]">
          {/* Customer info */}
          <div className="border border-[rgba(19,19,20,0.16)] rounded-[14px] md:rounded-[16px] lg:rounded-[20px] p-[20px] md:p-[24px] lg:p-[30px] mb-[20px] md:mb-[24px] lg:mb-[30px]">
            {orderError && (
              <div className="bg-red-50 border border-red-200 rounded-[12px] p-[16px] mb-[20px]">
                <p className="text-red-600 text-[14px] md:text-[16px]">
                  {orderError}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px] lg:gap-[30px] mb-[20px] md:mb-[24px] lg:mb-[30px]">
              {/* Full name */}
              <div
                ref={fullNameFieldRef}
                className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]"
              >
                <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                  Покупатель
                </label>
                <input
                  type="text"
                  placeholder="ФИО *"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName
                      ? "checkout-full-name-error"
                      : undefined
                  }
                  className={checkoutInputClassName(
                    Boolean(fieldErrors.fullName),
                  )}
                />
                <FieldError
                  id="checkout-full-name-error"
                  message={fieldErrors.fullName}
                />
              </div>

              {/* Phone */}
              <div
                ref={phoneFieldRef}
                className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]"
              >
                <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                  Телефон
                </label>
                <input
                  type="tel"
                  placeholder="+7 ( ___ ) ___ - __ - __ *"
                  value={phoneValue}
                  onChange={(e) => {
                    setPhoneValue(formatPhone(e.target.value));
                    clearFieldError("phone");
                  }}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone ? "checkout-phone-error" : undefined
                  }
                  className={checkoutInputClassName(Boolean(fieldErrors.phone))}
                />
                <FieldError
                  id="checkout-phone-error"
                  message={fieldErrors.phone}
                />
              </div>

              {/* Email */}
              <div
                ref={emailFieldRef}
                className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]"
              >
                <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="example@mail.ru *"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "checkout-email-error" : undefined
                  }
                  className={checkoutInputClassName(Boolean(fieldErrors.email))}
                />
                <FieldError
                  id="checkout-email-error"
                  message={fieldErrors.email}
                />
              </div>

              {/* Promo code */}
              <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]">
                <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                  Промокод
                </label>
                <div className="flex flex-col sm:flex-row gap-[8px] md:gap-[10px]">
                  <input
                    type="text"
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => handlePromoCodeChange(e.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(promoError)}
                    aria-describedby={
                      promoError
                        ? "checkout-promo-error"
                        : promoSuccess
                          ? "checkout-promo-success"
                          : undefined
                    }
                    className={checkoutInputClassName(
                      Boolean(promoError),
                      "min-w-0 flex-1",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => void validatePromoCode(promoCode)}
                    disabled={!normalizedPromoCode || isPromoChecking}
                    className="sm:w-[150px] rounded-[12px] md:rounded-[14px] px-[18px] md:px-[22px] py-[14px] md:py-[18px] lg:py-[22px] bg-[#131314] text-white font-medium text-[15px] md:text-[16px] leading-[1.1] transition-colors hover:bg-[#2c2c2e] disabled:bg-[rgba(19,19,20,0.18)] disabled:text-[rgba(19,19,20,0.45)] disabled:cursor-not-allowed"
                  >
                    {isPromoChecking ? "Проверяем..." : "Проверить"}
                  </button>
                </div>
                {promoError && (
                  <p
                    id="checkout-promo-error"
                    className="text-[13px] md:text-[14px] leading-[1.35] text-red-600"
                  >
                    {promoError}
                  </p>
                )}
                {isPromoValidated && promoSuccess && !promoError && (
                  <p
                    id="checkout-promo-success"
                    className="text-[13px] md:text-[14px] leading-[1.35] text-green-600"
                  >
                    {promoSuccess}
                  </p>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-[10px] md:gap-[12px] lg:gap-[14px]">
              <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                Комментарий к заказу
              </label>
              <textarea
                placeholder="Оставьте пожелания к заказу"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={checkoutInputClassName(
                  false,
                  "h-[100px] md:h-[115px] lg:h-[130px] resize-none",
                )}
              />
            </div>
          </div>

          {/* Bonuses */}
          <div className="bg-[#f5f5f7] rounded-[14px] md:rounded-[16px] lg:rounded-[20px] p-[20px] md:p-[24px] lg:p-[30px] mb-[20px] md:mb-[24px] lg:mb-[30px]">
            <div className="flex items-center gap-[12px] md:gap-[14px] lg:gap-[15px] mb-[16px] md:mb-[18px] lg:mb-[20px]">
              <p className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                Бонусы:
              </p>
              <div className="flex items-center gap-[8px] md:gap-[10px]">
                <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="10" r="9" fill="#ef6f2e" />
                  </svg>
                </div>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#ef6f2e]">
                  {bonusesAvailable} бонусов
                </p>
                <InfoButtonWithModal title="Ваши бонусы">
                  <div className="space-y-[16px]">
                    <div className="bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] rounded-[14px] p-[16px] md:p-[20px]">
                      <div className="flex items-center justify-between mb-[12px]">
                        <span className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.7)]">
                          Доступно бонусов
                        </span>
                        <div className="flex items-center gap-[6px]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <circle cx="10" cy="10" r="9" fill="#ef6f2e" />
                          </svg>
                          <span className="font-semibold text-[18px] md:text-[20px] text-[#ef6f2e]">
                            {bonusesAvailable}
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                        Можно списать до 100% от суммы заказа
                      </p>
                    </div>

                    <div className="space-y-[12px]">
                      <h3 className="font-medium text-[16px] md:text-[18px] text-[#131314]">
                        Как использовать?
                      </h3>

                      <div className="flex gap-[12px]">
                        <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[16px]">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                            Включите списание
                          </p>
                          <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                            Активируйте переключатель &quot;Списать бонусы&quot;
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-[12px]">
                        <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[16px]">💰</span>
                        </div>
                        <div>
                          <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                            1 бонус = 1 рубль
                          </p>
                          <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                            Бонусы автоматически спишутся со счёта
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f5f5f7] rounded-[12px] p-[14px] md:p-[16px]">
                      <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                        ⚡ Бонусы нельзя использовать вместе с промокодом
                      </p>
                    </div>
                  </div>
                </InfoButtonWithModal>
              </div>
            </div>
            <div className="flex items-center gap-[16px] md:gap-[20px] lg:gap-[24px]">
              <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                Списать бонусы
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!isPromoValidated) {
                    setUseBonuses(!useBonuses);
                  }
                }}
                disabled={isPromoValidated}
                className={`w-[44px] h-[24px] rounded-[24px] relative transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  useBonuses && !isPromoValidated
                    ? "bg-[#ef6f2e]"
                    : "bg-[rgba(19,19,20,0.16)]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all ${
                    useBonuses && !isPromoValidated
                      ? "right-[2px]"
                      : "left-[2px]"
                  }`}
                />
              </button>
            </div>
            {isPromoValidated && (
              <p className="mt-[12px] text-[13px] md:text-[14px] leading-[1.35] text-[rgba(19,19,20,0.55)]">
                Бонусы отключены, потому что применен промокод.
              </p>
            )}
          </div>

          {/* Delivery method */}
          <div className="mb-[20px] md:mb-[24px] lg:mb-[30px]">
            <p className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314] mb-[20px] md:mb-[24px] lg:mb-[30px]">
              Способ доставки
            </p>
            <div className="flex flex-wrap gap-[8px] md:gap-[10px] mb-[20px] md:mb-[24px] lg:mb-[30px]">
              <button
                onClick={() => {
                  setDeliveryMethod("delivery");
                  clearFieldError("pickup");
                }}
                className={`px-[54px] py-[20px] rounded-[12px] font-normal text-[18px] leading-[1.1] transition-colors ${
                  deliveryMethod === "delivery"
                    ? "bg-[#ef6f2e] text-white"
                    : "bg-[#f5f5f7] text-[#131314]"
                }`}
              >
                Доставка
              </button>
              <button
                onClick={() => {
                  setDeliveryMethod("pickup");
                  clearFieldError("address");
                }}
                className={`px-[44px] py-[20px] rounded-[12px] font-normal text-[18px] leading-[1.1] transition-colors ${
                  deliveryMethod === "pickup"
                    ? "bg-[#ef6f2e] text-white"
                    : "bg-[#f5f5f7] text-[#131314]"
                }`}
              >
                Самовывоз
              </button>
            </div>

            {deliveryMethod === "delivery" && (
              <>
                {/* Address input */}
                <div
                  ref={addressFieldRef}
                  className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px] mb-[16px] md:mb-[20px] lg:mb-[24px] relative z-20"
                >
                  <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                    Укажите адрес доставки
                  </label>
                  <input
                    type="text"
                    placeholder="Куда доставить заказ?"
                    value={address}
                    onChange={handleAddressChange}
                    onFocus={handleAddressFocus}
                    onBlur={handleAddressBlur}
                    onKeyDown={handleAddressKeyDown}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={
                      fieldErrors.address ? "checkout-address-error" : undefined
                    }
                    className={checkoutInputClassName(
                      Boolean(fieldErrors.address),
                    )}
                  />
                  <FieldError
                    id="checkout-address-error"
                    message={fieldErrors.address}
                  />
                  {isAddressSuggestionsOpen && (
                    <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border border-[rgba(19,19,20,0.16)] rounded-[12px] shadow-[0px_8px_30px_rgba(19,19,20,0.12)] overflow-hidden z-[120]">
                      {isAddressSuggestionsLoading && (
                        <div className="px-[16px] py-[12px] text-[14px] text-[rgba(19,19,20,0.5)]">
                          Ищем адреса...
                        </div>
                      )}

                      {!isAddressSuggestionsLoading &&
                        addressSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.value}-${index}`}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              void handleAddressSuggestionSelect(suggestion);
                            }}
                            className={`w-full text-left px-[16px] py-[12px] transition-colors ${
                              activeSuggestionIndex === index
                                ? "bg-[#f5f5f7]"
                                : "bg-white hover:bg-[#f8f8f9]"
                            }`}
                          >
                            <p className="text-[15px] md:text-[16px] leading-[1.3] text-[#131314]">
                              {suggestion.title}
                            </p>
                            {suggestion.subtitle && (
                              <p className="text-[13px] md:text-[14px] leading-[1.3] text-[rgba(19,19,20,0.45)] mt-[2px]">
                                {suggestion.subtitle}
                              </p>
                            )}
                          </button>
                        ))}

                      {!isAddressSuggestionsLoading &&
                        addressSuggestions.length === 0 && (
                          <div className="px-[16px] py-[12px] text-[14px] text-[rgba(19,19,20,0.5)]">
                            Ничего не найдено, уточните адрес.
                          </div>
                        )}
                    </div>
                  )}
                  <p className="text-[13px] md:text-[14px] leading-[1.4] text-[rgba(19,19,20,0.55)]">
                    {deliveryPriceHint}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px] md:gap-[14px] lg:gap-[16px] mb-[16px] md:mb-[20px] lg:mb-[24px]">
                  <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]">
                    <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                      Подъезд
                    </label>
                    <input
                      type="text"
                      placeholder="Номер подъезда"
                      value={entrance}
                      onChange={(e) => setEntrance(e.target.value)}
                      className={checkoutInputClassName(false, "w-full")}
                    />
                  </div>

                  <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]">
                    <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                      Этаж
                    </label>
                    <input
                      type="text"
                      placeholder="Номер этажа"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className={checkoutInputClassName(false, "w-full")}
                    />
                  </div>

                  <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]">
                    <label className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                      Квартира
                    </label>
                    <input
                      type="text"
                      placeholder="Номер квартиры"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className={checkoutInputClassName(false, "w-full")}
                    />
                  </div>
                </div>

                {/* Manual address toggle */}
                <div className="flex items-center gap-[16px] md:gap-[20px] lg:gap-[24px]">
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                    Указать адрес без карты
                  </p>
                  <button
                    onClick={() => setManualAddress(!manualAddress)}
                    className={`w-[44px] h-[24px] rounded-[24px] relative transition-colors ${
                      manualAddress
                        ? "bg-[#ef6f2e]"
                        : "bg-[rgba(19,19,20,0.16)]"
                    }`}
                  >
                    <div
                      className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all ${
                        manualAddress ? "right-[2px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
            {deliveryMethod === "pickup" && (
              <div
                ref={pickupFieldRef}
                className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px]"
              >
                <p className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314]">
                  Адрес самовывоза
                </p>
                <div
                  className={checkoutInputClassName(
                    Boolean(fieldErrors.pickup),
                    "bg-white",
                  )}
                >
                  {pickupAddress ? (
                    <div className="flex flex-col gap-[6px]">
                      <p className="font-medium text-[#131314]">
                        {pickupPointForDisplay?.title || "Пункт самовывоза"}
                      </p>
                      <p>{pickupAddress}</p>
                      {pickupPointForDisplay?.workingHours && (
                        <p className="text-[14px] md:text-[15px] leading-[1.35] text-[rgba(19,19,20,0.55)]">
                          {pickupPointForDisplay.workingHours}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[rgba(19,19,20,0.55)]">
                      Пункты самовывоза временно недоступны.
                    </p>
                  )}
                </div>
                <FieldError
                  id="checkout-pickup-error"
                  message={fieldErrors.pickup}
                />
              </div>
            )}
          </div>

          {/* Delivery map - hide when manual address or pickup */}
          {deliveryMethod === "delivery" && !manualAddress && (
            <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[617px] rounded-[14px] md:rounded-[16px] lg:rounded-[20px] overflow-hidden mb-[20px] md:mb-[24px] lg:mb-[30px] relative z-0">
              {mapProvider === "yandex" ? (
                <div
                  id="yandex-map"
                  className="w-full h-full rounded-[14px] md:rounded-[16px] lg:rounded-[20px]"
                />
              ) : (
                <iframe
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                  src={buildOsmEmbedUrl(mapCenter)}
                  className="w-full h-full border-0 rounded-[14px] md:rounded-[16px] lg:rounded-[20px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта доставки"
                />
              )}
            </div>
          )}

          {/* Date and time selection */}
          <div className="mb-[20px] md:mb-[24px] lg:mb-[30px]">
            <p className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314] mb-[20px] md:mb-[24px] lg:mb-[30px]">
              Выберите дату и время доставки
            </p>
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-[20px]">
              {/* Date picker */}
              <div className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowTimePicker(false);
                  }}
                  className="w-full border border-[#ef6f2e] rounded-[12px] md:rounded-[14px] p-[16px] md:p-[20px] lg:p-[24px] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-[14px] md:gap-[16px] lg:gap-[20px]">
                    <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="14"
                          height="13"
                          rx="2"
                          stroke="#131314"
                          strokeWidth="1.5"
                        />
                        <path d="M3 8H17" stroke="#131314" strokeWidth="1.5" />
                        <path
                          d="M7 2V5"
                          stroke="#131314"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13 2V5"
                          stroke="#131314"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                      {selectedDate.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      })}
                    </p>
                  </div>
                  <div
                    className={`w-[16px] h-[16px] md:w-[18px] md:h-[18px] transition-transform ${showDatePicker ? "rotate-[-90deg]" : "rotate-90"}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 3L12 9L6 15"
                        stroke="#131314"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Date dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border border-[rgba(19,19,20,0.16)] rounded-[12px] shadow-lg z-50 overflow-hidden">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setShowDatePicker(false);
                          }}
                          className={`w-full p-[14px] md:p-[16px] text-left font-medium text-[15px] md:text-[16px] hover:bg-[#f5f5f7] transition-colors ${
                            selectedDate.toDateString() === date.toDateString()
                              ? "bg-[#ef6f2e] text-white hover:bg-[#ef6f2e]"
                              : "text-[#131314]"
                          }`}
                        >
                          {date.toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            weekday: "long",
                          })}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Time picker */}
              <div className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTimePicker(!showTimePicker);
                    setShowDatePicker(false);
                  }}
                  className="w-full border border-[rgba(19,19,20,0.16)] rounded-[12px] md:rounded-[14px] p-[16px] md:p-[20px] lg:p-[24px] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-[14px] md:gap-[16px] lg:gap-[20px]">
                    <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="#131314"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10 5V10L13 13"
                          stroke="#131314"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                      {selectedTimeSlot.replace("-", " – ")}
                    </p>
                  </div>
                  <div
                    className={`w-[16px] h-[16px] md:w-[18px] md:h-[18px] transition-transform ${showTimePicker ? "rotate-[-90deg]" : "rotate-90"}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 3L12 9L6 15"
                        stroke="#131314"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Time dropdown */}
                {showTimePicker && (
                  <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border border-[rgba(19,19,20,0.16)] rounded-[12px] shadow-lg z-50 overflow-hidden">
                    {[
                      "09:00-12:00",
                      "12:00-15:00",
                      "15:00-18:00",
                      "17:00-22:00",
                      "18:00-21:00",
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          setShowTimePicker(false);
                        }}
                        className={`w-full p-[14px] md:p-[16px] text-left font-medium text-[15px] md:text-[16px] hover:bg-[#f5f5f7] transition-colors ${
                          selectedTimeSlot === slot
                            ? "bg-[#ef6f2e] text-white hover:bg-[#ef6f2e]"
                            : "text-[#131314]"
                        }`}
                      >
                        {slot.replace("-", " – ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-[20px] md:mb-[24px] lg:mb-[30px]">
            <p className="font-medium text-[18px] md:text-[20px] lg:text-[22px] leading-[1.3] text-[#131314] mb-[20px] md:mb-[24px] lg:mb-[30px]">
              Способ оплаты
            </p>
            <div className="flex flex-wrap gap-[8px] md:gap-[10px] mb-[16px] md:mb-[20px] lg:mb-[24px]">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`px-[30px] md:px-[38px] lg:px-[48px] py-[16px] md:py-[18px] lg:py-[20px] rounded-[10px] md:rounded-[12px] font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] transition-colors ${
                  paymentMethod === "cash"
                    ? "bg-[#ef6f2e] text-white"
                    : "bg-[#f5f5f7] text-[#131314]"
                }`}
              >
                Наличными
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`px-[30px] md:px-[38px] lg:px-[48px] py-[16px] md:py-[18px] lg:py-[20px] rounded-[10px] md:rounded-[12px] font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] transition-colors ${
                  paymentMethod === "card"
                    ? "bg-[#ef6f2e] text-white"
                    : "bg-[#f5f5f7] text-[#131314]"
                }`}
              >
                По карте
              </button>
            </div>
            <p className="font-normal text-[13px] md:text-[14px] lg:text-[15px] leading-[1.4] text-[rgba(19,19,20,0.55)]">
              При оплате по карте к сумме товаров добавляется +
              {CARD_SURCHARGE_PERCENT}%. По техническим причинам, оплата онлайн
              недоступна.
            </p>
          </div>
        </div>

        {/* Right column - Order summary */}
        <div className="w-full lg:w-[400px] xl:w-[480px] 2xl:w-[547px] lg:sticky lg:top-[30px] h-fit">
          <div className="bg-white rounded-[14px] md:rounded-[16px] lg:rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[20px] md:p-[24px] lg:p-[30px]">
            <div className="flex items-center justify-between mb-[16px] md:mb-[18px] lg:mb-[20px]">
              <p className="font-medium text-[24px] md:text-[28px] lg:text-[32px] xl:text-[36px] leading-[1.3] text-[#131314]">
                Итого:
              </p>
              <p className="font-medium text-[24px] md:text-[28px] lg:text-[32px] xl:text-[36px] leading-[1.3] text-[#131314]">
                {formatRubPrice(totalPrice)} ₽
              </p>
            </div>

            <div className="flex flex-col gap-[14px] md:gap-[16px] lg:gap-[20px]">
              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  Товары ({itemsCount} шт.):
                </p>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                  {formatRubPrice(subtotal)} ₽
                </p>
              </div>

              {isPromoValidated && promoDiscount > 0 && (
                <>
                  <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

                  <div className="flex items-center justify-between gap-[16px]">
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                      Промокод {validatedCoupon?.code}:
                    </p>
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-green-600 whitespace-nowrap">
                      – {formatRubPrice(promoDiscount)} ₽
                    </p>
                  </div>
                </>
              )}

              {paymentMethod === "card" && (
                <>
                  <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                      Наценка по карте (+{CARD_SURCHARGE_PERCENT}%):
                    </p>
                    <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#ef6f2e]">
                      {formatRubPrice(paymentSurcharge)} ₽
                    </p>
                  </div>
                </>
              )}

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  Доставка:
                </p>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#ef6f2e]">
                  {deliveryPriceLabel}
                </p>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  Дата и время доставки:
                </p>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314] text-right">
                  17 ноября ; 17:00–22:00
                </p>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  {checkoutAddressTitle}
                </p>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.2] text-[#131314] text-right max-w-[60%] break-words">
                  {checkoutAddressValue}
                </p>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  Оплата:
                </p>
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314] text-right">
                  {paymentMethod === "cash"
                    ? "Наличными; при получении"
                    : `По карте; +${CARD_SURCHARGE_PERCENT}%`}
                </p>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                  Оплата бонусами:
                </p>
                <div className="flex items-center gap-[8px] md:gap-[10px]">
                  <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="9" fill="#ef6f2e" />
                    </svg>
                  </div>
                  <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#ef6f2e]">
                    – {bonuses} бонусов
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px] md:gap-[10px]">
                  <p className="font-normal text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                    Кешбэк за заказ
                  </p>
                  <InfoButtonWithModal title="Бонусная программа">
                    <div className="space-y-[16px]">
                      <div className="bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] rounded-[14px] p-[16px] md:p-[20px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] md:text-[16px] text-[rgba(19,19,20,0.7)]">
                            Кешбэк с заказа
                          </span>
                          <div className="flex items-center gap-[6px]">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M10 2L12.39 7.26L18 8.27L14 12.14L15.18 18L10 15.27L4.82 18L6 12.14L2 8.27L7.61 7.26L10 2Z"
                                fill="#ef6f2e"
                              />
                            </svg>
                            <span className="font-semibold text-[18px] md:text-[20px] text-[#ef6f2e]">
                              +{cashback} бонусов
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-[12px]">
                        <h3 className="font-medium text-[16px] md:text-[18px] text-[#131314]">
                          Как работают бонусы?
                        </h3>

                        <div className="flex gap-[12px]">
                          <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                            <span className="font-semibold text-[14px] text-[#ef6f2e]">
                              1
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                              Получайте кешбэк
                            </p>
                            <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                              {(cashbackRate * 100).toFixed(1)}% от суммы
                              каждого заказа возвращается бонусами
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-[12px]">
                          <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                            <span className="font-semibold text-[14px] text-[#ef6f2e]">
                              2
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                              Копите на счёте
                            </p>
                            <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                              Бонусы начисляются после получения заказа
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-[12px]">
                          <div className="w-[32px] h-[32px] bg-[#f5f5f7] rounded-full flex items-center justify-center shrink-0">
                            <span className="font-semibold text-[14px] text-[#ef6f2e]">
                              3
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[14px] md:text-[15px] text-[#131314]">
                              Оплачивайте покупки
                            </p>
                            <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                              1 бонус = 1 рубль. До 100% от стоимости заказа
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#f5f5f7] rounded-[12px] p-[14px] md:p-[16px]">
                        <p className="text-[13px] md:text-[14px] text-[rgba(19,19,20,0.6)]">
                          💡 Бонусы действуют 1 год с момента начисления
                        </p>
                      </div>
                    </div>
                  </InfoButtonWithModal>
                </div>
                <div className="flex items-center gap-[8px] md:gap-[10px]">
                  <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="9" fill="#131314" />
                    </svg>
                  </div>
                  <p className="font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.1] text-[#131314]">
                    + {cashback} бонусов
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[rgba(19,19,20,0.16)]" />

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || isLoading || cartItems.length === 0}
                className="bg-[#131314] rounded-[12px] md:rounded-[14px] py-[12px] md:py-[14px] px-[24px] md:px-[30px] lg:px-[34px] w-full hover:bg-[#2c2c2e] transition-colors disabled:bg-[#a0a0a0] disabled:cursor-not-allowed"
              >
                <p className="font-normal text-[18px] md:text-[20px] lg:text-[22px] leading-[2.2] text-white">
                  {isSubmitting ? "Оформляем..." : "Оформить заказ"}
                </p>
              </button>
            </div>
          </div>

          <p className="font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] text-[rgba(19,19,20,0.4)] text-center mt-[16px] md:mt-[18px] lg:mt-[20px]">
            Нажимая на кнопку, вы соглашаетесь на{" "}
            <a
              href="/privacy"
              target="_blank"
              className="underline hover:text-[#131314] transition-colors"
            >
              обработку персональных данных
            </a>{" "}
            и{" "}
            <a
              href="/privacy"
              target="_blank"
              className="underline hover:text-[#131314] transition-colors"
            >
              с публичной офертой
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
