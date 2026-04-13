// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useGoldPrice } from '../context/GoldPriceContext';
// import { usePurchasePrice } from '../context/PurchaseContext';

// const PREVIEW_API = 'http://65.0.147.157:9900/api/digital-gold/preview-buy';
// const TRANSACTIONS_API = 'http://65.0.147.157:9900/api/digital-gold/transactions';

// interface Transaction {
//   date: string;
//   type: string;
//   grams: string;
//   amount: number;
//   status: string;
//   pricePerGram: number;
//   transactionId: string;
// }

// interface BuyGoldProps {
//   onDataPass: (data: any) => void;
// }

// const BuyGold = ({ onDataPass }: BuyGoldProps) => {
//   const navigate = useNavigate();
//   const { buyPrice: livePrice, loading: priceLoading, error: priceError } = useGoldPrice();
//   const { setPurchasePrice } = usePurchasePrice();
//   const [buyMode, setBuyMode] = useState<'rupees' | 'grams'>('rupees');
//   const [amount, setAmount] = useState('');
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [previewError, setPreviewError] = useState('');
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [txnLoading, setTxnLoading] = useState(true);
//   const { purchasePrice } = usePurchasePrice();
  
//   // Calculate totals from transaction history
//   const calculatePortfolioData = () => {
//     let totalGoldGrams = 0;
//     let totalInvestedAmount = 0;

//     transactions.forEach((txn) => {
//       if (txn.status !== 'Completed') return;

//       const grams = parseFloat(txn.grams);
//       const amount = txn.amount;

//       if (txn.type === 'Buy') {
//         totalGoldGrams += grams;
//         totalInvestedAmount += amount;
//       } else if (txn.type === 'Sell') {
//         totalGoldGrams -= grams;
//       }
//     });

//     return {
//       goldBalance: totalGoldGrams,
//       investedAmount: totalInvestedAmount,
//     };
//   };

//   const portfolioData = calculatePortfolioData();
//   const goldBalance = portfolioData.goldBalance;
//   const investedAmount = portfolioData.investedAmount;
//   const goldRate = livePrice;
//   const currentValue = goldBalance * goldRate;
//   const gain = currentValue - investedAmount;
//   const gainPercent = investedAmount > 0 ? ((gain / investedAmount) * 100).toFixed(2) : '0.00';

//   const getUser = () => {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     return user?.data?.userId || user?.userId || 7;
//   };

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         setTxnLoading(true);
//         const userId = getUser();
//         const res = await fetch(`${TRANSACTIONS_API}?userId=${userId}`);
//         const data = await res.json();
        
//         if (res.ok && data.success) {
//           const formattedTransactions = (data.data || []).map((txn: any) => ({
//             date: new Date(txn.createdAt).toLocaleDateString('en-IN', {
//               year: 'numeric',
//               month: '2-digit',
//               day: '2-digit',
//             }),
//             type: txn.type === 'BUY' ? 'Buy' : 'Sell',
//             grams: parseFloat(txn.grams).toFixed(6),
//             amount: txn.amount,
//             status: txn.status === 'SUCCESS' ? 'Completed' : txn.status,
//             pricePerGram: txn.pricePerGram,
//             transactionId: txn.transactionId,
//           }));
//           setTransactions(formattedTransactions);
//         } else {
//           setTransactions([]);
//         }
//       } catch (err: unknown) {
//         console.error('Transactions fetch error:', err);
//         setTransactions([]);
//       } finally {
//         setTxnLoading(false);
//       }
//     };
//     fetchTransactions();
//   }, []);

//   const calculateValues = (inputValue: string, mode: 'rupees' | 'grams') => {
//     const value = parseFloat(inputValue);
//     if (!value || value <= 0) return null;

//     if (mode === 'rupees') {
//       const total = value;
//       const goldValue = total / 1.03;
//       const gst = total - goldValue;
//       const grams = goldValue / goldRate;

//       return {
//         buyMode: 'rupees',
//         amount: total,
//         grams: grams,
//         rupees: goldValue,
//         gst: gst,
//         total: total,
//         goldRate: goldRate,
//       };
//     } else {
//       const grams = value;
//       const goldValue = grams * goldRate;
//       const gst = goldValue * 0.03;
//       const total = goldValue + gst;

//       return {
//         buyMode: 'grams',
//         amount: total,
//         grams: grams,
//         rupees: goldValue,
//         gst: gst,
//         total: total,
//         goldRate: goldRate,
//       };
//     }
//   };

//   const handlePreview = async () => {
//     const value = parseFloat(amount);
//     if (!value || value <= 0) { 
//       setPreviewError('Please enter a valid amount'); 
//       return; 
//     }
    
//     const userId = getUser();
//     setPreviewLoading(true);
//     setPreviewError('');
    
//     try {
//       // Fetch latest live price before locking
//       const lockedPrice = livePrice;
//       const lockedTime = Date.now();
      
