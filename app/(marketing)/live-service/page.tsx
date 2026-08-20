'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  Church,
  HeartHandshake,
  Loader2,
  Maximize,
  MessageSquareOff,
  MonitorPlay,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type StreamConfig = {
  streamUrl: string;
  streamTitle: string;
  configured: boolean;
  source: 'site-config' | 'environment' | 'none';
};

type Workspace = {
  id: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
};

type StreamProvider = 'YouTube' | 'Twitch' | 'Vimeo' | 'external';

const CONFIGURE_ROLES = new Set(['OWNER', 'ADMIN']);

function parseHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function providerName(value: string): StreamProvider {
  const url = parseHttpUrl(value);
  if (!url) return 'external';
  const host = url.hostname.toLowerCase();
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) return 'YouTube';
  if (['twitch.tv', 'www.twitch.tv'].includes(host)) return 'Twitch';
  if (['vimeo.com', 'www.vimeo.com'].includes(host)) return 'Vimeo';
  return 'external';
}

function safePathSegment(value: string | undefined) {
  if (!value) return '';
  return /^[A-Za-z0-9_-]+$/.test(value) ? value : '';
}

function buildEmbedUrl(value: string, hostname: string) {
  const url = parseHttpUrl(value);
  if (!url) return '';
  const host = url.hostname.toLowerCase();

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    const path = url.pathname.split('/').filter(Boolean);
    const videoId = url.pathname === '/watch'
      ? safePathSegment(url.searchParams.get('v') || undefined)
      : path[0] === 'embed'
        ? safePathSegment(path[1])
        : path[0] === 'shorts'
          ? safePathSegment(path[1])
          : '';
    if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    if (url.pathname === '/live_stream') {
      const channel = safePathSegment(url.searchParams.get('channel') || undefined);
      return channel ? `https://www.youtube.com/live_stream?channel=${encodeURIComponent(channel)}` : '';
    }
    return '';
  }

  if (host === 'youtu.be') {
    const videoId = safePathSegment(url.pathname.split('/').filter(Boolean)[0]);
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : '';
  }

  if (['twitch.tv', 'www.twitch.tv'].includes(host) && hostname) {
    const channel = safePathSegment(url.pathname.split('/').filter(Boolean)[0]);
    return channel ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(hostname)}` : '';
  }

  if (['vimeo.com', 'www.vimeo.com'].includes(host)) {
    const path = url.pathname.split('/').filter(Boolean);
    if (path[0] === 'event' && /^\d+$/.test(path[1] || '')) return `https://vimeo.com/event/${path[1]}/embed`;
    const videoId = path.find((segment) => /^\d+$/.test(segment));
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }

  return '';
}

