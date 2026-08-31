import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Package, X, Search, SlidersHorizontal } from "lucide-react";
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
  const { categoryId: routeCategoryId, subCategoryId: routeSubCategoryId } = useParams();
  const { categories, setSelectedCategoryId: setLayoutSelectedCategoryId } = useOutletContext<{ categories: Category[], selectedCategoryId?: string, setSelectedCategoryId: (id: string | undefined) => void }>();
  const loadedRouteRef = useRef("");

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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const handleSubCategoryClick = useCallback(async (subCategoryId: string, shouldScroll = true) => {
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
            categoryName: p.categoryName || categories.find((category) => category.id === selectedCategoryId)?.name || "",
            subCategoryName: p.subCategoryName || subCategories.find((subCategory) => subCategory.id === selectedSubCategoryId)?.name || "",
            imageUrl: firstUrl || ""
          };
        })
      );

      setProducts(productsWithImages);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.total || 0);
      setFacets(response.data?.facets || null);

      if (shouldScroll) {
        setTimeout(() => {
          const productsSection = document.getElementById('products-section');
          productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoadingProds(false);
    }
  }, [filters]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    navigate(`/physical-gold/category/${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleSubCategoryNavigation = useCallback((subCategoryId: string) => {
    if (!selectedCategoryId) return;
    navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}/subcategory/${encodeURIComponent(subCategoryId)}`);
  }, [navigate, selectedCategoryId]);

  // Re-fetch products when filters change (but not on initial mount)
  useEffect(() => {
    if (selectedSubCategoryId && showProducts) {
      handleSubCategoryClick(selectedSubCategoryId, false);
    }
  }, [filters.q, filters.sortBy, filters.purity, filters.size, filters.minPrice, filters.maxPrice, filters.minWeight, filters.maxWeight, filters.inStock, filters.page]);

  // Sidebar shown whenever a subcategory is selected
  const showSidebar = !!selectedSubCategoryId;

  const filteredProducts = useMemo(() => products, [products]);

  useEffect(() => {
    if (categories.length === 0) return;

    const routeKey = `${routeCategoryId || ""}/${routeSubCategoryId || ""}`;
    if (loadedRouteRef.current === routeKey) return;
    loadedRouteRef.current = routeKey;

    if (!routeCategoryId) {
      setShowProducts(false);
      setSelectedCategoryId("");
      setSelectedSubCategoryId("");
      setSubCategories([]);
      setProducts([]);
      setLayoutSelectedCategoryId(undefined);
      return;
    }

    if (!categories.some((category) => category.id === routeCategoryId)) {
      navigate("/physical-gold", { replace: true });
      return;
    }

    setSelectedCategoryId(routeCategoryId);
    setLayoutSelectedCategoryId(routeCategoryId);
    setShowProducts(true);
    setSelectedSubCategoryId("");
    setProducts([]);
    clearFilters();

    fetchSubCategories(routeCategoryId)
      .then((data) => {
        setSubCategories(data);
        const selectedSubCategory = routeSubCategoryId && data.some((subCategory) => subCategory.id === routeSubCategoryId)
          ? routeSubCategoryId
          : data[0]?.id;

        if (!selectedSubCategory) return;

        if (!routeSubCategoryId) {
          navigate(
            `/physical-gold/category/${encodeURIComponent(routeCategoryId)}/subcategory/${encodeURIComponent(selectedSubCategory)}`,
            { replace: true },
          );
          return;
        }

        handleSubCategoryClick(selectedSubCategory);
      })
      .catch((error) => console.error("Failed to load subcategories:", error));
  }, [categories, routeCategoryId, routeSubCategoryId, navigate, handleSubCategoryClick, setLayoutSelectedCategoryId]);

  const handleLogoClick = useCallback(() => {
    navigate("/physical-gold");
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
          <div className="pt-12 md:pt-20">
            {/* <HeroSection /> */}
          </div>
          {/* <TrustBanner /> */}
          <CategoryGrid
            categories={categories}
            onCategoryClick={handleCategoryClick}
            selectedCategoryId={selectedCategoryId}
          />
        </>
      )}

      {showProducts && (
        <div className="flex-1 pt-20 sm:pt-24 md:pt-32 lg:pt-32 ">

          <div className="container mx-auto px-8 py-5 sm:py-8">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm mb-5 sm:mb-6">
              <button
                onClick={() => handleLogoClick()}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                Home
              </button>

              <span className="text-gray-400">›</span>

              <button
                onClick={() => navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}`)}
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
            {/* {(() => {
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
            })()} */}

            {/* Subcategories */}
            {subCategories.length > 0 && (
              <div className="mb-4 ">
                <h2 className="font-serif text-xl text-[#1A1A1A] font-bold mb-4">Sub Categories</h2>

                {/* Mobile: horizontal scroll */}
                <div className="flex sm:hidden gap-2 overflow-x-auto pb-3 w-full scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryNavigation(sub.id)}
                      className={`relative overflow-hidden flex-shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all border ${selectedSubCategoryId === sub.id
                          ? "bg-white border-[#C29B27] shadow-md shadow-[#C29B27]/20"
                          : "bg-[#FDFBF7] border-[#F0EBE1] active:border-[#C29B27]/40"
                        }`}
                    >
                      {sub.imageUrl && (
                        <>
                          <img src={sub.imageUrl} alt={sub.name} className="absolute inset-0 w-full h-full object-cover opacity-20" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
                        </>
                      )}
                      <span className="relative z-10 font-semibold text-[11px] text-[#1A1A1A] text-center px-1 leading-tight mb-0.5">{sub.name}</span>
                      <span className="relative z-10 text-[9px] text-[#8A8A8A]">Explore</span>
                      {selectedSubCategoryId === sub.id && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#C29B27] flex items-center justify-center">
                          <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tablet/Desktop: grid */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryNavigation(sub.id)}
                      className={`relative overflow-hidden group/sub min-h-28 px-3 py-5 sm:py-6 rounded-xl flex flex-col items-center justify-center transition-all border shadow-sm ${selectedSubCategoryId === sub.id
                          ? "bg-white border-[#C29B27] shadow-md shadow-[#C29B27]/10"
                          : "bg-[#FDFBF7] border-[#F0EBE1] hover:border-[#C29B27]/40 hover:bg-white"
                        }`}
                    >
                      {sub.imageUrl && (
                        <>
                          <img src={sub.imageUrl} alt={sub.name} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/sub:opacity-30 transition-opacity" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
                        </>
                      )}
                      <span className="relative z-10 font-serif font-bold text-[15px] text-[#1A1A1A] mb-1 text-center">{sub.name}</span>
                      <span className="relative z-10 text-xs text-[#8A8A8A] font-medium">Explore Details</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products heading row with search + mobile filter button */}
            {selectedSubCategoryId && (
              <div
                id="products-section"
                className="scroll-mt-24 sm:scroll-mt-28 flex flex-col sm:flex-row  sm:items-center sm:justify-between gap-3 mb-4"
              >
                <h3 className="font-serif text-2xl text-[#1A1A1A] font-bold whitespace-nowrap">
                  {subCategories.find((s) => s.id === selectedSubCategoryId)?.name || "Collection"}
                </h3>

                <div className="flex items-center gap-2 w-full sm:max-w-sm">
                  {/* Mobile Filter Button */}
                  {showSidebar && (
                    <button
                      onClick={() => setMobileFilterOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E8E0D5] bg-white text-[13px] font-semibold text-[#1A1A1A] flex-shrink-0 shadow-sm"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-[#8B6914]" />
                      Filters
                    </button>
                  )}
                  {/* Search — hidden on mobile, visible sm+ */}
                  <div className="relative flex-1 hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A8A8A]" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#E8E0D5] text-[14px] text-[#1A1A1A] bg-white placeholder-[#BEB5AA] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition"
                    />
                    {searchInput && (
                      <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#8B6914] transition">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
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
                  <aside className="hidden lg:sticky lg:top-24 h-fit lg:block">
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
                      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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

      {/* Mobile Filter Bottom Sheet — only on mobile */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0EBE1]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#8B6914]" />
                <span className="text-[15px] font-bold text-[#1A1A1A]">Filters</span>
              </div>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-[#8A8A8A]" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
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
            </div>
            {/* Apply button */}
            <div className="px-5 py-4 border-t border-[#F0EBE1]">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#8B6914] text-white text-[14px] font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PhysicalGoldPageNew;