//       console.log('Price locked at:', lockedPrice, 'Time:', new Date(lockedTime).toLocaleTimeString());
      
//       const calculatedValues = calculateValues(amount, buyMode);
//       if (!calculatedValues) {
//         throw new Error('Invalid calculation');
//       }

//       // Recalculate with locked price
//       const recalculatedValues = {
//         ...calculatedValues,
//         goldRate: lockedPrice,
//         grams: buyMode === 'rupees' ? (calculatedValues.rupees / lockedPrice) : calculatedValues.grams,
//         rupees: buyMode === 'grams' ? (calculatedValues.grams * lockedPrice) : calculatedValues.rupees,
//       };
      
//       recalculatedValues.gst = recalculatedValues.rupees * 0.03;
//       recalculatedValues.total = recalculatedValues.rupees + recalculatedValues.gst;

//       const res = await fetch(PREVIEW_API, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           userId,
//           purchaseType: buyMode === 'rupees' ? 'AMOUNT' : 'GRAMS',
//           amount: buyMode === 'rupees' ? recalculatedValues.total : 0,
//           grams: buyMode === 'grams' ? recalculatedValues.grams : 0,
//           paymentMode: 'WALLET',
//           pergramPrice: lockedPrice,
//           productId: 4,
//         }),
//       });
      
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || 'Preview failed');
      
//       setPurchasePrice(lockedPrice);
      
