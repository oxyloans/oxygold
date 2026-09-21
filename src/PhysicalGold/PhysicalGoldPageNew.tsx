import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Package, Search, SlidersHorizontal, X } from "lucide-react";
import { useCart, isPhysicalGoldUserLoggedIn, ProfileIncompleteError } from "./CartContext";
import FilterSidebar from "./components/FilterSidebar";
import CategoryGrid from "./components/CategoryGrid";

import LoadingSpinner from "./components/LoadingSpinner";

import Pagination from "./components/Pagination";
import { Category, SubCategory, PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import {
  fetchProductVariants,
  fetchSubCategories,
  searchProducts,
  fetchProductImageURLs,
} from "./physicalGoldService";

import "./styles.css";


/** Collect supported image fields without discarding other usable views. */
function collectImageURLs(value: unknown): string[] {
  const urls: string[] = [];
  const visited = new Set<object>();
  const visit = (item: unknown, depth = 0) => {
    if (!item || depth > 5) return;
    if (typeof item === "string") {
      const url = item.trim();
      if (url && !["null", "undefined"].includes(url.toLowerCase()) &&
          /^(https?:\/\/|\/|blob:|data:image\/)/i.test(url)) urls.push(url);
      return;
    }
    if (typeof item !== "object" || visited.has(item)) return;
    visited.add(item);
    if (Array.isArray(item)) { item.forEach(entry => visit(entry, depth + 1)); return; }
    const record = item as Record<string, unknown>;
    for (const key of [
      "frontViewurl", "frontViewUrl", "frontImageUrl", "imageUrl",
      "backViewUrl", "leftViewUrl", "rightViewUrl", "topViewUrl", "bottomViewUrl",
      "url", "imageURLs", "imageUrls", "imageCandidates", "imageSet", "images", "data"
    ]) visit(record[key], depth + 1);
  };
  visit(value);
  return Array.from(new Set(urls));
}

type DisplayProduct = PhysicalGoldProduct & { imageCandidates?: string[] };

const ProductImage: React.FC<{ urls: string[]; alt: string; className?: string }> = ({
  urls, alt, className = ""
}) => {
  const [index, setIndex] = useState(0);
  const identity = urls.join("|");
  useEffect(() => setIndex(0), [identity]);
  const src = urls[index];
  return src ? (
    <img key={src} src={src} alt={alt} loading="lazy" decoding="async"
      onError={() => setIndex(current => current + 1)}
      className={`block h-full w-full object-contain ${className}`} />
  ) : (
    <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-stone-400">
      <Package className="h-8 w-8" aria-hidden="true" />
      <span className="text-[10px]">Image unavailable</span>
    </span>
  );
};


/** Format duplicate price endpoints once, retaining meaningful ranges. */
function displayPrice(value: unknown): string {
  if (value == null || value === "") return "Price on request";
  const text = String(value).trim();
  const match = text.replace(/,/g, "").match(/^(?:₹|INR)?\s*(\d+(?:\.\d+)?)\s*(?:[-–]\s*(?:₹|INR)?\s*(\d+(?:\.\d+)?))?$/i);
  if (!match) return text;
  const format = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(n);
  const low = Number(match[1]);
  const high = match[2] ? Number(match[2]) : low;
  return low === high ? format(low) : `${format(low)} – ${format(high)}`;
}

const CompactProductCard: React.FC<{
  product: DisplayProduct;
  onClick: () => void;
  horizontal?: boolean;
}> = ({ product, onClick, horizontal = false }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [options, setOptions] = useState<ProductVariant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [cartProduct, setCartProduct] = useState<PhysicalGoldProduct>(product);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const busyRef = useRef(false);
  const selected = options.find(v => String(v.id) === selectedId);
  const inCart = selected && cartItems.some(item => item.variant.id === selected.id);

  const handleAdd = async () => {
    if (busyRef.current) return;
    if (!isPhysicalGoldUserLoggedIn()) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
      window.location.assign("/login");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      let variant = selected;
      let currentProduct = cartProduct;
      if (!options.length) {
        const response = await fetchProductVariants(product.id);
        currentProduct = response.product || product;
        setCartProduct(currentProduct);
        const available = response.variants.filter(v => v.stockQuantity > 0);
        setOptions(available);
        if (!available.length) {
          setUnavailable(true);
          setMessage("Currently out of stock.");
          return;
        }
        variant = available[0];
        setSelectedId(String(variant.id));
        if (available.length > 1) {
          setMessage("Choose an option, then add to cart.");
          return;
        }
      }
      if (!variant) return;
      await addToCart(currentProduct, variant);
      setMessage("Added to cart.");
    } catch (error) {
      if (error instanceof ProfileIncompleteError) {
        const returnTo = window.location.pathname + window.location.search;
        navigate(`/physical-gold/profile?tab=info&returnTo=${encodeURIComponent(returnTo)}`);
      } else {
        setMessage(error instanceof Error ? error.message : "Could not add to cart. Please try again.");
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <article className={`flex min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white ${horizontal ? "flex-row" : "flex-col"}`}>
      <button type="button" onClick={onClick} aria-label={`View ${product.productName}`}
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-stone-50 p-2 focus-visible:ring-2 focus-visible:ring-amber-700 ${horizontal ? "w-[44%] border-r border-stone-100" : "aspect-[4/3] w-full border-b border-stone-100"}`}>
        <div className={horizontal ? "h-[200px] w-full sm:h-[230px]" : "h-full w-full"}>
          <ProductImage urls={collectImageURLs(product)} alt={product.productName} />
        </div>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <button type="button" onClick={onClick} className="text-left">
          <h3 className="break-words text-sm font-semibold leading-5 text-stone-900">{product.productName}</h3>
        </button>
        <p className="break-words text-sm font-bold text-stone-900 sm:text-base">
          {selected ? `₹${selected.price.toLocaleString("en-IN")}` : displayPrice(product.priceRange)}
        </p>
        {selected && <div className="flex flex-wrap gap-1.5 text-xs text-stone-600">
          <span className="rounded bg-stone-100 px-2 py-1">{selected.purity}</span>
          <span className="rounded bg-stone-100 px-2 py-1">{selected.weight} g</span>
          {selected.size && <span className="rounded bg-stone-100 px-2 py-1">{selected.size}</span>}
        </div>}
        {options.length > 1 && (
          <label className="text-xs text-stone-600">
            Choose option
            <select value={selectedId} disabled={busy}
              onChange={e => { setSelectedId(e.target.value); setMessage(""); }}
              className="mt-1 h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-2 text-xs">
              {options.map(v => <option key={v.id} value={String(v.id)}>
                {v.purity} · {v.weight}g{v.size ? ` · ${v.size}` : ""} · ₹{v.price.toLocaleString("en-IN")}
              </option>)}
            </select>
          </label>
        )}
        <div className="mt-auto grid gap-1 pt-1">
          <button type="button" disabled={busy || unavailable}
            onClick={inCart ? () => navigate("/physical-gold/cart") : handleAdd}
            className="min-h-11 rounded-lg bg-[#8B6914] px-3 py-2 text-sm font-semibold text-white hover:bg-[#735710] disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Adding…" : unavailable ? "Out of stock" : inCart ? "Go to cart" : "Add to cart"}
          </button>
          <button type="button" onClick={onClick} className="min-h-9 text-xs text-stone-600 hover:text-amber-800">View details →</button>
        </div>
        {message && <p role="status" className="break-words text-xs text-stone-600">{message}</p>}
      </div>
    </article>
  );
};

const PhysicalGoldPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId: routeCategoryId, subCategoryId: routeSubCategoryId } = useParams();
  const { categories, setSelectedCategoryId: setLayoutSelectedCategoryId } = useOutletContext<{ categories: Category[], selectedCategoryId?: string, setSelectedCategoryId: (id: string | undefined) => void }>();
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [categoriesReady, setCategoriesReady] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [loadingProds, setLoadingProds] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [facets, setFacets] = useState<React.ComponentProps<typeof FilterSidebar>["facets"]>(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = filterDialogRef.current;
    if (!dialog) return;
    if (mobileFilterOpen && !dialog.open) dialog.showModal();
    if (!mobileFilterOpen && dialog.open) dialog.close();
    if (!mobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setMobileFilterOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", closeOnDesktop);
    };
  }, [mobileFilterOpen]);

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

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters(prev => prev.q === searchInput ? prev : ({...prev, q: searchInput, page: 0})), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value);

  const handleCategoryClick = useCallback((categoryId: string) => {
    navigate(`/physical-gold/category/${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleSubCategoryNavigation = useCallback((subCategoryId: string) => {
    if (!selectedCategoryId) return;
    navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}/subcategory/${encodeURIComponent(subCategoryId)}`);
  }, [navigate, selectedCategoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    setSelectedCategoryId(routeCategoryId || "");
    setSelectedSubCategoryId("");
    setShowProducts(Boolean(routeCategoryId));
    setLayoutSelectedCategoryId(routeCategoryId);
    setProducts([]);
    setCategoriesReady(false);
    setSubCategories([]);
    setFacets(null);
    setMobileFilterOpen(false);
    setTotalPages(0);
    setTotalElements(0);
    clearFilters();
    if (!routeCategoryId || !categories.length) return;
    if (!categories.some(c => c.id === routeCategoryId)) {
      navigate("/physical-gold", {replace: true});
      return;
    }
    fetchSubCategories(routeCategoryId).then(data => {
      if (cancelled) return;
      setSubCategories(data);
      if (routeSubCategoryId && !data.some(sub => sub.id === routeSubCategoryId)) {
        navigate(`/physical-gold/category/${encodeURIComponent(routeCategoryId)}`, {replace: true});
        return;
      }
      setSelectedSubCategoryId(routeSubCategoryId || "");
      setCategoriesReady(true);
    }).catch(() => {
      if (!cancelled) setLoadError("Could not load this collection. Please try again.");
    });
    return () => { cancelled = true; };
  }, [routeCategoryId, routeSubCategoryId, categories, navigate, setLayoutSelectedCategoryId, retryCount]);

  useEffect(() => {
    if (!categoriesReady || !selectedCategoryId || selectedCategoryId !== routeCategoryId || selectedSubCategoryId !== (routeSubCategoryId || "")) return;
    let cancelled = false;
    setLoadingProds(true);
    setLoadError("");
    const load = async () => {
      try {
        // Category routes aggregate their subcategories; direct subcategory routes
        // retain the existing server pagination and filter contract.
        const query = async (categoryId: string, page: number) => {
          const response = await searchProducts({
            ...filters, categoryId: Number(categoryId), productType: "PHYSICAL",
            q: filters.q || undefined, page, pageSize: filters.pageSize
          });
          return response.data || response;
        };
        let data: any;
        if (selectedSubCategoryId || !subCategories.length) {
          data = await query(selectedSubCategoryId || selectedCategoryId, filters.page);
        } else {
          const mergedFacets = {byPurity: {} as Record<string, number>, bySize: {} as Record<string, number>};
          const groups = await Promise.all(subCategories.map(async sub => {
            const first = await query(sub.id, 0);
            for (const key of ["byPurity", "bySize"] as const) {
              for (const [value, count] of Object.entries(first.facets?.[key] || {})) {
                mergedFacets[key][value] = (mergedFacets[key][value] || 0) + Number(count);
              }
            }
            const rows = [...(first.results || [])];
            const pageCount = first.totalPages ?? Math.ceil((first.total ?? first.totalElements ?? rows.length) / filters.pageSize);
            for (let page = 1; page < pageCount; page += 1) {
              if (cancelled) return [];
              const next = await query(sub.id, page);
              rows.push(...(next.results || []));
            }
            return rows.map((row: any) => ({...row, categoryId: row.categoryId ?? sub.id}));
          }));
          if (cancelled) return;
          const rows: any[] = Array.from(new Map(groups.flat().map(row => [String(row.id), row])).values());
          const numericPrice = (row: any) => {
            const value = row.price ?? row.minPrice ?? String(row.priceRange || "").replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/)?.[0];
            const number = Number(value);
            return value != null && Number.isFinite(number) ? number : null;
          };
          rows.sort((a, b) => {
            if (filters.sortBy === "NAME_ASC") return String(a.name || a.productName || "").localeCompare(String(b.name || b.productName || ""));
            if (filters.sortBy === "PRICE_ASC" || filters.sortBy === "PRICE_DESC") {
              const left = numericPrice(a), right = numericPrice(b);
              if (left === null) return right === null ? 0 : 1;
              if (right === null) return -1;
              return filters.sortBy === "PRICE_ASC" ? left - right : right - left;
            }
            const date = (row: any) => Date.parse(row.createdAt || row.createdDate || "") || 0;
            return date(b) - date(a);
          });
          data = {results: rows.slice(filters.page * filters.pageSize, (filters.page + 1) * filters.pageSize),
            total: rows.length, totalPages: Math.ceil(rows.length / filters.pageSize), facets: mergedFacets};
        }
        const enriched = await Promise.all((data.results || []).map(async (p: any) => {
          // Preserve search response images; append views from the image endpoint.
          let imageCandidates = collectImageURLs(p);
          try {
            const images = await fetchProductImageURLs(String(p.id));
            imageCandidates = Array.from(new Set([...imageCandidates, ...collectImageURLs(images)]));
          } catch { /* Existing image URLs remain usable if this request fails. */ }
          return {...p, id: String(p.id), productName: p.name || p.productName || "Product",
            priceRange: p.priceRange || (typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : "Price on request"),
            subCategoryId: String(p.categoryId || selectedSubCategoryId),
            categoryName: p.categoryName || categories.find(c => c.id === selectedCategoryId)?.name || "",
            imageUrl: imageCandidates[0] || "", imageCandidates};
        }));
        if (cancelled) return;
        setProducts(enriched);
        setFacets(data.facets || null);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.total ?? data.totalElements ?? enriched.length);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setLoadError("Could not load products. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingProds(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [categoriesReady, subCategories, selectedSubCategoryId, routeSubCategoryId, routeCategoryId, selectedCategoryId, categories, filters, retryCount]);

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

  const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || "Collection";
  const subCategoryName = subCategories.find(c => c.id === selectedSubCategoryId)?.name || "Products";
  const activeCount = [filters.purity, filters.size, filters.minPrice, filters.maxPrice,
    filters.minWeight, filters.maxWeight, filters.inStock].filter(v => v !== undefined && v !== "").length;

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:px-6 lg:pt-28">
        {!showProducts ? (
          <CategoryGrid categories={categories} onCategoryClick={handleCategoryClick} selectedCategoryId={selectedCategoryId} />
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <button onClick={handleLogoClick} className="min-h-8 hover:text-stone-900">Home</button>

            </nav>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight">{categoryName}</h1>
            <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" aria-label="Subcategories">
              <button type="button" aria-pressed={!selectedSubCategoryId}
                onClick={() => navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}`)}
                className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-medium ${!selectedSubCategoryId ? "border-amber-700 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600"}`}>
                All
              </button>
              {subCategories.map(sub => (
                <button type="button" key={sub.id}
                  onClick={() => handleSubCategoryNavigation(sub.id)}
                  aria-pressed={selectedSubCategoryId === sub.id}
                  className={`flex max-w-[240px] shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-amber-700 ${selectedSubCategoryId === sub.id
                    ? "border-amber-700 bg-amber-50 text-amber-900"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                    <ProductImage urls={collectImageURLs(sub)} alt={sub.name} className="p-1" />
                  </span>
                  <span className="line-clamp-2 text-left font-medium leading-4">{sub.name}</span>
                </button>
              ))}
            </div>

                    <div className="flex w-full min-w-0 gap-2 md:w-72 md:shrink-0">
                      <div className="relative min-w-0 flex-1 sm:w-56">
                        <Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                        <input aria-label="Search products" type="search" placeholder="Search products"
                          value={searchInput} onChange={handleSearchChange}
                          className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-amber-700" />
                      </div>
                      <button type="button" aria-expanded={mobileFilterOpen} aria-controls="collection-filters"
                        onClick={() => setMobileFilterOpen(open => !open)}
                        className={`lg:hidden flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm ${mobileFilterOpen ? "border-stone-900 bg-stone-50" : "border-stone-200"}`}>
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                      </button>
                    </div>
            </div>

            {loadError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {loadError} <button onClick={() => setRetryCount(n => n + 1)} className="ml-2 min-h-10 font-medium underline">Retry</button>
            </div>}
            {selectedCategoryId && (
              <>
                <section id="products-section" className="scroll-mt-28 border-b border-stone-200 pb-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="sr-only">Products in {subCategoryName}</h2>
                      <p className="mt-0.5 text-xs text-stone-500" aria-live="polite">
                        {loadingProds ? "Updating products…" : "Browse products"}
                      </p>
                    </div>

                  </div>
                </section>
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4">
                  <aside className="hidden h-fit min-w-0 lg:sticky lg:top-28 lg:block">
                    <FilterSidebar filters={{...filters, q: ""}}
                      onFilterChange={updateFilters} onClearFilters={clearFilters} facets={facets} />
                  </aside>
                  <div className="min-w-0">
                {activeCount > 0 && <div className="mb-2 flex items-center justify-between text-xs text-stone-500">
                  <span>Filters applied</span>
                  <button onClick={clearFilters} className="min-h-8 text-amber-800 underline">Clear filters</button>
                </div>}
                {loadError ? null : loadingProds ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products" aria-busy="true">
                    {Array.from({length: 10}, (_, i) => <div key={i} className="animate-pulse rounded-xl border border-stone-100 p-3"><div className="aspect-square rounded-lg bg-stone-100" /><div className="mt-4 h-3 w-3/4 rounded bg-stone-100" /><div className="mt-3 h-3 w-1/2 rounded bg-stone-100" /></div>)}
                  </div>
                ) : products.length ? (
                  <div className="grid grid-cols-2 auto-rows-fr gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {products.map(product => <CompactProductCard key={product.id} product={product} horizontal={false}
                      onClick={() => navigate(`/physical-gold/product/${product.id}`, { state: {
                        categoryId: selectedCategoryId, categoryName, subCategoryId: selectedSubCategoryId, subCategoryName
                      }})} />)}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-200 px-5 py-16 text-center">
                    <Package className="mx-auto mb-3 h-8 w-8 text-stone-300" />
                    <h3 className="font-semibold">No products found</h3>
                    <p className="mt-2 text-sm text-stone-500">Try another search or adjust your filters.</p>
                    <button onClick={clearFilters} className="mt-4 min-h-11 text-sm font-medium underline">Clear filters</button>
                  </div>
                )}
                {!loadingProds && totalPages > 1 && <div className="mt-8 overflow-x-auto">
                  <Pagination currentPage={filters.page} totalPages={totalPages}
                    onPageChange={page => setFilters(prev => ({...prev, page}))}
                    totalElements={totalElements} pageSize={filters.pageSize} />
                </div>}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <dialog ref={filterDialogRef} id="collection-filters" aria-labelledby="filter-title"
        onCancel={() => setMobileFilterOpen(false)} onClose={() => setMobileFilterOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setMobileFilterOpen(false); }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none rounded-t-2xl border-0 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-black/40">
        <div className="flex max-h-[85dvh] flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-stone-200 px-5 py-3">
            <h2 id="filter-title" className="text-base font-semibold">Filters</h2>
            <button type="button" aria-label="Close filters" onClick={() => setMobileFilterOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-stone-100"><X className="h-5 w-5" /></button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {mobileFilterOpen && <FilterSidebar filters={{...filters, q: ""}}
              onFilterChange={updateFilters} onClearFilters={clearFilters} facets={facets} />}
          </div>
          <footer className="shrink-0 border-t border-stone-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setMobileFilterOpen(false)}
              className="h-12 w-full rounded-xl bg-[#8B6914] text-sm font-semibold text-white">Show products</button>
          </footer>
        </div>
      </dialog>
    </main>
  );
};

export default PhysicalGoldPageNew;