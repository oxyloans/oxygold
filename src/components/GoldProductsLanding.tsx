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
import { resolveS3ImageUrl } from "../PhysicalGold/physicalGoldData";
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
}

interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number | null;
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
  maximumFractionDigits: 0,
});

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

  // Price Breakup State
  const [breakupCache, setBreakupCache] = useState<Record<number, GoldSilverRateBreakdown>>({});
  const [loadingBreakupId, setLoadingBreakupId] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  const fetchBreakupForProduct = useCallback(async (productId: number) => {
    if (breakupCache[productId]) return;
    setLoadingBreakupId(productId);
    try {
      const { variants } = await fetchProductVariants(String(productId));
      const targetVariantId = variants?.[0]?.id || productId;
      const data = await fetchGoldSilverRateBreakdown(targetVariantId);
      if (data) {
        setBreakupCache((prev) => ({ ...prev, [productId]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch price breakup for product:", productId, err);
    } finally {
      setLoadingBreakupId(null);
    }
  }, [breakupCache]);

  const handleMouseEnterBreakup = useCallback((productId: number) => {
    setHoveredProductId(productId);
    fetchBreakupForProduct(productId);
  }, [fetchBreakupForProduct]);

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
              .map<Product>((product) => ({
                id: product.id,
                name: product.name,
                description: product.description?.trim() ?? "",
                categoryId: parentCategory.id,
                categoryName: parentCategory.name,
                frontViewurl: resolveS3ImageUrl(product.image) || null,
                status: product.status ?? "ACTIVE",
                price: Number(product.price) || 0,
              }))
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

      <div className="relative mx-auto w-full max-w-7xl sm:px-4 px-2 pb-6 pt-4  sm:pb-10 sm:pt-8  lg:pb-8 lg:pt-6">
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
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] sm:rounded-2xl"
              >
                <div className="aspect-square animate-pulse bg-white/[0.08]" />

                <div className="space-y-3 p-4">
                  <div className="h-4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
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
                {filteredProducts.map((product) => (
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
                          ? "sm:flex sm:min-h-[230px]"
                          : "sm:flex sm:min-h-[250px]"
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
                      <ProductImage product={product} />
                    </div>

                    <div
                      className={`p-2.5 sm:p-4 ${useFeaturedCards
                          ? "sm:flex sm:flex-1 sm:flex-col sm:justify-center sm:p-5 lg:p-6"
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

                      <div className="relative mt-1.5 sm:mt-2.5 flex items-center justify-between gap-1 flex-wrap">
                        <p
                          className={`font-black text-[#F5D36C] ${useFeaturedCards
                              ? "text-sm sm:text-xl"
                              : "text-sm sm:text-lg"
                            }`}
                        >
                          {currency.format(product.price)}
                        </p>

                        {/* Price Breakup Hover Trigger & Popover */}
                        <div
                          className="relative"
                          onMouseEnter={() => handleMouseEnterBreakup(product.id)}
                          onMouseLeave={() => setHoveredProductId(null)}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (hoveredProductId === product.id) {
                                setHoveredProductId(null);
                              } else {
                                handleMouseEnterBreakup(product.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#F5D36C]/90 hover:text-[#F5D36C] bg-white/[0.08] hover:bg-white/[0.16] border border-[#D4AF37]/35 px-2 py-0.5 rounded-full transition cursor-pointer"
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
                                  {typeof breakupCache[product.id].discountAmount === 'number' && breakupCache[product.id].discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                      <span>Discount ({breakupCache[product.id].discountPercentage}%):</span>
                                      <span className="font-semibold">-₹{Number(breakupCache[product.id].discountAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-t border-white/20 pt-1.5 text-[12px] font-bold text-[#F5D36C]">
                                    <span>Final Amount:</span>
                                    <span>₹{Number(breakupCache[product.id].finalAmount || product.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openProduct(product);
                        }}
                        className={`mt-2.5 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] px-2 text-[11px] font-black text-[#2B0A59] shadow-[0_7px_18px_rgba(212,175,55,.18)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95 sm:mt-3 sm:rounded-xl sm:px-3 sm:text-xs ${useFeaturedCards
                            ? "w-full sm:w-fit sm:min-w-32"
                            : "w-full"
                          }`}
                      >
                        Buy Now
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}