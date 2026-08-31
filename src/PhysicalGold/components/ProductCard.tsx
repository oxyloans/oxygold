import React, { useCallback, useState } from "react";
import { Heart, Trash2, ShoppingCart, Check } from "lucide-react";
import { PhysicalGoldProduct } from "../physicalGoldData";
import { useWishlist } from "../WishlistContext";
import { useCart } from "../CartContext";
import { fetchProductVariants } from "../physicalGoldService";
import { getProductTag } from "../mockData";
import "../styles.css";

interface ProductCardProps {
  product: PhysicalGoldProduct;
  onClick: () => void;
  isWishlistPage?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isWishlistPage }) => {
  const { isInWishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const isLiked = isInWishlist(product.id);
  const tag = getProductTag(product.id);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const cartProductItems = cartItems.filter(i => i.product.id === product.id);
  const cartQuantity = cartProductItems.reduce((sum, item) => sum + item.quantity, 0);
  const isInCart = cartQuantity > 0;

  const isSilver = [product.categoryName, product.subCategoryName]
    .filter(Boolean)
    .some((name) => name!.toLowerCase().includes("silver"));
  const productMeta = [
    product.weight ? `${product.weight}g` : isSilver ? null : "VARIOUS WEIGHTS",
    product.purity || (isSilver ? null : "22K"),
  ]
    .filter(Boolean)
    .join(" • ");

  const handleMoveToCart = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      const { variants } = await fetchProductVariants(product.id);
      const selectedVariant = variants.find((v) => v.status === "ACTIVE" || v.status === "active") || variants[0];
      if (!selectedVariant) return;
      await addToCart(product, selectedVariant);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      if (isWishlistPage) await removeFromWishlist(product.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  }, [addToCart, addingToCart, isWishlistPage, product, removeFromWishlist]);

  const handleIncrement = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const firstItem = cartProductItems[0];
    if (!firstItem) {
      await handleMoveToCart();
      return;
    }
    await incrementQuantity(firstItem.variant.id);
  }, [cartProductItems, handleMoveToCart, incrementQuantity]);

  const handleDecrement = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const firstItem = cartProductItems[0];
    if (!firstItem) return;
    await decrementQuantity(firstItem.variant.id, firstItem.cartId);
  }, [cartProductItems, decrementQuantity]);

  return (
    <div
      onClick={onClick}
      className="group h-full cursor-pointer transition-all duration-300 bg-[#FAF7F2] border border-[#F0EBE1] rounded-xl overflow-hidden shadow-sm hover:shadow-md flex flex-col scale-[0.98] hover:scale-[0.985]"
    >
      {/* Image Container - Slightly compact for better mobile density */}
      <div className="relative overflow-hidden aspect-[4/3.8] bg-[#3D251E] flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted">No Image</span>
          </div>
        )}

        {/* Tag Badge */}
        {(tag || product.isBestSeller) && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C29B27] text-white shadow-sm">
            {tag || "BESTSELLER"}
          </span>
        )}

        {/* Wishlist Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isWishlistPage
            ? "opacity-100 bg-[#FFF5F5] text-[#D84C4C] hover:bg-[#FFE5E5]"
            : isLiked
              ? "opacity-100 bg-primary text-white"
              : "opacity-0 group-hover:opacity-100 bg-white text-foreground"
            }`}
        >
          {isWishlistPage ? (
            <Trash2 size={16} />
          ) : (
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1 flex-1">
        <p className="text-[8.5px] uppercase tracking-[0.12em] text-[#8A8A8A] font-semibold">
          {product.categoryName || "PREMIUM"} • {product.subCategoryName || "COLLECTION"}
        </p>
        <h3 className="text-[14px] sm:text-[15px] font-serif leading-tight text-[#1A1A1A] font-bold line-clamp-2 min-h-[2.4em]">
          {product.productName}
        </h3>
        {productMeta && (
          <p className="text-[9.5px] text-[#8A8A8A] font-semibold uppercase tracking-wide">
            {productMeta}
          </p>
        )}
        <div className="flex items-center justify-between gap-1.5 mt-0">
          <p className="text-[14px] font-bold text-[#C29B27] leading-none">
            ₹{product.priceRange}
          </p>
          {isWishlistPage ? (
            <button
              onClick={handleMoveToCart}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#8B6914] px-2 py-1.5 text-[10px] font-medium text-white hover:bg-[#7A5C10] transition leading-none whitespace-nowrap"
            >
              <ShoppingCart size={12} />
              Move to Cart
            </button>
          ) : cartQuantity > 0 ? (
            <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D9C89A] bg-[#F8F1E1] px-2 py-1.5">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8B6914] text-lg font-bold text-white leading-none"
              >
                −
              </button>
              <span className="min-w-[1.2rem] text-center text-[14px] font-bold text-[#1A1A1A]">{cartQuantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8B6914] text-lg font-bold text-white leading-none"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleMoveToCart}
              disabled={addingToCart}
              className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[14px] font-semibold transition-all leading-none whitespace-nowrap ${addedToCart || isInCart
                ? "bg-green-600 text-white"
                : "bg-[#8B6914] text-white hover:bg-[#7A5C10] active:scale-95"
                } ${addingToCart ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {addingToCart ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : addedToCart || isInCart ? (
                <Check size={12} />
              ) : (
                <ShoppingCart size={12} />
              )}
              {addingToCart ? "Adding..." : addedToCart || isInCart ? "Added" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

export default ProductCard;
