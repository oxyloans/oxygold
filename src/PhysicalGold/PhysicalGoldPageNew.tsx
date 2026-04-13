import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { Package } from "lucide-react";
import HeroSection from "./components/HeroSection";
import TrustBanner from "./components/TrustBanner";
import CategoryGrid from "./components/CategoryGrid";
import ProductCard from "./components/ProductCard";
import LoadingSpinner from "./components/LoadingSpinner";
import { Category, SubCategory, PhysicalGoldProduct } from "./physicalGoldData";
import {
  fetchSubCategories,
  fetchProducts,
  fetchProductImageURLs,
} from "./physicalGoldService";
import "./styles.css";

const PhysicalGoldPageNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, searchQuery, setSearchQuery } = useOutletContext<{ categories: Category[], searchQuery: string, setSearchQuery: (q: string) => void }>();

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<PhysicalGoldProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [loadingProds, setLoadingProds] = useState(false);
  const [showProducts, setShowProducts] = useState(false);



  const handleCategoryClick = useCallback(async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("");
    setProducts([]);
    setShowProducts(true);

    try {
      const data = await fetchSubCategories(categoryId);
      setSubCategories(data);

      if (data.length > 0) {
        handleSubCategoryClick(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    }
  }, []);

  const handleSubCategoryClick = useCallback(async (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);

    try {
      setLoadingProds(true);
      const data = await fetchProducts(subCategoryId);

      const productsWithImages = await Promise.all(
        data.map(async (p) => {
          const imgObj = await fetchProductImageURLs(p.id);
          const firstUrl = imgObj
            ? imgObj.frontViewurl ||
            imgObj.backViewUrl ||
            imgObj.leftViewUrl ||
            imgObj.rightViewUrl ||
            imgObj.topViewUrl ||
            imgObj.bottomViewUrl
            : null;
          return { ...p, imageUrl: firstUrl || p.imageUrl || "" };
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoadingProds(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    if (location.state?.reset) {
      setShowProducts(false);
      setSelectedCategoryId("");
      setSelectedSubCategoryId("");
      setProducts([]);
      navigate(".", { replace: true, state: {} });
    } else if (categories.length > 0 && location.state?.selectedCategory) {
      handleCategoryClick(location.state.selectedCategory);
      navigate(".", { replace: true, state: {} });
    }
  }, [categories, location.state, handleCategoryClick, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/physical-gold", { replace: true, state: {} });
    setShowProducts(false);
    setSearchQuery("");
    window.scrollTo(0, 0);
  }, [navigate, setSearchQuery]);

  if (categories.length === 0) {
    return <LoadingSpinner fullScreen message="Loading Collection..." />;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-background">

      {!showProducts && (
        <>
          <div className="pt-32 md:pt-40">
            <HeroSection />
          </div>
          <TrustBanner />
          <CategoryGrid
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
        </>
      )}

      {showProducts && (
        <div className="flex-1 pt-32 md:pt-40">

          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-4 text-muted">
              <button
                onClick={() => handleLogoClick()}
                className="transition-colors hover:text-primary"
              >
                Home
              </button>
              <span>›</span>
              <button
                onClick={() => {
                  setSelectedSubCategoryId("");
                  setProducts([]);
                }}
                className={`transition-colors hover:text-primary ${!selectedSubCategoryId ? "font-semibold text-foreground cursor-default" : ""}`}
                disabled={!selectedSubCategoryId}
              >
                {categories.find((c) => c.id === selectedCategoryId)?.name || "Category"}
              </button>
              {selectedSubCategoryId && (
                <>
                  <span>›</span>
                  <span className="font-semibold text-foreground">
                    {subCategories.find((s) => s.id === selectedSubCategoryId)?.name || "Subcategory"}
                  </span>
                </>
              )}
            </div>

            {/* Category Hero Block */}
            {(() => {
              const currentCategory = categories.find((c) => c.id === selectedCategoryId);
              return (
                <div className="w-full h-40 md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center mb-10 shadow-md">
                  {currentCategory?.imageUrl ? (
                    <img
                      src={currentCategory.imageUrl}
                      alt={currentCategory.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D251E] to-[#5C3A2E]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                  <div className="relative z-10 flex flex-col items-center text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-3">
                      {currentCategory?.name || "Products"}
                    </h2>
                    <p className="text-[#E5CCA5] font-medium text-sm md:text-base">
                      Exquisite gold {currentCategory?.name?.toLowerCase() || "jewellery"} for every occasion
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Subcategories Tabs -> Block Layout */}
            {subCategories.length > 0 && (
              <div className="mb-12">
                <h3 className="font-serif text-2xl text-[#1A1A1A] font-bold mb-5">Sub categories</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(sub.id)}
                      className={`relative overflow-hidden group/sub px-4 py-8 rounded-xl flex flex-col items-center justify-center transition-all border shadow-sm ${selectedSubCategoryId === sub.id
                        ? "bg-white border-[#C29B27] shadow-md shadow-[#C29B27]/10"
                        : "bg-[#FDFBF7] border-[#F0EBE1] hover:border-[#C29B27]/40 hover:bg-white"
                        }`}
                    >
                      {sub.imageUrl && (
                        <>
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/sub:opacity-30 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
                        </>
                      )}
                      <span className="relative z-10 font-serif font-bold text-[15px] text-[#1A1A1A] mb-1">{sub.name}</span>
                      <span className="relative z-10 text-xs text-[#8A8A8A] font-medium">Explore Details</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Title */}
            {!loadingProds && filteredProducts.length > 0 && (
              <h3 className="font-serif text-2xl text-[#1A1A1A] font-bold mb-6">
                {categories.find((c) => c.id === selectedCategoryId)?.name || "Products"} Collection
              </h3>
            )}

            {/* Products Grid */}
            {loadingProds ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner message="Loading Products..." />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <Package size={64} style={{ color: "hsl(30, 15%, 92%)" }} />
                <div className="text-center space-y-2">
                  <p className="font-bold text-xl" style={{ color: "hsl(20, 10%, 12%)" }}>
                    {searchQuery ? "No products found" : "Collection coming soon"}
                  </p>
                  <p className="text-sm" style={{ color: "hsl(20, 8%, 45%)" }}>
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "Select a different category to explore"}
                  </p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm font-bold rounded-full px-6 py-2 transition-colors"
                    style={{
                      color: "hsl(38, 80%, 45%)",
                      border: "1px solid hsl(30, 20%, 88%)",
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/physical-gold/product/${product.id}`, {
                      state: {
                        categoryId: selectedCategoryId,
                        categoryName: categories.find(c => c.id === selectedCategoryId)?.name,
                        subCategoryId: selectedSubCategoryId,
                        subCategoryName: subCategories.find(s => s.id === selectedSubCategoryId)?.name
                      }
                    })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PhysicalGoldPageNew;
