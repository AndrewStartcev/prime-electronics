export interface Product {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isFavorite?: boolean;
  attributes?: { name: string; value: string; showInCard?: boolean }[];
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  guestName?: string | null;
  user: { id: string; name: string } | null;
}

export interface ProductDetail extends Product {
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  colors: ProductColor[];
  storageOptions: string[];
  selectedStorage: string;
  selectedColor: string;
  simOptions?: string[];
  selectedSim?: string;
  esimOptions?: string[];
  selectedEsim?: string;
  simEsimDisplay?: string;
  modificationOptions?: ProductModificationOption[];
  variantConfigurations?: ProductVariantConfiguration[];
  linkedVariants?: ProductLinkedVariant[];
  specifications: ProductSpecification[];
  deliveryInfo: {
    pickup: string;
    courier: string;
  };
  category: string;
  subcategory: string;
  reviews?: ProductReview[];
}

export interface ProductLinkedVariant {
  id: string;
  slug?: string;
  color: string;
  memory: string;
  sim: string;
  price: number;
  oldPrice?: number;
  isActive: boolean;
  inStock: boolean;
}

export interface ProductColor {
  id: string;
  name: string;
  image: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductModificationOption {
  id: string;
  label: string;
  price: number;
  oldPrice?: number;
  isCurrent: boolean;
}

export interface ProductVariantConfiguration {
  color: string;
  memory: string;
  sim: string;
  esim: string;
  price: number;
  oldPrice?: number;
  linkedProductId?: string;
}
