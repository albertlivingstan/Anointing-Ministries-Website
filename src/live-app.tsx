import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Bell, Download, RefreshCw, ExternalLink, Images, ChevronLeft, ChevronRight, X, Play, Share2, Heart, Clock, CalendarDays, MapPin, Volume2, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot, collection, addDoc, query, orderBy, limit } from 'firebase/firestore';

export const CHANNEL_ID = 'UCVlqXBkmLozubnyVjUeD5Zw';

export const recentBroadcasts = [
  { id: 'tKIroxrTbG8', title: 'Sunday Worship Service · Live from Sanctuary', description: 'Rev. Dr. Samson Edward · Ps. David Samson · Tamil & English', tag: 'Recent Service', date: 'Sunday Service' },
  { id: 'A0uaaxF8JnY', title: 'Thiralaai Perugappannuven — Praise & Word', description: 'Rev. Dr. Samson Edward · Anointing Ministries Sanctuary', tag: 'Sermon Broadcast', date: 'Celebration' },
  { id: 'eMzbt_ugXj4', title: 'Church Anniversary Special Celebration', description: 'Pastor Johnson Memana · Rev. Dr. Samson Edward · Ps. David Samson', tag: 'Special Rally', date: 'Anniversary' },
  { id: 'YGPd1LORldI', title: 'Perugaseivaar — Tamil Praise Song & Worship', description: 'Pastor David Samson · Anointing Ministries Coimbatore', tag: 'Worship Songs', date: 'Praise Special' },
  { id: 'DVwT2-LpUkY', title: 'Karthar Nam Naduvil Aaseerwathangal', description: 'Rev. Dr. Samson Edward · Sunday Message & Blessings', tag: 'Sunday Message', date: 'Sunday Service' },
  { id: 'aC8ac6y_oco', title: 'Anointing Ministries Live Stream Archive', description: 'Madukkarai Church Sanctuary · Full Service Broadcast', tag: 'Sanctuary Worship', date: 'Live Archive' }
];

