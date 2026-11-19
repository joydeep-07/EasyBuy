export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  defaultAddress?: Address | string;
  createdAt?: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  permissions: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: { _id: string; name: string; slug: string } | string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttributeDefinition {
  _id: string;
  category: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'dropdown' | 'multi-select' | 'date' | 'measurement' | 'range';
  unit?: string;
  predefinedValues: string[];
  isRequired: boolean;
  isFilterable: boolean;
  allowMultiple: boolean;
  isVariantAttribute?: boolean;
  displayOrder?: number;
}

export interface ProductVariant {
  _id: string;
  product: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  reservedStock?: number;
  availableStock?: number;
  images: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  isAvailable: boolean;
  status: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  category: Category;
  subcategory?: Category;
  description: string;
  highlights: string[];
  specifications: { name: string; value: string }[];
  dynamicAttributes?: Record<string, any>;
  images: string[];
  thumbnail: string;
  basePrice: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  seller?: { name: string; rating: number; policy: string };
  warranty?: string;
  returnPolicy?: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'TEMPORARILY_UNAVAILABLE' | 'COMING_SOON' | 'DISABLED' | 'ARCHIVED';
  availabilityReason?: string;
  restrictedPincodes?: { pincode: string; reason: string }[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  viewCount?: number;
  salesCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface InventoryItem {
  _id: string;
  product: Product;
  variant?: ProductVariant;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt?: string;
}

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phoneNumber: string;
  houseBuilding: string;
  street: string;
  locality?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    slug: string;
    brand: string;
    images: string[];
    thumbnail: string;
    status: string;
  };
  variant?: string;
  sku: string;
  selectedAttributes: Record<string, string>;
  quantity: number;
  price: number;
  subtotal: number;
  maxStock: number;
}

export interface CartData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  appliedCoupon?: {
    _id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
}

export interface OrderItem {
  product: string;
  variant?: string;
  title: string;
  brand: string;
  sku: string;
  selectedAttributes: Record<string, string>;
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  trackingId?: string;
  user: string | User;
  items: OrderItem[];
  addressSnapshot: {
    fullName: string;
    phoneNumber: string;
    houseBuilding: string;
    street: string;
    locality?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    addressType: string;
  };
  paymentMethod: 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  appliedCoupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
  orderStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Packed'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Return Requested'
    | 'Returned'
    | 'Refund Initiated'
    | 'Refunded';
  statusHistory: {
    status: string;
    timestamp: string;
    comment?: string;
    updatedBy?: string;
  }[];
  shipment?: Shipment;
  trackingInfo?: {
    shippingCompany: string;
    trackingId: string;
    trackingUrl: string;
  };
  cancellationReason?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface Shipment {
  _id: string;
  order: string;
  orderNumber: string;
  shippingCompany: string;
  trackingId: string;
  trackingUrl: string;
  status: string;
  statusUpdates: { status: string; location: string; timestamp: string; notes?: string }[];
  shipmentDate?: string;
  estimatedDelivery?: string;
  deliveryNotes?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
}

export interface Review {
  _id: string;
  product: string | Product;
  user: User;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isHidden: boolean;
  helpfulVotes?: number;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  user?: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DeliveryZone {
  _id: string;
  name?: string;
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedDeliveryDays: number;
  deliveryFee: number;
  isCodAvailable: boolean;
  isExpressAvailable: boolean;
  expressDeliveryFee?: number;
}
