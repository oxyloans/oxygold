import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
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
    // Use facets if available, otherwise fallback to defaults
    const purities = facets?.byPurity ? Object.keys(facets.byPurity) : ["22K", "22KT", "18K", "18KT", "24K", "24KT"];
    const sizes = facets?.bySize ? Object.keys(facets.bySize).sort((a, b) => parseFloat(a) - parseFloat(b)) : ["Small", "Medium", "Large"];

    // Local state for price/weight inputs (to avoid API calls on every keystroke)
    const [localMinPrice, setLocalMinPrice] = React.useState(filters.minPrice);
    const [localMaxPrice, setLocalMaxPrice] = React.useState(filters.maxPrice);
    const [localMinWeight, setLocalMinWeight] = React.useState(filters.minWeight);
    const [localMaxWeight, setLocalMaxWeight] = React.useState(filters.maxWeight);

    // Sync local state with filters
    React.useEffect(() => {
        setLocalMinPrice(filters.minPrice);
        setLocalMaxPrice(filters.maxPrice);
        setLocalMinWeight(filters.minWeight);
        setLocalMaxWeight(filters.maxWeight);
    }, [filters.minPrice, filters.maxPrice, filters.minWeight, filters.maxWeight]);

    // Smart price range handler - only trigger API when both are set or both are cleared
    const handlePriceBlur = () => {
        const bothSet = localMinPrice !== undefined && localMaxPrice !== undefined;
        const bothCleared = localMinPrice === undefined && localMaxPrice === undefined;
        const changed = localMinPrice !== filters.minPrice || localMaxPrice !== filters.maxPrice;
        
        if (changed && (bothSet || bothCleared)) {
            onFilterChange({ minPrice: localMinPrice, maxPrice: localMaxPrice });
        }
    };

    // Smart weight range handler - only trigger API when both are set or both are cleared
    const handleWeightBlur = () => {
        const bothSet = localMinWeight !== undefined && localMaxWeight !== undefined;
        const bothCleared = localMinWeight === undefined && localMaxWeight === undefined;
        const changed = localMinWeight !== filters.minWeight || localMaxWeight !== filters.maxWeight;
        
        if (changed && (bothSet || bothCleared)) {
            onFilterChange({ minWeight: localMinWeight, maxWeight: localMaxWeight });
        }
    };

    return (
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 space-y-6">
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
                        value={localMinPrice || ""}
                        onChange={(e) => setLocalMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={handlePriceBlur}
                        className="border border-[#E8E0D5] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914]"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={localMaxPrice || ""}
                        onChange={(e) => setLocalMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={handlePriceBlur}
                        className="border border-[#E8E0D5] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914]"
                    />
                </div>
                <p className="text-[10px] text-[#8A8A8A] mt-1">Enter both min & max to apply</p>
            </div>

            {/* Weight Range */}
            <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-2">Weight (grams)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={localMinWeight || ""}
                        onChange={(e) => setLocalMinWeight(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={handleWeightBlur}
                        className="border border-[#E8E0D5] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914]"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={localMaxWeight || ""}
                        onChange={(e) => setLocalMaxWeight(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={handleWeightBlur}
                        className="border border-[#E8E0D5] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#8B6914]"
                    />
                </div>
                <p className="text-[10px] text-[#8A8A8A] mt-1">Enter both min & max to apply</p>
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
                                onChange={() => onFilterChange({ purity: filters.purity === purity ? undefined : purity })}
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
                                onChange={() => onFilterChange({ size: filters.size === size ? undefined : size })}
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
