import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import { AddItemToCart, decrementCartItems, fetchCustomerCartInfo, removeCartItem, fetchProductImageURLs } from "./physicalGoldService";

interface CartItem {
    cartId?: number;
    variant: ProductVariant;
    product: PhysicalGoldProduct;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: PhysicalGoldProduct, variant: ProductVariant) => Promise<void>;
    incrementQuantity: (variantId: string) => Promise<void>;
    decrementQuantity: (variantId: string, cartId: number | undefined) => Promise<void>;
    removeFromCart: (variantId: string) => Promise<void>;
    clearCart: () => void;
    refreshCart: (addressId?: string | number) => Promise<void>;
    totalItems: number;
    cartSubtotal: number;
    totalGstCharges: number;
    totalMakingCharges: number;
    totalPayableAmount: number;
    totalCartItemWeight: number;
    deliveryFee: number;
    deliveryDistanceKm: number | null;
    ratePerKm: number | null;
    cartNotification: { message: string; type: "success" | "error" } | null;
    dismissCartNotification: () => void;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GET_USER_ID = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
        try {
            const user = JSON.parse(stored);
            return user.data.userId;
        } catch (e) {
            return null;
        }
    }
    return null;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [totalGstCharges, setTotalGstCharges] = useState(0);
    const [totalMakingCharges, setTotalMakingCharges] = useState(0);
    const [totalPayableAmount, setTotalPayableAmount] = useState(0);
    const [totalCartItemWeight, setTotalCartItemWeight] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
    const [ratePerKm, setRatePerKm] = useState<number | null>(null);
    const [cartNotification, setCartNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const selectedAddressIdRef = useRef<string | number | undefined>();

    const refreshCart = useCallback(async (addressId?: string | number) => {
        const userId = GET_USER_ID();
        if (!userId) return;
        if (addressId !== undefined && addressId !== "") selectedAddressIdRef.current = addressId;

        try {
            setIsLoading(true);
            const data = await fetchCustomerCartInfo(userId, addressId ?? selectedAddressIdRef.current);
            if (data?.itemsInCart) {
                const mappedItems: CartItem[] = await Promise.all(
                    data.itemsInCart.map(async (item: any) => {
                        const productImages = await fetchProductImageURLs(item.productId.toString());
                        const imageUrl = productImages ? (productImages.frontViewurl || productImages.backViewUrl || productImages.leftViewUrl || productImages.rightViewUrl || productImages.topViewUrl || productImages.bottomViewUrl) : item.imageUrl;

                        return {
                            cartId: item.cartId,
                            product: {
                                id: item.productId.toString(),
                                productName: item.productName,
                                imageUrl: imageUrl || "",
                                description: "",
                                priceRange: "",
                                subCategoryId: "",
                                status: item.status,
                            },
                            variant: {
                                id: item.productVariantId.toString(),
                                price: item.price,
                                purity: item.purity,
                                size: item.size,
                                weight: item.weight,
                                sku: "gram",
                                status: item.status,
                                stockQuantity: item.stockQuantity,
                            },
                            quantity: item.quantity,
                        };
                    })
                );
                setCartItems(mappedItems);
                setTotalItems(data.totalItemsInCart || 0);
                setCartSubtotal(data.totalCartValue || 0);
                setTotalGstCharges(data.totalGstCharges || 0);
                setTotalMakingCharges(data.totalMakingCharges || 0);
                setTotalPayableAmount(data.totalPayableAmount || 0);
                setTotalCartItemWeight(data.totalCartItemWeight || 0);
                setDeliveryFee(data.deliveryFee || 0);
                setDeliveryDistanceKm(data.deliveryDistanceKm ?? null);
                setRatePerKm(data.ratePerKm ?? null);
            } else {
                setCartItems([]);
                setTotalItems(0);
                setCartSubtotal(0);
                setTotalGstCharges(0);
                setTotalMakingCharges(0);
                setTotalPayableAmount(0);
                setTotalCartItemWeight(0);
                setDeliveryFee(0);
                setDeliveryDistanceKm(null);
                setRatePerKm(null);
            }
        } catch (err) {
            console.error("Failed to refresh cart:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = useCallback(async (product: PhysicalGoldProduct, variant: ProductVariant) => {
        const userId = GET_USER_ID();

        // Optimistic UI update
        setCartItems((prev) => {
            const existing = prev.find((i) => i.variant.id === variant.id);
            if (existing)
                return prev.map((i) =>
                    i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            return [...prev, { product, variant, quantity: 1 }];
        });

        if (userId) {
            try {
                const response = await AddItemToCart({
                    userId: userId,
                    productId: parseInt(product.id),
                    quantity: 1,
                    productVariantId: parseInt(variant.id)
                });
                setCartNotification({ message: response?.message || response?.data?.message || "Item added to cart successfully.", type: "success" });
                refreshCart(); // Sync with server for accurate totals
            } catch (err) {
                console.error("Failed to add to cart on server:", err);
            }
        }
    }, [refreshCart]);

    const incrementQuantity = useCallback(async (variantId: string) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item) return;

        setCartItems((prev) =>
            prev.map((item) =>
                item.variant.id === variantId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );

        if (userId) {
            try {
                const response = await AddItemToCart({
                    userId: userId,
                    productId: parseInt(item.product.id),
                    productName: item.product.productName,
                    productType: "PHYSICAL_GOLD",
                    quantity: 1,
                    status: 1,
                    price: item.variant.price,
                    productVariantId: parseInt(variantId)
                });
                setCartNotification({ message: response?.message || response?.data?.message || "Cart item updated successfully.", type: "success" });
                refreshCart();
            } catch (err) {
                console.error("Failed to increment on server:", err);
            }
        }
    }, [cartItems, refreshCart]);

    const decrementQuantity = useCallback(async (variantId: string, cartId: number | undefined) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item) return;

        const isLastItem = item.quantity === 1;

        // Optimistic UI update
        setCartItems((prev) =>
            prev
                .map((i) =>
                    i.variant.id === variantId
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0)
        );

        // Also update totals optimistically when removing last item
        if (isLastItem) {
            setTotalItems((prev) => Math.max(0, prev - 1));
        }

        if (userId) {
            try {
                const response = await decrementCartItems({
                    userId: userId,
                    id: cartId,
                    productId: parseInt(item.product.id),
                    productVariantId: parseInt(variantId),
                    quantity: 1
                });
                setCartNotification({ message: response?.message || response?.data?.message || "Cart item updated successfully.", type: "success" });
            } catch (err) {
                console.error("Failed to decrement on server:", err);
            } finally {
                // Only refresh if it wasn't the last item
                // If it was the last item, the 404 is expected — don't re-sync
                if (!isLastItem) {
                    refreshCart();
                }
            }
        }
    }, [cartItems, refreshCart]);

    const removeFromCart = useCallback(async (variantId: string) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item || !item.cartId) return;

        const isLastItem = cartItems.length === 1;

        // Optimistic UI update
        setCartItems((prev) => prev.filter((i) => i.variant.id !== variantId));

        // If it's the last item, clear all totals optimistically
        if (isLastItem) {
            setTotalItems(0);
            setCartSubtotal(0);
            setTotalGstCharges(0);
            setTotalMakingCharges(0);
            setTotalPayableAmount(0);
            setTotalCartItemWeight(0);
            setDeliveryFee(0);
            setDeliveryDistanceKm(null);
            setRatePerKm(null);
        }

        if (userId) {
            try {
                await removeCartItem(item.cartId, userId);
            } catch (err) {
                console.error("Failed to remove item from cart:", err);
            } finally {
                // Only refresh if it wasn't the last item
                // If it was the last item, skip re-sync to avoid unnecessary API call
                if (!isLastItem) {
                    refreshCart();
                }
            }
        }
    }, [cartItems, refreshCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setTotalItems(0);
        setCartSubtotal(0);
        setTotalGstCharges(0);
        setTotalMakingCharges(0);
        setTotalPayableAmount(0);
        setTotalCartItemWeight(0);
        setDeliveryFee(0);
        setDeliveryDistanceKm(null);
        setRatePerKm(null);
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                incrementQuantity,
                decrementQuantity,
                removeFromCart,
                clearCart,
                refreshCart,
                totalItems,
                cartSubtotal,
                totalGstCharges,
                totalMakingCharges,
                totalPayableAmount,
                totalCartItemWeight,
                deliveryFee,
                deliveryDistanceKm,
                ratePerKm,
                cartNotification,
                dismissCartNotification: () => setCartNotification(null),
                isLoading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
