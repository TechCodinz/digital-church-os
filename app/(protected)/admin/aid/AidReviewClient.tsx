"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function AidReviewClient({ request, availableFunds }: { request: any, availableFunds: number }) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [allocationAmount, setAllocationAmount] = useState(request.amount.toString());
    const [notes, setNotes] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleReview = async (action: "APPROVED" | "REJECTED") => {
        setStatus("submitting");
        setErrorMessage("");

        try {
            if (action === "APPROVED" && Number(allocationAmount) > availableFunds) {
                throw new Error("Allocation amount exceeds available community funds.");
            }

            const res = await fetch("/api/admin/aid/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: request.id,
                    status: action,
                    allocationAmount: action === "APPROVED" ? Number(allocationAmount) : 0,
                    notes,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to process review.");
            }

            setStatus("success");
            // Optional: Trigger a router.refresh() if needed to update the parent list
            window.location.reload();
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "An error occurred.");
        }
    };

    return (
        <div className="p-6 transition hover:bg-stone-50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-stone-900">{request.user?.name || "Anonymous Requester"}</h3>
                        <span className="text-stone-500 text-sm">{request.user?.email}</span>
                        {request.urgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-stone-500">
                        Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-stone-500 uppercase tracking-wide font-medium">{request.category}</p>
                    <p className="text-xl font-bold text-stone-900">${request.amount.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white border text-sm text-stone-700 p-4 rounded-md mb-6 shadow-sm">
                <p className="whitespace-pre-wrap">{request.description}</p>
            </div>

            {status === "error" && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                    {errorMessage}
                </div>
            )}

            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <h4 className="text-sm font-medium text-stone-900 mb-3">Admin Review</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Approved Amount ($)</label>
                        <input
                            type="number"
                            value={allocationAmount}
                            onChange={(e) => setAllocationAmount(e.target.value)}
                            disabled={status === "submitting"}
                            className="w-full border-stone-300 rounded shadow-sm focus:border-sage-500 focus:ring-sage-500 sm:text-sm p-2 border"
                            max={availableFunds}
                        />
                        <p className="text-xs text-stone-500 mt-1">Defaults to original requested amount.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Internal Notes (Required for rejection)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={status === "submitting"}
                            placeholder="Reason for decision..."
                            className="w-full border-stone-300 rounded shadow-sm focus:border-sage-500 focus:ring-sage-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={() => handleReview("REJECTED")}
                        disabled={status === "submitting" || !notes.trim()}
                        className="px-4 py-2 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-50 text-sm font-medium disabled:opacity-50"
                    >
                        Reject Request
                    </button>
                    <button
                        onClick={() => handleReview("APPROVED")}
                        disabled={status === "submitting" || Number(allocationAmount) <= 0 || Number(allocationAmount) > availableFunds}
                        className="px-4 py-2 bg-sage-600 border border-transparent rounded text-white hover:bg-sage-700 text-sm font-medium disabled:opacity-50"
                    >
                        {status === "submitting" ? "Processing..." : "Approve & Allocate"}
                    </button>
                </div>
            </div>
        </div>
    );
}
