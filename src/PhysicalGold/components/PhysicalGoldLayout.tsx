import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { fetchMainCategories } from "../physicalGoldService";
import { Category } from "../physicalGoldData";

const PhysicalGoldLayout: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchMainCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error("Failed to load layout categories:", error));
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        navigate("/physical-gold", {
            state: { selectedCategory: categoryId, timestamp: Date.now() },
            replace: location.pathname === "/physical-gold"
        });
    };

    const handleLogoClick = () => {
        navigate("/physical-gold", { replace: true, state: { reset: Date.now() } });
        setSearchQuery("");
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header
                categories={categories}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCategoryClick={handleCategoryClick}
                onLogoClick={handleLogoClick}
            />
            <div className="flex-1">
                <Outlet context={{ categories, searchQuery, setSearchQuery }} />
            </div>
            <Footer />
        </div>
    );
};

export default PhysicalGoldLayout;
