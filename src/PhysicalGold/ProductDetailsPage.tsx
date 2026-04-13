import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Minus,
  Plus,
  Share2,
  ChevronRight,
  Camera,
} from "lucide-react";
import LoadingSpinner from "./components/LoadingSpinner";
import ProductCard from "./components/ProductCard";

import { PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import { fetchProductVariants, fetchProducts } from "./physicalGoldService";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import {
  getMockReviews,
  getProductRating,
  getReviewCount,
  getProductTag,
} from "./mockData";
import "./styles.css";

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { categoryId, categoryName, subCategoryId, subCategoryName, fromWishlist } = (location.state as any) || {};

  const [product, setProduct] = useState<PhysicalGoldProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedPurity, setSelectedPurity] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("product");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<PhysicalGoldProduct[]>([]);
  const [inCart, setInCart] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          v.purity === selectedPurity &&
          v.weight.toString() === selectedWeight &&
          (v.size || "") === selectedSize
      ) ||
      variants.find(
        (v) =>
          v.purity === selectedPurity && v.weight.toString() === selectedWeight
      ) ||
      variants[0],
    [variants, selectedPurity, selectedWeight, selectedSize]
  );

  // Sync inCart state with actual cart content
  useEffect(() => {
    if (selectedVariant && cartItems) {
      const item = cartItems.find((i) => i.variant.id === selectedVariant.id);
      setInCart(!!item);
      if (item) setQuantity(item.quantity);
    }
  }, [selectedVariant, cartItems]);

  const liked = product ? isInWishlist(product.id) : false;
  const rating = id ? getProductRating(id) : 4;
  const reviewCount = id ? getReviewCount(id) : 50;
  const reviews = id ? getMockReviews(id) : [];
  const tag = id ? getProductTag(id) : null;

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { product: p, variants: v } = await fetchProductVariants(id);
        setProduct(p);
        setVariants(v);
        if (v.length > 0) {
          setSelectedPurity(v[0].purity);
          setSelectedWeight(v[0].weight.toString());
          setSelectedSize(v[0].size || "");
        }
        if (p?.subCategoryId) {
          const related = await fetchProducts(p.subCategoryId);
          setRelatedProducts(related.filter((rp) => rp.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const purities = useMemo(
    () => Array.from(new Set(variants.map((v) => v.purity))),
    [variants]
  );

  const weights = useMemo(() => {
    const filtered = variants.filter((v) => v.purity === selectedPurity);
    return Array.from(new Set(filtered.map((v) => v.weight.toString())));
  }, [variants, selectedPurity]);


  const productImages = useMemo(() => {
    const images: string[] = [];
    if (product?.imageSet) {
      const views = [
        product.imageSet.frontViewurl,
        product.imageSet.backViewUrl,
        product.imageSet.leftViewUrl,
        product.imageSet.rightViewUrl,
        product.imageSet.topViewUrl,
        product.imageSet.bottomViewUrl,
      ];
      views.forEach((url) => { if (url) images.push(url); });
    }
    if (images.length === 0 && product?.imageUrl) {
      images.push(product.imageUrl);
    }
    return images;
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      await addToCart(product, selectedVariant);
      setInCart(true);
    }
  }, [addToCart, product, selectedVariant]);

  const handleBuyNow = useCallback(async () => {
    if (product && selectedVariant) {
      await addToCart(product, selectedVariant);
      navigate("/physical-gold/cart");
    }
  }, [addToCart, product, selectedVariant, navigate]);

  const handleIncrement = useCallback(async () => {
    if (selectedVariant) {
      await incrementQuantity(selectedVariant.id);
    }
  }, [incrementQuantity, selectedVariant]);

  const handleDecrement = useCallback(async () => {
    if (selectedVariant) {
      const item = cartItems.find((i) => i.variant.id === selectedVariant.id);
      if (item) {
        if (item.quantity === 1) {
          setInCart(false);
          setQuantity(1);
        }
        await decrementQuantity(selectedVariant.id, item.cartId);
      }
    }
  }, [decrementQuantity, selectedVariant, cartItems]);

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex-1 flex items-center justify-center pt-8">
          <LoadingSpinner message="Loading Product..." />
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-[#F0EBE1]">
            <p className="text-[#8A8A8A] text-sm font-medium mb-4">Product not found</p>
            <button
              onClick={() => navigate("/physical-gold")}
              className="px-6 py-2 rounded-lg bg-[#C29B27] text-white font-bold text-xs transition-transform active:scale-95"
            >
              Back to Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalCategoryName = categoryName || product.categoryName || "Collection";
  const finalSubCategoryName = subCategoryName || product.subCategoryName;

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 pb-10 pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          {/* ── Breadcrumb — solid white bg, always visible ── */}
          <nav className="flex items-center flex-wrap gap-1 text-[11px] font-semibold text-[#8A8A8A] mb-4 bg-white pt-20">
            <button
              onClick={() => navigate("/physical-gold")}
              className="hover:text-[#C29B27] transition-colors"
            >
              Home
            </button>
            <ChevronRight size={11} className="text-[#D1C7BB]" />
            <button
              onClick={() => navigate("/physical-gold", { state: { selectedCategory: categoryId } })}
              className="hover:text-[#C29B27] transition-colors"
            >
              {finalCategoryName}
            </button>
            {finalSubCategoryName && (
              <>
                <ChevronRight size={11} className="text-[#D1C7BB]" />
                <button
                  onClick={() => navigate("/physical-gold", { state: { selectedCategory: categoryId } })}
                  className="hover:text-[#C29B27] transition-colors cursor-pointer"
                >
                  {finalSubCategoryName}
                </button>
              </>
            )}
            <ChevronRight size={11} className="text-[#D1C7BB]" />
            <span className="text-[#1A1A1A] font-bold">{product.productName}</span>
          </nav>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

            {/* Left: Image Gallery */}
            <div className="space-y-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] border border-[#EDEDE6]">
                <img
                  src={productImages[selectedImageIndex] || ""}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
                {tag && (
                  <span className="absolute top-3 left-3 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-[#C29B27] text-white">
                    {tag}
                  </span>
                )}
                {/* Wishlist button — semi-rounded, white bg */}
                <button
                  onClick={() => product && toggleWishlist(product)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-[#E8E2D8] shadow-sm transition-colors ${liked ? "text-[#C29B27]" : "text-[#8A8A8A] hover:text-[#C29B27]"
                    }`}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === i
                        ? "border-[#C29B27]"
                        : "border-[#E8E2D8] bg-white"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col gap-3.5">

              {/* Category · Subcategory */}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8A8A]">
                {product.categoryName || "EARRINGS"} · {product.subCategoryName || "STUDS"}
              </p>

              {/* Title + Stars */}
              <div>
                <h1 className="font-serif text-2xl md:text-[28px] font-bold text-[#1A1A1A] leading-snug mb-1.5">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= rating ? "#C29B27" : "none"}
                        stroke={s <= rating ? "#C29B27" : "#D1C7BB"}
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8A8A8A]">({reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="font-serif text-[26px] font-bold text-[#C29B27] leading-none">
                  ₹{selectedVariant.price.toLocaleString("en-IN")}
                </span>
                {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] text-[#8A8A8A] line-through">
                      ₹{selectedVariant.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] font-black tracking-wide uppercase text-green-700 px-1.5 py-0.5 bg-green-50 rounded">
                      {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Inline badges */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C29B27] bg-amber-50 border border-[#C29B27]/25 px-2.5 py-1 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#C29B27] inline-flex items-center justify-center flex-shrink-0">
                    <span className="w-1 h-1 bg-[#C29B27] rounded-full block" />
                  </span>
                  22K Hallmarked
                </span>
                <span className="text-[10px] font-semibold text-[#6B6B6B] bg-[#F5F0E8] px-2.5 py-1 rounded-md border border-[#E8E2D8]">
                  Weight: {selectedVariant.weight}g
                </span>
              </div>

              {/* Metal Type — semi-rounded pill buttons */}
              <div>
                <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.12em] mb-2">
                  Metal Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {purities.length > 0
                    ? purities.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedPurity(p);
                          const fw = variants.find((vn) => vn.purity === p)?.weight.toString() || "";
                          setSelectedWeight(fw);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${selectedPurity === p
                          ? "border-[#C29B27] text-[#C29B27] bg-amber-50"
                          : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                          }`}
                      >
                        {p} Yellow Gold
                      </button>
                    ))
                    : ["22K Yellow Gold", "22K Rose Gold", "18K White Gold"].map((label, idx) => (
                      <button
                        key={label}
                        className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${idx === 0
                          ? "border-[#C29B27] text-[#C29B27] bg-amber-50"
                          : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Weight Category — semi-rounded */}
              <div>
                <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.12em] mb-2">
                  Weight Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {weights.length > 0
                    ? weights.map((w, idx) => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${selectedWeight === w
                          ? "border-[#C29B27] text-[#C29B27] bg-amber-50"
                          : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                          }`}
                      >
                        {idx === 0 ? "Light" : idx === 1 ? "Medium" : "Heavy"}
                      </button>
                    ))
                    : ["Light", "Medium", "Heavy"].map((label, idx) => (
                      <button
                        key={label}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${idx === 1
                          ? "border-[#C29B27] text-[#C29B27] bg-amber-50"
                          : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>

              {/* CTA — updated as per requirements */}
              <div className="flex flex-col gap-3 mt-2">
                {!inCart ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      disabled={selectedVariant.stockQuantity === 0}
                      className="flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-[11px] font-black uppercase tracking-widest bg-[#C29B27] hover:bg-[#A88820] disabled:opacity-50 text-white transition-all transform active:scale-[0.98]"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3 flex items-center justify-center rounded-lg text-[11px] font-black uppercase tracking-widest border border-[#C29B27] text-[#C29B27] bg-white hover:bg-amber-50 transition-all transform active:scale-[0.98]"
                    >
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <div className="flex-1 inline-flex items-center justify-between rounded-lg border border-[#C29B27] bg-amber-50/30 overflow-hidden h-[44px]">
                      <button
                        onClick={handleDecrement}
                        className="w-12 h-full flex items-center justify-center text-[#C29B27] hover:bg-[#C29B27] hover:text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-[14px] font-black text-[#1A1A1A]">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        className="w-12 h-full flex items-center justify-center text-[#C29B27] hover:bg-[#C29B27] hover:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => navigate("/physical-gold/cart")}
                      className="flex-[1.5] py-3 flex items-center justify-center gap-2 rounded-lg text-[11px] font-black uppercase tracking-widest bg-[#1A1A1A] text-white hover:bg-black transition-all transform active:scale-[0.98]"
                    >
                      Go to Cart
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Virtual Try-On — as per requirement 3 & latest feedback */}
              <div
                className={`group relative mt-2 rounded-xl border-2 border-dashed border-[#C29B27]/30 bg-amber-50/20 transition-all duration-500 overflow-hidden ${isTryOnOpen ? "pb-6" : ""
                  }`}
              >
                {!isTryOnOpen ? (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#F0EBE1] group-hover:scale-110 transition-transform">
                        <Star size={18} className="text-[#C29B27]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]">Virtual Try-On</p>
                        <p className="text-[10px] font-medium text-[#8A8A8A]">See how it looks on you</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsTryOnOpen(true)}
                      className="text-[10px] font-bold text-[#C29B27] bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#C29B27]/20 uppercase tracking-widest hover:bg-[#C29B27] hover:text-white transition-all"
                    >
                      Try Now
                    </button>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between p-4 border-b border-[#C29B27]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#F0EBE1]">
                          <Star size={14} className="text-[#C29B27]" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]">Virtual Try-On</p>
                      </div>
                      <button
                        onClick={() => setIsTryOnOpen(false)}
                        className="text-[10px] font-bold text-[#8A8A8A] bg-white px-3 py-1 rounded-full shadow-sm border border-[#F0EBE1] uppercase hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      >
                        Close
                      </button>
                    </div>

                    <div className="px-4 py-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-4 border border-[#F0EBE1]">
                        <Camera size={24} className="text-[#8A8A8A] opacity-50" />
                      </div>
                      <p className="text-[12px] font-medium text-[#8A8A8A] mb-6">
                        Camera access required for virtual try-on
                      </p>
                      <button className="px-10 py-3 rounded-full bg-[#C29B27] text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 transition-transform">
                        Enable Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Share */}
              <button className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8A8A] hover:text-[#C29B27] transition-colors w-fit">
                <Share2 size={11} />
                Share this product
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, title: "BIS Hallmarked" },
                  { icon: Truck, title: "Free Insured Delivery" },
                  { icon: RefreshCw, title: "15-Day Returns" },
                ].map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="flex flex-col items-center text-center gap-1.5 py-2.5 px-1.5 rounded-lg bg-[#FDFAF4] border border-[#E8E2D8]"
                  >
                    <div className="w-6 h-6 rounded-md bg-white border border-[#E8E2D8] flex items-center justify-center">
                      <Icon size={12} className="text-[#C29B27]" />
                    </div>
                    <span className="text-[8.5px] font-bold text-[#4A4A4A] uppercase tracking-wide leading-tight">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-10">
            <div className="flex border-b border-[#E8E2D8] gap-6 overflow-x-auto no-scrollbar">
              {["Product Details", `Reviews (${reviewCount})`, "Shipping & Returns"].map((label) => {
                const tabId = label.toLowerCase().split(" ")[0];
                const isActive = activeTab === tabId;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveTab(tabId)}
                    className={`pb-2.5 pt-3 text-[11px] font-black uppercase tracking-[0.15em] relative whitespace-nowrap transition-colors ${isActive ? "text-[#1A1A1A]" : "text-[#8A8A8A] hover:text-[#1A1A1A]"
                      }`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C29B27] rounded-t" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-5 min-h-[240px]">
              {activeTab === "product" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    {[
                      { label: "Metal", value: "Gold" },
                      { label: "Purity", value: selectedVariant.purity },
                      { label: "Weight", value: `${selectedVariant.weight}g` },
                      { label: "Finish", value: "High Polish" },
                      { label: "Occasion", value: "Wedding, Party, Daily" },
                      { label: "Collection", value: "Heritage 2026" },
                    ].map(({ label, value }) => (
                      <div key={label} className="grid grid-cols-2 py-2.5 border-b border-[#F0EBE1]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8A8A]">
                          {label}
                        </span>
                        <span className="text-[12px] font-bold text-[#1A1A1A]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-serif text-[15px] font-bold text-[#1A1A1A] mb-2">Description</h4>
                    <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
                      {product.description ||
                        `This exquisite ${product.productName} is handcrafted by skilled artisans using ${selectedVariant.purity} hallmarked gold. Weighing ${selectedVariant.weight}g, this piece combines traditional craftsmanship with contemporary design, making it perfect for both festive occasions and everyday elegance.`}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-3 mb-5 p-3.5 bg-white rounded-xl border border-[#F0EBE1]">
                    <div className="text-2xl font-serif font-bold text-[#1A1A1A]">{rating}</div>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= rating ? "#C29B27" : "none"} stroke={s <= rating ? "#C29B27" : "#D1C7BB"} />
                        ))}
                      </div>
                      <p className="text-[9px] font-bold text-[#8A8A8A] uppercase tracking-widest">
                        Based on {reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((review, i) => (
                      <div key={i} className="pb-4 border-b border-[#F0EBE1]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#1A1A1A] text-[12px]">{review.name}</span>
                          <span className="text-[10px] text-[#8A8A8A]">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} fill={s <= review.rating ? "#C29B27" : "none"} stroke={s <= review.rating ? "#C29B27" : "#D1C7BB"} />
                          ))}
                        </div>
                        <p className="text-[11px] text-[#6B6B6B] leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Truck, title: "Free Shipping", desc: "Complimentary insured shipping on all orders above ₹50,000 across India." },
                    { icon: Shield, title: "Insured Delivery", desc: "Your jewelry is 100% insured until it reaches your doorstep." },
                    { icon: RefreshCw, title: "15-Day Returns", desc: "Return within 15 days for a full refund or exchange if not satisfied." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[#E8E2D8] bg-white space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <item.icon size={15} className="text-[#C29B27]" />
                      </div>
                      <h5 className="font-serif text-[13px] font-bold text-[#1A1A1A]">{item.title}</h5>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif text-[17px] font-bold text-[#1A1A1A] mb-4">You May Also Like</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => navigate(`/physical-gold/product/${p.id}`, {
                      state: { categoryId, categoryName, subCategoryId, subCategoryName: finalSubCategoryName }
                    })}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProductDetailsPage;