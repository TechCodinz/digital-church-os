'use client';

import { useState } from 'react';
import { paymentMethods } from '@/lib/payments/paymentMethods';

export const UnifiedPaymentForm = ({ purpose: externalPurpose, amount: externalAmount, setAmount: externalSetAmount, onSuccess }: any) => {
    const [internalAmount, setInternalAmount] = useState('50');
    const [internalPurpose, setInternalPurpose] = useState('COMMUNITY_AID');

    const amount = externalAmount !== undefined ? externalAmount : internalAmount;
    const setAmount = externalSetAmount || setInternalAmount;
    const purpose = externalPurpose || internalPurpose;

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [cryptoNetwork, setCryptoNetwork] = useState('ethereum');

    const paymentCategories = {
        traditional: {
            name: 'Traditional Payments',
            methods: ['credit_card', 'debit_card', 'ach', 'paypal'],
            badge: 'Familiar',
        },
        stablecoins: {
            name: 'Stablecoins (No Volatility)',
            methods: ['usdc_ethereum', 'usdc_polygon', 'usdc_solana', 'usdt_tron'],
            badge: 'Best for regular giving',
        },
        majorCrypto: {
            name: 'Major Cryptocurrencies',
            methods: ['bitcoin', 'ethereum', 'litecoin', 'dogecoin'],
            badge: 'Potential tax advantages',
        },
        multiChain: {
            name: 'Multi-chain Support',
            methods: ['polygon_eth', 'arbitrum_eth', 'base_eth'],
            badge: 'Lower fees',
        },
        cardToCrypto: {
            name: 'Card → Crypto (No KYC)',
            methods: ['card_to_bitcoin', 'card_to_ethereum'],
            badge: 'Pay with card, receive crypto',
        },
        highValue: {
            name: 'High-Value Gifts',
            methods: ['crypto_high_value'],
            badge: 'Avg. $30,000 gift',
        },
        nonCustodial: {
            name: 'Non-Custodial',
            methods: ['ethereum_non_custodial'],
            badge: 'We never touch your funds',
        },
    };

    const processPayment = async (method: string, amt: string, purp: string) => {
        onSuccess?.({ method, amount: amt, purpose: purp });
    }

    return (
        <div className="unified-payment-form bg-white p-6 rounded-2xl">
            {/* Amount Input */}
            <div className="mb-6">
                <label className="block text-stone-700 mb-2">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                />
            </div>

            {/* Payment Method Categories */}
            <div className="space-y-6">
                {Object.entries(paymentCategories).map(([key, category]) => (
                    <div key={key} className="border border-cream-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-stone-800">{category.name}</h3>
                            {category.badge && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full whitespace-nowrap overflow-hidden text-ellipsis ml-2 max-w-[120px]">
                                    {category.badge}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {category.methods.map(methodId => {
                                const method = paymentMethods[methodId];
                                if (!method) return null;
                                return (
                                    <button
                                        key={methodId}
                                        onClick={() => setSelectedMethod(methodId)}
                                        className={`p-3 rounded-xl border-2 transition-all text-left ${selectedMethod === methodId
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-cream-200 hover:border-emerald-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{method.icon}</div>
                                        <div className="font-medium text-sm">{method.name}</div>
                                        <div className="text-xs text-stone-500 mt-1">
                                            Fee: {method.fee}
                                        </div>
                                        {method.volatilityRisk === 'None' && (
                                            <div className="text-xs text-emerald-600 mt-1">
                                                ✅ Stable
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Network Selection for Multi-chain */}
            {selectedMethod?.includes('usdc') && (
                <div className="mt-6 p-4 bg-cream-50 rounded-xl">
                    <label className="block text-stone-700 mb-2">Select Network</label>
                    <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200"
                    >
                        <option value="ethereum">Ethereum (Higher fees)</option>
                        <option value="polygon">Polygon (Low fees)</option>
                        <option value="solana">Solana (Ultra-low fees)</option>
                        <option value="base">Base (Coinbase L2)</option>
                        <option value="arbitrum">Arbitrum (Low fees)</option>
                    </select>
                    <p className="text-xs text-stone-500 mt-2">
                        All networks settle in USD automatically. Your gift goes further on networks with lower fees.
                    </p>
                </div>
            )}

            {/* Tax Information */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl text-sm">
                <h4 className="font-medium text-amber-800 mb-2">📋 Important Tax Information</h4>
                <ul className="space-y-1 text-amber-700">
                    <li>• Credit/debit card gifts: Tax-deductible as cash donations</li>
                    <li>• Cryptocurrency: Considered property by IRS</li>
                    <li>• Donating appreciated crypto: Avoid capital gains tax</li>
                    <li>• Instant tax receipts for all methods</li>
                    <li>• Consult your tax advisor for specific advice</li>
                </ul>
            </div>

            {/* Submit Button */}
            <button
                onClick={() => processPayment(selectedMethod!, amount, purpose)}
                disabled={!selectedMethod || !amount}
                className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-lg font-medium"
            >
                Give ${amount} via {selectedMethod ? paymentMethods[selectedMethod]?.name : 'selected method'}
            </button>

            {/* Provider Logos */}
            <div className="mt-8 text-center">
                <p className="text-sm text-stone-500 mb-3">Trusted payment partners</p>
                <div className="flex justify-center space-x-4 opacity-70">
                    <div className="h-6 flex items-center text-xs font-semibold uppercase">Stripe</div>
                    <div className="h-6 flex items-center text-xs font-semibold uppercase">PayPal</div>
                    <div className="h-6 flex items-center text-xs font-semibold uppercase">Coinbase</div>
                    <div className="h-6 flex items-center text-xs font-semibold uppercase">BitPay</div>
                    <div className="h-6 flex items-center text-xs font-semibold uppercase">Crypto.com</div>
                </div>
            </div>
        </div>
    );
};
