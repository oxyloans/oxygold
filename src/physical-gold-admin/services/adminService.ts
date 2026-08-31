import { API_BASE_URL } from "../../Config";

let BASE_URL = API_BASE_URL + "/oxygold-api";

/**
 * Get current admin access token from localStorage
 */
const getAdminAuthToken = (): string => {
  const stored = localStorage.getItem("admin");
  if (stored) {
    const adminData = JSON.parse(stored);
    return (
      adminData.token ||
      adminData.data?.accessToken ||
      adminData.accessToken ||
      ""
    );
  }
  return "";
};

/**
 * Get current admin refresh token from localStorage
 */
const getAdminRefreshToken = (): string => {
  const stored = localStorage.getItem("admin");
  if (stored) {
    const adminData = JSON.parse(stored);
    return adminData.refreshToken || adminData.data?.refreshToken || "";
  }
  return "";
};

/**
 * Update admin tokens in localStorage
 */
const updateAdminStoredTokens = (accessToken: string, refreshToken: string) => {
  const stored = localStorage.getItem("admin");
  if (stored) {
    const adminData = JSON.parse(stored);
    if (adminData.data) {
      adminData.data.accessToken = accessToken;
      adminData.data.refreshToken = refreshToken;
    } else {
      adminData.token = accessToken;
      adminData.refreshToken = refreshToken;
    }
    localStorage.setItem("admin", JSON.stringify(adminData));
  }
};

/**
 * API to refresh admin access token
 */
export const refreshAdminAccessToken = async () => {
  const rt = getAdminRefreshToken();
  if (!rt) throw new Error("No refresh token available");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  const data = await response.json();
  if (response.ok && data.success) {
    updateAdminStoredTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } else {
    throw new Error(data.message || "Failed to refresh token");
  }
};

/**
 * Authenticated fetch wrapper for admin
 */
const adminAuthenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${getAdminAuthToken()}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      const newToken = await refreshAdminAccessToken();
      // Retry with new token
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      console.error("Admin token refresh failed:", error);
      throw error;
    }
  }

  return response;
};

export interface DeliveryPricingConfiguration {
  ratePerKm: number;
  minimumFee: number;
  maximumFee: number;
  freeDeliveryThreshold: number;
  warehouseLatitude: number;
  warehouseLongitude: number;
  enabled: boolean;
}

export const fetchDeliveryPricing = async (): Promise<DeliveryPricingConfiguration> => {
  const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/delivery-pricing`, {
    headers: { Accept: "*/*" },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Unable to load delivery pricing.");
  }
  return result?.data ?? result;
};

export const updateDeliveryPricing = async (
  configuration: DeliveryPricingConfiguration,
): Promise<DeliveryPricingConfiguration> => {
  const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/delivery-pricing`, {
    method: "PUT",
    headers: { Accept: "*/*" },
    body: JSON.stringify(configuration),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Unable to update delivery pricing.");
  }
  return result?.data ?? result;
};

// --- API Functions ---

export const fetchMainCategories = async (status?: "ACTIVE" | "INACTIVE") => {
  const url = status
    ? `${BASE_URL}/admin/categories/category-management/parent-categories?status=${status}`
    : `${BASE_URL}/admin/categories/category-management/parent-categories`;
  const response = await adminAuthenticatedFetch(url);
  if (!response.ok) throw new Error("Failed to fetch main categories");
  return response.json();
};

export const fetchSubCategories = async (parentId: number | string) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/categories/category-management/sub-categories?parentId=${parentId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch sub-categories");
  return response.json();
};

