import React from "react";
import { ArrowRight } from "lucide-react";
import { Category } from "../physicalGoldData";
import "../styles.css";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick, selectedCategoryId }) => {
  return (
    <section id="collections-section" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto md:px-8 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.25em] mb-2 font-medium text-primary">
            Our Collection
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Shop by Category  
          </h2>
          <div className="w-16 h-0.5 mx-auto mt-4 bg-primary" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-8 md:gap-6">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className={`group relative rounded-md overflow-hidden aspect-square cursor-pointer transition-all ${
                selectedCategoryId === cat.id ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {cat.imageUrl ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary" aria-hidden="true">
                    <span className="text-5xl md:text-6xl">{cat.emoji}</span>
                  </div>
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="relative w-full h-full object-fit transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    width={600}
                    height={600}
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-6xl">{cat.emoji}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="font-serif text-lg md:text-xl font-semibold text-white">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
