export interface Promotion {
  id: string;
  type: "trade-in" | "cashback" | "promo";
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageMode?: "decorative" | "full-card";
  badgeLabel?: string;
  headline?: string;
  link: string;
  variant?: "dark" | "charcoal" | "accent" | "orange";
}