export default function LiveServicePage() {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<StreamConfig>({ streamUrl: '', streamTitle: 'Worship Sanctuary', configured: false, source: 'none' });
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamNotice, setStreamNotice] = useState('Checking the configured worship source…');
  const [hostname, setHostname] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const embedUrl = buildEmbedUrl(stream.streamUrl, hostname);
  const provider = providerName(stream.streamUrl);
  const configurableWorkspace = workspaces.find((workspace) => CONFIGURE_ROLES.has(workspace.role));

  useEffect(() => setHostname(window.location.hostname), []);

  useEffect(() => {
    if (!session?.user) {
      setWorkspaces([]);
      return;
    }
    let active = true;
    fetch('/api/church-ops/workspaces', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && Array.isArray(data?.workspaces)) setWorkspaces(data.workspaces);
      })
      .catch(() => {
        if (active) setWorkspaces([]);
      });
    return () => { active = false; };
  }, [session?.user]);

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
          streamTitle: typeof data.streamTitle === 'string' && data.streamTitle ? data.streamTitle : 'Worship Sanctuary',
          configured: data.configured === true,
          source: ['site-config', 'environment'].includes(data.source) ? data.source : 'none',
        };
        setStream(next);
        const nextProvider = providerName(next.streamUrl);
        setStreamNotice(next.configured
          ? nextProvider === 'external'
            ? 'A configured worship provider is available in a separate tab.'
            : `Playback is supplied directly by ${nextProvider}.`
          : 'The sanctuary is ready, but no worship stream is configured right now.');
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
        await navigator.share({ title: stream.streamTitle || 'Worship Sanctuary', url });
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
    <div className="sanctuary-page-shell min-h-screen bg-[#040b0a] pb-16 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm text-amber-100 backdrop-blur-xl">
                <Radio className="mr-2 h-4 w-4" /> Worship sanctuary
              </div>
              <h1 className="mt-5 text-4xl font-light leading-tight text-white md:text-6xl">Come for worship. Stay present for the Word. Respond with intention.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">The player shows only a real configured provider. No invented viewers, fake “live” clocks, simulated reactions, or pretend transcripts.</p>
            </div>
            <button type="button" onClick={() => void shareService()} className="sacred-secondary-button self-start"><Share2 className="h-4 w-4" /> Share sanctuary</button>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
            <div>
              <div ref={containerRef} className="group relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
                {streamLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#071814] to-black">
                    <div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-300" /><p className="mt-4 text-sm text-white/45">Checking the worship source…</p></div>
                  </div>
                ) : embedUrl ? (
                  <iframe src={embedUrl} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" title={stream.streamTitle || 'Worship Stream'} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(245,201,120,.11),transparent_30%),linear-gradient(145deg,#071814,#020504)]">
                    <div className="max-w-lg px-8 text-center">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-amber-200/20 bg-white/5"><MonitorPlay size={38} className="text-amber-100" /></div>
                      <p className="text-xl font-light text-white">{stream.configured ? 'This provider opens outside the embedded sanctuary' : 'A quiet sanctuary, awaiting the next configured service'}</p>
                      <p className="mt-3 text-sm leading-6 text-white/42">Nothing is marked live unless a real provider source exists.</p>
                      {stream.configured && stream.streamUrl && <a href={stream.streamUrl} target="_blank" rel="noopener noreferrer" className="sacred-primary-button mt-5">Open {provider === 'external' ? 'worship provider' : provider}</a>}
                      {!stream.configured && configurableWorkspace && <Link href="/admin/settings" className="sacred-secondary-button mt-5"><Church className="h-4 w-4" /> Configure broadcast</Link>}
                    </div>
                  </div>
                )}

                {embedUrl && (
                  <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm">Provider source configured</span>
                    <span className="rounded-full bg-black/75 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm">Controls belong to {provider}</span>
                  </div>
                )}

                <button type="button" onClick={toggleFullscreen} className="absolute bottom-4 right-4 z-10 rounded-full border border-white/10 bg-black/70 p-3 text-white backdrop-blur-sm transition hover:bg-black" aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                  <Maximize size={20} />
                </button>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="sanctuary-section-label text-emerald-200/55">Current worship source</p>
                  <h2 className="mt-2 text-2xl font-light text-white">{stream.streamTitle}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">{streamNotice}</p>
                </div>
                <span className="inline-flex self-start items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55"><ShieldCheck className="mr-2 h-4 w-4 text-emerald-300" /> Provider truth only</span>
              </div>
              {shareNotice && <p className="mt-3 text-xs text-white/35">{shareNotice}</p>}
            </div>

            <aside className="space-y-4">
              <div className="sacred-panel-dark p-5">
                <p className="sanctuary-section-label text-amber-100/65">Service companion</p>
                <h2 className="mt-2 text-2xl font-light text-white">Stillness → Word → Response</h2>
                <div className="mt-5 space-y-2">
                  <Link href="/scripture" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-4 text-sm text-white/75 hover:bg-white/7"><span className="inline-flex items-center"><BookOpen className="mr-3 h-4 w-4 text-amber-100" />Open the Word</span><span>→</span></Link>
                  <Link href="/service-response" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-4 text-sm text-white/75 hover:bg-white/7"><span className="inline-flex items-center"><Sparkles className="mr-3 h-4 w-4 text-emerald-200" />Respond to the service</span><span>→</span></Link>
                  <Link href="/prayer-room" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-4 text-sm text-white/75 hover:bg-white/7"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-emerald-200" />Enter prayer</span><span>→</span></Link>
                  <Link href="/care" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-4 text-sm text-white/75 hover:bg-white/7"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-rose-200" />Ask for human care</span><span>→</span></Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-amber-200/10 bg-amber-100/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <MessageSquareOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                  <div>
                    <h3 className="font-semibold text-white">Global chat remains off</h3>
                    <p className="mt-2 text-xs leading-6 text-white/45">Messages are not mixed between congregations while a tenant-and-broadcast-room scoped chat model is still pending.</p>
                  </div>
                </div>
              </div>

              {configurableWorkspace && (
                <div className="rounded-[1.75rem] border border-emerald-200/10 bg-emerald-100/[0.04] p-5">
                  <p className="text-xs font-semibold text-emerald-100">{configurableWorkspace.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">Workspace role · {configurableWorkspace.role}</p>
                  <Link href="/admin/settings" className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-200">Broadcast settings <span className="ml-2">→</span></Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
