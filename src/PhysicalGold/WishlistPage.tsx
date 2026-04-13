import React from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "./WishlistContext";
import ProductCard from "./components/ProductCard";

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#F5F2EE]">
      <main className="pt-40 pb-16 max-w-5xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <button
          onClick={() => navigate("/physical-gold")}
          className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
        </button>

        {/* Page Title */}
        <h1 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
          My Wishlist ({wishlist.length})
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F5F2EE] border border-[#E8E0D5] flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-[#D1C7BB]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-1.5">Your wishlist is empty</h2>
            <p className="text-[12px] text-[#8A8A8A] mb-5 max-w-xs mx-auto leading-relaxed">
              Browse our collection and save your favourite pieces here.
            </p>
            <button
              onClick={() => navigate("/physical-gold")}
              className="px-5 py-2.5 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition"
            >
              Discover Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlistPage={true}
                onClick={() => navigate(`/physical-gold/product/${product.id}`, {
                  state: {
                    categoryId: product.categoryId,
                    categoryName: product.categoryName,
                    subCategoryId: product.subCategoryId,
                    subCategoryName: product.subCategoryName
                  }
                })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;