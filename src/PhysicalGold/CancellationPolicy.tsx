import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CancellationPolicy: React.FC = () => {
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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Cancellation Policy</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. Order Cancellation</h2>
              <p>
                You can cancel your order at any time before it is shipped. Once an order is shipped, it cannot be cancelled but can be returned as per our Return Policy.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. How to Cancel</h2>
              <p className="mb-3">To cancel your order:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account</li>
                <li>Go to "My Orders" section</li>
                <li>Select the order you wish to cancel</li>
                <li>Click on "Cancel Order" button</li>
                <li>Provide reason for cancellation (optional)</li>
                <li>Confirm cancellation</li>
              </ol>
              <p className="mt-3">
                Alternatively, you can contact our customer support team at support@oxygold.ai or call +91 81432 71103.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. Cancellation Timeline</h2>
              <div className="space-y-3 mt-3">
                <div className="p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Before Order Processing (Within 2 hours)</h3>
                  <p>Full refund with no cancellation charges. Refund processed within 24 hours.</p>
                </div>
                <div className="p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">After Processing, Before Shipment</h3>
                  <p>Full refund with no cancellation charges. Refund processed within 3-5 business days.</p>
                </div>
                <div className="p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">After Shipment</h3>
                  <p>Order cannot be cancelled. Please refer to our Return Policy for returns after delivery.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Non-Cancellable Orders</h2>
              <p className="mb-3">The following orders cannot be cancelled:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized or engraved jewellery</li>
                <li>Made-to-order products</li>
                <li>Orders that have already been shipped</li>
                <li>Special occasion orders placed less than 48 hours before delivery date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Refund Process</h2>
              <p className="mb-3">Upon successful cancellation:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Online Payments:</strong> Refund to original payment method within 5-7 business days</li>
                <li><strong>Wallet Payments:</strong> Instant credit to OxyGold Wallet</li>
                <li><strong>Cash on Delivery:</strong> No refund applicable as payment not made</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Seller-Initiated Cancellation</h2>
              <p className="mb-3">
                We reserve the right to cancel orders in the following situations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product is out of stock or unavailable</li>
                <li>Pricing or product information error</li>
                <li>Delivery address is not serviceable</li>
                <li>Suspected fraudulent transaction</li>
                <li>Force majeure events</li>
              </ul>
              <p className="mt-3">
                In such cases, you will be notified immediately and full refund will be processed within 3-5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Partial Cancellation</h2>
              <p>
                For orders with multiple items, you can cancel individual items before the order is shipped. Refund will be processed for the cancelled items only.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">8. Cancellation Confirmation</h2>
              <p>
                Once your cancellation is processed, you will receive a confirmation email and SMS with the cancellation details and expected refund timeline.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">9. Contact Us</h2>
              <p className="mb-3">For any queries regarding order cancellation:</p>
              <div className="mt-3 p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                <p className="font-semibold text-[#1A1A1A]">OXYIDEAS PARTNERS LLP</p>
                <p>Email: support@oxygold.ai</p>
                <p>Phone: +91 81432 71103</p>
                <p>Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CancellationPolicy;
