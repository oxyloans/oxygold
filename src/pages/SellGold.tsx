import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoldPrice } from '../context/GoldPriceContext';
import { usePurchasePrice } from '../context/PurchaseContext';
import { apiCall } from '../utils/tokenManager';
import { getCurrentUser } from '../utils/userUtils';

interface SellGoldProps {
  onDataPass: (data: any) => void;
}

const SellGold = ({ onDataPass }: SellGoldProps) => {
  const navigate = useNavigate();
  const { buyPrice, sellPrice: liveSellPrice, loading: priceLoading } = useGoldPrice();
  const { purchasePrice } = usePurchasePrice();
  const goldRate = buyPrice;
  const sellRate = liveSellPrice;
  const MIN_SELL_AMOUNT = 100;
  const PREVIEW_SELL_API = 'http://65.0.147.157:9900/api/digital-gold/preview-sell';
  const WALLET_API = 'http://65.0.147.157:9900/api/digital-gold/wallet';

  // Authentication guard
  const userId = getCurrentUser();
  if (!userId) {
    navigate('/login');
    return null;
  }

  const [sellMode, setSellMode] = useState<'rupees' | 'grams'>('rupees');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  interface WalletData {
    goldBalanceGrams: number;
    totalInvestedAmount: number;
    currentValue?: number;
  }

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const availableGold = walletData?.goldBalanceGrams || 0;
  const availableValue = availableGold * sellRate;

  const handleAmountChange = (value: string) => {
    // Different validation for rupees vs grams
    if (sellMode === 'rupees') {
      // For rupees: allow larger numbers with up to 2 decimal places
      if (value && !/^\d*\.?\d{0,2}$/.test(value)) return;
    } else {
      // For grams: limit to 4 total digits (e.g., 9.999, 99.99, 999.9, 9999)
      if (value && !/^\d{0,4}(\.\d{0,3})?$/.test(value)) return;
      // Additional check: ensure total length doesn't exceed 4 digits
      const digitsOnly = value.replace('.', '');
      if (digitsOnly.length > 4) return;
    }
    
    setAmount(value);
    setError('');
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue) || numValue <= 0) return;
    
    if (sellMode === 'rupees' && numValue < MIN_SELL_AMOUNT) {
      setError(`Minimum sell amount is ₹${MIN_SELL_AMOUNT}`);
      return;
    }
    
    if (sellMode === 'grams' && numValue > availableGold) {
      setError(`Insufficient balance. Available: ${availableGold.toFixed(3)} grams`);
    } else if (sellMode === 'rupees' && numValue > availableValue) {
      setError(`Insufficient balance. Available: ₹${availableValue?.toFixed(2)}`);
    }
  };

  const investedAmount = walletData?.totalInvestedAmount || 0;
  const currentValue = sellRate && availableGold 
    ? Math.round(availableGold * sellRate * 100) / 100
    : (walletData?.currentValue || 0);
  const gain = Math.round((currentValue - investedAmount) * 100) / 100;
  const gainPercent = investedAmount > 0 
    ? Math.round(((gain / investedAmount) * 100) * 100) / 100
    : 0;
  const isValid = amount && !error && parseFloat(amount) > 0;

  const getUser = () => {
    const userId = getCurrentUser();
    if (!userId) {
      navigate('/login');
      return null;
    }
    return userId;
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setWalletLoading(true);
        const userId = getUser();
        if (!userId) return; // Exit if no user (will redirect to login)
        
        const data = await apiCall(`${WALLET_API}/${userId}`);
        if (data.success) {
          setWalletData(data.data);
        }
      } catch (err: unknown) {
        console.error('Wallet fetch error:', err);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (error) return;
    
    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    
    setPreviewLoading(true);
    setError('');
    try {
      const numAmount = parseFloat(amount);
      const calculatedGrams = sellMode === 'rupees' ? (numAmount / sellRate) : numAmount;
      const calculatedAmount = sellMode === 'grams' ? (numAmount * sellRate) : numAmount;
      
      const requestBody = {
        userId: parseInt(currentUserId),
        amount: calculatedAmount,
        grams: calculatedGrams,
        purchaseType: sellMode === 'rupees' ? 'AMOUNT' : 'GRAMS',
        pergramPrice: buyPrice, // Current buy price
        pergramSellingPrice: sellRate, // Current sell price
        paymentMode: 'BANK',
        productId: 4
      };
      
      console.log('Preview Sell Request:', requestBody);
      
      const data = await apiCall(PREVIEW_SELL_API, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('Preview Sell API Response:', data);
      if (!data.success) throw new Error(data.message || 'Preview failed');
      
      const previewData = data.data;
      const finalAmount = previewData.amount;
      const finalGrams = previewData.grams;
      const finalSellingPrice = previewData.pergramSellingPrice;
      const gst = previewData.gst || 0;
      
      navigate('/sell-summary', {
        state: {
          amount: finalAmount, 
          grams: finalGrams,
          sellRate: finalSellingPrice, 
          sellMode, 
          availableGold,
          preview: previewData, 
          userId: currentUserId, // Pass userId explicitly
          gst,
          lockedTime: Date.now(), 
          timeLeft: 300,
        },
      });
    } catch (err: unknown) {
      console.error('Preview Sell Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPreviewLoading(false);
    }
  };

  if (availableGold === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .empty-page {
            min-height: 100vh; background: #f7f8fa;
            font-family: 'Sora', sans-serif;
            display: flex; align-items: center; justify-content: center; padding: 48px;
          }
          .empty-card {
            background: #fff; border: 1px solid #e8ecf0;
            border-radius: 12px; padding: 48px 40px; text-align: center;
            max-width: 400px; width: 100%;
            position: relative; overflow: hidden;
            box-shadow: 0 1px 6px rgba(0,0,0,0.04);
          }
          .empty-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            border-radius: 12px 12px 0 0;
            background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
          }
          .empty-title { font-size: 1.1rem; font-weight: 600; color: #1c2b3a; margin-bottom: 10px; }
          .empty-desc { font-size: 0.81rem; color: #9eaab8; margin-bottom: 28px; line-height: 1.65; font-weight: 400; }
          .empty-btn {
            width: 100%; padding: 12px 24px;
            background: linear-gradient(135deg, #f0bb3a, #d9a020);
            color: #0d1f3c; border: none; border-radius: 8px;
            font-family: 'Sora', sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer;
            box-shadow: 0 3px 12px rgba(217,160,32,0.24);
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .empty-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(217,160,32,0.34); }
        `}</style>
        <div className="empty-page">
          <div className="empty-card">
            <h2 className="empty-title">No Gold Available</h2>
            <p className="empty-desc">You don't have any gold in your portfolio to sell. Start investing today to build your digital gold holdings.</p>
            <button className="empty-btn" onClick={() => navigate('/buy-gold')}>Buy Gold Now</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sg-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .sg-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .sg-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .sg-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .sg-banner-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400;
        }
        .sg-live {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .sg-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .sg-live-val { font-weight: 600; color: #f0bb3a; }

        /* ── LAYOUT ── */
        .sg-main {
          max-width: 960px; margin: 0 auto;
          padding: 28px 40px 52px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px; align-items: start;
        }

        /* ── CARD ── */
        .sg-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 20px 22px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .sg-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .sg-card-lbl {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .sg-card-lbl::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .sg-left { display: flex; flex-direction: column; gap: 16px; }

        /* ── BALANCE ── */
        .sg-bal-val {
          font-size: 1.65rem; font-weight: 600;
          color: #c8900a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 5px;
        }
        .sg-bal-sub { font-size: 0.88rem; color: #08b124; margin-bottom: 4px; font-weight: 400; }
        .sg-gain-loss {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 5px;
          font-size: 0.71rem; font-weight: 500; margin-top: 10px;
        }
        .sg-gain-loss.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .sg-gain-loss.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        
        /* Portfolio card hover effect */
        .sg-card[style*="cursor: pointer"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }

        /* ── WHY SELL ── */
        .sg-feat {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 10px 0; border-bottom: 1px solid #f4f5f7;
        }
        .sg-feat:last-child { border-bottom: none; padding-bottom: 0; }
        .sg-feat:first-child { padding-top: 0; }
        .sg-feat-num { font-size: 0.58rem; font-weight: 500; color: #c8c0b0; width: 16px; flex-shrink: 0; margin-top: 2px; }
        .sg-feat-title { font-size: 0.81rem; font-weight: 600; color: #1c2b3a; margin-bottom: 2px; }
        .sg-feat-desc  { font-size: 0.71rem; color: #8a96a3; line-height: 1.55; font-weight: 400; }

        /* ── SELL FORM ── */
        .sg-right { position: sticky; top: 20px; }

        .sg-rate-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #fffcf2; border: 1px solid #f0e0a0;
          border-radius: 7px; padding: 9px 13px; margin-bottom: 13px;
        }
        .sg-rate-label { font-size: 0.64rem; color: #b8900a; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
        .sg-rate-val { font-size: 0.86rem; font-weight: 600; color: #b8720a; }

        .sg-toggle {
          display: flex; background: #f4f5f7;
          border: 1px solid #e4e7eb; border-radius: 7px;
          padding: 3px; margin-bottom: 13px;
        }
        .sg-tgl-btn {
          flex: 1; padding: 7px 10px; border-radius: 5px;
          font-family: 'Sora', sans-serif; font-size: 0.77rem; font-weight: 400;
          border: none; cursor: pointer; background: transparent; color: #9eaab8;
          transition: all 0.18s;
        }
        .sg-tgl-btn.active {
          background: #fff; color: #1c2b3a; font-weight: 600;
          border: 1px solid #e0e4e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .sg-input {
          width: 100%; padding: 10px 13px;
          background: #fafbfc; border: 1px solid #e0e4e8;
          border-radius: 7px;
          font-family: 'Sora', sans-serif; font-size: 0.86rem;
          color: #1c2b3a; font-weight: 400;
          outline: none; margin-bottom: 8px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .sg-input:focus { border-color: #1a3060; box-shadow: 0 0 0 3px rgba(26,48,96,0.07); background: #fff; }
        .sg-input.has-error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.06); }
        .sg-input::placeholder { color: #bcc5cf; }

        .sg-error { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-bottom: 8px; }

        .sg-hint {
          font-size: 0.74rem; color: #6a7a60;
          padding: 6px 10px; margin-bottom: 10px;
          background: #f7fcf4; border-left: 2px solid #b8d9a0;
          border-radius: 0 5px 5px 0; font-weight: 400;
        }

        .sg-quick { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
        .sg-q-btn {
          flex: 1; min-width: 64px; padding: 7px 8px;
          background: #f7f8fa; border: 1px solid #e4e7eb;
          border-radius: 6px;
          font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 500;
          color: #4a5a6a; cursor: pointer; text-align: center;
          transition: all 0.16s;
        }
        .sg-q-btn:hover { border-color: #d9a020; color: #b8720a; background: #fffcf0; }
        .sg-q-btn.sell-all {
          background: #fffcf0; border-color: rgba(217,160,32,0.3);
          color: #b8720a; font-weight: 600;
        }
        .sg-q-btn.sell-all:hover { border-color: #d9a020; }

        .sg-note {
          display: flex; align-items: flex-start; gap: 7px;
          padding: 8px 10px; background: #fafbfc;
          border: 1px solid #e8ecf0; border-radius: 6px; margin-bottom: 13px;
          font-size: 0.69rem; color: #9eaab8; line-height: 1.5; font-weight: 400;
        }

        .sg-sell-btn {
          width: 100%; padding: 12px;
          font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          margin-bottom: 10px; letter-spacing: 0.01em;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .sg-sell-btn.active {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
        }
        .sg-sell-btn.active:hover {
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .sg-sell-btn.disabled {
          background: #f0f2f5; color: #b0bac4; cursor: not-allowed;
        }

        .sg-footnote { text-align: center; font-size: 0.64rem; color: #bcc5cf; font-weight: 400; }

        .sg-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(13,31,60,0.15); border-top-color: #0d1f3c;
          animation: spin 0.65s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .price-spinner {
          width: 9px; height: 9px; border-radius: 50%;
          border: 1.5px solid rgba(217,160,32,0.2); border-top-color: #d9a020;
          animation: spin 0.6s linear infinite; display: inline-block;
        }

        @media (max-width: 768px) {
          .sg-banner { padding: 16px 20px; }
          .sg-main   { grid-template-columns: 1fr; padding: 16px 16px 40px; gap: 14px; }
          .sg-right  { position: static; }
          .sg-live   { display: none; }
        }
      `}</style>

      <div className="sg-page">

        <section className="sg-banner">
          <div className="sg-banner-in">
            <h1 className="sg-banner-title">Sell Digital Gold</h1>
            <p className="sg-banner-sub">Get instant credit at live market rates</p>
            <div className="sg-live">
              <span className="sg-live-dot" />
              <span>Sell Rate:</span>
              <span className="sg-live-val">₹{sellRate?.toFixed(2)} / gram</span>
              {priceLoading && <span className="price-spinner" style={{ marginLeft: '8px' }} />}
              {/* <span style={{ margin: /'0 8px', color: 'rgba(255,255,255,0.3)' }}>•</span> */}
              {/* <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>Buy: ₹{buyPrice?.toFixed(2)}</span> */}
            </div>
          </div>
        </section>

        <main className="sg-main">

          <div className="sg-left">

            <div className="sg-card" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              <div className="sg-card-lbl">Available Balance</div>
              {walletLoading ? (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <span className="sg-spin" />
                </div>
              ) : (
                <>
                  <div className="sg-bal-val">{availableGold.toFixed(3)} gram</div>
                  <div className="sg-bal-sub">Current Value: ₹{currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </>
              )}
            </div>

            <div className="sg-card">
              <div className="sg-card-lbl">Why Sell With Us</div>
              {[
                { t: 'Instant Settlement',  d: 'T+1 working day bank credit' },
                { t: 'Live Market Rates',   d: 'Best prices guaranteed' },
                { t: 'Secure & Compliant',  d: 'RBI regulated process' },
              ].map((f, i) => (
                <div className="sg-feat" key={i}>
                  <span className="sg-feat-num">0{i + 1}</span>
                  <div>
                    <div className="sg-feat-title">{f.t}</div>
                    <div className="sg-feat-desc">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="sg-right">
            <div className="sg-card">
              <div className="sg-card-lbl">Sell Gold</div>

              <div className="sg-rate-row">
                <span className="sg-rate-label">Sell Rate</span>
                <span className="sg-rate-val">
                  {priceLoading ? <span className="price-spinner" /> : `₹${sellRate?.toFixed(2)} / gram`}
                </span>
              </div>

              <div className="sg-toggle">
                <button
                  className={`sg-tgl-btn${sellMode === 'rupees' ? ' active' : ''}`}
                  onClick={() => { setSellMode('rupees'); setAmount(''); setError(''); }}
                >
                  Sell in Rupees
                </button>
                <button
                  className={`sg-tgl-btn${sellMode === 'grams' ? ' active' : ''}`}
                  onClick={() => { setSellMode('grams'); setAmount(''); setError(''); }}
                >
                  Sell in Grams
                </button>
              </div>

              <input
                type="text"
                inputMode="decimal"
                className={`sg-input${error ? ' has-error' : ''}`}
                placeholder={sellMode === 'rupees' ? `Min ₹${MIN_SELL_AMOUNT}` : 'Max 4 digits (e.g. 0.500)'}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />

              {error && <div className="sg-error">{error}</div>}

              {amount && !error && (
                <div className="sg-hint">
                  {sellMode === 'rupees'
                    ? `≈ ${(parseFloat(amount) / sellRate).toFixed(6)} grams of 24K gold`
                    : `≈ ₹${(parseFloat(amount) * sellRate)?.toFixed(2)}`
                  }
                </div>
              )}

              <div className="sg-quick">
                {['100', '500', '5000'].map((val) => (
                  <button key={val} className="sg-q-btn" onClick={() => handleAmountChange(val)}>
                    ₹{parseInt(val).toLocaleString()}
                  </button>
                ))}
                <button
                  className="sg-q-btn sell-all"
                  onClick={() => handleAmountChange(availableValue?.toFixed(2))}
                >
                  Sell All
                </button>
              </div>

              <div className="sg-note">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#bcc5cf" strokeWidth="1.5"/>
                  <path d="M8 7V11M8 5V5.5" stroke="#bcc5cf" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Sell price is based on live market rate and may change
              </div>

              <button
                className={`sg-sell-btn${isValid ? ' active' : ' disabled'}`}
                onClick={handleSell}
                disabled={!isValid || previewLoading}
              >
                {previewLoading ? <span className="sg-spin" /> : isValid ? 'Review Sell Order' : 'Enter Valid Amount'}
              </button>

              <div className="sg-footnote">Funds credited to your registered bank account</div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default SellGold;