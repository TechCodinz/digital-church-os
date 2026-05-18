'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Volume2, Eye, Moon, Globe, Save, CheckCircle, Loader2, Palette, Church, Heart, ChevronRight, Mic } from 'lucide-react';
import { useSession } from 'next-auth/react';

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-sage-500' : 'bg-stone-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
    );
}

const SECTIONS = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'faith', label: 'Faith Journey', icon: Heart },
    { id: 'display', label: 'Display & Theme', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Eye },
];

export default function UserSettingsPage() {
    const { data: session } = useSession();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [prefs, setPrefs] = useState({
        // Profile
        displayName: '',
        bio: '',
        location: '',
        churchMembership: '',

        // Notifications
        notifyPrayerAnswered: true,
        notifyNewSermon: true,
        notifyLiveService: true,
        notifyCommentsOnPrayer: true,
        notifyWeeklyDigest: false,
        notifyAIResponses: true,
        pushNotifications: false,

        // Voice & Audio
        preferredVoiceProvider: 'auto', // auto | elevenlabs | openai | browser
        sermonVoiceEmotion: 'compassionate',
        prayerVoiceEmotion: 'tender',
        autoPlayVoice: false,
        voiceSpeed: 1.0,

        // Faith Journey
        spiritualJourneyType: 'believer', // seeker | believer | leader
        denomination: '',
        favoriteScripture: '',
        prayerFocusAreas: [] as string[],
        dailyDevotionTime: '07:00',

        // Display
        theme: 'light', // light | dark | auto
        fontSize: 'medium', // small | medium | large
        reducedMotion: false,
        highContrast: false,

        // Privacy
        prayerWallVisibility: 'private', // public | anonymous | private
        profileVisible: true,
        shareActivityWithCommunity: false,
        allowPrayerFromStrangers: true,
    });

    useEffect(() => {
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(data => {
                if (data) {
                    setPrefs(p => ({
                        ...p,
                        displayName: data.name || p.displayName,
                        ...(data.notificationPreferences || {}),
                    }));
                }
            }).catch(() => { });
    }, []);

    const set = (key: string, value: any) => setPrefs(p => ({ ...p, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: prefs.displayName,
                    notificationPreferences: prefs,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { } finally { setSaving(false); }
    };

    const PRAYER_FOCUS = ['Healing', 'Family', 'Financial', 'Work/Career', 'Relationships', 'Mental Health', 'Spiritual Growth', 'World Peace', 'Missions', 'Revival'];

    const renderSection = () => {
        switch (activeSection) {
            case 'profile': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Display Name</label>
                        <input type="text" value={prefs.displayName} onChange={e => set('displayName', e.target.value)} placeholder={session?.user?.name || 'Your name'} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Bio (optional)</label>
                        <textarea value={prefs.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="A follower of Christ, passionate about community..." className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Location</label>
                            <input type="text" value={prefs.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Home Church</label>
                            <input type="text" value={prefs.churchMembership} onChange={e => set('churchMembership', e.target.value)} placeholder="Grace Community Church" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none" />
                        </div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl text-sm text-stone-500">
                        <strong className="text-stone-700">Account:</strong> {session?.user?.email} · <span className="text-sage-600">Member</span>
                    </div>
                </div>
            );

            case 'notifications': return (
                <div className="space-y-3">
                    {[
                        { key: 'notifyLiveService', label: 'Live Service Starting', desc: 'Get notified when Sunday service goes live' },
                        { key: 'notifyNewSermon', label: 'New Sermon Available', desc: 'Fresh sermon or Bible study posted' },
                        { key: 'notifyPrayerAnswered', label: 'Prayer Answered', desc: 'When someone marks your prayer as answered' },
                        { key: 'notifyCommentsOnPrayer', label: 'Prayer Wall Activity', desc: "Others praying for you" },
                        { key: 'notifyAIResponses', label: 'AI Module Responses', desc: 'When Pastor AI or Prayer Warrior responds' },
                        { key: 'notifyWeeklyDigest', label: 'Weekly Faith Digest', desc: 'Sunday morning highlights & activity recap' },
                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications (requires permission)' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-stone-700">{label}</p>
                                <p className="text-xs text-stone-400">{desc}</p>
                            </div>
                            <Toggle enabled={(prefs as any)[key]} onToggle={() => set(key, !(prefs as any)[key])} />
                        </div>
                    ))}
                </div>
            );

            case 'voice': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Voice Provider</label>
                        <select value={prefs.preferredVoiceProvider} onChange={e => set('preferredVoiceProvider', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                            <option value="auto">🔄 Auto (Best Available)</option>
                            <option value="elevenlabs">⚡ ElevenLabs (Ultra-realistic)</option>
                            <option value="openai">🤖 OpenAI TTS-HD</option>
                            <option value="browser">🌐 Device Voice (Free)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Sermon Voice Emotion</label>
                            <select value={prefs.sermonVoiceEmotion} onChange={e => set('sermonVoiceEmotion', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                                {['compassionate', 'triumphant', 'urgent', 'somber', 'celebratory', 'tender'].map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Prayer Voice Emotion</label>
                            <select value={prefs.prayerVoiceEmotion} onChange={e => set('prayerVoiceEmotion', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                                {['tender', 'compassionate', 'somber', 'hopeful', 'peaceful'].map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Voice Speed: {prefs.voiceSpeed}×</label>
                        <input type="range" min={0.5} max={1.5} step={0.1} value={prefs.voiceSpeed} onChange={e => set('voiceSpeed', parseFloat(e.target.value))} className="w-full accent-sage-500" />
                        <div className="flex justify-between text-xs text-stone-400 mt-1"><span>0.5× Slow</span><span>1.0× Normal</span><span>1.5× Fast</span></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Auto-play Voice after AI response</p>
                            <p className="text-xs text-stone-400">Automatically start voice when Pastor AI or Prayer Warrior responds</p>
                        </div>
                        <Toggle enabled={prefs.autoPlayVoice} onToggle={() => set('autoPlayVoice', !prefs.autoPlayVoice)} />
                    </div>
                </div>
            );

            case 'faith': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">My Faith Journey</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[['seeker', '🔍 Seeker'], ['believer', '✝️ Believer'], ['leader', '👑 Leader/Minister']].map(([val, label]) => (
                                <button key={val} onClick={() => set('spiritualJourneyType', val)} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${prefs.spiritualJourneyType === val ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-stone-200 text-stone-600 hover:border-sage-300'}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Denomination</label>
                            <select value={prefs.denomination} onChange={e => set('denomination', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                                <option value="">Prefer not to say</option>
                                {['Baptist', 'Catholic', 'Pentecostal', 'Anglican', 'Methodist', 'Presbyterian', 'Non-denominational', 'Orthodox', 'Evangelical', 'Adventist', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Daily Devotion Time</label>
                            <input type="time" value={prefs.dailyDevotionTime} onChange={e => set('dailyDevotionTime', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Favourite Scripture</label>
                        <input type="text" value={prefs.favoriteScripture} onChange={e => set('favoriteScripture', e.target.value)} placeholder="John 3:16" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Prayer Focus Areas</label>
                        <div className="flex flex-wrap gap-2">
                            {PRAYER_FOCUS.map(area => (
                                <button key={area} onClick={() => set('prayerFocusAreas', prefs.prayerFocusAreas.includes(area) ? prefs.prayerFocusAreas.filter(a => a !== area) : [...prefs.prayerFocusAreas, area])} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${prefs.prayerFocusAreas.includes(area) ? 'bg-sage-600 text-white border-sage-600' : 'bg-white text-stone-600 border-stone-200 hover:border-sage-400'}`}>{area}</button>
                            ))}
                        </div>
                    </div>
                </div>
            );

            case 'display': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[['light', '☀️ Light'], ['dark', '🌙 Dark'], ['auto', '🔄 System']].map(([val, label]) => (
                                <button key={val} onClick={() => set('theme', val)} className={`p-3 rounded-xl border-2 text-sm font-medium ${prefs.theme === val ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-stone-200 text-stone-600'}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Font Size</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']].map(([val, label]) => (
                                <button key={val} onClick={() => set('fontSize', val)} className={`p-3 rounded-xl border-2 text-sm font-medium ${prefs.fontSize === val ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-stone-200 text-stone-600'}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div><p className="text-sm font-medium text-stone-700">Reduce Motion</p><p className="text-xs text-stone-400">Minimize animations across the app</p></div>
                        <Toggle enabled={prefs.reducedMotion} onToggle={() => set('reducedMotion', !prefs.reducedMotion)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div><p className="text-sm font-medium text-stone-700">High Contrast</p><p className="text-xs text-stone-400">Increase text and UI contrast</p></div>
                        <Toggle enabled={prefs.highContrast} onToggle={() => set('highContrast', !prefs.highContrast)} />
                    </div>
                </div>
            );

            case 'privacy': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Prayer Wall Visibility (default)</label>
                        <select value={prefs.prayerWallVisibility} onChange={e => set('prayerWallVisibility', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                            <option value="public">Public — Anyone can see my prayers</option>
                            <option value="anonymous">Anonymous — Show prayer without my name</option>
                            <option value="private">Private — Only pastors / admins can see</option>
                        </select>
                    </div>
                    {[
                        { key: 'profileVisible', label: 'Show my profile to community', desc: 'Other members can see your name on the prayer wall and community posts' },
                        { key: 'shareActivityWithCommunity', label: 'Share faith activity', desc: 'Celebrate milestones (answered prayers, goals) with the community' },
                        { key: 'allowPrayerFromStrangers', label: 'Accept prayer from anyone', desc: 'Allow all members to pray for your requests' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                            <div><p className="text-sm font-medium text-stone-700">{label}</p><p className="text-xs text-stone-400">{desc}</p></div>
                            <Toggle enabled={(prefs as any)[key]} onToggle={() => set(key, !(prefs as any)[key])} />
                        </div>
                    ))}
                </div>
            );
            default: return null;
        }
    };

    const activeInfo = SECTIONS.find(s => s.id === activeSection);

    return (
        <div className="min-h-screen bg-stone-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-stone-800 flex items-center gap-3">
                            <User className="text-sage-500" size={28} /> My Settings
                        </h1>
                        <p className="text-stone-500 mt-1">Personalise your Digital Church OS experience</p>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-2xl hover:bg-sage-700 font-semibold disabled:opacity-60 shadow-md transition-all">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                            {SECTIONS.map(section => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-stone-50 last:border-0 transition-all ${isActive ? 'bg-sage-50 text-sage-700' : 'text-stone-600 hover:bg-stone-50'}`}>
                                        <Icon size={17} className={isActive ? 'text-sage-500' : 'text-stone-400'} />
                                        <span className="text-sm font-medium">{section.label}</span>
                                        {isActive && <ChevronRight size={14} className="ml-auto text-sage-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
                            <div className="px-6 py-5 border-b border-stone-100">
                                <h2 className="text-lg font-semibold text-stone-800">{activeInfo?.label}</h2>
                            </div>
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeSection} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                                        {renderSection()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
