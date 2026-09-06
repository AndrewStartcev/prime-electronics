export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  subcategoryLinks?: Record<string, string>;
  description: string;
  imageUrl?: string;
  type: "brand" | "category";
}
