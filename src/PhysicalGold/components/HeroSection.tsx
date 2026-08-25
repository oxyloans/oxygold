import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-jewelry.jpg";
import "../styles.css";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const isSilver = activeSlide === 1;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % 2);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const handleViewBangles = async () => {
    // Import the service to fetch categories
    const { fetchMainCategories } = await import("../physicalGoldService");
    
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

  const handleViewSilver = async () => {
    const { fetchMainCategories } = await import("../physicalGoldService");

    try {
      const categories = await fetchMainCategories();
      const silverCategory = categories.find((cat) => /silver/i.test(cat.name));

      if (silverCategory) {
        navigate("/physical-gold", {
          state: { selectedCategory: silverCategory.id, timestamp: Date.now() }
        });
      } else {
        document.getElementById("collections-section")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Failed to load silver category:", error);
      document.getElementById("collections-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-section__inner">
        <div className={`hero-section__copy ${isSilver ? "hero-section__copy--silver" : ""} animate-fade-in-up`}>
          <div className="hero-section__eyebrow">
            <span className="hero-section__eyebrow-line" />
            <p>{isSilver ? "Pure Silver Collection" : "22K Hallmarked Gold"}</p>
          </div>
          <h1 className="hero-section__title">
            {isSilver ? "Quiet shine," : "Timeless gold,"}
            <em>{isSilver ? "beautifully yours." : "crafted for you."}</em>
          </h1>
          <p className="hero-section__description">
            {isSilver
              ? "Contemporary silver pieces with a soft, luminous finish for everyday rituals and celebrations."
              : "Heirloom-worthy pieces, shaped by skilled hands and designed to become part of your story."}
          </p>
          <div className="hero-section__actions">
            <button
              onClick={() => document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hero-section__primary"
            >
              Explore collection <ArrowRight size={17} />
            </button>
            <button onClick={isSilver ? handleViewSilver : handleViewBangles} className="hero-section__secondary">
              {isSilver ? "View silver" : "View bangles"}
            </button>
          </div>
          <div className="hero-section__details" aria-label="Collection details">
            <span>01 <strong>{isSilver ? "925 purity" : "Curated designs"}</strong></span>
            <span>02 <strong>{isSilver ? "Everyday elegance" : "Made to last"}</strong></span>
          </div>
        </div>

        <div className={`hero-section__visual ${isSilver ? "hero-section__visual--silver" : ""}`}>
          <img
            src={heroImage}
            alt="Oxygold luxury gold jewelry collection"
            className="hero-section__image"
            width={1220}
            height={500}
          />
          <div className="hero-section__visual-shade" />
          <div className="hero-section__badge">
            <span>{isSilver ? "Pure" : "Since"}</span>
            <strong>{isSilver ? "925" : "1995"}</strong>
            <small>{isSilver ? "Silver finish" : "Crafting brilliance"}</small>
          </div>
          <p className="hero-section__caption">{isSilver ? "A cooler kind of brilliance" : "The art of adornment"}</p>
          <div className="hero-section__controls" aria-label="Choose collection">
            {["Gold", "Silver"].map((label, index) => (
              <button
                key={label}
                type="button"
                aria-label={`Show ${label} collection`}
                aria-current={activeSlide === index}
                className={activeSlide === index ? "is-active" : ""}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
