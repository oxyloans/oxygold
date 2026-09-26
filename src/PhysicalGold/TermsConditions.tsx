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
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:pt-40">
        <button
          type="button"
          onClick={() => navigate("/physical-gold")}
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] transition hover:text-[#8B6914]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </button>

        <div className="rounded-xl border border-[#E8E0D5] bg-white p-5 sm:p-8 md:p-10 lg:p-12">
          <h1 className="mb-2 text-[26px] font-serif font-bold text-[#1A1A1A] sm:text-[28px]">
            Terms and Conditions
          </h1>
          <p className="mb-8 text-[12px] text-[#8A8A8A]">Last Updated: September 2026</p>

          <div className="space-y-7 text-[14px] leading-relaxed text-[#4A4A4A]">
            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">1. Acceptance of Terms</h2>
              <div className="space-y-3">
                <p>
                  By accessing and using OxyGold&apos;s website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                </p>
                <p>
                  By using the website, placing an order, or providing information to OxyGold, you acknowledge that your personal data may be processed as described in the applicable OxyGold Privacy Policy and privacy notices.
                </p>
                <p>
                  Acceptance of these Terms and Conditions does not, by itself, constitute consent to every processing activity for which separate consent is required under applicable data protection law. Where consent is required, OxyGold will obtain it through an appropriate clear and affirmative action.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">2. Product Information</h2>
              <p className="mb-3">All gold jewellery sold on OxyGold is:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>BIS Hallmarked and certified for purity</li>
                <li>Accompanied by proper certification and documentation</li>
                <li>Subject to availability and may vary slightly from images shown</li>
                <li>Priced according to current gold rates and making charges</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">3. Orders and Payment</h2>
              <p className="mb-3">When you place an order:</p>
              <ul className="mb-3 list-disc space-y-2 pl-6">
                <li>You must provide accurate and complete information</li>
                <li>Payment must be made in full before order processing</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>All payments are processed securely through authorized payment gateways</li>
              </ul>
              <div className="space-y-3">
                <p>
                  Information provided while placing an order may include personal data such as identification, contact, delivery, payment-related, and transaction information. Such personal data will be processed only for specified purposes such as order processing, payment, delivery, customer support, fraud prevention, security, and compliance with applicable law.
                </p>
                <p>
                  Where processing is based on consent, OxyGold will provide the applicable notice and obtain consent through clear affirmative action where required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">4. Delivery</h2>
              <div className="space-y-3">
                <p>
                  We strive to deliver your orders within 2-3 business days. Delivery times may vary based on location and product availability. All shipments are fully insured until delivery.
                </p>
                <p>
                  Information necessary for delivery, including relevant contact and delivery information, may be shared with authorized delivery, logistics, payment, technology, or other service providers where required to provide the requested service and as permitted or required by applicable law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">5. Returns and Exchanges</h2>
              <p className="mb-3">Our return policy includes:</p>
              <ul className="mb-3 list-disc space-y-2 pl-6">
                <li>15-day return period from date of delivery</li>
                <li>Products must be in original condition with tags and certificates</li>
                <li>Customized or engraved items cannot be returned</li>
                <li>Lifetime exchange available at 100% value</li>
              </ul>
              <p>
                Information relating to returns, exchanges, refunds, and customer communications may be processed for the purposes of providing these services, maintaining transaction records, preventing fraud or misuse, and complying with applicable legal or regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">6. Intellectual Property</h2>
              <p>
                All content on this website, including images, text, logos, and designs, is the property of OXYIDEAS PARTNERS LLP and protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">7. Limitation of Liability</h2>
              <div className="space-y-3">
                <p>
                  OxyGold shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product.
                </p>
                <p>
                  Nothing in these Terms is intended to exclude or limit any rights or protections that cannot lawfully be excluded or limited under applicable law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">8. Governing Law</h2>
              <p>
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-[#1A1A1A]">9. Privacy and Data Protection</h2>

              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.1 Processing of Personal Data</h3>
                  <div className="space-y-3">
                    <p>
                      OxyGold may collect and process personal data provided by users in connection with accessing the website, creating an account where applicable, placing orders, making payments, requesting delivery, returns or exchanges, contacting customer support, and using other services provided through the platform.
                    </p>
                    <p>
                      The categories of personal data processed may include identification and contact information, account information, delivery information, transaction information, payment-related information, device and usage information, and other information necessary for providing the requested services.
                    </p>
                    <p>
                      OxyGold will process personal data for specified purposes and in accordance with the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), applicable rules made thereunder, and other applicable laws.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.2 Notice and Consent</h3>
                  <div className="space-y-3">
                    <p>
                      Where processing is based on consent, OxyGold will provide an applicable notice describing the personal data to be processed and the specified purpose for such processing.
                    </p>
                    <p>
                      Consent, where required, will be obtained through clear affirmative action and will be free, specific, informed, unconditional, and unambiguous.
                    </p>
                    <p>
                      Where consent is required for a separate or additional purpose, such consent will be obtained separately through an appropriate consent mechanism.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.3 Withdrawal of Consent</h3>
                  <div className="space-y-3">
                    <p>
                      Where personal data is processed on the basis of consent, the Data Principal may withdraw consent through the available mechanism provided by OxyGold.
                    </p>
                    <p>
                      Withdrawal of consent will not affect the lawfulness of processing carried out before such withdrawal.
                    </p>
                    <p>
                      Where withdrawal affects processing that is necessary for providing a particular service, OxyGold may be unable to continue that service to the extent the processing is necessary and no other lawful basis is available.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.4 Data Principal Rights</h3>
                  <p className="mb-3">
                    Subject to applicable law and the conditions prescribed thereunder, a Data Principal may exercise applicable rights in relation to their personal data, including:
                  </p>
                  <ul className="mb-3 list-disc space-y-2 pl-6">
                    <li>Access to information about their personal data and its processing</li>
                    <li>Correction, completion, or updating of inaccurate or incomplete personal data</li>
                    <li>Erasure of personal data where applicable</li>
                    <li>Withdrawal of consent where processing is based on consent</li>
                    <li>Grievance redressal</li>
                    <li>Nomination, where applicable under law</li>
                  </ul>
                  <p>Requests may be made through the contact mechanism provided by OxyGold.</p>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.5 Children&apos;s Personal Data</h3>
                  <div className="space-y-3">
                    <p>
                      OxyGold will comply with the additional requirements applicable to the processing of personal data of children under the DPDP Act.
                    </p>
                    <p>
                      Where personal data of a child is processed, OxyGold will obtain verifiable consent of the parent or lawful guardian in the manner required by applicable law.
                    </p>
                    <p>
                      OxyGold will not undertake processing of children&apos;s personal data that is likely to cause a detrimental effect on the well-being of a child and will not undertake tracking or behavioural monitoring of children or targeted advertising directed at children, except where an applicable legal exemption or prescribed condition applies.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.6 Disclosure and Service Providers</h3>
                  <div className="space-y-3">
                    <p>
                      Personal data may be disclosed to authorized service providers, including payment processors, delivery and logistics providers, technology providers, customer support providers, fraud-prevention providers, and other persons or entities where such disclosure is necessary for providing the requested services or is permitted or required by applicable law.
                    </p>
                    <p>
                      Such processing and disclosures will be subject to applicable contractual, technical, organizational, and legal safeguards as required.
                    </p>
                    <p>
                      OxyGold may also disclose personal data where required by law, lawful order, regulatory requirement, or other legally authorized direction.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.7 Security of Personal Data</h3>
                  <div className="space-y-3">
                    <p>
                      OxyGold will implement reasonable technical and organisational measures to protect personal data against unauthorized processing, access, disclosure, alteration, loss, or other applicable security risks, having regard to the nature of the personal data and the risks associated with its processing.
                    </p>
                    <p>
                      However, no internet-based system or method of electronic transmission can be guaranteed to be completely secure.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.8 Retention and Deletion</h3>
                  <div className="space-y-3">
                    <p>
                      Personal data will be retained only for as long as necessary for the specified purpose for which it was processed and for any additional period required or permitted under applicable law.
                    </p>
                    <p>
                      When personal data is no longer required for the specified purpose and there is no legal or regulatory requirement to retain it, OxyGold will delete or securely dispose of the personal data in accordance with applicable requirements.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.9 Personal Data Breach</h3>
                  <p>
                    In the event of a personal data breach, OxyGold will take measures required under applicable law, including applicable requirements relating to notification of the Data Protection Board and affected Data Principals, where applicable.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">9.10 Changes Requiring Consent</h3>
                  <div className="space-y-3">
                    <p>OxyGold may update these Terms and Conditions from time to time.</p>
                    <p>
                      Where a change involves processing for a new or additional purpose for which consent is required, OxyGold will provide the applicable notice and obtain fresh consent through an appropriate affirmative action where required by law.
                    </p>
                    <p>
                      Continued use of the website or services will not by itself be treated as consent where separate consent is legally required.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold text-[#1A1A1A]">10. Contact Information</h2>
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

export default TermsConditions;