export function LiveStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<any>({
    status: 'offline',
    videoId: 'tKIroxrTbG8',
    title: 'Sunday Worship Service · Anointing Ministries',
    nextService: 'Sunday 9:00 AM & 6:30 PM IST'
  });
  const [playMode, setPlayMode] = useState<'channel_live' | 'recorded'>('recorded');
  const [selectedVideo, setSelectedVideo] = useState('tKIroxrTbG8');
  const [msg, setMsg] = useState('');
  const [notify, setNotify] = useState(false);
  const [checking, setChecking] = useState(false);
  const last = useRef('');

  // 1. Sync real-time broadcast settings from Firestore
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'live_broadcast'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const isLiveNow = !!data.isLive;
          setState((prev: any) => ({
            ...prev,
            status: isLiveNow ? 'live' : 'offline',
            videoId: data.videoId || prev.videoId,
            title: data.title || prev.title,
            nextService: data.nextService || prev.nextService,
            announcement: data.announcement || ''
          }));
          if (data.videoId) {
            setSelectedVideo(data.videoId);
          }
          if (isLiveNow) {
            setPlayMode('channel_live');
          }
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  // 2. Poll API endpoint safely
  async function check() {
    setChecking(true);
    try {
      const r = await fetch('/api/live');
      if (r.ok) {
        const d = await r.json();
        if (d && (d.status === 'live' || d.status === 'offline')) {
          const isLive = d.status === 'live';
          setState((prev: any) => ({
            ...prev,
            status: prev.status === 'live' ? 'live' : d.status,
            videoId: d.videoId || prev.videoId,
            title: d.title || prev.title,
            nextService: d.nextService || prev.nextService,
            checkedAt: d.checkedAt
          }));
          if (isLive) {
            setSelectedVideo(d.videoId);
            setPlayMode('channel_live');
          }
        }
      }
    } catch {
      // Keep working offline gracefully
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
  }, []);

  const isLive = state.status === 'live';
  const activeVideoId = state.videoId || selectedVideo || 'tKIroxrTbG8';

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
    } catch {
      setMsg('Link: ' + window.location.origin + '/live');
    }
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

  // Determine current iframe embed URL
  const embedUrl = playMode === 'channel_live'
    ? `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1`
    : `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`;

  // Full Mode (for /live)
  return (
    <section className={`live-status-card ${isLive ? 'is-live' : ''} shadow-md`}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 border-b pb-3 mb-4 border-amber-900/10 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {isLive ? (
            <span className="flex items-center gap-2 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white"></span> LIVE BROADCAST
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-amber-800/10 text-amber-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <Radio size={14} className="text-amber-600" /> OFFICIAL BROADCAST
            </span>
          )}
          <b className="text-base sm:text-lg">
            {isLive ? state.title : (playMode === 'channel_live' ? 'YouTube Live Stream Feed' : state.title)}
          </b>
        </div>
        
        <div className="flex items-center gap-2">
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
      </div>

      <p className="text-sm text-neutral-600 mb-3">
        {isLive
          ? '🔴 Anointing Ministries is currently streaming live from Madukkarai Sanctuary, Coimbatore. Worship with Pastor David Samson & Rev. Dr. Samson Edward!'
          : `Next scheduled live service: ${state.nextService || 'Sundays at 9:00 AM & 6:30 PM IST'}. You can watch our official YouTube live feed or select any recorded worship service below.`}
      </p>

      {/* Stream Selector Tabs */}
      <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
        <button
          onClick={() => setPlayMode('channel_live')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            playMode === 'channel_live'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse inline-block" />
          YouTube Live Channel Feed
        </button>

        <button
          onClick={() => {
            setPlayMode('recorded');
            setSelectedVideo('tKIroxrTbG8');
          }}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            playMode === 'recorded' && activeVideoId === 'tKIroxrTbG8'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <Play size={13} fill="currentColor" /> Latest Sunday Service
        </button>

        <a
          href="https://www.youtube.com/@AnointingMinistries/live"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-amber-800 hover:text-amber-900 font-semibold underline flex items-center gap-1"
        >
          Open YouTube App / Site <ExternalLink size={13} />
        </a>
      </div>

      {/* Main Video Stream Player */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg my-3 border border-neutral-800">
        <iframe
          key={embedUrl}
          title="Anointing Ministries Worship Broadcast"
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      <div className="text-[11px] text-neutral-500 flex items-center justify-between gap-2 flex-wrap mb-2">
        <span>If playback doesn't start automatically, tap the play button in the player or open directly in YouTube.</span>
        <a 
          href="https://www.youtube.com/@AnointingMinistries/live" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-amber-800 font-medium hover:underline flex items-center gap-1"
        >
          Watch on @AnointingMinistries YouTube Live <ExternalLink size={12}/>
        </a>
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
            <span>Watch on YouTube Live</span> <ExternalLink size={14} />
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
              setMsg('Notifications are not supported in this browser. Live alerts appear in the app header.');
              return;
            }
            try {
              const permission = await Notification.requestPermission();
              setNotify(permission === 'granted');
              setMsg(permission === 'granted' ? 'Live alerts enabled! You will be notified when service starts.' : 'Permission was not granted.');
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
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Recorded Live Services & Sermons:
          </span>
          <span className="text-[11px] text-neutral-500">Tap any service to play</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {recentBroadcasts.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedVideo(b.id);
                setPlayMode('recorded');
              }}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                playMode === 'recorded' && activeVideoId === b.id
                  ? 'border-amber-600 bg-amber-50 shadow-sm font-semibold'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  {b.tag}
                </span>
                {playMode === 'recorded' && activeVideoId === b.id && (
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

      {/* Live Fellowship Prayer Notes Box */}
      <LivePrayerBox />

      <small className="block mt-4 text-[11px] text-neutral-500">
        Anointing Ministries Sanctuary · Madukkarai, Coimbatore · Streaming & Video Service
      </small>
    </section>
  );
}

function LivePrayerBox() {
  const [name, setName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [prayers, setPrayers] = useState<any[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'live_prayers'), orderBy('createdAt', 'desc'), limit(5));
      const unsub = onSnapshot(q, (snap) => {
        setPrayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    try {
      if (db) {
        await addDoc(collection(db, 'live_prayers'), {
          name: name.trim() || 'Fellow Worshipper',
          text: prayerText.trim(),
          createdAt: Date.now()
        });
      }
      setSent(true);
      setPrayerText('');
      setTimeout(() => setSent(false), 4000);
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-neutral-300">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4">
        <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2 mb-1">
          <MessageSquare size={16} className="text-amber-700" />
          Send a Prayer Request or Amen During Worship
        </h4>
        <p className="text-xs text-neutral-600 mb-3">
          Join hearts with the church family. Share your prayer point or praise report.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your Name (optional)"
            className="sm:w-1/3 text-xs px-3 py-2 border rounded bg-white"
          />
          <input
            required
            type="text"
            value={prayerText}
            onChange={e => setPrayerText(e.target.value)}
            placeholder="Your prayer point or 'Amen, praising God!'..."
            className="flex-1 text-xs px-3 py-2 border rounded bg-white"
          />
          <button
            type="submit"
            className="btn gold text-xs px-4 py-2 flex items-center justify-center gap-1.5"
          >
            <Send size={13} /> Send
          </button>
        </form>

        {sent && (
          <p className="text-xs text-green-700 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> Your prayer has been received. Our pastors and prayer team are standing with you!
          </p>
        )}

        {prayers.length > 0 && (
          <div className="mt-3 space-y-1.5 pt-2 border-t border-amber-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Recent Fellowship Prayers:</span>
            {prayers.map(p => (
              <div key={p.id} className="text-xs text-neutral-700 bg-white/80 p-2 rounded border border-amber-100 flex items-start justify-between gap-2">
                <span><b>{p.name}:</b> {p.text}</span>
                <span className="text-[10px] text-neutral-400 shrink-0">Just now</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function LivePage() {
  return (
    <section className="section live-page max-w-5xl mx-auto pt-32 pb-16">
      <div className="mb-6">
        <span className="eyebrow">TOGETHER IN HIS PRESENCE</span>
        <h1 className="text-3xl md:text-5xl font-serif mt-2 mb-3">
          Worship <em>with us live.</em>
        </h1>
        <p className="text-neutral-600 max-w-2xl text-sm md:text-base">
          Join our church family for praise, prophetic worship, and life-transforming messages with Pastor David Samson and Rev. Dr. Samson Edward.
        </p>
      </div>

      <LiveStatus />

      {/* Service Schedule Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <CalendarDays className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Sunday Services</h3>
          <p className="text-xs text-neutral-600 mt-1">Morning Worship: 9:00 AM IST</p>
          <p className="text-xs text-neutral-600">Evening Service: 6:30 PM IST</p>
          <small className="text-amber-800 font-medium block mt-2">Tamil & English Worship</small>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <Clock className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Weekly Gatherings</h3>
          <p className="text-xs text-neutral-600 mt-1">Sabbath Worship: Saturday 6:30 PM</p>
          <p className="text-xs text-neutral-600">Youth & Fasting Prayer: Wed 7:00 PM</p>
          <small className="text-amber-800 font-medium block mt-2">Sanctuary & Online Stream</small>
        </div>

        <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <MapPin className="text-amber-600 mb-2" size={24} />
          <h3 className="font-serif text-lg font-bold">Church Sanctuary</h3>
          <p className="text-xs text-neutral-600 mt-1">Anointing Ministries Church</p>
          <p className="text-xs text-neutral-600">Madukkarai, Coimbatore – 641105</p>
          <Link to="/contact" className="text-amber-800 font-medium text-xs underline block mt-2">Get Directions & Map →</Link>
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

  if (installed) return null;
  return (
    <div className="install-app">
      <div>
        <span className="eyebrow">INSTALL THE ANOINTING MINISTRIES APP</span>
        <h3>Worship on <em>every device.</em></h3>
        <p>Keep hymns, daily scripture, and live broadcasts within reach wherever you are.</p>
      </div>
      <div className="actions">
        <button className="btn gold" onClick={async () => {
          if (event) {
            event.prompt();
            const choice = await event.userChoice;
            if (choice.outcome === 'accepted') { setInstalled(true); setMsg('App installed successfully'); }
            setEvent(null);
          } else {
            setMsg('Use your browser’s “Add to Home Screen” or install icon in the address bar.');
          }
        }}><Download size={17}/> Install App</button>
        {msg && <p className="small muted install-help">{msg}</p>}
      </div>
    </div>
  );
}

export function ChurchGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const photos = [
    { name: 'congregation', title: 'Sunday Worship Sanctuary', subtitle: 'Anointing Ministries family gathering in worship' },
    { name: 'christmas-community', title: 'Christmas Rally Celebration', subtitle: 'Reaching children & families with God’s love' },
    { name: 'church-worship', title: 'Praise & Prophetic Ministry', subtitle: 'Experiencing the presence of the Holy Spirit' },
    { name: 'community', title: 'Fellowship & Outreach', subtitle: 'Serving Coimbatore & regional communities' },
    { name: 'anointing-logo', title: 'Ministry Seal', subtitle: 'Founded in faith, rooted in prayer' }
  ];

  return (
    <section className="section bg-white" id="gallery">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CHURCH LIFE & FELLOWSHIP</span>
          <h2 className="text-3xl font-serif">Moments of <em>Grace.</em></h2>
        </div>
        <Link to="/about" className="text-link">Learn our story →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((p, idx) => (
          <div 
            key={p.name}
            onClick={() => setSelectedPhoto(p)}
            className="group relative aspect-video sm:aspect-square overflow-hidden rounded-lg cursor-pointer bg-neutral-900 shadow-sm"
          >
            <img 
              src={`/images/${p.name}.jpg`} 
              alt={p.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-xs font-semibold text-amber-300">{p.title}</span>
              <small className="text-[11px] text-neutral-300 opacity-90 line-clamp-1">{p.subtitle}</small>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal-shade" onClick={() => setSelectedPhoto(null)}>
          <div className="modal max-w-2xl bg-neutral-900 text-white p-4 rounded-xl" onClick={e => e.stopPropagation()}>
            <button className="icon-btn absolute top-3 right-3 text-white" onClick={() => setSelectedPhoto(null)}>
              <X size={20} />
            </button>
            <img 
              src={`/images/${selectedPhoto.name}.jpg`} 
              alt={selectedPhoto.title} 
              className="w-full max-h-[70vh] object-contain rounded mb-3"
            />
            <h3 className="font-serif text-xl">{selectedPhoto.title}</h3>
            <p className="text-neutral-300 text-xs mt-1">{selectedPhoto.subtitle}</p>
          </div>
        </div>
      )}
    </section>
  );
}
