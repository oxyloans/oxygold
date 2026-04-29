import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { fetchMainCategories } from "../physicalGoldService";
import { Category } from "../physicalGoldData";

const PhysicalGoldLayout: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchMainCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error("Failed to load layout categories:", error));
    }, []);

    useEffect(() => {
        const state = location.state as any;
        if (state?.selectedCategory) {
            setSelectedCategoryId(state.selectedCategory);
        } else if (state?.categoryId) {
            setSelectedCategoryId(state.categoryId);
        } else if (state?.reset) {
            setSelectedCategoryId(undefined);
        } else if (
                   location.pathname === '/physical-gold/cart' || 
                   location.pathname === '/physical-gold/wishlist' ||
                   location.pathname === '/physical-gold/profile' ||
                   location.pathname === '/physical-gold/checkout') {
            setSelectedCategoryId(undefined);
        }
    }, [location.state, location.pathname]);

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        navigate("/physical-gold", {
            state: { selectedCategory: categoryId, timestamp: Date.now() },
            replace: location.pathname === "/physical-gold"
        });
    };

    const handleLogoClick = () => {
        setSelectedCategoryId(undefined);
        navigate("/physical-gold", { replace: true, state: { reset: Date.now() } });
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header
                categories={categories}
                onCategoryClick={handleCategoryClick}
                onLogoClick={handleLogoClick}
                selectedCategoryId={selectedCategoryId}
            />
            <div className="flex-1">
                <Outlet context={{ categories, selectedCategoryId, setSelectedCategoryId }} />
            </div>
            <Footer />
        </div>
    );
};

export default PhysicalGoldLayout;
