import React from "react";
import { Heart, Trash2 } from "lucide-react";
import { PhysicalGoldProduct } from "../physicalGoldData";
import { useWishlist } from "../WishlistContext";
import { getProductTag } from "../mockData";
import "../styles.css";

interface ProductCardProps {
  product: PhysicalGoldProduct;
  onClick: () => void;
  isWishlistPage?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isWishlistPage }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const tag = getProductTag(product.id);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300 bg-[#FAF7F2] border border-[#F0EBE1] rounded-xl overflow-hidden shadow-sm hover:shadow-md flex flex-col"
    >
      {/* Image Container - Square Aspect */}
      <div className="relative overflow-hidden aspect-square bg-[#3D251E] flex-shrink-0">
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
          className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isWishlistPage
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
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">
          {product.categoryName || "PREMIUM"} • {product.subCategoryName || "COLLECTION"}
        </p>
        <h3 className="text-[17px] font-serif leading-tight text-[#1A1A1A] font-bold line-clamp-2">
          {product.productName}
        </h3>
        <p className="text-[11px] text-[#8A8A8A] font-semibold uppercase tracking-wide">
          {product.weight ? `${product.weight}g` : "VARIOUS WEIGHTS"} • {product.purity || "22K"}
        </p>
        <p className="text-base font-bold text-[#C29B27] mt-1">
          ₹{product.priceRange}
        </p>
      </div>
    </div >
  );
};

export default ProductCard;
