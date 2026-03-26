import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import { AddItemToCart, decrementCartItems, fetchCustomerCartInfo, removeCartItem } from "./physicalGoldService";

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
    refreshCart: () => Promise<void>;
    totalItems: number;
    cartSubtotal: number;
    totalGstCharges: number;
    totalMakingCharges: number;
    totalPayableAmount: number;
    totalCartItemWeight: number;
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

    const refreshCart = useCallback(async () => {
        const userId = GET_USER_ID();
        if (!userId) return;

        try {
            setIsLoading(true);
            const data = await fetchCustomerCartInfo(userId);
            if (data?.itemsInCart) {
                const mappedItems: CartItem[] = data.itemsInCart.map((item: any) => ({
                    cartId: item.cartId,
                    product: {
                        id: item.productId.toString(),
                        productName: item.productName,
                        imageUrl: item.imageUrl,
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
                }));
                setCartItems(mappedItems);
                setTotalItems(data.totalItemsInCart || 0);
                setCartSubtotal(data.totalCartValue || 0);
                setTotalGstCharges(data.totalGstCharges || 0);
                setTotalMakingCharges(data.totalMakingCharges || 0);
                setTotalPayableAmount(data.totalPayableAmount || 0);
                setTotalCartItemWeight(data.totalCartItemWeight || 0);
            } else {
                setCartItems([]);
                setTotalItems(0);
                setCartSubtotal(0);
                setTotalGstCharges(0);
                setTotalMakingCharges(0);
                setTotalPayableAmount(0);
                setTotalCartItemWeight(0);
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
                await AddItemToCart({
                    userId: userId,
                    productId: parseInt(product.id),
                    quantity: 1,
                    productVariantId: parseInt(variant.id)
                });
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
                await AddItemToCart({
                    userId: userId,
                    productId: parseInt(item.product.id),
                    productName: item.product.productName,
                    productType: "PHYSICAL_GOLD",
                    quantity: 1,
                    status: 1,
                    price: item.variant.price,
                    productVariantId: parseInt(variantId)
                });
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
                await decrementCartItems({
                    userId: userId,
                    id: cartId,
                    productId: parseInt(item.product.id),
                    productVariantId: parseInt(variantId),
                    quantity: 1
                });
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
