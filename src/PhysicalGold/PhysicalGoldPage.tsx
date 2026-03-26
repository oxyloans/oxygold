import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  Heart,
  IndianRupee,
  Package,
  ShoppingCart,
  X,
  ZoomIn,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import PhysicalGoldHeader from "./PhysicalGoldHeader";
import { Category, SubCategory, PhysicalGoldProduct, ProductVariant } from "./physicalGoldData";
import {
  fetchMainCategories,
  fetchSubCategories,
  fetchProducts,
  fetchProductVariants,
  fetchProductImageURLs,
} from "./physicalGoldService";
import { useCart } from "./CartContext";

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-zinc-100 animate-pulse">
    <div className="h-52 bg-gradient-to-br from-zinc-100 to-zinc-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-zinc-100 rounded-full w-3/4" />
      <div className="h-2.5 bg-zinc-100 rounded-full w-full" />
      <div className="h-2.5 bg-zinc-100 rounded-full w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-zinc-100 rounded-full w-1/3" />
        <div className="h-8 bg-zinc-100 rounded-full w-24" />
      </div>
    </div>
  </div>
);

// ─── Image Magnifier (reused from ProductDetailsPage) ─────────────────────────
const ImageMagnifier = ({ src, alt }: { src: string; alt: string }) => {
  const [show, setShow] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[iw, ih], setSize] = useState([0, 0]);
  const mag = 150;
  const zoom = 2;
  return (
    <div
      className="relative h-full w-full overflow-hidden cursor-crosshair"
      onMouseEnter={(e) => {
        const { width, height } = e.currentTarget.getBoundingClientRect();
        setSize([width, height]);
        setShow(true);
      }}
      onMouseMove={(e) => {
        const { top, left } = e.currentTarget.getBoundingClientRect();
        setXY([e.pageX - left - window.pageXOffset, e.pageY - top - window.pageYOffset]);
      }}
      onMouseLeave={() => setShow(false)}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {show && (
        <div
          className="pointer-events-none absolute rounded-full border border-white/30 shadow-2xl"
          style={{
            height: mag, width: mag,
            top: y - mag / 2, left: x - mag / 2,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${iw * zoom}px ${ih * zoom}px`,
            backgroundPosition: `${-x * zoom + mag / 2}px ${-y * zoom + mag / 2}px`,
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};

// ─── Inline Product Details Panel ─────────────────────────────────────────────
interface PanelProps {
  productId: string;
  onClose?: () => void;
  fullWidth?: boolean;
}

const ProductPanel: React.FC<PanelProps> = ({ productId, onClose, fullWidth = false }) => {
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const [product, setProduct] = useState<PhysicalGoldProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedPurity, setSelectedPurity] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const priceBreakdownRef = useRef<HTMLDivElement>(null);

  const defaultImg = "https://images.unsplash.com/photo-1610664921890-ebad0c071814?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    setLoading(true);
    fetchProductVariants(productId).then(({ product: p, variants: v }) => {
      setProduct(p);
      setVariants(v);
      if (v.length > 0) {
        setSelectedPurity(v[0].purity);
        setSelectedWeight(v[0].weight.toString());
        setSelectedSize(v[0].size || "");
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [productId]);

  const purities = useMemo(() => Array.from(new Set(variants.map(v => v.purity))), [variants]);
  const weights = useMemo(() => {
    const f = variants.filter(v => v.purity === selectedPurity);
    return Array.from(new Set(f.map(v => v.weight.toString())));
  }, [variants, selectedPurity]);
  const sizes = useMemo(() => {
    const f = variants.filter(v => v.purity === selectedPurity && v.weight.toString() === selectedWeight);
    return Array.from(new Set(f.map(v => v.size || ""))).filter(Boolean);
  }, [variants, selectedPurity, selectedWeight]);

  const selected = useMemo(() =>
    variants.find(v => v.purity === selectedPurity && v.weight.toString() === selectedWeight && (v.size || "") === selectedSize)
    || variants.find(v => v.purity === selectedPurity && v.weight.toString() === selectedWeight)
    || variants[0],
    [variants, selectedPurity, selectedWeight, selectedSize]
  );

  const cartItem = cartItems.find((i: any) => selected && i.variant.id === selected.id);
  const scrollToBreakdown = () => {
    priceBreakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Full-width layout (for View Details)
  if (fullWidth) {
    return (
      <div className="bg-white">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-96 rounded-2xl bg-zinc-100 animate-pulse" />
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
              <div className="h-3 bg-zinc-100 rounded-full w-full" />
            </div>
          </div>
        ) : !product || !selected ? (
          <div className="flex flex-col items-center justify-center gap-3 text-zinc-400 p-20">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm font-semibold">No variants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8 max-w-6xl mx-auto items-center">
            {/* LEFT: Image */}
            <div className="space-y-4">
              <div className="relative overflow-hidden w-full h-[450px] rounded-2xl border border-zinc-100 shadow-sm bg-zinc-50">
                <ImageMagnifier src={selected.imageUrl || product.imageUrl || defaultImg} alt={product.productName} />
                {selected.stockQuantity > 0 && selected.stockQuantity < 5 && (
                  <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    Only {selected.stockQuantity} Left!
                  </span>
                )}
                {selected.stockQuantity === 0 && (
                  <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    Out of Stock
                  </span>
                )}
                <span className="absolute top-4 right-4 bg-[#2b0a59]/80 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
                  <ZoomIn className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Hover to Zoom
                </span>
              </div>
            </div>

            {/* RIGHT: Details */}
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black tracking-widest uppercase mb-2">
                    {product.status || "PREMIUM"} EDITION
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 leading-tight font-display">{product.productName}</h2>
                  {product.description && (
                    <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{product.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setWishlist(w => !w)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${wishlist ? "text-rose-500 bg-rose-50" : "text-zinc-300 hover:text-rose-400 hover:bg-rose-50"}`}
                >
                  <Heart className="h-5 w-5" fill={wishlist ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Price */}
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl font-black text-zinc-900">
                    ₹{selected.price.toLocaleString("en-IN")}
                  </span>
                  {selected.mrp && selected.mrp > selected.price && (
                    <span className="text-lg text-zinc-400 line-through">
                      ₹{selected.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inclusive of all taxes</span>
                <button
                  onClick={scrollToBreakdown}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer border-b border-amber-500/30 pb-0.5"
                >
                  View detailed price breakdown ↓
                </button>
              </div>

              {/* Variant Selectors */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Purity */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Purity</label>
                    <div className="relative">
                      <select
                        value={selectedPurity}
                        onChange={e => {
                          setSelectedPurity(e.target.value);
                          const fw = variants.find(v => v.purity === e.target.value)?.weight.toString() || "";
                          setSelectedWeight(fw);
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 appearance-none outline-none cursor-pointer hover:border-amber-300 shadow-sm transition"
                      >
                        {purities.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Weight</label>
                    <div className="relative">
                      <select
                        value={selectedWeight}
                        onChange={e => setSelectedWeight(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 appearance-none outline-none cursor-pointer hover:border-amber-300 shadow-sm transition"
                      >
                        {weights.map(w => <option key={w} value={w}>{w}g</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Size */}
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${selectedSize === s
                            ? "bg-[#2b0a59] text-white border-[#2b0a59] shadow-lg shadow-purple-500/20"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-amber-300"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons - Fixed Height Sync */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {cartItem ? (
                  <div className="flex items-center justify-between bg-white rounded-xl border border-zinc-200 h-11 px-3 shadow-sm">
                    <button
                      onClick={() => decrementQuantity(selected.id, cartItem.cartId)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold cursor-pointer transition"
                    >
                      −
                    </button>
                    <span className="text-sm font-black text-zinc-900">{cartItem.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(selected.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product, selected)}
                    disabled={selected.stockQuantity === 0}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-[#2b0a59] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#150b33] transition shadow-lg shadow-[#2b0a59]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                )}
                <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black text-zinc-600 uppercase tracking-wider border border-zinc-200 bg-white hover:bg-zinc-50 transition shadow-sm cursor-pointer">
                  Virtual Try On
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown Table - Full Width at Bottom */}
        {!loading && product && selected && (
          <div ref={priceBreakdownRef} className="border-t border-zinc-100 bg-zinc-50/50 p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Price Breakdown
              </h3>
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50 text-zinc-400 font-black uppercase tracking-wider">
                      <th className="text-left p-4">Component</th>
                      <th className="text-right p-4">Rate/Value</th>
                      <th className="text-right p-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-600 font-semibold">
                    <tr className="border-b border-zinc-50">
                      <td className="p-4">Gold ({selected.purity})</td>
                      <td className="p-4 text-right">₹{selected.price.toLocaleString("en-IN")}</td>
                      <td className="p-4 text-right text-zinc-900 font-bold">₹{selected.price.toLocaleString("en-IN")}</td>
                    </tr>
                    {product.makingPercentage && (
                      <tr className="border-b border-zinc-50">
                        <td className="p-4 text-zinc-400 italic">Making Charges</td>
                        <td className="p-4 text-right text-zinc-400">Included</td>
                        <td className="p-4 text-right text-zinc-400">Included</td>
                      </tr>
                    )}
                    <tr className="border-b border-zinc-50">
                      <td className="p-4">GST ({product.gstPercentage || 3}%)</td>
                      <td className="p-4 text-right">
                        {product.gstPercentage || 3}% of base
                      </td>
                      <td className="p-4 text-right font-bold">
                        ₹{Math.round(selected.price * (product.gstPercentage || 3) / 100).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-50/50 font-black text-zinc-900">
                      <td className="p-4 text-base">Grand Total</td>
                      <td className="p-4" />
                      <td className="p-4 text-right text-xl text-amber-700">
                        ₹{Math.round(selected.price * (1 + (product.gstPercentage || 3) / 100)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Side panel layout (for Quick View)
  return (
    <div className="flex flex-col h-full bg-[#FDFAF5]">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-100 bg-white flex-shrink-0">
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
          Product Details
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWishlist(w => !w)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${wishlist ? "text-rose-500" : "text-zinc-300 hover:text-rose-400"}`}
          >
            <Heart className="h-4 w-4" fill={wishlist ? "currentColor" : "none"} />
          </button>
          {!!onClose && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div className="aspect-square rounded-2xl bg-zinc-100 animate-pulse" />
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
            <div className="h-3 bg-zinc-100 rounded-full w-full" />
            <div className="h-3 bg-zinc-100 rounded-full w-2/3" />
          </div>
        </div>
      ) : !product || !selected ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400 p-8">
          <Package className="h-10 w-10 opacity-30" />
          <p className="text-sm font-semibold">No variants found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Product Image */}
          <div className="relative overflow-hidden w-full h-[280px] bg-zinc-50 border-b border-zinc-100">
            <ImageMagnifier src={selected.imageUrl || product.imageUrl || defaultImg} alt={product.productName} />
            {selected.stockQuantity > 0 && selected.stockQuantity < 5 && (
              <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Only {selected.stockQuantity} Left!
              </span>
            )}
            {selected.stockQuantity === 0 && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
            <span className="absolute top-3 right-3 bg-[#2b0a59]/80 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              <ZoomIn className="inline h-3 w-3 mr-0.5 -mt-0.5" />Zoom
            </span>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Product Name + Status */}
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[9px] font-black tracking-widest uppercase mb-1.5">
                {product.status || "PREMIUM"} EDITION
              </span>
              <h2 className="text-base font-bold text-zinc-900 leading-snug">{product.productName}</h2>
              {product.description && (
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Variant Selectors */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Purity */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Purity</label>
                <div className="relative">
                  <select
                    value={selectedPurity}
                    onChange={e => {
                      setSelectedPurity(e.target.value);
                      const fw = variants.find(v => v.purity === e.target.value)?.weight.toString() || "";
                      setSelectedWeight(fw);
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 appearance-none outline-none cursor-pointer hover:border-amber-300 shadow-sm transition"
                  >
                    {purities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Weight</label>
                <div className="relative">
                  <select
                    value={selectedWeight}
                    onChange={e => setSelectedWeight(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 appearance-none outline-none cursor-pointer hover:border-amber-300 shadow-sm transition"
                  >
                    {weights.map(w => <option key={w} value={w}>{w}g</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Size */}
              {sizes.length > 0 && (
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${selectedSize === s
                          ? "bg-[#2b0a59] text-white border-[#2b0a59]"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-amber-300"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-zinc-900">
                  ₹{selected.price.toLocaleString("en-IN")}
                </span>
                {selected.mrp && selected.mrp > selected.price && (
                  <span className="text-sm text-zinc-400 line-through">
                    ₹{selected.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inc. GST</span>

              {/* Price Breakdown Link */}
              <button
                onClick={scrollToBreakdown}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 cursor-pointer border-b border-amber-500/30 pb-0.5"
              >
                View Price Breakdown
              </button>
            </div>

            {/* CTA Buttons - Fixed Height Sync */}
            <div className="pb-4">
              <div className="grid grid-cols-2 gap-2.5">
                {cartItem ? (
                  <div className="flex items-center justify-between bg-white rounded-xl border border-zinc-200 h-11 px-3 shadow-sm">
                    <button
                      onClick={() => decrementQuantity(selected.id, cartItem.cartId)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold cursor-pointer transition"
                    >
                      −
                    </button>
                    <span className="text-[11px] font-black text-zinc-900">{cartItem.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(selected.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product, selected)}
                    disabled={selected.stockQuantity === 0}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-[#2b0a59] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#150b33] transition shadow-lg shadow-[#2b0a59]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                )}
                <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black text-zinc-600 uppercase tracking-wider border border-zinc-200 bg-white hover:bg-zinc-50 transition shadow-sm cursor-pointer">
                  Virtual Try On
                </button>
              </div>
            </div>

            <div ref={priceBreakdownRef} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm mb-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                Price Breakup
              </h3>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-black uppercase tracking-wider">
                    <th className="text-left pb-2">Component</th>
                    <th className="text-right pb-2">Value</th>
                    <th className="text-right pb-2">Final</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600 font-semibold">
                  <tr className="border-t border-zinc-50">
                    <td className="py-1.5">Gold ({selected.purity})</td>
                    <td className="py-1.5 text-right">₹{selected.price.toLocaleString("en-IN")}</td>
                    <td className="py-1.5 text-right text-zinc-900">₹{selected.price.toLocaleString("en-IN")}</td>
                  </tr>
                  {product.makingPercentage && (
                    <tr className="border-t border-zinc-50">
                      <td className="py-1.5 text-zinc-400 italic">Making Charges</td>
                      <td className="py-1.5 text-right text-zinc-400">Included</td>
                      <td className="py-1.5 text-right text-zinc-400">Included</td>
                    </tr>
                  )}
                  <tr className="border-t border-zinc-50">
                    <td className="py-1.5">GST ({product.gstPercentage || 3}%)</td>
                    <td className="py-1.5 text-right">
                      ₹{Math.round(selected.price * (product.gstPercentage || 3) / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="py-1.5 text-right">
                      ₹{Math.round(selected.price * (product.gstPercentage || 3) / 100).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200 font-black text-zinc-900">
                    <td className="pt-2.5">Grand Total</td>
                    <td />
                    <td className="pt-2.5 text-right text-amber-700">
                      ₹{Math.round(selected.price * (1 + (product.gstPercentage || 3) / 100)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page Component ───────────────────────────────────────────────────────
const PhysicalGoldPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<PhysicalGoldProduct[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const catScrollRef = useRef<HTMLDivElement>(null);

  const { totalItems } = useCart();
  const location = useLocation();

  // Auto-open product details (full view) when navigated from cart
  useEffect(() => {
    const state = location.state as { openProductId?: string } | null;
    if (state?.openProductId) {
      setDetailsProductId(state.openProductId);
      setShowDetailsView(true);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.productName.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
  }, [products, searchQuery]);

  const triggerSubCategorySelect = useCallback(async (subId: string) => {
    setSelectedSubCategoryId(subId);
    setLoadingProds(true);
    try {
      const data = await fetchProducts(subId);
      const productsWithImages = await Promise.all(
        data.map(async (p) => {
          if (p.imageUrl) return p;
          const urls = await fetchProductImageURLs(p.id);
          return { ...p, imageUrl: urls[0] || "" };
        })
      );
      setProducts(productsWithImages);
      setSelectedProductId(null);
      setDetailsProductId(null);
      setShowDetailsView(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProds(false);
    }
  }, []);

  const triggerCategorySelect = useCallback(async (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId("");
    setProducts([]);
    setSelectedProductId(null);
    setLoadingSubs(true);
    try {
      const data = await fetchSubCategories(catId);
      setSubCategories(data);
      if (data.length > 0) triggerSubCategorySelect(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(false);
    }
  }, [triggerSubCategorySelect]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const data = await fetchMainCategories();
        setCategories(data);
        if (data.length > 0) triggerCategorySelect(data[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [triggerCategorySelect]);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProductId(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        .product-grid-scroll::-webkit-scrollbar { width: 4px; }
        .product-grid-scroll::-webkit-scrollbar-track { background: transparent; }
        .product-grid-scroll::-webkit-scrollbar-thumb { background: rgba(180,130,30,0.25); border-radius: 999px; }
        .product-grid-scroll::-webkit-scrollbar-thumb:hover { background: rgba(180,130,30,0.5); }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(180,130,30,0.15); border-radius: 999px; }
        .panel-slide { animation: slideIn 0.28s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .card-animate { animation: cardFadeUp 0.4s ease both; }
        @keyframes cardFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Root: Unified Page Scroll */}
      <div className="min-h-screen flex flex-col bg-[#FBF8F3] overflow-hidden overflow-x-hidden">
        {/* ── Fixed Header ──────────────────────────────────────── */}
        <PhysicalGoldHeader
          cartItemCount={totalItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* ── Below Header ──────────────────────────────────────── */}
        <div className="flex flex-col flex-1 pt-[64px] sm:pt-[70px] overflow-hidden">

          {/* ── Category Carousel (Relative - scrolls with page) ── */}
          <div className="flex-shrink-0 relative bg-gradient-to-b from-white to-[#FDFBF7] border-b border-zinc-200/60 shadow-sm px-4 sm:px-6 lg:px-8 py-3">
            {loadingCats ? (
              <div className="flex justify-center gap-8 overflow-hidden max-w-screen-2xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3 animate-pulse">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm" />
                    <div className="h-2 w-12 bg-zinc-50 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative max-w-screen-2xl mx-auto">
                <div
                  ref={catScrollRef}
                  className="flex sm:justify-center items-center gap-6 sm:gap-12 overflow-x-auto scrollbar-hide pb-2 -mb-2 px-6"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => triggerCategorySelect(cat.id)}
                      className="flex-shrink-0 flex flex-col items-center gap-2.5 group/item cursor-pointer relative"
                    >
                      {/* Icon Container - Refined Square (The "First Pattern" look) */}
                      <div className={`relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-2xl transition-all duration-500 transform-gpu ${cat.id === selectedCategoryId
                        ? "bg-white scale-110 shadow-lg shadow-amber-200/40"
                        : "bg-white border border-zinc-200/70 hover:scale-[1.05] hover:border-amber-300/40 shadow-sm"
                        }`}>
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className={`h-full w-full object-cover p-1.5 transition-transform duration-500 ${cat.id === selectedCategoryId ? "scale-105" : "group-hover/item:scale-105"}`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl">{cat.emoji}</div>
                        )}
                        {cat.id === selectedCategoryId && (
                          <div className="absolute inset-0 bg-amber-400/5" />
                        )}
                      </div>

                      {/* Typography - Refined Title Case */}
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight text-center max-w-[90px] leading-tight transition-all duration-300 ${cat.id === selectedCategoryId
                          ? "text-amber-700"
                          : "text-zinc-500 group-hover/item:text-zinc-800"
                          }`}>
                          {cat.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </span>

                        {/* Elegant Active Indicator Pill */}
                        <div className={`h-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm transition-all duration-500 ${cat.id === selectedCategoryId ? "w-4 opacity-100" : "w-0 opacity-0"
                          }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Main Content Area ─────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">

            {/* ── Sidebar ───────────────────────────────────────── */}
            <aside className="w-[140px] sm:w-[160px] flex-shrink-0 bg-white border-r border-amber-50 sidebar-scroll h-full min-h-0 overflow-y-auto">
              <div className="p-3 space-y-1">
                {loadingSubs ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 flex-shrink-0" />
                      <div className="h-2.5 bg-zinc-100 rounded-full flex-1" />
                    </div>
                  ))
                ) : subCategories.length === 0 ? (
                  <p className="text-zinc-400 text-[10px] text-center py-6 font-semibold">No subcategories</p>
                ) : (
                  subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { triggerSubCategorySelect(sub.id); setSelectedProductId(null); }}
                      className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-[11px] font-bold cursor-pointer transition-all border group/sub ${sub.id === selectedSubCategoryId
                        ? "bg-amber-50 text-amber-800 border-amber-200 shadow-sm"
                        : "text-zinc-500 border-transparent hover:bg-zinc-50 hover:border-zinc-100"
                        }`}
                    >
                      <div className={`h-6 w-6 rounded-lg overflow-hidden flex-shrink-0 border transition-colors ${sub.id === selectedSubCategoryId ? "border-amber-200 bg-amber-50" : "border-zinc-100 bg-zinc-50"
                        }`}>
                        {sub.imageUrl ? (
                          <img src={sub.imageUrl} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-zinc-300">
                            <Package size={14} />
                          </div>
                        )}
                      </div>
                      <span className="truncate leading-tight">{sub.name}</span>
                      {sub.id === selectedSubCategoryId && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* ── Products / Details Area (Full Height) ─────────── */}
            <div className="flex-1 bg-[#FBF8F3] min-h-0 overflow-y-auto">
              <div className="p-4 sm:p-5 lg:p-6">
                {loadingProds ? (
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                    <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
                      <IndianRupee className="h-8 w-8 text-amber-200" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-zinc-500 text-sm">
                        {searchQuery ? "No products match your search" : "No products found"}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {searchQuery ? "Try a different keyword" : "Select a different subcategory"}
                      </p>
                    </div>
                  </div>
                ) : showDetailsView && detailsProductId ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowDetailsView(false)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-[#2b0a59] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back to Products
                    </button>
                    <div className="rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
                      <ProductPanel productId={detailsProductId} fullWidth={true} />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product, idx) => (
                      <article
                        key={product.id}
                        className="card-animate group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white hover:-translate-y-1.5 hover:shadow-xl shadow-sm transition-all duration-300 cursor-pointer"
                        style={{ animationDelay: `${idx * 40}ms` }}
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        <div className="relative overflow-hidden bg-amber-50/40" style={{ height: "190px" }}>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-zinc-200" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                            <span className="bg-white/90 text-zinc-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                              <ZoomIn className="h-3 w-3" />
                              Quick View
                            </span>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); }}
                            className="absolute top-2.5 right-2.5 h-7 w-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                          >
                            <Heart className="h-3.5 w-3.5" />
                          </button>
                          <span className="absolute bottom-2.5 left-2.5 bg-[#2b0a59]/80 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {product.status || "PREMIUM"}
                          </span>
                        </div>

                        <div className="p-3.5">
                          <h4 className="text-xs font-bold text-zinc-900 leading-snug line-clamp-1 font-display">
                            {product.productName}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 leading-relaxed">
                            {product.description || "Premium hallmarked gold"}
                          </p>
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">From</span>
                              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                                <IndianRupee size={10} strokeWidth={3} />
                                {product.priceRange}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailsProductId(product.id);
                                setShowDetailsView(true);
                              }}
                              className="text-[9px] font-black text-[#2b0a59] border border-[#2b0a59]/20 rounded-full px-2.5 py-1 uppercase tracking-wider hover:bg-[#2b0a59] hover:text-white transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedProductId && !showDetailsView && (
              <>
                <div
                  className="absolute inset-0 bg-black/30 z-30 lg:hidden"
                  onClick={() => setSelectedProductId(null)}
                />
                <div className="panel-slide absolute right-0 top-0 bottom-0 z-40 lg:relative lg:z-auto w-full sm:w-[400px] lg:w-[380px] xl:w-[420px] flex-shrink-0 border-l border-amber-100 shadow-2xl lg:shadow-none overflow-hidden">
                  <ProductPanel productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PhysicalGoldPage;