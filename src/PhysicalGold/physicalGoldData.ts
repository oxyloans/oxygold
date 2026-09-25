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

export const S3_IMAGE_BASE_URL =
  import.meta.env.VITE_S3_IMAGE_BASE_URL;

const PRODUCT_IMAGE_VIEW_KEYS = [
  "frontViewurl",
  "backViewUrl",
  "leftViewUrl",
  "rightViewUrl",
  "topViewUrl",
  "bottomViewUrl",
] as const;

/** APIs return `/image/...` signed paths; prepend the S3 host. Full URLs are left unchanged. */
export const resolveS3ImageUrl = (url?: string | null): string => {
  if (typeof url !== "string") return "";
  const value = url.trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (
    /^https?:\/\//i.test(value) ||
    /^data:image\//i.test(value) ||
    /^blob:/i.test(value)
  ) {
    return value;
  }
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${S3_IMAGE_BASE_URL}${value}`;
  return `${S3_IMAGE_BASE_URL}/${value}`;
};

export const resolveProductImageSet = (
  imageSet?: ProductImageSet | null,
): ProductImageSet | null => {
  if (!imageSet) return null;
  return {
    frontViewurl: resolveS3ImageUrl(imageSet.frontViewurl) || null,
    backViewUrl: resolveS3ImageUrl(imageSet.backViewUrl) || null,
    leftViewUrl: resolveS3ImageUrl(imageSet.leftViewUrl) || null,
    rightViewUrl: resolveS3ImageUrl(imageSet.rightViewUrl) || null,
    topViewUrl: resolveS3ImageUrl(imageSet.topViewUrl) || null,
    bottomViewUrl: resolveS3ImageUrl(imageSet.bottomViewUrl) || null,
    expriesIn: imageSet.expriesIn,
  };
};

export const firstProductImageUrl = (
  imageSet?: ProductImageSet | null,
): string => {
  const resolved = resolveProductImageSet(imageSet);
  if (!resolved) return "";
  return (
    PRODUCT_IMAGE_VIEW_KEYS.map((key) => resolved[key]).find(
      (url) => typeof url === "string" && url.trim(),
    ) || ""
  );
};

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
  id?: number;
  orderItemId?: number;
  price: number;
  productId: number;
  productName?: string;
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
