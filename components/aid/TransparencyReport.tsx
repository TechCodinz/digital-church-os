"use client";

import { useEffect, useState } from "react";

interface TransparencyData {
    period: string;
    totalOfferings: number;
    totalAidDistributed: number;
    categories: Record<string, number>;
    approvedRequests: number;
    pendingRequests: number;
    publishedAt: string;
}

export function TransparencyReport() {
    const [data, setData] = useState<TransparencyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch("/api/aid/transparency/report");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch transparency report:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, []);

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-stone-500">Loading transparency data...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-stone-500">Transparency data currently unavailable.</div>;
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50">
                <h2 className="text-xl font-bold text-stone-800">Community Aid Transparency</h2>
                <p className="text-sm text-stone-500 mt-1">
                    Report Period: {data.period} | Last Updated: {new Date(data.publishedAt).toLocaleDateString()}
                </p>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-sage-50 p-4 rounded-lg border border-sage-100">
                        <p className="text-sm font-medium text-sage-800 mb-1">Total Offerings (Aid Fund)</p>
                        <p className="text-2xl font-bold text-sage-900">{formatCurrency(data.totalOfferings)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-1">Total Aid Distributed</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.totalAidDistributed)}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-stone-600 mb-1">Families Helped</p>
                            <p className="text-2xl font-bold text-stone-800">{data.approvedRequests}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-stone-500 mb-1">Pending Needs</p>
                            <p className="text-lg font-semibold text-stone-600">{data.pendingRequests}</p>
                        </div>
                    </div>
                </div>

                <h3 className="font-semibold text-stone-800 mb-4 px-1">Distribution by Category</h3>
                <div className="space-y-4 px-1">
                    {Object.entries(data.categories).length > 0 ? (
                        Object.entries(data.categories).map(([category, amount]) => {
                            const percentage = data.totalAidDistributed > 0
                                ? Math.round((amount / data.totalAidDistributed) * 100)
                                : 0;

                            return (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-stone-700 capitalize">{category.toLowerCase()}</span>
                                        <span className="text-stone-600">{formatCurrency(amount)} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-stone-100 rounded-full h-2.5">
                                        <div
                                            className="bg-sage-500 h-2.5 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-stone-500">No category breakdown available for this period.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
