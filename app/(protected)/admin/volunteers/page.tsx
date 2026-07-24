'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, HeartHandshake, CheckCircle2, Sparkles, UserCheck, Calendar, ShieldCheck } from 'lucide-react';

interface Volunteer {
    name: string;
    gifts: string[];
    matchScore: number;
    assignedRole: string;
    status: 'assigned' | 'available';
}

export default function VolunteerSmartRosterPage() {
    const [selectedRole, setSelectedRole] = useState('All');
    const [volunteers, setVolunteers] = useState<Volunteer[]>([
        { name: 'David Miller', gifts: ['Tech & Audio', 'Live Stream'], matchScore: 98, assignedRole: 'Live Stream Sound Tech', status: 'assigned' },
        { name: 'Sarah Jenkins', gifts: ['Worship', 'Vocal Lead'], matchScore: 95, assignedRole: 'Sunday Worship Team (Alto)', status: 'assigned' },
        { name: 'Rachel Adams', gifts: ['Children Ministry', 'Hospitality'], matchScore: 92, assignedRole: 'Sunday School Teacher', status: 'available' },
        { name: 'Michael Vance', gifts: ['Intercessory Prayer', 'Crisis Aid'], matchScore: 89, assignedRole: 'Emergency Dispatch Team', status: 'available' },
    ]);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Smart Volunteer & Gift-Matching Engine</h1>
                    <p className="text-slate-400 text-sm">AI skill-matching engine pairing church members' spiritual gifts with ministry rosters</p>
                </div>

                {/* Roster Grid */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" /> Active Volunteer Roster
                        </h3>
                        <span className="text-xs font-mono text-indigo-400 font-bold">4 Members Matched</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {volunteers.map(vol => (
                            <motion.div
                                key={vol.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all space-y-3 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                                        <UserCheck className="w-4 h-4 text-indigo-400" /> {vol.name}
                                    </div>
                                    <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-bold">
                                        {vol.matchScore}% Gift Match
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Ministry Role</span>
                                    <p className="text-xs text-indigo-300 font-semibold">{vol.assignedRole}</p>
                                </div>

                                <div className="flex flex-wrap gap-1 pt-1">
                                    {vol.gifts.map(g => (
                                        <span key={g} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded">
                                            🎁 {g}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
