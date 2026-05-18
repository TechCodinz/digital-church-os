'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Gift, Copy, Check, Users2, Trophy, ArrowRight } from 'lucide-react';
import { ShareButtons } from '../engagement/ShareButtons';

export const ReferralDashboard = ({ user }: { user: any }) => {
    const [referralData, setReferralData] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferral = async () => {
            try {
                const res = await fetch('/api/referrals', { method: 'POST' });
                const data = await res.json();
                setReferralData(data);
            } catch (error) {
                console.error('Failed to fetch referral:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferral();
    }, []);

    const copyLink = () => {
        if (!referralData?.link) return;
        navigator.clipboard.writeText(referralData.link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative overflow-hidden rounded-[40px] bg-white border border-stone-100 p-10 shadow-xl">
                {/* Decorative background circle */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-sage-50 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                        <div>
                            <h2 className="text-4xl font-light text-stone-800 mb-2">Grow the Body</h2>
                            <p className="text-stone-400 text-lg">Invite your community and unlock spiritual rewards.</p>
                        </div>
                        <div className="flex gap-4">
                            <StatCard icon={Users2} value="12" label="Invited" />
                            <StatCard icon={Star} value="450" label="Points" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Your Referral Link</p>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white border border-stone-100 rounded-2xl px-6 py-4 text-stone-600 font-medium truncate">
                                        {referralData?.link || 'https://digitalchurch.os/join?ref=...'}
                                    </div>
                                    <button
                                        onClick={copyLink}
                                        className="p-4 bg-stone-800 text-white rounded-2xl hover:bg-stone-900 transition-all active:scale-95"
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <p className="text-sm font-medium text-stone-500 text-center">Or share directly to:</p>
                                <ShareButtons
                                    url={referralData?.link}
                                    text={referralData?.shareText}
                                    className="justify-center"
                                />
                            </div>
                        </div>

                        <div className="bg-sage-50 rounded-[32px] p-8 border border-sage-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Gift className="text-sage-600" size={24} />
                                <h3 className="font-bold text-stone-800 tracking-tight">Active Rewards</h3>
                            </div>
                            <ul className="space-y-4">
                                <RewardItem
                                    title="For You"
                                    desc={referralData?.benefits?.referrer}
                                />
                                <RewardItem
                                    title="For Them"
                                    desc={referralData?.benefits?.referee}
                                />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Milestone Card */}
            <div className="rounded-[32px] bg-stone-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-light">Next Milestone: Spiritual Mentor</h4>
                        <p className="text-stone-400 text-sm">3 more referrals until you unlock Admin Analytics</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[70%] h-full bg-sage-500" />
                    </div>
                    <span className="text-sm font-bold text-sage-500">7/10</span>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, value, label }: any) => (
    <div className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl text-center min-w-[120px]">
        <div className="flex items-center justify-center gap-2 mb-1">
            <Icon size={16} className="text-sage-500" />
            <span className="text-xl font-light text-stone-800 tracking-tight">{value}</span>
        </div>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</p>
    </div>
);

const RewardItem = ({ title, desc }: any) => (
    <li className="flex gap-4 items-start">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sage-600 flex-shrink-0 mt-0.5">
            <Check size={12} strokeWidth={3} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-sage-800 uppercase tracking-widest leading-none mb-1">{title}</p>
            <p className="text-sm text-stone-600 font-medium leading-tight">{desc}</p>
        </div>
    </li>
);
