// Category entity types согласно ТЗ
export interface Category {
  id: string;
  parentId?: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productsCount: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  parentId?: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}
