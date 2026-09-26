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
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:pt-40">
        <button
          type="button"
          onClick={() => navigate("/physical-gold")}
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] transition hover:text-[#8B6914]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </button>

        <div className="rounded-xl border border-[#E8E0D5] bg-white p-5 sm:p-8 md:p-10 lg:p-12">
          <h1 className="mb-2 text-[26px] font-serif font-bold text-[#1A1A1A] sm:text-[28px]">Privacy Policy</h1>
          <p className="mb-8 text-[12px] text-[#8A8A8A]">Last Updated: September 2026</p>

          <div className="space-y-7 text-[14px] leading-relaxed text-[#4A4A4A]">
            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">1. Information We Collect</h2>
              <p className="mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="mb-3 list-disc space-y-2 pl-6">
                <li>Personal identification information (Name, email address, phone number)</li>
                <li>Delivery address and billing information</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Transaction history and purchase records</li>
              </ul>
              <div className="space-y-3">
                <p>
                  We may also collect information generated through your use of our website and services, such as device, browser, IP address, and usage information, where applicable and necessary for providing and securing our services.
                </p>
                <p>
                  We collect and process personal data only for specified purposes communicated to you and in accordance with applicable law, including the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;) and applicable rules made thereunder.
                </p>
                <p>
                  Where personal data is collected directly from you, the applicable notice will provide information necessary to understand the personal data being processed and the purpose for which it is processed.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="mb-3 list-disc space-y-2 pl-6">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you promotional materials with your consent, where consent is required</li>
                <li>Improve our services and customer experience</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud, misuse, unauthorized activity, and security incidents</li>
                <li>Provide customer support and manage returns, exchanges, refunds, and related services</li>
              </ul>
              <div className="space-y-3">
                <p>
                  Where processing is based on consent, consent will be obtained through clear affirmative action after the applicable notice. Consent will be free, specific, informed, unconditional, and unambiguous.
                </p>
                <p>
                  Where consent is required for a separate or additional purpose, OxyGold will obtain such consent separately through an appropriate mechanism.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">3. Information Sharing</h2>
              <div className="space-y-3">
                <p>We do not sell, trade, or rent your personal information to third parties.</p>
                <p>We may share your information with:</p>
              </div>
              <ul className="my-3 list-disc space-y-2 pl-6">
                <li>Service providers who assist in our operations, including payment processors and delivery partners</li>
                <li>Other authorized service providers where required to provide our services</li>
                <li>Legal authorities when required or permitted by law</li>
                <li>Business partners where such sharing is permitted and the required consent or other lawful basis is available</li>
              </ul>
              <div className="space-y-3">
                <p>
                  Personal data shared with service providers will be limited to what is necessary for the relevant service or purpose and will be handled in accordance with applicable law and appropriate safeguards.
                </p>
                <p>
                  We may also disclose personal data where required by law, lawful order, regulatory requirement, or other legally authorized direction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">4. Data Security</h2>
              <div className="space-y-3">
                <p>
                  We implement reasonable technical and organisational measures to protect your personal information against unauthorized access, disclosure, alteration, loss, or other applicable security risks.
                </p>
                <p>
                  All payment transactions are encrypted using SSL technology where supported by our payment partners. However, no method of transmission over the internet is 100% secure.
                </p>
                <p>
                  Where a personal data breach occurs, OxyGold will take measures required under applicable law, including applicable requirements relating to notification of affected Data Principals and the Data Protection Board.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">5. Your Rights</h2>
              <p className="mb-3">
                Subject to applicable law and the conditions prescribed under the DPDP Act, you may have the right to:
              </p>
              <ul className="mb-3 list-disc space-y-2 pl-6">
                <li>Access information about your personal data and its processing</li>
                <li>Correct, complete, or update inaccurate or incomplete personal data</li>
                <li>Request erasure of personal data where applicable</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Obtain grievance redressal</li>
                <li>Nominate another individual, where applicable under law</li>
                <li>Opt out of promotional or marketing communications where applicable</li>
              </ul>
              <div className="space-y-3">
                <p>
                  Where you have provided consent for processing, you may withdraw that consent through the available mechanism. Withdrawal of consent will not affect the lawfulness of processing carried out before the withdrawal.
                </p>
                <p>
                  Where withdrawal of consent affects processing that is necessary to provide a requested service and no other lawful basis is available, OxyGold may be unable to continue that service to the extent affected.
                </p>
                <p>
                  Requests relating to your rights, correction, erasure, withdrawal of consent, or privacy grievances may be submitted using the contact details provided in Section 7.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">6. Cookies</h2>
              <div className="space-y-3">
                <p>
                  We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, maintain website functionality, and personalize content where applicable.
                </p>
                <p>
                  Where cookies or similar technologies involve processing of personal data, such processing will be carried out for specified purposes and in accordance with applicable law.
                </p>
                <p>
                  Where consent is required, the applicable consent will be obtained through an appropriate mechanism. You may also control certain cookie preferences through your browser settings, subject to the functionality of the website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, the processing of your personal data, your Data Principal rights, withdrawal of consent, correction or erasure requests, or privacy-related grievances, please contact us at:
              </p>
              <div className="mt-3 rounded-lg border border-[#E8E0D5] bg-[#F5F2EE] p-4">
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
