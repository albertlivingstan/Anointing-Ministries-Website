import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Bell, Download, RefreshCw, ExternalLink, Images, ChevronLeft, ChevronRight, X, Play, Share2, Heart, Clock, CalendarDays, MapPin } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const recentBroadcasts = [
  { id: 'tKIroxrTbG8', title: 'Oyvunaal Aaradhanai — Sabbath Worship', description: 'Sister Latha Samson · Rev. Samson Edward · Ps. David Samson', tag: 'Sabbath Live' },
  { id: 'A0uaaxF8JnY', title: 'Thiralaai Perugappannuven', description: 'Rev. Dr. Samson Edward · Ps. David Samson', tag: 'Sunday Celebration' },
  { id: 'eMzbt_ugXj4', title: 'Church Anniversary Special Celebration', description: 'Pastor Johnson Memana · Rev. Dr. Samson Edward · Ps. David Samson', tag: 'Special Service' },
  { id: 'YGPd1LORldI', title: 'Perugaseivaar — Praise Song & Worship', description: 'Pastor David Samson · Anointing Ministries', tag: 'Worship Service' },
  { id: 'DVwT2-LpUkY', title: 'Karthar Nam Naduvil Aaseerwathangal', description: 'Rev. Dr. Samson Edward · Sunday Worship Service', tag: 'Sunday Service' },
  { id: 'aC8ac6y_oco', title: 'Anointing Ministries Live Stream', description: 'Madukkarai Church Sanctuary · Live Service', tag: 'Live Stream' }
];