//       navigate('/review-order', {
//         state: {
//           preview: data.data,
//           buyMode,
//           userId,
//           amount: recalculatedValues.total,
//           grams: recalculatedValues.grams,
//           rupees: recalculatedValues.rupees,
//           gst: recalculatedValues.gst,
//           total: recalculatedValues.total,
//           goldRate: lockedPrice,
//           lockedTime: lockedTime,
//           timeLeft: 300,
//         },
//       });
//     } catch (err: unknown) {
//       setPreviewError(err instanceof Error ? err.message : 'Something went wrong');
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .bg-page {
//           min-height: 100vh;
//           background: #f8f6fb;
//           font-family: 'Inter', sans-serif;
//           color: #1a1a2e;
//         }

//         .bg-banner {
//           background: linear-gradient(135deg, #442b75 0%, #27164d 100%);
//           padding: 24px 64px; border-bottom: 1px solid rgba(217,160,32,0.15);
//         }
//         .bg-banner-in {
//           max-width: 1200px; margin: 0 auto;
//           display: flex; flex-direction: column; gap: 8px; text-align: center;
//         }
//         .bg-banner-title {
//           font-size: 1.6rem; font-weight: 700; color: #fff;
//           letter-spacing: -0.01em; line-height: 1.2;
//         }
//         .bg-banner-sub {
//           font-size: 0.85rem; color: rgba(255,255,255,0.65);
//           font-weight: 400;
//         }
//         .bg-live {
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           font-size: 0.8rem; color: rgba(255,255,255,0.7);
//         }
//         .bg-live-dot {
//           width: 5px; height: 5px; border-radius: 50%;
//           background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
//         }
//         @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5);}50%{box-shadow:0 0 0 6px rgba(74,222,128,0);} }
//         .bg-live-price { font-weight: 600; color: #f0bb3a; }

//         .bg-main {
//           max-width: 1000px;
//           margin: 0 auto;
//           padding: 28px 48px 48px;
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           align-items: start;
//         }

//         .bg-card {
//           background: #ffffff;
//           border: 1px solid #ede8f5;
//           border-radius: 12px;
//           padding: 20px 22px;
//           position: relative; overflow: hidden;
//         }
//         .bg-card::before {
//           content: '';
//           position: absolute; top: 0; left: 0; right: 0; height: 2px;
//           background: linear-gradient(90deg, #7c3aed, #d9a020, #f0bb3a);
//           opacity: 0.55;
//         }
//         .bg-card-lbl {
//           font-size: 0.63rem; font-weight: 600;
//           text-transform: uppercase; letter-spacing: 0.1em;
//           color: #aaa; margin-bottom: 14px;
//           display: flex; align-items: center; gap: 8px;
//         }
//         .bg-card-lbl::after {
//           content: ''; flex: 1; height: 1px; background: #f0eaf8;
//         }

//         .bg-left { display: flex; flex-direction: column; gap: 16px; }

//         .bg-port-val {
//           font-size: 1.75rem; font-weight: 700;
//           color: #d9a020; letter-spacing: -0.02em;
//           line-height: 1; margin-bottom: 4px;
//         }
//         .bg-port-grams { font-size: 0.76rem; color: #999; margin-bottom: 12px; }
//         .bg-port-gain {
//           display: inline-flex; align-items: center; gap: 5px;
//           padding: 4px 10px; border-radius: 5px;
//           font-size: 0.72rem; font-weight: 600;
//         }
//         .bg-port-gain.gain {
//           background: #f0fdf4; border: 1px solid #bbf7d0;
//           color: #16a34a;
//         }
//         .bg-port-gain.loss {
//           background: #fef2f2; border: 1px solid #fecaca;
//           color: #dc2626;
//         }

//         .bg-feat {
//           display: flex; align-items: flex-start; gap: 12px;
//           padding: 10px 0;
//           border-bottom: 1px solid #f5f0fc;
//         }
//         .bg-feat:last-child { border-bottom: none; padding-bottom: 0; }
//         .bg-feat:first-child { padding-top: 0; }
//         .bg-feat-num {
//           font-size: 0.6rem; font-weight: 700;
//           color: #d4c0ee; width: 18px; flex-shrink: 0; margin-top: 2px;
//         }
//         .bg-feat-title {
//           font-size: 0.82rem; font-weight: 600;
//           color: #1a1a2e; margin-bottom: 2px;
//         }
//         .bg-feat-desc { font-size: 0.72rem; color: #999; line-height: 1.5; }

//         .bg-right { position: sticky; top: 20px; }

//         .bg-toggle {
//           display: flex;
//           background: #f5f0fc;
//           border: 1px solid #e8e0f0;
//           border-radius: 7px;
//           padding: 3px;
//           margin-bottom: 14px;
//         }
//         .bg-tgl-btn {
//           flex: 1; padding: 8px 10px;
//           border-radius: 5px;
//           font-family: 'Inter', sans-serif;
//           font-size: 0.8rem; font-weight: 500;
//           border: none; cursor: pointer;
//           background: transparent; color: #999;
//           transition: all 0.18s;
//         }
//         .bg-tgl-btn.active {
//           background: #fff;
//           color: #1a1a2e; font-weight: 600;
//           border: 1px solid #e0d8f0;
//           box-shadow: 0 1px 4px rgba(0,0,0,0.07);
//         }

//         .bg-input {
//           width: 100%;
//           padding: 10px 14px;
//           background: #faf8ff;
//           border: 1px solid #e0d8f0;
//           border-radius: 7px;
//           font-family: 'Inter', sans-serif;
//           font-size: 0.88rem; color: #1a1a2e;
//           outline: none; margin-bottom: 8px;
//           transition: border-color 0.18s, box-shadow 0.18s;
//         }
//         .bg-input:focus {
//           border-color: #9b72cf;
//           box-shadow: 0 0 0 3px rgba(124,58,237,0.07);
//           background: #fff;
//         }
//         .bg-input::placeholder { color: #bbb; }

//         .bg-quick { display: flex; gap: 7px; margin-bottom: 12px; flex-wrap: wrap; }
//         .bg-q-btn {
//           flex: 1; min-width: 68px;
//           padding: 8px 10px;
//           background: #f5f0fc;
//           border: 1px solid #e8e0f0;
//           border-radius: 7px;
//           font-family: 'Inter', sans-serif;
//           font-size: 0.77rem; font-weight: 500;
//           color: #555; cursor: pointer;
//           transition: border-color 0.18s, color 0.18s, background 0.18s;
//           text-align: center;
//         }
//         .bg-q-btn:hover {
//           border-color: #d9a020;
//           color: #b8860b;
//           background: #fffbf0;
//         }

//         .bg-error {
//           font-size: 0.75rem; color: #dc2626;
//           padding: 7px 10px; border-radius: 6px;
//           background: #fef2f2; border: 1px solid rgba(220,38,38,0.15);
//           margin-bottom: 10px;
//         }

//         .bg-spin {
//           width: 14px; height: 14px; border-radius: 50%;
//           border: 2px solid rgba(26,13,5,0.2);
//           border-top-color: #1a0d05;
//           animation: spin 0.65s linear infinite;
//           display: inline-block;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         .bg-buy-btn {
//           width: 100%; padding: 12px;
//           background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
//           color: #1a0d05;
//           font-family: 'Inter', sans-serif;
//           font-size: 0.9rem; font-weight: 700;
//           border: none; border-radius: 7px; cursor: pointer;
//           transition: box-shadow 0.2s, filter 0.2s;
//           margin-bottom: 10px;
//           box-shadow: 0 3px 12px rgba(217,160,32,0.25);
//           letter-spacing: 0.01em;
//         }
//         .bg-buy-btn:hover {
//           filter: brightness(1.05);
//           box-shadow: 0 6px 20px rgba(217,160,32,0.35);
//         }
//         .bg-footnote {
//           text-align: center; font-size: 0.67rem; color: #bbb;
//         }

//         .price-spinner {
//           width: 10px; height: 10px; border-radius: 50%;
//           border: 1.5px solid rgba(217,160,32,0.2);
//           border-top-color: #d9a020;
//           animation: spin 0.6s linear infinite;
//           display: inline-block;
//         }

//         @media (max-width: 768px) {
//           .bg-banner { padding: 12px 20px; }
//           .bg-main { grid-template-columns: 1fr; padding: 20px; gap: 16px; }
//           .bg-right { position: static; }
//           .bg-live { display: none; }
//         }
//       `}</style>

//       <div className="bg-page">

//         <section className="bg-banner">
//           <div className="bg-banner-in">
//             <h1 className="bg-banner-title">Buy Digital Gold</h1>
//             <p className="bg-banner-sub">24K · 999 Purity · Secure Vault Storage</p>
//             <div className="bg-live">
//               <span className="bg-live-dot" />
//               <span>Live Rate:</span>
//               <span className="bg-live-price">₹{goldRate?.toFixed(2)} / gram</span>
//               {priceLoading && <span className="price-spinner" style={{ marginLeft: '8px' }} />}
//             </div>
//           </div>
//         </section>

//         <main className="bg-main">

//           <div className="bg-left">

//             <div className="bg-card">
//               <div className="bg-card-lbl">Your Gold Portfolio</div>
//               {txnLoading ? (
//                 <div style={{ padding: '20px 0', textAlign: 'center' }}>
//                   <span className="bg-spin" />
//                 </div>
//               ) : (
//                 <>
//                   <div className="bg-port-val">₹{currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
//                   <div className="bg-port-grams">{goldBalance.toFixed(6)} grams · Invested: ₹{investedAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
//                   <div className={`bg-port-gain ${gain >= 0 ? 'gain' : 'loss'}`}>
//                     {gain >= 0 ? '▲' : '▼'} {gain >= 0 ? '+' : ''}₹{Math.abs(gain).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({gain >= 0 ? '+' : ''}{gainPercent}%)
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="bg-card">
//               <div className="bg-card-lbl">Why Buy With Us</div>
//               {[
//                 { t: 'Bank-Grade Security',  d: 'Your gold is 100% secure in insured vaults' },
//                 { t: 'Instant Trading',       d: 'Buy and sell anytime at live market prices' },
//                 { t: 'Transparent Pricing',   d: 'All taxes and charges included upfront' },
//               ].map((f, i) => (
//                 <div className="bg-feat" key={i}>
//                   <span className="bg-feat-num">0{i + 1}</span>
//                   <div>
//                     <div className="bg-feat-title">{f.t}</div>
//                     <div className="bg-feat-desc">{f.d}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//           </div>

//           <div className="bg-right">
//             <div className="bg-card">
//               <div className="bg-card-lbl">Buy Gold</div>

//               <div className="bg-toggle">
//                 <button
//                   className={`bg-tgl-btn${buyMode === 'rupees' ? ' active' : ''}`}
//                   onClick={() => { setBuyMode('rupees'); setAmount(''); setPreviewError(''); }}
//                 >
//                   Buy in Rupees
//                 </button>
//                 <button
//                   className={`bg-tgl-btn${buyMode === 'grams' ? ' active' : ''}`}
//                   onClick={() => { setBuyMode('grams'); setAmount(''); setPreviewError(''); }}
//                 >
//                   Buy in Grams
//                 </button>
//               </div>

//               <input
//                 type="number"
//                 className="bg-input"
//                 placeholder={buyMode === 'rupees' ? 'Enter amount in ₹' : 'Enter grams'}
//                 value={amount}
//                 onChange={(e) => { setAmount(e.target.value); setPreviewError(''); }}
//               />

//               {buyMode === 'rupees' && (
//                 <div className="bg-quick">
//                   {[100, 500, 1000, 10000].map((v) => (
//                     <button key={v} className="bg-q-btn" onClick={() => { setAmount(v.toString()); setPreviewError(''); }}>
//                       ₹{v.toLocaleString()}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {previewError && <div className="bg-error">{previewError}</div>}

//               <button className="bg-buy-btn" onClick={handlePreview} disabled={previewLoading}>
//                 {previewLoading ? <span className="bg-spin" /> : 'Proceed to Payment →'}
//               </button>

//               <div className="bg-footnote">Minimum purchase ₹100 · GST included</div>
//             </div>
//           </div>

//         </main>
//       </div>
//     </>
//   );
// };

// export default BuyGold;




import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoldPrice } from '../context/GoldPriceContext';
import { usePurchasePrice } from '../context/PurchaseContext';
import { apiCall } from '../utils/tokenManager';
import { getCurrentUser } from '../utils/userUtils';
import { API_BASE_URL } from '../Config';

