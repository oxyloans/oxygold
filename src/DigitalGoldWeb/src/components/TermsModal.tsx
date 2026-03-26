interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowType: 'buy' | 'sell';
}

const TermsModal = ({ isOpen, onClose, flowType }: TermsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-md max-w-2xl w-full max-h-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-light">
          <h2 className="text-xl font-bold text-text-primary">Terms & Conditions</h2>
          <button className="text-3xl text-text-secondary hover:text-text-primary transition-colors duration-200" onClick={onClose}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {flowType === 'buy' ? (
            <>
              <section>
                <h3 className="font-semibold text-text-primary mb-1">1. Dynamic Pricing</h3>
                <p className="text-xs text-text-secondary leading-5">Gold prices are market-linked and subject to real-time fluctuations based on international gold rates and currency exchange rates. The rate displayed at the time of transaction initiation is locked for a limited period (typically 5 minutes).</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">2. GST & Charges</h3>
                <p className="text-xs text-text-secondary leading-5">Goods and Services Tax (GST) at the applicable rate (currently 3%) is levied on all gold purchases as per Indian tax regulations. The GST amount is clearly displayed in the order summary and is included in the total payable amount.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">3. Vault Storage & Custody</h3>
                <p className="text-xs text-text-secondary leading-5">All purchased gold is stored in secure, insured vaults maintained by our authorized vault partners. The gold is held in your name and is 99.5% pure (24K) as per BIS standards. Storage is provided free of charge.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">4. No Cancellation Policy</h3>
                <p className="text-xs text-text-secondary leading-5">Once a purchase transaction is confirmed and payment is processed successfully, it cannot be cancelled, reversed, or refunded under any circumstances. Please review your order carefully before proceeding with payment.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">5. KYC Requirements</h3>
                <p className="text-xs text-text-secondary leading-5">As per regulatory guidelines issued by RBI and PMLA, KYC (Know Your Customer) verification is mandatory for all users. Complete KYC with PAN verification is required for transactions exceeding ₹50,000 per financial year.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">6. Payment Security</h3>
                <p className="text-xs text-text-secondary leading-5">All payments are processed through secure, PCI DSS Level 1 compliant payment gateways. We use 256-bit SSL encryption for all transactions. We do not store your card details, CVV, or banking credentials on our servers.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">7. Transaction Confirmation</h3>
                <p className="text-xs text-text-secondary leading-5">Gold will be credited to your account instantly upon successful payment confirmation. You will receive a transaction confirmation via email and SMS. A detailed tax invoice will be available for download within 24 hours.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">8. Risk Disclaimer</h3>
                <p className="text-xs text-text-secondary leading-5">Investment in gold is subject to market risks. The value of your investment may fluctuate based on market conditions. Past performance is not indicative of future results. We do not guarantee any returns or capital protection.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">9. Regulatory Compliance</h3>
                <p className="text-xs text-text-secondary leading-5">This service is operated in compliance with RBI guidelines, SEBI regulations, PMLA norms, and all applicable Indian laws. We reserve the right to refuse, cancel, or reverse transactions that do not meet regulatory requirements.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="font-semibold text-text-primary mb-1">1. Live Sell Price</h3>
                <p className="text-xs text-text-secondary leading-5">Sell prices are based on real-time market rates and are typically lower than buy prices due to market spreads. The sell rate is locked for a limited period (typically 15 seconds) once you reach the review screen.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">2. Settlement Timeline</h3>
                <p className="text-xs text-text-secondary leading-5">Funds from gold sales are credited to your registered bank account on a T+1 basis (next working day from transaction date). Settlement may be delayed due to bank holidays, weekends, or technical issues beyond our control.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">3. Bank Verification & Payout</h3>
                <p className="text-xs text-text-secondary leading-5">Payouts are made only to bank accounts that have been verified and registered in your name as per KYC records. We do not support third-party bank account transfers. Please ensure your bank details are accurate before confirming.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">4. Tax Deduction at Source (TDS)</h3>
                <p className="text-xs text-text-secondary leading-5">As per Section 194Q of the Income Tax Act, 1961, TDS at the applicable rate (currently 0.1%) is deducted from the gross sale value. A TDS certificate will be available in your account for tax filing purposes.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">5. Processing Fees & Charges</h3>
                <p className="text-xs text-text-secondary leading-5">A processing fee (currently 1% of transaction value) is charged to cover transaction costs, vault management, compliance, and operational expenses. This fee is clearly displayed in the payout calculation before confirmation.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">6. No Reversal Policy</h3>
                <p className="text-xs text-text-secondary leading-5">Once a sell order is confirmed, it cannot be cancelled or reversed. The gold will be debited from your account immediately upon confirmation. Please review all details carefully before confirming.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">7. PAN & KYC Requirements</h3>
                <p className="text-xs text-text-secondary leading-5">For transactions exceeding regulatory thresholds (currently ₹2 lakhs per financial year), PAN verification is mandatory. Higher TDS rates may apply if PAN is not provided. Ensure your PAN is linked to your account.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">8. Market Risk Disclaimer</h3>
                <p className="text-xs text-text-secondary leading-5">Gold prices are subject to market volatility and may fluctuate significantly. The sell price may be lower than your purchase price, resulting in capital loss. We do not guarantee any minimum sell price or returns.</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-1">9. Regulatory Compliance</h3>
                <p className="text-xs text-text-secondary leading-5">This service operates under RBI guidelines, Income Tax regulations, PMLA norms, and all applicable Indian laws. We reserve the right to refuse or cancel transactions that do not meet regulatory requirements or appear suspicious.</p>
              </section>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-light">
          <button className="w-full py-2 bg-purple-primary text-white rounded-md font-semibold hover:bg-purple-light transition-colors duration-200" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
