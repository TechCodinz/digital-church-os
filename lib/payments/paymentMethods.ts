// lib/payments/paymentMethods.ts
export const paymentMethods: Record<string, any> = {
    // Traditional Methods
    credit_card: {
        name: 'Credit Card',
        provider: 'stripe',
        icon: '💳',
        processingTime: 'Instant',
        fee: '2.9% + $0.30',
        countries: 'Global',
    },

    debit_card: {
        name: 'Debit Card',
        provider: 'stripe',
        icon: '💳',
        processingTime: 'Instant',
        fee: '2.9% + $0.30',
        countries: 'Global',
    },

    ach: {
        name: 'Bank Transfer (ACH)',
        provider: 'stripe',
        icon: '🏦',
        processingTime: '3-5 days',
        fee: '0.8% ($5 max)',
        countries: 'US only',
    },

    paypal: {
        name: 'PayPal',
        provider: 'paypal',
        icon: '🅿️',
        processingTime: 'Instant',
        fee: '2.99% + $0.49',
        countries: 'Global',
    },

    // Major Cryptocurrencies
    bitcoin: {
        name: 'Bitcoin (BTC)',
        provider: 'bitpay',
        icon: '₿',
        processingTime: '10-60 minutes',
        fee: '1%',
        volatilityRisk: 'High',
        taxTreatment: 'Capital gains [citation:1]',
        averageGift: '$5,000+',
    },

    ethereum: {
        name: 'Ethereum (ETH)',
        provider: 'coinbase',
        icon: 'Ξ',
        processingTime: '2-5 minutes',
        fee: '1%',
        volatilityRisk: 'High',
        taxTreatment: 'Capital gains [citation:1]',
        smartContracts: true,
    },

    // Stablecoins
    usdc_ethereum: {
        name: 'USDC (Ethereum)',
        provider: 'stripe',
        icon: '💵',
        processingTime: '<5 minutes [citation:7]',
        fee: '1-2% [citation:7]',
        volatilityRisk: 'None (stablecoin)',
        supportsRecurring: true, // [citation:7]
        networks: ['ethereum', 'base', 'polygon', 'solana'], // [citation:7]
    },

    usdc_polygon: {
        name: 'USDC (Polygon)',
        provider: 'boomfi',
        icon: '💵',
        processingTime: 'Instant',
        fee: '1-2%',
        volatilityRisk: 'None',
        gasFees: 'Very low',
    },

    usdc_solana: {
        name: 'USDC (Solana)',
        provider: 'transfi',
        icon: '💵',
        processingTime: '<1 second',
        fee: '0.5-1% [citation:6]',
        volatilityRisk: 'None',
        gasFees: '<$0.01',
    },

    usdt_tron: {
        name: 'USDT (Tron)',
        provider: 'boomfi',
        icon: '💵',
        processingTime: 'Instant',
        fee: '1-2%',
        volatilityRisk: 'None',
        gasFees: 'Very low',
    },

    // Multi-chain support
    polygon_eth: {
        name: 'ETH (Polygon)',
        provider: 'boomfi',
        icon: 'Ξ',
        processingTime: 'Instant',
        fee: '1-2%',
        volatilityRisk: 'High',
        gasFees: 'Very low',
    },

    arbitrum_eth: {
        name: 'ETH (Arbitrum)',
        provider: 'crossmint',
        icon: 'Ξ',
        processingTime: 'Instant',
        fee: '<2% [citation:9]',
        volatilityRisk: 'High',
        layer2: true,
    },

    base_eth: {
        name: 'ETH (Base)',
        provider: 'crossmint',
        icon: 'Ξ',
        processingTime: 'Instant',
        fee: '<2%',
        volatilityRisk: 'High',
        coinbaseL2: true,
    },

    // Other major coins
    litecoin: {
        name: 'Litecoin (LTC)',
        provider: 'bitpay',
        icon: 'Ł',
        processingTime: '30 minutes',
        fee: '1%',
        volatilityRisk: 'Medium',
    },

    dogecoin: {
        name: 'Dogecoin (DOGE)',
        provider: 'bitpay',
        icon: '🐕',
        processingTime: '30 minutes',
        fee: '1%',
        volatilityRisk: 'High',
        community: 'Strong',
    },

    // Card-to-crypto (no KYC) [citation:9]
    card_to_bitcoin: {
        name: 'Card → Bitcoin',
        provider: 'crossmint',
        icon: '💳→₿',
        processingTime: '<5 minutes [citation:9]',
        fee: '<2% [citation:9]',
        kycRequired: 'None [citation:9]',
        countries: '197 [citation:9]',
        approvalRate: '95-98% [citation:9]',
    },

    card_to_ethereum: {
        name: 'Card → Ethereum',
        provider: 'crossmint',
        icon: '💳→Ξ',
        processingTime: '<5 minutes',
        fee: '<2%',
        kycRequired: 'None',
        countries: '197',
    },

    // Large crypto donations
    crypto_high_value: {
        name: 'Crypto (High Value)',
        provider: 'engiven',
        icon: '💎',
        processingTime: 'Instant',
        fee: '4% [citation:2]',
        averageGift: '$30,000 [citation:2]',
        taxReceipt: 'Instant IRS-compliant [citation:2]',
        cryptosSupported: 95, // [citation:2]
    },

    // Non-custodial [citation:8]
    ethereum_non_custodial: {
        name: 'ETH (Non-custodial)',
        provider: 'digidov',
        icon: '🔒Ξ',
        processingTime: 'Instant',
        fee: '3% [citation:8]',
        nonCustodial: true, // Funds go directly to your wallet [citation:8]
        taxReceipt: 'Instant IRS-compliant [citation:8]',
    },

    // Exchange partnerships
    crypto_com: {
        name: 'Crypto.com Pay',
        provider: 'crypto_com',
        icon: '🔄',
        processingTime: 'Instant',
        fee: 'As low as 1% [citation:1]',
        cryptosSupported: 400, // [citation:1]
        countries: 'Global (expanding) [citation:1]',
    },
};
