import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-jewelry.jpg";
import "../styles.css";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleViewBangles = async () => {
    // Import the service to fetch categories
    const { fetchMainCategories, fetchSubCategories } = await import("../physicalGoldService");
    
    try {
      // Fetch all categories
      const categories = await fetchMainCategories();
      
      // Find the Bangles category (case-insensitive search)
      const banglesCategory = categories.find(cat => 
        cat.name.toLowerCase().includes("bangle")
      );
      
      if (banglesCategory) {
        // Navigate to physical-gold page with the bangles category selected
        navigate("/physical-gold", {
          state: { selectedCategory: banglesCategory.id, timestamp: Date.now() }
        });
      } else {
        // Fallback: just scroll to collections if bangles category not found
        document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Failed to load bangles category:", error);
      // Fallback: scroll to collections
      document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Oxygold luxury gold jewelry collection"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsla(20, 60%, 20%, 0.9), hsla(20, 60%, 20%, 0.7), transparent)" }} />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-xl space-y-6 animate-fade-in-up">
          <p className="text-sm md:text-base uppercase tracking-[0.3em] font-medium" style={{ color: "hsl(40, 70%, 65%)" }}>
            22K Hallmarked Gold
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: "hsl(38, 40%, 95%)" }}>
            Timeless Gold,{" "}
            <span className="text-gradient-gold">
              Crafted
            </span>{" "}
            for You
          </h1>
          <p className="text-base md:text-lg max-w-md leading-relaxed font-body" style={{ color: "hsla(38, 40%, 95%, 0.8)" }}>
            Discover our exquisite collection of handcrafted gold ornaments — from traditional temple jewellery to contemporary designs.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 rounded-full cursor-pointer text-sm uppercase tracking-wider font-semibold h-auto transition-all shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: "hsl(38, 80%, 45%)",
                color: "hsl(30, 15%, 97%)",
              }}
            >
              Explore Collection <ArrowRight className="inline ml-2" size={16} />
            </button>
            <button
              onClick={handleViewBangles}
              className="px-8 py-3 rounded-full cursor-pointer text-sm uppercase tracking-wider h-auto transition-all"
              style={{
                border: "2px solid hsla(38, 40%, 95%, 0.4)",
                color: "hsl(38, 40%, 95%)",
              }}
            >
              View Bangles
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
