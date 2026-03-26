import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { GoldPriceProvider } from './context/GoldPriceContext';
import { PurchaseProvider } from './context/PurchaseContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import BuyGold from './pages/BuyGold';
import ReviewOrder from './pages/ReviewOrder';
import SellGold from './pages/SellGold';
import OrderSummary from './pages/OrderSummary';
import PaymentMethod from './pages/PaymentMethod';
import PaymentProcessing from './pages/PaymentProcessing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentDetails from './pages/PaymentDetails';
import SellSummary from './pages/SellSummary';
import SellProcessing from './pages/SellProcessing';
import SellSuccess from './pages/SellSuccess';
import BankAccount from './pages/BankAccount';
import TermsConditions from './pages/TermsConditions';
import Portfolio from './pages/Portfolio';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import APITest from './pages/APITest';

function AppContent() {
  const [transactionData, setTransactionData] = useState<any>(null);
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isTestPage = location.pathname === '/api-test';
  const isFullPageFlow = [
    '/review-order',
    '/payment-method',
    '/payment-processing',
    '/payment-success',
    '/sell-summary',
    '/bank-account',
    '/sell-processing',
    '/sell-success'
  ].includes(location.pathname);

  const handleDataPass = (data: any) => {
    setTransactionData(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white scroll-smooth">
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/api-test" element={<APITest />} />
          <Route path="/payment-processing" element={<PaymentProcessing paymentData={transactionData} />} />
          <Route path="/sell-processing" element={<SellProcessing />} />
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/buy-gold" element={<BuyGold onDataPass={handleDataPass} />} />
          <Route path="/review-order" element={<ReviewOrder />} />
          <Route path="/sell-gold" element={<SellGold onDataPass={handleDataPass} />} />
          <Route path="/order-summary" element={<OrderSummary orderData={transactionData} onDataPass={handleDataPass} />} />
          <Route path="/payment-method" element={<PaymentMethod onDataPass={handleDataPass} />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-details" element={<PaymentDetails />} />
          <Route path="/sell-summary" element={<SellSummary />} />
          <Route path="/bank-account" element={<BankAccount />} />
          <Route path="/terms-conditions" element={<TermsConditions termsData={transactionData} flowType={transactionData?.flowType || 'buy'} />} />
          <Route path="/sell-success" element={<SellSuccess />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Footer />}
    </div>
  );
}

function App() {
  return (
    <GoldPriceProvider>
      <PurchaseProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </PurchaseProvider>
    </GoldPriceProvider>
  );
}

export default App;
