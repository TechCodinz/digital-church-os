'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Heart, Loader2, Maximize, MessageSquare, MonitorPlay, Send, Share2, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  msg: string;
  color: string;
  time: string;
}

type StreamConfig = {
  streamUrl: string;
  streamTitle: string;
  configured: boolean;
  source: 'site-config' | 'environment' | 'none';
};

const COLORS = ['text-blue-400', 'text-rose-400', 'text-emerald-400', 'text-amber-400', 'text-purple-400', 'text-cyan-400'];
const colorMap = new Map<string, string>();

function getUserColor(name: string) {
  if (!colorMap.has(name)) colorMap.set(name, COLORS[colorMap.size % COLORS.length]);
  return colorMap.get(name)!;
}

function providerName(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitch.tv')) return 'Twitch';
  if (url.includes('vimeo.com')) return 'Vimeo';
  return 'the configured stream provider';
}

function buildEmbedUrl(url: string) {
  if (!url) return '';

  if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : '';
  }
  if (url.includes('youtube.com/embed') || url.includes('youtube.com/live_stream')) return url;

  if (url.includes('twitch.tv')) {
    if (typeof window === 'undefined') return '';
    const channel = url.split('twitch.tv/')[1]?.split(/[/?#]/)[0];
    return channel
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(window.location.hostname)}`
      : '';
  }

  if (url.includes('vimeo.com/event/')) {
    const eventId = url.match(/vimeo\.com\/event\/(\d+)/)?.[1];
    return eventId ? `https://vimeo.com/event/${eventId}/embed` : '';
  }

  if (url.includes('vimeo.com')) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }

  return url;
}

