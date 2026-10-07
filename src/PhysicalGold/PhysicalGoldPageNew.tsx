import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Package, 
  Search, 
  ShoppingCart, 
  SlidersHorizontal, 
  Sparkles, 
  Tag, 
  X, 
  Zap 
} from "lucide-react";
import { FaBagShopping } from "react-icons/fa6";
import { useCart, isPhysicalGoldUserLoggedIn, ProfileIncompleteError } from "./CartContext";
import FilterSidebar from "./components/FilterSidebar";
import CategoryGrid from "./components/CategoryGrid";

import LoadingSpinner from "./components/LoadingSpinner";

import Pagination from "./components/Pagination";
import { Category, SubCategory, PhysicalGoldProduct, ProductVariant, resolveS3ImageUrl, isDiscountTimeActive } from "./physicalGoldData";
import {
  fetchProductVariants,
  fetchSubCategories,
  searchProducts,
  fetchProductImageURLs,
  fetchGoldSilverRateBreakdown,
  GoldSilverRateBreakdown,
} from "./physicalGoldService";

import "./styles.css";


/** Collect supported image fields without discarding other usable views. */
function collectImageURLs(value: unknown): string[] {
  const urls: string[] = [];
  const visited = new Set<object>();
  const visit = (item: unknown, depth = 0) => {
    if (!item || depth > 5) return;
    if (typeof item === "string") {
      const url = resolveS3ImageUrl(item);
      if (url && /^(https?:\/\/|blob:|data:image\/)/i.test(url)) urls.push(url);
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
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const [options, setOptions] = useState<ProductVariant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [cartProduct, setCartProduct] = useState<PhysicalGoldProduct>(product);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [offersCache, setOffersCache] = useState<Record<string, GoldSilverRateBreakdown>>({});
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [showOfferPopover, setShowOfferPopover] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const selected = options.find(v => String(v.id) === selectedId);
  const cartItem = selected
    ? cartItems.find(item => item.variant.id === selected.id)
    : undefined;
  const cartQuantity = cartItem?.quantity ?? 0;
  const inCart = cartQuantity > 0;

  const handleFetchOffer = async (variantId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let vId = variantId || selected?.id;
    if (!vId && options.length > 0) vId = options[0].id;
    
    setShowOfferPopover(true);
    if (!vId) {
      try {
        setLoadingOffer(true);
        const res = await fetchProductVariants(product.id);
        const avail = res.variants.filter(v => v.stockQuantity > 0);
        if (avail.length > 0) {
          vId = avail[0].id;
          setSelectedId(String(vId));
        }
      } catch { /* ignore */ }
    }
    if (!vId) return;

    const idStr = String(vId);
    if (offersCache[idStr]) return;

    setLoadingOffer(true);
    setOfferError(null);
    try {
      const data = await fetchGoldSilverRateBreakdown(idStr, 1);
      setOffersCache(prev => ({ ...prev, [idStr]: data }));
    } catch (err: any) {
      setOfferError(err.message || "Failed to load price breakup");
    } finally {
      setLoadingOffer(false);
    }
  };

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

  const handleBuyNow = async () => {
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
      }
      if (!variant) return;
      await addToCart(currentProduct, variant);
      navigate("/physical-gold/cart");
    } catch (error) {
      if (error instanceof ProfileIncompleteError) {
        const returnTo = window.location.pathname + window.location.search;
        navigate(`/physical-gold/profile?tab=info&returnTo=${encodeURIComponent(returnTo)}`);
      } else {
        setMessage(error instanceof Error ? error.message : "Could not proceed to checkout.");
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  // Silently pre-fetch variants on mount and prefetch breakup for default variant
  useEffect(() => {
    let cancelled = false;
    fetchProductVariants(product.id).then(async response => {
      if (cancelled) return;
      const available = response.variants.filter(v => v.stockQuantity > 0);
      if (!available.length) { setUnavailable(true); return; }
      setCartProduct(response.product || product);
      setOptions(available);
      const firstId = String(available[0].id);
      setSelectedId(firstId);

      // Pre-fetch price breakup for default variant to determine if offer/discount exists
      try {
        const offerData = await fetchGoldSilverRateBreakdown(firstId);
        if (!cancelled && offerData) {
          setOffersCache(prev => ({ ...prev, [firstId]: offerData }));
        }
      } catch {
        /* silently ignore */
      }
    }).catch(() => { /* silently ignore */ });
    return () => { cancelled = true; };
  }, [product.id]);

  // Base Price Discount & MRP logic
  const targetProd = cartProduct || product;
  const baseDiscountType = targetProd?.basePriceDiscountType || product?.basePriceDiscountType;
  const baseDiscountValue = Number(targetProd?.basePriceDiscountValue ?? product?.basePriceDiscountValue ?? 0);
  const baseDiscountStart = selected?.basePriceDiscountStart ?? targetProd?.basePriceDiscountStart ?? product?.basePriceDiscountStart;
  const baseDiscountEnd = selected?.basePriceDiscountEnd ?? targetProd?.basePriceDiscountEnd ?? product?.basePriceDiscountEnd;

  const isPromoActive = isDiscountTimeActive(baseDiscountStart, baseDiscountEnd);

  const mrpNum = (selected as any)?.mrp ?? null;
  const originalPriceNum = selected ? selected.price : (targetProd?.price ?? product.price ?? null);

  let rawDiscountedPrice: number | null = selected?.discountedPrice != null
    ? selected.discountedPrice
    : targetProd?.discountedPrice != null
    ? targetProd.discountedPrice
    : product.discountedPrice != null
    ? product.discountedPrice
    : null;

  if (baseDiscountType && baseDiscountValue > 0 && originalPriceNum != null) {
    if (baseDiscountType === "FIXED") {
      rawDiscountedPrice = originalPriceNum - baseDiscountValue;
    } else if (baseDiscountType === "PERCENTAGE") {
      rawDiscountedPrice = originalPriceNum - (originalPriceNum * baseDiscountValue) / 100;
    }
  }

  const calculatedDiscountedPrice = isPromoActive ? rawDiscountedPrice : null;

  // Determine if Base Price Discount is active
  const hasDiscountedPrice = isPromoActive && calculatedDiscountedPrice != null && originalPriceNum != null && calculatedDiscountedPrice < originalPriceNum;
  const hasBaseDiscount = Boolean(
    isPromoActive &&
    (hasDiscountedPrice ||
      (baseDiscountType &&
        (baseDiscountType === "FIXED" || baseDiscountType === "PERCENTAGE") &&
        baseDiscountValue > 0 &&
        originalPriceNum != null))
  );

  let discountTagLabel = "";
  if (hasBaseDiscount && hasDiscountedPrice && calculatedDiscountedPrice != null && originalPriceNum != null) {
    const diff = Math.round(originalPriceNum - calculatedDiscountedPrice);
    if (baseDiscountType === "PERCENTAGE" && baseDiscountValue > 0) {
      discountTagLabel = `${baseDiscountValue}% OFF`;
    } else if (baseDiscountType === "FIXED" && baseDiscountValue > 0) {
      discountTagLabel = `₹${baseDiscountValue} OFF`;
    } else {
      const pct = Math.round((diff / originalPriceNum) * 100);
      discountTagLabel = pct > 0 ? `${pct}% OFF` : `₹${diff} OFF`;
    }
  } else if (hasBaseDiscount) {
    if (baseDiscountType === "FIXED") {
      discountTagLabel = `₹${baseDiscountValue} OFF`;
    } else if (baseDiscountType === "PERCENTAGE") {
      discountTagLabel = `${baseDiscountValue}% OFF`;
    }
  }

  // MRP discount calculation (fallback if base discount is not active)
  const hasMrpDiscount = !hasBaseDiscount && mrpNum != null && originalPriceNum != null && mrpNum > originalPriceNum;
  const mrpDiscountPct = hasMrpDiscount ? Math.round(((mrpNum - originalPriceNum) / mrpNum) * 100) : 0;

  // Main displayed price:
  const mainPriceValue = calculatedDiscountedPrice != null && (hasBaseDiscount || hasDiscountedPrice) ? calculatedDiscountedPrice : originalPriceNum;

  // Top left badge text:
  const topLeftBadgeText = (hasBaseDiscount || hasDiscountedPrice) ? discountTagLabel : (hasMrpDiscount && mrpDiscountPct > 0 ? `${mrpDiscountPct}% OFF` : null);

  const activeOffer = selectedId ? offersCache[selectedId] : null;
  const hasOfferDiscount = activeOffer != null && (
    Number(activeOffer.discountPercentage || 0) > 0 ||
    Number(activeOffer.discountAmount || 0) > 0
  );

  return (
    <article 
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white shadow-sm transition-all duration-300 hover:border-[#C29B27]/60 hover:shadow-md cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#FDFAF4]"
      >
        <div className="h-full w-full p-2.5 transition-transform duration-500 motion-safe:group-hover:scale-105">
          <ProductImage
            urls={collectImageURLs(product)}
            alt={product.productName}
            className="object-contain"
          />
        </div>

        {/* Discount - Top Left */}
        {topLeftBadgeText && (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <Tag size={9} />
            {topLeftBadgeText}
          </span>
        )}

        {/* Category - Top Right - Hidden on mobile */}
        {product.categoryName && (
          <span className="absolute right-2 top-2 z-10 hidden sm:inline-block max-w-[55%] truncate rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
            {product.categoryName}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#1A1A1A] transition-colors group-hover:text-[#C29B27]">
            {product.productName}
          </h3>
        </div>

        {/* Price & View Offer row */}
        <div className="flex flex-wrap items-center justify-between gap-1 w-full min-w-0">
          <div className="flex flex-wrap items-baseline gap-1 min-w-0">
            <span className="text-[13px] sm:text-[15px] font-bold text-[#C29B27] whitespace-nowrap">
              {mainPriceValue != null ? `₹${mainPriceValue.toLocaleString("en-IN")}` : displayPrice(product.priceRange)}
            </span>
            {hasBaseDiscount && originalPriceNum != null && (
              <span className="text-[10px] sm:text-[11px] text-[#8A8A8A] line-through whitespace-nowrap">₹{originalPriceNum.toLocaleString("en-IN")}</span>
            )}
            {!hasBaseDiscount && hasMrpDiscount && mrpNum != null && (
              <span className="text-[10px] sm:text-[11px] text-[#8A8A8A] line-through whitespace-nowrap">₹{mrpNum.toLocaleString("en-IN")}</span>
            )}
          </div>

          {/* Offer & Discount Badges Row - Right End */}
          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            {hasBaseDiscount && discountTagLabel && (
              <span className="inline-flex h-5 items-center justify-center gap-0.5 rounded-md bg-emerald-50 px-1.5 text-[9px] sm:text-[10px] font-bold leading-none text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
                <Tag size={9} className="text-emerald-600 shrink-0" />
                <span>{discountTagLabel}</span>
              </span>
            )}

            {/* View Offer Hover Container */}
            {hasOfferDiscount && (
              <div
                className="relative inline-flex items-center h-5"
                onMouseEnter={() => {
                  handleFetchOffer(selected?.id ? String(selected.id) : undefined);
                  setShowOfferPopover(true);
                }}
                onMouseLeave={() => {
                  setShowOfferPopover(false);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOfferPopover(prev => !prev);
                    if (!showOfferPopover) {
                      handleFetchOffer(selected?.id ? String(selected.id) : undefined, e);
                    }
                  }}
                  className="cursor-pointer inline-flex h-5 items-center justify-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] sm:text-[10px] font-semibold leading-none text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs whitespace-nowrap"
                  title="Hover to view Price Breakup & GST Offer"
                >
                  <span>View Offer</span>
                  <Tag size={9} className="text-emerald-600 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="flex flex-wrap gap-1">
            <span className="rounded-md border border-[#E8E2D8] bg-[#F9F7F4] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B6B6B]">{selected.purity}</span>
            <span className="rounded-md border border-[#E8E2D8] bg-[#F9F7F4] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B6B6B]">{selected.weight}g</span>
          </div>
        )}

        {options.length > 1 && (
          <select
            value={selectedId}
            disabled={busy}
            onClick={(e) => e.stopPropagation()}
            onChange={e => { 
              e.stopPropagation();
              const newId = e.target.value;
              setSelectedId(newId); 
              setMessage(""); 
              if (!offersCache[newId]) {
                fetchGoldSilverRateBreakdown(newId)
                  .then(data => {
                    if (data) setOffersCache(prev => ({ ...prev, [newId]: data }));
                  })
                  .catch(() => {});
              }
              if (showOfferPopover) handleFetchOffer(newId);
            }}
            className="h-8 w-full rounded-lg border border-[#E8E2D8] bg-white px-2 text-[11px] text-[#1A1A1A] focus:border-[#C29B27] focus:outline-none cursor-pointer"
          >
            {options.map(v => (
              <option key={v.id} value={String(v.id)}>
                {v.purity} · {v.weight}g{v.size ? ` · ${v.size}` : ""} · ₹{v.price.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        )}

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="mt-auto flex flex-col gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          {inCart && cartItem ? (
            <div className="flex h-9 w-full items-center justify-between rounded-xl border border-[#D9C89A] bg-[#F8F1E1] px-2">
              <button
                type="button"
                onClick={async (event) => {
                  event.stopPropagation();
                  await decrementQuantity(cartItem.variant.id, cartItem.cartId);
                }}
                aria-label="Decrease quantity"
                className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8B6914] text-lg font-bold leading-none text-white transition hover:bg-[#7A5C10] active:scale-95"
              >
                −
              </button>

              <span className="min-w-[2rem] text-center text-[14px] font-bold text-[#1A1A1A]">
                {cartQuantity}
              </span>

              <button
                type="button"
                onClick={async (event) => {
                  event.stopPropagation();
                  await incrementQuantity(cartItem.variant.id);
                }}
                aria-label="Increase quantity"
                className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8B6914] text-lg font-bold leading-none text-white transition hover:bg-[#7A5C10] active:scale-95"
              >
                +
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <button
                type="button"
                disabled={busy || unavailable}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
                className="cursor-pointer flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-[#C29B27] bg-white text-[11px] font-semibold text-[#8B6914] shadow-2xs transition-all hover:bg-amber-50 hover:border-[#8B6914] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={13} className="shrink-0" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={busy || unavailable}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                className="cursor-pointer flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#C29B27] to-[#8B6914] text-[11px] font-semibold text-white shadow-sm transition-all hover:from-[#B08B20] hover:to-[#78590E] hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <FaBagShopping className="text-md" />
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div  onClick={onClick}
            className="h-7 text-[13px] font-medium text-[#8A8A8A] group-hover:text-[#C29B27] transition-colors flex items-center justify-center gap-2"
          >
            <span>View Details</span>
            <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* View Offer Popover */}
        {hasOfferDiscount && showOfferPopover && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowOfferPopover(true)}
            onMouseLeave={() => setShowOfferPopover(false)}
            className="absolute inset-x-2 bottom-2 z-30 rounded-xl border border-amber-300 bg-white/98 backdrop-blur-md p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <Tag size={11} />
                </div>
                <span className="text-[12px] font-bold text-[#1A1A1A]">Price Breakup & Offer</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOfferPopover(false);
                }}
                className="cursor-pointer rounded-full p-1 text-[#8A8A8A] hover:bg-stone-100 hover:text-[#1A1A1A]"
              >
                <X size={13} />
              </button>
            </div>

            {loadingOffer ? (
              <div className="flex flex-col items-center justify-center py-4 text-xs text-[#8A8A8A] gap-1.5">
                <Loader2 size={16} className="animate-spin text-[#C29B27]" />
                <span>Fetching live price breakup...</span>
              </div>
            ) : offerError ? (
              <div className="py-2 text-[11px] text-rose-600 text-center">
                {offerError}
              </div>
            ) : activeOffer ? (
              <div className="space-y-1.5 text-[11px]">
                {/* 1. Base Price */}
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Base Price:</span>
                  <span className="font-medium text-[#1A1A1A]">₹{Number(activeOffer.variantPrice || 0).toLocaleString("en-IN")}</span>
                </div>

                {/* 2. GST */}
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>GST ({activeOffer.gstPercentage}%):</span>
                  <span className="font-medium text-[#1A1A1A]">₹{Number(activeOffer.gstAmount || 0).toFixed(2)}</span>
                </div>

                {/* 3. Making Charges (if any) */}
                {/* {Number(activeOffer.makingAmount || 0) > 0 && ( */}
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Making Charges ({activeOffer.makingPercentage}%):</span>
                  <span className="font-medium text-[#1A1A1A]">₹{Number(activeOffer.makingAmount || 0).toFixed(2)}</span>
                </div>
                {/* )} */}

                {/* 4. Total Amount */}
                <div className="flex justify-between text-[#6B6B6B] border-t border-dashed border-[#E8E2D8] pt-1">
                  <span className="font-semibold text-[#1A1A1A]">Total Amount:</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    ₹{Number(activeOffer.totalAmount ?? (Number(activeOffer.variantPrice || 0) + Number(activeOffer.gstAmount || 0) + Number(activeOffer.makingAmount || 0))).toFixed(2)}
                  </span>
                </div>

                {/* 5. Discount / GST Waiver */}
                {Number(activeOffer.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    <span>GST Waiver Discount:</span>
                    <span>-₹{Number(activeOffer.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}

                {/* 6. Final Amount */}
                <div className="border-t border-[#F0EBE1] pt-1 flex justify-between items-center text-[12px] font-bold text-[#8B6914]">
                  <span>Final Amount:</span>
                  <span>₹{Number(activeOffer.finalAmount || 0).toLocaleString("en-IN")}</span>
                </div>

                <p className="text-[9.5px] text-emerald-700 bg-emerald-50/70 rounded px-1.5 py-0.5 text-center font-medium">
                  ✨ OxyGold.ai 100% GST Paid on your behalf!
                </p>
              </div>
            ) : (
              <div className="py-3 text-[11px] text-[#8A8A8A] text-center">
                Select an option to view breakup
              </div>
            )}
          </div>
        )}
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
    if (categoryId === "__all__" || categoryId === "all") {
      navigate("/physical-gold");
    } else {
      navigate(`/physical-gold/category/${encodeURIComponent(categoryId)}`);
    }
  }, [navigate]);

  const handleSubCategoryNavigation = useCallback((subCategoryId: string) => {
    const isAll = !selectedCategoryId || selectedCategoryId === "__all__" || selectedCategoryId === "all";
    if (isAll) {
      navigate(`/physical-gold/category/__all__/subcategory/${encodeURIComponent(subCategoryId)}`);
    } else {
      navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}/subcategory/${encodeURIComponent(subCategoryId)}`);
    }
  }, [navigate, selectedCategoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    const isAll = !routeCategoryId || routeCategoryId === "__all__" || routeCategoryId === "all";
    const currentCatId = isAll ? "__all__" : (routeCategoryId || "");

    setSelectedCategoryId(currentCatId);
    setSelectedSubCategoryId("");
    setShowProducts(true);
    setLayoutSelectedCategoryId(currentCatId);
    setProducts([]);
    setCategoriesReady(false);
    setSubCategories([]);
    setFacets(null);
    setMobileFilterOpen(false);
    setTotalPages(0);
    setTotalElements(0);
    clearFilters();

    if (!categories.length) return;

    if (isAll) {
      Promise.all(categories.map(c => fetchSubCategories(c.id).catch(() => [])))
        .then(results => {
          if (cancelled) return;
          const allSubs = results.flat();
          const uniqueSubs = Array.from(new Map(allSubs.map(s => [s.id, s])).values());
          setSubCategories(uniqueSubs);
          if (routeSubCategoryId && !uniqueSubs.some(sub => sub.id === routeSubCategoryId)) {
            navigate("/physical-gold", { replace: true });
            return;
          }
          setSelectedSubCategoryId(routeSubCategoryId || "");
          setCategoriesReady(true);
        })
        .catch(() => {
          if (!cancelled) setLoadError("Could not load collection. Please try again.");
        });
      return () => { cancelled = true; };
    }

    if (!categories.some(c => c.id === routeCategoryId)) {
      navigate("/physical-gold", { replace: true });
      return;
    }

    fetchSubCategories(routeCategoryId).then(data => {
      if (cancelled) return;
      setSubCategories(data);
      if (routeSubCategoryId && !data.some(sub => sub.id === routeSubCategoryId)) {
        navigate(`/physical-gold/category/${encodeURIComponent(routeCategoryId)}`, { replace: true });
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
    const isAll = !routeCategoryId || routeCategoryId === "__all__" || routeCategoryId === "all";
    const expectedCatId = isAll ? "__all__" : routeCategoryId;
    if (!categoriesReady || !selectedCategoryId || selectedCategoryId !== expectedCatId || selectedSubCategoryId !== (routeSubCategoryId || "")) return;
    let cancelled = false;
    setLoadingProds(true);
    setLoadError("");
    const load = async () => {
      try {
        const query = async (categoryId: string, page: number) => {
          const response = await searchProducts({
            ...filters, categoryId: Number(categoryId), productType: "PHYSICAL",
            q: filters.q || undefined, page, pageSize: filters.pageSize
          });
          return response.data || response;
        };
        let data: any;
        if (selectedSubCategoryId || (!subCategories.length && !isAll)) {
          data = await query(selectedSubCategoryId || selectedCategoryId, filters.page);
        } else {
          const mergedFacets = {byPurity: {} as Record<string, number>, bySize: {} as Record<string, number>};
          const groups = await Promise.all(subCategories.map(async sub => {
            try {
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
            } catch {
              return [];
            }
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
          let imageCandidates = collectImageURLs(p);
          try {
            const images = await fetchProductImageURLs(String(p.id));
            imageCandidates = Array.from(new Set([...imageCandidates, ...collectImageURLs(images)]));
          } catch { /* Existing image URLs remain usable if this request fails. */ }
          return {
            ...p,
            id: String(p.id),
            productName: p.name || p.productName || "Product",
            priceRange: p.priceRange || (typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : "Price on request"),
            discountedPriceRange: p.discountedPriceRange,
            subCategoryId: String(p.categoryId || selectedSubCategoryId),
            categoryName: p.categoryName || categories.find(c => c.id === String(p.categoryId || selectedCategoryId))?.name || "",
            imageUrl: imageCandidates[0] || "",
            imageCandidates,
            basePriceDiscountType: p.basePriceDiscountType,
            basePriceDiscountValue: p.basePriceDiscountValue,
            basePriceDiscountStart: p.basePriceDiscountStart,
            basePriceDiscountEnd: p.basePriceDiscountEnd,
            discountedPrice: p.discountedPrice,
            price: p.price,
          };
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
    setSelectedCategoryId("__all__");
    setLayoutSelectedCategoryId("__all__");
    setSearchInput("");
    clearFilters();
    window.scrollTo(0, 0);
  }, [navigate, setLayoutSelectedCategoryId]);

  if (categories.length === 0) {
    return <LoadingSpinner fullScreen message="Loading Collection..." />;
  }

  const isAll = !selectedCategoryId || selectedCategoryId === "__all__" || selectedCategoryId === "all";
  const categoryName = isAll ? "All Jewellery" : (categories.find(c => c.id === selectedCategoryId)?.name || "Collection");
  const subCategoryName = subCategories.find(c => c.id === selectedSubCategoryId)?.name || "Products";
  const activeCount = [filters.purity, filters.size, filters.minPrice, filters.maxPrice,
    filters.minWeight, filters.maxWeight, filters.inStock].filter(v => v !== undefined && v !== "").length;

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 md:pt-32 lg:px-6 lg:pt-36">
        {!showProducts ? (
          <CategoryGrid categories={categories} onCategoryClick={handleCategoryClick} selectedCategoryId={selectedCategoryId} />
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-[#8A8A8A]">
              <button onClick={handleLogoClick} className="min-h-8 font-medium hover:text-[#C29B27] transition-colors">Home</button>
              <span className="text-[#D1C7BB]">›</span>
              <span className="font-semibold text-[#1A1A1A]">{categoryName}</span>
              {selectedSubCategoryId && (
                <>
                  <span className="text-[#D1C7BB]">›</span>
                  <span className="font-semibold text-[#8B6914]">{subCategoryName}</span>
                </>
              )}
            </nav>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">{categoryName}</h1>
            <div className="mb-2 flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center">
            <div
              className="flex w-full min-w-0 max-w-full flex-nowrap gap-2 overflow-x-auto overflow-y-hidden py-1 touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex-1"
              aria-label="Subcategories"
            >
              <button type="button" aria-pressed={!selectedSubCategoryId}
                onClick={() => {
                  if (isAll) {
                    navigate("/physical-gold");
                  } else {
                    navigate(`/physical-gold/category/${encodeURIComponent(selectedCategoryId)}`);
                  }
                }}
                className={`shrink-0 touch-manipulation rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-all ${
                  !selectedSubCategoryId
                    ? "border-[#C29B27] bg-amber-50 text-[#8B6914]"
                    : "border-[#E8E2D8] text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                }`}>
                All
              </button>
              {subCategories.map(sub => (
                <button type="button" key={sub.id}
                  onClick={() => handleSubCategoryNavigation(sub.id)}
                  aria-pressed={selectedSubCategoryId === sub.id}
                  className={`flex max-w-[220px] shrink-0 touch-manipulation items-center gap-2.5 rounded-xl border px-3 py-2 text-[13px] transition-all focus-visible:ring-2 focus-visible:ring-[#C29B27] ${
                    selectedSubCategoryId === sub.id
                      ? "border-[#C29B27] bg-amber-50 text-[#8B6914]"
                      : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                  }`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F9F7F4] border border-[#E8E2D8]">
                    <ProductImage urls={collectImageURLs(sub)} alt={sub.name} className="p-1 object-contain" />
                  </span>
                  <span className="line-clamp-2 text-left font-semibold leading-4">{sub.name}</span>
                </button>
              ))}
            </div>

                    <div className="flex w-full min-w-0 gap-2 md:w-90 md:shrink-0">
                      <div className="relative min-w-0 flex-1">
                        <Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-[#8A8A8A]" />
                        <input
                          aria-label="Search products"
                          type="search"
                          placeholder="Search products…"
                          value={searchInput}
                          onChange={handleSearchChange}
                          className="h-11 w-full rounded-xl border border-[#E8E2D8] bg-white pl-9 pr-3 text-[13px] text-[#1A1A1A] placeholder:text-[#8A8A8A] outline-none transition focus:border-[#C29B27] focus:ring-1 focus:ring-[#C29B27]/30"
                        />
                      </div>
                      <button
                        type="button"
                        aria-expanded={mobileFilterOpen}
                        aria-controls="collection-filters"
                        onClick={() => setMobileFilterOpen(open => !open)}
                        className={`relative flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition ${
                          mobileFilterOpen
                            ? "border-[#C29B27] bg-amber-50 text-[#8B6914]"
                            : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/60 hover:text-[#C29B27]"
                        }`}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeCount > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C29B27] text-[9px] font-bold text-white">
                            {activeCount}
                          </span>
                        )}
                      </button>
                    </div>
            </div>

            {loadError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {loadError} <button onClick={() => setRetryCount(n => n + 1)} className="ml-2 min-h-10 font-medium underline">Retry</button>
            </div>}
            {selectedCategoryId && (
              <>
                <h2 className="sr-only">Products in {subCategoryName}</h2>
                <div className="mt-3">
                  {activeCount > 0 && (
                    <div className="mb-2 flex items-center justify-between text-xs text-[#6B6B6B]">
                      <span>{activeCount} filter{activeCount > 1 ? 's' : ''} applied</span>
                      <button onClick={clearFilters} className="min-h-8 font-semibold text-[#C29B27] hover:underline">Clear all</button>
                    </div>
                  )}
                  {loadError ? null : loadingProds ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading products" aria-busy="true">
                      {Array.from({length: 10}, (_, i) => (
                        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white">
                          <div className="aspect-square bg-[#F5F0E8]" />
                          <div className="p-3 space-y-2">
                            <div className="h-3 w-3/4 rounded-full bg-[#EDE9E2]" />
                            <div className="h-3 w-1/2 rounded-full bg-[#EDE9E2]" />
                            <div className="mt-3 h-8 rounded-xl bg-[#EDE9E2]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : products.length ? (
                    <div className="grid grid-cols-2 auto-rows-fr gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {products.map(product => {
                        const productSubCategoryId = String(
                          product.subCategoryId || selectedSubCategoryId || ""
                        );
                        const productSubCategoryName =
                          subCategories.find(
                            sub => String(sub.id) === productSubCategoryId
                          )?.name ||
                          product.subCategoryName ||
                          (selectedSubCategoryId ? subCategoryName : "");

                        return (
                          <CompactProductCard
                            key={product.id}
                            product={product}
                            horizontal={false}
                            onClick={() =>
                              navigate(`/physical-gold/product/${product.id}`, {
                                state: {
                                  categoryId: selectedCategoryId,
                                  categoryName,
                                  subCategoryId: productSubCategoryId,
                                  subCategoryName: productSubCategoryName,
                                },
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#E8E2D8] px-5 py-16 text-center">
                      <Package className="mx-auto mb-3 h-8 w-8 text-[#D1C7BB]" />
                      <h3 className="font-semibold text-[#1A1A1A]">No products found</h3>
                      <p className="mt-2 text-sm text-[#6B6B6B]">Try another search or adjust your filters.</p>
                      <button onClick={clearFilters} className="mt-4 min-h-11 text-sm font-semibold text-[#C29B27] hover:underline">Clear filters</button>
                    </div>
                  )}
                  {!loadingProds && totalPages > 1 && (
                    <div className="mt-8 overflow-x-auto">
                      <Pagination currentPage={filters.page} totalPages={totalPages}
                        onPageChange={page => setFilters(prev => ({...prev, page}))}
                        totalElements={totalElements} pageSize={filters.pageSize} />
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {/* Filter Modal — bottom sheet on mobile, centered modal on tablet/desktop */}
      {/* Filter Modal — div-based, controlled by mobileFilterOpen state */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="relative flex w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[88dvh] sm:max-h-[80dvh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-[#E8E2D8] bg-[#FDFAF4] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C29B27]/10">
                  <SlidersHorizontal className="h-4 w-4 text-[#C29B27]" />
                </div>
                <h2 id="filter-modal-title" className="text-[15px] font-bold text-[#1A1A1A]">Filters</h2>
                {activeCount > 0 && (
                  <span className="rounded-full bg-[#C29B27] px-2 py-0.5 text-[10px] font-bold text-white">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button type="button" onClick={clearFilters}
                    className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[#C29B27] hover:bg-amber-50 transition-colors">
                    Clear all
                  </button>
                )}
                <button type="button" aria-label="Close filters" onClick={() => setMobileFilterOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E2D8] bg-white text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <FilterSidebar filters={{...filters, q: ""}} onFilterChange={updateFilters} onClearFilters={clearFilters} facets={facets} />
            </div>

            {/* Footer */}
            <footer className="shrink-0 border-t border-[#E8E2D8] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => setMobileFilterOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#C29B27] text-[14px] font-bold text-white shadow-sm hover:bg-[#A88820] transition-colors active:scale-[0.98]">
                Show Products
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
};

export default PhysicalGoldPageNew;