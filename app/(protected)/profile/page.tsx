'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Book, Heart, Target, Calendar, DollarSign,
  Lock, Globe, Clock, CheckCircle, X, Plus, Save, Loader2,
  BookOpen, Edit3, Trash2, ChevronRight
} from 'lucide-react';

// ── Modal: Profile Edit ────────────────────────────────────────────
function ProfileEditModal({ profile, onClose, onSave }: {
  profile: any; onClose: () => void; onSave: (data: any) => void;
}) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    faithPreference: profile?.faithPreference || 'Christian',
    bio: profile?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-2xl font-light text-stone-800 mb-6">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Display Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Faith Tradition</label>
            <select
              value={form.faithPreference}
              onChange={e => setForm(f => ({ ...f, faithPreference: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm bg-white"
            >
              {['Christian', 'Catholic', 'Protestant', 'Evangelical', 'Pentecostal', 'Baptist', 'Methodist', 'Orthodox'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Bio (optional)</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Share a little about your spiritual journey..."
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal: Create Goal ─────────────────────────────────────────────
function GoalCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (goal: any) => void; }) {
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const goal = await res.json();
        onCreated(goal);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-700"><X size={20} /></button>
        <h3 className="text-2xl font-light text-stone-800 mb-2">New Spiritual Goal</h3>
        <p className="text-stone-500 text-sm mb-6">Set a clear, faith-focused goal to grow in your spiritual walk.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Goal Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="E.g., Read the entire New Testament"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Why is this goal important to you?"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Target Date (optional)</label>
            <input
              type="date"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm bg-white"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !form.title.trim()} className="flex-1 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal: Journal Entry ───────────────────────────────────────────
function JournalCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (entry: any) => void; }) {
  const [form, setForm] = useState({ title: '', content: '', mood: 'Grateful' });
  const moods = ['Grateful', 'Peaceful', 'Hopeful', 'Challenged', 'Struggling', 'Joyful', 'Seeking', 'Blessed'];
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const entry = await res.json();
        onCreated(entry);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-700"><X size={20} /></button>
        <h3 className="text-2xl font-light text-stone-800 mb-1">New Journal Entry</h3>
        <p className="text-stone-500 text-sm mb-6">Record your spiritual thoughts, reflections, and prayers.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Entry Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="E.g., What God spoke to me today..."
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">How are you feeling spiritually?</label>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.mood === m ? 'bg-sage-500 text-white border-sage-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-sage-300'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Your Reflection *</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={5}
              placeholder="Write freely. This is your personal space with God..."
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.content.trim()} className="flex-1 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateJournal, setShowCreateJournal] = useState(false);
  const [togglingGoal, setTogglingGoal] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    try {
      const [profileRes, goalsRes, journalRes, prayersRes, offeringsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/goals'),
        fetch('/api/user/journal'),
        fetch('/api/user/prayers'),
        fetch('/api/user/offerings'),
      ]);
      const [profileData, goalsData, journalData, prayersData, offeringsData] = await Promise.all([
        profileRes.json(), goalsRes.json(), journalRes.json(), prayersRes.json(), offeringsRes.json(),
      ]);
      setProfile(profileData);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setJournal(Array.isArray(journalData) ? journalData : []);
      setPrayerRequests(Array.isArray(prayersData) ? prayersData : []);
      setOfferings(Array.isArray(offeringsData) ? offeringsData : []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const toggleGoal = async (id: string, current: boolean) => {
    setTogglingGoal(id);
    try {
      const res = await fetch(`/api/user/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAchieved: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals(prev => prev.map(g => g.id === id ? { ...g, isAchieved: updated.isAchieved } : g));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingGoal(null);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await fetch(`/api/user/goals/${id}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const totalGiving = offerings.reduce((sum, o) => sum + (o.amount || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-cream-50">
      <AnimatePresence>
        {showEditProfile && (
          <ProfileEditModal
            profile={profile}
            onClose={() => setShowEditProfile(false)}
            onSave={(data) => setProfile(data)}
          />
        )}
        {showCreateGoal && (
          <GoalCreateModal
            onClose={() => setShowCreateGoal(false)}
            onCreated={(goal) => setGoals(prev => [goal, ...prev])}
          />
        )}
        {showCreateJournal && (
          <JournalCreateModal
            onClose={() => setShowCreateJournal(false)}
            onCreated={(entry) => setJournal(prev => [entry, ...prev])}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sanctuary-card mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={session?.user?.image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-sage-200 shadow-md object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-3xl font-light text-stone-800">{session?.user?.name}</h1>
                <p className="text-stone-500 flex items-center mt-1"><Mail size={14} className="mr-1.5" />{session?.user?.email}</p>
                <p className="text-stone-500 flex items-center mt-1"><Book size={14} className="mr-1.5" />Faith: {profile?.faithPreference || 'Christian'}</p>
                {profile?.bio && <p className="text-stone-600 mt-2 text-sm italic max-w-md">{profile.bio}</p>}
              </div>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-5 py-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors flex items-center gap-2 font-medium text-sm"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Prayer Requests', value: prayerRequests.length, icon: Heart, color: 'text-rose-500' },
            { label: 'Active Goals', value: goals.filter(g => !g.isAchieved).length, icon: Target, color: 'text-sage-500' },
            { label: 'Journal Entries', value: journal.length, icon: Calendar, color: 'text-blue-500' },
            { label: 'Total Given', value: `$${totalGiving.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="sanctuary-card">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="text-2xl font-light text-stone-800">{stat.value}</p>
              <p className="text-sm text-stone-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spiritual Goals */}
          <div className="sanctuary-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-stone-800">Spiritual Goals</h2>
              <button onClick={() => setShowCreateGoal(true)} className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700 font-medium">
                <Plus size={16} /> Add Goal
              </button>
            </div>
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-stone-400 italic">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No goals yet. Add your first spiritual goal!</p>
                </div>
              ) : goals.map((goal) => (
                <div key={goal.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${goal.isAchieved ? 'bg-emerald-50 border-emerald-100' : 'bg-cream-50 border-stone-100'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleGoal(goal.id, goal.isAchieved)}
                      disabled={togglingGoal === goal.id}
                      className="flex-shrink-0"
                    >
                      {togglingGoal === goal.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-sage-500" />
                      ) : goal.isAchieved ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-stone-300 hover:border-sage-400 transition-colors" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm ${goal.isAchieved ? 'line-through text-stone-400' : 'text-stone-800'}`}>{goal.title}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> By {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-stone-300 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Journal */}
          <div className="sanctuary-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-stone-800">Spiritual Journal</h2>
              <button onClick={() => setShowCreateJournal(true)} className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700 font-medium">
                <Plus size={16} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {journal.length === 0 ? (
                <div className="text-center py-8 text-stone-400 italic">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No journal entries yet. Start your first reflection!</p>
                </div>
              ) : journal.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border-b border-cream-200 pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-stone-800 text-sm">{entry.title}</p>
                    {entry.mood && <span className="text-xs bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full border border-sage-200">{entry.mood}</span>}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-stone-600 mt-2 text-sm line-clamp-2">{entry.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prayer Requests */}
          <div className="sanctuary-card">
            <h2 className="text-xl font-light text-stone-800 mb-6">Prayer Requests</h2>
            <div className="space-y-3">
              {prayerRequests.length === 0 ? (
                <div className="text-center py-8 text-stone-400 italic">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No prayer requests yet.</p>
                </div>
              ) : prayerRequests.slice(0, 5).map((prayer) => (
                <div key={prayer.id} className="p-3 bg-cream-50 rounded-xl border border-stone-100">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-stone-800 text-sm">{prayer.title}</p>
                    {prayer.visibility === 'PRIVATE' ? (
                      <Lock size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Globe size={14} className="text-sage-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">{prayer.content}</p>
                  <p className="text-xs text-stone-400 mt-2">{new Date(prayer.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offering Summary */}
          <div className="sanctuary-card">
            <h2 className="text-xl font-light text-stone-800 mb-6">Giving History</h2>
            <div className="space-y-3">
              {offerings.length === 0 ? (
                <div className="text-center py-8 text-stone-400 italic">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No offerings recorded yet.</p>
                </div>
              ) : offerings.slice(0, 5).map((offering) => (
                <div key={offering.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-stone-100">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{offering.purpose || 'General Tithe'}</p>
                    <p className="text-xs text-stone-400">{new Date(offering.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">${(offering.amount / 100).toFixed(2)}</p>
                    <p className={`text-xs ${offering.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>{offering.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
              <span className="font-medium text-stone-600">Total Given</span>
              <span className="text-xl font-light text-emerald-600">${totalGiving.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
