import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
// import './styles/App.css';
// import './index.css';
import { GoldPriceProvider } from './context/GoldPriceContext';
import { PurchaseProvider } from './context/PurchaseContext';
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
import OxyGoldAI from './components/OxyGoldAI';
import VideoCreationPage from './AIVideosImages/VideoCreation';
import ImageCreation from './AIVideosImages/imagecreation';
import RealtimeVoice from './RealtimeVoice/components/RealTimeMainscreen';
import PhysicalGoldPage from './PhysicalGold/PhysicalGoldPage';
// import Login from './PhysicalGold/Login';
// import Register from './PhysicalGold/Register';
import OrdersPage from './PhysicalGold/OrdersPage';
import CartPage from './PhysicalGold/CartSlider';
import ProfilePage from './PhysicalGold/ProfileSlider';
import PaymentStatusPage from './PhysicalGold/PaymentStatus';
import { CartProvider } from './PhysicalGold/CartContext';
import AdminLayout from './physical-gold-admin/components/layout/AdminLayout';
import AdminLogin from './physical-gold-admin/pages/AdminLogin';
import AdminRegister from './physical-gold-admin/pages/AdminRegister';
import Login from './pages/Login';
import Register from './pages/Register';
import APITest from './pages/APITest';
import ReviewOrder from './pages/ReviewOrder';
import GoldSelection from './pages/GoldSelection';


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
      '/sell-success',
      '/',
      "/physical-gold",
      "/admin/*",
      "/physical-gold/orders",
      "/physical-gold/cart",
      "/physical-gold/profile",
      "/physical-gold/payment-status",
      "/select-gold"
    ].includes(location.pathname);
  const handleDataPass = (data: any) => {
    setTransactionData(data);
  };

  return (
    <div className="app">
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Header />}
      <div className="flex-1">
        <Routes>
          {/* Auth & Utility */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/api-test" element={<APITest />} />
          <Route path="/select-gold" element={<GoldSelection />} />

          {/* Processing (full-page, no header) */}
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="/sell-processing" element={<SellProcessing />} />

          {/* Voice Assistant */}
          <Route path="/voiceAssistant" element={<Navigate to="/voiceAssistant/welcome" replace />} />
          <Route path="/voiceAssistant/:screen" element={<RealtimeVoice />} />

          {/* AI Features */}
          <Route path="/imageCreation" element={<ImageCreation />} />
          <Route path="/videoCreation" element={<VideoCreationPage />} />

          {/* Main */}
          <Route path="/" element={<OxyGoldAI />} />
          <Route path="/oxygold-ai" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Digital Gold */}
          <Route path="/buy-gold" element={<BuyGold onDataPass={handleDataPass} />} />
          <Route path="/sell-gold" element={<SellGold onDataPass={handleDataPass} />} />
          <Route path="/review-order" element={<ReviewOrder />} />
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

          {/* Physical Gold */}
          <Route path="/physical-gold" element={<PhysicalGoldPage />} />
          <Route path="/physical-gold/orders" element={<OrdersPage />} />
          <Route path="/physical-gold/cart" element={<CartPage />} />
          <Route path="/physical-gold/profile" element={<ProfilePage />} />
          <Route path="/physical-gold/payment-status" element={<PaymentStatusPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/*" element={<AdminLayout />} />

          {/* Fallback */}
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
          <CartProvider>
            <AppContent />
          </CartProvider>
        </BrowserRouter>
      </PurchaseProvider>
    </GoldPriceProvider>
  );
}

export default App;