export function LiveStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<any>({
    status: 'offline',
    videoId: 'tKIroxrTbG8',
    title: 'Sunday Worship Service · Anointing Ministries',
    nextService: 'Sunday 9:00 AM & 6:30 PM IST'
  });
  const [selectedVideo, setSelectedVideo] = useState('tKIroxrTbG8');
  const [msg, setMsg] = useState('');
  const [notify, setNotify] = useState(false);
  const [checking, setChecking] = useState(false);
  const last = useRef('');

  // 1. Sync real-time broadcast settings from Firestore if available
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'live_broadcast'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setState((prev: any) => ({
            ...prev,
            status: data.isLive ? 'live' : 'offline',
            videoId: data.videoId || prev.videoId,
            title: data.title || prev.title,
            nextService: data.nextService || prev.nextService,
            announcement: data.announcement || ''
          }));
          if (data.videoId) {
            setSelectedVideo(data.videoId);
          }
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  // 2. Also check API
  async function check() {
    setChecking(true);
    try {
      const r = await fetch('/api/live');
      if (r.ok) {
        const d = await r.json();
        if (d && (d.status === 'live' || d.status === 'offline')) {
          setState((prev: any) => ({
            ...prev,
            status: prev.status === 'live' ? 'live' : d.status,
            videoId: d.videoId || prev.videoId,
            title: d.title || prev.title,
            nextService: d.nextService || prev.nextService,
            checkedAt: d.checkedAt
          }));
          if (d.status === 'live') {
            setSelectedVideo(d.videoId);
          }
        }
        if (d.status === 'live' && d.videoId !== last.current) {
          last.current = d.videoId;
          if (notify && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              const options = {
                body: d.title || 'Join Sunday worship now!',
                icon: '/icons/icon-192.png',
                tag: d.videoId
              };
              const reg = await navigator.serviceWorker?.getRegistration();
              if (reg) await reg.showNotification('Anointing Ministries is LIVE', options);
              else new Notification('Anointing Ministries is LIVE', options);
            } catch {}
          }
        }
      }
    } catch {
      // Keep working offline fallback
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    check();
    const t = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') check();
    }, 60000);
    return () => clearInterval(t);
  }, [notify]);

  const isLive = state.status === 'live';
  const activeVideoId = isLive ? (state.videoId || 'tKIroxrTbG8') : selectedVideo;

  const copyLiveLink = async () => {
    try {
      const url = window.location.origin + '/live';
      if (navigator.share) {
        await navigator.share({ title: 'Watch Anointing Ministries Live Worship', url });
      } else {
        await navigator.clipboard.writeText(url);
        setMsg('Live broadcast link copied to clipboard!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch {}
  };

  // Compact Mode (for Homepage top)
  if (compact) {
    if (isLive) {
      return (
        <aside aria-label="Live broadcast announcement" className="bg-red-700 text-white px-4 py-3 shadow-lg flex items-center justify-between gap-4 flex-wrap z-30 relative">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="text-sm font-semibold tracking-wide">
              <span className="bg-black/30 px-2 py-0.5 rounded text-xs uppercase font-bold mr-2">LIVE NOW</span>
              {state.title || 'Anointing Ministries Live Worship'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/live" className="bg-white text-red-900 font-bold px-4 py-1.5 rounded text-xs shadow hover:bg-neutral-100 transition-colors flex items-center gap-1.5">
              <Play size={13} fill="currentColor" /> Watch Live Broadcast
            </Link>
          </div>
        </aside>
      );
    }

    return (
      <aside aria-label="Worship broadcast schedule" className="bg-neutral-900 text-neutral-200 px-4 py-2.5 text-xs flex items-center justify-between gap-4 flex-wrap border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-amber-400" />
          <span><b>Worship Broadcast:</b> Next Live Service on {state.nextService || 'Sunday at 9:00 AM IST'} · Madukkarai Church Sanctuary</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/live" className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1">
            Watch Service Broadcasts →
          </Link>
        </div>
      </aside>
    );
  }

  // Full Mode (for /live and /worship)
  return (
    <section className={`live-status-card ${isLive ? 'is-live' : ''} shadow-md`}>
      <div className="flex items-center justify-between gap-3 border-b pb-3 mb-4 border-amber-900/10">
        <div className="flex items-center gap-3">
          {isLive ? (
            <span className="flex items-center gap-2 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white"></span> LIVE NOW
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-amber-800/10 text-amber-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <Radio size={14} className="text-amber-600" /> MINISTRY BROADCAST
            </span>
          )}
          <b className="text-lg">
            {isLive ? state.title : 'Anointing Ministries Official Broadcast'}
          </b>
        </div>
        <button
          className="icon-btn"
          aria-label="Refresh broadcast status"
          title="Refresh broadcast status"
          onClick={check}
          disabled={checking}
        >
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
        </button>
      </div>

      <p className="text-sm text-neutral-600 mb-3">
        {isLive
          ? 'The ministry is broadcasting live from Madukkarai Church Sanctuary, Coimbatore. Worship with us in spirit and truth!'
          : `Live broadcast scheduled for ${state.nextService || 'Sundays at 9:00 AM & 6:30 PM IST'}. You can watch our latest live worship service below or visit our official channel.`}
      </p>

      {/* Main Video Stream Player */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg my-4">
        <iframe
          title="Anointing Ministries Worship Broadcast"
          src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=${isLive ? 1 : 0}&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Action Controls */}
      <div className="actions flex flex-wrap gap-3 items-center justify-between pt-2">
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.youtube.com/@AnointingMinistries/live"
            target="_blank"
            rel="noopener noreferrer"
            className="btn gold flex items-center gap-2 text-xs"
          >
            <span>Open on YouTube Live</span> <ExternalLink size={14} />
          </a>
          <button
            onClick={copyLiveLink}
            className="btn outline flex items-center gap-2 text-xs"
          >
            <Share2 size={14} /> Share Stream
          </button>
          <Link
            to="/prayer"
            className="btn outline flex items-center gap-2 text-xs"
          >
            <Heart size={14} className="text-rose-500" /> Request Prayer
          </Link>
        </div>

        <button
          className="text-link text-xs flex items-center gap-1.5"
          onClick={async () => {
            if (!('Notification' in window)) {
              setMsg('Notifications are not supported in this browser. Live alerts still appear in the app.');
              return;
            }
            try {
              const permission = await Notification.requestPermission();
              setNotify(permission === 'granted');
              setMsg(permission === 'granted' ? 'Live alerts enabled while app is open.' : 'Permission denied.');
            } catch {
              setMsg('Notifications are unavailable in this browser.');
            }
          }}
        >
          <Bell size={14} /> {notify ? 'Alerts active' : 'Notify me when live'}
        </button>
      </div>

      {msg && <p role="status" className="text-xs text-amber-700 mt-2 font-medium">{msg}</p>}

      {/* Available Live Worship Services Playlist */}
      <div className="mt-6 pt-4 border-t border-neutral-300">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-3">
          Select Service / Recorded Live Stream:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {recentBroadcasts.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedVideo(b.id)}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                activeVideoId === b.id
                  ? 'border-amber-600 bg-amber-50 shadow-sm font-semibold'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  {b.tag}
                </span>
                {activeVideoId === b.id && (
                  <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                    ● Playing
                  </span>
                )}
              </div>
              <p className="line-clamp-1 font-medium text-neutral-900">{b.title}</p>
              <small className="text-neutral-500 line-clamp-1 mt-1">{b.description}</small>
            </button>
          ))}
        </div>
      </div>

      <small className="block mt-4 text-[11px] text-neutral-500">
        Anointing Ministries Sanctuary · Madukkarai, Coimbatore · Checks refresh automatically while open
      </small>
    </section>
  );
}

