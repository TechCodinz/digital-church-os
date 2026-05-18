'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    DollarSign,
    User,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Search,
    Filter
} from 'lucide-react';

export default function AdminAidRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/aid/requests?status=${filter === 'ALL' ? '' : filter}`);
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/aid/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    status,
                    notes: reviewNotes,
                    allocationAmount: status === 'APPROVED' ? allocationAmount : 0
                })
            });

            if (res.ok) {
                setReviewNotes('');
                setAllocationAmount('');
                setExpandedRequest(null);
                fetchRequests();
            } else {
                alert('Failed to update request');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'REJECTED': return <XCircle className="text-rose-500" size={18} />;
            case 'PENDING': return <Clock className="text-amber-500" size={18} />;
            default: return <AlertCircle className="text-stone-400" size={18} />;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-light text-stone-800 tracking-tight">Aid Management</h1>
                        <p className="text-stone-500 mt-1 italic group-hover:text-sage-600 transition-colors">
                            "Administering grace through community resources."
                        </p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100">
                        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === status
                                        ? 'bg-stone-800 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 italic text-stone-400">
                            Loading requests...
                        </div>
                    ) : (
                        requests.map((request) => (
                            <motion.div
                                key={request.id}
                                layout
                                className="sanctuary-card border border-stone-100 hover:shadow-xl transition-shadow overflow-hidden p-0"
                            >
                                <div
                                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-cream-50 rounded-2xl flex items-center justify-center text-stone-400 border border-stone-100">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-stone-800">{request.user?.name}</h3>
                                            <p className="text-xs text-stone-400 flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 md:gap-12">
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Category</p>
                                            <span className="px-3 py-1 bg-sage-50 text-sage-700 text-[10px] font-bold rounded-lg uppercase">
                                                {request.category}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Requested</p>
                                            <p className="font-bold text-stone-800">${request.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center min-w-[100px]">
                                            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center justify-center space-x-2">
                                                {getStatusIcon(request.status)}
                                                <span className="text-xs font-bold text-stone-600">{request.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-stone-300">
                                            {expandedRequest === request.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedRequest === request.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-cream-100 bg-cream-50/50 p-8"
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                                                        <MessageSquare size={16} className="mr-2" /> Description of Need
                                                    </h4>
                                                    <p className="text-stone-700 leading-relaxed italic bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                                        "{request.description}"
                                                    </p>

                                                    {request.status !== 'PENDING' && request.reviews?.[0] && (
                                                        <div className="mt-8">
                                                            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Review Decision</h4>
                                                            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                                                <p className="text-stone-600 italic">"{request.reviews[0].comments || 'No comments'}"</p>
                                                                <p className="text-xs text-stone-400 mt-4 flex items-center">
                                                                    <User size={12} className="mr-1" />
                                                                    Reviewer: {request.reviews[0].reviewer?.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {request.status === 'PENDING' && (
                                                    <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-lg">
                                                        <h4 className="text-lg font-medium text-stone-800 mb-6">Review & Take Action</h4>

                                                        <div className="space-y-6">
                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Review Notes</label>
                                                                <textarea
                                                                    rows={3}
                                                                    className="w-full bg-cream-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200 transition-all resize-none"
                                                                    placeholder="Enter justification for decision..."
                                                                    value={reviewNotes}
                                                                    onChange={(e) => setReviewNotes(e.target.value)}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Approved Amount ($)</label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-cream-50 border-none rounded-2xl pl-10 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-xl text-stone-800"
                                                                        placeholder={request.amount.toString()}
                                                                        value={allocationAmount}
                                                                        onChange={(e) => setAllocationAmount(e.target.value)}
                                                                    />
                                                                </div>
                                                                <p className="text-[10px] text-stone-400 mt-2 italic px-2">Leave blank to approve full amount: ${request.amount.toLocaleString()}</p>
                                                            </div>

                                                            <div className="flex gap-4 pt-4">
                                                                <button
                                                                    onClick={() => handleReview(request.id, 'APPROVED')}
                                                                    disabled={submitting}
                                                                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReview(request.id, 'REJECTED')}
                                                                    disabled={submitting}
                                                                    className="flex-1 bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}

                    {!loading && requests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
                            <CheckCircle className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                            <p className="text-stone-500 font-medium">No {filter.toLowerCase()} requests found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