export const fetchCategoryImageURL = async (categoryId: number | string) => {
  try {
    const response = await adminAuthenticatedFetch(
      `${BASE_URL}/admin/categories/getImageForProduct?categoryId=${categoryId}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error(`Failed to fetch image for category ${categoryId}:`, error);
    return null;
  }
};

export const fetchProductImageURL = async (productId: number | string) => {
  try {
    const response = await adminAuthenticatedFetch(
      `${BASE_URL}/admin/categories/getImageForProduct?productId=${productId}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error(`Failed to fetch image for product ${productId}:`, error);
    return null;
  }
};

export const uploadCatalogImage = async (
  file: File,
  params: {
    documentType: string;
    categoryId?: number;
    productId?: number;
    viewType: string;
  },
) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAdminAuthToken();

  const queryParams = new URLSearchParams({
    documentType: params.documentType,
    viewType: params.viewType,
  });

  if (params.categoryId)
    queryParams.append("categoryId", params.categoryId.toString());
  if (params.productId)
    queryParams.append("productId", params.productId.toString());

  const response = await fetch(
    `${BASE_URL}/admin/categories/uploadImages?${queryParams.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ keep this only
      },
      body: formData,
    },
  );

  if (!response.ok) throw new Error("Image upload failed");
  return response.json();
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAdminAuthToken();
  const response = await fetch(
    `${BASE_URL}/auth/upload?documentType=image&userId=9`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) throw new Error("Image upload failed");
  return response.json();
};

export const createCategory = async (data: any) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/categories/createCategory`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create category");
  }
  return response.json();
};

export const updateCategory = async (data: any) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/categories/updateCategory`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update category");
  }
  return response.json();
};

// --- Products API ---

export const getAllProducts = async (categoryId: number | string) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/products/getAllProduct?categoryId=${categoryId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const createProduct = async (data: any) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/products/createProduct`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create product");
  }
  return response.json();
};

export const updateProduct = async (productId: number | string, data: any) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/products/updateProduct/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update product");
  }
  return response.json();
};

export const updateProductStatus = async (
  productId: number | string,
  data: any,
) => {
  const payload = {
    status: data,
  };
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/products/updateProduct/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update product status");
  }
  return response.json();
};

export const updateCategoryStatus = async (
  categoryId: number | string,
  status: string,
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/categories/status?categoryId=${categoryId}&status=${status}`,
    {
      method: "PATCH",
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update category status");
  }
  return response.json();
};

// --- Product Variants API ---

export const getAllVariants = async (productId: number | string) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/productvariants/getVariantByProduct?productId=${productId}`,
  );
  console.log(response);
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) throw new Error("Failed to fetch variants");
  return response.json();
};

export const addVariant = async (productId: number | string, data: any) => {
  const { sku, size, purity, weight, mrp, stockQuantity } = data;
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/productvariants/addVariant/${productId}`,
    {
      method: "POST",
      body: JSON.stringify({ sku, size, purity, weight, mrp, stockQuantity }),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to add variant");
  }
  return response.json();
};

export const updateVariantStatus = async (
  variantId: number | string,
  status: string,
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/productvariants/${variantId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) throw new Error("Failed to update status");
  return response.json();
};

export const updateVariantQuantity = async (
  variantId: number | string,
  stockQuantity: number,
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/productvariants/${variantId}/quantity`,
    {
      method: "PATCH",
      body: JSON.stringify({ stockQuantity }),
    },
  );
  if (!response.ok) throw new Error("Failed to update quantity");
  return response.json();
};

export const updateVariantPrice = async (
  variantId: number | string,
  price: number,
  mrp: number,
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/productvariants/${variantId}/price`,
    {
      method: "PATCH",
      body: JSON.stringify({ price, mrp }),
    },
  );
  if (!response.ok) throw new Error("Failed to update price");
  return response.json();
};

export const adminLogin = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/adminLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Login failed");
  }
  return data;
};

export const loginOrRegister = async (params: any) => {
  const response = await fetch(`${BASE_URL}/auth/userLoginOrRegister`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Authentication failed");
  }
  return data;
};

export const createRole = async (role: string) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/auth/createRole`,
    {
      method: "POST",
      body: JSON.stringify({ role }),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to create role");
  }
  return data;
};

export const isAdminLoggedIn = (): boolean => {
  const adminStr = localStorage.getItem("admin");
  return adminStr ? JSON.parse(adminStr).isLoggedIn : false;
};

// -- Logout Api --

export const logout = async () => {
  const refreshToken = getAdminRefreshToken();
  const response = await adminAuthenticatedFetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to logout");
  }
  return data;
};

// -- Orders Api --

export interface OrderItem {
  price: number;
  productId: number;
  quantity: number;
  subtotal: number;
  productName?: string;
  variant?: string;
  orderItemId?: number;
}

