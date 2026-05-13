import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { Package, X, Search } from "lucide-react";
import HeroSection from "./components/HeroSection";
import TrustBanner from "./components/TrustBanner";
import CategoryGrid from "./components/CategoryGrid";
import ProductCard from "./components/ProductCard";
import LoadingSpinner from "./components/LoadingSpinner";
import FilterSidebar from "./components/FilterSidebar";
import Pagination from "./components/Pagination";
import { Category, SubCategory, PhysicalGoldProduct } from "./physicalGoldData";
import {
  fetchSubCategories,
  searchProducts,
  fetchProductImageURLs,
} from "./physicalGoldService";
import { debounce } from "./utils/debounce";
import "./styles.css";

const PhysicalGoldPageNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, selectedCategoryId: layoutSelectedCategoryId, setSelectedCategoryId: setLayoutSelectedCategoryId } = useOutletContext<{ categories: Category[], selectedCategoryId?: string, setSelectedCategoryId: (id: string | undefined) => void }>();

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<PhysicalGoldProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [loadingProds, setLoadingProds] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [facets, setFacets] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  // Filter state
  const [filters, setFilters] = useState({
    q: "",
    purity: undefined as string | undefined,
    size: undefined as string | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minWeight: undefined as number | undefined,
    maxWeight: undefined as number | undefined,
    inStock: undefined as boolean | undefined,
    sortBy: "NEWEST" as "PRICE_ASC" | "PRICE_DESC" | "NEWEST" | "NAME_ASC",
    page: 0,
    pageSize: 20,
  });

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      purity: undefined,
      size: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minWeight: undefined,
      maxWeight: undefined,
      inStock: undefined,
      sortBy: "NEWEST",
      page: 0,
      pageSize: 20,
    });
    setSearchInput("");
  };

  const removeFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: undefined, page: 0 }));
    if (key === "q") setSearchInput("");
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setFilters(prev => ({ ...prev, q: query, page: 0 }));
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilters(prev => ({ ...prev, q: "", page: 0 }));
  };

  // Sync with layout's selected category
  useEffect(() => {
    if (layoutSelectedCategoryId && layoutSelectedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(layoutSelectedCategoryId);
    }
  }, [layoutSelectedCategoryId]);

  const handleSubCategoryClick = useCallback(async (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);

    try {
      setLoadingProds(true);
      const response = await searchProducts({
        categoryId: Number(subCategoryId),
        productType: "PHYSICAL",
        q: filters.q || undefined,
        sortBy: filters.sortBy,
        page: filters.page,
        pageSize: filters.pageSize,
        purity: filters.purity,
        size: filters.size,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minWeight: filters.minWeight,
        maxWeight: filters.maxWeight,
        inStock: filters.inStock,
      });

      const resultsData = response.data?.results || response.results || [];

      const productsWithImages = await Promise.all(
        resultsData.map(async (p: any) => {
          const imgObj = await fetchProductImageURLs(p.id?.toString() || "");
          const firstUrl = imgObj
            ? imgObj.frontViewurl ||
            imgObj.backViewUrl ||
            imgObj.leftViewUrl ||
            imgObj.rightViewUrl ||
            imgObj.topViewUrl ||
            imgObj.bottomViewUrl
            : p.frontImageUrl || "";
          return {
            ...p,
            id: p.id?.toString() || "",
            productName: p.name || p.productName || "",
            priceRange: p.priceRange || "Price on request",
            subCategoryId: p.categoryId?.toString() || "",
            categoryName: p.categoryName || "",
            imageUrl: firstUrl || ""
          };
        })
      );

      setProducts(productsWithImages);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.total || 0);
      setFacets(response.data?.facets || null);

      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoadingProds(false);
    }
  }, [filters]);

  const handleCategoryClick = useCallback(async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setLayoutSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("");
    setProducts([]);
    setShowProducts(true);
    clearFilters();

    try {
      const data = await fetchSubCategories(categoryId);
      setSubCategories(data);

      if (data.length > 0) {
        handleSubCategoryClick(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    }
  }, [handleSubCategoryClick, setLayoutSelectedCategoryId]);

  // Re-fetch products when filters change (but not on initial mount)
  useEffect(() => {
    if (selectedSubCategoryId && showProducts) {
      handleSubCategoryClick(selectedSubCategoryId);
    }
  }, [filters.q, filters.sortBy, filters.purity, filters.size, filters.minPrice, filters.maxPrice, filters.minWeight, filters.maxWeight, filters.inStock, filters.page]);

  // Sidebar shown whenever a subcategory is selected
  const showSidebar = !!selectedSubCategoryId;

  const filteredProducts = useMemo(() => products, [products]);

  useEffect(() => {
    if (location.state?.reset) {
      setShowProducts(false);
      setSelectedCategoryId("");
      setSelectedSubCategoryId("");
      setProducts([]);
      navigate(".", { replace: true, state: {} });
    } else if (categories.length > 0 && location.state?.selectedCategory) {
      setSelectedCategoryId(location.state.selectedCategory);
      handleCategoryClick(location.state.selectedCategory);
      navigate(".", { replace: true, state: {} });
    }
  }, [categories, location.state, handleCategoryClick, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/physical-gold", { replace: true, state: {} });
    setShowProducts(false);
    setSelectedCategoryId("");
    setLayoutSelectedCategoryId(undefined);
    setSearchInput("");
    clearFilters();
    window.scrollTo(0, 0);
  }, [navigate, setLayoutSelectedCategoryId]);

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
            selectedCategoryId={selectedCategoryId}
          />
        </>
      )}

      {showProducts && (
        <div className="flex-1 pt-32 md:pt-40">

          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <button
                onClick={() => handleLogoClick()}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                Home
              </button>

              <span className="text-gray-400">›</span>

              <button
                onClick={() => {
                  setSelectedSubCategoryId("");
                  setProducts([]);
                }}
                className={`transition-colors ${!selectedSubCategoryId
                    ? "text-primary font-semibold cursor-default"
                    : "text-gray-500 hover:text-primary"
                  }`}
                disabled={!selectedSubCategoryId}
              >
                {categories.find((c) => c.id === selectedCategoryId)?.name || "Category"}
              </button>

              {selectedSubCategoryId && (
                <>
                  <span className="text-gray-400">›</span>
                  <span className="text-primary font-semibold">
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

            {/* Products heading row with search bar inline */}
            {selectedSubCategoryId && (
              <div
                id="products-section"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
              >
                <h3 className="font-serif text-2xl text-[#1A1A1A] font-bold whitespace-nowrap">
                  {subCategories.find((s) => s.id === selectedSubCategoryId)?.name || "Collection"}
                </h3>

                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A8A8A]" />
                  <input
                    type="text"
                    placeholder="Search products in this category..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#E8E0D5] text-[14px] text-[#1A1A1A] bg-white placeholder-[#BEB5AA] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#8B6914] transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Active Filter Chips ────────────────────────────────────────────────
                • Price min+max  → one chip "Price: ₹500 – ₹2,000"  (clears both)
                • Weight min+max → one chip "Weight: 2g – 10g"       (clears both)
                • Everything else → individual chip per filter
            ──────────────────────────────────────────────────────────────────────── */}
            {(() => {
              const chips: React.ReactNode[] = [];

              // Single combined chip for price range
              if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
                chips.push(
                  <button
                    key="priceRange"
                    onClick={() =>
                      setFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined, page: 0 }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B6914] text-white text-[11px] font-medium hover:bg-[#7A5C10] transition"
                  >
                    Price: ₹{filters.minPrice.toLocaleString()} – ₹{filters.maxPrice.toLocaleString()}
                    <X className="h-3 w-3" />
                  </button>
                );
              }

              // Single combined chip for weight range
              if (filters.minWeight !== undefined && filters.maxWeight !== undefined) {
                chips.push(
                  <button
                    key="weightRange"
                    onClick={() =>
                      setFilters(prev => ({ ...prev, minWeight: undefined, maxWeight: undefined, page: 0 }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B6914] text-white text-[11px] font-medium hover:bg-[#7A5C10] transition"
                  >
                    Weight: {filters.minWeight}g – {filters.maxWeight}g
                    <X className="h-3 w-3" />
                  </button>
                );
              }

              // Individual chips for all remaining filters (purity, size, inStock)
              const skipKeys = new Set([
                "page", "pageSize", "sortBy", "q",
                "minPrice", "maxPrice", "minWeight", "maxWeight",
              ]);
              Object.entries(filters).forEach(([key, value]) => {
                if (skipKeys.has(key) || value === undefined) return;
                chips.push(
                  <button
                    key={key}
                    onClick={() => removeFilter(key as keyof typeof filters)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B6914] text-white text-[11px] font-medium hover:bg-[#7A5C10] transition"
                  >
                    {key}: {value?.toString()}
                    <X className="h-3 w-3" />
                  </button>
                );
              });

              return chips.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">{chips}</div>
              ) : null;
            })()}

            {/* Full-width centered loading spinner */}
            {loadingProds && (
              <div className="flex justify-center items-center py-20 w-full">
                <LoadingSpinner message="Loading Products..." />
              </div>
            )}

            {/* Products Grid with Filters */}
            {!loadingProds && (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

                {/* Filter Sidebar */}
                {showSidebar && (
                  <aside className="lg:sticky lg:top-24 h-fit">
                    <FilterSidebar
                      filters={{
                        q: "",
                        page: filters.page,
                        pageSize: filters.pageSize,
                        sortBy: filters.sortBy,
                        purity: filters.purity,
                        size: filters.size,
                        minPrice: filters.minPrice,
                        maxPrice: filters.maxPrice,
                        minWeight: filters.minWeight,
                        maxWeight: filters.maxWeight,
                        inStock: filters.inStock,
                      }}
                      onFilterChange={updateFilters}
                      onClearFilters={clearFilters}
                      facets={facets}
                    />
                  </aside>
                )}

                {/* Products */}
                <div>
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-5 w-full text-center">
                      <Package size={64} style={{ color: "hsl(30, 15%, 92%)" }} />
                      <div className="space-y-2">
                        <p className="font-bold text-xl" style={{ color: "hsl(20, 10%, 12%)" }}>
                          {searchInput ? "No products found" : "No products available"}
                        </p>
                        <p className="text-sm" style={{ color: "hsl(20, 8%, 45%)" }}>
                          {searchInput
                            ? `No results found for "${searchInput}". Try different keywords or clear filters.`
                            : filters.minPrice !== undefined || filters.minWeight !== undefined || filters.purity || filters.size || filters.inStock
                              ? "No products match your filters. Try adjusting your criteria."
                              : "No products available in this category at the moment."}
                        </p>
                      </div>
                      {(searchInput || filters.minPrice !== undefined || filters.minWeight !== undefined || filters.purity || filters.size || filters.inStock) && (
                        <button
                          onClick={() => {
                            clearSearch();
                            clearFilters();
                          }}
                          className="text-sm font-bold rounded-full px-6 py-2 transition-colors"
                          style={{
                            color: "hsl(38, 80%, 45%)",
                            border: "1px solid hsl(30, 20%, 88%)",
                          }}
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={filters.page}
                            totalPages={totalPages}
                            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                            totalElements={totalElements}
                            pageSize={filters.pageSize}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PhysicalGoldPageNew;