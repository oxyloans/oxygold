// const BASE_URL = "http://65.0.147.157:9900/api/oxygold-api";
import { API_BASE_URL } from "../../Config";
const BASE_URL = `${API_BASE_URL}/oxygold-api`;
/**
 * Get current partner access token from localStorage
 */
const getPartnerAuthToken = (): string => {
  const stored = localStorage.getItem("partner");
  if (stored) {
    const partnerData = JSON.parse(stored);
    return (
      partnerData.token ||
      partnerData.data?.accessToken ||
      partnerData.accessToken ||
      ""
    );
  }
  return "";
};

/**
 * Get current partner refresh token from localStorage
 */
const getPartnerRefreshToken = (): string => {
  const stored = localStorage.getItem("partner");
  if (stored) {
    const partnerData = JSON.parse(stored);
    return partnerData.refreshToken || partnerData.data?.refreshToken || "";
  }
  return "";
};

/**
 * Update partner tokens in localStorage
 */
const updatePartnerStoredTokens = (
  accessToken: string,
  refreshToken: string,
) => {
  const stored = localStorage.getItem("partner");
  if (stored) {
    const partnerData = JSON.parse(stored);
    if (partnerData.data) {
      partnerData.data.accessToken = accessToken;
      partnerData.data.refreshToken = refreshToken;
    } else {
      partnerData.token = accessToken;
      partnerData.refreshToken = refreshToken;
    }
    localStorage.setItem("partner", JSON.stringify(partnerData));
  }
};

/**
 * API to refresh partner access token
 */
export const refreshPartnerAccessToken = async () => {
  const rt = getPartnerRefreshToken();
  if (!rt) throw new Error("No refresh token available");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  const data = await response.json();
  if (response.ok && data.success) {
    updatePartnerStoredTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } else {
    throw new Error(data.message || "Failed to refresh token");
  }
};

/**
 * Authenticated fetch wrapper for partner
 */
const partnerAuthenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${getPartnerAuthToken()}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      const newToken = await refreshPartnerAccessToken();
      // Retry with new token
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      console.error("Partner token refresh failed:", error);
      throw error;
    }
  }

  return response;
};

// --- API Functions ---

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
  const response = await partnerAuthenticatedFetch(
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

export const isPartnerLoggedIn = (): boolean => {
  const partnerStr = localStorage.getItem("partner");
  return partnerStr ? JSON.parse(partnerStr).isLoggedIn : false;
};

// -- Logout Api --

export const logout = async () => {
  const refreshToken = getPartnerRefreshToken();
  const response = await partnerAuthenticatedFetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to logout");
  }
  return data;
};

// -- Delivery Boys Api --

export interface DeliveryBoy {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  alternateMobileNumber: string | null;
}

export const fetchDeliveryBoys = async () => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/viewAllDeliveryBoys`,
  );
  if (!response.ok) throw new Error("Failed to fetch delivery boys");
  return response.json();
};

export const updateDeliveryBoyStatus = async (
  id: number,
  status: "ACTIVE" | "INACTIVE",
) => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/${id}/status?status=${status}`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update delivery boy status");
  }

  return response.json();
};
// -- Orders Api --

export interface OrderItem {
  price: number;
  productId: number;
  quantity: number;
  subtotal: number;
}

export interface PartnerOrder {
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
  items: OrderItem[];
}

export const fetchActiveOrders = async (): Promise<PartnerOrder[]> => {
  const response = await partnerAuthenticatedFetch(`${BASE_URL}/order/active`);
  if (!response.ok) throw new Error("Failed to fetch active orders");
  const data = await response.json();
  return data.data;
};

export const fetchOrdersByStatus = async (
  status: string,
  page: number = 0,
  size: number = 10,
) => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/order/orders/by-status?status=${status}&page=${page}&size=${size}`,
  );
  if (!response.ok) throw new Error("Failed to fetch orders by status");
  const result = await response.json();
  return result.data;
};

export const getAllOrders = async (): Promise<PartnerOrder[]> => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/order/getAllOrders`,
  );
  if (!response.ok) throw new Error("Failed to fetch all orders");
  const data = await response.json();
  return data.data || [];
};

export const viewAllUsers = async (page: number, size: number) => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/auth/viewAllUsers?page=${page}&size=${size}`,
  );
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export interface AssignOrderPayload {
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

export interface RejectOrderPayload {
  deliveryId: number;
  reason: string;
}

export const assignOrder = async (payload: AssignOrderPayload) => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/admin/delivery/assign`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || "Failed to assign order");
  }
  return response.json();
};

export const rejectOrder = async (payload: RejectOrderPayload) => {
  const response = await partnerAuthenticatedFetch(
    `${BASE_URL}/delivery/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || "Failed to reject order");
  }
  return response.json();
};
