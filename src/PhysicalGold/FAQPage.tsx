import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "Is your gold jewellery BIS hallmarked?",
      answer: "Yes, all our gold jewellery is BIS hallmarked and comes with proper certification. We guarantee 22K purity on all our products."
    },
    {
      question: "What is your delivery time?",
      answer: "We deliver within 2-3 business days for metro cities and 3-5 business days for other locations. All shipments are fully insured."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free shipping on all orders above ₹50,000. For orders below this amount, a nominal shipping charge of ₹200 applies."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 15-day return policy from the date of delivery. Products must be in original condition with tags and certificates intact."
    },
    {
      question: "Do you offer lifetime exchange?",
      answer: "Yes, we offer lifetime exchange on all products at 100% value. You can exchange for any product of equal or higher value, paying only the making charges on the new purchase."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you will receive a tracking number via email and SMS. You can use this to track your order on our website or the courier partner's website."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets. All transactions are secured with SSL encryption."
    },
    {
      question: "Can I customize jewellery?",
      answer: "Yes, we offer customization services. Please contact our customer support team with your requirements, and we'll help you create your perfect piece."
    },
    {
      question: "What if I receive a damaged product?",
      answer: "If you receive a damaged or defective product, please contact us immediately with photos. We will arrange for immediate replacement or full refund at no additional cost."
    },
    {
      question: "How is the gold price calculated?",
      answer: "Our prices are based on current gold rates plus making charges and GST. Prices are updated regularly to reflect market rates."
    },
    {
      question: "Do you provide certificates with jewellery?",
      answer: "Yes, all our products come with BIS hallmark certificates and detailed invoices. For diamond jewellery, we also provide diamond certificates."
    },
    {
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled before shipment for a full refund. Once shipped, cancellation is subject to our return policy. Customized orders cannot be cancelled."
    }
  ];

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
          <h1 className="text-[28px] font-serif font-bold text-[#1A1A1A] mb-2">Frequently Asked Questions</h1>
          <p className="text-[14px] text-[#8A8A8A] mb-8">Find answers to common questions about our products and services</p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-[#E8E0D5] rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F5F2EE] transition"
                >
                  <span className="text-[15px] font-semibold text-[#1A1A1A] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#8B6914] flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 pt-2 text-[14px] text-[#4A4A4A] leading-relaxed border-t border-[#F0EBE1]">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-[#F5F2EE] rounded-lg border border-[#E8E0D5]">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-3">Still have questions?</h3>
            <p className="text-[14px] text-[#4A4A4A] mb-4">
              Our customer support team is here to help you with any queries.
            </p>
            <div className="space-y-2 text-[14px]">
              <p><strong>Email:</strong> support@askoxy.ai</p>
              <p><strong>Phone:</strong> +91 81432 71103</p>
              <p><strong>Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
