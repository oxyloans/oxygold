import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnRefundPolicy: React.FC = () => {
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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Return & Refund Policy</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. Return Period</h2>
              <p>
                We offer a 15-day return period from the date of delivery. Products must be returned in their original condition with all tags, certificates, and packaging intact.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. Eligible Returns</h2>
              <p className="mb-3">You can return products if:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The product is damaged or defective</li>
                <li>Wrong product was delivered</li>
                <li>Product does not match the description</li>
                <li>You are not satisfied with the purchase (within 15 days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. Non-Returnable Items</h2>
              <p className="mb-3">The following items cannot be returned:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized or engraved jewellery</li>
                <li>Products without original tags and certificates</li>
                <li>Items showing signs of wear or damage</li>
                <li>Products returned after 15 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Return Process</h2>
              <p className="mb-3">To initiate a return:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer support within 15 days of delivery</li>
                <li>Provide order number and reason for return</li>
                <li>Our team will arrange a pickup from your address</li>
                <li>Product will be inspected upon receipt</li>
                <li>Refund will be processed within 7-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Refund Method</h2>
              <p className="mb-3">Refunds will be processed to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Original payment method (for online payments)</li>
                <li>Bank account (for cash on delivery orders)</li>
                <li>OxyGold Wallet (instant credit option)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Exchange Policy</h2>
              <p className="mb-3">
                We offer lifetime exchange on all products:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>100% exchange value guaranteed</li>
                <li>Exchange for any product of equal or higher value</li>
                <li>Only making charges apply on new purchase</li>
                <li>Product must be in good condition with certificates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Damaged or Defective Products</h2>
              <p>
                If you receive a damaged or defective product, please contact us immediately with photos. We will arrange for immediate replacement or full refund at no additional cost.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">8. Cancellation Policy</h2>
              <p className="mb-3">
                Orders can be cancelled:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Before shipment: Full refund</li>
                <li>After shipment: Subject to return policy</li>
                <li>Customized orders: Cannot be cancelled</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">9. Contact Us</h2>
              <p className="mb-3">For returns, refunds, or exchanges, contact us:</p>
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

export default ReturnRefundPolicy;
