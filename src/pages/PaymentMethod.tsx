import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { load } from "@cashfreepayments/cashfree-js";
import { apiCall } from "../utils/tokenManager";
import TokenManager from "../utils/tokenManager";
import { API_BASE_URL } from "../Config";

const PaymentMethod = ({ onDataPass }: { onDataPass: (data: any) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cashfree, setCashfree] = useState<any>(null);
  const paymentData =
    location.state ||
    JSON.parse(localStorage.getItem("tempPaymentData") || "{}");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(paymentData?.timeLeft ?? 300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const BUY_API = `${API_BASE_URL}/oxygold-api/digital-gold/buy`;

  useEffect(() => {
    if (!paymentData || !Object.keys(paymentData).length) {
      navigate('/buy-gold');
    }
  }, []);

  useEffect(() => {
    const initCashfree = async () => {
      try {
        const cashfree = await load({ mode: 'sandbox' });
        setCashfree(cashfree);
      } catch (error) {
        console.error('Cashfree initialization failed:', error);
      }
    };
    initCashfree();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate("/buy-gold", {
        state: { error: "Price lock expired. Please try again." },
      });
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, navigate]);

  const safeNum = (v: any) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const isUrgent = timeLeft <= 60;
  const timerPercent = (timeLeft / 300) * 100;

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      desc: "Google Pay, PhonePe, Paytm or any UPI app",
      recommended: true,
      fee: 0,
    },
    {
      id: "wallet",
      name: "Wallets",
      desc: "Paytm, Amazon Pay, Mobikwik",
      recommended: false,
      fee: 0,
    },
  ];

  const wallets = ["Paytm", "Amazon Pay", "Mobikwik"];

  const doPayment = async (paymentSessionId: string, transactionId: string) => {
    if (!cashfree) throw new Error('Payment system not ready. Please refresh and try again.');

    // Save full payment data to sessionStorage RIGHT before redirect — survives Cashfree page navigation
    const snapshot = {
      ...paymentData,
      orderId: transactionId,
      transactionId,
      paymentMethod: 'upi',
    };
    sessionStorage.setItem('paymentSuccessData', JSON.stringify(snapshot));
    console.log('[doPayment] Saved to sessionStorage:', { grams: snapshot.grams, goldRate: snapshot.goldRate, total: snapshot.total });

    const returnUrl = `${window.location.origin}/payment-success?order_id=${transactionId}`;

    try {
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self' as const,
        returnUrl,
      });
    } catch (error) {
      console.error('Cashfree checkout error:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !isAccepted || (selectedMethod === 'wallet' && !selectedWallet) || timeLeft <= 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const tokenManager = TokenManager.getInstance();
    if (!tokenManager.isLoggedIn()) {
      navigate('/login', { state: { from: '/payment-method' } });
      return;
    }

    setIsProcessing(true);
    try {
      const paymentMode = selectedMethod === 'upi' ? 'CASHFREE' : 'WALLET';

      const buyData = await apiCall(BUY_API, {
        method: 'POST',
        body: JSON.stringify({
          userId: paymentData.userId,
          purchaseType: paymentData.buyMode === 'rupees' ? 'AMOUNT' : 'GRAMS',
          amount: paymentData.buyMode === 'rupees' ? Math.round(safeNum(paymentData.amount) * 100) / 100 : 0,
          grams: paymentData.buyMode === 'grams' ? Math.round(safeNum(paymentData.grams) * 100) / 100 : 0,
          paymentMode,
          pergramPrice: paymentData.goldRate,
          productId: 4,
          returnUrl: `${window.location.origin}/payment-success?order_id={ORDER_ID}`,
        }),
      });

      if (!buyData.success) throw new Error(buyData.message || 'Buy API failed');

      const transactionId = buyData.data?.transactionId || buyData.data?.id || buyData.message;
      if (!transactionId) throw new Error('No transaction ID in Buy API response');

      if (selectedMethod === 'upi') {
        if (!buyData.data?.paymentSessionId) throw new Error('No paymentSessionId in Buy API response');
        await doPayment(buyData.data.paymentSessionId, transactionId);
        return;
      }

      throw new Error('Wallet payments not implemented yet');
    } catch (err: any) {
      navigate('/payment-success', {
        state: { status: 'failure', message: err.message || 'Payment failed', paymentMethod: selectedMethod, ...paymentData },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethodObj = paymentMethods.find((m) => m.id === selectedMethod);
  const processingFee = selectedMethodObj?.fee || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pm-page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        /* ── TIMER BANNER ── */
        .pm-timer {
          border-radius: 8px; padding: 12px 16px;
          margin-bottom: 20px;
          border: 1px solid;
        }
        .pm-timer.ok      { background: #f0fdf4; border-color: rgba(22,163,74,0.22); }
        .pm-timer.urgent  { background: #fffbeb; border-color: rgba(217,119,6,0.28); }
        .pm-timer-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px;
        }
        .pm-timer-txt { font-size: 0.8rem; font-weight: 500; }
        .pm-timer-txt.ok      { color: #16a34a; }
        .pm-timer-txt.urgent  { color: #d97706; }
        .pm-timer-pill {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 2px 10px; border-radius: 20px;
        }
        .pm-timer-pill.ok     { background: rgba(22,163,74,0.1);  color: #16a34a; }
        .pm-timer-pill.urgent { background: rgba(217,119,6,0.1);  color: #d97706; }
        .pm-timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; }
        .pm-timer-bar { height: 100%; border-radius: 99px; transition: width 1s linear; }
        .pm-timer-bar.ok     { background: #16a34a; }
        .pm-timer-bar.urgent { background: #d97706; }

        /* ── TOP BAR ── */
        .pm-topbar {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .pm-topbar-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .pm-back {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .pm-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .pm-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .pm-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .pm-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        /* ── MAIN ── */
        .pm-main {
          max-width: 1000px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        /* ── CARD ── */
        .pm-card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .pm-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7c3aed, #d9a020, #f0bb3a);
          opacity: 0.5;
        }

        /* ── WARN STRIP ── */
        .pm-warn-strip {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 20px;
          background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.15);
          font-size: 0.72rem; color: #d97706; line-height: 1.55;
        }

        /* ── GRID ── */
        .pm-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; padding: 22px 20px;
        }
        .pm-grid-left {
          padding-right: 24px;
          border-right: 1px solid #f0eaf8;
        }
        .pm-grid-right {
          padding-left: 24px;
        }

        .pm-sec-title {
          font-size: 0.84rem; font-weight: 600;
          color: #1a1a2e; margin-bottom: 16px;
        }

        /* ── ORDER DETAIL ROWS ── */
        .pm-detail {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f5f0fc;
        }
        .pm-detail:last-of-type { border-bottom: none; }
        .pm-d-lbl {
          font-size: 0.76rem; color: #999; font-weight: 500;
        }
        .pm-d-val { font-size: 0.78rem; font-weight: 600; color: #1a1a2e; }
        .pm-d-val.gold { color: #b8860b; }

        /* total box */
        .pm-total-box {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; margin-top: 14px;
          background: #faf8ff;
          border: 1px solid #ede8f5; border-radius: 7px;
        }
        .pm-total-lbl { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .pm-total-val { font-size: 1.1rem; font-weight: 700; color: #b8860b; }

        /* ── PAYMENT METHOD ROWS ── */
        .pm-methods-list {
          display: flex; flex-direction: column; gap: 7px;
        }
        .pm-method-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px;
          border: 1.5px solid #ede8f5;
          border-radius: 8px; cursor: pointer;
          transition: border-color 0.16s, background 0.16s;
          background: #fff;
        }
        .pm-method-item:hover {
          border-color: rgba(124,58,237,0.3);
          background: #faf8ff;
        }
        .pm-method-item.selected {
          border-color: #7c3aed;
          background: #faf8ff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.06);
        }
        .pm-radio { display: none; }
        .pm-radio-circle {
          width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
          border: 1.5px solid #d0c8e8;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.16s; background: #fff;
        }
        .pm-method-item.selected .pm-radio-circle {
          border-color: #7c3aed; background: #7c3aed;
        }
        .pm-radio-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #fff; opacity: 0; transition: opacity 0.16s;
        }
        .pm-method-item.selected .pm-radio-dot { opacity: 1; }

        .pm-method-info { flex: 1; min-width: 0; }
        .pm-method-name-row {
          display: flex; align-items: center; gap: 6px; margin-bottom: 1px;
        }
        .pm-method-name { font-size: 0.8rem; font-weight: 600; color: #1a1a2e; }
        .pm-method-badge {
          font-size: 0.63rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 1px 7px; border-radius: 20px;
          background: #f0fdf4; color: #16a34a;
          border: 1px solid rgba(22,163,74,0.2);
        }
        .pm-method-desc { font-size: 0.71rem; color: #aaa; }

        /* wallet chips */
        .pm-wallet-sub {
          margin-top: 6px; padding: 9px 11px;
          background: #f9f7fe; border: 1px solid #ede8f5;
          border-radius: 7px; display: flex; gap: 7px; flex-wrap: wrap;
        }
        .pm-wallet-chip {
          padding: 3px 11px; border-radius: 20px;
          font-size: 0.71rem; font-weight: 600;
          border: 1.5px solid #ede8f5;
          background: #fff; cursor: pointer; color: #555;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .pm-wallet-chip:hover { border-color: #9b72cf; color: #3d2470; }
        .pm-wallet-chip.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }

        /* ── DIVIDER ── */
        .pm-divider { height: 1px; background: #f0eaf8; margin: 0 20px; }

        /* ── BOTTOM ── */
        .pm-bottom {
          padding: 18px 20px 20px;
          background: #faf8ff;
          border-top: 1px solid #f0eaf8;
        }

        /* Fee breakdown */
        .pm-fee-breakdown {
          background: #fff;
          border: 1px solid #ede8f5;
          border-radius: 7px;
          padding: 12px;
          margin-bottom: 14px;
          font-size: 0.75rem;
        }
        .pm-fee-row {
          display: flex; justify-content: space-between;
          padding: 4px 0;
        }
        .pm-fee-row:not(:last-child) {
          border-bottom: 1px solid #f5f0fc;
          margin-bottom: 4px;
          padding-bottom: 4px;
        }
        .pm-fee-lbl { color: #888; }
        .pm-fee-val { font-weight: 600; color: #1a1a2e; }
        .pm-fee-val.total { color: #b8860b; font-size: 0.8rem; }

        .pm-proceed-btn {
          width: 100%; padding: 11px 16px;
          border: none; border-radius: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: box-shadow 0.18s, filter 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          letter-spacing: 0.01em;
        }
        .pm-proceed-btn.active {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .pm-proceed-btn.active:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }
        .pm-proceed-btn.inactive {
          background: #ede8f5; color: #bbb; cursor: not-allowed;
        }
        .pm-terms-label {
          display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; margin-bottom: 4px;
        }
        .pm-checkbox {
          width: 15px; height: 15px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .pm-terms-txt { font-size: 0.78rem; color: #888; line-height: 1.5; }
        .pm-terms-link {
          color: #b8860b; font-weight: 600;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px;
          font-size: inherit;
        }
        .pm-terms-link:hover { color: #d9a020; }
        .pm-terms-err { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-top: 4px; }

        .pm-secure {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          margin-top: 10px; font-size: 0.7rem; color: #bbb;
        }

        .pm-spin {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(26,13,5,0.2);
          border-top-color: #1a0d05;
          animation: spin 0.65s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .pm-main { padding: 20px 24px 40px; }
          .pm-grid { grid-template-columns: 1fr; }
          .pm-grid-left {
            padding-right: 0; border-right: none;
            border-bottom: 1px solid #f0eaf8;
            padding-bottom: 18px; margin-bottom: 18px;
          }
          .pm-grid-right { padding-left: 0; }
        }
      `}</style>

      <div className="pm-page">
        {/* ── TOP BAR ── */}
        <section className="pm-topbar">
          <div className="pm-topbar-in">
            <button className="pm-back" onClick={() => navigate(-1)}>
              ←
            </button>
            <span className="pm-topbar-sep" />
            <span className="pm-topbar-title">Select Payment Method</span>
            <span className="pm-topbar-sep" />
            <span className="pm-topbar-sub">Choose how you'd like to pay</span>
          </div>
        </section>

        <main className="pm-main">
          {/* Card */}
          <div className="pm-card">
            {/* Warn strip */}
            <div className="pm-warn-strip">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <path
                  d="M8 1L1 15H15L8 1Z"
                  stroke="#d97706"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6V9M8 11V11.5"
                  stroke="#d97706"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                Price locked for {formatTime(timeLeft)} &nbsp;•&nbsp;
                Transaction cannot be cancelled once confirmed
              </span>
            </div>

            {/* Two-column grid */}
            <div className="pm-grid">
              {/* LEFT — Order Details */}
              <div className="pm-grid-left">
                <div className="pm-sec-title">Order Details</div>

                <div className="pm-detail">
                  <span className="pm-d-lbl">Gold Rate</span>
                  <span className="pm-d-val gold">
                    ₹{paymentData.goldRate.toLocaleString()} / gram
                  </span>
                </div>
                <div className="pm-detail">
                  <span className="pm-d-lbl">Quantity</span>
                  <span className="pm-d-val">
                    {safeNum(paymentData.grams).toFixed(3)} grams
                  </span>
                </div>
                <div className="pm-detail">
                  <span className="pm-d-lbl">Purity</span>
                  <span className="pm-d-val">24K · 999</span>
                </div>
                <div className="pm-detail">
                  <span className="pm-d-lbl">Gold Value</span>
                  <span className="pm-d-val">
                    ₹{safeNum(paymentData.rupees).toLocaleString()}
                  </span>
                </div>
                <div className="pm-detail">
                  <span className="pm-d-lbl">GST (3%)</span>
                  <span className="pm-d-val">
                    ₹{safeNum(paymentData.gst).toFixed(2)}
                  </span>
                </div>

                <div className="pm-total-box">
                  <span className="pm-total-lbl">Total Amount</span>
                  <span className="pm-total-val">
                    ₹{safeNum(paymentData.total).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* RIGHT — Payment Methods */}
              <div className="pm-grid-right">
                <div className="pm-sec-title">Payment Method</div>
                <div className="pm-methods-list">
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <label
                        className={`pm-method-item ${selectedMethod === method.id ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          className="pm-radio"
                          checked={selectedMethod === method.id}
                          onChange={() => {
                            setSelectedMethod(method.id);
                            setSelectedWallet("");
                          }}
                        />
                        <div className="pm-radio-circle">
                          <div className="pm-radio-dot" />
                        </div>
                        <div className="pm-method-info">
                          <div className="pm-method-name-row">
                            <span className="pm-method-name">
                              {method.name}
                            </span>
                            {method.recommended && (
                              <span className="pm-method-badge">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="pm-method-desc">{method.desc}</span>
                        </div>
                      </label>

                      {method.id === "wallet" &&
                        selectedMethod === "wallet" && (
                          <div className="pm-wallet-sub">
                            {wallets.map((w) => (
                              <button
                                key={w}
                                className={`pm-wallet-chip ${selectedWallet === w ? "active" : ""}`}
                                onClick={() => setSelectedWallet(w)}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pm-divider" />

            {/* Bottom */}
            <div className="pm-bottom">
              <label className="pm-terms-label">
                <input
                  type="checkbox"
                  className="pm-checkbox"
                  checked={isAccepted}
                  onChange={(e) => setIsAccepted(e.target.checked)}
                />
                <span className="pm-terms-txt">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="pm-terms-link"
                    onClick={() => setShowTermsModal(true)}
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
              {showError && (
                <div className="pm-terms-err">
                  {selectedMethod === "wallet" && !selectedWallet
                    ? "Please select a wallet to continue"
                    : timeLeft <= 0
                      ? "Price lock expired. Please start over."
                      : "Please accept the Terms & Conditions to continue"}
                </div>
              )}

              {/* {selectedMethod && (
                <div className="pm-fee-breakdown">
                  <div className="pm-fee-row">
                    <span className="pm-fee-val">
                      ₹{safeNum(paymentData.total).toLocaleString()}
                    </span>
                  </div> */}
                  {/* <div className="pm-fee-row">
                    <span className="pm-fee-lbl">Total to Pay</span>
                    <span className="pm-fee-val total">
                      ₹{safeNum(paymentData.total).toLocaleString()}
                    </span>
                  </div> */}
                {/* </div>
              )} */}

              <button
                className={`pm-proceed-btn ${selectedMethod && (selectedMethod !== "wallet" || selectedWallet) && timeLeft > 0 ? "active" : "inactive"}`}
                onClick={handlePayment}
                disabled={
                  !selectedMethod ||
                  (selectedMethod === "wallet" && !selectedWallet) ||
                  isProcessing ||
                  timeLeft <= 0
                }
              >
                {isProcessing ? (
                  <span className="pm-spin" />
                ) : timeLeft <= 0 ? (
                  "Price Lock Expired"
                ) : selectedMethod ? (
                  `Proceed to Payment →`
                ) : (
                  "Select a Payment Method"
                )}
              </button>
              <div className="pm-secure">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="3"
                    y="7"
                    width="10"
                    height="7"
                    rx="1"
                    stroke="#ccc"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7"
                    stroke="#ccc"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Secured by 256-bit SSL encryption
              </div>
            </div>
          </div>
        </main>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        flowType="buy"
      />
    </>
  );
};

export default PaymentMethod;
