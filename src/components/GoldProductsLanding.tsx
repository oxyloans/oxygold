import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  Search,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { ProductVariant, resolveS3ImageUrl } from "../PhysicalGold/physicalGoldData";
import { fetchGoldSilverRateBreakdown, fetchProductVariants, GoldSilverRateBreakdown } from "../PhysicalGold/physicalGoldService";

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  frontViewurl: string | null;
  status: string;
  price: number;
  mrp: number | null;
  size: string;
  purity: string;
  weight: number | null;
  variantId?: number | string | null;
}

interface VariantSnippet {
  id?: number | string;
  size?: string | null;
  purity?: string | null;
  weight?: number | string | null;
  price?: number | null;
  mrp?: number | null;
  status?: string | null;
  stockQuantity?: number | null;
}

interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number | null;
  mrp?: number | null;
  size?: string | null;
  purity?: string | null;
  weight?: number | string | null;
  variants?: VariantSnippet[] | null;
  listVariantResponse?: VariantSnippet[] | null;
  productVariants?: VariantSnippet[] | null;
  variantResponses?: VariantSnippet[] | null;
  status?: string;
}

interface CategoryResponse {
  id: number;
  name: string;
  status: string;
  products: ProductResponse[];
}

const API_URL =
  import.meta.env.VITE_OXYGOLD_CATEGORIES_API_URL?.trim() ||
  "https://meta.oxyloans.com/api/oxygold-api/admin/categories/categories-with-products";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatWeight(weight: number): string {
  return Number.isInteger(weight)
    ? String(weight)
    : weight.toFixed(2).replace(/\.?0+$/, "");
}

function pickPrimaryVariant<
  T extends { status?: string | null; stockQuantity?: number | null }
>(variants?: T[] | null): T | undefined {
  if (!variants?.length) return undefined;
  return (
    variants.find(
      (v) =>
        (!v.status || v.status === "ACTIVE") &&
        (v.stockQuantity == null || Number(v.stockQuantity) > 0)
    ) ||
    variants.find((v) => !v.status || v.status === "ACTIVE") ||
    variants[0]
  );
}

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);

  if (!product.frontViewurl || failed) {
    return (
      <div className="grid h-full place-items-center text-[#B8962E]">
        <ShoppingBag size={48} strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <img
      src={product.frontViewurl}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105 sm:p-5 lg:p-6"
    />
  );
}

