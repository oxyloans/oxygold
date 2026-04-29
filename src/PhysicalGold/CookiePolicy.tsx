import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CookiePolicy: React.FC = () => {
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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Cookie Policy</h1>
          <p className="text-[12px] text-[#8A8A8A] mb-8">Last Updated: January 2024</p>

          <div className="space-y-6 text-[14px] text-[#4A4A4A] leading-relaxed">
            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">2. Types of Cookies We Use</h2>
              
              <div className="space-y-4 mt-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure areas access, and shopping cart functionality.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Performance Cookies</h3>
                  <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Functional Cookies</h3>
                  <p>These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and login details.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Marketing Cookies</h3>
                  <p>These cookies track your browsing habits to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">3. How We Use Cookies</h2>
              <p className="mb-3">We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you signed in to your account</li>
                <li>Remember your shopping cart items</li>
                <li>Understand and save your preferences for future visits</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Personalize content and advertisements</li>
                <li>Improve website functionality and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">4. Third-Party Cookies</h2>
              <p>
                We may use third-party services like Google Analytics, payment gateways, and social media platforms that also set cookies. These third parties have their own privacy policies and cookie policies.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">5. Managing Cookies</h2>
              <p className="mb-3">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies through their settings</li>
                <li><strong>Delete Cookies:</strong> You can delete cookies that have already been set</li>
                <li><strong>Opt-Out:</strong> You can opt-out of third-party cookies through their respective websites</li>
              </ul>
              <p className="mt-3">
                Note: Disabling cookies may affect the functionality of our website and limit your access to certain features.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">6. Cookie Duration</h2>
              <p className="mb-3">Cookies may be:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">7. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">8. Contact Us</h2>
              <p className="mb-3">If you have questions about our use of cookies, please contact us:</p>
              <div className="mt-3 p-4 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
                <p className="font-semibold text-[#1A1A1A]">OXYKART TECHNOLOGIES PVT LTD</p>
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

export default CookiePolicy;