const PREVIEW_API = `${API_BASE_URL}/oxygold-api/digital-gold/preview-buy`;
const TRANSACTIONS_API = `${API_BASE_URL}/oxygold-api/digital-gold/transactions`;
const WALLET_API = `${API_BASE_URL}/oxygold-api/digital-gold/wallet`;

interface Transaction {
  date: string;
  type: string;
  grams: string;
  amount: number;
  status: string;
  pricePerGram: number;
  transactionId: string;
}

interface WalletData {
  goldBalanceGrams: number;
  investedAmount: number;
  currentValue?: number;
  totalInvestedAmount?: number;
}

interface BuyGoldProps {
  onDataPass: (data: any) => void;
  portfolioData?: {
    goldBalanceGrams: number;
    currentValue: number;
    totalInvestedAmount: number;
  };
}

const BuyGold = ({ onDataPass, portfolioData }: BuyGoldProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { buyPrice: livePrice, loading: priceLoading, error: priceError } = useGoldPrice();
  const { setPurchasePrice } = usePurchasePrice();
  const [buyMode, setBuyMode] = useState<'rupees' | 'grams'>('rupees');
  const [amount, setAmount] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const { purchasePrice } = usePurchasePrice();

  // Get portfolio data from navigation state or props
  const passedPortfolioData = location.state?.portfolioData || portfolioData;

  const calculatePortfolioData = () => {
    let totalGoldGrams = 0;
    let totalInvestedAmount = 0;
    transactions.forEach((txn) => {
      // Only process SUCCESS transactions for portfolio calculations
      if (txn.status !== 'Completed') return;
      const grams = parseFloat(txn.grams);
      const amount = txn.amount;
      if (txn.type === 'Buy') {
        totalGoldGrams += grams;
        totalInvestedAmount += amount;
      } else if (txn.type === 'Sell') {
        totalGoldGrams -= grams;
        // For sell transactions, reduce invested amount proportionally
        if (totalGoldGrams + grams > 0) {
          const avgBuyPrice = totalInvestedAmount / (totalGoldGrams + grams);
          totalInvestedAmount -= grams * avgBuyPrice;
        }
      }
    });
    return {
      goldBalance: Math.max(0, totalGoldGrams),
      investedAmount: Math.max(0, totalInvestedAmount),
    };
  };

  // PORTFOLIO PERFORMANCE CALCULATION - USING WALLET API VALUES
  const goldRate = livePrice || 0;
  
  // Always use transaction-based calculation for invested amount since wallet API doesn't provide it
  const transactionBasedData = calculatePortfolioData();
  
  // Use wallet API data when available, fallback to calculated values
  const goldBalance =
    walletData && !walletLoading
      ? walletData.goldBalanceGrams || 0
      : transactionBasedData.goldBalance;
  
  // Get total invested amount (includes GST) from wallet API
  const totalInvestedAmount = 
    walletData && !walletLoading && walletData.totalInvestedAmount
      ? walletData.totalInvestedAmount
      : walletData && !walletLoading && walletData.investedAmount
        ? walletData.investedAmount
        : transactionBasedData.investedAmount;

  // Calculate current portfolio value using live price
  const currentValue = Math.round(goldBalance * goldRate * 100) / 100;
  
  // Calculate gain or loss using wallet API invested amount (includes GST)
  const gainLoss = Math.round((currentValue - totalInvestedAmount) * 100) / 100;
  
  // Calculate return percentage
  const returnPercentage = totalInvestedAmount > 0 
    ? Math.round((gainLoss / totalInvestedAmount) * 100 * 100) / 100 
    : 0;
  
  // Determine if it's profit or loss
  const isProfit = gainLoss >= 0;
  const performanceLabel = isProfit ? "Profit" : "Loss";
  
  // Additional metrics
  const avgBuyPrice = goldBalance > 0 ? Math.round((totalInvestedAmount / goldBalance) * 100) / 100 : 0;

  // Debug: Portfolio Performance Calculation
  console.log("=== BUYGOLD PORTFOLIO PERFORMANCE ===");
  console.log("📊 Input Data:");
  console.log(`   Gold Balance: ${goldBalance} grams`);
  console.log(`   Live Price: ₹${goldRate}/gram`);
  console.log(`   Total Invested (from wallet API): ₹${totalInvestedAmount}`);
  console.log("📈 Calculations:");
  console.log(`   Current Value = ${goldBalance} × ₹${goldRate} = ₹${currentValue}`);
  console.log(`   ${performanceLabel} = ₹${currentValue} - ₹${totalInvestedAmount} = ₹${Math.abs(gainLoss)}`);
  console.log(`   Return % = (₹${gainLoss} ÷ ₹${totalInvestedAmount}) × 100 = ${returnPercentage}%`);
  console.log(`   Average Buy Price: ₹${avgBuyPrice}/gram`);
  console.log("💡 Result:", isProfit ? `🟢 ${performanceLabel}` : `🔴 ${performanceLabel}`);

  const getUser = () => {
    return getCurrentUser();
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setWalletLoading(true);
        const userId = getUser();
        const data = await apiCall(`${WALLET_API}/${userId}`);
        if (!data.success) {
          if (
            data.message?.includes("not found") ||
            data.message?.includes("No wallet")
          ) {
            setWalletData({ goldBalanceGrams: 0, investedAmount: 0 });
          } else {
            throw new Error(data.message || "Failed to fetch wallet data");
          }
        } else {
          setWalletData(data.data);
        }
      } catch (err: unknown) {
        console.error("Error fetching wallet data:", err);
        setWalletData({ goldBalanceGrams: 0, investedAmount: 0 });
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTxnLoading(true);
        const userId = getUser();
        const data = await apiCall(`${TRANSACTIONS_API}?userId=${userId}`);
        
        if (!data.success) {
          if (
            data.message?.includes("not found") ||
            data.message?.includes("No transactions")
          ) {
            setTransactions([]);
          } else {
            throw new Error(data.message || "Failed to fetch transactions");
          }
        } else {
          const formattedTransactions = (data.data || [])
            .filter((txn: any) => txn.status !== "PENDING") // Filter out pending transactions
            .map((txn: any) => ({
              date: new Date(txn.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              type: txn.type === 'BUY' ? 'Buy' : 'Sell',
              grams: parseFloat(txn.grams).toFixed(6),
              amount: txn.amount,
              status: txn.status === 'SUCCESS' ? 'Completed' : txn.status,
              pricePerGram: txn.pricePerGram,
              transactionId: txn.transactionId,
            }));
          setTransactions(formattedTransactions);
        }
      } catch (err: unknown) {
        console.error('Error fetching transactions:', err);
        setTransactions([]);
      } finally {
        setTxnLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const calculateValues = (inputValue: string, mode: 'rupees' | 'grams') => {
    const value = parseFloat(inputValue);
    if (!value || value <= 0) return null;
    if (mode === 'rupees') {
      const total = Math.round(value * 100) / 100;
      // For cleaner display: calculate GST as 3% of total, then gold value
      const gst = Math.round((total * 0.03) * 100) / 100;
      const goldValue = Math.round((total - gst) * 100) / 100;
      const grams = goldValue / goldRate;
      return { buyMode: 'rupees', amount: total, grams, rupees: goldValue, gst, total, goldRate };
    } else {
      const grams = Math.round(value * 1000000) / 1000000; // Round grams to 6 decimal places
      const goldValue = Math.round((grams * goldRate) * 100) / 100;
      const gst = Math.round((goldValue * 0.03) * 100) / 100;
      const total = Math.round((goldValue + gst) * 100) / 100;
      return { buyMode: 'grams', amount: total, grams, rupees: goldValue, gst, total, goldRate };
    }
  };

  const handlePreview = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) { setPreviewError('Please enter a valid amount'); return; }
    const userId = getUser();
    setPreviewLoading(true);
    setPreviewError('');
    try {
      const lockedPrice = livePrice;
      const lockedTime = Date.now();
      console.log('Price locked at:', lockedPrice, 'Time:', new Date(lockedTime).toLocaleTimeString());
      const calculatedValues = calculateValues(amount, buyMode);
      if (!calculatedValues) throw new Error('Invalid calculation');
      const recalculatedValues = {
        ...calculatedValues,
        goldRate: lockedPrice,
        // Keep the original calculated values to maintain consistency
        grams: calculatedValues.grams,
        rupees: calculatedValues.rupees,
        gst: calculatedValues.gst,
        total: calculatedValues.total,
      };
      const res = await apiCall(PREVIEW_API, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          purchaseType: buyMode === 'rupees' ? 'AMOUNT' : 'GRAMS',
          amount: buyMode === 'rupees' ? recalculatedValues.total : 0,
          grams: buyMode === 'grams' ? recalculatedValues.grams : 0,
          paymentMode: 'WALLET',
          pergramPrice: lockedPrice,
          productId: 4,
        }),
      });
      if (!res.success) throw new Error(res.message || 'Preview failed');
      setPurchasePrice(lockedPrice);
      navigate('/review-order', {
        state: {
          preview: res.data, buyMode, userId,
          amount: recalculatedValues.total, grams: recalculatedValues.grams,
          rupees: recalculatedValues.rupees, gst: recalculatedValues.gst,
          total: recalculatedValues.total, goldRate: lockedPrice,
          lockedTime, timeLeft: 300,
        },
      });
    } catch (err: unknown) {
      setPreviewError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPreviewLoading(false);
    }
  };

  const calc = calculateValues(amount, buyMode);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bg-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .bg-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .bg-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .bg-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .bg-banner-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400;
        }
        .bg-live {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .bg-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .bg-live-price { font-weight: 600; color: #f0bb3a; }

        /* ── LAYOUT ── */
        .bg-main {
          max-width: 960px; margin: 0 auto;
          padding: 28px 40px 52px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: start;
        }

        /* ── CARD ── */
        .bg-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 20px 22px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .bg-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .bg-card-lbl {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .bg-card-lbl::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .bg-left { display: flex; flex-direction: column; gap: 16px; }

        /* ── PORTFOLIO ── */
        .bg-port-val {
          font-size: 1.65rem; font-weight: 600;
          color: #c8900a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 5px;
        }
        .bg-port-grams {
          font-size: 0.74rem; color: #9eaab8; margin-bottom: 12px; font-weight: 400;
        }
        .bg-port-gain {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 5px;
          font-size: 0.71rem; font-weight: 500;
        }
        .bg-port-gain.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .bg-port-gain.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        
        /* Portfolio card hover effect */
        .bg-card[style*="cursor: pointer"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }

        /* ── WHY BUY ── */
        .bg-feat {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 10px 0; border-bottom: 1px solid #f4f5f7;
        }
        .bg-feat:last-child { border-bottom: none; padding-bottom: 0; }
        .bg-feat:first-child { padding-top: 0; }
        .bg-feat-num {
          font-size: 0.58rem; font-weight: 500; color: #c8c0b0;
          width: 16px; flex-shrink: 0; margin-top: 2px;
        }
        .bg-feat-title { font-size: 0.81rem; font-weight: 600; color: #1c2b3a; margin-bottom: 2px; }
        .bg-feat-desc { font-size: 0.71rem; color: #8a96a3; line-height: 1.55; font-weight: 400; }

        /* ── BUY FORM ── */
        .bg-right { position: sticky; top: 20px; }

        .bg-rate-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #fffcf2; border: 1px solid #f0e0a0;
          border-radius: 7px; padding: 9px 13px; margin-bottom: 13px;
        }
        .bg-rate-label {
          font-size: 0.64rem; color: #b8900a; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .bg-rate-val { font-size: 0.86rem; font-weight: 600; color: #b8720a; }

        .bg-toggle {
          display: flex; background: #f4f5f7;
          border: 1px solid #e4e7eb; border-radius: 7px;
          padding: 3px; margin-bottom: 13px;
        }
        .bg-tgl-btn {
          flex: 1; padding: 7px 10px; border-radius: 5px;
          font-family: 'Sora', sans-serif;
          font-size: 0.77rem; font-weight: 400;
          border: none; cursor: pointer;
          background: transparent; color: #9eaab8; transition: all 0.18s;
        }
        .bg-tgl-btn.active {
          background: #fff; color: #1c2b3a; font-weight: 600;
          border: 1px solid #e0e4e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .bg-input {
          width: 100%; padding: 10px 13px;
          background: #fafbfc; border: 1px solid #e0e4e8;
          border-radius: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 0.86rem; color: #1c2b3a; font-weight: 400;
          outline: none; margin-bottom: 10px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .bg-input:focus {
          border-color: #1a3060;
          box-shadow: 0 0 0 3px rgba(26,48,96,0.07);
          background: #fff;
        }
        .bg-input::placeholder { color: #bcc5cf; }

        .bg-quick { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
        .bg-q-btn {
          flex: 1; min-width: 64px; padding: 7px 8px;
          background: #f7f8fa; border: 1px solid #e4e7eb;
          border-radius: 6px;
          font-family: 'Sora', sans-serif;
          font-size: 0.74rem; font-weight: 500;
          color: #4a5a6a; cursor: pointer;
          transition: all 0.16s; text-align: center;
        }
        .bg-q-btn:hover { border-color: #d9a020; color: #b8720a; background: #fffcf0; }

        .bg-calc {
          background: #fafbfc; border: 1px solid #e8ecf0;
          border-radius: 8px; padding: 11px 13px; margin-bottom: 13px;
        }
        .bg-calc-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.74rem; color: #9eaab8; padding: 3px 0; font-weight: 400;
        }
        .bg-calc-row.total {
          border-top: 1px solid #eaecef;
          margin-top: 6px; padding-top: 8px;
          font-size: 0.8rem; font-weight: 600; color: #1c2b3a;
        }
        .bg-calc-val { font-weight: 500; color: #3a4a5a; }
        .bg-calc-gold { font-weight: 600; color: #b8720a; }

        .bg-error {
          font-size: 0.74rem; color: #dc2626;
          padding: 7px 11px; border-radius: 6px;
          background: #fef2f2; border: 1px solid rgba(220,38,38,0.12);
          margin-bottom: 11px;
        }

        .bg-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(28,43,58,0.15); border-top-color: #1c2b3a;
          animation: spin 0.65s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .bg-buy-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
          color: #0d1f3c;
          font-family: 'Sora', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          margin-bottom: 10px;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
          letter-spacing: 0.01em;
        }
        .bg-buy-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .bg-buy-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .bg-footnote { text-align: center; font-size: 0.64rem; color: #bcc5cf; font-weight: 400; }

        .price-spinner {
          width: 9px; height: 9px; border-radius: 50%;
          border: 1.5px solid rgba(217,160,32,0.2); border-top-color: #d9a020;
          animation: spin 0.6s linear infinite; display: inline-block;
        }

        @media (max-width: 768px) {
          .bg-banner { padding: 16px 20px; }
          .bg-main { grid-template-columns: 1fr; padding: 16px 16px 40px; gap: 14px; }
          .bg-right { position: static; }
          .bg-live { display: none; }
        }
      `}</style>

      <div className="bg-page">

        <section className="bg-banner">
          <div className="bg-banner-in">
            <h1 className="bg-banner-title">Buy Digital Gold</h1>
            <p className="bg-banner-sub">24K · 999 Purity · Secure Vault Storage</p>
            <div className="bg-live">
              <span className="bg-live-dot" />
              <span>Live Rate:</span>
              <span className="bg-live-price">₹{goldRate?.toFixed(2)} / gram</span>
              {priceLoading && <span className="price-spinner" style={{ marginLeft: '8px' }} />}
            </div>
          </div>
        </section>

        <main className="bg-main">

          <div className="bg-left">
            <div className="bg-card" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              <div className="bg-card-lbl">Your Gold Portfolio</div>
              {(txnLoading || walletLoading) ? (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <span className="bg-spin" />
                </div>
              ) : (
                <>
                  <div className="bg-port-val">
                    ₹{currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="bg-port-grams">
                    {goldBalance.toFixed(6)} grams · Invested: ₹{totalInvestedAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className={`bg-port-gain ${isProfit ? 'gain' : 'loss'}`}>
                    {isProfit ? '▲' : '▼'} {isProfit ? '+' : '-'}₹{Math.abs(gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({isProfit ? '+' : ''}{returnPercentage}% {performanceLabel.toLowerCase()})
                  </div>
                </>
              )}
            </div>

            <div className="bg-card">
              <div className="bg-card-lbl">Why Buy With Us</div>
              {[
                { t: 'Bank-Grade Security', d: 'Your gold is 100% secure in insured vaults' },
                { t: 'Instant Trading',     d: 'Buy and sell anytime at live market prices' },
                { t: 'Transparent Pricing', d: 'All taxes and charges included upfront' },
              ].map((f, i) => (
                <div className="bg-feat" key={i}>
                  <span className="bg-feat-num">0{i + 1}</span>
                  <div>
                    <div className="bg-feat-title">{f.t}</div>
                    <div className="bg-feat-desc">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-right">
            <div className="bg-card">
              <div className="bg-card-lbl">Buy Gold</div>

              <div className="bg-rate-row">
                <span className="bg-rate-label">Live Rate</span>
                <span className="bg-rate-val">
                  {priceLoading ? <span className="price-spinner" /> : `₹${goldRate?.toFixed(2)} / gram`}
                </span>
              </div>

              <div className="bg-toggle">
                <button
                  className={`bg-tgl-btn${buyMode === 'rupees' ? ' active' : ''}`}
                  onClick={() => { setBuyMode('rupees'); setAmount(''); setPreviewError(''); }}
                >
                  Buy in Rupees
                </button>
                <button
                  className={`bg-tgl-btn${buyMode === 'grams' ? ' active' : ''}`}
                  onClick={() => { setBuyMode('grams'); setAmount(''); setPreviewError(''); }}
                >
                  Buy in Grams
                </button>
              </div>

              <input
                type="number"
                className="bg-input"
                placeholder={buyMode === 'rupees' ? 'Enter amount in ₹' : 'Enter grams'}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setPreviewError(''); }}
              />

              {buyMode === 'rupees' && (
                <div className="bg-quick">
                  {[100, 500, 1000, 10000].map((v) => (
                    <button key={v} className="bg-q-btn" onClick={() => { setAmount(v.toString()); setPreviewError(''); }}>
                      ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}

              {calc && (
                <div className="bg-calc">
                  <div className="bg-calc-row">
                    <span>Gold Value</span>
                    <span className="bg-calc-val">₹{calc.rupees.toFixed(2)}</span>
                  </div>
                  <div className="bg-calc-row">
                    <span>GST (3%)</span>
                    <span className="bg-calc-val">₹{calc.gst.toFixed(2)}</span>
                  </div>
                  <div className="bg-calc-row">
                    <span>You receive</span>
                    <span className="bg-calc-gold">{calc.grams.toFixed(6)} g</span>
                  </div>
                  <div className="bg-calc-row total">
                    <span>Total Payable</span>
                    <span>₹{calc.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {previewError && <div className="bg-error">{previewError}</div>}

              <button className="bg-buy-btn" onClick={handlePreview} disabled={previewLoading}>
                {previewLoading ? <span className="bg-spin" /> : 'Proceed to Payment →'}
              </button>

              <div className="bg-footnote">Minimum purchase ₹100 · GST included</div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default BuyGold;