export interface AdminOrder {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  paymentExpiry: string;
  paymentMode: string;
  paymentSessionId: string | null;
  paymentStatus: string;
  phoneNumber: string;
  totalAmount: number;
  totalItems: number;
  txnId: string | null;
  userEmail: string | null;
  userId: number;
  userName: string | null;
  createdAt?: string;
  flatNo?: string | null;
  address?: string | null;
  landMark?: string | null;
  state?: string | null;
  pinCode?: string | null;
  longitude?: string | number | null;
  latitude?: string | number | null;
  deliveryId?: number | null;
  trackingNumber?: string | null;
  deliveryStatus?: string | null;
  deliveryBoyName?: string | null;
  deliveryBoyPhone?: string | null;
  items: OrderItem[];
  delivery?: DeliveryTracking | null;
}

export interface PaginatedOrders {
  content: AdminOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface DayScoreCard {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  successOrders: number;
  pendingOrders: number;
  failedOrders: number;
  deliveredOrders: number | null;
  newOrders: number | null;
  cashfreeRevenue: number | null;
  codRevenue: number | null;
  walletRevenue: number | null;
}

export interface PaymentModeSummaryItem {
  paymentMode: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface PaymentModeSummary {
  cashfreeOrders: number;
  cashfreeRevenue: number;
  codOrders: number;
  codRevenue: number;
  allModes: PaymentModeSummaryItem[];
}

export const fetchActiveOrders = async (
  page = 0,
  size = 10,
): Promise<PaginatedOrders> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/order/active-orders?page=${page}&size=${size}`,
  );
  if (!response.ok) throw new Error("Failed to fetch active orders");
  return response.json();
};

const readAdminApiData = async <T>(response: Response): Promise<T> => {
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false)
    throw new Error(result?.message || `Request failed (${response.status})`);
  return result?.data as T;
};

export interface AdminReviewMedia {
  id: number;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  displayOrder: number;
}
export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userFullName: string;
  userEmail?: string;
  orderId?: number;
  orderItemId?: number;
  rating: number;
  title: string;
  reviewText: string;
  verifiedPurchase: boolean;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  helpfulCount: number;
  notHelpfulCount: number;
  media: AdminReviewMedia[];
  createdAt: string;
  updatedAt: string;
}
export interface AdminReviewPage {
  content: AdminReview[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
export interface ProductRatingSummary {
  productId: number;
  averageRating: number;
  totalRatings: number;
  oneStarCount: number;
  twoStarCount: number;
  threeStarCount: number;
  fourStarCount: number;
  fiveStarCount: number;
  oneStarPercentage: number;
  twoStarPercentage: number;
  threeStarPercentage: number;
  fourStarPercentage: number;
  fiveStarPercentage: number;
}

export const adminFetchReviews = async (page = 0, size = 20) =>
  readAdminApiData<AdminReviewPage>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
    ),
  );
export const adminApproveReview = async (reviewId: number) =>
  readAdminApiData<AdminReview>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews/${reviewId}/approve`,
      { method: "POST", body: "" },
    ),
  );
export const adminRejectReview = async (reviewId: number, reason: string) => {
  const cleanReason = reason.trim();
  if (cleanReason.length < 3 || cleanReason.length > 500)
    throw new Error("Rejection reason must be between 3 and 500 characters.");
  return readAdminApiData<AdminReview>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews/${reviewId}/reject`,
      { method: "POST", body: JSON.stringify({ reason: cleanReason }) },
    ),
  );
};
export const adminDeleteReview = async (reviewId: number) =>
  readAdminApiData<null>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews/${reviewId}`,
      { method: "DELETE" },
    ),
  );
