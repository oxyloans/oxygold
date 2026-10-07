import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Loader2, 
  Package, 
  ShoppingCart, 
  Tag, 
  Trash2, 
  Heart, 
  X 
} from "lucide-react";
import { FaBagShopping } from "react-icons/fa6";
import { useCart, isPhysicalGoldUserLoggedIn, ProfileIncompleteError } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import { 
  PhysicalGoldProduct, 
  ProductVariant, 
  resolveS3ImageUrl,
  isDiscountTimeActive
} from "../physicalGoldData";
import { 
  fetchProductVariants, 
  fetchGoldSilverRateBreakdown, 
  GoldSilverRateBreakdown 
} from "../physicalGoldService";
import "../styles.css";

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

const ProductImage: React.FC<{ urls: string[]; alt: string; className?: string }> = ({
  urls, alt, className = ""
}) => {
  const [index, setIndex] = useState(0);
  const identity = urls.join("|");
  useEffect(() => setIndex(0), [identity]);
  const src = urls[index];
  return src ? (
    <img 
      key={src} 
      src={src} 
      alt={alt} 
      loading="lazy" 
      decoding="async"
      onError={() => setIndex(current => current + 1)}
      className={`block h-full w-full object-contain ${className}`} 
    />
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

export interface ProductCardProps {
  product: PhysicalGoldProduct & { imageCandidates?: string[] };
  onClick: () => void;
  isWishlistPage?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlistPage = false 
}) => {
  const navigate = useNavigate();
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const { isInWishlist, toggleWishlist, removeFromWishlist } = useWishlist();

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

  const isLiked = isInWishlist(product.id);
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

  // Pre-fetch variants on mount and prefetch breakup for default variant
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
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#FDFAF4]">
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

        {/* Category Badge - Hidden on mobile */}
        {product.categoryName && (
          <span className={`absolute ${isWishlistPage ? "right-10 max-w-[45%]" : "right-2 max-w-[55%]"} top-2 z-10 hidden sm:inline-block truncate rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm`}>
            {product.categoryName}
          </span>
        )}

        {/* Wishlist Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isWishlistPage) {
              removeFromWishlist(product.id);
            } else {
              toggleWishlist(product);
            }
          }}
          aria-label={isWishlistPage ? "Remove from wishlist" : isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all ${
            isWishlistPage
              ? "bg-white/95 text-[#D84C4C] hover:bg-rose-50 hover:text-rose-700 hover:scale-110 border border-rose-100"
              : isLiked
              ? "bg-[#C29B27] text-white hover:scale-110"
              : "opacity-0 group-hover:opacity-100 bg-white/90 text-stone-600 hover:text-[#C29B27] hover:scale-110"
          }`}
        >
          {isWishlistPage ? (
            <Trash2 size={13} />
          ) : (
            <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
          )}
        </button>
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

        {/* Action Buttons: Add to Cart & Buy Now / Quantity Stepper */}
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

          <div 
            onClick={onClick}
            className="h-7 text-[13px] font-medium text-[#8A8A8A] group-hover:text-[#C29B27] transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Making Charges ({activeOffer.makingPercentage}%):</span>
                    <span className="font-medium text-[#1A1A1A]">₹{Number(activeOffer.makingAmount || 0).toFixed(2)}</span>
                  </div>
           


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

export default ProductCard;
