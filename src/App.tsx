import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './styles/App.css';
import './index.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import BuyGold from './pages/BuyGold';
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
import OxyGoldAI from './pages/OxyGoldAI';

function AppContent() {
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState<any>(null);

  const handleDataPass = (data: any) => {
    setTransactionData(data);
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/payment-processing" element={
          <div className="page-container">
            <PaymentProcessing paymentData={transactionData} />
          </div>
        } />
        
        <Route path="/sell-processing" element={
          <div className="page-container">
            <SellProcessing sellData={transactionData} />
          </div>
        } />
        
        <Route path="/*" element={
          <>
            <Header />
            <div className="page-container">
              <Routes>
                <Route path="/" element={<OxyGoldAI />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/buy-gold" element={<BuyGold onDataPass={handleDataPass} />} />
                <Route path="/sell-gold" element={<SellGold onDataPass={handleDataPass} />} />
                <Route path="/order-summary" element={<OrderSummary orderData={transactionData} onDataPass={handleDataPass} />} />
                <Route path="/payment-method" element={<PaymentMethod paymentData={transactionData} onDataPass={handleDataPass} />} />
                <Route path="/payment-success" element={<PaymentSuccess transactionData={transactionData} />} />
                <Route path="/payment-details" element={<PaymentDetails transactionData={transactionData} />} />
                <Route path="/sell-summary" element={<SellSummary sellData={transactionData} onDataPass={handleDataPass} />} />
                <Route path="/bank-account" element={<BankAccount sellData={transactionData} onDataPass={handleDataPass} />} />
                <Route path="/terms-conditions" element={<TermsConditions onNavigate={(path, data) => { navigate(path); setTransactionData(data); }} termsData={transactionData} flowType={transactionData?.flowType || 'buy'} />} />
                <Route path="/sell-success" element={<SellSuccess sellData={transactionData} />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/oxygold-ai" element={<Landing />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
