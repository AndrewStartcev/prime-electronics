import { Filter } from "./types";

export const defaultFilters: Filter[] = [
  {
    id: "in-stock",
    name: "В наличии",
    type: "checkbox",
  },
  {
    id: "categories",
    name: "Категории",
    type: "checkbox",
    options: [
      { id: "iphone", label: "Смартфоны Apple iPhone" },
      { id: "ipad", label: "Планшеты Apple iPad" },
      { id: "macbook", label: "Ноутбуки Apple Macbook" },
      { id: "watch", label: "Часы Apple Watch" },
      { id: "airpods", label: "Наушники Apple AirPods" },
      { id: "mac-mini", label: "Компьютеры Apple Mac mini" },
    ],
  },
  {
    id: "price",
    name: "Стоимость",
    type: "range",
    min: 0,
    max: 219000,
  },
  {
    id: "brand",
    name: "Бренд",
    type: "checkbox",
    options: [
      { id: "apple", label: "Apple" },
      { id: "samsung", label: "Samsung" },
      { id: "xiaomi", label: "Xiaomi" },
      { id: "sony", label: "Sony" },
      { id: "jbl", label: "JBL" },
      { id: "dyson", label: "Dyson" },
    ],
  },
  {
    id: "model",
    name: "Модель",
    type: "checkbox",
  },
  {
    id: "color",
    name: "Цвет",
    type: "checkbox",
  },
  {
    id: "camera",
    name: "Основная камера",
    type: "checkbox",
  },
  {
    id: "front-camera",
    name: "Фронтальная камера",
    type: "checkbox",
  },
  {
    id: "screen",
    name: "Диагональ экрана",
    type: "checkbox",
  },
  {
    id: "storage",
    name: "Встроенная память",
    type: "checkbox",
  },
  {
    id: "ram",
    name: "Оперативная память",
    type: "checkbox",
  },
  {
    id: "sim",
    name: "Количество SIM-карт",
    type: "checkbox",
  },
];

export const catalogCategories = {
  apple: {
    slug: "apple",
    name: "Техника Apple",
    count: 525,
    subcategories: [
      { id: "iphone", label: "Смартфоны Apple iPhone" },
      { id: "ipad", label: "Планшеты Apple iPad" },
      { id: "macbook", label: "Ноутбуки Apple Macbook" },
      { id: "watch", label: "Часы Apple Watch" },
      { id: "airpods", label: "Наушники Apple AirPods" },
      { id: "mac-mini", label: "Компьютеры Apple Mac mini" },
    ],
  },
  samsung: {
    slug: "samsung",
    name: "Техника Samsung",
    count: 342,
    subcategories: [
      { id: "galaxy-s", label: "Samsung Galaxy S" },
      { id: "galaxy-z", label: "Samsung Galaxy Z" },
      { id: "galaxy-watch", label: "Samsung Galaxy Watch" },
      { id: "galaxy-buds", label: "Samsung Galaxy Buds" },
    ],
  },
  xiaomi: {
    slug: "xiaomi",
    name: "Техника Xiaomi",
    count: 287,
    subcategories: [
      { id: "smartphones", label: "Смартфоны Xiaomi" },
      { id: "tablets", label: "Планшеты Xiaomi" },
      { id: "watches", label: "Часы Xiaomi" },
    ],
  },
  smartphones: {
    slug: "smartphones",
    name: "Смартфоны",
    count: 845,
    subcategories: [],
  },
  laptops: {
    slug: "laptops",
    name: "Ноутбуки",
    count: 156,
    subcategories: [],
  },
  headphones: {
    slug: "headphones",
    name: "Наушники",
    count: 234,
    subcategories: [],
  },
};
