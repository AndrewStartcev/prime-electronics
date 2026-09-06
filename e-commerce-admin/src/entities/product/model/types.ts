// Product entity types согласно ТЗ
export interface Product {
  id: string;
  title: string;
  sku: string;
  price: number;
  oldPrice?: number;
  description: string;
  shortDescription?: string;
  images: string[];
  categoryId: string;
  attributes: ProductAttribute[];
  stockTotal: number;
  isActive: boolean;
  isPromo: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductStock {
  productId: string;
  pointId: string;
  stockCount: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isPromo?: boolean;
  inStock?: boolean;
}

export interface ProductFormData {
  title: string;
  sku: string;
  price: number;
  oldPrice?: number;
  description: string;
  shortDescription?: string;
  images: string[];
  categoryId: string;
  attributes: ProductAttribute[];
  isActive: boolean;
  isPromo: boolean;
}
