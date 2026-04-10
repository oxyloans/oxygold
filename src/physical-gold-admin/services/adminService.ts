const BASE_URL = "http://65.0.147.157:9900";

/**
 * Get current admin access token from localStorage
 */
const getAdminAuthToken = (): string => {
    const stored = localStorage.getItem("admin");
    if (stored) {
        const adminData = JSON.parse(stored);
        return adminData.token || adminData.data?.accessToken || adminData.accessToken || "";
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

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
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
const adminAuthenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${getAdminAuthToken()}`
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        try {
            const newToken = await refreshAdminAccessToken();
            // Retry with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...options, headers });
        } catch (error) {
            console.error("Admin token refresh failed:", error);
            throw error;
        }
    }

    return response;
};

// --- API Functions ---

export const fetchMainCategories = async () => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/parents`);
    if (!response.ok) throw new Error("Failed to fetch main categories");
    return response.json();
};

export const fetchSubCategories = async (parentId: number | string) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/${parentId}/subcategories`);
    if (!response.ok) throw new Error("Failed to fetch sub-categories");
    return response.json();
};

export const fetchCategoryImageURL = async (categoryId: number | string) => {
    try {
        const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/getImageForProduct?categoryId=${categoryId}`);
        if (!response.ok) return "";
        const data = await response.json();
        return data.url || "";
    } catch (error) {
        console.error(`Failed to fetch image for category ${categoryId}:`, error);
        return "";
    }
};

export const fetchProductImageURL = async (productId: number | string) => {
    try {
        const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/getImageForProduct?productId=${productId}`);
        if (!response.ok) return "";
        const data = await response.json();
        return data.url || "";
    } catch (error) {
        console.error(`Failed to fetch image for product ${productId}:`, error);
        return "";
    }
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAdminAuthToken();
    const response = await fetch(`${BASE_URL}/api/auth/upload?documentType=image&userId=9`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) throw new Error("Image upload failed");
    return response.json();
};

export const createCategory = async (data: any) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/createCategory`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create category");
    }
    return response.json();
};

export const updateCategory = async (data: any) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/admin/categories/updateCategory`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update category");
    }
    return response.json();
};

// --- Products API ---

export const getAllProducts = async (categoryId: number | string) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/products/getAllProduct?categoryId=${categoryId}`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
};

export const createProduct = async (data: any) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/products/createProduct`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create product");
    }
    return response.json();
};

export const updateProduct = async (productId: number | string, data: any) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/products/updateProduct/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update product");
    }
    return response.json();
};

export const updateProductStatus = async (productId: number | string, data: any) => {
    const payload = {
        status: data
    }
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/products/updateProduct/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update product status");
    }
    return response.json();
}

// --- Product Variants API ---

export const getAllVariants = async (productId: number | string) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/productvariants/getVariantByProduct?productId=${productId}`);
    console.log(response)
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) throw new Error("Failed to fetch variants");
    return response.json();
};

export const addVariant = async (productId: number | string, data: any) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/productvariants/addVariant/${productId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to add variant");
    }
    return response.json();
};

export const updateVariantStatus = async (variantId: number | string, status: string) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/productvariants/${variantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
};

export const updateVariantQuantity = async (variantId: number | string, stockQuantity: number) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/productvariants/${variantId}/quantity`, {
        method: 'PATCH',
        body: JSON.stringify({ stockQuantity })
    });
    if (!response.ok) throw new Error("Failed to update quantity");
    return response.json();
};

export const updateVariantPrice = async (variantId: number | string, price: number) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/productvariants/${variantId}/price`, {
        method: 'PATCH',
        body: JSON.stringify({ price })
    });
    if (!response.ok) throw new Error("Failed to update price");
    return response.json();
};

export const loginOrRegister = async (params: any) => {
    const response = await fetch(`${BASE_URL}/api/auth/userLoginOrRegister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Authentication failed');
    }
    return data;
};

export const createRole = async (role: string) => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/auth/createRole`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to create role');
    }
    return data;
};

export const isAdminLoggedIn = (): boolean => {
    const adminStr = localStorage.getItem('admin');
    return adminStr ? JSON.parse(adminStr).isLoggedIn : false;
};

// -- Logout Api --

export const logout = async () => {
    const refreshToken = getAdminRefreshToken();
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to logout');
    }
    return data;
}

// -- Orders Api --

export interface OrderItem {
    price: number;
    productId: number;
    quantity: number;
    subtotal: number;
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
    items: OrderItem[];
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

export const fetchActiveOrders = async (): Promise<AdminOrder[]> => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/order/active`);
    if (!response.ok) throw new Error("Failed to fetch active orders");
    const data = await response.json();
    return data.data;
};

export const fetchPaymentModeSummary = async (startDate: string, endDate: string): Promise<PaymentModeSummary> => {
    const response = await adminAuthenticatedFetch(
        `${BASE_URL}/api/order/orders/payment-mode-summary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
    if (!response.ok) throw new Error("Failed to fetch payment mode summary");
    const data = await response.json();
    return data.data;
};

export const getAllOrders = async (): Promise<AdminOrder[]> => {
    const response = await adminAuthenticatedFetch(`${BASE_URL}/api/order/getAllOrders`);
    if (!response.ok) throw new Error("Failed to fetch all orders");
    const data = await response.json();
    return data.data || [];
};