export const adminFetchProductReviews = async (
  productId: number,
  params: {
    rating?: number;
    verifiedPurchase?: boolean;
    search?: string;
    page?: number;
    size?: number;
  } = {},
) => {
  const query = new URLSearchParams({
    page: String(params.page || 0),
    size: String(params.size || 20),
  });
  if (params.rating) query.set("rating", String(params.rating));
  if (params.verifiedPurchase !== undefined)
    query.set("verifiedPurchase", String(params.verifiedPurchase));
  if (params.search?.trim()) query.set("search", params.search.trim());
  return readAdminApiData<AdminReviewPage>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews/products/${productId}/reviews?${query}`,
    ),
  );
};
export const adminFetchProductRatingSummary = async (productId: number) =>
  readAdminApiData<ProductRatingSummary>(
    await adminAuthenticatedFetch(
      `${BASE_URL}/ratings/admin/reviews/products/${productId}/rating-summary`,
    ),
  );

export const fetchDayScoreCard = async (
  date: string,
): Promise<DayScoreCard> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/order/dashboard/day-score-card?date=${encodeURIComponent(date)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch day score card");
  return response.json();
};

export const fetchPaymentModeSummary = async (
  startDate: string,
  endDate: string,
): Promise<PaymentModeSummary> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/order/orders/payment-mode-summary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch payment mode summary");
  const data = await response.json();
  return data.data;
};

export const getAllOrders = async (): Promise<AdminOrder[]> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/order/getAllOrders`,
  );
  if (!response.ok) throw new Error("Failed to fetch all orders");
  const data = await response.json();
  return data.data || [];
};

// -- Delivery Management API --

export interface DeliveryBoy {
  id: number;
  status: "ACTIVE" | "INACTIVE";
  firstName: string;
  lastName: string;
  userId: number;
  email: string;
  phone: string;
  alternateMobileNumber: string | null;
}

export interface AssignDeliveryPayload {
  orderId: number;
  orderNumber: string;
  deliveryBoyId: number;
  userId: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  notes: string;
}

export interface ReassignDeliveryPayload {
  deliveryId: number;
  newDeliveryBoyId: number;
  reason: string;
}

export interface DeliveryTracking {
  deliveryId?: number;
  id?: number;
  trackingNumber: string;
  orderNumber: string;
  orderId: number;
  status: string;
  statusLabel: string;
  statusDescription: string;
  deliveryBoy: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
  } | null;
  liveLocation: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  } | null;
  deliveryAddress: string;
  assignedAt: string | null;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  timeline: Array<{
    status: string;
    statusLabel: string;
    description: string;
    timestamp: string;
  }>;
}

export interface AdminDeliveryAssignment {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerLatitude: number | null;
  customerLongitude: number | null;
  notes: string | null;
  assignedAt: string | null;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
}

const readDeliveryResponse = async <T>(
  response: Response,
  fallback: string,
): Promise<T> => {
  const result = await response.json();
  if (!response.ok || result.success === false)
    throw new Error(result.message || fallback);
  return result.data;
};

export const fetchAdminDeliveryBoys = async (): Promise<DeliveryBoy[]> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/viewAllDeliveryBoys`,
    {
      headers: { Accept: "*/*" },
    },
  );
  return readDeliveryResponse<DeliveryBoy[]>(
    response,
    "Failed to fetch delivery boys",
  );
};

export const updateAdminDeliveryBoyStatus = async (
  id: number,
  status: "ACTIVE" | "INACTIVE",
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/${id}/status?status=${status}`,
    { method: "PUT", headers: { Accept: "*/*" } },
  );
  return readDeliveryResponse<string>(
    response,
    "Failed to update delivery-boy status",
  );
};

export const assignAdminDelivery = async (payload: AssignDeliveryPayload) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/assign`,
    {
      method: "POST",
      headers: { Accept: "*/*" },
      body: JSON.stringify(payload),
    },
  );
  return readDeliveryResponse<any>(response, "Failed to assign delivery");
};

export const reassignAdminDelivery = async (
  payload: ReassignDeliveryPayload,
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/reassign`,
    {
      method: "POST",
      headers: { Accept: "*/*" },
      body: JSON.stringify(payload),
    },
  );
  return readDeliveryResponse<any>(response, "Failed to reassign delivery");
};

export const trackAdminDelivery = async (
  trackingNumber: string,
  userId: number,
): Promise<DeliveryTracking> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/track?trackingNumber=${encodeURIComponent(trackingNumber)}`,
    { headers: { Accept: "*/*", "X-User-Id": String(userId) } },
  );
  return readDeliveryResponse<DeliveryTracking>(
    response,
    "Failed to track delivery",
  );
};

export const fetchAdminDeliveryByOrder = async (
  orderId: number,
  userId: number,
): Promise<DeliveryTracking> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/order/${orderId}`,
    {
      headers: { Accept: "*/*", "X-User-Id": String(userId) },
    },
  );
  return readDeliveryResponse<DeliveryTracking>(
    response,
    "Failed to fetch order delivery",
  );
};

