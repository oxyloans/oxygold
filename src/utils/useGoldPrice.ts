import { useState, useEffect } from 'react';
import { API_BASE_URL } from "../Config";

let BASE_URL = API_BASE_URL+"/oxygold-api";


interface GoldPriceData {
  preTaxAmount: string;
  postTaxAmount: string;
  gst: string;
  timestamp: string;
}

export const useGoldPrice = () => {
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoldPrice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/digital-gold/live-price`);
      const data = await response.json();
      
      if (data.success) {
        setGoldPrice(data.data);
        setError(null);
      } else {
        setError('Failed to fetch gold price');
      }
    } catch (err) {
      setError('Network error');
      console.error('Gold price fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();
    const interval = setInterval(fetchGoldPrice, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return { goldPrice, loading, error, refetch: fetchGoldPrice };
};