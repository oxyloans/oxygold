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

  // Retry when refreshed category data supplies a different image.
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Explore ${category.name}`}
      className={`group flex h-full w-full min-w-0 flex-col overflow-hidden
        rounded-xl border bg-white text-left transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-amber-700 focus-visible:ring-offset-2
        ${isSelected
          ? "border-amber-700 ring-1 ring-amber-700"
          : "border-stone-200 hover:border-amber-600"
        }`}
    >
      <div
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={category.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="block h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            {category.emoji ? (
              <span aria-hidden="true" className="text-4xl sm:text-5xl">
                {category.emoji}
              </span>
            ) : (
              <Package
                aria-hidden="true"
                className="h-10 w-10 text-stone-300"
                strokeWidth={1.25}
              />
            )}
          </div>
        )}

        {isSelected && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-6 w-6 items-center
              justify-center rounded-full bg-amber-800 text-white"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col px-3 py-2.5 sm:px-4">
        <h3
          className="break-words text-sm font-semibold
            leading-5 text-stone-900"
        >
          {category.name}
        </h3>
        <span
          className="mt-auto flex min-h-8 items-center justify-between
            gap-2 pt-1.5 text-xs font-medium text-amber-800"
        >
          Explore collection
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform
              motion-safe:group-hover:translate-x-0.5"
          />
        </span>
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
      className="w-full min-w-0 scroll-mt-28 bg-white pb-5 pt-8 sm:pb-7 sm:pt-10"
    >
      {/* The parent page already supplies outer padding. */}
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-5 sm:mb-6">
          <p
            className="mb-1.5 text-xs font-medium uppercase
              tracking-widest text-amber-800"
          >
            Our collection
          </p>
          <h2
            id="collections-heading"
            className="text-2xl font-semibold tracking-tight
              text-stone-900 sm:text-3xl"
          >
            Shop by category
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Choose a category to explore the collection.
          </p>
        </header>

        {categories.length > 0 ? (
          <div
            className="grid grid-cols-2 items-start gap-3
              sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
          >
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
            className="rounded-xl border border-dashed border-stone-200
              px-5 py-12 text-center"
          >
            <Package
              aria-hidden="true"
              className="mx-auto mb-3 h-8 w-8 text-stone-300"
            />
            <p className="text-sm font-medium text-stone-700">
              No categories available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
