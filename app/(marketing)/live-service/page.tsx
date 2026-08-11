'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookOpen, HeartHandshake, Loader2, Maximize, MessageSquareOff, MonitorPlay, Share2, ShieldCheck } from 'lucide-react';

type StreamConfig = {
  streamUrl: string;
  streamTitle: string;
  configured: boolean;
  source: 'site-config' | 'environment' | 'none';
};

function providerName(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitch.tv')) return 'Twitch';
  if (url.includes('vimeo.com')) return 'Vimeo';
  return 'the configured stream provider';
}

function buildEmbedUrl(url: string, hostname: string) {
  if (!url) return '';

  if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : '';
  }
  if (url.includes('youtube.com/embed') || url.includes('youtube.com/live_stream')) return url;

  if (url.includes('twitch.tv') && hostname) {
    const channel = url.split('twitch.tv/')[1]?.split(/[/?#]/)[0];
    return channel
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(hostname)}`
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

  // Unknown providers stay as explicit external links instead of being injected into an iframe.
  return '';
}

export default function LiveServicePage() {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<StreamConfig>({ streamUrl: '', streamTitle: 'Live Worship Service', configured: false, source: 'none' });
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamNotice, setStreamNotice] = useState('Checking the configured stream…');
  const [hostname, setHostname] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareNotice, setShareNotice] = useState('');

  const isProductAdmin = Boolean(session?.user && (session.user as typeof session.user & { role?: string }).role === 'CHURCH_ADMIN');
  const embedUrl = buildEmbedUrl(stream.streamUrl, hostname);
  const provider = providerName(stream.streamUrl);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      setStreamLoading(true);
      try {
        const response = await fetch('/api/live-service/config', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
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
                    <p className="text-lg font-light text-stone-200">{stream.configured ? 'This provider opens outside the Church OS player' : 'No stream is configured right now'}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">This page does not label a service “live” or invent viewer, playback, quality, volume, or timer state without a provider source.</p>
                    {stream.configured && stream.streamUrl && (
                      <a href={stream.streamUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-500">Open {provider}</a>
                    )}
                    {!stream.configured && isProductAdmin && <a href="/admin/settings" className="mt-5 inline-flex rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-500">Open Admin Settings</a>}
                  </div>
                </div>
              )}

              {embedUrl && (
                <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  <span className="rounded-full bg-stone-950/85 px-3 py-1.5 text-xs font-semibold text-sage-200 backdrop-blur-sm">Provider stream configured</span>
                  <span className="rounded-full bg-stone-950/85 px-3 py-1.5 text-xs text-stone-300 backdrop-blur-sm">Playback controlled by {provider}</span>
                </div>
              )}

              <button type="button" onClick={toggleFullscreen} className="absolute bottom-4 right-4 z-10 rounded-full bg-stone-950/80 p-3 text-white backdrop-blur-sm transition hover:bg-stone-800" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                <Maximize size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-2xl font-light">{stream.streamTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{streamNotice}</p>
                <div className="mt-3 inline-flex items-center rounded-full border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-400"><ShieldCheck className="mr-2 h-4 w-4 text-sage-400" /> Provider truth only—no simulated live analytics or player controls.</div>
              </div>
              <button type="button" onClick={() => void shareService()} className="flex items-center gap-2 self-start rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-medium transition hover:bg-stone-700"><Share2 size={16} /> Share</button>
            </div>
            {shareNotice && <p className="mt-3 text-xs text-stone-500">{shareNotice}</p>}
          </div>

          <aside className="space-y-5 lg:col-span-1">
            <div className="rounded-3xl border border-stone-700 bg-stone-800 p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <MessageSquareOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <h2 className="font-semibold text-white">Church-scoped chat required</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-400">The old global chat is disabled because its records have no church or broadcast-room identity. Messages will not be mixed across congregations while a tenant-scoped room model is pending.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-700 bg-stone-800 p-5 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Respond during service</p>
              <div className="mt-4 space-y-3">
                <Link href="/service-response" className="flex min-h-12 items-center justify-between rounded-2xl border border-stone-700 bg-stone-900/60 px-4 text-sm font-semibold text-white hover:border-sage-600"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-sage-300" />Service response</span><span>→</span></Link>
                <Link href="/prayer-room" className="flex min-h-12 items-center justify-between rounded-2xl border border-stone-700 bg-stone-900/60 px-4 text-sm font-semibold text-white hover:border-sage-600"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-sage-300" />Prayer room</span><span>→</span></Link>
                <Link href="/scripture" className="flex min-h-12 items-center justify-between rounded-2xl border border-stone-700 bg-stone-900/60 px-4 text-sm font-semibold text-white hover:border-sage-600"><span className="inline-flex items-center"><BookOpen className="mr-3 h-4 w-4 text-sage-300" />Scripture</span><span>→</span></Link>
                <Link href="/care" className="flex min-h-12 items-center justify-between rounded-2xl border border-stone-700 bg-stone-900/60 px-4 text-sm font-semibold text-white hover:border-sage-600"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-sage-300" />Human care</span><span>→</span></Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
