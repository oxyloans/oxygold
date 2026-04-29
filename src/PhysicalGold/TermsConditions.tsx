import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsConditions: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EE]">
      <main className="pt-40 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/physical-gold")}
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </button>

        <div className="bg-white border border-[#E8E0D5] rounded-xl p-8 sm:p-12">
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Terms & Conditions</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using OxyGold's website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. Product Information</h2>
              <p className="mb-3">
                All gold jewellery sold on OxyGold is:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>BIS Hallmarked and certified for purity</li>
                <li>Accompanied by proper certification and documentation</li>
                <li>Subject to availability and may vary slightly from images shown</li>
                <li>Priced according to current gold rates and making charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. Orders and Payment</h2>
              <p className="mb-3">
                When you place an order:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>Payment must be made in full before order processing</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>All payments are processed securely through authorized payment gateways</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Delivery</h2>
              <p>
                We strive to deliver your orders within 2-3 business days. Delivery times may vary based on location and product availability. All shipments are fully insured until delivery.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Returns and Exchanges</h2>
              <p className="mb-3">
                Our return policy includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>15-day return period from date of delivery</li>
                <li>Products must be in original condition with tags and certificates</li>
                <li>Customized or engraved items cannot be returned</li>
                <li>Lifetime exchange available at 100% value</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Intellectual Property</h2>
              <p>
                All content on this website, including images, text, logos, and designs, is the property of OXYIDEAS TECHNOLOGIES PVT LTD and protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Limitation of Liability</h2>
              <p>
                OxyGold shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">8. Governing Law</h2>
              <p>
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">9. Contact Information</h2>
              <div className="mt-3 p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                <p className="font-semibold text-[#1A1A1A]">OXYIDEAS TECHNOLOGIES PVT LTD</p>
                <p>Email: support@askoxy.ai</p>
                <p>Phone: +91 81432 71103</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;
