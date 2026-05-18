"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShieldCheck, Heart, ArrowRight, Activity } from "lucide-react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

export function GivingForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [amount, setAmount] = useState<number>(50);
    const [purpose, setPurpose] = useState<'PLATFORM_UPKEEP' | 'COMMUNITY_AID' | 'CONFERENCE_SUPPORT'>('COMMUNITY_AID');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError(null);

        try {
            // 1. Create PaymentIntent on server
            const res = await fetch("/api/offerings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, purpose }),
            });

            if (!res.ok) throw new Error("Failed to initialize payment");

            const { clientSecret } = await res.json();

            // 2. Confirm payment on client
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        // Optional: Get user info from session if needed
                    },
                },
            });

            if (result.error) {
                setError(result.error.message || "Payment failed");
            } else {
                if (result.paymentIntent.status === "succeeded") {
                    alert("Thank you for your faithful offering! Your contribution has been recorded.");
                    window.location.reload();
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sanctuary-card border border-emerald-100 max-w-4xl mx-auto shadow-2xl relative"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-3xl font-light mb-6 text-stone-800">Support the Mission</h3>
                    <p className="text-stone-600 mb-8 leading-relaxed">
                        Your gifts enable us to maintain this digital sanctuary and provide aid to members in need across the globe.
                    </p>

                    <div className="space-y-4">
                        {[
                            { id: 'COMMUNITY_AID', label: 'Community Aid', desc: 'Direct support for medical, food, and housing needs.' },
                            { id: 'PLATFORM_UPKEEP', label: 'Platform Upkeep', desc: 'Covering server costs and technical maintenance.' },
                            { id: 'CONFERENCE_SUPPORT', label: 'Conference Fund', desc: 'Subsidizing attendance for those in need.' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPurpose(p.id as any)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${purpose === p.id
                                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                    : 'bg-white border-stone-100 hover:border-emerald-200'
                                    }`}
                            >
                                <p className={`font-medium ${purpose === p.id ? 'text-emerald-700' : 'text-stone-800'}`}>
                                    {p.label}
                                </p>
                                <p className="text-xs text-stone-500 mt-1">{p.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-emerald-800 mb-4 uppercase tracking-widest text-[10px]">Select Amount</label>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[25, 50, 100, 250, 500, 1000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(val)}
                                        className={`py-3 rounded-xl font-bold transition-all text-sm ${amount === val
                                            ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                            : 'bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                                            }`}
                                    >
                                        ${val}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-4 bg-white border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 outline-none text-2xl font-light text-stone-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-emerald-800 uppercase tracking-widest text-[10px]">Payment Details</label>
                            <div className="p-4 bg-white border-2 border-emerald-100 rounded-2xl">
                                <CardElement options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#1c1917',
                                            '::placeholder': { color: '#a8a29e' },
                                        },
                                    }
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {error && (
                            <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="flex items-center text-xs text-stone-500 space-x-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span>Secure encrypted transaction</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !stripe}
                            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center group disabled:opacity-50"
                        >
                            {submitting ? 'Processing...' : (
                                <>Contribute ${amount} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
