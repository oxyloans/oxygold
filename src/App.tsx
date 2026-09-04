import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { GoldPriceProvider } from './context/GoldPriceContext';
import { PurchaseProvider } from './context/PurchaseContext';
import { CartProvider } from './PhysicalGold/CartContext';
import { WishlistProvider } from './PhysicalGold/WishlistContext';
import oxygoldLogo from './assets/oxygoldlogo.png';

// Eagerly loaded (critical path)
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './Verified';

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void;
  }
}

// Lazy loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const BuyGold = lazy(() => import('./pages/BuyGold'));
const SellGold = lazy(() => import('./pages/SellGold'));
const OrderSummary = lazy(() => import('./pages/OrderSummary'));
const PaymentMethod = lazy(() => import('./pages/PaymentMethod'));
const PaymentProcessing = lazy(() => import('./pages/PaymentProcessing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentDetails = lazy(() => import('./pages/PaymentDetails'));
const SellSummary = lazy(() => import('./pages/SellSummary'));
const SellProcessing = lazy(() => import('./pages/SellProcessing'));
const SellSuccess = lazy(() => import('./pages/SellSuccess'));
const BankAccount = lazy(() => import('./pages/BankAccount'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const FAQ = lazy(() => import('./pages/FAQ'));
const OxyGoldAI = lazy(() => import('./components/OxyGoldAI'));
const VideoCreationPage = lazy(() => import('./AIVideosImages/VideoCreation'));
const ImageCreation = lazy(() => import('./AIVideosImages/imagecreation'));
const RealtimeVoice = lazy(() => import('./RealtimeVoice/components/RealTimeMainscreen'));
const PhysicalGoldPage = lazy(() => import('./PhysicalGold/PhysicalGoldPageNew'));
const HiddenLogin = lazy(() => import('./PhysicalGold/HiddenLogin'));
const CartPage = lazy(() => import('./PhysicalGold/CartSlider'));
const ProfilePage = lazy(() => import('./PhysicalGold/ProfileSlider'));
const PaymentStatusPage = lazy(() => import('./PhysicalGold/PaymentStatus'));
const WishlistPage = lazy(() => import('./PhysicalGold/WishlistPage'));
const ProductDetailsPage = lazy(() => import('./PhysicalGold/ProductDetailsPage'));
const PhysicalGoldLayout = lazy(() => import('./PhysicalGold/components/PhysicalGoldLayout'));
const PrivacyPolicy = lazy(() => import('./PhysicalGold/PrivacyPolicy'));
const TermsConditionsPhysical = lazy(() => import('./PhysicalGold/TermsConditions'));
const ShippingPolicy = lazy(() => import('./PhysicalGold/ShippingPolicy'));
const ReturnRefundPolicy = lazy(() => import('./PhysicalGold/ReturnRefundPolicy'));
const FAQPage = lazy(() => import('./PhysicalGold/FAQPage'));
const CookiePolicy = lazy(() => import('./PhysicalGold/CookiePolicy'));
const CancellationPolicy = lazy(() => import('./PhysicalGold/CancellationPolicy'));
const AdminLayout = lazy(() => import('./physical-gold-admin/components/layout/AdminLayout'));
const AdminLogin = lazy(() => import('./physical-gold-admin/pages/AdminLogin'));
const PartnerLayout = lazy(() => import('./physical-gold-partner/components/layout/PartnerLayout'));
const PartnerLogin = lazy(() => import('./physical-gold-partner/pages/PartnerLogin'));
const PartnerRegister = lazy(() => import('./physical-gold-partner/pages/PartnerRegister'));
const DeliveryBoyLogin = lazy(() => import('./physical-gold-deliveryboy/pages/DeliveryBoyLogin'));
const DeliveryBoyDashboard = lazy(() => import('./physical-gold-deliveryboy/pages/DeliveryBoyDashboard'));
const DeliveryBoyOrders = lazy(() => import('./physical-gold-deliveryboy/pages/DeliveryBoyOrders'));
const DeliveryBoyRoute = lazy(() => import('./physical-gold-deliveryboy/components/DeliveryBoyRoute'));
const DeliveryBoyLayout = lazy(() => import('./physical-gold-deliveryboy/components/DeliveryBoyLayout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const APITest = lazy(() => import('./pages/APITest'));
const ReviewOrder = lazy(() => import('./pages/ReviewOrder'));
const GoldSelection = lazy(() => import('./pages/GoldSelection'));
const BISCertificate = lazy(() => import('./pages/BISCertificate'));

// Global loading fallback
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07061A',
      gap: 16
    }}>
      <img
        src={oxygoldLogo}
        alt="OxyGold"
        style={{ width: 80, height: 80, objectFit: 'contain', animation: 'pulse 1.5s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}

function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.('event', 'page_view', {
      page_path: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location]);

  return null;
}

function AppContent() {
  const [transactionData, setTransactionData] = useState<any>(null);
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/hiddenlogin'].includes(location.pathname);
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
    "/select-gold",
    "/bis-certificate",
    "/imageCreation",
    "/videoCreation",
    "/imageCreation/",
    "/videoCreation/",
    "/verified",
    "/verified/",
    "/hiddenlogin",
    "/hiddenlogin/",
  ].includes(location.pathname) ||
    location.pathname.startsWith("/physical-gold") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/partner") ||
    location.pathname.startsWith("/delivery-boy") ||
    location.pathname.startsWith("/voiceAssistant");
  const handleDataPass = (data: any) => {
    setTransactionData(data);
  };

  return (
    <div className="app">
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Header />}
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>

          <Routes>
            {/* Auth & Utility */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hiddenlogin" element={<HiddenLogin />} />
            <Route path="/api-test" element={<APITest />} />
            <Route path="/select-gold" element={<ProtectedRoute> <GoldSelection /> </ProtectedRoute>} />
            <Route path="/bis-certificate" element={<BISCertificate />} />

            {/* Processing (full-page, no header) */}
            <Route path="/payment-processing" element={<PaymentProcessing />} />
            <Route path="/sell-processing" element={<SellProcessing />} />

            {/* Voice Assistant */}
            <Route path="/voiceAssistant" element={<Navigate to="/voiceAssistant/welcome" replace />} />
            <Route path="/voiceAssistant/:screen" element={<RealtimeVoice />} />

            {/* AI Features */}
            <Route path="/imageCreation" element={<ImageCreation />} />
            <Route path="/videoCreation" element={<VideoCreationPage />} />
            <Route path="/verified" element={<Home />} />
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

            {/* Physical Gold public storefront */}
            <Route element={<PhysicalGoldLayout />}>
              <Route path="/physical-gold" element={<PhysicalGoldPage />} />
              <Route path="/physical-gold/category/:categoryId" element={<PhysicalGoldPage />} />
              <Route path="/physical-gold/category/:categoryId/subcategory/:subCategoryId" element={<PhysicalGoldPage />} />
              <Route path="/physical-gold/product/:id" element={<ProductDetailsPage />} />
              <Route path="/physical-gold/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/physical-gold/terms-conditions" element={<TermsConditionsPhysical />} />
              <Route path="/physical-gold/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/physical-gold/return-refund-policy" element={<ReturnRefundPolicy />} />
              <Route path="/physical-gold/faq" element={<FAQPage />} />
              <Route path="/physical-gold/cookie-policy" element={<CookiePolicy />} />
              <Route path="/physical-gold/cancellation-policy" element={<CancellationPolicy />} />
            </Route>

            {/* Physical Gold protected actions */}
            <Route
              element={
                <ProtectedRoute>
                  <PhysicalGoldLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/physical-gold/orders"
                element={<Navigate to="/physical-gold/profile?tab=orders" replace />}
              />
              <Route path="/physical-gold/cart" element={<CartPage />} />
              <Route path="/physical-gold/profile" element={<ProfilePage />} />
              <Route path="/physical-gold/wishlist" element={<WishlistPage />} />
              <Route path="/physical-gold/payment-status" element={<PaymentStatusPage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />} />

            {/* Partner */}
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/register" element={<PartnerRegister />} />
            <Route path="/partner/*" element={<PartnerLayout />} />

            {/* Delivery personnel — independent module */}
            <Route path="/delivery-boy/login" element={<DeliveryBoyLogin />} />
            <Route element={<DeliveryBoyRoute />}>
              <Route element={<DeliveryBoyLayout />}>
                <Route path="/delivery-boy/dashboard" element={<DeliveryBoyDashboard />} />
                <Route path="/delivery-boy/deliveries" element={<DeliveryBoyOrders />} />
              </Route>
            </Route>
            <Route path="/delivery-boy" element={<Navigate to="/delivery-boy/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
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
            <WishlistProvider>
              <GoogleAnalyticsTracker />
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </BrowserRouter>
      </PurchaseProvider>
    </GoldPriceProvider>
  );
}

export default App;
