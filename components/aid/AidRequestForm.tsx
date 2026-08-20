"use client";

import { useState } from "react";

// Adjust paths as necessary based on existing dependencies

export function AidRequestForm() {
    const [formData, setFormData] = useState({
        category: "FOOD",
        amount: "",
        description: "",
        urgent: false,
    });

    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const categories = [
        { value: "FOOD", label: "Food Assistance" },
        { value: "HOUSING", label: "Housing / Rent" },
        { value: "MEDICAL", label: "Medical Bills" },
        { value: "EDUCATION", label: "Educational Support" },
        { value: "UTILITIES", label: "Utility Bills" },
        { value: "OTHER", label: "Other" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            setStatus("error");
            setErrorMessage("Please enter a valid amount.");
            return;
        }

        if (formData.description.trim().length < 20) {
            setStatus("error");
            setErrorMessage("Please describe your need in a little more detail (at least 20 characters).");
            return;
        }

        try {
            const label = categories.find((c) => c.value === formData.category)?.label || formData.category;
            const response = await fetch("/api/aid-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: formData.category,
                    title: `${label} request`,
                    description: formData.urgent
                        ? `[URGENT — response needed within 24-48h] ${formData.description}`
                        : formData.description,
                    amount: Number(formData.amount),
                    proofUrls: [],
                }),
            });

            if (response.status === 401) {
                throw new Error("Please sign in to submit an assistance request.");
            }
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to submit request.");
            }

            setStatus("success");
            setFormData({ category: "FOOD", amount: "", description: "", urgent: false });
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "An unexpected error occurred.");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center shadow-sm border border-green-100">
                <h3 className="text-xl font-semibold mb-2">Request Submitted</h3>
                <p className="mb-4">Your request for assistance has been received. Our team will review it shortly and reach out with updates.</p>
                <button
                    onClick={() => setStatus("idle")}
                    className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
                >
                    Submit Another Request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-stone-100 max-w-2xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Community Assistance Request</h2>
                <p className="text-stone-600">
                    We are here to help. Please provide details about your current need, and our community care team will review your request. All information is kept strictly confidential.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {status === "error" && (
                    <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-100">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-medium text-stone-700">Need Category</label>
                        <select
                            id="category"
                            className="w-full border-stone-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500 p-2 border"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="amount" className="block text-sm font-medium text-stone-700">Requested Amount ($)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-stone-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                min="1"
                                step="0.01"
                                className="w-full pl-7 border-stone-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500 p-2 border"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-stone-700">Description of Need</label>
                    <textarea
                        id="description"
                        rows={4}
                        className="w-full border-stone-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500 p-2 border"
                        placeholder="Please explain your situation and how these funds will help..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        aria-describedby="description-help"
                    ></textarea>
                    <p id="description-help" className="text-xs text-stone-500 mt-1">Please provide enough detail for our team to understand your situation.</p>
                </div>

                <div className="flex items-center">
                    <input
                        id="urgent"
                        type="checkbox"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-stone-300 rounded"
                        checked={formData.urgent}
                        onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    />
                    <label htmlFor="urgent" className="ml-2 block text-sm text-stone-700">
                        This is an urgent/emergency crisis requiring response within 24-48 hours.
                    </label>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="w-full md:w-auto bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 transition shadow-sm"
                    >
                        {status === "submitting" ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}
