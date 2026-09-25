import React, { useEffect, useState } from "react";
import { ArrowRight, Check, Package } from "lucide-react";
import { Category } from "../physicalGoldData";
import "../styles.css";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  selectedCategoryId?: string;
}

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = category.imageUrl?.trim();

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`View ${category.name}`}
      className={`group relative block w-full overflow-hidden rounded-2xl border bg-[#FBF8F3] text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C29B27] focus-visible:ring-offset-2 sm:rounded-[20px] ${
        isSelected
          ? "border-[#C29B27] shadow-[0_10px_28px_rgba(139,105,20,0.18)] ring-1 ring-[#C29B27]/30"
          : "border-[#E8E0D3] shadow-[0_3px_12px_rgba(28,20,10,0.06)] hover:-translate-y-1 hover:border-[#C29B27]/70 hover:shadow-[0_14px_34px_rgba(28,20,10,0.14)]"
      }`}
    >
      {/* Full image card */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FBF8F3] sm:aspect-[5/4] lg:aspect-[4/3]">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={category.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F7F2E9]">
            {category.emoji ? (
              <span aria-hidden="true" className="text-5xl sm:text-6xl">
                {category.emoji}
              </span>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E8E0D3] bg-white shadow-sm">
                <Package
                  aria-hidden="true"
                  className="h-8 w-8 text-[#B9AA92]"
                  strokeWidth={1.35}
                />
              </div>
            )}
          </div>
        )}

        {/* Soft base gradient keeps mobile/tablet text readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-70 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />

        {/* Selected state */}
        {isSelected && (
          <span className="absolute right-2.5 top-2.5 inline-flex h-7 items-center gap-1 rounded-full bg-[#8B6914] px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-md sm:right-3 sm:top-3">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            Selected
          </span>
        )}

        {/*
          Touch devices: label is always visible because there is no dependable hover.
          Desktop: the label reveals on hover/focus for a clean image-first experience.
        */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-300 sm:p-4 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 ${
            isSelected ? "md:translate-y-0 md:opacity-100" : ""
          }`}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[13px] font-bold leading-[1.3] text-white drop-shadow-sm sm:text-[14px] lg:text-[15px]">
                {category.name}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-white/90 sm:text-[11px]">
                View products
                <ArrowRight
                  aria-hidden="true"
                  className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </div>

            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-colors duration-200 group-hover:bg-white group-hover:text-[#8B6914]"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryClick,
  selectedCategoryId,
}) => {
  return (
    <section
      id="collections-section"
      aria-labelledby="collections-heading"
      className="w-full min-w-0 scroll-mt-28 pb-7 pt-5 sm:pb-10 sm:pt-7 lg:pb-12 lg:pt-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-5 sm:mb-7">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A77C14] sm:text-xs">
            Our Collection
          </p>
          <h2
            id="collections-heading"
            className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#1C1A17] sm:text-[28px] lg:text-[30px]"
          >
            Shop by Category
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#756C61] sm:mt-2 sm:text-sm sm:leading-6">
            Select a collection to explore available products.
          </p>
        </header>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 items-stretch gap-2.5 min-[480px]:gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:gap-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onClick={() => onCategoryClick(category.id)}
              />
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDD3C5] bg-[#FCFAF7] px-5 py-10 text-center sm:min-h-52"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8E0D3] bg-white">
              <Package
                aria-hidden="true"
                className="h-6 w-6 text-[#B9AA92]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-semibold text-[#4D463E]">
              No categories available
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#8A8177]">
              Categories will appear here when they are available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