export function LivePage() {
  return (
    <section className="section live-page max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">TOGETHER IN HIS PRESENCE</span>
        <h1 className="text-3xl md:text-5xl font-serif mt-2 mb-3">
          Worship <em>with us live.</em>
        </h1>
        <p className="text-neutral-600 max-w-2xl text-sm md:text-base">
          Join our church family for praise, prophetic worship, and life-changing messages with Pastor David Samson and Rev. Dr. Samson Edward.
        </p>
      </div>

      <LiveStatus />

      {/* Service Schedule Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <CalendarDays className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Sunday Services</h3>
          <p className="text-xs text-neutral-600 mt-1">Morning Service: 9:00 AM IST</p>
          <p className="text-xs text-neutral-600">Evening Service: 6:30 PM IST</p>
          <small className="text-amber-800 font-medium block mt-2">Tamil & English Worship</small>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <Clock className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Weekly Meetings</h3>
          <p className="text-xs text-neutral-600 mt-1">Sabbath Worship: Saturday 6:30 PM</p>
          <p className="text-xs text-neutral-600">Youth & Prayer: Wednesday 7:00 PM</p>
          <small className="text-amber-800 font-medium block mt-2">Online & Sanctuary</small>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <MapPin className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Church Sanctuary</h3>
          <p className="text-xs text-neutral-600 mt-1">Anointing Ministries Church</p>
          <p className="text-xs text-neutral-600">Madukkarai, Coimbatore – 641105</p>
          <Link to="/contact" className="text-amber-800 font-medium text-xs underline block mt-2">Get Directions →</Link>
        </div>
      </div>
    </section>
  );
}

export function AppInstall() {
  const [event, setEvent] = useState<any>(null), [msg, setMsg] = useState(''), [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const f = (e: Event) => { e.preventDefault(); setEvent(e); };
    const done = () => { setInstalled(true); setEvent(null); };
    window.addEventListener('beforeinstallprompt', f);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('beforeinstallprompt', f);
      window.removeEventListener('appinstalled', done);
    };
  }, []);

  return (
    <div className="install-app">
      <div>
        <span className="eyebrow">FAITH IN YOUR EVERYDAY</span>
        <h3>Take your church with you.</h3>
        <p>Install on your phone. Read downloaded Bible books even offline.</p>
      </div>
      <button className="btn gold" disabled={installed} onClick={async () => {
        if (event) {
          await event.prompt();
          const choice = await event.userChoice;
          setEvent(null);
          if (choice.outcome === 'accepted') setMsg('Follow your browser’s installation prompt.');
        } else {
          setMsg('iPhone: Safari → Share → Add to Home Screen. Android/desktop: browser menu → Install app or Add to Home Screen. If unavailable, continue in the browser.');
        }
      }}>
        <Download size={17} />{installed ? 'App installed' : 'Install app'}
      </button>
      {msg && <p className="install-help" role="status">{msg}</p>}
    </div>
  );
}

const photos = [
  ['congregation', 'Our church family', 'Congregation photo from the official ministry channel'],
  ['channel-banner', 'Together in worship', 'Official channel banner'],
  ['christmas-community', 'Christmas Rally 2024', 'Official ministry video thumbnail'],
  ['church-worship', 'Tamil worship service', 'Official ministry video thumbnail'],
  ['service-september', 'Sunday Special Service', '1 September 2024 · ministry archive'],
  ['service-february', 'Sunday Service', '25 February 2024 · ministry archive'],
  ['worship-song', 'Devanaalae Ellam Kudum', 'Pastor David Samson · official song thumbnail']
];

export function ChurchGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    selected === null ? dialog.current?.close() : dialog.current?.showModal();
  }, [selected]);

  return (
    <section className="section church-gallery">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MOMENTS FROM OUR MINISTRY</span>
          <h2>One church.<em> Many memories.</em></h2>
        </div>
        <Images size={24} />
      </div>
      <div className="church-photo-grid">
        {photos.map(([image, title, caption], i) => (
          <button key={image} onClick={() => setSelected(i)}>
            <img src={'/images/' + image + '.jpg'} alt={title} loading="lazy" />
            <span>{title}<small>{caption}</small></span>
          </button>
        ))}
      </div>
      <p className="small muted">Available photos and thumbnails retrieved from the official YouTube channel. This is not the complete Facebook/Instagram photo history.</p>
      <dialog ref={dialog} className="photo-dialog" onCancel={() => setSelected(null)}>
        {selected !== null && (
          <>
            <button className="icon-btn close-photo" aria-label="Close photo" onClick={() => setSelected(null)}><X /></button>
            <img src={'/images/' + photos[selected][0] + '.jpg'} alt={photos[selected][1]} />
            <div className="row-between">
              <button className="icon-btn" aria-label="Previous photo" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}><ChevronLeft /></button>
              <p>{photos[selected][1]} · {selected + 1}/{photos.length}</p>
              <button className="icon-btn" aria-label="Next photo" onClick={() => setSelected((selected + 1) % photos.length)}><ChevronRight /></button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
