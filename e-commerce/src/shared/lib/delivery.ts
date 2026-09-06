export type CheckoutDeliveryMethod = "delivery" | "pickup";
export type DeliveryZone = "pickup" | "within_mkad" | "outside_mkad";

export const DELIVERY_WITHIN_MKAD_PRICE = 590;
export const DELIVERY_OUTSIDE_MKAD_PRICE = 990;

const MOSCOW_CENTER_COORDS: [number, number] = [55.7558, 37.6177];
const MKAD_RADIUS_KM = 18;

const OUTSIDE_MKAD_ADDRESS_HINTS = [
  "московская область",
  "мо,",
  "область",
  "химки",
  "мытищи",
  "балашиха",
  "люберцы",
  "подольск",
  "одинцово",
  "красногорск",
  "реутов",
  "котельники",
  "видное",
  "домодедово",
  "долгопрудный",
  "королев",
  "пушкино",
  "лобня",
  "зеленоград",
];

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const getDistanceKm = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
) => {
  const earthRadiusKm = 6371;
  const latDelta = degreesToRadians(lat2 - lat1);
  const lonDelta = degreesToRadians(lon2 - lon1);
  const firstLat = degreesToRadians(lat1);
  const secondLat = degreesToRadians(lat2);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const isWithinMkad = (coords: [number, number]) =>
  getDistanceKm(MOSCOW_CENTER_COORDS, coords) <= MKAD_RADIUS_KM;

const isAddressLikelyOutsideMkad = (address: string) => {
  const normalizedAddress = address.trim().toLowerCase();
  if (!normalizedAddress) return false;

  return OUTSIDE_MKAD_ADDRESS_HINTS.some((hint) =>
    normalizedAddress.includes(hint),
  );
};

export const getDeliveryZone = (
  deliveryMethod: CheckoutDeliveryMethod,
  coords: [number, number] | null,
  address = "",
): DeliveryZone => {
  if (deliveryMethod === "pickup") {
    return "pickup";
  }

  if (coords) {
    return isWithinMkad(coords) ? "within_mkad" : "outside_mkad";
  }

  return isAddressLikelyOutsideMkad(address) ? "outside_mkad" : "within_mkad";
};

export const getDeliveryPrice = (
  deliveryMethod: CheckoutDeliveryMethod,
  coords: [number, number] | null,
  address = "",
) => {
  const zone = getDeliveryZone(deliveryMethod, coords, address);

  if (zone === "pickup") return 0;

  return zone === "outside_mkad"
    ? DELIVERY_OUTSIDE_MKAD_PRICE
    : DELIVERY_WITHIN_MKAD_PRICE;
};

export const getDeliveryZoneLabel = (zone: DeliveryZone) => {
  if (zone === "pickup") return "Самовывоз";
  if (zone === "outside_mkad") return "За МКАД";

  return "До МКАД";
};

export const formatDeliveryPrice = (price: number) =>
  price > 0 ? `от ${price.toLocaleString("ru-RU")} ₽` : "Бесплатно";
