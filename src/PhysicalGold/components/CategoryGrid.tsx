import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Category } from "../physicalGoldData";
import "../styles.css";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  selectedCategoryId?: string;
}

// Fallback gradient backgrounds per card index
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #2B0A59 0%, #5B2EFF 100%)",
  "linear-gradient(135deg, #7B3F00 0%, #D4AF37 100%)",
  "linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #4a0e8f 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #3d0c02 0%, #8b1a1a 100%)",
];

interface CategoryCardProps {
  cat: Category;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ cat, index, isSelected, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackBg = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const showImage = cat.imageUrl && !imgError;

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 shadow-lg'
          : 'shadow-sm'
      }`}
      style={{ animationDelay: `${index * 80}ms`, aspectRatio: '6/4' }}
    >
      {/* Background: image or styled fallback */}
      {showImage ? (
        <img
          src={cat.imageUrl}
          alt={cat.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          style={{ objectPosition: 'center' }}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: fallbackBg }}
        >
          <span className="text-5xl md:text-6xl drop-shadow-lg">{cat.emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
            {cat.name}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-5">
        <h3 className="font-serif text-sm md:text-base lg:text-lg font-semibold text-white leading-tight">
          {cat.name}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-primary transition-all duration-300 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
          Explore <ArrowRight size={12} />
        </div>
      </div>
    </button>
  );
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick, selectedCategoryId }) => {
  return (
    <section id="collections-section" className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">

        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <p className="text-xs uppercase tracking-[0.25em] mb-2 font-semibold text-primary">
            Our Collection
          </p>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Shop by Category
          </h2>
          <div className="w-14 h-0.5 mx-auto mt-3 bg-primary" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-5 lg:gap-6">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
              isSelected={selectedCategoryId === cat.id}
              onClick={() => onCategoryClick(cat.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;
