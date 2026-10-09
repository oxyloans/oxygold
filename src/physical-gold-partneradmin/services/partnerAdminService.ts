import { API_BASE_URL } from "../../Config";

const BASE_URL = `${API_BASE_URL}/oxygold-api`;

export interface PartnerVariant {
  id: number;
  sku: string;
  size: string;
  weight: number;
  stockQuantity: number;
}

export interface PartnerProduct {
  id: number;
  productName: string;
  parentCategoryName: string;
  subCategoryName: string;
  variants: PartnerVariant[];
}

export interface PartnerLoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
    email: string;
    role: string;
  };
}

const STORAGE_KEY = "oxygold_partner_admin";

export const getPartnerAdminData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error reading partner admin token:", err);
    return null;
  }
};

export const getPartnerAdminToken = (): string => {
  const data = getPartnerAdminData();
  return data?.accessToken || data?.data?.accessToken || "";
};

export const getPartnerAdminRefreshToken = (): string => {
  const data = getPartnerAdminData();
  return data?.refreshToken || data?.data?.refreshToken || "";
};

export const setPartnerAdminData = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error setting partner admin token:", err);
  }
};

export const clearPartnerAdminData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const updatePartnerAdminStoredTokens = (accessToken: string, refreshToken: string) => {
  const data = getPartnerAdminData();
  if (data) {
    if (data.data) {
      data.data.accessToken = accessToken;
      data.data.refreshToken = refreshToken;
    } else {
      data.accessToken = accessToken;
      data.refreshToken = refreshToken;
    }
    setPartnerAdminData(data);
  }
};

/**
 * API to refresh partner admin access token
 * POST /api/oxygold-api/auth/refresh
 */
export const refreshPartnerAdminAccessToken = async (): Promise<string> => {
  const rt = getPartnerAdminRefreshToken();
  if (!rt) throw new Error("No refresh token available");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: rt }),
  });

  const data = await response.json();
  if (response.ok && data.success && data.data?.accessToken) {
    updatePartnerAdminStoredTokens(data.data.accessToken, data.data.refreshToken || rt);
    return data.data.accessToken;
  } else {
    clearPartnerAdminData();
    throw new Error(data.message || "Failed to refresh token");
  }
};

/**
 * Authenticated fetch wrapper for Partner Admin with auto-refresh capability
 */
export const partnerAdminAuthenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: Record<string, string> = {
    "accept": "*/*",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${getPartnerAdminToken()}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      console.warn("[PartnerAdmin] Access token expired (401). Attempting refresh...");
      const newToken = await refreshPartnerAdminAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      console.error("[PartnerAdmin] Token refresh failed:", error);
      clearPartnerAdminData();
      throw error;
    }
  }

  return response;
};

/**
 * Admin / Partner Login
 * POST /api/oxygold-api/auth/adminLogin
 */
export const partnerAdminLogin = async (
  email: string,
  password: string,
  loginRole: string = "PARTNER"
): Promise<PartnerLoginResponse> => {
  const url = `${BASE_URL}/auth/adminLogin`;
  console.log("[PartnerAdmin] Logging in to:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        loginRole,
      }),
    });

    const resData: PartnerLoginResponse = await response.json();

    if (response.ok && resData.success && resData.data) {
      setPartnerAdminData(resData.data);
    }

    return resData;
  } catch (err: any) {
    console.error("[PartnerAdmin] Login error:", err);
    return {
      success: false,
      message: err.message || "Failed to connect to login server",
    };
  }
};

/**
 * Fetch Partner Products & Inventory
 * GET /api/oxygold-api/partner/products
 */
export const fetchPartnerProducts = async (): Promise<{
  success: boolean;
  message: string;
  data: PartnerProduct[];
}> => {
  const url = `${BASE_URL}/partner/products`;

  try {
    const response = await partnerAdminAuthenticatedFetch(url, {
      method: "GET",
    });

    const resData = await response.json();

    return {
      success: resData.success ?? response.ok,
      message: resData.message || "Partner products fetched",
      data: Array.isArray(resData.data) ? resData.data : [],
    };
  } catch (err: any) {
    console.error("[PartnerAdmin] Fetch products error:", err);
    return {
      success: false,
      message: err.message || "Failed to fetch partner products",
      data: [],
    };
  }
};

/**
 * Update Variant Details (size, weight)
 * PATCH /api/oxygold-api/partner/variants/{variantId}/details
 */
export const updateVariantDetails = async (
  variantId: number | string,
  size: string,
  weight: number
): Promise<{
  success: boolean;
  message: string;
  data?: PartnerVariant;
}> => {
  const url = `${BASE_URL}/partner/variants/${variantId}/details`;

  try {
    const response = await partnerAdminAuthenticatedFetch(url, {
      method: "PATCH",
      body: JSON.stringify({
        size,
        weight: Number(weight),
      }),
    });

    const resData = await response.json();

    return {
      success: resData.success ?? response.ok,
      message: resData.message || "Variant details updated successfully",
      data: resData.data,
    };
  } catch (err: any) {
    console.error("[PartnerAdmin] Update variant details error:", err);
    return {
      success: false,
      message: err.message || "Failed to update variant details",
    };
  }
};

/**
 * Update Variant Stock Quantity
 * PATCH /api/oxygold-api/partner/variants/{variantId}/quantity
 */
export const updateVariantQuantity = async (
  variantId: number | string,
  stockQuantity: number
): Promise<{
  success: boolean;
  message: string;
  data?: PartnerVariant;
}> => {
  const url = `${BASE_URL}/partner/variants/${variantId}/quantity`;

  try {
    const response = await partnerAdminAuthenticatedFetch(url, {
      method: "PATCH",
      body: JSON.stringify({
        stockQuantity: Number(stockQuantity),
      }),
    });

    const resData = await response.json();

    return {
      success: resData.success ?? response.ok,
      message: resData.message || "Partner stock updated successfully",
      data: resData.data,
    };
  } catch (err: any) {
    console.error("[PartnerAdmin] Update variant stock quantity error:", err);
    return {
      success: false,
      message: err.message || "Failed to update partner stock quantity",
    };
  }
};