export const fetchAdminAssignedDeliveries = async (
  deliveryBoyId: number,
): Promise<AdminDeliveryAssignment[]> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/delivery/assigned`,
    {
      headers: { Accept: "*/*", "X-DeliveryBoy-Id": String(deliveryBoyId) },
    },
  );
  return readDeliveryResponse<AdminDeliveryAssignment[]>(
    response,
    "Failed to fetch assigned deliveries",
  );
};

export const viewAllUsers = async (
  page: number,
  size: number,
  name?: string,
  phoneNumber?: string,
) => {
  let url = `${BASE_URL}/auth/viewAllUsers?page=${page}&size=${size}`;
  if (name) url += `&name=${encodeURIComponent(name)}`;
  if (phoneNumber) url += `&phoneNumber=${encodeURIComponent(phoneNumber)}`;
  const response = await adminAuthenticatedFetch(url);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

// -- Helpdesk API --

export interface UserDocument {
  userDocumentId: number;
  userId: number;
  filePath: string;
  fileName: string;
  createdDate: string;
  adminDocumentId: number | null;
  adminUploadedFileName: string | null;
  adminUploadedFilePath: string | null;
  adminUploadCreatedDate: string | null;
  documentName?: string;
  documentPath?: string;
  uploadedAt?: string;
}

export interface HelpdeskQuery {
  id: number;
  ticketId?: number;
  userId: number;
  name: string;
  query: string;
  randomTicketId: string;
  queryStatus: string;
  email: string;
  number: string;
  comments: string | null;
  resolvedBy: string | null;
  projectType: string;
  createdAt: string;
  resolvedOn: string | null;
  userDocuments: UserDocument[];
  userPendingQueries?: Array<{
    id: number;
    pendingComments?: string;
    message?: string;
    createdAt?: string;
    resolvedBy?: string | null;
    resolvedOn?: string | null;
  }>;
}

export interface HelpdeskQueryParams {
  userId?: number;
  queryStatus?: string;
  page: number;
  size: number;
}

export const adminGetAllQueries = async (
  params: HelpdeskQueryParams,
): Promise<{
  content: HelpdeskQuery[];
  totalElements: number;
  totalPages: number;
}> => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/helpdesk/getAllQueries`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  if (!response.ok) throw new Error("Failed to fetch queries");
  const result = await response.json();
  return result.data ?? result;
};

export const adminUploadQueryScreenshot = async (
  adminId: number,
  queryId: number,
  file: File,
  fileType = "IMAGE",
) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAdminAuthToken();
  const response = await fetch(
    `${BASE_URL}/helpdesk/multiUploadQueryScreenShot?adminId=${adminId}&queryId=${queryId}&fileType=${fileType}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );
  if (!response.ok) throw new Error("Failed to upload screenshot");
  return response.json();
};

export const adminResolveQuery = async (
  queryId: number,
  payload: { userId: number; queryStatus: string; comments: string },
) => {
  const response = await adminAuthenticatedFetch(
    `${BASE_URL}/helpdesk/adminResolveQuery/${queryId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw new Error("Failed to resolve query");
  return response.json();
};

export const exportOrdersPDF = async (filters?: {
  search?: string;
  paymentStatus?: string;
  orderStatus?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const token = getAdminAuthToken();
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.paymentStatus)
    queryParams.append("paymentStatus", filters.paymentStatus);
  if (filters?.orderStatus)
    queryParams.append("orderStatus", filters.orderStatus);
  if (filters?.fromDate) queryParams.append("fromDate", filters.fromDate);
  if (filters?.toDate) queryParams.append("toDate", filters.toDate);

  const url = queryParams.toString()
    ? `${BASE_URL}/order/export/pdf?${queryParams.toString()}`
    : `${BASE_URL}/order/export/pdf`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to export orders");
  return response.blob();
};
