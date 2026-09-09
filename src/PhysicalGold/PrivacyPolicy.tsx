import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (Name, email address, phone number)</li>
                <li>Delivery address and billing information</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Transaction history and purchase records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you promotional materials (with your consent)</li>
                <li>Improve our services and customer experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Service providers who assist in our operations (payment processors, delivery partners)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Cookies</h2>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
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

export default PrivacyPolicy;
