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
import AIModelPreviewModal from "./components/AIModelPreviewModal";
import VirtualTryOnModal from "./components/VirtualTryOnModal";

import { PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import { fetchProductVariants, fetchProducts, generateModelImage, generateVirtualTryOn, fetchProductRecommendations } from "./physicalGoldService";
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
  const [similarProducts, setSimilarProducts] = useState<PhysicalGoldProduct[]>([]);
  const [exploreMoreProducts, setExploreMoreProducts] = useState<PhysicalGoldProduct[]>([]);
  const [inCart, setInCart] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [tryOnMode, setTryOnMode] = useState<"select" | "ai" | "upload">("select");
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Virtual Try-On states
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [tryOnGeneratedImage, setTryOnGeneratedImage] = useState<string | null>(null);
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

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
        
        // Fetch recommendations
        try {
          const recommendations = await fetchProductRecommendations(id);
          if (recommendations.similarProducts) {
            setSimilarProducts(recommendations.similarProducts.map((item: any) => ({
              id: item.id.toString(),
              productName: item.name,
              imageUrl: item.frontViewurl || "",
              priceRange: item.priceRange || `₹${item.price?.toLocaleString('en-IN')}`,
              description: item.description,
              subCategoryId: item.categoryId?.toString(),
              categoryName: item.categoryName,
              status: item.status,
            })));
          }
          if (recommendations.exploreMoreProducts) {
            setExploreMoreProducts(recommendations.exploreMoreProducts.map((item: any) => ({
              id: item.id.toString(),
              productName: item.name,
              imageUrl: item.frontViewurl || "",
              priceRange: item.priceRange || `₹${item.price?.toLocaleString('en-IN')}`,
              description: item.description,
              subCategoryId: item.categoryId?.toString(),
              categoryName: item.categoryName,
              status: item.status,
            })));
          }
        } catch (error) {
          console.error("Failed to load recommendations:", error);
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

  const handleShare = useCallback(async () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  }, [isShareMenuOpen]);

  const handleShareOption = useCallback(async (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this ${product?.productName} - ₹${selectedVariant?.price.toLocaleString("en-IN")}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setIsShareMenuOpen(false);
      }, 2000);
    }
    if (platform !== 'copy') {
      setIsShareMenuOpen(false);
    }
  }, [product, selectedVariant]);

  const handleGenerateAIImage = useCallback(async () => {
    if (!productImages[0]) return;

    // Open modal immediately
    setShowAIModal(true);
    setIsGeneratingAI(true);
    setAiError(null);
    setAiGeneratedImage(null);

    try {
      const imageUrl = productImages[selectedImageIndex] || productImages[0];
      const generatedUrl = await generateModelImage(imageUrl);
      setAiGeneratedImage(generatedUrl);
    } catch (err) {
      setAiError("Unable to generate image. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [productImages, selectedImageIndex]);

  const handleCloseAIModal = useCallback(() => {
    setShowAIModal(false);
    setTryOnMode("select");
    setIsTryOnOpen(false);
  }, []);

  const handleRegenerateAI = useCallback(() => {
    handleGenerateAIImage();
  }, [handleGenerateAIImage]);

  const handleUserPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setTryOnError("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setTryOnError("Image size must be less than 10MB");
      return;
    }

    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleOpenCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setTryOnError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const handleCapturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setUserPhotoFile(file);
          setUserPhoto(canvas.toDataURL('image/jpeg'));
          handleCloseCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  }, []);

  const handleCloseCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleGenerateVirtualTryOn = useCallback(async () => {
    if (!userPhotoFile || !productImages[0]) return;

    setShowTryOnModal(true);
    setIsGeneratingTryOn(true);
    setTryOnError(null);
    setTryOnGeneratedImage(null);

    try {
      // Get product image URL
      const productImageUrl = productImages[selectedImageIndex] || productImages[0];

      // Generate virtual try-on with FormData (file + imageUrl)
      const generatedUrl = await generateVirtualTryOn(userPhotoFile, productImageUrl);
      setTryOnGeneratedImage(generatedUrl);
    } catch (err: any) {
      setTryOnError(err.message || "Unable to generate virtual try-on. Please try again.");
    } finally {
      setIsGeneratingTryOn(false);
    }
  }, [userPhotoFile, productImages, selectedImageIndex]);

  const handleCloseTryOnModal = useCallback(() => {
    setShowTryOnModal(false);
    setTryOnMode("select");
    setIsTryOnOpen(false);
  }, []);

  const handleRegenerateTryOn = useCallback(() => {
    handleGenerateVirtualTryOn();
  }, [handleGenerateVirtualTryOn]);

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

              {/* Inline Virtual Try-On */}
              <div className={`relative mt-2 rounded-xl border border-[#E8E2D8] bg-white overflow-hidden transition-all duration-300`}>

                {/* Header — always visible */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE1]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-[#C29B27]/20">
                      <Camera size={15} className="text-[#C29B27]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]">Virtual Try-On</p>
                      <p className="text-[10px] text-[#8A8A8A] font-medium">See how it looks before you buy</p>
                    </div>
                  </div>
                  {isTryOnOpen ? (
                    <button
                      onClick={() => { setIsTryOnOpen(false); setTryOnMode("select"); setAiGeneratedImage(null); setAiError(null); }}
                      className="text-[10px] font-bold text-[#8A8A8A] bg-[#F5F0E8] px-3 py-1 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors uppercase tracking-wide"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTryOnOpen(true)}
                      className="text-[10px] font-bold text-[#C29B27] bg-amber-50 px-3 py-1.5 rounded-full border border-[#C29B27]/25 uppercase tracking-widest hover:bg-[#C29B27] hover:text-white transition-all"
                    >
                      Try Now
                    </button>
                  )}
                </div>

                {/* Body — only when open */}
                {isTryOnOpen && (
                  <div className="p-4">

                    {/* Mode: Select */}
                    {tryOnMode === "select" && (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Option 1 — AI Model */}
                        <button
                          onClick={() => setTryOnMode("ai")}
                          className="flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border-2 border-dashed border-[#C29B27]/30 bg-amber-50/30 hover:border-[#C29B27] hover:bg-amber-50/60 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E8E2D8] shadow-sm group-hover:scale-110 transition-transform">
                            <Star size={18} className="text-[#C29B27]" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-wide mb-0.5">AI Model Preview</p>
                            <p className="text-[10px] text-[#8A8A8A] leading-snug">See this jewellery on an AI-generated model instantly</p>
                          </div>
                        </button>

                        {/* Option 2 — Your Photo */}
                        <button
                          onClick={() => setTryOnMode("upload")}
                          className="flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border-2 border-dashed border-[#8A8A8A]/20 bg-[#F9F7F4] hover:border-[#C29B27]/60 hover:bg-amber-50/30 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E8E2D8] shadow-sm group-hover:scale-110 transition-transform">
                            <Camera size={18} className="text-[#8A8A8A] group-hover:text-[#C29B27] transition-colors" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-wide mb-0.5">Try on Your Photo</p>
                            <p className="text-[10px] text-[#8A8A8A] leading-snug">Upload a photo or use your camera to try it on yourself</p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Mode: AI Generation */}
                    {tryOnMode === "ai" && (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() => setTryOnMode("select")}
                          className="self-start flex items-center gap-1 text-[10px] font-bold text-[#8A8A8A] hover:text-[#C29B27] transition-colors uppercase tracking-wide"
                        >
                          ← Back
                        </button>

                        <div className="w-full flex flex-col items-center gap-4 py-4">
                          {/* Preview of product image that will be used */}
                          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#C29B27]/30 bg-[#F5F0E8]">
                            <img src={productImages[selectedImageIndex] || productImages[0]} alt="Product" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-center">
                            <p className="text-[12px] font-bold text-[#1A1A1A] mb-1">Generate AI Model Preview</p>
                            <p className="text-[10px] text-[#8A8A8A] max-w-[240px] leading-relaxed">
                              Our AI will create a realistic preview of this jewellery on a model. This takes just a few seconds.
                            </p>
                          </div>
                          <button
                            onClick={handleGenerateAIImage}
                            className="px-8 py-3 rounded-full bg-[#C29B27] text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                          >
                            Generate Preview
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode: Upload / Camera */}
                    {tryOnMode === "upload" && (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() => {
                            setTryOnMode("select");
                            handleCloseCamera();
                          }}
                          className="self-start flex items-center gap-1 text-[10px] font-bold text-[#8A8A8A] hover:text-[#C29B27] transition-colors uppercase tracking-wide"
                        >
                          ← Back
                        </button>

                        {isCameraOpen ? (
                          <div className="w-full flex flex-col items-center gap-3 py-3">
                            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-xl overflow-hidden bg-black border-2 border-[#C29B27]">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleCloseCamera}
                                className="px-6 py-2.5 rounded-full border-2 border-[#E8E2D8] text-[#8A8A8A] text-[11px] font-bold hover:bg-[#F5F2EE] transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCapturePhoto}
                                className="px-8 py-2.5 rounded-full bg-[#C29B27] text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                              >
                                <Camera size={16} />
                                Capture Photo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center gap-3 py-3">
                            <div className="w-14 h-14 rounded-full bg-[#F5F0E8] flex items-center justify-center border border-[#E8E2D8]">
                              <Camera size={22} className="text-[#C29B27]" />
                            </div>
                            <div className="text-center">
                              <p className="text-[12px] font-bold text-[#1A1A1A] mb-1">Try It On Yourself</p>
                              <p className="text-[10px] text-[#8A8A8A] max-w-[240px] leading-relaxed">
                                Upload a clear front-facing photo of yourself, or use your device camera to see how this jewellery looks on you.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
                              <label className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#C29B27]/50 hover:bg-amber-50/30 transition-all group cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleUserPhotoSelect}
                                  className="hidden"
                                />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C29B27" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                </svg>
                                <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wide">Upload Photo</span>
                                <span className="text-[9px] text-[#8A8A8A]">From your device</span>
                              </label>
                              <button
                                onClick={handleOpenCamera}
                                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#C29B27]/50 hover:bg-amber-50/30 transition-all group"
                              >
                                <Camera size={20} className="text-[#C29B27]" />
                                <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wide">Open Camera</span>
                                <span className="text-[9px] text-[#8A8A8A]">Take a photo now</span>
                              </button>
                            </div>

                            {userPhoto && (
                              <div className="w-full max-w-[280px] space-y-3">
                                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-[#C29B27] shadow-sm">
                                  <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                                </div>
                                <button
                                  onClick={handleGenerateVirtualTryOn}
                                  className="w-full px-6 py-3 rounded-full bg-[#C29B27] text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform"
                                >
                                  Generate Try-On
                                </button>
                              </div>
                            )}

                            <p className="text-[9px] text-[#8A8A8A] text-center max-w-[220px] leading-relaxed mt-1">
                              🔒 Your photos are processed securely and are never stored on our servers.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Share */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8A8A] hover:text-[#C29B27] transition-colors w-fit"
                >
                  <Share2 size={11} />
                  Share this product
                </button>

                {isShareMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-[#E8E2D8] p-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => handleShareOption('whatsapp')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareOption('twitter')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShareOption('copy')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
                    >
                      {shareSuccess ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#2e7d32">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          <span className="text-green-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

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

          {/* ── Similar Products ── */}
          {similarProducts.length > 0 && (
            <div className="mt-10">
              <h3 className="font-serif text-[17px] font-bold text-[#1A1A1A] mb-4">Similar Products</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
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

          {/* ── Explore More ── */}
          {/* {exploreMoreProducts.length > 0 && (
            <div className="mt-10">
              <h3 className="font-serif text-[17px] font-bold text-[#1A1A1A] mb-4">Explore More</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {exploreMoreProducts.slice(0, 8).map((p) => (
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
          )} */}

          {/* ── Related Products (fallback) ── */}
          { /* {relatedProducts.length > 0 && (
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
          )} */ }

        </div>

      </div>

      {/* AI Model Preview Modal */}
      <AIModelPreviewModal
        isOpen={showAIModal}
        onClose={handleCloseAIModal}
        isGenerating={isGeneratingAI}
        generatedImage={aiGeneratedImage}
        error={aiError}
        onRegenerate={handleRegenerateAI}
        productImage={productImages[selectedImageIndex] || productImages[0]}
      />

      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal
        isOpen={showTryOnModal}
        onClose={handleCloseTryOnModal}
        isGenerating={isGeneratingTryOn}
        generatedImage={tryOnGeneratedImage}
        error={tryOnError}
        onRegenerate={handleRegenerateTryOn}
        productImage={productImages[selectedImageIndex] || productImages[0]}
        userImage={userPhoto}
      />
    </div>
  );
};

export default ProductDetailsPage;