export default function GoldProductsLanding() {
  const navigate = useNavigate();

  const tabsRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  // Price Breakup & Variant State
  const [variantCache, setVariantCache] = useState<Record<number, ProductVariant>>({});
  const [breakupCache, setBreakupCache] = useState<Record<number, GoldSilverRateBreakdown>>({});
  const [variantSettled, setVariantSettled] = useState<Record<number, true>>({});
  const [breakupSettled, setBreakupSettled] = useState<Record<number, true>>({});
  const [loadingBreakupId, setLoadingBreakupId] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const fetchingRef = useRef<Set<number>>(new Set());

  const fetchBreakupForProduct = useCallback(async (product: Product) => {
    const productId = product.id;
    if (fetchingRef.current.has(productId)) return;
    fetchingRef.current.add(productId);
    setLoadingBreakupId(productId);
    try {
      let targetVariantId: string | number = product.variantId || productId;
      if (!product.variantId) {
        const { variants } = await fetchProductVariants(String(productId), {
          includeImages: false,
        });
        const primaryVariant = pickPrimaryVariant(variants);
        if (primaryVariant) {
          setVariantCache((prev) => ({ ...prev, [productId]: primaryVariant }));
          targetVariantId = primaryVariant.id;
        }
        setVariantSettled((prev) => ({ ...prev, [productId]: true }));
      }
      const data = await fetchGoldSilverRateBreakdown(targetVariantId);
      if (data) {
        setBreakupCache((prev) => ({ ...prev, [productId]: data }));
      }
    } catch (err) {
      console.warn("Failed to fetch price breakup for product:", productId, err);
    } finally {
      setVariantSettled((prev) => (prev[productId] ? prev : { ...prev, [productId]: true }));
      setBreakupSettled((prev) => (prev[productId] ? prev : { ...prev, [productId]: true }));
      setLoadingBreakupId((curr) => (curr === productId ? null : curr));
    }
  }, []);

  const hasOfferDiscount = useCallback((breakup?: GoldSilverRateBreakdown | null) => {
    if (!breakup) return false;
    return (
      Number(breakup.discountPercentage || 0) > 0 ||
      Number(breakup.discountAmount || 0) > 0
    );
  }, []);

  const handleMouseEnterBreakup = useCallback((product: Product) => {
    setHoveredProductId(product.id);
    if (!breakupCache[product.id]) {
      fetchBreakupForProduct(product);
    }
  }, [breakupCache, fetchBreakupForProduct]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      const apiKey = import.meta.env.VITE_OXYGOLD_API_KEY?.trim();

      if (!apiKey) {
        setError(
          "Products are temporarily unavailable. Please try again shortly."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      fetchingRef.current.clear();
      setVariantSettled({});
      setBreakupSettled({});

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-API-KEY": apiKey,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load products (${response.status}).`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid products response received.");
        }

        const categoryData = data as CategoryResponse[];

        const mappedProducts = categoryData
          .filter((item) => item.status === "ACTIVE")
          .flatMap((parentCategory) =>
            (parentCategory.products ?? [])
              .filter((product) => !product.status || product.status === "ACTIVE")
              .map<Product>((product) => {
                const primaryEmbedded = pickPrimaryVariant(
                  product.variants ??
                    product.listVariantResponse ??
                    product.productVariants ??
                    product.variantResponses
                );
                const rawWeight = primaryEmbedded?.weight ?? product.weight;
                const rawMrp = primaryEmbedded?.mrp ?? product.mrp;

                return {
                  id: product.id,
                  name: product.name,
                  description: product.description?.trim() ?? "",
                  categoryId: parentCategory.id,
                  categoryName: parentCategory.name,
                  frontViewurl: resolveS3ImageUrl(product.image) || null,
                  status: product.status ?? "ACTIVE",
                  price: Number(primaryEmbedded?.price ?? product.price) || 0,
                  mrp: rawMrp != null ? Number(rawMrp) : null,
                  size: String(primaryEmbedded?.size ?? product.size ?? "").trim(),
                  purity: String(primaryEmbedded?.purity ?? product.purity ?? "").trim(),
                  weight: rawWeight != null && rawWeight !== "" ? Number(rawWeight) : null,
                  variantId: primaryEmbedded?.id ?? null,
                };
              })
          );

        setProducts(mappedProducts);
      } catch (reason) {
        if ((reason as Error).name !== "AbortError") {
          setError(
            (reason as Error).message || "Unable to load products."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [retryKey]);

  useEffect(() => {
    if (!products.length) return;

    let cancelled = false;
    let pendingVariants: Record<number, ProductVariant> = {};
    let pendingBreakups: Record<number, GoldSilverRateBreakdown> = {};
    let pendingVariantDone: Record<number, true> = {};
    let pendingBreakupDone: Record<number, true> = {};
    let flushTimer: number | null = null;

    const flush = () => {
      if (flushTimer !== null) {
        window.clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (cancelled) return;
      const vBatch = pendingVariants;
      const bBatch = pendingBreakups;
      const vDoneBatch = pendingVariantDone;
      const bDoneBatch = pendingBreakupDone;
      pendingVariants = {};
      pendingBreakups = {};
      pendingVariantDone = {};
      pendingBreakupDone = {};

      if (Object.keys(vBatch).length > 0) {
        setVariantCache((prev) => ({ ...prev, ...vBatch }));
      }
      if (Object.keys(vDoneBatch).length > 0) {
        setVariantSettled((prev) => ({ ...prev, ...vDoneBatch }));
      }
      if (Object.keys(bBatch).length > 0) {
        setBreakupCache((prev) => ({ ...prev, ...bBatch }));
      }
      if (Object.keys(bDoneBatch).length > 0) {
        setBreakupSettled((prev) => ({ ...prev, ...bDoneBatch }));
      }
    };

    const scheduleFlush = () => {
      if (flushTimer === null) {
        flushTimer = window.setTimeout(flush, 50);
      }
    };

    const inFlightIds = new Set<number>();

    const tasks = products
      .filter((product) => !fetchingRef.current.has(product.id))
      .map(async (product) => {
        fetchingRef.current.add(product.id);
        inFlightIds.add(product.id);
        try {
          let targetVariantId: string | number = product.variantId || product.id;

          if (!product.variantId) {
            const { variants } = await fetchProductVariants(String(product.id), {
              includeImages: false,
            });
            if (cancelled) return;
            const primaryVariant = pickPrimaryVariant(variants);
            if (primaryVariant) {
              pendingVariants[product.id] = primaryVariant;
              targetVariantId = primaryVariant.id;
            }
            pendingVariantDone[product.id] = true;
            scheduleFlush();
          }

          const breakup = await fetchGoldSilverRateBreakdown(targetVariantId);
          if (!cancelled) {
            if (breakup) {
              pendingBreakups[product.id] = breakup;
            }
            pendingBreakupDone[product.id] = true;
            scheduleFlush();
            inFlightIds.delete(product.id);
          }
        } catch (err) {
          inFlightIds.delete(product.id);
          fetchingRef.current.delete(product.id);
          if (!cancelled) {
            pendingVariantDone[product.id] = true;
            pendingBreakupDone[product.id] = true;
            scheduleFlush();
          }
          console.warn("Failed to prefetch product details:", product.id, err);
        }
      });

    void Promise.allSettled(tasks).then(() => {
      if (!cancelled) flush();
    });

    return () => {
      cancelled = true;
      inFlightIds.forEach((id) => fetchingRef.current.delete(id));
      if (flushTimer !== null) {
        window.clearTimeout(flushTimer);
      }
    };
  }, [products]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.categoryName)
            .filter(Boolean)
        )
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.categoryName === category;

      const matchesSearch =
        !search ||
        [product.name, product.description, product.categoryName]
          .filter(Boolean)
          .some((value) =>
            value.toLowerCase().includes(search)
          );

      return matchesCategory && matchesSearch;
    });
  }, [category, products, query]);

  // A small result set uses wider editorial cards so the section never looks
  // empty after a category selection or search.
  const useFeaturedCards =
    filteredProducts.length > 0 && filteredProducts.length <= 3;
  const isSingleProduct = filteredProducts.length === 1;

  const updateTabArrows = useCallback(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;

    setCanScrollTabsLeft(tabs.scrollLeft > 4);

    setCanScrollTabsRight(
      tabs.scrollLeft + tabs.clientWidth <
      tabs.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateTabArrows);

    window.addEventListener("resize", updateTabArrows);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateTabArrows);
    };
  }, [categories.length, updateTabArrows]);

  const scrollTabs = (direction: "left" | "right") => {
    tabsRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const openProduct = (product: Product) => {
    const productPath = `/physical-gold/product/${product.id}`;
    const productState = {
      categoryId: product.categoryId,
      categoryName: product.categoryName,
    };

    navigate(productPath, {
      state: {
        ...productState,
      },
    });
  };

  return (
    <section
      aria-labelledby="gold-products-title"
      className="relative isolate overflow-x-clip pt-28 text-white min-[480px]:pt-32 sm:pt-28 md:pt-32 lg:pt-[132px]"
      style={{
        background: "transparent",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative mx-auto w-full max-w-8xl sm:px-4 px-2 pb-6 pt-4  sm:pb-10 sm:pt-8  lg:pb-8 lg:pt-6">
        <header className="mx-auto max-w-3xl text-center">
          <h1
            id="gold-products-title"
            className="font-playfair text-[28px] font-black leading-[1.12] min-[380px]:text-3xl sm:text-4xl lg:text-5xl"
          >
            Buy Gold &amp; Silver{" "}
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
              Coins
            </span>
          </h1>
        </header>

        <div className="mt-5 flex w-full flex-col gap-3 sm:mt-7 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              disabled={!canScrollTabsLeft}
              aria-label="Previous categories"
              className={`absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#2B0A59]/95 text-white shadow-lg transition hover:border-[#D4AF37]/60 hover:text-[#F5D36C] sm:grid ${canScrollTabsLeft
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
                }`}
            >
              <ChevronLeft size={17} />
            </button>

            <div
              ref={tabsRef}
              onScroll={updateTabArrows}
              className="flex w-full min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto py-1 scroll-smooth overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`shrink-0 snap-start rounded-lg border px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:text-sm ${category === item
                      ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] text-[#2B0A59] shadow-[0_8px_22px_rgba(212,175,55,.20)]"
                      : "border-white/15 bg-white/[0.06] text-white/75 hover:border-[#D4AF37]/60 hover:text-[#F5D36C]"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollTabs("right")}
              disabled={!canScrollTabsRight}
              aria-label="More categories"
              className={`absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#2B0A59]/95 text-white shadow-lg transition hover:border-[#D4AF37]/60 hover:text-[#F5D36C] sm:grid ${canScrollTabsRight
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
                }`}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <label className="hidden h-12 w-full items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 transition focus-within:border-[#D4AF37]/70 focus-within:ring-2 focus-within:ring-[#D4AF37]/15 sm:flex lg:w-72 lg:shrink-0">
            <Search
              size={16}
              className="shrink-0 text-[#F5D36C]"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jewellery"
              aria-label="Search jewellery"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40 sm:text-sm"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>

        {loading && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] sm:rounded-2xl"
              >
                <div className="aspect-square animate-pulse bg-white/[0.08]" />

                <div className="space-y-2.5 p-2.5 sm:p-4">
                  <div className="h-4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="h-[22px] w-16 animate-pulse rounded-md border border-[#D4AF37]/20 bg-white/[0.08] sm:h-6 sm:w-20" />
                    <div className="h-[22px] w-16 animate-pulse rounded-md border border-[#D4AF37]/20 bg-white/[0.08] sm:h-6 sm:w-20" />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="h-5 w-16 animate-pulse rounded bg-white/15" />
                    <div className="h-[22px] w-[72px] animate-pulse rounded-full border border-[#D4AF37]/20 bg-white/[0.08]" />
                  </div>
                  <div className="h-10 w-full animate-pulse rounded-lg bg-[#D4AF37]/20 sm:rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-400/[0.06] p-6 text-center backdrop-blur-md sm:mt-8 sm:p-8">
            <p className="text-sm font-semibold text-red-200">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] px-5 py-3 text-xs font-black text-[#2B0A59]"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur-md sm:mt-8 sm:p-10">
              <ShoppingBag
                className="mx-auto text-[#F5D36C]"
                size={38}
              />

              <h2 className="mt-4 text-lg font-bold">
                No products found
              </h2>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="mt-3 text-sm font-bold text-[#F5D36C]"
              >
                Clear filters
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="mt-6 w-full sm:mt-8">
              <div
                className={
                  isSingleProduct
                    ? "mx-auto grid max-w-3xl grid-cols-1"
                    : useFeaturedCards
                      ? "grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4 md:grid-cols-2 md:gap-5"
                      : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5"
                }
              >
                {filteredProducts.map((product) => {
                  const activeVariant = variantCache[product.id];
                  const displayPrice =
                    activeVariant?.price != null && Number(activeVariant.price) > 0
                      ? Number(activeVariant.price)
                      : product.price;
                  const displayMrp =
                    activeVariant?.mrp != null && Number(activeVariant.mrp) > 0
                      ? Number(activeVariant.mrp)
                      : product.mrp;
                  const displayPurity =
                    (activeVariant?.purity != null
                      ? String(activeVariant.purity).trim()
                      : "") || product.purity;
                  const displayWeight =
                    activeVariant?.weight != null && Number(activeVariant.weight) > 0
                      ? Number(activeVariant.weight)
                      : product.weight;
                  const hasMrpDiscount =
                    displayMrp != null &&
                    displayMrp > 0 &&
                    displayPrice > 0 &&
                    displayMrp > displayPrice;
                  const mrpDiscountPct = hasMrpDiscount
                    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
                    : 0;
                  const isVariantPending = !product.variantId && !variantSettled[product.id];
                  const isBreakupPending = !breakupSettled[product.id];

                  return (
                  <article
                    key={product.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openProduct(product)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        openProduct(product);
                      }
                    }}
                    className={`
                        group
                        flex
                        flex-col
                        w-full
                        min-w-0
                        cursor-pointer
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.06]
                        shadow-[0_8px_22px_rgba(8,2,24,.18)]
                        transition
                        duration-300
                        hover:-translate-y-1
                        hover:border-[#D4AF37]/45
                        hover:shadow-[0_14px_34px_rgba(8,2,24,.25)]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#F5D36C]
                        sm:rounded-2xl
                        relative
                        ${hoveredProductId === product.id ? "z-30" : "z-0 hover:z-20"}
                        ${useFeaturedCards
                        ? isSingleProduct
                          ? "sm:flex-row sm:min-h-[230px]"
                          : "sm:flex-row sm:min-h-[250px]"
                        : ""
                      }
                      `}
                  >
                    <div
                      className={`relative overflow-hidden bg-gradient-to-br from-[#fffdf8] to-[#f3eadc] ${useFeaturedCards
                          ? isSingleProduct
                            ? "aspect-[16/9] sm:aspect-auto sm:w-[42%] sm:shrink-0 rounded-t-xl sm:rounded-l-2xl sm:rounded-tr-none"
                            : "aspect-square sm:aspect-auto sm:w-[44%] sm:shrink-0 rounded-t-xl sm:rounded-l-2xl sm:rounded-tr-none"
                          : "aspect-square rounded-t-xl sm:rounded-t-2xl"
                        }`}
                    >
                      {hasMrpDiscount && mrpDiscountPct > 0 && (
                        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                          <Tag size={10} />
                          {mrpDiscountPct}% OFF
                        </span>
                      )}
                      <ProductImage product={product} />
                    </div>

                    <div
                      className={`flex flex-1 flex-col p-2.5 sm:p-4 ${useFeaturedCards
                          ? "sm:justify-center sm:p-5 lg:p-6"
                          : ""
                        }`}
                    >
                      <h2
                        className={`font-playfair font-bold text-white ${useFeaturedCards
                            ? "line-clamp-2 min-h-9 text-xs leading-[1.15rem] sm:min-h-0 sm:text-xl sm:leading-7"
                            : "line-clamp-2 min-h-9 text-xs leading-[1.15rem] sm:min-h-10 sm:text-base sm:leading-5"
                          }`}
                      >
                        {product.name}
                      </h2>

                      {useFeaturedCards && product.description && (
                        <p className="mt-2 hidden line-clamp-3 text-sm leading-6 text-white/65 sm:block">
                          {product.description}
                        </p>
                      )}

                      {(displayPurity || (displayWeight != null && displayWeight > 0)) ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5">
                          {displayPurity && (
                            <span className="rounded-md border border-[#D4AF37]/30 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-white/80 whitespace-nowrap sm:text-[11px]">
                              Purity: <span className="text-[#F5D36C]">{displayPurity}</span>
                            </span>
                          )}
                          {displayWeight != null && displayWeight > 0 && (
                            <span className="rounded-md border border-[#D4AF37]/30 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-white/80 whitespace-nowrap sm:text-[11px]">
                              Weight: <span className="text-[#F5D36C]">{formatWeight(displayWeight)}g</span>
                            </span>
                          )}
                        </div>
                      ) : isVariantPending ? (
                        <div
                          aria-hidden="true"
                          className="mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5"
                        >
                          <span className="h-[22px] w-16 animate-pulse rounded-md border border-[#D4AF37]/20 bg-white/[0.08] sm:h-6 sm:w-20" />
                          <span className="h-[22px] w-16 animate-pulse rounded-md border border-[#D4AF37]/20 bg-white/[0.08] sm:h-6 sm:w-20" />
                        </div>
                      ) : null}

                      <div className="relative mt-2 sm:mt-2.5 flex items-center justify-between gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-baseline gap-1.5">
                          {isVariantPending && displayPrice <= 0 ? (
                            <span
                              aria-hidden="true"
                              className="h-5 w-16 animate-pulse rounded bg-white/15 sm:h-6 sm:w-20"
                            />
                          ) : (
                            <p
                              className={`font-black text-[#F5D36C] whitespace-nowrap ${useFeaturedCards
                                  ? "text-sm sm:text-xl"
                                  : "text-sm sm:text-lg"
                                }`}
                            >
                              {currency.format(displayPrice)}
                            </p>
                          )}

                          {hasMrpDiscount && displayMrp != null && (
                            <span className="text-[11px] font-medium text-white/50 line-through whitespace-nowrap sm:text-xs">
                              {currency.format(displayMrp)}
                            </span>
                          )}
                        </div>

                        {/* Price Breakup Hover Trigger & Popover - Only displayed if discountPercentage > 0 or discountAmount > 0 */}
                        {hasOfferDiscount(breakupCache[product.id]) ? (
                          <div
                            className="relative shrink-0 ml-auto"
                            onMouseEnter={() => handleMouseEnterBreakup(product)}
                            onMouseLeave={() => setHoveredProductId(null)}
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (hoveredProductId === product.id) {
                                  setHoveredProductId(null);
                                } else {
                                  handleMouseEnterBreakup(product);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#F5D36C]/90 hover:text-[#F5D36C] bg-white/[0.08] hover:bg-white/[0.16] border border-[#D4AF37]/35 px-2 py-0.5 rounded-full transition cursor-pointer whitespace-nowrap"
                              title="View Offer"
                            >
                              <Info size={11} className="shrink-0 text-[#F5D36C]" />
                              <span>View Offer</span>
                            </button>

                            {/* Hover / Click Popover Tooltip */}
                            {hoveredProductId === product.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 max-w-[85vw] sm:max-w-none z-50 rounded-xl border border-[#D4AF37]/50 bg-[#1A0B2E]/95 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white transition-all duration-200"
                              >
                                <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <Tag size={12} className="text-[#F5D36C]" />
                                    <span className="text-[12px] font-bold text-[#F5D36C]">View Offer</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHoveredProductId(null);
                                    }}
                                    className="cursor-pointer text-white/50 hover:text-white rounded-full p-0.5"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>

                                {loadingBreakupId === product.id && !breakupCache[product.id] ? (
                                  <div className="flex flex-col items-center justify-center py-3 text-xs text-white/70 gap-1.5">
                                    <Loader2 size={15} className="animate-spin text-[#F5D36C]" />
                                    <span>Fetching breakup...</span>
                                  </div>
                                ) : breakupCache[product.id] ? (
                                  <div className="space-y-1.5 text-[11px]">
                                    <div className="flex justify-between text-white/75">
                                      <span>Base Price:</span>
                                      <span className="font-semibold text-white">₹{Number(breakupCache[product.id].variantPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-white/75">
                                      <span>Making ({breakupCache[product.id].makingPercentage || 0}%):</span>
                                      <span className="font-semibold text-white">₹{Number(breakupCache[product.id].makingAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-white/75">
                                      <span>GST ({breakupCache[product.id].gstPercentage || 0}%):</span>
                                      <span className="font-semibold text-white">₹{Number(breakupCache[product.id].gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {(Number(breakupCache[product.id].discountAmount || 0) > 0 || Number(breakupCache[product.id].discountPercentage || 0) > 0) && (
                                      <div className="flex justify-between text-emerald-400">
                                        <span>Discount {Number(breakupCache[product.id].discountPercentage || 0) > 0 ? `(${breakupCache[product.id].discountPercentage}%)` : ""}:</span>
                                        <span className="font-semibold">-₹{Number(breakupCache[product.id].discountAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t border-white/20 pt-1.5 text-[12px] font-bold text-[#F5D36C]">
                                      <span>Final Amount:</span>
                                      <span>₹{Number(breakupCache[product.id].finalAmount || displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-2 text-[11px] text-white/60 text-center">
                                    Price details unavailable
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : isBreakupPending ? (
                          <span
                            aria-hidden="true"
                            className="ml-auto h-[22px] w-[74px] shrink-0 animate-pulse rounded-full border border-[#D4AF37]/20 bg-white/[0.08] sm:h-6 sm:w-20"
                          />
                        ) : null}
                      </div>

                      <div className={useFeaturedCards ? "mt-3" : "mt-auto pt-2.5 sm:pt-3"}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProduct(product);
                          }}
                          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] px-2 text-[11px] font-black text-[#2B0A59] shadow-[0_7px_18px_rgba(212,175,55,.18)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95 sm:rounded-xl sm:px-3 sm:text-xs ${useFeaturedCards
                              ? "w-full sm:w-fit sm:min-w-32"
                              : "w-full"
                            }`}
                        >
                          Buy Now
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}