// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductVariant {
  id: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  purity: string;
  size: string;
  sku: string;
  status: string;
  stockQuantity: number;
  weight: number;
}

export interface PhysicalGoldProduct {
  id: string;
  productName: string;
  imageUrl?: string;
  priceRange: string;
  description: string;
  subCategoryId: string;
  status: string;
  gstPercentage?: number;
  makingPercentage?: number;
}
export interface OrderItem {
  price: number;
  productId: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  paymentExpiry: string;
  paymentMode: string;
  paymentSessionId: string | null;
  paymentStatus: string;
  totalAmount: number;
  totalItems: number;
  userId: number;
  items: OrderItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// (End of file)
