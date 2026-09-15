import React, { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SearchFilters } from "../SearchContext";

interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (updates: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  facets?: {
    byPurity?: Record<string, number>;
    bySize?: Record<string, number>;
  } | null;
}

const RangeFilter: React.FC<{
  title: string;
  minimum?: number;
  maximum?: number;
  onApply: (minimum?: number, maximum?: number) => void;
}> = ({ title, minimum, maximum, onApply }) => {
  const [min, setMin] = useState(minimum?.toString() ?? "");
  const [max, setMax] = useState(maximum?.toString() ?? "");
  useEffect(() => { setMin(minimum?.toString() ?? ""); setMax(maximum?.toString() ?? ""); }, [minimum, maximum]);
  const low = min === "" ? undefined : Number(min);
  const high = max === "" ? undefined : Number(max);
  const invalid = [low, high].some(v => v !== undefined && (!Number.isFinite(v) || v < 0)) ||
    (low !== undefined && high !== undefined && low > high);
  const changed = low !== minimum || high !== maximum;

  return (
    <form onSubmit={e => { e.preventDefault(); if (!invalid && changed) onApply(low, high); }}
      className="space-y-2 pb-3">
      <fieldset>
        <legend className="sr-only">{title}</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 text-xs text-stone-500">Min ({title.startsWith("Price") ? "₹" : "g"})
            <input type="number" min="0" step="any" inputMode="decimal" value={min}
              onChange={e => setMin(e.target.value)} placeholder="Any" aria-invalid={invalid}
              className="mt-1 h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-2 text-base text-stone-900 outline-none focus:border-amber-700 sm:text-sm" />
          </label>
          <label className="min-w-0 text-xs text-stone-500">Max ({title.startsWith("Price") ? "₹" : "g"})
            <input type="number" min="0" step="any" inputMode="decimal" value={max}
              onChange={e => setMax(e.target.value)} placeholder="Any" aria-invalid={invalid}
              className="mt-1 h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-2 text-base text-stone-900 outline-none focus:border-amber-700 sm:text-sm" />
          </label>
        </div>
      </fieldset>
      {invalid ? <p role="alert" className="text-xs text-red-700">Use positive values with minimum no higher than maximum.</p> : null}
      {changed && <button type="submit" disabled={invalid}
        className="h-10 w-full rounded-lg border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-400">
        Apply
      </button>}
    </form>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onClearFilters, facets }) => {
  const [resetKey, setResetKey] = useState(0);
  const selectedPurities = filters.purity?.split(",").filter(Boolean) || [];
  const selectedSizes = filters.size?.split(",").filter(Boolean) || [];
  // Use available facets rather than showing gold-only options on silver collections.
  const purities = Array.from(new Set([...Object.keys(facets?.byPurity || {}), ...selectedPurities]));
  const sizes = Array.from(new Set([...Object.keys(facets?.bySize || {}), ...selectedSizes]))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const toggle = (key: "purity" | "size", value: string) => {
    const values = (filters[key] || "").split(",").filter(Boolean);
    const next = values.includes(value) ? values.filter(v => v !== value) : [...values, value];
    onFilterChange({ [key]: next.length ? next.join(",") : undefined });
  };

  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <SlidersHorizontal className="h-4 w-4 text-amber-800" /> Filters
        </h3>
        <button type="button" onClick={() => { setResetKey(n => n + 1); onClearFilters(); }}
          className="min-h-10 text-xs font-medium text-amber-800 hover:underline">Reset all</button>
      </div>
      <label className="mb-4 block text-sm font-semibold text-stone-800">Sort by
        <select value={filters.sortBy || "NEWEST"}
          onChange={e => onFilterChange({ sortBy: e.target.value as SearchFilters["sortBy"] })}
          className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-white px-2 text-sm font-normal outline-none focus:border-amber-700">
          <option value="NEWEST">Newest first</option><option value="PRICE_ASC">Price: low to high</option>
          <option value="PRICE_DESC">Price: high to low</option><option value="NAME_ASC">Name: A–Z</option>
        </select>
      </label>
      <div className="divide-y divide-stone-100">
        <details open className="border-t border-stone-100">
          <summary className="cursor-pointer py-4 text-sm font-medium text-stone-800">Price</summary>
          <RangeFilter key={`price-${resetKey}`} title="Price (₹)" minimum={filters.minPrice} maximum={filters.maxPrice}
            onApply={(minPrice, maxPrice) => onFilterChange({minPrice, maxPrice})} />
        </details>
        <details>
          <summary className="cursor-pointer py-4 text-sm font-medium text-stone-800">Weight</summary>
          <RangeFilter key={`weight-${resetKey}`} title="Weight (g)" minimum={filters.minWeight} maximum={filters.maxWeight}
            onApply={(minWeight, maxWeight) => onFilterChange({minWeight, maxWeight})} />
        </details>
        {([
          { key: "purity" as const, title: "Purity", options: purities, selected: selectedPurities },
          { key: "size" as const, title: "Size", options: sizes, selected: selectedSizes }
        ]).map(group => group.options.length > 0 && (
          <details key={group.key} className="border-stone-100">
            <summary className="cursor-pointer py-4 text-sm font-medium text-stone-800">{group.title}</summary>
            <div className="mt-2 max-h-48 overflow-y-auto">
              {group.options.map(option => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={group.selected.includes(option)} onChange={() => toggle(group.key, option)}
                  className="h-4 w-4 shrink-0 accent-amber-800" />
                <span className="min-w-0 flex-1 break-words">{option}</span>

              </label>)}
            </div>
          </details>
        ))}
        <label className="flex min-h-12 cursor-pointer items-center gap-2 border-t border-stone-100 pt-3 text-sm text-stone-700">
          <input type="checkbox" checked={filters.inStock === true}
            onChange={e => onFilterChange({inStock: e.target.checked ? true : undefined})}
            className="h-4 w-4 accent-amber-800" /> In stock only
        </label>
      </div>
    </div>
  );
};
export default FilterSidebar;