export default function LiveServicePage() {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessageTime = useRef<string | null>(null);

  const [stream, setStream] = useState<StreamConfig>({ streamUrl: '', streamTitle: 'Live Worship Service', configured: false, source: 'none' });
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamNotice, setStreamNotice] = useState('Checking the configured stream…');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatNotice, setChatNotice] = useState('Connecting to community chat…');
  const [sendingBlessing, setSendingBlessing] = useState(false);
  const [blessingNotice, setBlessingNotice] = useState('');
  const [shareNotice, setShareNotice] = useState('');

  const isProductAdmin = Boolean(session?.user && (session.user as typeof session.user & { role?: string }).role === 'CHURCH_ADMIN');
  const embedUrl = buildEmbedUrl(stream.streamUrl);
  const provider = providerName(stream.streamUrl);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      setStreamLoading(true);
      try {
        const response = await fetch('/api/live-service/config', { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setStreamNotice(data?.error || 'Stream configuration is unavailable.');
          return;
        }
        const next: StreamConfig = {
          streamUrl: typeof data.streamUrl === 'string' ? data.streamUrl : '',
          streamTitle: typeof data.streamTitle === 'string' && data.streamTitle ? data.streamTitle : 'Live Worship Service',
          configured: data.configured === true,
          source: ['site-config', 'environment'].includes(data.source) ? data.source : 'none',
        };
        setStream(next);
        setStreamNotice(next.configured ? `Playback is provided by ${providerName(next.streamUrl)}.` : 'No live-stream provider is configured for this service.');
      } catch {
        if (active) setStreamNotice('Stream configuration could not be loaded.');
      } finally {
        if (active) setStreamLoading(false);
      }
    };
    void loadConfig();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchMessages = async (since?: string | null) => {
      try {
        const url = since ? `/api/live-chat?since=${encodeURIComponent(since)}&limit=20` : '/api/live-chat?limit=50';
        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setChatNotice(data?.error || 'Community chat is unavailable.');
          return;
        }

        setChatNotice('Community chat connected');
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          const mapped: ChatMessage[] = data.messages.map((message: any) => ({
            id: String(message.id),
            user: message.user?.name?.split(' ')[0] || 'Worshipper',
            msg: String(message.content || ''),
            color: getUserColor(message.user?.name || 'Worshipper'),
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setChatMessages((previous) => {
            const existingIds = new Set(previous.map((message) => message.id));
            const additions = mapped.filter((message) => !existingIds.has(message.id));
            return additions.length ? [...previous, ...additions].slice(-200) : previous;
          });
          lastMessageTime.current = data.messages[data.messages.length - 1]?.createdAt || lastMessageTime.current;
        }
      } catch {
        if (active) setChatNotice('Community chat connection is unavailable.');
      }
    };

    void fetchMessages(null);
    const poll = window.setInterval(() => void fetchMessages(lastMessageTime.current), 5000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!newMessage.trim() || !session || sendingMessage) return;

    const content = newMessage.trim();
    setSendingMessage(true);
    try {
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setChatNotice(data?.error || 'Message could not be sent.');
        return;
      }
      setNewMessage('');
      setChatNotice('Message sent');
    } catch {
      setChatNotice('Message could not be sent.');
    } finally {
      setSendingMessage(false);
    }
  }

  async function sendBlessing() {
    if (!session || sendingBlessing) return;
    setSendingBlessing(true);
    setBlessingNotice('');
    try {
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '🙏 Sent a blessing!', type: 'BLESSING' }),
      });
      const data = await response.json().catch(() => ({}));
      setBlessingNotice(response.ok ? 'Blessing sent to the service chat.' : data?.error || 'Blessing could not be sent.');
    } catch {
      setBlessingNotice('Blessing could not be sent.');
    } finally {
      setSendingBlessing(false);
    }
  }

  async function shareService() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: stream.streamTitle || 'Live Worship Service', url });
        setShareNotice('Share sheet opened.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareNotice('Service link copied.');
      } else {
        setShareNotice('Copy the current page URL to share this service.');
      }
    } catch {
      setShareNotice('Sharing was cancelled or unavailable.');
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 pb-12 pt-24 text-stone-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div ref={containerRef} className="group relative aspect-video overflow-hidden rounded-3xl bg-black shadow-2xl">
              {streamLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
                  <div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-sage-400" /><p className="mt-4 text-sm text-stone-400">Checking stream configuration…</p></div>
                </div>
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={stream.streamTitle || 'Live Service Stream'}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
                  <div className="max-w-lg px-8 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-sage-400/40"><MonitorPlay size={40} className="text-sage-400" /></div>
                    <p className="text-lg font-light text-stone-200">No stream is configured right now</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">This page will not label a service “live” or invent viewer/playback state without a real provider connection.</p>
                    {isProductAdmin && <a href="/admin/settings" className="mt-5 inline-flex rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-500">Open Admin Settings</a>}
                  </div>
                </div>
              )}

              {embedUrl && (
                <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  <span className="rounded-full bg-stone-950/85 px-3 py-1.5 text-xs font-semibold text-sage-200 backdrop-blur-sm">Stream configured</span>
                  <span className="rounded-full bg-stone-950/85 px-3 py-1.5 text-xs text-stone-300 backdrop-blur-sm">Playback controlled by {provider}</span>
                </div>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 z-10 rounded-full bg-stone-950/80 p-3 text-white backdrop-blur-sm transition hover:bg-stone-800"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
              >
                <Maximize size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-2xl font-light">{stream.streamTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{streamNotice}</p>
                <div className="mt-3 inline-flex items-center rounded-full border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-400"><ShieldCheck className="mr-2 h-4 w-4 text-sage-400" /> No simulated viewer count, quality, volume, play state, or live timer.</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void sendBlessing()} disabled={!session || sendingBlessing} className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"><Heart size={16} /> {sendingBlessing ? 'Sending…' : 'Bless'}</button>
                <button type="button" onClick={() => void shareService()} className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-medium transition hover:bg-stone-700"><Share2 size={16} /> Share</button>
              </div>
            </div>
            {(blessingNotice || shareNotice) && <p className="mt-3 text-xs text-stone-500">{blessingNotice || shareNotice}</p>}
          </div>

          <div className="lg:col-span-1">
            <div className="flex h-[600px] flex-col rounded-3xl border border-stone-700 bg-stone-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-700 p-4">
                <h3 className="flex items-center gap-2 font-medium"><MessageSquare size={16} className="text-sage-400" /> Community Chat</h3>
                <span className="text-[11px] text-stone-500">{chatNotice}</span>
              </div>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                <AnimatePresence>
                  {chatMessages.length === 0 && <div className="pt-8 text-center text-sm text-stone-600"><MessageSquare size={28} className="mx-auto mb-2 opacity-30" /> No messages yet.</div>}
                  {chatMessages.map((chat) => (
                    <motion.div key={chat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm">
                      <div className="mb-0.5 flex items-center justify-between"><span className={`text-xs font-bold ${chat.color}`}>{chat.user}</span><span className="text-[10px] text-stone-600">{chat.time}</span></div>
                      <span className="text-stone-300">{chat.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-stone-700 bg-stone-900/50 p-4">
                {session ? (
                  <form onSubmit={(event) => void sendMessage(event)} className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Write to the service chat…" maxLength={200} className="flex-1 rounded-xl border border-stone-600 bg-stone-800 px-3 py-2.5 text-sm text-stone-200 outline-none placeholder-stone-500 focus:ring-2 focus:ring-sage-500" />
                    <button type="submit" disabled={sendingMessage || !newMessage.trim()} className="rounded-xl bg-sage-500 p-2.5 text-white transition hover:bg-sage-600 disabled:opacity-50">{sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
                  </form>
                ) : (
                  <div className="text-center"><p className="mb-2 text-xs text-stone-500">Sign in to join the conversation</p><a href="/auth/signin" className="text-xs text-sage-400 hover:underline">Sign In →</a></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
