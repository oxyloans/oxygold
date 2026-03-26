declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeConfig {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_parent' | '_top';
    returnUrl?: string;
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): void;
  }

  export function load(config: CashfreeConfig): Promise<CashfreeInstance>;
}