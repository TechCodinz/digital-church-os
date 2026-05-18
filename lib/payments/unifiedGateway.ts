// lib/payments/unifiedGateway.ts
import {
    StripeCryptoProvider,
    EngivenProvider,
    BoomFiProvider,
    TransFiProvider,
    CrossmintProvider,
    DigiDovProvider,
    CryptoComProvider,
    PayPalProvider,
    BitPayProvider,
    CoinbaseCommerceProvider
} from './cryptoProviders';

export class UnifiedPaymentGateway {
    private providers = {
        stripe: new StripeCryptoProvider(),
        paypal: new PayPalProvider(),
        coinbase: new CoinbaseCommerceProvider(),
        bitpay: new BitPayProvider(),
        engiven: new EngivenProvider(), // For large crypto donations
        crossmint: new CrossmintProvider(), // Card-to-crypto
        boomfi: new BoomFiProvider(), // Multi-chain crypto
        transfi: new TransFiProvider(), // Unified fiat+crypto
        digidov: new DigiDovProvider(), // Non-custodial crypto
        cryptoCom: new CryptoComProvider(), // Via Stripe partnership
    };

    async processPayment(params: {
        amount: number;
        currency: string;
        paymentMethod: string;
        purpose: string;
        userId: string;
        metadata?: any;
        isRecurring?: boolean;
        email?: string;
        chain?: string;
    }) {

        // Select appropriate provider
        const provider = this.selectProvider(params.paymentMethod);
        if (!provider) {
            throw new Error(`Payment method ${params.paymentMethod} not supported`);
        }

        // Process payment
        const result = await provider.process(params);

        // Record in unified ledger
        await this.recordTransaction({
            ...params,
            provider: result.provider,
            transactionId: result.transactionId || 'pending',
            status: result.status || 'pending',
        });

        return result;
    }

    private selectProvider(method: string) {
        const providerMap: any = {
            // Traditional
            credit_card: this.providers.stripe,
            debit_card: this.providers.stripe,
            ach: this.providers.stripe,
            bank_transfer: this.providers.stripe,
            paypal: this.providers.paypal,

            // Major cryptocurrencies
            bitcoin: this.providers.bitpay,
            ethereum: this.providers.coinbase,
            litecoin: this.providers.bitpay,
            dogecoin: this.providers.bitpay,

            // Stablecoins
            usdc: this.providers.crossmint,
            usdt: this.providers.boomfi,
            dai: this.providers.boomfi,

            // Multi-chain support
            polygon_usdc: this.providers.boomfi,
            solana_usdc: this.providers.transfi,
            arbitrum_eth: this.providers.crossmint,
            base_eth: this.providers.crossmint,

            // Non-custodial
            ethereum_non_custodial: this.providers.digidov,

            // Large donations
            crypto_high_value: this.providers.engiven,

            // Exchange partnerships
            crypto_com: this.providers.cryptoCom,
        };

        return providerMap[method];
    }

    private async recordTransaction(record: any) {
        try {
            const { prisma } = await import('@/lib/prisma');
            const { Resend } = await import('resend');

            // ── Persist to DB ─────────────────────────────────────────────────
            // Map arbitrary purpose string to OfferingPurpose enum
            const purposeMap: Record<string, 'PLATFORM_UPKEEP' | 'COMMUNITY_AID' | 'CONFERENCE_SUPPORT'> = {
                'COMMUNITY_AID': 'COMMUNITY_AID',
                'CONFERENCE_SUPPORT': 'CONFERENCE_SUPPORT',
                'PLATFORM_UPKEEP': 'PLATFORM_UPKEEP',
            };
            const mappedPurpose = purposeMap[(record.purpose || '').toUpperCase()] || 'COMMUNITY_AID';

            await prisma.offering.create({
                data: {
                    userId: record.userId,
                    amount: parseFloat(record.amount) || 0,
                    currency: record.currency || 'USD',
                    purpose: mappedPurpose,
                    paymentMethod: record.provider,
                    transactionId: record.transactionId || `txn_${Date.now()}`,
                    isRecurring: record.isRecurring || false,
                    status: record.status || 'PENDING',
                    metadata: {
                        chain: record.chain,
                        originalPurpose: record.purpose,
                    },
                },
            });


            // ── Send receipt email ────────────────────────────────────────────
            if (record.email && process.env.RESEND_API_KEY) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const receiptNumber = `RCP-${record.transactionId}-${Date.now()}`;
                const ein = process.env.ORGANIZATION_EIN || 'EIN pending';

                await resend.emails.send({
                    from: process.env.EMAIL_FROM || 'giving@digitalchurchos.com',
                    to: record.email,
                    subject: `Your offering receipt — ${record.purpose || 'Digital Church OS'}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#fafaf8">
                            <div style="text-align:center;margin-bottom:32px">
                                <h1 style="font-size:24px;color:#292524;font-weight:300;margin:0">Thank you for your generosity 🙏</h1>
                                <p style="color:#78716c;margin-top:8px">${process.env.CHURCH_NAME || 'Digital Church OS'}</p>
                            </div>
                            <div style="background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:32px">
                                <table style="width:100%;border-collapse:collapse">
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Receipt #</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#292524;font-size:14px">${receiptNumber}</td></tr>
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Date</td><td style="padding:8px 0;text-align:right;font-size:14px">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:20px;color:#16a34a">$${parseFloat(record.amount).toFixed(2)} ${(record.currency || 'USD').toUpperCase()}</td></tr>
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Purpose</td><td style="padding:8px 0;text-align:right;font-size:14px">${record.purpose || 'General Fund'}</td></tr>
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Method</td><td style="padding:8px 0;text-align:right;font-size:14px;text-transform:capitalize">${record.provider}</td></tr>
                                    <tr><td style="padding:8px 0;color:#78716c;font-size:14px">Transaction ID</td><td style="padding:8px 0;text-align:right;font-size:11px;color:#a8a29e">${record.transactionId}</td></tr>
                                </table>
                            </div>
                            <div style="margin-top:24px;padding:20px;background:#fef9c3;border-radius:12px;font-size:12px;color:#713f12">
                                <strong>Tax Information:</strong> ${process.env.CHURCH_NAME || 'Digital Church OS'} is a 501(c)(3) nonprofit organization (EIN: ${ein}). No goods or services were provided in exchange for this contribution. This letter serves as your official tax receipt. Please retain for your records.
                            </div>
                            <p style="text-align:center;margin-top:32px;color:#a8a29e;font-size:12px">Questions? Contact us at ${process.env.CHURCH_EMAIL || 'support@digitalchurchos.com'}</p>
                        </div>
                    `,
                });
            }
        } catch (e) {
            // Non-fatal — don't let receipt failure break the payment
            console.error('[UnifiedGateway] recordTransaction error:', e);
        }

        return { id: record.transactionId, ...record };
    }
}

