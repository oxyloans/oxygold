import React from "react";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { SearchFilters } from "../SearchContext";

interface FilterSidebarProps {
    filters: SearchFilters;
    onFilterChange: (updates: Partial<SearchFilters>) => void;
    onClearFilters: () => void;
    facets?: {
        byPurity?: Record<string, number>;
        bySize?: Record<string, number>;
    };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onClearFilters, facets }) => {
    const purities = facets?.byPurity
        ? Object.keys(facets.byPurity)
        : ["22K", "22KT", "18K", "18KT", "24K", "24KT"];
    const sizes = facets?.bySize
        ? Object.keys(facets.bySize).sort((a, b) => parseFloat(a) - parseFloat(b))
        : ["Small", "Medium", "Large"];

    const [localMinPrice, setLocalMinPrice] = React.useState(filters.minPrice);
    const [localMaxPrice, setLocalMaxPrice] = React.useState(filters.maxPrice);
    const [localMinWeight, setLocalMinWeight] = React.useState(filters.minWeight);
    const [localMaxWeight, setLocalMaxWeight] = React.useState(filters.maxWeight);

    // Sync local state when filters are cleared/reset externally
    React.useEffect(() => {
        setLocalMinPrice(filters.minPrice);
        setLocalMaxPrice(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    React.useEffect(() => {
        setLocalMinWeight(filters.minWeight);
        setLocalMaxWeight(filters.maxWeight);
    }, [filters.minWeight, filters.maxWeight]);

    // --- Price validation ---
    const priceMinGtMax =
        localMinPrice !== undefined &&
        localMaxPrice !== undefined &&
        localMinPrice >= localMaxPrice;
    const priceApplyEnabled =
        localMinPrice !== undefined &&
        localMaxPrice !== undefined &&
        !priceMinGtMax &&
        (localMinPrice !== filters.minPrice || localMaxPrice !== filters.maxPrice);

    const handleApplyPrice = () => {
        if (!priceApplyEnabled) return;
        onFilterChange({ minPrice: localMinPrice, maxPrice: localMaxPrice });
    };

    // --- Weight validation ---
    const weightMinGtMax =
        localMinWeight !== undefined &&
        localMaxWeight !== undefined &&
        localMinWeight >= localMaxWeight;
    const weightApplyEnabled =
        localMinWeight !== undefined &&
        localMaxWeight !== undefined &&
        !weightMinGtMax &&
        (localMinWeight !== filters.minWeight || localMaxWeight !== filters.maxWeight);

    const handleApplyWeight = () => {
        if (!weightApplyEnabled) return;
        onFilterChange({ minWeight: localMinWeight, maxWeight: localMaxWeight });
    };

    // --- Purity checkboxes (multi-select) ---
    const selectedPurities: string[] = filters.purity
        ? filters.purity.split(",").filter(Boolean)
        : [];

    const togglePurity = (purity: string) => {
        const next = selectedPurities.includes(purity)
            ? selectedPurities.filter((p) => p !== purity)
            : [...selectedPurities, purity];
        onFilterChange({ purity: next.length > 0 ? next.join(",") : undefined });
    };

    // --- Size checkboxes (multi-select) ---
    const selectedSizes: string[] = filters.size
        ? filters.size.split(",").filter(Boolean)
        : [];

    const toggleSize = (size: string) => {
        const next = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size)
            : [...selectedSizes, size];
        onFilterChange({ size: next.length > 0 ? next.join(",") : undefined });
    };

    return (
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#8B6914]" />
                    <h3 className="text-[14px] font-bold text-[#1A1A1A]">Filters</h3>
                </div>
                <button
                    onClick={onClearFilters}
                    className="text-[11px] font-medium text-[#8B6914] hover:underline"
                >
                    Clear All
                </button>
            </div>

            {/* Sort By */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Sort By</label>
                <select
                    value={filters.sortBy || "NEWEST"}
                    onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                    className="w-full border border-[#E8E0D5] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] bg-white outline-none focus:border-[#8B6914]"
                >
                    <option value="NEWEST">Newest First</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                    <option value="NAME_ASC">Name: A to Z</option>
                </select>
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        min={0}
                        value={localMinPrice ?? ""}
                        onChange={(e) => {
                            const val = e.target.value ? Math.max(0, Number(e.target.value)) : undefined;
                            setLocalMinPrice(val);
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${priceMinGtMax ? "border-red-400" : "border-[#E8E0D5]"}`}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        min={0}
                        value={localMaxPrice ?? ""}
                        onChange={(e) => {
                            const val = e.target.value ? Math.max(0, Number(e.target.value)) : undefined;
                            setLocalMaxPrice(val);
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${priceMinGtMax ? "border-red-400" : "border-[#E8E0D5]"}`}
                    />
                </div>
                {priceMinGtMax ? (
                    <p className="text-[10px] text-red-500 mt-1">Min price must be less than max price.</p>
                ) : (
                    <p className="text-[10px] text-[#8A8A8A] mt-1">Enter both min and max values</p>
                )}
                <button
                    onClick={handleApplyPrice}
                    disabled={!priceApplyEnabled}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all ${priceApplyEnabled
                        ? "bg-[#8B6914] text-white hover:bg-[#7A5C10] cursor-pointer"
                        : "bg-[#F5F0E8] text-[#BEB5AA] cursor-not-allowed"
                        }`}
                >
                    Apply Price
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Weight Range */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Weight (grams)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        min={0}
                        value={localMinWeight ?? ""}
                        onChange={(e) => {
                            const val = e.target.value ? Math.max(0, Number(e.target.value)) : undefined;
                            setLocalMinWeight(val);
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${weightMinGtMax ? "border-red-400" : "border-[#E8E0D5]"}`}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        min={0}
                        value={localMaxWeight ?? ""}
                        onChange={(e) => {
                            const val = e.target.value ? Math.max(0, Number(e.target.value)) : undefined;
                            setLocalMaxWeight(val);
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${weightMinGtMax ? "border-red-400" : "border-[#E8E0D5]"}`}
                    />
                </div>
                {weightMinGtMax ? (
                    <p className="text-[10px] text-red-500 mt-1">Min weight must be less than max weight.</p>
                ) : (
                    <p className="text-[10px] text-[#8A8A8A] mt-1">Enter both min and max values</p>
                )}
                <button
                    onClick={handleApplyWeight}
                    disabled={!weightApplyEnabled}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all ${weightApplyEnabled
                        ? "bg-[#8B6914] text-white hover:bg-[#7A5C10] cursor-pointer"
                        : "bg-[#F5F0E8] text-[#BEB5AA] cursor-not-allowed"
                        }`}
                >
                    Apply Weight
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Purity — checkboxes */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Purity</label>
                <div className="space-y-2">
                    {purities.map((purity) => (
                        <label key={purity} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedPurities.includes(purity)}
                                onChange={() => togglePurity(purity)}
                                className="w-4 h-4 rounded text-[#8B6914] border-[#D1C7BB] focus:ring-[#8B6914] accent-[#8B6914]"
                            />
                            <span className="text-[12px] text-[#1A1A1A] group-hover:text-[#8B6914] transition-colors">{purity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Size — checkboxes */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Size</label>
                <div className="space-y-2">
                    {sizes.map((size) => (
                        <label key={size} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedSizes.includes(size)}
                                onChange={() => toggleSize(size)}
                                className="w-4 h-4 rounded text-[#8B6914] border-[#D1C7BB] focus:ring-[#8B6914] accent-[#8B6914]"
                            />
                            <span className="text-[12px] text-[#1A1A1A] group-hover:text-[#8B6914] transition-colors">{size}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.inStock || false}
                        onChange={(e) => onFilterChange({ inStock: e.target.checked || undefined })}
                        className="w-4 h-4 rounded text-[#8B6914] border-[#D1C7BB] focus:ring-[#8B6914] accent-[#8B6914]"
                    />
                    <span className="text-[12px] font-medium text-[#1A1A1A] group-hover:text-[#8B6914] transition-colors">In Stock Only</span>
                </label>
            </div>
        </div>
    );
};

export default FilterSidebar;
