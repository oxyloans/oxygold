import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShippingPolicy: React.FC = () => {
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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Shipping Policy</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. Shipping Coverage</h2>
              <p>
                We currently ship across India. All orders are processed and shipped from our secure facility in Hyderabad, Telangana.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. Shipping Charges</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free Shipping:</strong> On all orders above ₹50,000</li>
                <li><strong>Standard Shipping:</strong> ₹200 for orders below ₹50,000</li>
                <li>All shipments are fully insured at no additional cost</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. Delivery Timeline</h2>
              <p className="mb-3">
                Standard delivery times:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Metro Cities:</strong> 2-3 business days</li>
                <li><strong>Other Cities:</strong> 3-5 business days</li>
                <li><strong>Remote Areas:</strong> 5-7 business days</li>
              </ul>
              <p className="mt-3">
                Note: Delivery times are estimates and may vary due to unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Order Processing</h2>
              <p>
                Orders are processed within 24 hours of payment confirmation. You will receive a tracking number via email and SMS once your order is shipped.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Shipping Partners</h2>
              <p>
                We work with trusted courier partners including Blue Dart, FedEx, and DHL to ensure safe and timely delivery of your precious jewellery.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Insurance</h2>
              <p>
                All shipments are fully insured for the declared value. In the rare event of loss or damage during transit, we will process a full refund or replacement.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Delivery Requirements</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Signature required upon delivery</li>
                <li>Valid ID proof must be presented</li>
                <li>Recipient must match the order details</li>
                <li>Undelivered packages will be returned to our facility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">8. Tracking Your Order</h2>
              <p>
                You can track your order using the tracking number provided via email/SMS. For any shipping queries, contact our customer support team.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">9. Contact Us</h2>
              <div className="mt-3 p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                <p className="font-semibold text-[#1A1A1A]">OXYIDEAS PARTNERS LLP</p>
                <p>Email: support@oxygold.ai</p>
                <p>Phone: +91 81432 71103</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShippingPolicy;
