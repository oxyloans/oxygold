import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy as reactLazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { GoldPriceProvider } from './context/GoldPriceContext';
import { PurchaseProvider } from './context/PurchaseContext';
import { CartProvider } from './PhysicalGold/CartContext';
import { WishlistProvider } from './PhysicalGold/WishlistContext';
import oxygoldLogo from './assets/oxygoldlogo-wk.png';
import ErrorBoundary from './components/ErrorBoundary';

// Eagerly loaded (critical path)
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './Verified';
import CertificatesPage from './components/CertificatesPage';

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void;
  }
}

// Robust lazy loading with automatic retry on chunk failure / new session
const lazy = (importFn: () => Promise<any>) =>
  reactLazy(async () => {
    try {
      const mod = await importFn();
      sessionStorage.removeItem(`chunk_retry_${window.location.pathname}`);
      return mod;
    } catch (error: any) {
      console.warn('Dynamic chunk import error encountered:', error);
      const retryKey = `chunk_retry_${window.location.pathname}`;
      const hasRetried = sessionStorage.getItem(retryKey);
      if (!hasRetried) {
        sessionStorage.setItem(retryKey, 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });

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
const AccountDeletionRequest = lazy(() => import('./PhysicalGold/AccountDeletionRequest'));
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
const PartnerAdminLogin = lazy(() => import('./physical-gold-partneradmin/pages/PartnerAdminLogin'));
const PartnerAdminLayout = lazy(() => import('./physical-gold-partneradmin/components/PartnerAdminLayout'));
const PartnerAdminProtectedRoute = lazy(() => import('./physical-gold-partneradmin/components/PartnerAdminProtectedRoute'));
const PartnerAdminProductsPage = lazy(() => import('./physical-gold-partneradmin/pages/PartnerAdminProductsPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const APITest = lazy(() => import('./pages/APITest'));
const ReviewOrder = lazy(() => import('./pages/ReviewOrder'));
const GoldSelection = lazy(() => import('./pages/GoldSelection'));
const BISCertificate = lazy(() => import('./pages/BISCertificate'));

// Global loading fallback
function PageLoader() {
  const [showRefreshHint, setShowRefreshHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRefreshHint(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07061A',
      gap: 16,
      padding: 24,
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'relative', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated outer golden spinner ring */}
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '3px solid rgba(194, 155, 39, 0.15)',
          borderTopColor: '#C29B27',
          borderRightColor: '#E2BF55',
          animation: 'spinLoader 1s linear infinite'
        }} />
        <img
          src={oxygoldLogo}
          alt="OxyGold"
          style={{ width: 72, height: 72, objectFit: 'contain', animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: '#E2BF55', textTransform: 'uppercase' }}>
          OxyGold.AI
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
          Loading your experience...
        </span>
      </div>

      {showRefreshHint && (
        <button
          onClick={() => {
            sessionStorage.removeItem(`chunk_retry_${window.location.pathname}`);
            window.location.reload();
          }}
          style={{
            marginTop: 10,
            padding: '8px 18px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: '1px solid #C29B27',
            background: 'linear-gradient(135deg, #C29B27 0%, #8B6914 100%)',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(194, 155, 39, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          Taking longer than usual? Click to Refresh
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(0.96); }
        }
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
    "/certificates",
    "/certificates/",
    "/verified/",
    "/hiddenlogin",
    "/hiddenlogin/",
  ].includes(location.pathname) ||
    location.pathname.startsWith("/physical-gold") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/partner") ||
    location.pathname.startsWith("/partner-admin") ||
    location.pathname.startsWith("/delivery-boy") ||
    location.pathname.startsWith("/voiceAssistant");
  const handleDataPass = (data: any) => {
    setTransactionData(data);
  };

  return (
    <div className="app">
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Header />}
      <div className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>

          <Routes>
            {/* Auth & Utility */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hiddenlogin" element={<HiddenLogin />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            
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
              <Route path="/physical-gold/account-deletion" element={<AccountDeletionRequest />} />
              <Route path="/physical-gold/account-delet" element={<AccountDeletionRequest />} />
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

            {/* Partner Admin module */}
            <Route path="/partner-admin/login" element={<PartnerAdminLogin />} />
            <Route element={<PartnerAdminProtectedRoute><PartnerAdminLayout /></PartnerAdminProtectedRoute>}>
              <Route path="/partner-admin" element={<Navigate to="/partner-admin/products" replace />} />
              <Route path="/partner-admin/products" element={<PartnerAdminProductsPage />} />
              <Route path="/partner-admin/dashboard" element={<Navigate to="/partner-admin/products" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      </div>
      {!isAuthPage && !isTestPage && !isFullPageFlow && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
