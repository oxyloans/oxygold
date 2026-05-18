import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { PhysicalGoldProduct } from "./physicalGoldData";
import { fetchWishlistService, addToWishlistService, removeFromWishlistService, fetchProductImageURLs, fetchProductVariants, fetchMainCategories } from "./physicalGoldService";

interface WishlistContextType {
  wishlist: PhysicalGoldProduct[];
  addToWishlist: (product: PhysicalGoldProduct, variantId?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: PhysicalGoldProduct, variantId?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<PhysicalGoldProduct[]>([]);

  const refreshWishlist = useCallback(async () => {
    const userId = GET_USER_ID();
    if (!userId) {
      setWishlist([]);
      return;
    }
    try {
      const data = await fetchWishlistService(userId);
      console.log("Wishlist API Response:", data);

      const allCategories = await fetchMainCategories();

      if (data?.data && Array.isArray(data.data)) {
        const mappedItems: PhysicalGoldProduct[] = await Promise.all(
          data.data.map(async (item: any) => {
            const productImages = await fetchProductImageURLs(item.productId.toString());
            const imageUrl = productImages ? (productImages.frontViewurl || productImages.backViewUrl || productImages.leftViewUrl || productImages.rightViewUrl || productImages.topViewUrl || productImages.bottomViewUrl) : "";

            const { product: fullProduct } = await fetchProductVariants(item.productId.toString());
            console.log(item);
            let categoryId = item.categoryId?.toString() || "";
            let categoryName = item.categoryName || "";
            let subCategoryName = item.subCategoryName || "";

            if (!categoryId && fullProduct?.subCategoryId) {
              const parentCat = allCategories.find(cat => {
                return cat.id === fullProduct.subCategoryId ||
                  fullProduct.subCategoryId.startsWith(cat.id);
              });
              if (parentCat) {
                categoryId = parentCat.id;
                categoryName = parentCat.name;
              }
            }

            return {
              id: item.productId.toString(),
              productName: item.productName || "",
              imageUrl: imageUrl || "",
              priceRange: item.price ? item.price.toString() : "0",
              description: "",
              subCategoryId: fullProduct?.subCategoryId || "",
              categoryId: categoryId,
              categoryName: categoryName,
              subCategoryName: subCategoryName,
              status: item.status || "",
              wishlistId: item.wishlistId
            } as PhysicalGoldProduct;
          })
        );
        setWishlist(mappedItems);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = async (product: PhysicalGoldProduct, variantId?: string) => {
    const userId = GET_USER_ID();
    if (!userId) {
      setWishlist((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
      return;
    }
    try {
      setWishlist((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });

      let finalVariantId = variantId ? parseInt(variantId) : 0;

      if (!finalVariantId) {
        try {
          const { variants } = await fetchProductVariants(product.id);
          if (variants && variants.length > 0) {
            finalVariantId = parseInt(variants[0].id) || 0;
          }
        } catch (e) {
          console.error("Failed to fetch variants for wishlist item", e);
        }
      }

      await addToWishlistService({
        userId: userId,
        productId: parseInt(product.id),
        productVariantId: finalVariantId
      });
      await refreshWishlist();
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      await refreshWishlist();
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const itemToRemove = wishlist.find(p => p.id === productId);
    const wId = (itemToRemove as any)?.wishlistId;

    setWishlist((prev) => prev.filter((p) => p.id !== productId));

    if (wId) {
      try {
        await removeFromWishlistService(wId);
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        await refreshWishlist();
      }
    }
  };

  const toggleWishlist = async (product: PhysicalGoldProduct, variantId?: string) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product, variantId);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
