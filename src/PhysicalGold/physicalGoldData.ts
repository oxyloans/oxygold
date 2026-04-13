// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductImageSet {
  frontViewurl: string | null;
  backViewUrl: string | null;
  leftViewUrl: string | null;
  rightViewUrl: string | null;
  topViewUrl: string | null;
  bottomViewUrl: string | null;
  expriesIn?: number;
}

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
  imageSet?: ProductImageSet;
  isBestSeller?: boolean;
  categoryId?: string;
  categoryName?: string;
  subCategoryName?: string;
  weight?: number | string;
  purity?: string;
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
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────
export const dummyHandpickedProducts: PhysicalGoldProduct[] = [
  {
    id: "dummy-1",
    productName: "Emmeral Gold Radiance Necklace",
    imageUrl: "https://images.unsplash.com/photo-1599643478514-4a18f1a148a2?auto=format&fit=crop&q=80&w=600",
    priceRange: "₹85,000",
    description: "A stunning 22K gold necklace with an elegant modern design.",
    subCategoryId: "dummy",
    status: "Active",
  },
  {
    id: "dummy-2",
    productName: "Classic Gold Bangles Set",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
    priceRange: "₹1,20,000",
    description: "Traditional set of two 22K solid gold bangles with intricate carvings.",
    subCategoryId: "dummy",
    status: "Active",
  },
  {
    id: "dummy-3",
    productName: "Diamond Solitaire Gold Ring",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f66122be1?auto=format&fit=crop&q=80&w=600",
    priceRange: "₹45,500",
    description: "Beautiful 22K gold ring with a sparkling solitaire centerpiece.",
    subCategoryId: "dummy",
    status: "Active",
  },
  {
    id: "dummy-4",
    productName: "Pearl Drop Gold Earrings",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    priceRange: "₹28,000",
    description: "Elegant pearl earrings set in fine 22K gold.",
    subCategoryId: "dummy",
    status: "Active",
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// (End of file)
