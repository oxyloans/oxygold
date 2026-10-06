import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchPartnerProducts,
  updateVariantDetails,
  updateVariantQuantity,
  PartnerProduct,
  PartnerVariant
} from "../services/partnerAdminService";
import {
  Package,
  Boxes,
  Layers,
  AlertTriangle,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  X,
  Loader2,
  Scale,
  Ruler,
  Tag,
  ChevronRight,
  TrendingDown
} from "lucide-react";

export const PartnerAdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters & Search synced with URL Search Parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  
  const categoryFilter = searchParams.get("cat") || "ALL";
  const stockFilter = (searchParams.get("stock") as "ALL" | "LOW_STOCK" | "IN_STOCK") || "ALL";

  const setCategoryFilter = (cat: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === "ALL") next.delete("cat");
      else next.set("cat", cat);
      return next;
    });
  };

  const setStockFilter = (stock: "ALL" | "LOW_STOCK" | "IN_STOCK") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (stock === "ALL") next.delete("stock");
      else next.set("stock", stock);
      return next;
    });
  };

  // Edit Details Modal State
  const [editingVariant, setEditingVariant] = useState<{
    productId: number;
    productName: string;
    variant: PartnerVariant;
  } | null>(null);
  const [editSize, setEditSize] = useState("");
  const [editWeight, setEditWeight] = useState<number>(0);
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Update Stock Modal State
  const [updatingStockVariant, setUpdatingStockVariant] = useState<{
    productId: number;
    productName: string;
    variant: PartnerVariant;
  } | null>(null);
  const [newStockQuantity, setNewStockQuantity] = useState<number>(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Quick Action Loading for Inline Buttons
  const [inlineLoadingVariantId, setInlineLoadingVariantId] = useState<number | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Products from API
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetchPartnerProducts();
      if (res.success) {
        setProducts(res.data);
        if (isManualRefresh) {
          setToast({ message: "Inventory refreshed successfully", type: "success" });
        }
      } else {
        setToast({ message: res.message || "Failed to fetch partner products", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Error loading inventory", type: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Stats
  const stats = useMemo(() => {
    let totalProductsCount = products.length;
    let totalVariantsCount = 0;
    let totalStockCount = 0;
    let lowStockVariantsCount = 0;

    products.forEach((p) => {
      p.variants?.forEach((v) => {
        totalVariantsCount++;
        totalStockCount += Number(v.stockQuantity || 0);
        if (Number(v.stockQuantity || 0) < 10) {
          lowStockVariantsCount++;
        }
      });
    });

    return {
      totalProductsCount,
      totalVariantsCount,
      totalStockCount,
      lowStockVariantsCount,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .map((p) => {
        const matchesCategory =
          categoryFilter === "ALL" ||
          p.parentCategoryName?.toLowerCase() === categoryFilter.toLowerCase();

        const matchesSearch =
          !searchTerm ||
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.subCategoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.parentCategoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.variants?.some(
            (v) =>
              v.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.size?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        if (!matchesCategory || !matchesSearch) return null;

        const filteredVariants = p.variants?.filter((v) => {
          if (stockFilter === "LOW_STOCK") return Number(v.stockQuantity || 0) < 10;
          if (stockFilter === "IN_STOCK") return Number(v.stockQuantity || 0) >= 10;
          return true;
        });

        if (stockFilter !== "ALL" && (!filteredVariants || filteredVariants.length === 0)) {
          return null;
        }

        return {
          ...p,
          variants: filteredVariants || p.variants,
        };
      })
      .filter((p): p is PartnerProduct => p !== null);
  }, [products, categoryFilter, searchTerm, stockFilter]);

  // Handle Edit Details Submit
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    if (!editSize || !editSize.trim()) {
      setToast({ message: "Size specification cannot be empty.", type: "error" });
      return;
    }

    if (isNaN(editWeight) || editWeight < 0) {
      setToast({ message: "Weight must be a valid positive number.", type: "error" });
      return;
    }

    setUpdatingDetails(true);
    try {
      const res = await updateVariantDetails(
        editingVariant.variant.id,
        editSize.trim(),
        editWeight
      );

      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((prod) => {
            if (prod.id === editingVariant.productId) {
              return {
                ...prod,
                variants: prod.variants.map((v) =>
                  v.id === editingVariant.variant.id
                    ? { ...v, size: res.data!.size, weight: res.data!.weight }
                    : v
                ),
              };
            }
            return prod;
          })
        );
        setToast({ message: "Variant details updated successfully!", type: "success" });
        setEditingVariant(null);
      } else {
        setToast({ message: res.message || "Failed to update details", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Error updating variant details", type: "error" });
    } finally {
      setUpdatingDetails(false);
    }
  };

  // Handle Update Stock Submit
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingStockVariant) return;

    if (isNaN(newStockQuantity) || newStockQuantity < 0) {
      setToast({ message: "Stock quantity cannot be negative.", type: "error" });
      return;
    }

    setUpdatingStock(true);
    try {
      const res = await updateVariantQuantity(
        updatingStockVariant.variant.id,
        newStockQuantity
      );

      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((prod) => {
            if (prod.id === updatingStockVariant.productId) {
              return {
                ...prod,
                variants: prod.variants.map((v) =>
                  v.id === updatingStockVariant.variant.id
                    ? { ...v, stockQuantity: res.data!.stockQuantity }
                    : v
                ),
              };
            }
            return prod;
          })
        );
        setToast({ message: "Partner stock updated successfully!", type: "success" });
        setUpdatingStockVariant(null);
      } else {
        setToast({ message: res.message || "Failed to update stock quantity", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Error updating stock quantity", type: "error" });
    } finally {
      setUpdatingStock(false);
    }
  };

  // Quick Inline Quantity Change (+/- Delta)
  const handleQuickQuantityChange = async (
    productId: number,
    variant: PartnerVariant,
    delta: number
  ) => {
    const targetQty = Math.max(0, Number(variant.stockQuantity || 0) + delta);
    setInlineLoadingVariantId(variant.id);

    try {
      const res = await updateVariantQuantity(variant.id, targetQty);

      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((prod) => {
            if (prod.id === productId) {
              return {
                ...prod,
                variants: prod.variants.map((v) =>
                  v.id === variant.id
                    ? { ...v, stockQuantity: res.data!.stockQuantity }
                    : v
                ),
              };
            }
            return prod;
          })
        );
        setToast({
          message: `Stock updated for SKU ${variant.sku} to ${res.data.stockQuantity} units`,
          type: "success",
        });
      } else {
        setToast({ message: res.message || "Failed to update stock", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Error updating stock", type: "error" });
    } finally {
      setInlineLoadingVariantId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white border ${
              toast.type === "success"
                ? "bg-emerald-900 border-emerald-700"
                : "bg-rose-900 border-rose-700"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-rose-400" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 p-1 hover:opacity-75 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Products &amp; Stock Inventory
          </h1>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Manage product variants, stock levels, sizes and weights in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/60 bg-white hover:bg-amber-50 text-[#8B6914] font-semibold text-xs transition shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#8B6914] flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Products</p>
            <p className="text-2xl font-black text-[#1A1A1A] mt-0.5">{stats.totalProductsCount}</p>
          </div>
        </div>

        {/* Total Variants */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Variants</p>
            <p className="text-2xl font-black text-[#1A1A1A] mt-0.5">{stats.totalVariantsCount}</p>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Boxes size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Stock</p>
            <p className="text-2xl font-black text-[#1A1A1A] mt-0.5">{stats.totalStockCount.toLocaleString()}</p>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Low Stock (&lt;10)</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{stats.lowStockVariantsCount}</p>
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search size={17} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name, SKU, Size or Weight..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl text-xs font-semibold text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Category Metal Filters */}
          <div className="inline-flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E8E0D5]">
            {(["ALL", "Silver", "Gold"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#8B6914] text-white shadow-xs"
                    : "text-stone-600 hover:text-[#1A1A1A]"
                }`}
              >
                {cat === "ALL" ? "All Metals" : cat}
              </button>
            ))}
          </div>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl text-xs font-bold text-stone-700 outline-none focus:border-[#8B6914] cursor-pointer"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW_STOCK">Low Stock (&lt;10 units)</option>
            <option value="IN_STOCK">Normal Stock (≥10 units)</option>
          </select>

        </div>

      </div>

      {/* PRODUCTS & VARIANTS ADMIN TABLE / CARDS */}
      {loading ? (
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-16 text-center space-y-3">
          <Loader2 size={36} className="animate-spin mx-auto text-[#8B6914]" />
          <p className="text-xs font-bold text-stone-500">Loading partner inventory data...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E8E0D5] rounded-2xl p-16 text-center space-y-3">
          <Boxes size={44} className="mx-auto text-stone-300" />
          <h3 className="text-base font-bold text-[#1A1A1A]">No Matching Partner Products Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No items match your active search terms or metal category filter.
          </p>
          {(searchTerm || categoryFilter !== "ALL" || stockFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("ALL");
                setStockFilter("ALL");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[#8B6914] text-xs font-bold hover:bg-amber-100 transition cursor-pointer mt-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-[#E8E0D5] rounded-2xl overflow-hidden shadow-xs hover:border-amber-300 transition"
            >
              {/* Product Header */}
              <div className="bg-[#FAF8F5] border-b border-[#F0EBE1] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        product.parentCategoryName?.toLowerCase() === "silver"
                          ? "bg-stone-200 text-stone-800"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {product.parentCategoryName || "Metal"}
                    </span>
                    <span className="text-xs text-stone-400 font-semibold">•</span>
                    <span className="text-xs font-bold text-stone-600">
                      {product.subCategoryName || "Standard"}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">
                    {product.productName}
                  </h2>
                </div>

                <div className="text-xs font-semibold text-stone-500 shrink-0">
                  Product ID: <span className="font-extrabold text-[#1A1A1A]">#{product.id}</span>
                </div>
              </div>

              {/* Variants Section — Table View on Desktop / Cards on Mobile */}
              <div className="p-4 sm:p-6">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500 pb-2">
                        <th className="pb-3 pl-2">Variant SKU &amp; ID</th>
                        <th className="pb-3">Size Specification</th>
                        <th className="pb-3">Weight (Grams)</th>
                        <th className="pb-3">Stock Available</th>
                        <th className="pb-3 text-right pr-2">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {product.variants?.map((variant) => {
                        const isLowStock = Number(variant.stockQuantity || 0) < 10;
                        const isOutOfStock = Number(variant.stockQuantity || 0) === 0;
                        const isInlineLoading = inlineLoadingVariantId === variant.id;

                        return (
                          <tr key={variant.id} className="hover:bg-[#FAF8F5]/60 transition group">
                            
                            {/* SKU & ID */}
                            <td className="py-3.5 pl-2">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-300 inline-block w-max">
                                  {variant.sku}
                                </span>
                                <span className="text-[11px] font-medium text-stone-400 mt-1">
                                  ID: #{variant.id}
                                </span>
                              </div>
                            </td>

                            {/* Size */}
                            <td className="py-3.5 text-xs font-bold text-stone-900">
                              <div className="inline-flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                                <Ruler size={14} className="text-[#8B6914]" />
                                <span>{variant.size}</span>
                              </div>
                            </td>

                            {/* Weight */}
                            <td className="py-3.5 text-xs font-bold text-stone-900">
                              <div className="inline-flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                                <Scale size={14} className="text-[#8B6914]" />
                                <span>{variant.weight} g</span>
                              </div>
                            </td>

                            {/* Stock Available Badge */}
                            <td className="py-3.5">
                              <div className="inline-flex items-center gap-2">
                                <span className="text-sm font-black text-[#1A1A1A]">
                                  {variant.stockQuantity} units
                                </span>
                                {isOutOfStock ? (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                                    Out of Stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 text-right pr-2">
                              <div className="inline-flex items-center gap-2.5">
                                
                                {/* Edit Details */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVariant({
                                      productId: product.id,
                                      productName: product.productName,
                                      variant,
                                    });
                                    setEditSize(variant.size);
                                    setEditWeight(variant.weight);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-stone-700 hover:text-[#8B6914] text-xs font-bold transition shadow-2xs cursor-pointer"
                                >
                                  <Edit2 size={13} />
                                  <span>Edit</span>
                                </button>

                                {/* Update Stock Custom Modal */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpdatingStockVariant({
                                      productId: product.id,
                                      productName: product.productName,
                                      variant,
                                    });
                                    setNewStockQuantity(variant.stockQuantity);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#8B6914] hover:bg-[#7A5C10] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                                >
                                  Update Stock
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {product.variants?.map((variant) => {
                    const isLowStock = Number(variant.stockQuantity || 0) < 10;

                    return (
                      <div key={variant.id} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                            SKU: {variant.sku}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${isLowStock ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {variant.stockQuantity} units
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold text-stone-800">
                          <span>Size: {variant.size}</span>
                          <span>•</span>
                          <span>Weight: {variant.weight}g</span>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-stone-100 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVariant({
                                productId: product.id,
                                productName: product.productName,
                                variant,
                              });
                              setEditSize(variant.size);
                              setEditWeight(variant.weight);
                            }}
                            className="p-2 rounded-xl border border-stone-200 text-xs font-bold"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setUpdatingStockVariant({
                                productId: product.id,
                                productName: product.productName,
                                variant,
                              });
                              setNewStockQuantity(variant.stockQuantity);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#8B6914] text-white text-xs font-bold"
                          >
                            Stock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EDIT VARIANT DETAILS (Size & Weight) */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                  <Edit2 size={18} className="text-[#8B6914]" />
                  Edit Variant Specifications
                </h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5 truncate max-w-xs">
                  {editingVariant.productName} ({editingVariant.variant.sku})
                </p>
              </div>
              <button
                onClick={() => setEditingVariant(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Size (e.g. 10, 10 Gram, 20 Gram)
                </label>
                <input
                  type="text"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  required
                  placeholder="10 Gram"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Weight in Grams (Numeric)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  required
                  min="0"
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingDetails}
                  className="px-5 py-2.5 rounded-xl bg-[#8B6914] hover:bg-[#7A5C10] text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingDetails ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Specifications</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STOCK QUANTITY */}
      {updatingStockVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                  <Boxes size={18} className="text-[#8B6914]" />
                  Update Partner Stock Quantity
                </h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5 truncate max-w-xs">
                  {updatingStockVariant.productName} ({updatingStockVariant.variant.sku})
                </p>
              </div>
              <button
                onClick={() => setUpdatingStockVariant(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Available Stock Quantity (Units)
                </label>
                <input
                  type="number"
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  min="0"
                  placeholder="100"
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl text-lg font-black text-[#8B6914] focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20"
                />
              </div>

              {/* Quick Preset Add Buttons */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Quick Stock Presets
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[+5, +10, +25, +50, +100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewStockQuantity((prev) => prev + preset)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#8B6914] text-xs font-bold transition cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setUpdatingStockVariant(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStock}
                  className="px-5 py-2.5 rounded-xl bg-[#8B6914] hover:bg-[#7A5C10] text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingStock ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Partner Stock</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerAdminProductsPage;
