// config/payments.ts
export const paymentConfig = {
    // Traditional processors
    stripe: {
        enabled: true,
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        supports: ['cards', 'ach', 'usdc', 'crypto.com'],
    },

    paypal: {
        enabled: true,
        clientId: process.env.PAYPAL_CLIENT_ID,
        secret: process.env.PAYPAL_SECRET,
    },

    // Crypto processors
    coinbaseCommerce: {
        enabled: true,
        apiKey: process.env.COINBASE_COMMERCE_KEY,
        webhookSecret: process.env.COINBASE_WEBHOOK_SECRET,
    },

    bitpay: {
        enabled: true,
        token: process.env.BITPAY_TOKEN,
        notificationEmail: process.env.BITPAY_EMAIL,
    },

    engiven: {
        enabled: true,
        apiKey: process.env.ENGIVEN_API_KEY,
        organizationId: process.env.ENGIVEN_ORG_ID,
        fee: '4%', // [citation:2]
        averageGift: '$30,000', // [citation:2]
    },

    boomfi: {
        enabled: true,
        apiKey: process.env.BOOMFI_API_KEY,
        chains: ['ethereum', 'polygon', 'solana', 'tron', 'arbitrum', 'bnb'], // [citation:3]
        supportsSubscriptions: true, // [citation:3]
    },

    transfi: {
        enabled: true,
        apiKey: process.env.TRANSFI_API_KEY,
        fee: '0.5-1%', // [citation:6]
        countries: 100, // [citation:6]
        assets: 130, // [citation:6]
    },

    crossmint: {
        enabled: true,
        clientId: process.env.CROSSMINT_CLIENT_ID,
        apiKey: process.env.CROSSMINT_API_KEY,
        countries: 197, // [citation:9]
        approvalRate: '95-98%', // [citation:9]
        noKYC: true, // [citation:9]
    },

    digidov: {
        enabled: true,
        apiKey: process.env.DIGIDOV_API_KEY,
        fee: '3%', // [citation:8]
        nonCustodial: true, // [citation:8]
        taxReceipts: 'instant-irs-compliant', // [citation:8]
    },

    cryptoCom: {
        enabled: true,
        viaStripe: true, // [citation:1]
        cryptosSupported: 400, // [citation:1]
    },
};
