import { Promotion } from "./types";

const rawPromotionsData: Promotion[] = [
  {
    id: "1",
    type: "trade-in",
    title: "Проверенная техника от нас c приятной скидкой для вас.",
    link: "/promotions#trade-in",
    variant: "dark",
    imageUrl: "/images/tradein.png",
  },
  {
    id: "2",
    type: "cashback",
    title: "Получайте кешбэк за покупки и платите бонусами до 100%.",
    link: "/promotions#cashback",
    variant: "accent",
    imageUrl: "/images/cards_mock.png",
  },
  {
    id: "4",
    type: "promo",
    title: "Подарки к покупкам: чехол и защитное стекло к выбранным смартфонам.",
    badgeLabel: "Подарки к покупкам",
    headline: "Получайте подарки к каждой покупке.",
    link: "/promotions#special",
    variant: "dark",
    imageUrl: "/images/promotions/gift-bundle-card.png",
    imageMode: "full-card",
  },
  {
    id: "6",
    type: "promo",
    title: "Экспресс-доставка: привезём заказ по Москве в кратчайшие сроки.",
    badgeLabel: "Быстрая доставка",
    headline: "Получайте свои заказы в кратчайшие сроки",
    link: "/promotions#express-delivery",
    variant: "dark",
    imageUrl: "/images/promotions/express-delivery-watch-card.png",
    imageMode: "full-card",
  },
  {
    id: "5",
    type: "promo",
    title: "Dyson для дома и ухода: стайлеры, фены и пылесосы с гарантией.",
    link: "/catalog/dyson",
    variant: "charcoal",
    imageUrl: "/images/promotions/dyson-promo-dark-2026.png",
  },
];

// Guard against accidental duplicates (same semantic offer with different ids)
const deduplicatePromotions = (items: Promotion[]): Promotion[] => {
  const seen = new Set<string>();
  const unique: Promotion[] = [];

  for (const item of items) {
    const key = `${item.type}|${item.link}|${item.title.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
};

export const promotionsData: Promotion[] = deduplicatePromotions(rawPromotionsData);
