import React from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "./WishlistContext";
import ProductCard from "./components/ProductCard";

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 md:pt-32 lg:pt-36">

        {/* Back button */}
        <button
          onClick={() => navigate("/physical-gold")}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        {/* Page Title */}
        <div className="mb-6 flex items-baseline justify-between border-b border-[#E8E2D8] pb-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            My Wishlist
          </h1>
          <span className="text-sm font-semibold text-[#8B6914] bg-amber-50 border border-amber-200/60 rounded-full px-3 py-0.5">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl  p-12 text-center">
            <div className="h-16 w-16 rounded-full  flex items-center justify-center mx-auto mb-4 ">
              <Heart className="h-7 w-7 text-[#D1C7BB]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-1.5">Your wishlist is empty</h2>
            <p className="text-[13px] text-[#8A8A8A] mb-6 max-w-xs mx-auto leading-relaxed">
              Explore our physical gold & silver collection and save your favourite pieces here.
            </p>
            <button
              onClick={() => navigate("/physical-gold")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C29B27] to-[#8B6914] text-white text-[13px] font-semibold hover:from-[#B08B20] hover:to-[#78590E] transition shadow-sm hover:shadow-md"
            >
              Discover Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 auto-rows-fr gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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