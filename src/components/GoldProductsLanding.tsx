
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  productType: string | null;
  frontViewurl: string | null;
  leftViewUrl: string | null;
  rightViewUrl: string | null;
  backViewUrl: string | null;
  status: string;
  gstPercentage: number;
  makingPercentage: number;
  price: number;
  priceRange: string;
  averageRating: number | null;
  totalRatings: number | null;
}

const API_URL =
  "https://meta.oxyloans.com/api/oxygold-api/products/getAllProduct";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const AUTH_STORAGE_KEYS = [
  "userData",
  "authData",
  "auth",
  "loginResponse",
  "accessToken",
  "token",
] as const;

function findAccessToken(value: unknown): string | null {
  if (typeof value === "string") {
    return value.split(".").length === 3 ? value : null;
  }

  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (typeof record.accessToken === "string") {
    return record.accessToken;
  }

  return findAccessToken(record.data);
}

function isTokenValid(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(window.atob(normalized)) as { exp?: number };

    // Keep a small safety margin so an almost-expired session goes to login.
    return !payload.exp || payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

function hasActiveSession(): boolean {
  for (const key of AUTH_STORAGE_KEYS) {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) continue;

    let parsedValue: unknown = storedValue;

    try {
      parsedValue = JSON.parse(storedValue);
    } catch {
      // Some applications store the JWT directly instead of JSON.
    }

    const accessToken = findAccessToken(parsedValue);

    if (accessToken && isTokenValid(accessToken)) {
      return true;
    }
  }

  return false;
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
      className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105 sm:p-6"
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

        setProducts(
          (data as Product[]).filter(
            (product) => product.status === "ACTIVE"
          )
        );
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

    if (!hasActiveSession()) {
      // Router state handles the normal flow. Session storage preserves the
      // destination if the login page refreshes or the user uses an OTP flow.
      window.sessionStorage.setItem("redirectAfterLogin", productPath);
      window.sessionStorage.setItem(
        "redirectAfterLoginState",
        JSON.stringify(productState)
      );

      navigate("/login", {
        state: {
          from: productPath,
          redirectTo: productPath,
          productState,
        },
      });
      return;
    }

    navigate(productPath, {
      state: {
        ...productState,
      },
    });
  };

  return (
    <section
      aria-labelledby="gold-products-title"
      className="relative isolate overflow-x-clip pt-20 text-white sm:pt-24 lg:pt-[106px]"
      style={{
        background: "transparent",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8 lg:pb-12 lg:pt-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1
            id="gold-products-title"
            className="mt-3 font-playfair text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"
          >
            Buy Gold &amp; Silver{" "}
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
              Products
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
            Shop gold jewellery, gold coins, and 999 pure silver coins and bars
            from OXYGOLD.AI.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              disabled={!canScrollTabsLeft}
              aria-label="Previous categories"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-[#D4AF37]/60 hover:text-[#F5D36C] ${
                canScrollTabsLeft
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
            >
              <ChevronLeft size={17} />
            </button>

            <div
              ref={tabsRef}
              onScroll={updateTabArrows}
              className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`shrink-0 snap-start rounded-lg border px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:text-sm ${
                    category === item
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
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-[#D4AF37]/60 hover:text-[#F5D36C] ${
                canScrollTabsRight
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <label className="flex h-12 w-full items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 transition focus-within:border-[#D4AF37]/70 focus-within:ring-2 focus-within:ring-[#D4AF37]/15 lg:w-72">
            <Search
              size={16}
              className="shrink-0 text-[#F5D36C]"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jewellery"
              aria-label="Search jewellery"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:gap-5 sm:overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:w-[46%] lg:w-[calc(25%_-_15px)] xl:w-[calc(20%_-_16px)] 2xl:w-[calc(16.666%_-_17px)]"
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
          <div className="mt-8 rounded-2xl border border-red-300/20 bg-red-400/[0.06] p-8 text-center backdrop-blur-md">
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
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center backdrop-blur-md">
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
            <div className="mt-8">
                <div
                  className={
                    isSingleProduct
                      ? "mx-auto grid max-w-3xl grid-cols-1"
                      : useFeaturedCards
                      ? "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
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
                        overflow-hidden
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
                        ${
                          useFeaturedCards
                            ? isSingleProduct
                              ? "sm:flex sm:min-h-[230px]"
                              : "sm:flex sm:min-h-[250px] md:last:odd:col-span-2"
                            : ""
                        }
                      `}
                    >
                      <div
                        className={`relative overflow-hidden bg-gradient-to-br from-[#fffdf8] to-[#f3eadc] ${
                          useFeaturedCards
                            ? isSingleProduct
                              ? "aspect-[16/9] sm:aspect-auto sm:w-[42%] sm:shrink-0"
                              : "aspect-[16/10] sm:aspect-auto sm:w-[44%] sm:shrink-0"
                            : "aspect-square"
                        }`}
                      >
                        <ProductImage product={product} />
                      </div>

                      <div
                        className={`p-2.5 sm:p-4 ${
                          useFeaturedCards
                            ? "sm:flex sm:flex-1 sm:flex-col sm:justify-center sm:p-5 lg:p-6"
                            : ""
                        }`}
                      >
                        <h2
                          className={`font-playfair font-bold text-white ${
                            useFeaturedCards
                              ? "text-lg leading-6 sm:text-xl sm:leading-7"
                              : "line-clamp-2 min-h-9 text-xs leading-[1.15rem] sm:min-h-10 sm:text-base sm:leading-5"
                          }`}
                        >
                          {product.name}
                        </h2>

                        {useFeaturedCards && product.description && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/65">
                            {product.description}
                          </p>
                        )}

                        <p
                          className={`font-black text-[#F5D36C] ${
                            useFeaturedCards
                              ? "mt-3 text-xl"
                              : "mt-1.5 text-sm sm:mt-2 sm:text-lg"
                          }`}
                        >
                          {currency.format(product.price)}
                        </p>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProduct(product);
                          }}
                          className={`mt-2.5 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] px-2 text-[11px] font-black text-[#2B0A59] shadow-[0_7px_18px_rgba(212,175,55,.18)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95 sm:mt-3 sm:rounded-xl sm:px-3 sm:text-xs ${
                            useFeaturedCards
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
