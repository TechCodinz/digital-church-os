'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, BookOpen, Flame, Heart, Layers, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface Tradition {
    id: string;
    name: string;
    focus: string;
    keyPractices: string[];
    sacredText: string;
    liturgyOverview: string;
    color: string;
}

const TRADITIONS: Tradition[] = [
    {
        id: 't-1',
        name: 'Evangelical & Expositional',
        focus: 'Biblical Inerrancy, Exegesis, & Great Commission Evangelism',
        keyPractices: ['Verse-by-Verse Preaching', 'Personal Witnessing', 'Discipleship Pathways'],
        sacredText: '2 Timothy 3:16 — "All Scripture is breathed out by God and profitable for teaching."',
        liturgyOverview: 'Focuses heavily on deep scripture exposition, gospel invitation, and systematic Bible study.',
        color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    },
    {
        id: 't-2',
        name: 'Pentecostal & Charismatic',
        focus: 'Holy Spirit Baptism, Gifts of the Spirit, & Fervent Prayer',
        keyPractices: ['Spiritual Warfare Intercession', 'Prophetic Worship', 'Divine Healing'],
        sacredText: 'Acts 1:8 — "You will receive power when the Holy Spirit comes upon you."',
        liturgyOverview: 'Dynamic, Spirit-led worship services with high praise, corporate praying, and spiritual gift activation.',
        color: 'border-rose-500/40 text-rose-400 bg-rose-500/10'
    },
    {
        id: 't-3',
        name: 'Reformed & Covenantal',
        focus: 'Sovereignty of God, Solas of the Reformation, & Catechism',
        keyPractices: ['Westminster Catechism', 'Covenantal Theology', 'Psalms & Hymns'],
        sacredText: 'Ephesians 2:8-9 — "By grace you have been saved through faith, and this is not from yourselves."',
        liturgyOverview: 'Reverent, orderly worship highlighting God’s transcendent majesty and gospel grace.',
        color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
    },
    {
        id: 't-4',
        name: 'Liturgical (Anglican / Catholic / Orthodox)',
        focus: 'Sacred Liturgy, Ancient Sacraments, & Church Fathers',
        keyPractices: ['Divine Liturgy / Mass', 'Eucharist Communion', 'Book of Common Prayer / Creeds'],
        sacredText: 'John 6:54 — "Whoever feeds on my flesh and drinks my blood has eternal life."',
        liturgyOverview: 'Rich historical worship with candle lighting, responsive readings, and sacramental reverence.',
        color: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    }
];

export default function SacredWorshipTraditionsPage() {
    const [selectedTradition, setSelectedTradition] = useState<Tradition>(TRADITIONS[0]);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-3">
                        <Globe className="w-4 h-4 animate-spin-slow" /> Interdenominational Sacred Worship
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Denominational Traditions & Unity</h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Explore the rich heritage, sacred liturgies, and spiritual practices of Christian traditions across the global Church.
                    </p>
                </div>

                {/* Tradition Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {TRADITIONS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTradition(t)}
                            className={`p-5 rounded-2xl border text-left transition-all ${
                                selectedTradition.id === t.id
                                    ? `${t.color} bg-slate-900 shadow-xl ring-1 ring-amber-500/30`
                                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <h3 className="font-bold text-sm text-white mb-1">{t.name}</h3>
                            <p className="text-xs opacity-75 line-clamp-2">{t.focus}</p>
                        </button>
                    ))}
                </div>

                {/* Detail View Stage */}
                {selectedTradition && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">Tradition Overview</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedTradition.name}</h2>
                            </div>
                            <span className="px-4 py-2 bg-slate-950 border border-slate-800 text-amber-300 rounded-2xl text-xs font-mono italic">
                                {selectedTradition.sacredText}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liturgy & Worship Philosophy</span>
                            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                {selectedTradition.liturgyOverview}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core Spiritual Practices</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {selectedTradition.keyPractices.map(p => (
                                    <div key={p} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" /> {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
