import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TermsConditionsProps {
  termsData: any;
  flowType: 'buy' | 'sell';
}

const TermsConditions = ({ termsData, flowType }: TermsConditionsProps) => {
  const navigate = useNavigate();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleProceed = () => {
    if (flowType === 'buy') {
      navigate('/payment-method');
    } else {
      navigate('/sell-processing');
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen py-8 px-12">
      <div className="max-w-2xl mx-auto">
        <button 
          className="text-purple-primary font-medium mb-6 hover:text-purple-light transition-colors duration-200"
          onClick={() => navigate(flowType === 'buy' ? '/order-summary' : '/sell-summary')}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-text-primary mb-8">Terms & Conditions</h1>

        <div className="bg-bg-surface border border-border-light rounded-md p-8 mb-6">
          <div className="max-h-96 overflow-y-auto space-y-6 mb-6">
            {flowType === 'buy' ? (
              <>
                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">1. Dynamic Pricing</h2>
                  <p className="text-sm text-text-secondary leading-6">Gold prices are market-linked and subject to real-time fluctuations. The rate displayed at the time of transaction initiation is locked for a limited period (typically 5 minutes). If the transaction is not completed within this timeframe, the price may change based on current market rates.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">2. GST Applicability</h2>
                  <p className="text-sm text-text-secondary leading-6">Goods and Services Tax (GST) at the applicable rate (currently 3%) is levied on all gold purchases as per Indian tax regulations. The GST amount is clearly displayed in the order summary and is included in the total payable amount.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">3. Vault Storage</h2>
                  <p className="text-sm text-text-secondary leading-6">All purchased gold is stored in secure, insured vaults maintained by our authorized vault partners. The gold is held in your name and is 99.5% pure (24K). You can view your holdings in your portfolio at any time.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">4. No Cancellation Policy</h2>
                  <p className="text-sm text-text-secondary leading-6">Once a purchase transaction is confirmed and payment is processed, it cannot be cancelled or reversed. Please review your order carefully before proceeding with payment. You may sell your gold holdings at any time at the prevailing market rate.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">5. KYC Requirement</h2>
                  <p className="text-sm text-text-secondary leading-6">As per regulatory guidelines, KYC (Know Your Customer) verification is mandatory for all users. Transactions may be subject to limits based on your KYC status. Complete KYC is required for transactions exceeding specified thresholds.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">6. Payment Security</h2>
                  <p className="text-sm text-text-secondary leading-6">All payments are processed through secure, PCI DSS compliant payment gateways. We do not store your card details or banking credentials. Your payment information is encrypted and transmitted securely.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">7. Transaction Confirmation</h2>
                  <p className="text-sm text-text-secondary leading-6">Gold will be credited to your account instantly upon successful payment confirmation. You will receive a transaction confirmation via email and SMS. A detailed invoice will be available for download in your transaction history.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">8. Regulatory Compliance</h2>
                  <p className="text-sm text-text-secondary leading-6">This service is operated in compliance with RBI guidelines, SEBI regulations, and applicable Indian laws. We reserve the right to refuse or cancel transactions that do not meet regulatory requirements.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">1. Live Sell Price</h2>
                  <p className="text-sm text-text-secondary leading-6">Sell prices are based on real-time market rates and are locked for a limited period (typically 15 seconds). The locked rate is displayed on the review screen. If the lock period expires, you will need to refresh and get a new price quote.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">2. Settlement Timeline</h2>
                  <p className="text-sm text-text-secondary leading-6">Funds from gold sales are credited to your registered bank account on a T+1 basis (next working day from transaction date). Settlement may be delayed due to bank holidays, weekends, or technical issues beyond our control.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">3. Bank Verification</h2>
                  <p className="text-sm text-text-secondary leading-6">Payouts are made only to bank accounts that have been verified and registered in your name. For security reasons, we do not support third-party bank account transfers. Please ensure your bank details are accurate before confirming the sale.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">4. Tax Deduction at Source (TDS)</h2>
                  <p className="text-sm text-text-secondary leading-6">As per Section 194Q of the Income Tax Act, 1961, TDS at the applicable rate (currently 1%) is deducted from the gross sale value for transactions exceeding specified limits. A TDS certificate will be provided for your tax filing purposes.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">5. Processing Fees</h2>
                  <p className="text-sm text-text-secondary leading-6">A processing fee (currently 1% of transaction value) is charged to cover transaction costs, vault management, compliance, and operational expenses. This fee is clearly displayed in the payout calculation before confirmation.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">6. No Reversal Policy</h2>
                  <p className="text-sm text-text-secondary leading-6">Once a sell order is confirmed, it cannot be cancelled or reversed. The gold will be debited from your account immediately, and the payout process will be initiated. Please review all details carefully before confirming.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">7. PAN Requirement</h2>
                  <p className="text-sm text-text-secondary leading-6">For transactions exceeding regulatory thresholds (currently ₹2 lakhs per financial year), PAN verification is mandatory. Higher TDS rates may apply if PAN is not provided. Ensure your PAN is linked to your account for seamless transactions.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">8. Regulatory Compliance</h2>
                  <p className="text-sm text-text-secondary leading-6">This service operates under RBI guidelines, Income Tax regulations, and applicable Indian laws. We reserve the right to refuse or cancel transactions that do not meet regulatory requirements or appear suspicious.</p>
                </section>
              </>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input 
              type="checkbox" 
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-text-secondary">
              I have read and agree to the Terms & Conditions and Disclaimer
            </span>
          </label>

          <button 
            className={`w-full py-3 rounded-md font-semibold transition-colors duration-200 ${
              isAccepted
                ? 'bg-purple-primary text-white hover:bg-purple-light'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleProceed}
            disabled={!isAccepted}
          >
            {flowType === 'buy' ? 'Proceed to Payment' : 'Confirm & Sell Gold'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
