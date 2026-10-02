import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { PhysicalGoldProduct, ProductVariant, firstProductImageUrl, resolveS3ImageUrl } from "./physicalGoldData";
import { AddItemToCart, decrementCartItems, fetchCustomerCartInfo, removeCartItem, fetchGoldSilverRateBreakdown ,fetchProductImageURLs } from "./physicalGoldService";

export class ProfileIncompleteError extends Error {
    readonly isProfileIncomplete = true;
    constructor(message: string) { super(message); this.name = "ProfileIncompleteError"; }
}

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
    refreshCart: (addressId?: string | number) => Promise<boolean>;
    totalItems: number;
    cartSubtotal: number;
    totalGstCharges: number;
    totalMakingCharges: number;
    totalPayableAmount: number;
    totalCartItemWeight: number;
    deliveryFee: number;
    deliveryDistanceKm: number | null;
    ratePerKm: number | null;
    totalDiscountAmount: number;
    totalDiscountPercentage: number;
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
            return user.data?.userId ?? user.data?.id ?? user.userId ?? user.id ?? null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

export const isPhysicalGoldUserLoggedIn = () => Boolean(GET_USER_ID());

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
    const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
    const [totalDiscountPercentage, setTotalDiscountPercentage] = useState(0);
    const [cartNotification, setCartNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const selectedAddressIdRef = useRef<string | number | undefined>();

    const refreshCart = useCallback(async (addressId?: string | number) => {
        const userId = GET_USER_ID();
        if (!userId) return false;
        if (addressId !== undefined && addressId !== "") selectedAddressIdRef.current = addressId;

        try {
            setIsLoading(true);
            const data = await fetchCustomerCartInfo(userId, addressId ?? selectedAddressIdRef.current);
            if (data?.itemsInCart) {
                const mappedItems: CartItem[] = await Promise.all(
                    data.itemsInCart.map(async (item: any) => {
                        const productImages = await fetchProductImageURLs(item.productId.toString());
                        const imageUrl = firstProductImageUrl(productImages) || resolveS3ImageUrl(item.imageUrl);

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
                setTotalDiscountAmount(Number(data.totalDiscountAmount ?? data.discountAmount ?? 0) || 0);
                setTotalDiscountPercentage(Number(data.totalDiscountPercentage ?? data.discountPercentage ?? 0) || 0);
                setCartNotification(null);
                return true;
            }

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
            setTotalDiscountAmount(0);
            setTotalDiscountPercentage(0);
            setCartNotification(null);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to refresh cart details.";
            console.error("Failed to refresh cart:", err);
            setCartNotification({ message, type: "error" });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const calculateOptimisticTotals = useCallback((items: CartItem[], currentDeliveryFee: number = 0) => {
        let itemsCount = 0;
        let subtotal = 0;
        let totalWeight = 0;
        let silverGstAmount = 0;
        let goldGstAmount = 0;

        items.forEach((item) => {
            const qty = item.quantity;
            const price = Number(item.variant?.price) || 0;
            const weight = Number(item.variant?.weight) || 0;
            const isSilver =
                /silver/i.test(item.product?.productName || "") ||
                /silver/i.test(item.variant?.purity || "");

            itemsCount += qty;
            subtotal += price * qty;
            totalWeight += weight * qty;

            const gst = (price * qty) * 0.03;
            if (isSilver) {
                silverGstAmount += gst;
            } else {
                goldGstAmount += gst;
            }
        });

        const gstCharges = Math.round((silverGstAmount + goldGstAmount) * 100) / 100;
        // Silver GST waiver discount:
        const discountAmount = Math.round(silverGstAmount * 100) / 100;
        const makingCharges = 0;
        const payableAmount = Math.round((subtotal + gstCharges + makingCharges + currentDeliveryFee - discountAmount) * 100) / 100;

        return {
            totalItems: itemsCount,
            cartSubtotal: subtotal,
            totalGstCharges: gstCharges,
            totalMakingCharges: makingCharges,
            totalPayableAmount: payableAmount,
            totalCartItemWeight: totalWeight,
            totalDiscountAmount: discountAmount,
        };
    }, []);

    const applyOptimisticCart = useCallback((newItems: CartItem[]) => {
        setCartItems(newItems);
        const totals = calculateOptimisticTotals(newItems, deliveryFee);
        setTotalItems(totals.totalItems);
        setCartSubtotal(totals.cartSubtotal);
        setTotalGstCharges(totals.totalGstCharges);
        setTotalMakingCharges(totals.totalMakingCharges);
        setTotalPayableAmount(totals.totalPayableAmount);
        setTotalCartItemWeight(totals.totalCartItemWeight);
        setTotalDiscountAmount(totals.totalDiscountAmount);
    }, [calculateOptimisticTotals, deliveryFee]);

    const addToCart = useCallback(async (product: PhysicalGoldProduct, variant: ProductVariant) => {
        const userId = GET_USER_ID();

        if (!userId) {
            sessionStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
            window.location.assign("/login");
            return;
        }

        const existing = cartItems.find((i) => i.variant.id === variant.id);
        const newItems = existing
            ? cartItems.map((i) =>
                i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
            )
            : [...cartItems, { product, variant, quantity: 1 }];

        applyOptimisticCart(newItems);

        try {
            const response = await AddItemToCart({
                userId: userId,
                productId: parseInt(product.id),
                quantity: 1,
                productVariantId: parseInt(variant.id)
            });
            setCartNotification({ message: response?.message || response?.data?.message || "Item added to cart successfully.", type: "success" });
            await refreshCart();
        } catch (err) {
            await refreshCart();
            const message = err instanceof Error ? err.message : "Failed to add item to cart.";
            const isProfileError = /complete your profile/i.test(message);
            setCartNotification({ message, type: "error" });
            throw isProfileError ? new ProfileIncompleteError(message) : err;
        }
    }, [cartItems, applyOptimisticCart, refreshCart]);

    const incrementQuantity = useCallback(async (variantId: string) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item) return;

        const newItems = cartItems.map((ci) =>
            ci.variant.id === variantId
                ? { ...ci, quantity: ci.quantity + 1 }
                : ci
        );
        applyOptimisticCart(newItems);

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
                await refreshCart();
            } catch (err) {
                console.error("Failed to increment on server:", err);
                await refreshCart();
            }
        }
    }, [cartItems, applyOptimisticCart, refreshCart]);

    const decrementQuantity = useCallback(async (variantId: string, cartId: number | undefined) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item) return;

        const isLastItem = item.quantity === 1;

        const newItems = cartItems
            .map((ci) =>
                ci.variant.id === variantId
                    ? { ...ci, quantity: ci.quantity - 1 }
                    : ci
            )
            .filter((ci) => ci.quantity > 0);

        applyOptimisticCart(newItems);

        if (newItems.length === 0) {
            setTotalItems(0);
            setCartSubtotal(0);
            setTotalGstCharges(0);
            setTotalMakingCharges(0);
            setTotalPayableAmount(0);
            setTotalCartItemWeight(0);
            setDeliveryFee(0);
            setDeliveryDistanceKm(null);
            setRatePerKm(null);
            setTotalDiscountAmount(0);
            setTotalDiscountPercentage(0);
        }

        if (userId) {
            try {
                const response = await decrementCartItems({
                    userId: userId,
                    id: cartId || item.cartId,
                    productId: parseInt(item.product.id),
                    productVariantId: parseInt(variantId),
                    quantity: 1
                });
                setCartNotification({ message: response?.message || response?.data?.message || "Cart item updated successfully.", type: "success" });
            } catch (err) {
                console.error("Failed to decrement on server:", err);
            } finally {
                if (!isLastItem) {
                    await refreshCart();
                }
            }
        }
    }, [cartItems, applyOptimisticCart, refreshCart]);

    const removeFromCart = useCallback(async (variantId: string) => {
        const userId = GET_USER_ID();
        const item = cartItems.find(i => i.variant.id === variantId);
        if (!item) return;

        const newItems = cartItems.filter((i) => i.variant.id !== variantId);
        applyOptimisticCart(newItems);

        if (newItems.length === 0) {
            setTotalItems(0);
            setCartSubtotal(0);
            setTotalGstCharges(0);
            setTotalMakingCharges(0);
            setTotalPayableAmount(0);
            setTotalCartItemWeight(0);
            setDeliveryFee(0);
            setDeliveryDistanceKm(null);
            setRatePerKm(null);
            setTotalDiscountAmount(0);
            setTotalDiscountPercentage(0);
        }

        if (userId && (item.cartId || item.variant?.id)) {
            try {
                if (item.cartId) {
                    await removeCartItem(item.cartId, userId);
                }
            } catch (err) {
                console.error("Failed to remove item from cart:", err);
            } finally {
                if (newItems.length > 0) {
                    await refreshCart();
                }
            }
        }
    }, [cartItems, applyOptimisticCart, refreshCart]);

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
        setTotalDiscountAmount(0);
        setTotalDiscountPercentage(0);
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
                totalDiscountAmount,
                totalDiscountPercentage,
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
