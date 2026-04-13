import React, { createContext, useContext, useState, useEffect } from 'react';

interface GoldPriceContextType {
  buyPrice: number;
  sellPrice: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

let BASE_URL = ''; // This will be set from Config
let userType = "prod"; // default to local
if(userType === "local") {
    BASE_URL = "http://65.0.147.157:9900/api";
}
else {
    BASE_URL = "http://meta.oxyloans.com/api";
}


const GoldPriceContext = createContext<GoldPriceContextType | undefined>(undefined);

const BUY_API = `${BASE_URL}/marketing-service/campgin/mmtc-pamp?type=goldBuy`;
const SELL_API = `${BASE_URL}/marketing-service/campgin/mmtc-pamp?type=goldSell`;
const REFRESH_INTERVAL = 60000; // 60 seconds - refresh every minute
const API_TIMEOUT = 10000; // 10 seconds timeout
const DEFAULT_PRICE = 16236;

export const GoldPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyPrice, setBuyPrice] = useState(DEFAULT_PRICE);
  const [sellPrice, setSellPrice] = useState(DEFAULT_PRICE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchWithTimeout = (url: string, timeout: number = API_TIMEOUT): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);

      fetch(url, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const fetchPrices = async () => {
    try {
      const [buyRes, sellRes] = await Promise.all([
        fetchWithTimeout(BUY_API),
        fetchWithTimeout(SELL_API),
      ]);

      if (!buyRes.ok || !sellRes.ok) {
        throw new Error(`API Error: ${buyRes.status} / ${sellRes.status}`);
      }

      const buyData = await buyRes.json();
      const sellData = await sellRes.json();

      console.log('Buy API Response:', buyData);
      console.log('Sell API Response:', sellData);

      const buyDataObj = Array.isArray(buyData?.data) ? buyData?.data?.[0] : buyData?.data;
      const sellDataObj = Array.isArray(sellData?.data) ? sellData?.data?.[0] : sellData?.data;

      const buyPriceValue = buyDataObj?.preTaxAmount;
      const sellPriceValue = sellDataObj?.preTaxAmount;

      console.log('Buy Price Value:', buyPriceValue);
      console.log('Sell Price Value:', sellPriceValue);

      let priceUpdated = false;

      if (buyPriceValue && !isNaN(parseFloat(buyPriceValue))) {
        const parsedBuyPrice = parseFloat(buyPriceValue);
        setBuyPrice(parsedBuyPrice);
        console.log('Buy Price Set:', parsedBuyPrice);
        priceUpdated = true;
      }

      if (sellPriceValue && !isNaN(parseFloat(sellPriceValue))) {
        const parsedSellPrice = parseFloat(sellPriceValue);
        setSellPrice(parsedSellPrice);
        console.log('Sell Price Set:', parsedSellPrice);
        priceUpdated = true;
      }

      if (priceUpdated) {
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setError(null);
      }

      setLoading(false);
    } catch (err: unknown) {
      console.error('Price fetch error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch prices';
      
      // Only set error on first load, not on refresh failures
      if (loading) {
        setError(errorMsg);
      }
      
      setLoading(false);
      console.log('Using fallback prices:', { buyPrice, sellPrice });
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval for periodic updates
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <GoldPriceContext.Provider value={{ buyPrice, sellPrice, loading, error, lastUpdated }}>
      {children}
    </GoldPriceContext.Provider>
  );
};

export const useGoldPrice = (): GoldPriceContextType => {
  const context = useContext(GoldPriceContext);
  if (!context) {
    throw new Error('useGoldPrice must be used within GoldPriceProvider');
  }
  return context;
};
