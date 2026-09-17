export { apiClient } from "./client";
export { authApi } from "./authApi";
export type { LoginCredentials, AuthResponse, Admin } from "./authApi";

export { productsApi } from "./productsApi";
export type {
  Product,
  ProductFilter,
  CreateProductDto,
  UpdateProductDto,
  ProductVariantGroup,
  ProductVariantGroupProduct,
  ProductVariantGroupWithProducts,
  CatalogCleanupSuggestion,
  CatalogCleanupSuggestionsResponse,
} from "./productsApi";

export { categoriesApi } from "./categoriesApi";
export type {
  Category,
  CategoryTree,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./categoriesApi";

export { seoApi } from "./seoApi";
export type {
  SeoPageType,
  SeoTemplate,
  StaticPageSeo,
  SeoCollection,
  SeoCollectionSortBy,
  SeoTagTile,
  UpdateSeoTemplateDto,
  UpdateStaticPageSeoDto,
  UpsertSeoCollectionDto,
  UpsertSeoTagTileDto,
} from "./seoApi";

export { pageBuilderApi } from "./pageBuilderApi";
export type {
  StaticPageBlockType,
  StaticPageBlock,
  StaticBuilderPage,
  UpsertStaticBuilderPageDto,
} from "./pageBuilderApi";

export { ordersApi } from "./ordersApi";
export type {
  Order,
  OrderItem,
  OrderStatus,
  OrderFilter,
  UpdateOrderStatusDto,
} from "./ordersApi";

export { couponsApi } from "./couponsApi";
export type {
  Coupon,
  DiscountType,
  CreateCouponDto,
  UpdateCouponDto,
} from "./couponsApi";

export { brandsApi } from "./brandsApi";
export type { Brand, CreateBrandDto, UpdateBrandDto } from "./brandsApi";

export { pickupPointsApi } from "./pickupPointsApi";
export type {
  PickupPoint,
  ProductStock,
  CreatePickupPointDto,
  UpdatePickupPointDto,
  CreateProductStockDto,
  UpdateProductStockDto,
} from "./pickupPointsApi";

export { usersApi } from "./usersApi";
export type {
  User,
  UserRole,
  UserFilter,
  UpdateUserDto,
  AdjustUserBonusDto,
  ChangeUserPasswordDto,
  UserBonusAdjustmentResponse,
  UserBonusBalanceResponse,
} from "./usersApi";

export { uploadApi } from "./uploadApi";
export type { UploadResponse } from "./uploadApi";

export { statsApi } from "./statsApi";
export type { RevenueByPeriod, TopProduct, OrdersByStatus } from "./statsApi";

export { analyticsApi } from "./analyticsApi";

export { dashboardApi } from "./dashboard";
export type {
  DashboardStats,
  DashboardStat,
  RecentOrder,
  ProductsImportResult,
  ProductsImportError,
} from "../types/dashboard";

export { aiDescriptionsApi } from "./aiDescriptionsApi";
export type {
  AiDescriptionSettings,
  AiDescriptionDraft,
  AiDescriptionBatch,
  AiBatchProductStatus,
} from "./aiDescriptionsApi";

export { apiClient as api } from "./client";

export type { PaginatedResponse, PaginationParams } from "./categoriesApi";
