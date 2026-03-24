export interface PaymentResult {
  success: boolean;
  redirectUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface DonationPaymentData {
  campaignId: string;
  campaignName: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentProvider {
  readonly name: 'stripe' | 'paypal';
  createDonationCheckout(data: DonationPaymentData): Promise<PaymentResult>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
}

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: 'stripe' | 'paypal'): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Payment provider "${name}" not registered`);
    return provider;
  }

  async createDonation(
    providerName: 'stripe' | 'paypal',
    data: DonationPaymentData
  ): Promise<PaymentResult> {
    return this.getProvider(providerName).createDonationCheckout(data);
  }
}

export const paymentService = new PaymentService();
