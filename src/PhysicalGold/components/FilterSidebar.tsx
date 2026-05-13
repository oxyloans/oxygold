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

    const [priceError, setPriceError] = React.useState<string>("");
    const [weightError, setWeightError] = React.useState<string>("");

    // Sync local state when filters are cleared/reset externally
    React.useEffect(() => {
        setLocalMinPrice(filters.minPrice);
        setLocalMaxPrice(filters.maxPrice);
        setPriceError("");
    }, [filters.minPrice, filters.maxPrice]);

    React.useEffect(() => {
        setLocalMinWeight(filters.minWeight);
        setLocalMaxWeight(filters.maxWeight);
        setWeightError("");
    }, [filters.minWeight, filters.maxWeight]);

    // --- Price ---
    const bothPriceFilled = localMinPrice !== undefined && localMaxPrice !== undefined;
    const priceValid = bothPriceFilled && localMaxPrice! > localMinPrice!;
    const priceChanged = localMinPrice !== filters.minPrice || localMaxPrice !== filters.maxPrice;
    const priceApplyEnabled = priceValid && priceChanged;

    const handleApplyPrice = () => {
        if (!bothPriceFilled) return;
        if (localMaxPrice! <= localMinPrice!) {
            setPriceError("Max price must be greater than min price.");
            return;
        }
        setPriceError("");
        onFilterChange({ minPrice: localMinPrice, maxPrice: localMaxPrice });
    };

    // --- Weight ---
    const bothWeightFilled = localMinWeight !== undefined && localMaxWeight !== undefined;
    const weightValid = bothWeightFilled && localMaxWeight! > localMinWeight!;
    const weightChanged = localMinWeight !== filters.minWeight || localMaxWeight !== filters.maxWeight;
    const weightApplyEnabled = weightValid && weightChanged;

    const handleApplyWeight = () => {
        if (!bothWeightFilled) return;
        if (localMaxWeight! <= localMinWeight!) {
            setWeightError("Max weight must be greater than min weight.");
            return;
        }
        setWeightError("");
        onFilterChange({ minWeight: localMinWeight, maxWeight: localMaxWeight });
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
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={localMinPrice ?? ""}
                        onChange={(e) => {
                            setLocalMinPrice(e.target.value ? Number(e.target.value) : undefined);
                            setPriceError("");
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${priceError ? "border-red-400" : "border-[#E8E0D5]"
                            }`}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={localMaxPrice ?? ""}
                        onChange={(e) => {
                            setLocalMaxPrice(e.target.value ? Number(e.target.value) : undefined);
                            setPriceError("");
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${priceError ? "border-red-400" : "border-[#E8E0D5]"
                            }`}
                    />
                </div>

                {priceError ? (
                    <p className="text-[10px] text-red-500 mt-1">{priceError}</p>
                ) : (
                    <p className="text-[10px] text-[#8A8A8A] mt-1">
                        Enter both values
                    </p>
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
                        value={localMinWeight ?? ""}
                        onChange={(e) => {
                            setLocalMinWeight(e.target.value ? Number(e.target.value) : undefined);
                            setWeightError("");
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${weightError ? "border-red-400" : "border-[#E8E0D5]"
                            }`}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={localMaxWeight ?? ""}
                        onChange={(e) => {
                            setLocalMaxWeight(e.target.value ? Number(e.target.value) : undefined);
                            setWeightError("");
                        }}
                        className={`border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914] transition-colors ${weightError ? "border-red-400" : "border-[#E8E0D5]"
                            }`}
                    />
                </div>

                {weightError ? (
                    <p className="text-[10px] text-red-500 mt-1">{weightError}</p>
                ) : (
                    <p className="text-[10px] text-[#8A8A8A] mt-1">
                        Enter both values
                    </p>
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

            {/* Purity */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Purity</label>
                <div className="space-y-2">
                    {purities.map((purity) => (
                        <label key={purity} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="purity"
                                checked={filters.purity === purity}
                                onChange={() =>
                                    onFilterChange({ purity: filters.purity === purity ? undefined : purity })
                                }
                                className="w-4 h-4 text-[#8B6914] focus:ring-[#8B6914]"
                            />
                            <span className="text-[12px] text-[#1A1A1A]">{purity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Size</label>
                <div className="space-y-2">
                    {sizes.map((size) => (
                        <label key={size} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="size"
                                checked={filters.size === size}
                                onChange={() =>
                                    onFilterChange({ size: filters.size === size ? undefined : size })
                                }
                                className="w-4 h-4 text-[#8B6914] focus:ring-[#8B6914]"
                            />
                            <span className="text-[12px] text-[#1A1A1A]">{size}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.inStock || false}
                        onChange={(e) => onFilterChange({ inStock: e.target.checked || undefined })}
                        className="w-4 h-4 text-[#8B6914] focus:ring-[#8B6914] rounded"
                    />
                    <span className="text-[12px] font-medium text-[#1A1A1A]">In Stock Only</span>
                </label>
            </div>
        </div>
    );
};

export default FilterSidebar;