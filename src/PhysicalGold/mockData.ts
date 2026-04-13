// Mock data for features not available from backend

export const getProductTag = (productId: string): string | null => {
  const id = parseInt(productId);
  if (isNaN(id)) return null;
  
  if (id % 5 === 0) return "Bestseller";
  if (id % 3 === 0) return "New";
  if (id % 7 === 0) return "Trending";
  return null;
};

export const getProductRating = (productId: string): number => {
  const id = parseInt(productId);
  if (isNaN(id)) return 4;
  
  // Generate rating between 3.5 and 5
  const ratings = [4, 4.5, 5, 4, 4.5];
  return ratings[id % ratings.length];
};

export const getReviewCount = (productId: string): number => {
  const id = parseInt(productId);
  if (isNaN(id)) return 50;
  
  // Generate review count between 20 and 200
  return 20 + (id % 180);
};

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export const getMockReviews = (productId: string): Review[] => {
  const reviews: Review[] = [
    {
      name: "Priya S.",
      rating: 5,
      text: "Absolutely stunning! The craftsmanship is impeccable and it looks even better in person. The gold quality is excellent.",
      date: "2 weeks ago",
    },
    {
      name: "Anita R.",
      rating: 4,
      text: "Beautiful piece, well worth the price. Delivery was quick and packaging was premium. Highly recommended!",
      date: "1 month ago",
    },
    {
      name: "Meena K.",
      rating: 5,
      text: "Got this for my daughter's wedding. Everyone was asking about it. Pure gold quality and BIS hallmarked.",
      date: "2 months ago",
    },
    {
      name: "Rajesh M.",
      rating: 4,
      text: "Excellent design and finish. The weight is perfect and the purity certificate was included. Very satisfied.",
      date: "3 weeks ago",
    },
    {
      name: "Kavita P.",
      rating: 5,
      text: "This is my third purchase from OxyGold. Never disappointed! The quality is consistent and authentic.",
      date: "1 week ago",
    },
  ];

  // Return 3-5 reviews based on product ID
  const id = parseInt(productId);
  const count = 3 + (id % 3);
  return reviews.slice(0, count);
};

export const trustBadges = [
  { icon: "🏅", label: "BIS Hallmarked" },
  { icon: "🔐", label: "Secure Payments" },
  { icon: "🚚", label: "Insured Delivery" },
  { icon: "✅", label: "Certified Purity" },
  { icon: "♻️", label: "Easy Returns" },
  { icon: "⚡", label: "Live Gold Rates" },
];

export const productSpecifications = {
  finish: "High Polish",
  occasion: "Wedding, Party, Daily Wear",
  collection: "Heritage 2024",
  metal: "Gold",
  warranty: "Lifetime Exchange",
  certification: "BIS Hallmarked",
};

export const shippingInfo = {
  freeShippingThreshold: 50000,
  deliveryTime: "2-3 business days",
  insurance: "Fully insured delivery",
  returnPolicy: "15-day hassle-free returns",
  exchange: "Lifetime exchange with 100% value",
};

export const getDiscountPercentage = (price: number, mrp?: number): number | null => {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const getStockStatusLabel = (stockQuantity: number): { label: string; color: string } | null => {
  if (stockQuantity === 0) {
    return { label: "Out of Stock", color: "rose" };
  }
  if (stockQuantity < 5) {
    return { label: `Only ${stockQuantity} Left!`, color: "amber" };
  }
  return null;
};
