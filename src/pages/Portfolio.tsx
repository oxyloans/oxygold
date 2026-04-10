import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoldPrice } from "../context/GoldPriceContext";
import { usePurchasePrice } from "../context/PurchaseContext";
import { apiCall } from "../utils/tokenManager";
import { getCurrentUser } from "../utils/userUtils";

interface Transaction {
  date: string;
  type: string;
  grams: string;
  amount: number;
  status: string;
  pricePerGram: number;
  transactionId: string;
  paymentDetails?: {
    paymentMethod?: string;
    paymentId?: string;
    orderId?: string;
    gst?: number;
    netAmount?: number;
    grossAmount?: number;
    timestamp?: string;
  };
}

interface WalletData {
  goldBalanceGrams: number;
  investedAmount: number;
  currentValue?: number;
  totalInvestedAmount?: number; // Add this field
}

const Portfolio = () => {
  const navigate = useNavigate();
  const { buyPrice: livePrice, loading, error, lastUpdated } = useGoldPrice();
  const { purchasePrice } = usePurchasePrice();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [txnError, setTxnError] = useState("");
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const TRANSACTIONS_API =
    "http://65.0.147.157:9900/api/digital-gold/transactions";
  const WALLET_API = "http://65.0.147.157:9900/api/digital-gold/wallet";

  const getUserId = () => {
    return getCurrentUser();
  };

  const userId = getUserId();
  if (!userId) {
    navigate("/login");
    return null;
  }

  const calculatePortfolioData = () => {
    let totalGoldGrams = 0;
    let totalInvestedAmount = 0;
    transactions.forEach((txn) => {
      // Only process SUCCESS transactions for portfolio calculations
      if (txn.status !== "Completed") return;
      const grams = parseFloat(txn.grams);
      const amount = txn.amount;
      if (txn.type === "Buy") {
        totalGoldGrams += grams;
        totalInvestedAmount += amount;
      } else if (txn.type === "Sell") {
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

  // PORTFOLIO PERFORMANCE CALCULATION - USING WALLET API VALUES
  const goldRate = livePrice || 0;
  
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
  console.log("=== PORTFOLIO PERFORMANCE ===");
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

  const buildChartData = () => {
    const completedTxns = transactions.filter((t) => t.status === "Completed");
    if (completedTxns.length === 0) return [];
    const sorted = [...completedTxns].sort((a, b) => {
      const [da, ma, ya] = a.date.split("/").map(Number);
      const [db, mb, yb] = b.date.split("/").map(Number);
      return (
        new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
      );
    });
    let runningGrams = 0;
    let runningInvested = 0;
    const points: { label: string; value: number; invested: number }[] = [];
    sorted.forEach((txn) => {
      const grams = parseFloat(txn.grams);
      if (txn.type === "Buy") {
        runningGrams += grams;
        runningInvested += txn.amount;
      } else {
        runningGrams -= grams;
      }
      const [d, m] = txn.date.split("/");
      points.push({
        label: `${d}/${m}`,
        value: runningGrams * goldRate,
        invested: runningInvested,
      });
    });
    points.push({
      label: "Now",
      value: currentValue,
      invested: totalInvestedAmount,
    });
    return points;
  };
  const chartData = buildChartData();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setWalletLoading(true);
        setWalletError("");
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
        setWalletError("");
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWalletData();
  }, [userId]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTxnLoading(true);
        setTxnError("");
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
              date: new Date(txn.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }),
              type: txn.type === "BUY" ? "Buy" : "Sell",
              grams: parseFloat(txn.grams).toFixed(6),
              amount: txn.amount,
              status: txn.status === "SUCCESS" ? "Completed" : txn.status,
              pricePerGram: txn.pricePerGram,
              transactionId: txn.transactionId,
              paymentDetails: {
                paymentMethod: txn.paymentMethod || "UPI",
                paymentId: txn.paymentId || txn.transactionId,
                orderId: txn.orderId || txn.transactionId,
                gst: txn.gst || (txn.amount * 0.03),
                netAmount: txn.netAmount || (txn.amount - (txn.amount * 0.03)),
                grossAmount: txn.amount,
                timestamp: txn.createdAt
              }
            }));
          setTransactions(formattedTransactions);
        }
      } catch (err: unknown) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setTxnError("");
      } finally {
        setTxnLoading(false);
      }
    };
    fetchTransactions();
  }, [userId]);

  const validTxns = transactions; // All non-pending transactions

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pf-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .pf-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .pf-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .pf-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .pf-banner-sub { font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400; }
        .pf-rate {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .pf-rate-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .pf-rate-val { font-weight: 600; color: #f0bb3a; }
        .pf-rate-loading {
          display: inline-block; width: 10px; height: 10px;
          border: 1.5px solid rgba(255,255,255,0.25); border-top-color: #f0bb3a;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── MAIN ── */
        .pf-main {
          max-width: 1100px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        .error-msg {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 18px; font-size: 0.74rem; color: #dc2626; font-weight: 400;
        }

        /* ── OVERVIEW ── */
        .pf-overview {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 16px;
        }

        /* ── CARD ── */
        .pf-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          position: relative; overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .pf-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .pf-card-head {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-card-title {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em; color: #9eaab8;
          display: flex; align-items: center; gap: 6px;
        }
        .pf-card-title-dot { width: 4px; height: 4px; border-radius: 50%; background: #d9a020; opacity: 0.8; }
        .pf-card-body { padding: 18px 20px; }

        /* ── PORTFOLIO SUMMARY ── */
        .port-val {
          font-size: 1.65rem; font-weight: 600;
          color: #1c2b3a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 4px;
        }
        .port-val-label { font-size: 0.74rem; color: #9eaab8; margin-bottom: 14px; font-weight: 400; }

        .port-gain-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .port-gain-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 0.71rem; font-weight: 500;
        }
        .port-gain-badge.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .port-gain-badge.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .port-gain-pct { font-size: 0.71rem; color: #9eaab8; font-weight: 400; }

        .port-mini-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .port-mini-stat {
          background: #fafbfc; border: 1px solid #e8ecf0;
          border-radius: 8px; padding: 10px 12px;
        }
        .port-mini-label { font-size: 0.58rem; color: #9eaab8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; font-weight: 500; }
        .port-mini-val { font-size: 0.86rem; font-weight: 600; color: #1c2b3a; }
        .port-mini-val.gold { color: #c8900a; }

        /* ── CHART ── */
        .chart-empty {
          text-align: center; padding: 40px 20px;
          color: #bcc5cf; font-size: 0.78rem; font-weight: 400;
        }
        .chart-legend { display: flex; gap: 14px; align-items: center; }
        .chart-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.64rem; color: #9eaab8; }
        .chart-legend-line { width: 14px; height: 2px; border-radius: 2px; }

        /* ── ACTIONS ── */
        .pf-actions { display: flex; gap: 10px; margin-bottom: 16px; }
        .pf-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pf-btn-primary:hover { box-shadow: 0 6px 18px rgba(217,160,32,0.34); transform: translateY(-1px); }
        .pf-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px;
          background: #fff; color: #2a4060;
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem; font-weight: 500;
          border: 1px solid #e0e4e8; border-radius: 8px; cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .pf-btn-secondary:hover { border-color: #d9a020; background: #fffcf0; color: #b8720a; }

        /* ── TRANSACTIONS ── */
        .pf-txn {
          background: #fff; border: 1px solid #e8ecf0;
          border-radius: 12px; overflow: hidden; position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .pf-txn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
        }
        .pf-txn-hd {
          padding: 14px 20px; border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-txn-title { font-size: 0.84rem; font-weight: 600; color: #1c2b3a; }
        .pf-txn-count {
          font-size: 0.66rem; font-weight: 500; color: #9eaab8;
          background: #f4f5f7; border: 1px solid #e4e7eb;
          padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em;
        }

        .pf-table { width: 100%; border-collapse: collapse; font-size: 0.81rem; }
        .pf-table thead tr { background: #fafbfc; border-bottom: 1px solid #f0f2f5; }
        .pf-table th {
          text-align: left; padding: 9px 18px;
          font-size: 0.6rem; font-weight: 600;
          color: #9eaab8; text-transform: uppercase;
          letter-spacing: 0.09em; white-space: nowrap;
        }
        .pf-table tbody tr { border-bottom: 1px solid #f7f8fa; transition: background 0.12s; cursor: pointer; }
        .pf-table tbody tr:last-child { border-bottom: none; }
        .pf-table tbody tr:hover { background: #fafbfc; }
        .pf-table td { padding: 12px 18px; color: #1c2b3a; vertical-align: middle; }
        .pf-date { color: #9eaab8; font-size: 0.76rem; font-variant-numeric: tabular-nums; font-weight: 400; }
        .pf-grams { font-variant-numeric: tabular-nums; font-weight: 500; }
        .pf-amount { font-weight: 600; font-variant-numeric: tabular-nums; }

        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px;
          font-size: 0.66rem; font-weight: 500; letter-spacing: 0.02em;
        }
        .badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
        .badge-buy  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-sell { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-done { background: #f0f4ff; color: #2a4e9e; border: 1px solid #c7d4f5; }

        .loading-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(13,31,60,0.12); border-top-color: #1a3060;
          border-radius: 50%; animation: spin 0.65s linear infinite;
        }
        .stat-loading { display: flex; align-items: center; gap: 8px; padding: 12px 0; }
        .empty-state { text-align: center; padding: 40px 20px; color: #9eaab8; font-size: 0.8rem; font-weight: 400; }
        .empty-state-title { font-size: 0.9rem; font-weight: 600; color: #1c2b3a; margin-bottom: 6px; }

        /* ── TRANSACTION MODAL ── */
        .txn-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }
        .txn-modal {
          background: #fff; border-radius: 12px;
          width: 90%; max-width: 360px; max-height: 80vh;
          overflow-y: auto; position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.4s ease;
        }
        .txn-modal-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .txn-modal-title {
          font-size: 1rem; font-weight: 500; color: #1c2b3a;
        }
        .txn-modal-close {
          width: 28px; height: 28px; border-radius: 50%;
          background: #f4f5f7; border: none;
          color: #9eaab8; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .txn-modal-close:hover { background: #e8ecf0; color: #1c2b3a; }
        .txn-modal-body { padding: 16px 20px 20px; }
        .txn-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #f7f8fa;
        }
        .txn-detail-row:last-child { border-bottom: none; }
        .txn-detail-label {
          font-size: 0.8rem; color: #9eaab8; font-weight: 400;
        }
        .txn-detail-value {
          font-size: 0.85rem; color: #1c2b3a; font-weight: 400;
          text-align: right; max-width: 60%;
        }
        .txn-detail-value.success { color: #16a34a; }
        .txn-detail-value.buy { color: #16a34a; }
        .txn-detail-value.sell { color: #dc2626; }
        .txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem; background: #f4f5f7;
          padding: 2px 6px; border-radius: 3px;
          font-weight: 400; word-break: break-all;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .pf-banner { padding: 16px 20px; }
          .pf-main { padding: 16px 16px 40px; }
          .pf-overview { grid-template-columns: 1fr; }
          .pf-rate { display: none; }
          .pf-table { font-size: 0.73rem; }
          .pf-table th, .pf-table td { padding: 8px 12px; }
        }
      `}</style>

      <div className="pf-page">
        <section className="pf-banner">
          <div className="pf-banner-in">
            <h1 className="pf-banner-title">Your Portfolio</h1>
            <p className="pf-banner-sub">Track your digital gold investments</p>
            <div className="pf-rate">
              {loading ? (
                <span className="pf-rate-loading" />
              ) : (
                <span className="pf-rate-dot" />
              )}
              <span>Live Rate:</span>
              <span className="pf-rate-val">
                ₹
                {goldRate?.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}{" "}
                / gram
              </span>
            </div>
          </div>
        </section>

        <main className="pf-main">
          {error && (
            <div className="error-msg">
              <strong>Gold Price:</strong> {error}
            </div>
          )}
          {walletError && (
            <div className="error-msg">
              <strong>Wallet:</strong> {walletError}
            </div>
          )}
          {txnError && (
            <div className="error-msg">
              <strong>Transactions:</strong> {txnError}
            </div>
          )}

          <div className="pf-overview">
            {/* Summary */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-title">
                  <span className="pf-card-title-dot" />
                  Portfolio Summary
                </div>
              </div>
              <div className="pf-card-body">
                {txnLoading ? (
                  <div className="stat-loading">
                    <span className="loading-spinner" />
                    <span style={{ fontSize: "0.74rem", color: "#9eaab8" }}>
                      Loading...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="port-val">
                      ₹
                      {currentValue?.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="port-val-label">
                      Current Portfolio Value
                    </div>
                    <div className="port-gain-row">
                      <div
                        className={`port-gain-badge ${isProfit ? "gain" : "loss"}`}
                      >
                        {isProfit ? "▲" : "▼"}&nbsp;
                        {isProfit ? "+" : "-"}₹
                        {Math.abs(gainLoss).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <span className="port-gain-pct">
                        {isProfit ? "+" : ""}
                        {returnPercentage}% {performanceLabel.toLowerCase()}
                      </span>
                    </div>
                    <div className="port-mini-stats">
                      <div className="port-mini-stat">
                        <div className="port-mini-label">Gold Held</div>
                        <div className="port-mini-val gold">
                          {goldBalance.toFixed(4)} g
                        </div>
                      </div>
                      <div className="port-mini-stat">
                        <div className="port-mini-label">Invested</div>
                        <div className="port-mini-val">
                          ₹
                          {totalInvestedAmount.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-title">
                  <span className="pf-card-title-dot" />
                  Portfolio Value Over Time
                </div>
                {!txnLoading && chartData.length >= 2 && (
                  <div className="chart-legend">
                    <div className="chart-legend-item">
                      <div
                        className="chart-legend-line"
                        style={{
                          background: isProfit ? "#16a34a" : "#dc2635",
                        }}
                      />
                      <span>Value</span>
                    </div>
                    <div className="chart-legend-item">
                      <div
                        className="chart-legend-line"
                        style={{
                          background: "#d9a020",
                          borderTop: "2px dashed #d9a020",
                          height: 0,
                        }}
                      />
                      <span>Invested</span>
                    </div>
                  </div>
                )}
              </div>

              {txnLoading ? (
                <div className="pf-card-body">
                  <div className="stat-loading">
                    <span className="loading-spinner" />
                    <span style={{ fontSize: "0.74rem", color: "#9eaab8" }}>
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : chartData.length < 2 ? (
                <div className="chart-empty">
                  No chart data yet.
                  <br />
                  Buy gold to see your growth.
                </div>
              ) : (
                (() => {
                  const W = 460,
                    H = 180;
                  const padL = 62,
                    padR = 16,
                    padT = 16,
                    padB = 32;
                  const plotW = W - padL - padR;
                  const plotH = H - padT - padB;
                  const vals = chartData.map((d) => d.value);
                  const allVals =
                    totalInvestedAmount > 0 ? [...vals, totalInvestedAmount] : vals;
                  const rawMin = Math.min(...allVals);
                  const rawMax = Math.max(...allVals);
                  const pad = (rawMax - rawMin) * 0.15 || rawMax * 0.1;
                  const minV = rawMin - pad;
                  const maxV = rawMax + pad;
                  const toX = (i: number) =>
                    padL + (i / (chartData.length - 1)) * plotW;
                  const toY = (v: number) =>
                    padT + (1 - (v - minV) / (maxV - minV)) * plotH;
                  const linePath = chartData
                    .map(
                      (d, i) =>
                        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`,
                    )
                    .join(" ");
                  const areaPath = `${linePath} L${toX(chartData.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)} L${padL.toFixed(1)},${(padT + plotH).toFixed(1)} Z`;
                  const isGain = isProfit;
                  const lineColor = isGain ? "#16a34a" : "#dc2635";
                  const ySteps = 4;
                  const yGridLines = Array.from(
                    { length: ySteps + 1 },
                    (_, i) => {
                      const v = minV + (i / ySteps) * (maxV - minV);
                      return {
                        y: toY(v),
                        label: `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`,
                      };
                    },
                  ).reverse();
                  const xStep = Math.ceil(chartData.length / 5);

                  return (
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        padding: "8px 8px 4px",
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="pfGrad2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={lineColor}
                            stopOpacity="0.14"
                          />
                          <stop
                            offset="100%"
                            stopColor={lineColor}
                            stopOpacity="0.01"
                          />
                        </linearGradient>
                        <clipPath id="chartClip">
                          <rect
                            x={padL}
                            y={padT}
                            width={plotW}
                            height={plotH}
                          />
                        </clipPath>
                      </defs>
                      {yGridLines.map((g, i) => (
                        <g key={i}>
                          <line
                            x1={padL}
                            y1={g.y.toFixed(1)}
                            x2={W - padR}
                            y2={g.y.toFixed(1)}
                            stroke="#f0f2f5"
                            strokeWidth="1"
                          />
                          <text
                            x={padL - 6}
                            y={(g.y + 3.5).toFixed(1)}
                            textAnchor="end"
                            style={{
                              fontSize: "9px",
                              fill: "#bcc5cf",
                              fontFamily: "Sora, sans-serif",
                            }}
                          >
                            {g.label}
                          </text>
                        </g>
                      ))}
                      {totalInvestedAmount > 0 && (
                        <line
                          x1={padL}
                          y1={toY(totalInvestedAmount).toFixed(1)}
                          x2={W - padR}
                          y2={toY(totalInvestedAmount).toFixed(1)}
                          stroke="#d9a020"
                          strokeWidth="1.5"
                          strokeDasharray="5,4"
                          opacity="0.6"
                          clipPath="url(#chartClip)"
                        />
                      )}
                      <path
                        d={areaPath}
                        fill="url(#pfGrad2)"
                        clipPath="url(#chartClip)"
                      />
                      <path
                        d={linePath}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        clipPath="url(#chartClip)"
                      />
                      {chartData.map((d, i) => (
                        <circle
                          key={i}
                          cx={toX(i).toFixed(1)}
                          cy={toY(d.value).toFixed(1)}
                          r={i === chartData.length - 1 ? "4.5" : "3"}
                          fill={i === chartData.length - 1 ? lineColor : "#fff"}
                          stroke={lineColor}
                          strokeWidth="2"
                        />
                      ))}
                      <text
                        x={(toX(chartData.length - 1) - 4).toFixed(1)}
                        y={(
                          toY(chartData[chartData.length - 1].value) - 9
                        ).toFixed(1)}
                        textAnchor="end"
                        style={{
                          fontSize: "9.5px",
                          fill: lineColor,
                          fontWeight: 600,
                          fontFamily: "Sora, sans-serif",
                        }}
                      >
                        ₹
                        {currentValue.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </text>
                      {chartData.map((d, i) => {
                        const show =
                          i === 0 ||
                          i === chartData.length - 1 ||
                          (chartData.length > 2 && i % xStep === 0);
                        if (!show) return null;
                        return (
                          <text
                            key={i}
                            x={toX(i).toFixed(1)}
                            y={(padT + plotH + 18).toFixed(1)}
                            textAnchor="middle"
                            style={{
                              fontSize: "9px",
                              fill: "#bcc5cf",
                              fontFamily: "Sora, sans-serif",
                            }}
                          >
                            {d.label}
                          </text>
                        );
                      })}
                      <line
                        x1={padL}
                        y1={padT + plotH}
                        x2={W - padR}
                        y2={padT + plotH}
                        stroke="#f0f2f5"
                        strokeWidth="1"
                      />
                    </svg>
                  );
                })()
              )}
            </div>
          </div>

          <div className="pf-actions">
            <button
              className="pf-btn-primary"
              onClick={() => navigate("/buy-gold", { 
                state: { 
                  portfolioData: {
                    goldBalanceGrams: goldBalance,
                    currentValue: currentValue,
                    totalInvestedAmount: totalInvestedAmount
                  }
                }
              })}
            >
              + Buy More Gold
            </button>
            <button
              className="pf-btn-secondary"
              onClick={() => navigate("/sell-gold")}
            >
              Sell Gold
            </button>
          </div>

          {/* Transaction History */}
          <div className="pf-txn">
            <div className="pf-txn-hd">
              <span className="pf-txn-title">Transaction History</span>
              <span className="pf-txn-count">
                {txnLoading ? (
                  <span className="loading-spinner" />
                ) : (
                  `${validTxns.length} transactions`
                )}
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              {txnLoading ? (
                <div className="empty-state">
                  <div
                    className="loading-spinner"
                    style={{ margin: "0 auto 12px" }}
                  />
                  <div className="empty-state-title">
                    Loading transactions...
                  </div>
                </div>
              ) : validTxns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">No transactions yet</div>
                  <p>Start by buying your first gold</p>
                </div>
              ) : (
                <table className="pf-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Rate / gram</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validTxns.map((txn, i) => (
                      <tr key={i} onClick={() => handleTransactionClick(txn)}>
                        <td className="pf-date">{txn.date}</td>
                        <td>
                          <span
                            className={`badge ${txn.type === "Buy" ? "badge-buy" : "badge-sell"}`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td className="pf-grams">{txn.grams} g</td>
                        <td className="pf-amount">
                          ₹{txn.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="pf-date">
                          ₹
                          {txn.pricePerGram?.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <span className="badge badge-done">{txn.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="txn-modal-overlay" onClick={closeTransactionModal}>
            <div className="txn-modal" onClick={(e) => e.stopPropagation()}>
              <div className="txn-modal-header">
                <h3 className="txn-modal-title">Payment Details</h3>
                <button className="txn-modal-close" onClick={closeTransactionModal}>
                  ×
                </button>
              </div>
              <div className="txn-modal-body">
                <div className="txn-detail-row">
                  <span className="txn-detail-label">ID</span>
                  <span className="txn-detail-value">
                    <span className="txn-id">{selectedTransaction.transactionId}</span>
                  </span>
                </div>
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Date</span>
                  <span className="txn-detail-value">{selectedTransaction.date}</span>
                </div>
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Type</span>
                  <span className={`txn-detail-value ${selectedTransaction.type.toLowerCase()}`}>
                    {selectedTransaction.type}
                  </span>
                </div>
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Gold</span>
                  <span className="txn-detail-value">{parseFloat(selectedTransaction.grams).toFixed(3)}g</span>
                </div>
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Rate</span>
                  <span className="txn-detail-value">
                    ₹{selectedTransaction.pricePerGram?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Amount</span>
                  <span className="txn-detail-value">
                    ₹{selectedTransaction.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedTransaction.paymentDetails && (
                  <>
                    <div className="txn-detail-row">
                      <span className="txn-detail-label">GST</span>
                      <span className="txn-detail-value">
                        ₹{Math.round(selectedTransaction.paymentDetails.gst || 0)}
                      </span>
                    </div>
                    <div className="txn-detail-row">
                      <span className="txn-detail-label">Method</span>
                      <span className="txn-detail-value">{selectedTransaction.paymentDetails.paymentMethod}</span>
                    </div>
                  </>
                )}
                <div className="txn-detail-row">
                  <span className="txn-detail-label">Status</span>
                  <span className="txn-detail-value success">{selectedTransaction.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Portfolio;












// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useGoldPrice } from "../context/GoldPriceContext";
// import { usePurchasePrice } from "../context/PurchaseContext";
// import { apiCall } from "../utils/tokenManager";
// import { getCurrentUser } from "../utils/userUtils";

// // ─────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────

// interface Transaction {
//   date: string;
//   type: string;
//   grams: string;
//   amount: number;
//   status: string;
//   pricePerGram: number;
//   transactionId: string;
// }

// interface WalletData {
//   goldBalanceGrams: number;
//   totalInvestedAmount: number; // constant — never changes with price movements
//   currentValue: number;        // snapshot from API (we recalculate live using livePrice instead)
// }

// interface ChartPoint {
//   label: string;
//   value: number;
//   invested: number;
// }

// // ─────────────────────────────────────────────
// // Constants
// // ─────────────────────────────────────────────

// const API_BASE = "http://65.0.147.157:9900/api/digital-gold";
// const TRANSACTIONS_API = `${API_BASE}/transactions`;
// const WALLET_API = `${API_BASE}/wallet`;

// // ─────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────

// /** Parse a "DD/MM/YYYY" string into a Date object */
// const parseDMY = (dateStr: string): Date => {
//   const [d, m, y] = dateStr.split("/").map(Number);
//   return new Date(y, m - 1, d);
// };

// /** Format a backend transaction into the UI-friendly shape */
// const formatTransaction = (raw: any): Transaction => ({
//   date: new Date(raw.createdAt).toLocaleDateString("en-IN", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }),
//   type: raw.type === "BUY" ? "Buy" : "Sell",
//   grams: parseFloat(raw.grams).toFixed(6),
//   amount: raw.amount,
//   status: raw.status === "SUCCESS" ? "Completed" : raw.status,
//   pricePerGram: raw.pricePerGram,
//   transactionId: raw.transactionId,
// });

// /**
//  * Walk completed transactions in order and compute:
//  *  - total gold grams held
//  *  - total invested amount (adjusted for sells using FIFO avg-cost)
//  */
// const calcPortfolioFromTransactions = (
//   transactions: Transaction[]
// ): { goldBalance: number; investedAmount: number } => {
//   let totalGrams = 0;
//   let totalInvested = 0;

//   transactions.forEach((txn) => {
//     if (txn.status !== "Completed") return;

//     const grams = parseFloat(txn.grams);

//     if (txn.type === "Buy") {
//       totalGrams += grams;
//       totalInvested += txn.amount;
//     } else if (txn.type === "Sell") {
//       const gramsBeforeSell = totalGrams + grams;
//       if (gramsBeforeSell > 0) {
//         const avgBuyPrice = totalInvested / gramsBeforeSell;
//         totalInvested -= grams * avgBuyPrice;
//       }
//       totalGrams -= grams;
//     }
//   });

//   return {
//     goldBalance: Math.max(0, totalGrams),
//     investedAmount: Math.max(0, totalInvested),
//   };
// };

// /**
//  * Build chart data points from sorted completed transactions.
//  * Each point represents the portfolio value after that transaction.
//  * A final "Now" point is appended using live price.
//  */
// const buildChartData = (
//   transactions: Transaction[],
//   goldRate: number,
//   currentValue: number,
//   investedAmount: number
// ): ChartPoint[] => {
//   const completed = transactions.filter((t) => t.status === "Completed");
//   if (completed.length === 0) return [];

//   const sorted = [...completed].sort(
//     (a, b) => parseDMY(a.date).getTime() - parseDMY(b.date).getTime()
//   );

//   let runningGrams = 0;
//   let runningInvested = 0;

//   const points: ChartPoint[] = sorted.map((txn) => {
//     const grams = parseFloat(txn.grams);
//     if (txn.type === "Buy") {
//       runningGrams += grams;
//       runningInvested += txn.amount;
//     } else {
//       runningGrams -= grams;
//     }
//     const [d, m] = txn.date.split("/");
//     return {
//       label: `${d}/${m}`,
//       value: runningGrams * goldRate,
//       invested: runningInvested,
//     };
//   });

//   // Append the current live value as the last point
//   points.push({ label: "Now", value: currentValue, invested: investedAmount });
//   return points;
// };

// // ─────────────────────────────────────────────
// // Component
// // ─────────────────────────────────────────────

// const Portfolio = () => {
//   const navigate = useNavigate();
//   const { buyPrice: livePrice, loading: priceLoading, error: priceError } = useGoldPrice();
//   const { purchasePrice } = usePurchasePrice();

//   // ── State ──────────────────────────────────
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [txnLoading, setTxnLoading] = useState(true);
//   const [txnError, setTxnError] = useState("");

//   const [walletData, setWalletData] = useState<WalletData | null>(null);
//   const [walletLoading, setWalletLoading] = useState(true);
//   const [walletError, setWalletError] = useState("");

//   // ── Auth guard ─────────────────────────────
//   const userId = getCurrentUser();
//   if (!userId) {
//     navigate("/login");
//     return null;
//   }

//   /**
//    * goldRate — price per gram shown in the banner header only.
//    * Comes from GoldPriceContext (separate price feed API).
//    * NOT used for portfolio value calculation.
//    */
//   const goldRate = livePrice || 0;

//   // Fallback: calculate from transactions if wallet API hasn't loaded yet
//   const txnCalc = calcPortfolioFromTransactions(transactions);

//   /**
//    * goldBalance — how many grams the user holds.
//    * Source: walletAPI.goldBalanceGrams (authoritative).
//    */
//   const goldBalance =
//     walletData && !walletLoading
//       ? walletData.goldBalanceGrams || 0
//       : txnCalc.goldBalance;

//   /**
//    * investedAmount — actual money the user paid. CONSTANT, never changes with price.
//    * Source: walletAPI.totalInvestedAmount
//    * e.g. ₹485 (netAmount after GST deduction)
//    */
//   const investedAmount =
//     walletData && !walletLoading
//       ? walletData.totalInvestedAmount || 0
//       : txnCalc.investedAmount;

//   /**
//    * currentValue — real-time market value of user's gold holdings.
//    * Now calculated using live price from GoldPriceContext for real-time accuracy.
//    * Fallback to walletAPI.currentValue if live price is unavailable.
//    */
//   const currentValue = livePrice && goldBalance
//     ? Math.round(goldBalance * livePrice * 100) / 100
//     : walletData && !walletLoading && walletData.currentValue
//       ? Math.round(walletData.currentValue * 100) / 100
//       : Math.round(goldBalance * goldRate * 100) / 100;

//   // profit / loss = currentValue(live) - investedAmount(constant)
//   const gain = Math.round((currentValue - investedAmount) * 100) / 100;
//   const gainPercent =
//     investedAmount > 0
//       ? Math.round((gain / investedAmount) * 100 * 100) / 100
//       : 0;
//   const avgBuyPrice =
//     goldBalance > 0
//       ? Math.round((investedAmount / goldBalance) * 100) / 100
//       : 0;

//   // Debug
//   console.log("Portfolio Debug:", {
//     goldBalance,                          // from walletAPI.goldBalanceGrams
//     livePrice,                            // from GoldPriceContext - used for currentValue calculation
//     headerLiveRate: goldRate,             // same as livePrice - header display
//     currentValue,                         // calculated using live price for real-time accuracy
//     walletApiCurrentValue: walletData?.currentValue, // backend calculated value (fallback)
//     investedAmount,                       // from walletAPI.totalInvestedAmount — constant
//     gain,                                 // currentValue - investedAmount
//     gainPercent: gainPercent + "%",
//     avgBuyPrice,
//   });

//   const chartData = buildChartData(transactions, goldRate, currentValue, investedAmount);
//   const completedTxns = transactions.filter((t) => t.status === "Completed");

//   // ── Data fetching ──────────────────────────

//   useEffect(() => {
//     const fetchWallet = async () => {
//       try {
//         setWalletLoading(true);
//         setWalletError("");
//         const data = await apiCall(`${WALLET_API}/${userId}`);

//         if (!data.success) {
//           const isNotFound =
//             data.message?.includes("not found") ||
//             data.message?.includes("No wallet");
//           if (isNotFound) {
//             setWalletData({ goldBalanceGrams: 0, totalInvestedAmount: 0, currentValue: 0 });
//           } else {
//             throw new Error(data.message || "Failed to fetch wallet data");
//           }
//         } else {
//           // Map API response: data.data contains goldBalanceGrams, totalInvestedAmount, currentValue
//           setWalletData(data.data);
//         }
//       } catch (err) {
//         console.error("Error fetching wallet data:", err);
//         setWalletData({ goldBalanceGrams: 0, totalInvestedAmount: 0, currentValue: 0 });
//         setWalletError("");
//       } finally {
//         setWalletLoading(false);
//       }
//     };

//     fetchWallet();
//   }, [userId]);

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         setTxnLoading(true);
//         setTxnError("");
//         const data = await apiCall(`${TRANSACTIONS_API}?userId=${userId}`);

//         if (!data.success) {
//           const isNotFound =
//             data.message?.includes("not found") ||
//             data.message?.includes("No transactions");
//           if (isNotFound) {
//             setTransactions([]);
//           } else {
//             throw new Error(data.message || "Failed to fetch transactions");
//           }
//         } else {
//           setTransactions((data.data || []).map(formatTransaction));
//         }
//       } catch (err) {
//         console.error("Error fetching transactions:", err);
//         setTransactions([]);
//         setTxnError("");
//       } finally {
//         setTxnLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, [userId]);

//   // ── Chart rendering ────────────────────────

//   const renderChart = () => {
//     if (txnLoading) {
//       return (
//         <div className="pf-card-body">
//           <div className="stat-loading">
//             <span className="loading-spinner" />
//             <span style={{ fontSize: "0.74rem", color: "#9eaab8" }}>Loading chart...</span>
//           </div>
//         </div>
//       );
//     }

//     if (chartData.length < 2) {
//       return (
//         <div className="chart-empty">
//           No chart data yet.
//           <br />
//           Buy gold to see your growth.
//         </div>
//       );
//     }

//     // SVG dimensions
//     const W = 460, H = 180;
//     const padL = 62, padR = 16, padT = 16, padB = 32;
//     const plotW = W - padL - padR;
//     const plotH = H - padT - padB;

//     // Value range with padding so the line never touches edges
//     const allVals = investedAmount > 0
//       ? [...chartData.map((d) => d.value), investedAmount]
//       : chartData.map((d) => d.value);
//     const rawMin = Math.min(...allVals);
//     const rawMax = Math.max(...allVals);
//     const rangePad = (rawMax - rawMin) * 0.15 || rawMax * 0.1;
//     const minV = rawMin - rangePad;
//     const maxV = rawMax + rangePad;

//     // Coordinate mappers
//     const toX = (i: number) => padL + (i / (chartData.length - 1)) * plotW;
//     const toY = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * plotH;

//     // SVG path strings
//     const linePath = chartData
//       .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`)
//       .join(" ");
//     const areaPath = `${linePath} L${toX(chartData.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)} L${padL.toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

//     const isGain = gain >= 0;
//     const lineColor = isGain ? "#16a34a" : "#dc2626";

//     // Y-axis grid labels (5 steps)
//     const Y_STEPS = 4;
//     const yGridLines = Array.from({ length: Y_STEPS + 1 }, (_, i) => {
//       const v = minV + (i / Y_STEPS) * (maxV - minV);
//       return {
//         y: toY(v),
//         label: `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`,
//       };
//     }).reverse();

//     // Show ~5 x-axis labels spread evenly
//     const xLabelStep = Math.ceil(chartData.length / 5);

//     return (
//       <svg
//         viewBox={`0 0 ${W} ${H}`}
//         style={{ width: "100%", height: "auto", display: "block", padding: "8px 8px 4px" }}
//       >
//         <defs>
//           <linearGradient id="pfGrad2" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor={lineColor} stopOpacity="0.14" />
//             <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
//           </linearGradient>
//           <clipPath id="chartClip">
//             <rect x={padL} y={padT} width={plotW} height={plotH} />
//           </clipPath>
//         </defs>

//         {/* Y-axis grid lines */}
//         {yGridLines.map((g, i) => (
//           <g key={i}>
//             <line x1={padL} y1={g.y.toFixed(1)} x2={W - padR} y2={g.y.toFixed(1)} stroke="#f0f2f5" strokeWidth="1" />
//             <text x={padL - 6} y={(g.y + 3.5).toFixed(1)} textAnchor="end" style={{ fontSize: "9px", fill: "#bcc5cf", fontFamily: "Sora, sans-serif" }}>
//               {g.label}
//             </text>
//           </g>
//         ))}

//         {/* Dashed invested-amount baseline */}
//         {investedAmount > 0 && (
//           <line
//             x1={padL} y1={toY(investedAmount).toFixed(1)}
//             x2={W - padR} y2={toY(investedAmount).toFixed(1)}
//             stroke="#d9a020" strokeWidth="1.5" strokeDasharray="5,4"
//             opacity="0.6" clipPath="url(#chartClip)"
//           />
//         )}

//         {/* Area fill under the line */}
//         <path d={areaPath} fill="url(#pfGrad2)" clipPath="url(#chartClip)" />

//         {/* Value line */}
//         <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chartClip)" />

//         {/* Data point dots */}
//         {chartData.map((d, i) => {
//           const isLast = i === chartData.length - 1;
//           return (
//             <circle
//               key={i}
//               cx={toX(i).toFixed(1)} cy={toY(d.value).toFixed(1)}
//               r={isLast ? "4.5" : "3"}
//               fill={isLast ? lineColor : "#fff"}
//               stroke={lineColor} strokeWidth="2"
//             />
//           );
//         })}

//         {/* Current-value label near last dot */}
//         <text
//           x={(toX(chartData.length - 1) - 4).toFixed(1)}
//           y={(toY(chartData[chartData.length - 1].value) - 9).toFixed(1)}
//           textAnchor="end"
//           style={{ fontSize: "9.5px", fill: lineColor, fontWeight: 600, fontFamily: "Sora, sans-serif" }}
//         >
//           ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//         </text>

//         {/* X-axis date labels */}
//         {chartData.map((d, i) => {
//           const showLabel = i === 0 || i === chartData.length - 1 || (chartData.length > 2 && i % xLabelStep === 0);
//           if (!showLabel) return null;
//           return (
//             <text key={i} x={toX(i).toFixed(1)} y={(padT + plotH + 18).toFixed(1)} textAnchor="middle" style={{ fontSize: "9px", fill: "#bcc5cf", fontFamily: "Sora, sans-serif" }}>
//               {d.label}
//             </text>
//           );
//         })}

//         {/* X-axis baseline */}
//         <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="#f0f2f5" strokeWidth="1" />
//       </svg>
//     );
//   };

//   // ── Render ─────────────────────────────────

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .pf-page {
//           min-height: 100vh;
//           background: #f7f8fa;
//           font-family: 'Sora', sans-serif;
//           color: #1c2b3a;
//         }

//         /* ── BANNER ── */
//         .pf-banner {
//           background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
//           padding: 24px 64px;
//           border-bottom: 1px solid rgba(240,187,58,0.1);
//         }
//         .pf-banner-in {
//           max-width: 1200px; margin: 0 auto;
//           display: flex; flex-direction: column; gap: 5px; text-align: center;
//         }
//         .pf-banner-title {
//           font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
//         }
//         .pf-banner-sub { font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400; }
//         .pf-rate {
//           display: flex; align-items: center; justify-content: center; gap: 7px;
//           font-size: 0.78rem; color: rgba(255,255,255,0.55);
//         }
//         .pf-rate-dot {
//           width: 5px; height: 5px; border-radius: 50%;
//           background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
//         }
//         @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
//         .pf-rate-val { font-weight: 600; color: #f0bb3a; }
//         .pf-rate-loading {
//           display: inline-block; width: 10px; height: 10px;
//           border: 1.5px solid rgba(255,255,255,0.25); border-top-color: #f0bb3a;
//           border-radius: 50%; animation: spin 0.8s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         /* ── MAIN ── */
//         .pf-main {
//           max-width: 1100px; margin: 0 auto;
//           padding: 28px 48px 56px;
//         }

//         .error-msg {
//           background: #fef2f2; border: 1px solid #fecaca;
//           border-radius: 8px; padding: 10px 14px;
//           margin-bottom: 18px; font-size: 0.74rem; color: #dc2626; font-weight: 400;
//         }

//         /* ── OVERVIEW ── */
//         .pf-overview {
//           display: grid; grid-template-columns: 1fr 1fr;
//           gap: 16px; margin-bottom: 16px;
//         }

//         /* ── CARD ── */
//         .pf-card {
//           background: #fff;
//           border: 1px solid #e8ecf0;
//           border-radius: 12px;
//           position: relative; overflow: hidden;
//           box-shadow: 0 1px 6px rgba(0,0,0,0.04);
//         }
//         .pf-card::before {
//           content: '';
//           position: absolute; top: 0; left: 0; right: 0; height: 2px;
//           border-radius: 12px 12px 0 0;
//           background: linear-gradient(90deg, #1a3060, #d9a020);
//           opacity: 0.7;
//         }
//         .pf-card-head {
//           padding: 16px 20px 12px;
//           border-bottom: 1px solid #f0f2f5;
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .pf-card-title {
//           font-size: 0.6rem; font-weight: 600;
//           text-transform: uppercase; letter-spacing: 0.12em; color: #9eaab8;
//           display: flex; align-items: center; gap: 6px;
//         }
//         .pf-card-title-dot { width: 4px; height: 4px; border-radius: 50%; background: #d9a020; opacity: 0.8; }
//         .pf-card-body { padding: 18px 20px; }

//         /* ── PORTFOLIO SUMMARY ── */
//         .port-val {
//           font-size: 1.65rem; font-weight: 600;
//           color: #1c2b3a; letter-spacing: -0.01em;
//           line-height: 1; margin-bottom: 4px;
//         }
//         .port-val-label { font-size: 0.74rem; color: #9eaab8; margin-bottom: 14px; font-weight: 400; }

//         .port-gain-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
//         .port-gain-badge {
//           display: inline-flex; align-items: center; gap: 4px;
//           padding: 3px 10px; border-radius: 20px;
//           font-size: 0.71rem; font-weight: 500;
//         }
//         .port-gain-badge.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
//         .port-gain-badge.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
//         .port-gain-pct { font-size: 0.71rem; color: #9eaab8; font-weight: 400; }

//         .port-mini-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
//         .port-mini-stat {
//           background: #fafbfc; border: 1px solid #e8ecf0;
//           border-radius: 8px; padding: 10px 12px;
//         }
//         .port-mini-label { font-size: 0.58rem; color: #9eaab8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; font-weight: 500; }
//         .port-mini-val { font-size: 0.86rem; font-weight: 600; color: #1c2b3a; }
//         .port-mini-val.gold { color: #c8900a; }

//         /* ── CHART ── */
//         .chart-empty {
//           text-align: center; padding: 40px 20px;
//           color: #bcc5cf; font-size: 0.78rem; font-weight: 400;
//         }
//         .chart-legend { display: flex; gap: 14px; align-items: center; }
//         .chart-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.64rem; color: #9eaab8; }
//         .chart-legend-line { width: 14px; height: 2px; border-radius: 2px; }

//         /* ── ACTIONS ── */
//         .pf-actions { display: flex; gap: 10px; margin-bottom: 16px; }
//         .pf-btn-primary {
//           display: inline-flex; align-items: center; gap: 6px;
//           padding: 10px 20px;
//           background: linear-gradient(135deg, #f0bb3a, #d9a020);
//           color: #0d1f3c;
//           font-family: 'Sora', sans-serif;
//           font-size: 0.83rem; font-weight: 600;
//           border: none; border-radius: 8px; cursor: pointer;
//           box-shadow: 0 3px 12px rgba(217,160,32,0.22);
//           transition: box-shadow 0.2s, transform 0.2s;
//         }
//         .pf-btn-primary:hover { box-shadow: 0 6px 18px rgba(217,160,32,0.34); transform: translateY(-1px); }
//         .pf-btn-secondary {
//           display: inline-flex; align-items: center; gap: 6px;
//           padding: 10px 20px;
//           background: #fff; color: #2a4060;
//           font-family: 'Sora', sans-serif;
//           font-size: 0.83rem; font-weight: 500;
//           border: 1px solid #e0e4e8; border-radius: 8px; cursor: pointer;
//           transition: border-color 0.18s, background 0.18s;
//         }
//         .pf-btn-secondary:hover { border-color: #d9a020; background: #fffcf0; color: #b8720a; }

//         /* ── TRANSACTIONS ── */
//         .pf-txn {
//           background: #fff; border: 1px solid #e8ecf0;
//           border-radius: 12px; overflow: hidden; position: relative;
//           box-shadow: 0 1px 6px rgba(0,0,0,0.04);
//         }
//         .pf-txn::before {
//           content: '';
//           position: absolute; top: 0; left: 0; right: 0; height: 2px;
//           border-radius: 12px 12px 0 0;
//           background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
//         }
//         .pf-txn-hd {
//           padding: 14px 20px; border-bottom: 1px solid #f0f2f5;
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .pf-txn-title { font-size: 0.84rem; font-weight: 600; color: #1c2b3a; }
//         .pf-txn-count {
//           font-size: 0.66rem; font-weight: 500; color: #9eaab8;
//           background: #f4f5f7; border: 1px solid #e4e7eb;
//           padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em;
//         }

//         .pf-table { width: 100%; border-collapse: collapse; font-size: 0.81rem; }
//         .pf-table thead tr { background: #fafbfc; border-bottom: 1px solid #f0f2f5; }
//         .pf-table th {
//           text-align: left; padding: 9px 18px;
//           font-size: 0.6rem; font-weight: 600;
//           color: #9eaab8; text-transform: uppercase;
//           letter-spacing: 0.09em; white-space: nowrap;
//         }
//         .pf-table tbody tr { border-bottom: 1px solid #f7f8fa; transition: background 0.12s; }
//         .pf-table tbody tr:last-child { border-bottom: none; }
//         .pf-table tbody tr:hover { background: #fafbfc; }
//         .pf-table td { padding: 12px 18px; color: #1c2b3a; vertical-align: middle; }
//         .pf-date { color: #9eaab8; font-size: 0.76rem; font-variant-numeric: tabular-nums; font-weight: 400; }
//         .pf-grams { font-variant-numeric: tabular-nums; font-weight: 500; }
//         .pf-amount { font-weight: 600; font-variant-numeric: tabular-nums; }

//         .badge {
//           display: inline-flex; align-items: center; gap: 4px;
//           padding: 3px 9px; border-radius: 20px;
//           font-size: 0.66rem; font-weight: 500; letter-spacing: 0.02em;
//         }
//         .badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
//         .badge-buy  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
//         .badge-sell { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
//         .badge-done { background: #f0f4ff; color: #2a4e9e; border: 1px solid #c7d4f5; }

//         .loading-spinner {
//           display: inline-block; width: 13px; height: 13px;
//           border: 2px solid rgba(13,31,60,0.12); border-top-color: #1a3060;
//           border-radius: 50%; animation: spin 0.65s linear infinite;
//         }
//         .stat-loading { display: flex; align-items: center; gap: 8px; padding: 12px 0; }
//         .empty-state { text-align: center; padding: 40px 20px; color: #9eaab8; font-size: 0.8rem; font-weight: 400; }
//         .empty-state-title { font-size: 0.9rem; font-weight: 600; color: #1c2b3a; margin-bottom: 6px; }

//         @media (max-width: 768px) {
//           .pf-banner { padding: 16px 20px; }
//           .pf-main { padding: 16px 16px 40px; }
//           .pf-overview { grid-template-columns: 1fr; }
//           .pf-rate { display: none; }
//           .pf-table { font-size: 0.73rem; }
//           .pf-table th, .pf-table td { padding: 8px 12px; }
//         }
//       `}</style>

//       <div className="pf-page">

//         {/* ── Banner ── */}
//         <section className="pf-banner">
//           <div className="pf-banner-in">
//             <h1 className="pf-banner-title">Your Portfolio</h1>
//             <p className="pf-banner-sub">Track your digital gold investments</p>
//             <div className="pf-rate">
//               {priceLoading ? (
//                 <span className="pf-rate-loading" />
//               ) : (
//                 <span className="pf-rate-dot" />
//               )}
//               <span>Live Rate:</span>
//               <span className="pf-rate-val">
//                 ₹{goldRate?.toLocaleString("en-IN", { maximumFractionDigits: 2 })} / gram
//               </span>
//             </div>
//           </div>
//         </section>

//         <main className="pf-main">

//           {/* ── Error Banners ── */}
//           {priceError && (
//             <div className="error-msg"><strong>Gold Price:</strong> {priceError}</div>
//           )}
//           {walletError && (
//             <div className="error-msg"><strong>Wallet:</strong> {walletError}</div>
//           )}
//           {txnError && (
//             <div className="error-msg"><strong>Transactions:</strong> {txnError}</div>
//           )}

//           <div className="pf-overview">

//             {/* ── Summary Card ── */}
//             <div className="pf-card">
//               <div className="pf-card-head">
//                 <div className="pf-card-title">
//                   <span className="pf-card-title-dot" />
//                   Portfolio Summary
//                 </div>
//               </div>
//               <div className="pf-card-body">
//                 {txnLoading ? (
//                   <div className="stat-loading">
//                     <span className="loading-spinner" />
//                     <span style={{ fontSize: "0.74rem", color: "#9eaab8" }}>Loading...</span>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="port-val">
//                       ₹{currentValue?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
//                     </div>
//                     <div className="port-val-label">Current Portfolio Value</div>

//                     <div className="port-gain-row">
//                       <div className={`port-gain-badge ${gain >= 0 ? "gain" : "loss"}`}>
//                         {gain >= 0 ? "▲" : "▼"}&nbsp;
//                         {gain >= 0 ? "+" : ""}₹{Math.abs(gain).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
//                       </div>
//                       <span className="port-gain-pct">
//                         {gain >= 0 ? "+" : ""}{gainPercent}% returns
//                       </span>
//                     </div>

//                     <div className="port-mini-stats">
//                       <div className="port-mini-stat">
//                         <div className="port-mini-label">Gold Held</div>
//                         <div className="port-mini-val gold">{goldBalance.toFixed(4)} g</div>
//                       </div>
//                       <div className="port-mini-stat">
//                         <div className="port-mini-label">Invested</div>
//                         <div className="port-mini-val">
//                           ₹{investedAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* ── Chart Card ── */}
//             <div className="pf-card">
//               <div className="pf-card-head">
//                 <div className="pf-card-title">
//                   <span className="pf-card-title-dot" />
//                   Portfolio Value Over Time
//                 </div>
//                 {!txnLoading && chartData.length >= 2 && (
//                   <div className="chart-legend">
//                     <div className="chart-legend-item">
//                       <div className="chart-legend-line" style={{ background: gain >= 0 ? "#16a34a" : "#dc2626" }} />
//                       <span>Value</span>
//                     </div>
//                     <div className="chart-legend-item">
//                       <div className="chart-legend-line" style={{ background: "#d9a020", borderTop: "2px dashed #d9a020", height: 0 }} />
//                       <span>Invested</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {renderChart()}
//             </div>
//           </div>

//           {/* ── Action Buttons ── */}
//           <div className="pf-actions">
//             <button className="pf-btn-primary" onClick={() => navigate("/buy-gold")}>
//               + Buy More Gold
//             </button>
//             <button className="pf-btn-secondary" onClick={() => navigate("/sell-gold")}>
//               Sell Gold
//             </button>
//           </div>

//           {/* ── Transaction History ── */}
//           <div className="pf-txn">
//             <div className="pf-txn-hd">
//               <span className="pf-txn-title">Transaction History</span>
//               <span className="pf-txn-count">
//                 {txnLoading ? (
//                   <span className="loading-spinner" />
//                 ) : (
//                   `${completedTxns.length} transactions`
//                 )}
//               </span>
//             </div>

//             <div style={{ overflowX: "auto" }}>
//               {txnLoading ? (
//                 <div className="empty-state">
//                   <div className="loading-spinner" style={{ margin: "0 auto 12px" }} />
//                   <div className="empty-state-title">Loading transactions...</div>
//                 </div>
//               ) : completedTxns.length === 0 ? (
//                 <div className="empty-state">
//                   <div className="empty-state-title">No transactions yet</div>
//                   <p>Start by buying your first gold</p>
//                 </div>
//               ) : (
//                 <table className="pf-table">
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Type</th>
//                       <th>Quantity</th>
//                       <th>Amount</th>
//                       <th>Rate / gram</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {completedTxns.map((txn, i) => (
//                       <tr key={i}>
//                         <td className="pf-date">{txn.date}</td>
//                         <td>
//                           <span className={`badge ${txn.type === "Buy" ? "badge-buy" : "badge-sell"}`}>
//                             {txn.type}
//                           </span>
//                         </td>
//                         <td className="pf-grams">{txn.grams} g</td>
//                         <td className="pf-amount">₹{txn.amount.toLocaleString("en-IN")}</td>
//                         <td className="pf-date">
//                           ₹{txn.pricePerGram?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
//                         </td>
//                         <td>
//                           <span className="badge badge-done">{txn.status}</span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>

//         </main>
//       </div>
//     </>
//   );
// };

// export default Portfolio;