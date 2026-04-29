import { Category, SubCategory, PhysicalGoldProduct, ProductVariant, Order, ProductImageSet } from "./physicalGoldData";
import { API_BASE_URL } from "../Config";
const BASE_URL = `${API_BASE_URL}/oxygold-api`;

/**
 * Get current access token from localStorage
 */
const getAuthToken = (): string => {
    const stored = localStorage.getItem("user");
    if (stored) {
        const userData = JSON.parse(stored);
        return userData.data?.accessToken || "";
    }
    return "";
};

/**
 * Get current refresh token from localStorage
 */
const getRefreshToken = (): string => {
    const stored = localStorage.getItem("user");
    if (stored) {
        const userData = JSON.parse(stored);
        return userData.data?.refreshToken || "";
    }
    return "";
};

/**
 * Update tokens in localStorage
 */
const updateStoredTokens = (accessToken: string, refreshToken: string) => {
    const stored = localStorage.getItem("user");
    if (stored) {
        const userData = JSON.parse(stored);
        userData.data.accessToken = accessToken;
        userData.data.refreshToken = refreshToken;
        localStorage.setItem("user", JSON.stringify(userData));
    }
};

/**
 * API to refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
    const rt = getRefreshToken();
    if (!rt) throw new Error("No refresh token available");


    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: rt }) // or in the body, adding both to be safe as per usual patterns
    });

    console.log(response);

    const data = await response.json();
    if (response.ok && data.success) {
        updateStoredTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
    } else {
        // If refresh fails, clear storage or handle logout
        // localStorage.removeItem("user");
        throw new Error(data.message || "Failed to refresh token");
    }
};

/**
 * Wrapper around fetch that handles auth headers and token refresh
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // 1. Initialize using the browser's Headers class
    const headers = new Headers(options.headers);

    // 2. Add the Auth token
    headers.set('Authorization', `Bearer ${getAuthToken()}`);

    // 3. Only set JSON if we aren't sending a File/FormData
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // 4. Use the headers in the fetch call
    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        try {
            const newToken = await refreshAccessToken();
            headers.set('Authorization', `Bearer ${newToken}`);
            // Retry
            response = await fetch(url, { ...options, headers });
        } catch (error) {
            console.error("Token refresh failed:", error);
            throw error;
        }
    }

    return response;
};



export const fetchCategoryImageURL = async (categoryId: string): Promise<string> => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/admin/categories/getImageForProduct?categoryId=${categoryId}`);
        if (!response.ok) return "";
        const data = await response.json();
        const imgObj = data.data;
        if (!imgObj) return "";
        return imgObj.frontViewurl || imgObj.backViewUrl || imgObj.leftViewUrl || imgObj.rightViewUrl || imgObj.topViewUrl || imgObj.bottomViewUrl || "";
    } catch (error) {
        console.error(`Failed to fetch image for category ${categoryId}:`, error);
        return "";
    }
};

export const fetchProductImageURLs = async (productId: string): Promise<ProductImageSet | null> => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/admin/categories/getImageForProduct?productId=${productId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(`Failed to fetch images for product ${productId}:`, error);
        return null;
    }
};

export const fetchMainCategories = async (): Promise<Category[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/admin/categories/parents`);
    if (!response.ok) {
        throw new Error("Failed to fetch main categories");
    }
    const data = await response.json();

    // Filter out null/undefined items and fetch images for all categories in parallel
    const categoriesWithImages = await Promise.all(
        data
            .filter((item: any) => item && item.id) // Filter out null/undefined items
            .map(async (item: any) => {
                const imageUrl = await fetchCategoryImageURL(item.id.toString());
                return {
                    id: item.id.toString(),
                    name: item.name || "",
                    emoji: getEmojiForCategory(item.name || ""),
                    description: item.description || "",
                    imageUrl: imageUrl
                };
            })
    );

    return categoriesWithImages;
};

export const fetchSubCategories = async (parentId: string): Promise<SubCategory[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/admin/categories/${parentId}/subcategories`);
    if (!response.ok) {
        throw new Error("Failed to fetch sub-categories");
    }
    const data = await response.json();

    // Filter out null/undefined items and fetch images for all sub-categories in parallel
    const subCategoriesWithImages = await Promise.all(
        data
            .filter((item: any) => item && item.id) // Filter out null/undefined items
            .map(async (item: any) => {
                const imageUrl = await fetchCategoryImageURL(item.id.toString());
                return {
                    id: item.id.toString(),
                    categoryId: item.parentId ? item.parentId.toString() : parentId,
                    name: item.name || "",
                    description: item.description || "",
                    imageUrl: imageUrl
                };
            })
    );

    return subCategoriesWithImages;
};

export const fetchProducts = async (subCategoryId: string): Promise<PhysicalGoldProduct[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/products/getAllProduct?categoryId=${subCategoryId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    const mappedData = data
        .filter((item: any) => item && item.id) // Filter out null/undefined items
        .map((item: any) => ({
            id: item.id.toString(),
            productName: item.productName || item.name || "",
            imageUrl: item.imageUrl || "",
            priceRange: item.priceRange || "Price on request",
            description: item.description || "",
            subCategoryId: item.categoryId ? item.categoryId.toString() : subCategoryId,
            status: item.status || "ACTIVE",
        }));
    return mappedData;
};

export const fetchProductVariants = async (productId: string): Promise<{ variants: ProductVariant[], product: PhysicalGoldProduct }> => {
    const response = await authenticatedFetch(`${BASE_URL}/productvariants/getVariantByProduct?productId=${productId}`, {
        method: 'GET'
    });

    if (response.status === 404) {
        return { variants: [], product: null as any };
    }

    if (!response.ok) {
        throw new Error("Failed to fetch variants");
    }

    const result = await response.json();
    const variantsData = result.data;
    console.log(variantsData);

    const productImages = await fetchProductImageURLs(productId);
    const variants = variantsData.listVariantResponse.map((item: any) => ({
        id: item.id.toString(),
        price: item.price,
        mrp: item.mrp,
        imageUrl: item.imageUrl || (productImages ? (productImages.frontViewurl || productImages.backViewUrl || productImages.leftViewUrl || productImages.rightViewUrl || productImages.topViewUrl || productImages.bottomViewUrl) : "") || "",
        purity: item.purity,
        size: item.size,
        sku: item.sku,
        status: item.status,
        stockQuantity: item.stockQuantity,
        weight: item.weight,
    }));

    const productData = result.data.productResponse;
    return {
        variants,
        product: productData ? {
            id: productData.id.toString(),
            productName: productData.name,
            imageUrl: productData.imageUrl,
            imageSet: productImages || undefined,
            priceRange: productData.priceRange || "Price on request",
            description: productData.description,
            subCategoryId: productData.categoryId.toString(),
            status: productData.status,
            gstPercentage: productData.gstPercentage,
            makingPercentage: productData.makingPercentage,
        } : (null as any)
    };
}

export const generateModelImage = async (imageUrl: string): Promise<string> => {
    const encodedImageUrl = encodeURIComponent(imageUrl);
  const response = await authenticatedFetch(`${BASE_URL}/auth/generate-modelImage?imageUrl=${encodedImageUrl}`, {
    method: "POST",
  });
  console.log(response);
  console.log(response.ok);

  if (!response.ok) {
    throw new Error(`Failed to generate model image: ${response.statusText}`);
  }

  const data = await response.text();
  console.log(data);

  // API returns a direct image URL string
  return data;
};

export const generateVirtualTryOn = async (
  userImageFile: File,
  productImageUrl: string
): Promise<string> => {
  const formData = new FormData();

  // Maps to @RequestParam("image2") MultipartFile image2
  formData.append("image2", userImageFile);

  // Maps to @RequestParam String imageUrl1
  const url = `${BASE_URL}/auth/edit-imageByPerson?imageUrl1=${encodeURIComponent(productImageUrl)}`;

  const response = await authenticatedFetch(url, {
    method: "POST",
    body: formData,
    // Note: Do NOT set 'Content-Type' header; let the browser set it with the boundary
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Virtual try-on failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();
  console.log(data);
  // Returns the string result from aiService.editImagewithperson
  return data.data;
};


export const uploadUserImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await authenticatedFetch(`${BASE_URL}/auth/upload-image`, {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type with boundary
    });
    
    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url || data.data?.url || data;
};

export const loginOrRegister = async (params: {
    phoneNumber: string;
    registrationType: string;
    userType: string;
    userRole: string;
    whatsappNumber: string;
    mobileOtpSessionId?: string;
    mobileOtpValue?: string;
}) => {
    const response = await fetch(`${BASE_URL}/auth/userLoginOrRegister`, {
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
    const response = await authenticatedFetch(`${BASE_URL}/auth/createRole`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to create role');
    }
    return data;
};

export const logout = async (refreshToken: string) => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || 'Logout failed');
    }
    return true;
};

export const fetchWalletTransactions = async (userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/wallet/${userId}/transactions`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch transactions');
    }
    return data;
};

export const fetchWalletBalance = async (userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/wallet/getWallet/${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch wallet balance');
    }
    return data;
};

export const AddItemToCart = async (cartData: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/AddItemToCart`, {
        method: 'POST',
        body: JSON.stringify(cartData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to add item to cart');
    }
    return data;
};

export const decrementCartItems = async (cartData: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/decrementCartItems`, {
        method: 'POST',
        body: JSON.stringify(cartData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to decrement cart items');
    }
    return data;
};

export const fetchCustomerCartInfo = async (customerId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/customer-cart-info?customerId=${customerId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch cart info');
    }
    return data;
};

export const removeCartItem = async (cartId: number, userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/${cartId}?userId=${userId}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error("Failed to remove cart item")
    }
    return response.json();
}


export const fetchAddresses = async (userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/addresses/${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch addresses');
    }
    return data;
};

export const addAddress = async (addressData: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/addAddress`, {
        method: 'PATCH',
        body: JSON.stringify(addressData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to add address');
    }
    return data;
};

export const updateAddress = async (addressData: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/addAddress`, {
        method: 'PATCH',
        body: JSON.stringify(addressData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to update address');
    }
    return data;
};

export const deleteAddress = async (userId: number, addressId: string) => {
    const response = await authenticatedFetch(`${BASE_URL}/order/${userId}/${addressId}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete address');
    }
    return data;
};

export const saveUserProfile = async (profileData: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/saveUserProfile`, {
        method: 'POST',
        body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to save profile');
    }
    return data;
};

export const getUserProfile = async (userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/getUserBasedOnUserId?userId=${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch user profile');
    }
    return data;
};

export const verifyPan = async (userId: number, name: string, pan: string) => {
    const response = await authenticatedFetch(`${BASE_URL}/auth/verifyPan/${userId}?name=${encodeURIComponent(name)}&pan=${encodeURIComponent(pan)}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'PAN verification failed');
    }
    return data;
};

export const createOrder = async (orderData: {
    userId: number;
    addressId: number;
    notes: string;
    paymentMode: "WALLET" | "CASHFREE";
    returnUrl?: string;
}) => {
    const response = await authenticatedFetch(`${BASE_URL}/order/createOrder`, {
        method: "POST",
        body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Failed to create order");
    }
    return data;
};

export const fetchUserOrders = async (userId: number): Promise<Order[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/order/user/${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch user orders');
    }
    return data.data;
};

export const fetchOrdersByStatus = async (userId: number, status: string, page: number = 0, size: number = 10) => {
    const response = await authenticatedFetch(`${BASE_URL}/order/user/${userId}/order-by-status?status=${status}&page=${page}&size=${size}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch orders by status');
    }
    return data.data;
};

export const confirmOrder = async (orderId: string | number) => {
    const response = await authenticatedFetch(`${BASE_URL}/order/${orderId}/confirmOrders`, {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Failed to confirm order");
    }
    return data;
};

export const paymentWebhook = async (order_id: string | number) => {
    const response = await authenticatedFetch(`${BASE_URL}/digital-gold/payments/webhook?order_id=${order_id}`, {
        method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Webhook call failed");
    }
    return data;
};

/**
 * Generate invoice for an order
 */
