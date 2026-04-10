import { useState, useEffect } from 'react';

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
      const response = await fetch('http://65.0.147.157:9900/api/digital-gold/live-price');
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