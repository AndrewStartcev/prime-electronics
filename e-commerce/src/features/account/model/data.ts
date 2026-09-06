import { User, AccountTab, AccountCardData, Order, OrderDetail } from "./types";
import { CONTACT_PHONE_DISPLAY } from "@/shared/lib/contactInfo";

export const mockUser: User = {
  id: "1",
  name: "Меньшикова Александра Валерьевна",
  email: "ivan.ivanov@mail.ru",
  phone: CONTACT_PHONE_DISPLAY,
  bonusBalance: 399,
};

export const accountTabs: AccountTab[] = [
  { id: "profile", label: "Мой кабинет", href: "/account" },
  { id: "personal", label: "Личные данные", href: "/account/personal" },
  { id: "orders", label: "Мои заказы", href: "/account/orders" },
  { id: "favorites", label: "Избранное", href: "/account/favorites" },
  { id: "subscriptions", label: "Подписки", href: "/account/subscriptions" },
  { id: "logout", label: "Выйти", href: "/logout" },
];

export const accountCards: AccountCardData[] = [
  {
    id: "favorites",
    title: "Избранное",
    subtitle: "4 товара",
    icon: "favorites",
    href: "/account/favorites",
    isActive: true,
  },
  {
    id: "orders",
    title: "Мои заказы",
    subtitle: "Нет заказов",
    icon: "orders",
    href: "/account/orders",
  },
  {
    id: "help",
    title: "Помощь",
    subtitle: "Задайте вопрос",
    icon: "help",
    href: "/contacts",
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "345905",
    status: "DELIVERED",
    date: "17.11.2025",
    itemsCount: 2,
    customerName: "Меньшикова А.В.",
    totalAmount: 299380,
  },
  {
    id: "2",
    orderNumber: "345904",
    status: "CANCELLED",
    date: "17.11.2025",
    itemsCount: 2,
    customerName: "Меньшикова А.В.",
    totalAmount: 299380,
  },
  {
    id: "3",
    orderNumber: "345903",
    status: "PROCESSING",
    date: "17.11.2025",
    itemsCount: 2,
    customerName: "Меньшикова А.В.",
    totalAmount: 299380,
  },
  {
    id: "4",
    orderNumber: "345902",
    status: "SHIPPED",
    date: "17.11.2025",
    itemsCount: 2,
    customerName: "Меньшикова А.В.",
    totalAmount: 299380,
  },
];

export const mockOrderDetail: OrderDetail = {
  id: "1",
  orderNumber: "345905",
  status: "DELIVERED",
  date: "17 ноября",
  time: "17:00-22:00",
  itemsCount: 2,
  customerName: "Меньшикова Александра Валерьевна",
  totalAmount: 299380,
  address: "г. Москва, улица Барклая, 6Ак1",
  deliveryCost: 390,
  paymentMethod: "Банковская карта; при получении",
  bonusUsed: 399,
  cashback: 200,
  products: [
    {
      id: "1",
      productId: "1",
      name: "Смартфон Apple iPhone 17 Pro 512Gb Cosmic Orange (1 sim + eSIM)",
      image: "/images/products/iphone-orange.png",
      price: 129690,
    },
    {
      id: "2",
      productId: "2",
      name: "Смартфон Apple iPhone 17 Pro 512Gb Cosmic Orange (1 sim + eSIM)",
      image: "/images/products/iphone-orange.png",
      price: 129690,
    },
  ],
};
