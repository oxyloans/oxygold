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
  Package,
  X,
  Tag,
  Sparkles,
  CheckCircle2,
  Gem,
} from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "./components/LoadingSpinner";

import AIModelPreviewModal from "./components/AIModelPreviewModal";
import VirtualTryOnModal from "./components/VirtualTryOnModal";

import { PhysicalGoldProduct, ProductVariant, resolveS3ImageUrl } from "./physicalGoldData";
import { fetchProductVariants, fetchProducts, generateModelImage, generateVirtualTryOn, fetchProductRecommendations, fetchProductRatings, fetchGoldSilverRateBreakdown, GoldSilverRateBreakdown } from "./physicalGoldService";
import { useCart, ProfileIncompleteError } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import TokenManager from "../utils/tokenManager";
import {
  getProductTag,
} from "./mockData";
import "./styles.css";

/** Compact cards live here so no changes to the shared ProductCard are required. */

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
  product: PhysicalGoldProduct;
  onClick: () => void;
}> = ({ product, onClick }) => {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [product.imageUrl]);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white text-left transition duration-200 hover:border-amber-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      aria-label={`View ${product.productName}`}
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-stone-100 bg-stone-50 p-2.5 sm:aspect-square sm:p-3">
        {product.imageUrl && !imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <Package className="h-12 w-12 text-stone-300" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <span className="mb-1 truncate text-xs font-medium uppercase tracking-wider text-amber-800 sm:text-xs">
          {product.categoryName || "Collection"}
        </span>
        <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] break-words text-sm font-semibold leading-5 text-stone-900">
          {product.productName}
        </h4>
        <p className="mt-auto break-words text-sm font-semibold text-stone-900 sm:text-base">
          {displayPrice(product.priceRange)}
        </p>
        <span className="mt-3 flex min-h-10 items-center justify-center rounded-lg border-t border-stone-100 px-2 py-2 text-xs font-medium text-stone-600 transition group-hover:text-amber-800">
          View details <span aria-hidden="true" className="ml-2">→</span>
        </span>
      </div>
    </button>
  );
};

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsTotalElements, setReviewsTotalElements] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsLast, setReviewsLast] = useState(true);
  const [reviewsRatingFilter, setReviewsRatingFilter] = useState<number | undefined>(undefined);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [tryOnMode, setTryOnMode] = useState<"select" | "ai" | "upload">("select");
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<GoldSilverRateBreakdown | null>(null);
  const [priceBreakdownLoading, setPriceBreakdownLoading] = useState(false);
  const [priceBreakdownError, setPriceBreakdownError] = useState<string | null>(null);
  const priceBreakdownRef = React.useRef<HTMLDivElement>(null);

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
      setQuantity(item ? item.quantity : 1);
    }
  }, [selectedVariant, cartItems]);

  const liked = product ? isInWishlist(product.id) : false;
  const tag = id ? getProductTag(id) : null;
  const rating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const reviewCount = reviewsTotalElements;

  const loadReviews = useCallback(async (page = 0, ratingFilter?: number, append = false) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await fetchProductRatings(id, {
        page,
        size: 10,
        ...(ratingFilter !== undefined && { rating: ratingFilter }),
      });
      setReviews((prev) => append ? [...prev, ...(res.content || [])] : (res.content || []));
      setReviewsTotalElements(res.totalElements || 0);
      setReviewsPage(page);
      setReviewsLast(res.last ?? true);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { product: p, variants: v } = await fetchProductVariants(id);
        setSelectedImageIndex(0);
        setQuantity(1);
        setProduct(p);
        setVariants(v);
        setShowDiscountModal(false);
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
              imageUrl: resolveS3ImageUrl(item.frontViewurl) || "",
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
              imageUrl: resolveS3ImageUrl(item.frontViewurl) || "",
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
    loadReviews(0);
  }, [id, loadReviews]);

  useEffect(() => {
    if (!selectedVariant?.id) return;
    let cancelled = false;
    setPriceBreakdownLoading(true);
    setPriceBreakdownError(null);
    fetchGoldSilverRateBreakdown(selectedVariant.id)
      .then((breakdown) => {
        if (!cancelled) setPriceBreakdown(breakdown);
      })
      .catch((error) => {
        if (!cancelled) {
          setPriceBreakdown(null);
          setPriceBreakdownError(error instanceof Error ? error.message : "Unable to load price breakdown.");
        }
      })
      .finally(() => {
        if (!cancelled) setPriceBreakdownLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedVariant?.id]);

  useEffect(() => {
    if (!product || !priceBreakdown) return;
    if ((priceBreakdown.discountAmount ?? 0) <= 0) return;
    const timer = window.setTimeout(() => setShowDiscountModal(true), 600);
    return () => window.clearTimeout(timer);
  }, [product?.id, priceBreakdown]);

  const purities = useMemo(
    () => Array.from(new Set(variants.map((v) => v.purity))),
    [variants]
  );

  const weights = useMemo(() => {
    const filtered = variants.filter((v) => v.purity === selectedPurity);
    return Array.from(new Set(filtered.map((v) => v.weight.toString())));
  }, [variants, selectedPurity]);

  const sizes = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .filter(
            (v) =>
              v.purity === selectedPurity &&
              v.weight.toString() === selectedWeight &&
              v.size
          )
          .map((v) => v.size || "")
      )
    );
  }, [variants, selectedPurity, selectedWeight]);


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
    if (!TokenManager.getInstance().isLoggedIn()) {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (product && selectedVariant) {
      try {
        await addToCart(product, selectedVariant);
        setInCart(true);
      } catch (err) {
        if (err instanceof ProfileIncompleteError) {
          navigate(`/physical-gold/profile?tab=info&returnTo=${encodeURIComponent(location.pathname + location.search)}`);
        }
      }
    }
  }, [addToCart, product, selectedVariant, navigate, location]);

  const handleBuyNow = useCallback(async () => {
    if (!TokenManager.getInstance().isLoggedIn()) {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (product && selectedVariant) {
      try {
        await addToCart(product, selectedVariant);
        navigate("/physical-gold/cart");
      } catch (err) {
        if (err instanceof ProfileIncompleteError) {
          navigate(`/physical-gold/profile?tab=info&returnTo=${encodeURIComponent(location.pathname + location.search)}`);
        }
      }
    }
  }, [addToCart, product, selectedVariant, navigate, location]);

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
      setAiError(err instanceof Error && err.message ? err.message : "Unable to generate image. Please try again.");
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
  // Category is passed from the listing page. Use it for all metal-specific copy so
  // Silver products never inherit the Gold defaults used by older products.
  const isSilverProduct = [categoryName, product.categoryName, finalCategoryName]
    .filter(Boolean)
    .some((name) => /silver/i.test(String(name)));
  const metalName = isSilverProduct ? "Silver" : "Gold";
  const itemPrice = Number(selectedVariant.price) || 0;
  const mrp = Number(selectedVariant.mrp) || 0;
  const mrpDiscount = mrp > itemPrice ? mrp - itemPrice : 0;
  const apiDiscountAmount = priceBreakdown?.discountAmount ?? 0;
  const apiDiscountPercentage = priceBreakdown?.discountPercentage ?? 0;
  const formatMetalOption = (purity: string) =>
    new RegExp(metalName, "i").test(purity) ? purity : `${purity} ${isSilverProduct ? "Silver" : "Yellow Gold"}`;

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 pb-8 pt-26 md:pt-32 lg:pt-36">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Breadcrumb — solid white bg, always visible ── */}
          <nav className="flex items-center flex-wrap gap-1 text-[14px] font-semibold text-[#8A8A8A] mb-3 bg-white">
            <button
              onClick={() => navigate(  "/physical-gold")}
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
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-5 lg:gap-7 items-start">

            {/* Left: Image Gallery */}
            <div className="min-w-0 space-y-3 md:sticky md:top-24">
              <div className="relative mr-auto aspect-square w-full max-w-[460px] rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 p-3 sm:p-4">
                <img
                  src={productImages[selectedImageIndex] || ""}
                  alt={product.productName}
                  className="w-full h-full object-contain"
                />
                {tag && (
                  <span className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-md bg-[#C29B27] text-white">
                    {tag}
                  </span>
                )}
                {/* Wishlist button — semi-rounded, white bg */}
                <button
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => product && toggleWishlist(product)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-[#E8E2D8] shadow-sm transition-colors ${liked ? "text-[#C29B27]" : "text-[#8A8A8A] hover:text-[#C29B27]"
                    }`}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 justify-start">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      aria-label={`View product image ${i + 1}`}
                      aria-pressed={selectedImageIndex === i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`shrink-0 w-16 h-16 p-1 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === i
                        ? "border-[#C29B27]"
                        : "border-[#E8E2D8] bg-white"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="min-w-0 flex flex-col gap-3">

              {/* Category · Subcategory */}
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8A8A]">
                {finalCategoryName} · {finalSubCategoryName || "COLLECTION"}
              </p>

              {/* Title + Stars */}
              <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-[#1A1A1A] leading-snug mb-1.5">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= Math.round(rating) ? "#C29B27" : "none"}
                        stroke={s <= Math.round(rating) ? "#C29B27" : "#D1C7BB"}
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#8A8A8A]">
                    {reviewCount > 0 ? `${rating} (${reviewCount} reviews)` : "No reviews yet"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-[26px] font-bold text-[#C29B27] leading-none">
                  ₹{selectedVariant.price.toLocaleString("en-IN")}
                </span>
                {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] text-[#8A8A8A] line-through">
                      ₹{selectedVariant.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold tracking-wide uppercase text-green-700 px-1.5 py-0.5 bg-green-50 rounded">
                      {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
                    </span>
                  </div>
                )}
                {apiDiscountAmount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Tag size={11} /> {apiDiscountPercentage > 0 ? `${apiDiscountPercentage}% discount applied` : 'Discount applied'}
                  </span>
                )}
              </div>

              {/* <button
                type="button"
                onClick={() => priceBreakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#C29B27]/35 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#9B7416] transition-colors hover:bg-amber-100"
              >
                View Price Breakdown ↓
              </button> */}

              {/* Inline badges */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C29B27] bg-amber-50 border border-[#C29B27]/25 px-2.5 py-1 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#C29B27] inline-flex items-center justify-center flex-shrink-0">
                    <span className="w-1 h-1 bg-[#C29B27] rounded-full block" />
                  </span>
                  {selectedVariant.purity}
                  {/* {metalName} */}
                  {" "} Hallmarked
                </span>
                <span className="text-xs font-semibold text-[#6B6B6B] bg-[#F5F0E8] px-2.5 py-1 rounded-md border border-[#E8E2D8]">
                  Weight: {selectedVariant.weight}g
                </span>
              </div>

              {/* Variant selectors — compact spacing, matching the badges above */}
              <div className="flex flex-wrap items-end gap-x-2 gap-y-5 sm:gap-x-2.5">
                {/* Metal Type */}
                <div className="min-w-0 max-w-full flex-none">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A]">
                    Metal Type
                  </p>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {purities.length > 0
                      ? purities.map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setSelectedPurity(p);
                            const fw = variants.find((vn) => vn.purity === p)?.weight.toString() || "";
                            setSelectedWeight(fw);
                            setSelectedSize(variants.find(vn => vn.purity === p)?.size || "");
                          }}
                          className={`min-h-11 max-w-full rounded-lg border px-3 py-2 text-xs font-semibold leading-tight transition-all ${selectedPurity === p
                            ? "border-[#C29B27] bg-amber-50 text-[#C29B27]"
                            : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                            }`}
                        >
                          <span className="break-words">{formatMetalOption(p)}</span>
                        </button>
                      ))
                      : (isSilverProduct ? ["925 Silver"] : ["22K Yellow Gold", "22K Rose Gold", "18K White Gold"]).map((label, idx) => (
                        <button
                          key={label}
                          className={`min-h-11 max-w-full rounded-lg border px-3 py-2 text-xs font-semibold leading-tight transition-all ${idx === 0
                            ? "border-[#C29B27] bg-amber-50 text-[#C29B27]"
                            : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                            }`}
                        >
                          <span className="break-words">{label}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Weight */}
                {/* <div className="min-w-0 max-w-full flex-none">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A]">
                    Weight
                  </p>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {weights.length > 0
                      ? weights.map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            setSelectedWeight(w);
                            setSelectedSize(variants.find(v => v.purity === selectedPurity && v.weight.toString() === w)?.size || "");
                          }}
                          className={`min-h-11 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${selectedWeight === w
                            ? "border-[#C29B27] bg-amber-50 text-[#C29B27]"
                            : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                            }`}
                        >
                          {w} g
                        </button>
                      ))
                      : ["Light", "Medium", "Heavy"].map((label, idx) => (
                        <button
                          key={label}
                          className={`min-h-11 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${idx === 1
                            ? "border-[#C29B27] bg-amber-50 text-[#C29B27]"
                            : "border-[#E8E2D8] bg-white text-[#6B6B6B] hover:border-[#C29B27]/50 hover:text-[#C29B27]"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                </div> */}

                {/* Size */}
                {sizes.length > 0 && (
                  <label className="min-w-0 w-[150px] max-w-full flex-none text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] sm:w-[170px]">
                    Size
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="mt-2 block h-11 w-full min-w-0 rounded-lg border border-[#E8E2D8] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#1A1A1A] outline-none transition focus:border-[#C29B27] focus:ring-2 focus:ring-[#C29B27]/10"
                    >
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size || "Standard"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {/* Purchase actions */}
              <div className="flex flex-col gap-3 mt-2">
                {!inCart ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      disabled={selectedVariant.stockQuantity === 0}
                      className="flex-1 h-[46px] flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold uppercase tracking-[0.08em] bg-[#C29B27] hover:bg-[#A88820] disabled:opacity-50 text-white transition-all transform active:scale-[0.98]"
                    >
                      <ShoppingCart size={15} />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={selectedVariant.stockQuantity === 0}
                      className="flex-1 h-[46px] flex items-center justify-center rounded-lg text-[13px] font-semibold uppercase tracking-[0.08em] border border-[#C29B27] text-[#C29B27] bg-white hover:bg-amber-50 transition-all transform active:scale-[0.98]"
                    >
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <div className="flex-1 inline-flex items-center justify-between rounded-lg border border-[#C29B27] bg-amber-50/30 overflow-hidden h-[46px]">
                      <button
                        aria-label="Decrease quantity"
                        onClick={handleDecrement}
                        className="w-12 h-full flex items-center justify-center text-[#C29B27] hover:bg-[#C29B27] hover:text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-[14px] font-semibold text-[#1A1A1A]">
                        {quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={handleIncrement}
                        className="w-12 h-full flex items-center justify-center text-[#C29B27] hover:bg-[#C29B27] hover:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => navigate("/physical-gold/cart")}
                      className="flex-[1.5] h-[46px] flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold uppercase tracking-[0.08em] bg-[#1A1A1A] text-white hover:bg-black transition-all transform active:scale-[0.98]"
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Virtual Try-On</p>
                      <p className="text-xs text-[#8A8A8A] font-medium">See how it looks before you buy</p>
                    </div>
                  </div>
                  {isTryOnOpen ? (
                    <button
                      onClick={() => { setIsTryOnOpen(false); setTryOnMode("select"); setAiGeneratedImage(null); setAiError(null); }}
                      className="text-xs font-bold text-[#8A8A8A] bg-[#F5F0E8] px-3 py-1 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors uppercase tracking-wide"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTryOnOpen(true)}
                      className="text-xs font-bold text-[#C29B27] bg-amber-50 px-3 py-1.5 rounded-full border border-[#C29B27]/25 uppercase tracking-widest hover:bg-[#C29B27] hover:text-white transition-all"
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
                            <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-0.5">AI Model Preview</p>
                            <p className="text-xs text-[#8A8A8A] leading-snug">See this jewellery on an AI-generated model instantly</p>
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
                            <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-0.5">Try on Your Photo</p>
                            <p className="text-xs text-[#8A8A8A] leading-snug">Upload a photo or use your camera to try it on yourself</p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Mode: AI Generation */}
                    {tryOnMode === "ai" && (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() => setTryOnMode("select")}
                          className="self-start flex items-center gap-1 text-xs font-bold text-[#8A8A8A] hover:text-[#C29B27] transition-colors uppercase tracking-wide"
                        >
                          ← Back
                        </button>

                        <div className="w-full flex flex-col items-center gap-4 py-4">
                          {/* Preview of product image that will be used */}
                          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#C29B27]/30 bg-[#F5F0E8]">
                            <img src={productImages[selectedImageIndex] || productImages[0]} alt="Product" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-center">
                            <p className="text-[12px] font-bold text-[#1A1A1A] mb-1">Generate AI Model Preview</p>
                            <p className="text-xs text-[#8A8A8A] max-w-[240px] leading-relaxed">
                              Our AI will create a realistic preview of this jewellery on a model. This takes just a few seconds.
                            </p>
                          </div>
                          <button
                            onClick={handleGenerateAIImage}
                            className="px-8 py-3 rounded-full bg-[#C29B27] text-white font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
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
                          className="self-start flex items-center gap-1 text-xs font-bold text-[#8A8A8A] hover:text-[#C29B27] transition-colors uppercase tracking-wide"
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
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleCloseCamera}
                                className="px-6 py-2.5 rounded-full border-2 border-[#E8E2D8] text-[#8A8A8A] text-xs font-bold hover:bg-[#F5F2EE] transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCapturePhoto}
                                className="px-8 py-2.5 rounded-full bg-[#C29B27] text-white font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
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
                              <p className="text-xs text-[#8A8A8A] max-w-[240px] leading-relaxed">
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
                                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Upload Photo</span>
                                <span className="text-xs text-[#8A8A8A]">From your device</span>
                              </label>
                              <button
                                onClick={handleOpenCamera}
                                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#C29B27]/50 hover:bg-amber-50/30 transition-all group"
                              >
                                <Camera size={20} className="text-[#C29B27]" />
                                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Open Camera</span>
                                <span className="text-xs text-[#8A8A8A]">Take a photo now</span>
                              </button>
                            </div>

                            {userPhoto && (
                              <div className="w-full max-w-[280px] space-y-3">
                                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-[#C29B27] shadow-sm">
                                  <img src={userPhoto} alt="Your photo" className="w-full h-full object-contain" />
                                </div>
                                <button
                                  onClick={handleGenerateVirtualTryOn}
                                  className="w-full px-6 py-3 rounded-full bg-[#C29B27] text-white font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95 transition-transform"
                                >
                                  Generate Try-On
                                </button>
                              </div>
                            )}

                            <p className="text-xs text-[#8A8A8A] text-center max-w-[220px] leading-relaxed mt-1">
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
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] hover:text-[#C29B27] transition-colors w-fit"
                >
                  <Share2 size={11} />
                  Share this product
                </button>

                {isShareMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-[#E8E2D8] p-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => handleShareOption('whatsapp')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareOption('twitter')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShareOption('copy')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] rounded-md transition-colors"
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
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, title: "BIS Hallmarked" },
                  { icon: Truck, title: "Free Insured Delivery" },
                  // { icon: RefreshCw, title: "15-Day Returns" },
                ].map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="flex flex-col items-center text-center gap-1.5 py-2.5 px-1.5 rounded-lg bg-[#FDFAF4] border border-[#E8E2D8]"
                  >
                    <div className="w-6 h-6 rounded-md bg-white border border-[#E8E2D8] flex items-center justify-center">
                      <Icon size={12} className="text-[#C29B27]" />
                    </div>
                    <span className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide leading-tight">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-6">
            <div className="flex border-b border-[#E8E2D8] gap-6 overflow-x-auto no-scrollbar">
              {["Product Details", "Reviews", "Shipping & Returns"].map((label) => {
                const tabId = label.toLowerCase().split(" ")[0];
                const isActive = activeTab === tabId;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveTab(tabId)}
                    className={`pb-2.5 pt-3 text-xs font-semibold uppercase tracking-wide relative whitespace-nowrap transition-colors ${isActive ? "text-[#1A1A1A]" : "text-[#8A8A8A] hover:text-[#1A1A1A]"
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

            <div className="pt-4">
              {activeTab === "product" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    {[
                      { label: "Metal", value: metalName },
                      { label: "Purity", value: selectedVariant.purity },
                      { label: "Weight", value: `${selectedVariant.weight}g` },
                      { label: "Finish", value: "High Polish" },
                      { label: "Occasion", value: "Wedding, Party, Daily" },
                      { label: "Collection", value: "Heritage 2026" },
                    ].map(({ label, value }) => (
                      <div key={label} className="grid grid-cols-2 py-2.5 border-b border-[#F0EBE1]">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
                          {label}
                        </span>
                        <span className="text-[12px] font-bold text-[#1A1A1A]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-2">Description</h4>
                    <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
                      {product.description ||
                        `This exquisite ${product.productName} is handcrafted by skilled artisans using ${selectedVariant.purity} hallmarked ${metalName.toLowerCase()}. Weighing ${selectedVariant.weight}g, this piece combines traditional craftsmanship with contemporary design, making it perfect for both festive occasions and everyday elegance.`}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-xl">
                  {/* Summary */}
                  <div className="inline-flex items-center gap-3 mb-5 p-3.5 bg-white rounded-xl border border-[#F0EBE1]">
                    <div className="text-2xl font-bold text-[#1A1A1A]">{rating || "—"}</div>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= Math.round(rating) ? "#C29B27" : "none"} stroke={s <= Math.round(rating) ? "#C29B27" : "#D1C7BB"} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-[#8A8A8A] uppercase tracking-widest">
                        Based on {reviewCount} reviews
                      </p>
                    </div>
                  </div>

                  {/* Rating filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[undefined, 5, 4, 3, 2, 1].map((r) => (
                      <button
                        key={r ?? "all"}
                        onClick={() => {
                          setReviewsRatingFilter(r);
                          loadReviews(0, r);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${reviewsRatingFilter === r
                          ? "bg-[#C29B27] text-white border-[#C29B27]"
                          : "bg-white text-[#6B6B6B] border-[#E8E2D8] hover:border-[#C29B27]/50"
                          }`}
                      >
                        {r === undefined ? "All" : `${r} ★`}
                      </button>
                    ))}
                  </div>

                  {/* Reviews list */}
                  {reviewsLoading && reviews.length === 0 ? (
                    <div className="flex items-center gap-2 py-8 text-[#8A8A8A]">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      <span className="text-[12px]">Loading reviews...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-[12px] text-[#8A8A8A] py-8">No reviews yet for this product.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b border-[#F0EBE1]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A1A] text-[12px]">{review.userFullName || "Customer"}</span>
                              {review.verifiedPurchase && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                              )}
                            </div>
                            <span className="text-xs text-[#8A8A8A]">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={10} fill={s <= review.rating ? "#C29B27" : "none"} stroke={s <= review.rating ? "#C29B27" : "#D1C7BB"} />
                            ))}
                          </div>
                          {review.title && <p className="text-[12px] font-semibold text-[#1A1A1A] mb-0.5">{review.title}</p>}
                          <p className="text-xs text-[#6B6B6B] leading-relaxed">{review.reviewText}</p>
                          {review.media?.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {review.media.map((m: any) => (
                                m.mediaType === "IMAGE" ? (
                                  <img key={m.id} src={m.mediaUrl} alt="review" className="h-16 w-16 rounded-lg object-cover border border-[#E8E2D8]" />
                                ) : null
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {!reviewsLast && (
                        <button
                          onClick={() => loadReviews(reviewsPage + 1, reviewsRatingFilter, true)}
                          disabled={reviewsLoading}
                          className="mt-2 px-5 py-2 rounded-lg border border-[#E8E2D8] text-xs font-bold text-[#C29B27] hover:bg-amber-50 transition disabled:opacity-50"
                        >
                          {reviewsLoading ? "Loading..." : "Load more reviews"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Truck, title: "Free Shipping", desc: "Complimentary insured shipping on all orders above ₹50,000 across India." },
                    { icon: Shield, title: "Insured Delivery", desc: "Your jewelry is 100% insured until it reaches your doorstep." },
                    // { icon: RefreshCw, title: "15-Day Returns", desc: "Return within 15 days for a full refund or exchange if not satisfied." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[#E8E2D8] bg-white space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <item.icon size={15} className="text-[#C29B27]" />
                      </div>
                      <h5 className="text-[13px] font-bold text-[#1A1A1A]">{item.title}</h5>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section ref={priceBreakdownRef} className="mx-auto mt-6 w-full max-w-3xl scroll-mt-24 rounded-2xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className={`flex items-start border-b px-5 py-4 ${isSilverProduct ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSilverProduct ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-[#9B7416]"}`}>
                  <Gem size={20} />
                </span>
                <div>
                  <h2 id="price-breakdown-title" className="text-base font-bold text-[#1A1A1A]">Price Breakup</h2>
                  <p className="text-xs text-[#6B6B6B]">{metalName} · {selectedVariant.purity} · {selectedVariant.weight}g</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {priceBreakdownLoading ? (
                <p className="py-8 text-center text-sm text-[#6B6B6B]">Loading price breakdown…</p>
              ) : priceBreakdown ? (
                <div className="overflow-hidden rounded-xl border border-[#E8E2D8]">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9F7F4] text-left text-[11px] font-bold uppercase tracking-wide text-[#4A4A4A]">
                      <tr><th className="px-3 py-3">Component</th><th className="px-3 py-3 text-right">Rate</th><th className="px-3 py-3 text-right">Weight</th><th className="px-3 py-3 text-right">Amount</th></tr>
                    </thead>
                    <tbody className="text-[#4A4A4A]">
                      <tr className="border-t border-[#F0EBE1]">
                        <td className="px-3 py-3 font-semibold">{metalName} ({selectedVariant.purity})</td>
                        <td className="px-3 py-3 text-right">{selectedVariant.weight > 0 ? `₹${(priceBreakdown.variantPrice / selectedVariant.weight).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}</td>
                        <td className="px-3 py-3 text-right">{selectedVariant.weight}g</td>
                        <td className="px-3 py-3 text-right font-semibold">₹{priceBreakdown.variantPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                      </tr>
                      {priceBreakdown.makingPercentage > 0 && (
                        <tr className="border-t border-[#F0EBE1]">
                          <td className="px-3 py-3">Making charges ({priceBreakdown.makingPercentage}%)</td>
                          <td className="px-3 py-3 text-right">−</td><td className="px-3 py-3 text-right">−</td>
                          <td className="px-3 py-3 text-right">₹{priceBreakdown.makingAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr className="border-t border-[#F0EBE1]">
                        <td className="px-3 py-3">GST ({priceBreakdown.gstPercentage}%)</td>
                        <td className="px-3 py-3 text-right">−</td><td className="px-3 py-3 text-right">−</td>
                        <td className="px-3 py-3 text-right">₹{priceBreakdown.gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                      </tr>
                      {priceBreakdown.discountAmount > 0 && (
                        <tr className="border-t border-[#F0EBE1] bg-emerald-50/60 text-emerald-700">
                          <td className="px-3 py-3 font-semibold flex items-center gap-1.5">
                            <Tag size={13} className="inline-block" />
                            Discount{priceBreakdown.discountPercentage > 0 ? ` (${priceBreakdown.discountPercentage}%)` : ""}
                          </td>
                          <td className="px-3 py-3 text-right">−</td>
                          <td className="px-3 py-3 text-right">−</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-700">−₹{priceBreakdown.discountAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className={isSilverProduct ? "bg-slate-50" : "bg-amber-50"}>
                      <tr><td className="px-3 py-3 text-base font-bold text-[#1A1A1A]" colSpan={3}>Grand Total</td><td className="px-3 py-3 text-right text-base font-bold text-[#1A1A1A]">₹{(priceBreakdown.finalAmount ?? priceBreakdown.totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td></tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-rose-600">{priceBreakdownError || "Unable to load price breakdown."}</p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-[#4A4A4A]">Price breakup is loaded from the Gold and Silver live rates.</p>
            </div>
          </section>

          {/* ── Similar Products ── */}
          {similarProducts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-4">Similar Products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr gap-3 sm:gap-3">
                {similarProducts.map((p) => (
                  <CompactProductCard
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
            <div className="mt-6">
              <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-4">Explore More</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr gap-3 sm:gap-3">
                {exploreMoreProducts.slice(0, 8).map((p) => (
                  <CompactProductCard
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
              <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-4">You May Also Like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr gap-3 sm:gap-3">
                {relatedProducts.map((p) => (
                  <CompactProductCard
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

      {showDiscountModal && apiDiscountAmount > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="discount-title" onMouseDown={() => setShowDiscountModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-sm overflow-hidden rounded-[28px] bg-gradient-to-b p-8 text-center shadow-2xl ring-1 ${
              isSilverProduct
                ? "from-slate-50 via-white to-slate-50 ring-slate-200/60"
                : "from-amber-50 via-white to-amber-50 ring-amber-200/60"
            }`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* ambient glow */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl ${
                isSilverProduct ? "bg-slate-200/60" : "bg-amber-200/50"
              }`}
            />
            <motion.span
              animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`absolute left-8 top-6 ${ isSilverProduct ? "text-slate-400" : "text-amber-300" }`}
            >
              <Sparkles size={18} />
            </motion.span>

            <button
              type="button"
              onClick={() => setShowDiscountModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A8A8A] hover:bg-[#F5F2EE] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="relative">
              {/* Icon — Tag instead of Gem/Diamond */}
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${
                isSilverProduct
                  ? "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-200"
                  : "bg-gradient-to-br from-[#C29B27] to-[#9B7416] text-white shadow-amber-200"
              }`}>
                <Tag size={26} />
              </div>

              <span className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                isSilverProduct
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}>
                <CheckCircle2 size={11} /> Limited-Time Discount
              </span>

              <h2
                id="discount-title"
                className={`text-xl font-extrabold ${ isSilverProduct ? "text-slate-700" : "text-[#8B6914]" }`}
              >
                Exclusive {metalName} Offer
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4A4A]">
                A special discount has been applied to this item. Check the price breakup below to see your saving.
              </p>

              {/* Savings badge */}
              <div className="my-5 flex justify-center gap-2 flex-wrap">
                {apiDiscountPercentage > 0 && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    isSilverProduct ? "border-slate-200 bg-slate-50 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}>
                    <Tag size={11} /> {apiDiscountPercentage}% OFF
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  isSilverProduct ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  <CheckCircle2 size={11} /> ₹{apiDiscountAmount.toLocaleString("en-IN")} saved
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDiscountModal(false);
                  priceBreakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full rounded-full py-3 font-semibold text-white shadow-lg transition hover:opacity-90 ${
                  isSilverProduct
                    ? "bg-gradient-to-r from-slate-500 to-slate-700 shadow-slate-200"
                    : "bg-gradient-to-r from-[#C29B27] to-[#9B7416] shadow-amber-200"
                }`}
              >
                View Price Breakup
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