export const generateInvoice = async (orderId: string | number) => {
    const response = await authenticatedFetch(`${BASE_URL}/invoices/generate-from-order/${orderId}`, {
        method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Failed to generate invoice");
    }
    return data;
};

/**
 * Get PDF download URL for an invoice
 */
export const getInvoicePdfUrl = async (orderNumber: string) => {
    const response = await authenticatedFetch(`${BASE_URL}/invoices/${orderNumber}/pdf`);
    if (!response.ok) throw new Error("Failed to get invoice PDF");
    return response; // or response.blob() if you need to download it
};

/**
 * Get PDF preview URL for an invoice
 */
export const getInvoicePreviewUrl = async (orderNumber: string) => {
    const response = await authenticatedFetch(`${BASE_URL}/invoices/${orderNumber}/pdf/preview`);
    if (!response.ok) throw new Error("Failed to get invoice preview");
    return response;
};

export const addToWishlistService = async (payload: any) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/addToWishlist`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to add to wishlist");
    return data;
};

export const removeFromWishlistService = async (wishlistId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/removeToWishlist/${wishlistId}`, {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to remove from wishlist");
    return data;
};

export const fetchWishlistService = async (userId: number) => {
    const response = await authenticatedFetch(`${BASE_URL}/cart/wishlistByUserId/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch wishlist");
    return data;
};

export const searchProducts = async (params: {
    q?: string;
    categoryId?: number;
    purity?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    minWeight?: number;
    maxWeight?: number;
    inStock?: boolean;
    productType?: "PHYSICAL" | "DIGITAL";
    sortBy?: "PRICE_ASC" | "PRICE_DESC" | "NEWEST" | "NAME_ASC";
    page?: number;
    pageSize?: number;
}) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append("q", params.q);
    if (params.categoryId) queryParams.append("categoryId", params.categoryId.toString());
    if (params.purity) queryParams.append("purity", params.purity);
    if (params.size) queryParams.append("size", params.size);
    if (params.minPrice !== undefined) queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.minWeight !== undefined) queryParams.append("minWeight", params.minWeight.toString());
    if (params.maxWeight !== undefined) queryParams.append("maxWeight", params.maxWeight.toString());
    if (params.inStock !== undefined) queryParams.append("inStock", params.inStock.toString());
    if (params.productType) queryParams.append("productType", params.productType);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());

    const response = await authenticatedFetch(`${BASE_URL}/search/products?${queryParams.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Search failed");
    return data;
};

const getEmojiForCategory = (name: string): string => {

    const lowerName = name.toLowerCase();
    if (lowerName.includes("gold")) return "💍";
    if (lowerName.includes("silver")) return "🔘";
    if (lowerName.includes("diamond")) return "💎";
    if (lowerName.includes("digital")) return "📱";
    return "✨";
};