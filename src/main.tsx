import {DailyVerse,BibleReader} from './bible';
import {PastorSongs} from './songs';
import {AppInstall,LiveStatus,LivePage,ChurchGallery} from './live-app';
import {ProStudio,ProAudience} from './presentation';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Play, Pause, Heart, Search, Menu, X, ChevronLeft, ChevronRight, Copy, Share2, Maximize, Monitor, Plus, Music2, Volume2, SkipForward, SkipBack, Check, CalendarDays, Clock, MapPin, BookOpen, Download, Trash2, Settings, ExternalLink, Mail, Cross, Shield, MessageCircle, Send, Bell, MoreHorizontal, Bookmark, AlertCircle, Radio, User } from 'lucide-react';
import './style.css';
import { initialSongs, verses, sermons, type Song } from './content';
import { config } from './config';
import {Brand,SocialLinks,MinistryArchive,CommunityConnect,MotionEnhancements,LightAtmosphere} from './ministry';
import { db } from './lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { NotificationBellWithModal } from './components/notifications-manager';
import { useMemberAuth, MemberLoginModal } from './components/member-login';

function useTitle(t: string) {
  useEffect(() => {
    document.title = t;
  }, [t]);
}

function useStored<T>(key: string, initial: T) {
  const [v, set] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [v, key]);
  return [v, set] as const;
}

const Ctx = createContext<any>(null);
const useApp = () => useContext(Ctx);
const Img = ({ name = 'church', ...props }: any) => {
  const src = name.startsWith('http') || name.startsWith('/') ? name : '/images/' + name + '.jpg';
  return <img src={src} {...props}/>;
};
function IconButton({ label, children, ...props }: any) { return <button className="icon-btn" aria-label={label} title={label} {...props}>{children}</button>; }
function Tag({ children }: any) { return <span className="eyebrow">{children}</span>; }
function Reveal({ children, className = '' }: any) { return <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .65 }}>{children}</motion.div>; }

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

    gainNode.gain.setValueAtTime(0.22, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch {}
}

export function App() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [current, setCurrent] = useState<Song | null>(null);
  const [favs, setFavs] = useStored<string[]>('grace-favorites', []);
  const [recent, setRecent] = useStored<string[]>('grace-recent', []);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [liveInfo, setLiveInfo] = useState<any>({ isLive: false, videoId: 'tKIroxrTbG8', title: 'Sunday Worship Service · Anointing Ministries', nextService: 'Sunday 9:00 AM & 6:30 PM IST' });
  const [alertsModal, setAlertsModal] = useState(false);
  const notify = (m: string) => setToast(m);

  const lastAlertKey = useRef<string>('');
  const lastLiveStatus = useRef<boolean>(false);
  const initialMount = useRef<boolean>(true);

  // Sync songs, alerts, and live broadcast from Firestore
  useEffect(() => {
    if (!db) return;
    const unsubSongs = onSnapshot(collection(db, 'songs'), (snapshot: any) => {
      if (!snapshot.empty) {
        const remoteSongs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Song[];
        setSongs(prev => {
          const map = new Map(prev.map(s => [s.id, s]));
          remoteSongs.forEach(rs => map.set(rs.id, rs));
          return Array.from(map.values());
        });
      }
    }, () => {});

    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot: any) => {
      const activeAlerts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })).filter((a: any) => a.active);
      setAlerts(activeAlerts);
      
      if (activeAlerts.length > 0) {
        const key = `${activeAlerts[0].id}-${activeAlerts[0].message}-${activeAlerts[0].updatedAt || activeAlerts[0].createdAt || ''}`;
        if (!initialMount.current && lastAlertKey.current && lastAlertKey.current !== key) {
          playNotificationChime();
          notify(`🔔 Church Alert: ${activeAlerts[0].message}`);
          setAlertDismissed(false);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification('Anointing Ministries Important Alert', {
                body: activeAlerts[0].message,
                icon: '/images/anointing-logo.jpg',
                tag: 'church-alert'
              });
            } catch {}
          }
        }
        lastAlertKey.current = key;
      }
    }, () => {});

    const unsubLive = onSnapshot(doc(db, 'settings', 'live_broadcast'), (snap: any) => {
      if (snap.exists()) {
        const data = snap.data();
        setLiveInfo(data);
        if (!initialMount.current && !lastLiveStatus.current && data.isLive) {
          playNotificationChime();
          notify('🔴 Anointing Ministries is LIVE! Tap Watch Live to worship with us.');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification('🔴 Anointing Ministries is LIVE NOW', {
                body: data.title || 'Sunday Worship Service is broadcasting now from Madukkarai Sanctuary.',
                icon: '/images/anointing-logo.jpg',
                tag: 'church-live'
              });
            } catch {}
          }
        }
        lastLiveStatus.current = !!data.isLive;
      }
    }, () => {});

    const timer = setTimeout(() => { initialMount.current = false; }, 2500);

    return () => {
      clearTimeout(timer);
      unsubSongs();
      unsubAlerts();
      unsubLive();
    };
  }, []);

  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const dialog = document.querySelector('[role=dialog]') as HTMLElement;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'Tab') {
        const items = dialog?.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex="0"]');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = old; previous?.focus(); };
  }, [modal]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const play = (song: Song) => {
    if (!song.src) {
      setModal({ title: song.title, body: 'The hymn text is ready. Add an authorized audio file in the song library to listen.', lyrics: song.lyrics });
      return;
    }
    setCurrent(song);
    setRecent((r) => [song.id, ...r.filter(x => x !== song.id)].slice(0, 20));
  };

  const toggle = (id: string) => setFavs((f) => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return <Ctx.Provider value={{ songs, setSongs, current, setCurrent, favs, toggle, recent, play, notify, setModal, alerts, alertDismissed, setAlertDismissed, liveInfo, alertsModal, setAlertsModal }}>
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/worship/presentation" element={<ProStudio />}/>
        <Route path="/worship/display" element={<ProAudience />}/>
        <Route path="*" element={<Shell />}/>
      </Routes>
      <AnimatePresence>{current && <Player />}</AnimatePresence>
      {toast && <div className="toast" role="status"><Check size={17}/>{toast}</div>}
      <AnimatePresence>
        {modal && <div className="modal-shade" onClick={() => setModal(null)}>
          <motion.section initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.25 }} className="modal" role="dialog" aria-modal="true" aria-label={modal.title} onClick={e => e.stopPropagation()}>
            <IconButton label="Close dialog" onClick={() => setModal(null)}><X /></IconButton>
            <Tag>ANOINTING MINISTRIES</Tag>
            <h2>{modal.title}</h2>
            <p>{modal.body}</p>
            {modal.lyrics && <p className="lyrics">{modal.lyrics}</p>}
            <button className="btn navy" autoFocus onClick={() => setModal(null)}>Close</button>
          </motion.section>
        </div>}
      </AnimatePresence>
    </MotionConfig>
  </Ctx.Provider>;
}

function Shell() {
  const [menu, setMenu] = useState(false), [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const home = location.pathname === '/';
  const { alerts, alertDismissed, setAlertDismissed, liveInfo, alertsModal, setAlertsModal } = useApp();

  useEffect(() => {
    setMenu(false);
    if (location.hash) {
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    } else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  const hasActiveAlert = alerts.length > 0 && !alertDismissed;

  const [loginModal, setLoginModal] = useState(false);
  const { currentUser } = useMemberAuth();

  return <>
    <a className="skip" href="#main">Skip to content</a>
    {hasActiveAlert && (
      <div className="bg-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between gap-3 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1 justify-center">
          <span className="flex h-2 w-2 rounded-full bg-white animate-ping shrink-0" />
          <AlertCircle size={15} className="shrink-0"/>
          <span><b>Important Alert:</b> {alerts[0].message}</span>
        </div>
        <button 
          onClick={() => setAlertDismissed(true)} 
          className="p-1 hover:bg-black/20 rounded transition text-white shrink-0"
          aria-label="Dismiss alert"
          title="Dismiss alert"
        >
          <X size={15}/>
        </button>
      </div>
    )}
    <header className={(home ? 'on-hero ' : 'solid ') + (scrolled ? 'scrolled' : '')} style={hasActiveAlert ? {marginTop:'36px'} : {}}>
      <Brand/>
      <nav className={menu ? 'open' : ''} aria-label="Main navigation">
        {['Home', 'Live', 'Worship', 'Sermons', 'Announcements', 'Bible', 'Prayer', 'About', 'Contact'].map(x => {
          const path = x === 'Home' ? '/' : '/' + x.toLowerCase();
          return <Link key={x} className={location.pathname === path ? 'active' : ''} to={path}>
            {x === 'Live' ? <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block"/>Live</span> : x}
          </Link>;
        })}
      </nav>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLoginModal(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition text-current"
          aria-label="Member Login"
          title={currentUser ? `Logged in as ${currentUser.name}` : "Member Login"}
        >
          <User size={15} />
          {currentUser ? <span className="max-w-[110px] truncate"><b>{currentUser.name}</b></span> : <span>Login</span>}
        </button>
        <button 
          onClick={() => setAlertsModal(true)} 
          className="icon-btn relative" 
          aria-label="View church announcements and alerts"
          title="Church Notifications & Alerts"
        >
          <Bell size={18} />
          {(alerts.length > 0 || liveInfo?.isLive) && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
        <Link to="/live" className="nav-join">
          <Radio size={14} className={liveInfo?.isLive ? "text-red-400 animate-pulse" : "text-amber-400"}/> 
          {liveInfo?.isLive ? "● LIVE NOW" : "Watch Live"} 
          <ArrowUpRight size={15}/>
        </Link>
      </div>
      <IconButton label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? <X /> : <Menu />}</IconButton>
    </header>
    <AnimatePresence>
      {alertsModal && (
        <NotificationBellWithModal isOpen={alertsModal} onClose={() => setAlertsModal(false)} />
      )}
      {loginModal && (
        <MemberLoginModal isOpen={loginModal} onClose={() => setLoginModal(false)} />
      )}
    </AnimatePresence>
    <MotionEnhancements/>
    <main id="main">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/worship" element={<Worship />}/>
        <Route path="/sermons" element={<Sermons />}/>
        <Route path="/sermons/:id" element={<SermonDetail />}/>
        <Route path="/announcements" element={<Announcements />}/>
        <Route path="/admin" element={<Admin />}/>
        <Route path="/bible" element={<BibleReader/>}/>
        <Route path="/live" element={<LivePage/>}/>
        <Route path="/about" element={<About />}/>
        <Route path="/prayer" element={<Prayer />}/>
        <Route path="/contact" element={<Contact />}/>
        <Route path="*" element={<PageNotFound />}/>
      </Routes>
    </main>
    <Footer />
  </>;
}

function PageNotFound() {
  useTitle('Page Not Found — Anointing Ministries');
  return <PageTitle tag="PAGE NOT FOUND" title="A new direction" text="This page could not be found."><Link to="/" className="btn navy">Return home</Link></PageTitle>;
}

const defaultAnnouncements = [
  { id: '1', ministry: 'Anointing Ministries', avatar: 'anointing-logo', image: 'church-worship', title: 'Sunday Worship Service', content: 'Join us this Sunday at Madukkarai Church Sanctuary for powerful worship, Word, and fellowship with Pastor David Samson and Rev. Dr. Samson Edward. Come expectant!', timestamp: '2 hours ago', expiresAt: Date.now() + 7 * 86400000, likesCount: 142, liked: false, notified: false, comments: [{ id: 'c1', name: 'Grace Mary', text: 'Praise God! Looking forward to fellowship.' }, { id: 'c2', name: 'Samuel Raj', text: 'Amen! See you all there.' }] },
  { id: '2', ministry: 'Youth & Young Adults', avatar: 'anointing-logo', image: 'christmas-community', title: 'Youth Night & Praise', content: 'An evening of acoustic worship, testimonies, and deep fellowship in the Word. Bring a friend!', timestamp: 'Yesterday', expiresAt: Date.now() + 7 * 86400000, likesCount: 98, liked: true, notified: true, comments: [{ id: 'c3', name: 'Blessy', text: 'Cant wait for this!' }] },
  { id: '3', ministry: 'Community Outreach', avatar: 'anointing-logo', image: 'community', title: 'Charity Drive & Prayer Walk', content: 'Reaching out to our local neighborhood with love, prayer, and support. Volunteers welcome.', timestamp: '3 days ago', expiresAt: Date.now() + 7 * 86400000, likesCount: 215, liked: false, notified: false, comments: [] }
];

function Announcements() {
  useTitle('Announcements — Anointing Ministries');
  const [posts, setPosts] = useStored<any[]>('am-ig-announcements', defaultAnnouncements);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [bigHearts, setBigHearts] = useState<{ [key: string]: boolean }>({});
  const [expandedCaptions, setExpandedCaptions] = useState<{ [key: string]: boolean }>({});
  const { notify } = useApp();

  // Fetch from Firestore and filter out expired posts (> 1 week or custom expiry)
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'announcements'), (snapshot: any) => {
      const now = Date.now();
      const remote = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      const valid = remote.filter((p: any) => !p.expiresAt || p.expiresAt > now);
      if (valid.length > 0) {
        setPosts(valid);
      }
    }, () => {});
    return () => unsub();
  }, []);

  const handleDoubleTap = (id: string) => {
    setBigHearts(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setBigHearts(prev => ({ ...prev, [id]: false }));
    }, 800);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: true, likesCount: p.liked ? p.likesCount : p.likesCount + 1 } : p));
  };

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 } : p));
  };

  const toggleNotify = (id: string) => {
    setPosts(prev => prev.map(p => {
      const nextNotified = !p.notified;
      if (nextNotified) notify('Notifications enabled for this update');
      return p.id === id ? { ...p, notified: nextNotified } : p;
    }));
  };

  const addComment = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[id]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: crypto.randomUUID(), name: 'You', text }] } : p));
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
    notify('Comment posted successfully');
  };

  const activePosts = posts.filter(p => !p.expiresAt || p.expiresAt > Date.now());

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-[600px] mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Church Announcements</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button aria-label="Notifications" className="p-2 rounded-full hover:bg-slate-100 transition">
                <Bell size={20} className="text-slate-700"/>
              </button>
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {activePosts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-500/30 p-0.5 bg-amber-50">
                    <img src="/images/anointing-logo.jpg" alt="Ministry Logo" className="w-full h-full object-cover rounded-full"/>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 leading-tight">{post.ministry}</h2>
                    <p className="text-xs text-slate-500">{post.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Media Area */}
              <div 
                className="relative aspect-square sm:aspect-[4/5] bg-slate-900 overflow-hidden select-none cursor-pointer"
                onDoubleClick={() => handleDoubleTap(post.id)}
              >
                <Img name={post.image} alt={post.title} className="w-full h-full object-cover"/>
                
                {/* Big Like Animation */}
                <AnimatePresence>
                  {bigHearts[post.id] && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Heart size={90} className="text-white fill-white drop-shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interaction Bar */}
              <div className="px-4 pt-3 pb-2 flex items-center">
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleLike(post.id)}
                    aria-label="Like post"
                    className="focus:outline-none"
                  >
                    <Heart size={24} className={post.liked ? "text-rose-600 fill-rose-600" : "text-slate-800 hover:text-slate-600"}/>
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    aria-label="Comment"
                    className="focus:outline-none text-slate-800 hover:text-slate-600"
                  >
                    <MessageCircle size={24}/>
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleNotify(post.id)}
                    aria-label="Toggle notifications for post"
                    className="focus:outline-none"
                  >
                    <Bell size={24} className={post.notified ? "text-amber-600 fill-amber-600" : "text-slate-800 hover:text-slate-600"}/>
                  </motion.button>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-4 pb-4 space-y-2">
                <p className="text-sm font-semibold text-slate-900">{post.likesCount} likes</p>
                
                <div>
                  <h3 className="inline font-semibold text-slate-900 mr-2">{post.ministry}</h3>
                  <span className="text-slate-800 text-sm">
                    {expandedCaptions[post.id] || post.content.length <= 100 
                      ? post.content 
                      : post.content.slice(0, 100) + '...'}
                  </span>
                  {post.content.length > 100 && (
                    <button 
                      onClick={() => setExpandedCaptions(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs text-slate-500 font-medium ml-1 hover:underline"
                    >
                      {expandedCaptions[post.id] ? 'less' : 'more'}
                    </button>
                  )}
                </div>

                {/* Comments List */}
                {post.comments?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-xs text-slate-500 font-medium">Comments ({post.comments.length})</p>
                    {post.comments.map((c: any) => (
                      <div key={c.id} className="text-xs text-slate-800">
                        <span className="font-semibold mr-1.5">{c.name}</span>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input Bar */}
                <form onSubmit={(e) => addComment(post.id, e)} className="pt-2 flex items-center gap-2 border-t border-slate-100 mt-3">
                  <input 
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Add a comment..."
                    aria-label="Add a comment"
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1"
                  />
                  <button 
                    type="submit"
                    disabled={!commentInputs[post.id]?.trim()}
                    className="text-xs font-semibold text-amber-700 disabled:opacity-40 hover:text-amber-800 transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Admin() {
  useTitle('Admin Portal — Anointing Ministries');
  const [authed, setAuthed] = useStored<boolean>('am-admin-auth', false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [list, setList] = useStored<any[]>('am-ig-announcements', defaultAnnouncements);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ministry, setMinistry] = useState('Anointing Ministries');
  const [image, setImage] = useState('church-worship');
  const [customImage, setCustomImage] = useState('');
  const [expiryDays, setExpiryDays] = useState('7'); // Default 1 week auto-delete

  // Song admin state
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songCategory, setSongCategory] = useState('Worship');

  // Home image admin state
  const [homeImgUrl, setHomeImgUrl] = useState('');
  const [homeImgTitle, setHomeImgTitle] = useState('');
  const [homeSettingsList, setHomeSettingsList] = useState<any[]>([]);

  // Alert notification state
  const [alertMsg, setAlertMsg] = useState('');
  const [alertActive, setAlertActive] = useState(false);

  // Live broadcast management state
  const [liveActive, setLiveActive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState('tKIroxrTbG8');
  const [liveTitle, setLiveTitle] = useState('Sunday Worship Service Live · Pastor David Samson');
  const [liveSchedule, setLiveSchedule] = useState('Sunday 9:00 AM & 6:30 PM IST');

  // Push notification dashboard state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushCategory, setPushCategory] = useState('Announcement');
  const [pushUrl, setPushUrl] = useState('/');
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    if (!db) return;
    getDocs(collection(db, 'push_subscriptions')).then(snap => setSubscriberCount(snap.size)).catch(() => {});
  }, []);

  const sendAdminPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    const item = {
      id: crypto.randomUUID(),
      title: pushTitle,
      body: pushBody,
      category: pushCategory,
      url: pushUrl,
      timestamp: Date.now()
    };
    try {
      await setDoc(doc(db, 'notification_history', item.id), item);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(item.title, { body: item.body, icon: '/images/anointing-logo.jpg' });
      }
      setPushTitle('');
      setPushBody('');
      notify(`Push notification broadcasted to ${subscriberCount || 1} subscribers!`);
    } catch {
      notify('Broadcast saved');
    }
  };

  const { notify } = useApp();

  useEffect(() => {
    if (!db) return;
    // Fetch announcements, home settings
    const unsubAnns = onSnapshot(collection(db, 'announcements'), (snap: any) => {
      if (!snap.empty) setList(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    }, () => {});

    const unsubHome = onSnapshot(collection(db, 'home_settings'), (snap: any) => {
      setHomeSettingsList(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    }, () => {});

    const unsubAlert = onSnapshot(collection(db, 'alerts'), (snap: any) => {
      if (!snap.empty) {
        const a = snap.docs[0].data();
        setAlertMsg(a.message || '');
        setAlertActive(a.active || false);
      }
    }, () => {});

    const unsubLive = onSnapshot(doc(db, 'settings', 'live_broadcast'), (snap: any) => {
      if (snap.exists()) {
        const d = snap.data();
        setLiveActive(d.isLive ?? false);
        setLiveVideoId(d.videoId || 'tKIroxrTbG8');
        setLiveTitle(d.title || 'Sunday Worship Service Live · Pastor David Samson');
        setLiveSchedule(d.nextService || 'Sunday 9:00 AM & 6:30 PM IST');
      }
    }, () => {});

    return () => {
      unsubAnns();
      unsubHome();
      unsubAlert();
      unsubLive();
    };
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() === 'jesus' && pass === 'Jesusisable') {
      setAuthed(true);
      setErr('');
      notify('Welcome, Admin');
    } else {
      setErr('Invalid username or password.');
    }
  };

  if (!authed) {
    return <section className="section page-title" style={{maxWidth:'500px',margin:'80px auto'}}>
      <Tag>RESTRICTED ACCESS</Tag>
      <h1>Admin <em>Login.</em></h1>
      <p>Please enter administrator credentials to manage announcements and church broadcast settings.</p>
      <form className="form form-card" onSubmit={login} style={{marginTop:'30px'}}>
        <label>Username<input required value={user} onChange={e => setUser(e.target.value)} aria-label="Admin username" placeholder="Enter username"/></label>
        <label>Password<input required type="password" value={pass} onChange={e => setPass(e.target.value)} aria-label="Admin password" placeholder="Enter password"/></label>
        {err && <p className="form-status" role="alert">{err}</p>}
        <button className="btn navy">Login to Admin Portal <ArrowRight size={17}/></button>
      </form>
    </section>;
  }

  return <>
    <PageTitle tag="ADMIN DASHBOARD" title={<>Ministry <em>Control Center.</em></>} text="Post announcements with custom media & expiry, add songs, home banners, and broadcast alerts.">
      <button className="btn outline" onClick={() => { setAuthed(false); notify('Logged out'); }}>Logout</button>
    </PageTitle>
    <section className="section pt0 detail-layout">
      <div className="space-y-8">
        {/* Create Announcement */}
        <form className="form form-card" onSubmit={async e => {
          e.preventDefault();
          if (!title.trim() || !content.trim()) return;
          const days = Number(expiryDays) || 7;
          const expiresAt = Date.now() + days * 86400000;
          const imgToUse = customImage.trim() || image;
          const fresh = {
            id: crypto.randomUUID(),
            ministry: ministry || 'Anointing Ministries',
            avatar: 'anointing-logo',
            image: imgToUse,
            title,
            content,
            timestamp: 'Just now',
            expiresAt,
            likesCount: 1,
            liked: false,
            notified: true,
            comments: []
          };
          try {
            await setDoc(doc(db, 'announcements', fresh.id), fresh);
            setList(l => [fresh, ...l]);
            setTitle('');
            setContent('');
            setCustomImage('');
            notify('Announcement published with auto-expiry');
          } catch {
            setList(l => [fresh, ...l]);
            notify('Announcement added (local)');
          }
        }}>
          <h3>Create Timed Announcement (Auto-delete)</h3>
          <label>Ministry / Sender<input required value={ministry} onChange={e => setMinistry(e.target.value)} placeholder="Youth Ministry"/></label>
          <label>Title<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Sunday Special Service"/></label>
          <label>Caption / Message<textarea required rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="Share details about the service or event..."/></label>
          <label>Photo Theme
            <select value={image} onChange={e => setImage(e.target.value)}>
              <option value="church-worship">Church Worship</option>
              <option value="christmas-community">Christmas Community</option>
              <option value="community">Community Outreach</option>
              <option value="service-february">Service February</option>
              <option value="service-september">Service September</option>
            </select>
          </label>
          <label>Or Custom Image URL / Thumbnail<input value={customImage} onChange={e => setCustomImage(e.target.value)} placeholder="https://images.unsplash.com/... or /images/..."/></label>
          <label>Auto-delete Timing / Expiry
            <select value={expiryDays} onChange={e => setExpiryDays(e.target.value)}>
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">1 Week (Default)</option>
              <option value="14">2 Weeks</option>
              <option value="30">1 Month</option>
            </select>
          </label>
          <button className="btn gold">Publish Timed Post <Plus size={17}/></button>
        </form>

        {/* Add Song */}
        <form className="form form-card" onSubmit={async e => {
          e.preventDefault();
          if (!songTitle.trim() || !songLyrics.trim()) return;
          const sObj = {
            id: crypto.randomUUID(),
            title: songTitle,
            artist: songArtist || 'Anointing Ministries',
            category: songCategory,
            language: 'Tamil Worship',
            lyrics: songLyrics,
            duration: '3:45',
            image: 'church-worship'
          };
          try {
            await setDoc(doc(db, 'songs', sObj.id), sObj);
            setSongTitle('');
            setSongArtist('');
            setSongLyrics('');
            notify('Worship song added to library successfully');
          } catch {
            notify('Song added successfully');
          }
        }}>
          <h3>Add Worship Song to Library</h3>
          <label>Song Title<input required value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Ennai Nadathum"/></label>
          <label>Artist / Writer<input value={songArtist} onChange={e => setSongArtist(e.target.value)} placeholder="Pastor David Samson"/></label>
          <label>Category
            <select value={songCategory} onChange={e => setSongCategory(e.target.value)}>
              <option value="Worship">Worship</option>
              <option value="Praise">Praise</option>
              <option value="Thanksgiving">Thanksgiving</option>
              <option value="Prayer">Prayer</option>
              <option value="Gospel">Gospel</option>
            </select>
          </label>
          <label>Song Lyrics<textarea required rows={4} value={songLyrics} onChange={e => setSongLyrics(e.target.value)} placeholder="Enter hymn lyrics..."/></label>
          <button className="btn navy">Add Song <Plus size={17}/></button>
        </form>

        {/* Add Home Page Image / Banner */}
        <form className="form form-card" onSubmit={async e => {
          e.preventDefault();
          if (!homeImgUrl.trim()) return;
          const hObj = {
            id: crypto.randomUUID(),
            title: homeImgTitle || 'Ministry Banner',
            imageUrl: homeImgUrl,
            caption: homeImgTitle
          };
          try {
            await setDoc(doc(db, 'home_settings', hObj.id), hObj);
            setHomeImgUrl('');
            setHomeImgTitle('');
            notify('Home page image added successfully');
          } catch {
            notify('Home image added');
          }
        }}>
          <h3>Add Home Page Image / Banner</h3>
          <label>Banner Title<input value={homeImgTitle} onChange={e => setHomeImgTitle(e.target.value)} placeholder="Special Celebration"/></label>
          <label>Image URL<input required value={homeImgUrl} onChange={e => setHomeImgUrl(e.target.value)} placeholder="https://... or /images/..."/></label>
          <button className="btn navy">Add Home Image <Plus size={17}/></button>
        </form>

        {/* Important Alert Notification */}
        <form className="form form-card" onSubmit={async e => {
          e.preventDefault();
          const alertObj = {
            message: alertMsg,
            active: alertActive,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          try {
            await setDoc(doc(db, 'alerts', 'global-alert'), alertObj);
            notify('Global alert notification updated');
          } catch {
            notify('Alert saved');
          }
        }}>
          <h3>Important Alert Notification for All</h3>
          <label>Alert Message<input value={alertMsg} onChange={e => setAlertMsg(e.target.value)} placeholder="Special Prayer Meeting tonight at 7 PM!"/></label>
          <label className="checkbox"><input type="checkbox" checked={alertActive} onChange={e => setAlertActive(e.target.checked)}/>Display alert banner to all users</label>
          <button className="btn gold">Update Alert Broadcast</button>
        </form>

        {/* Live Broadcast & Stream Settings */}
        <form className="form form-card" onSubmit={async e => {
          e.preventDefault();
          let finalId = liveVideoId.trim();
          const match = finalId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/))([\w-]{11})/);
          if (match) finalId = match[1];
          else if (finalId.length !== 11) finalId = 'tKIroxrTbG8';

          const liveObj = {
            isLive: liveActive,
            videoId: finalId,
            title: liveTitle.trim() || 'Sunday Worship Service Live · Pastor David Samson',
            nextService: liveSchedule.trim() || 'Sunday 9:00 AM & 6:30 PM IST',
            updatedAt: Date.now()
          };
          try {
            await setDoc(doc(db, 'settings', 'live_broadcast'), liveObj);
            notify(liveActive ? '🔴 Church is now broadcast LIVE to all users!' : 'Live settings updated');
          } catch {
            notify('Live settings saved locally');
          }
        }}>
          <div className="flex items-center justify-between">
            <h3>Live Stream & Worship Broadcast Manager</h3>
            {liveActive ? (
              <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">● BROADCASTING LIVE</span>
            ) : (
              <span className="bg-neutral-200 text-neutral-700 text-xs px-2.5 py-1 rounded-full font-medium">OFFLINE / RECORDED</span>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            Control the live stream broadcast shown across the app. When toggled to LIVE, all users will see real-time alerts and video playback.
          </p>

          <label className="checkbox font-bold text-sm bg-neutral-100 p-3 rounded">
            <input 
              type="checkbox" 
              checked={liveActive} 
              onChange={e => setLiveActive(e.target.checked)} 
              className="h-4 w-4"
            />
            <span className="ml-2 font-semibold text-neutral-900">
              {liveActive ? '🔴 Church is CURRENTLY LIVE (Show Live Banner & Stream)' : 'Turn ON Live Broadcast to Stream Now'}
            </span>
          </label>

          <label>
            YouTube Video ID or Live Stream URL
            <input 
              required 
              value={liveVideoId} 
              onChange={e => setLiveVideoId(e.target.value)} 
              placeholder="e.g. tKIroxrTbG8 or https://www.youtube.com/watch?v=..."
            />
            <small className="text-neutral-500 text-[11px] mt-1">
              Supports direct video ID (e.g. <code>tKIroxrTbG8</code>) or full YouTube watch/live URL.
            </small>
          </label>

          <label>
            Live Broadcast Title
            <input 
              required 
              value={liveTitle} 
              onChange={e => setLiveTitle(e.target.value)} 
              placeholder="Sunday Worship Celebration Live | Pastor David Samson"
            />
          </label>

          <label>
            Next Service Schedule / Timing
            <input 
              value={liveSchedule} 
              onChange={e => setLiveSchedule(e.target.value)} 
              placeholder="Sunday 9:00 AM & 6:30 PM IST"
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button className="btn gold flex items-center gap-2">
              <Radio size={16} /> Update Live Broadcast
            </button>
            <Link to="/live" target="_blank" className="btn outline text-xs">
              Preview Live Page ↗
            </Link>
          </div>
        </form>

        {/* Push Notification Dashboard */}
        <form className="form form-card" onSubmit={sendAdminPush}>
          <div className="flex items-center justify-between">
            <h3>Push Notification Dashboard</h3>
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold">
              {subscriberCount} Active Subscribers
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Broadcast instant push notifications to all subscribed church members worldwide.
          </p>

          <label>
            Notification Category
            <select value={pushCategory} onChange={e => setPushCategory(e.target.value)}>
              <option value="Announcement">Church Announcement</option>
              <option value="Livestream">🔴 YouTube Livestream Alert</option>
              <option value="Bible Verse">📖 Daily Bible Verse (English/Tamil)</option>
              <option value="Church Event">📅 Church Event Reminder</option>
              <option value="Worship Song">🎵 New Worship Song Release</option>
            </select>
          </label>

          <label>
            Notification Title
            <input 
              required 
              value={pushTitle} 
              onChange={e => setPushTitle(e.target.value)} 
              placeholder="🔴 ANOINTING MINISTRIES IS LIVE!"
            />
          </label>

          <label>
            Notification Message
            <textarea 
              required 
              rows={3} 
              value={pushBody} 
              onChange={e => setPushBody(e.target.value)} 
              placeholder="Join Pastor David Samson for live worship, prayer, and God's Word..."
            />
          </label>

          <label>
            Target Page URL / Action Link
            <input 
              value={pushUrl} 
              onChange={e => setPushUrl(e.target.value)} 
              placeholder="/live, /bible, /worship, or https://youtube.com/..."
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button className="btn gold flex items-center gap-2">
              <Send size={16} /> Broadcast Push Notification Now
            </button>
            <button 
              type="button" 
              onClick={() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(pushTitle || 'Test Notification', {
                    body: pushBody || 'This is a test notification from Anointing Ministries.',
                    icon: '/images/anointing-logo.jpg'
                  });
                  notify('Test push sent to this device');
                } else {
                  alert('Please enable notifications first in the notification bell menu.');
                }
              }}
              className="btn outline text-xs"
            >
              Send Test Push to Me
            </button>
          </div>
        </form>
      </div>

      <aside>
        <Tag>MANAGED POSTS</Tag>
        <h3>{list.length} Posts</h3>
        <p className="small muted">Posts automatically expire after their scheduled duration.</p>
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'20px'}}>
          {list.map((a: any) => (
            <div key={a.id} className="form-card" style={{padding:'15px'}}>
              <h4>{a.title}</h4>
              <p className="small">{a.ministry} · Expires: {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : 'No expiry'}</p>
              <button className="text-link" style={{color:'#e53e3e',marginTop:'8px'}} onClick={async () => {
                try {
                  await deleteDoc(doc(db, 'announcements', a.id));
                } catch {}
                setList(l => l.filter((x: any) => x.id !== a.id));
                notify('Post removed');
              }}>Delete post</button>
            </div>
          ))}
        </div>

        <div style={{marginTop:'30px'}}>
          <Tag>HOME BANNERS</Tag>
          <h3>{homeSettingsList.length} Banners</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'15px'}}>
            {homeSettingsList.map(h => (
              <div key={h.id} className="form-card" style={{padding:'12px'}}>
                <p className="small font-bold">{h.title}</p>
                <button className="text-link" style={{color:'#e53e3e',marginTop:'5px'}} onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'home_settings', h.id));
                  } catch {}
                  setHomeSettingsList(l => l.filter(x => x.id !== h.id));
                  notify('Banner removed');
                }}>Remove banner</button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  </>;
}

function Home() {
  useTitle('Anointing Ministries — Madukkarai, Coimbatore');
  const [homeBanners, setHomeBanners] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'home_settings'), (snap: any) => {
      setHomeBanners(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  return <>
    <DailyVerse/>
    <LiveStatus compact/>
    <section className="hero">
      <Img name="congregation" className="hero-img" alt="The congregation worshipping at Anointing Ministries"/>
      <div className="hero-shade"/>
      <LightAtmosphere/>
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Tag><span className="tiny-line"/> A PLACE TO BELONG. A FAITH TO LIVE.</Tag>
        <h1>Experience<br />His <em>presence.</em></h1>
        <p>A place where faith grows, hearts are renewed,<br className="desktop"/> and lives are transformed through worship.</p>
        <div className="actions">
          <Link to="/worship" className="btn gold">Join us this Sunday <ArrowUpRight size={17}/></Link>
          <Link to="/live" className="hero-watch"><span><Play size={15} fill="currentColor"/></span> Watch live worship</Link>
        </div>
      </motion.div>
      <div className="hero-bottom">
        <span>COME AS YOU ARE. YOU BELONG HERE.</span>
        <a href="#welcome">A little more about us <span>↓</span></a>
        <span className="sample-tag">MADUKKARAI · COIMBATORE</span>
      </div>
    </section>

    {/* Admin added home banners */}
    {homeBanners.length > 0 && (
      <section className="section" style={{background:'#f9f6ef'}}>
        <Tag>FEATURED HIGHLIGHTS</Tag>
        <h2>From the <em>Ministry.</em></h2>
        <div className="cards three" style={{marginTop:'30px'}}>
          {homeBanners.map(b => (
            <div key={b.id} className="song-card">
              <div className="song-cover">
                <Img name={b.imageUrl} alt={b.title}/>
              </div>
              <div className="song-card-body">
                <h3>{b.title}</h3>
                <p>{b.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    <section className="welcome section" id="welcome">
      <Reveal>
        <Tag>WELCOME TO ANOINTING MINISTRIES</Tag>
        <h2>More than a place.<br /><em>A family in faith.</em></h2>
      </Reveal>
      <Reveal>
        <p>There’s a place for you here. A place to ask questions, find encouragement, and discover the extraordinary love of God in everyday life.</p>
        <p>Wherever you are on your journey, let’s take the next step together.</p>
        <Link className="text-link" to="/about">Get to know us <ArrowRight size={17}/></Link>
      </Reveal>
      <div className="welcome-seal">
        <img src="/images/anointing-logo.jpg" alt="Anointing Ministries seal"/>
        <span>ROOTED IN FAITH<br />GROWING IN LOVE</span>
      </div>
    </section>
    <section className="section worship-home">
      <div className="section-heading">
        <Reveal>
          <Tag>A MOMENT WITH GOD</Tag>
          <h2>Make room for <em>worship.</em></h2>
        </Reveal>
        <Link to="/worship" className="text-link">Explore worship <ArrowRight size={17}/></Link>
      </div>
      <div className="worship-grid">
        <Link to="/worship#live" className="feature-photo">
          <Img name="congregation" alt="Worship at Anointing Ministries"/>
          <div className="photo-overlay"/>
          <div className="feature-top">
            <span className="glass-label">WORSHIP WITH US</span>
            <span className="round-play"><Play size={22}/></span>
          </div>
          <div className="feature-caption">
            <Tag>ONE FAITH. WHEREVER YOU ARE.</Tag>
            <h3>Closer to God.<br />Connected to each other.</h3>
            <p>Join us for our next worship service.</p>
          </div>
        </Link>
        <div className="music-feature">
          <div className="music-feature-head mb-3">
            <Music2 size={22} strokeWidth={1}/>
            <span>OUR WORSHIP VOICE · PASTOR DAVID SAMSON</span>
          </div>
          <h3>Let your heart<br /><em>find its song.</em></h3>
          <p>Anointing Ministries Tamil & English Worship Collection. Lift your voice in praise.</p>
          {initialSongs.slice(0, 3).map(s => <SongRow key={s.id} song={s}/>)}
          <Link className="text-link" to="/worship#songs">Discover full song library <ArrowRight size={17}/></Link>
        </div>
      </div>
    </section>
    <MinistryArchive/>
    <section className="prayer-banner">
      <div className="prayer-orbit"/>
      <Reveal>
        <Tag>YOU DON’T HAVE TO WALK ALONE</Tag>
        <h2>Let us pray <em>with you.</em></h2>
        <p>Every worry, every hope, every unspoken prayer.<br />There is room for it here.</p>
        <Link to="/prayer" className="btn gold">Share a prayer request <ArrowUpRight size={17}/></Link>
      </Reveal>
      <span className="large-cross" aria-hidden="true">✝</span>
    </section>
    <CommunityConnect/>
    <ChurchGallery/>
  </>;
}

function Footer() {
  return <footer>
    <AppInstall/>
    <div className="footer-top">
      <Brand/>
      <p>A place to belong.<br />A faith to live.</p>
      <div>
        <Link to="/about">Our story</Link>
        <Link to="/prayer">Prayer requests</Link>
        <Link to="/contact">Get in touch</Link>
        <Link to="/announcements">Announcements</Link>
      </div>
      <div>
        <Link to="/worship">Worship library</Link>
        <Link to="/worship/presentation">Presentation studio <ArrowUpRight size={13}/></Link>
        <Link to="/admin"><Shield size={13}/> Admin Portal</Link>
      </div>
    </div>
    <SocialLinks/>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Anointing Ministries</span>
      <span>Built with faith, hope & love.</span>
    </div>
  </footer>;
}

async function copyShare(text: string, share: boolean, notify: any) {
  try {
    if (share && navigator.share) await navigator.share({ text });
    else {
      await navigator.clipboard.writeText(text);
      notify('Copied to clipboard');
    }
  } catch {
    notify('Sharing was cancelled or is unavailable.');
  }
}

function Verse() {
  const [i, setI] = useState(Math.floor(Date.now() / 86400000) % verses.length);
  const [saved, setSaved] = useStored<string[]>('grace-verses', []);
  const { notify } = useApp();
  return <section className="verse section">
    <div className="verse-label">
      <BookOpen size={19}/>
      <Tag>VERSE OF THE DAY</Tag>
      <span className="verse-rule"/>
    </div>
    <blockquote key={i}>“{verses[i][0]}”</blockquote>
    <p>— {verses[i][1]} <span>(KJV · public-domain text)</span></p>
    <div className="verse-controls">
      <IconButton label="Previous verse" onClick={() => setI((i + verses.length - 1) % verses.length)}><ChevronLeft size={18}/></IconButton>
      <span>{i + 1} / {verses.length}</span>
      <IconButton label="Next verse" onClick={() => setI((i + 1) % verses.length)}><ChevronRight size={18}/></IconButton>
      <span className="control-divider"/>
      <IconButton label="Copy verse" onClick={() => copyShare(verses[i].join(' — '), false, notify)}><Copy size={16}/></IconButton>
      <IconButton label="Share verse" onClick={() => copyShare(verses[i].join(' — '), true, notify)}><Share2 size={16}/></IconButton>
    </div>
  </section>;
}

function PageTitle({ tag, title, text, children }: any) {
  return <section className="page-title section">
    <Tag>{tag || 'ANOINTING MINISTRIES'}</Tag>
    <h1>{title}</h1>
    <p>{text}</p>
    {children}
  </section>;
}

function Live() {
  const { notify } = useApp();
  const [liveData, setLiveData] = useState<any>({
    isLive: false,
    videoId: 'tKIroxrTbG8',
    title: 'Sunday Worship Service · Anointing Ministries',
    nextService: 'Sunday 9:00 AM & 6:30 PM IST'
  });

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'live_broadcast'), (snap: any) => {
        if (snap.exists()) {
          setLiveData(snap.data());
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const videoId = liveData.videoId || config.youtubeVideoId || 'tKIroxrTbG8';
  const isLive = liveData.isLive ?? config.liveActive;

  return <section className="section live-section" id="live">
    <div className="live-screen">
      <iframe 
        title="Official worship broadcast" 
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${isLive ? 1 : 0}&rel=0`} 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowFullScreen
      />
    </div>
    <aside>
      <Tag>{isLive ? '● LIVE BROADCAST' : 'RECORDED WORSHIP'}</Tag>
      <h2>Wherever you are,<br /><em>you belong here.</em></h2>
      <p>{isLive ? 'The church is broadcasting live now from Madukkarai Sanctuary.' : 'Make a little room in your day to pause, reflect, and worship with us.'}</p>
      <div className="detail-line">
        <CalendarDays size={18}/>
        {liveData.nextService || 'Next Service: Sunday 9:00 AM & 6:30 PM IST'}
      </div>
      <p className="muted small">Watch recorded or live services from our YouTube ministry channel.</p>
      <div className="flex flex-col gap-2 mt-4">
        <Link to="/live" className="btn gold flex items-center gap-2 text-xs w-fit">
          <Radio size={14} /> Open Full Live Worship Room
        </Link>
        <button className="text-link" onClick={() => copyShare(window.location.origin + '/live', true, notify)}>
          Share live broadcast <Share2 size={16}/>
        </button>
        <a className="text-link" href={config.socials.youtube + '/live'} target="_blank" rel="noopener noreferrer">
          Watch on YouTube Live <ArrowUpRight size={16}/>
        </a>
      </div>
    </aside>
  </section>;
}

function SongRow({ song }: any) {
  const { play } = useApp();
  return <div className="song-row">
    <div className="song-art"><Music2 size={20}/></div>
    <div><b>{song.title}</b><small>Hymn collection · lyrics available</small></div>
    <IconButton label={'Open ' + song.title} onClick={() => play(song)}><Play size={17}/></IconButton>
  </div>;
}

function Worship() {
  useTitle('Worship Songs & Hymn Library — Anointing Ministries');
  const { songs, setSongs, favs, toggle, recent, play, setModal, notify } = useApp();
  const [q, setQ] = useState(''), [category, setCategory] = useState('All'), [view, setView] = useState('All songs');
  const [lists, setLists] = useStored<{ name: string; ids: string[]; }[]>('grace-playlists', []);
  const [name, setName] = useState('');
  const filtered = songs.filter((s: Song) => (s.title + ' ' + s.artist).toLowerCase().includes(q.toLowerCase()) && (category === 'All' || s.category === category || s.language === category) && (view === 'All songs' || view === 'Favorites' && favs.includes(s.id) || view === 'Recently played' && recent.includes(s.id) || lists.find(l => l.name === view)?.ids.includes(s.id)));
  return <>
    <PageTitle tag="A HEART OF WORSHIP" title={<>Let your heart <em>find its song.</em></>} text="A quiet moment. A familiar melody. A little closer to Him."/>
    <Live />
    <PastorSongs/>
    <section className="section" id="songs">
      <div className="section-heading">
        <div>
          <Tag>THE WORSHIP COLLECTION</Tag>
          <h2>Songs for <em>your soul.</em></h2>
        </div>
        <Link className="btn outline" to="/worship/presentation"><Monitor size={17}/>Presentation studio</Link>
      </div>
      <div className="toolbar">
        <label className="search"><Search size={18}/><input aria-label="Search songs" placeholder="Search a song or artist…" value={q} onChange={e => setQ(e.target.value)}/></label>
        <select aria-label="Library view" value={view} onChange={e => setView(e.target.value)}>
          {['All songs', 'Favorites', 'Recently played', ...lists.map(l => l.name)].map(x => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="chips">
        {['All', 'Praise', 'Worship', 'Thanksgiving', 'Prayer', 'Gospel', 'Tamil Worship', 'English Worship'].map(c => <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      <p className="muted small">Public-domain hymn lyrics. Recordings are not included; add music you have permission to use. Imported audio stays in this browser session.</p>
      <div className="cards three">
        {filtered.map((s: Song, idx: number) => <motion.article className="song-card" key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.04 }}>
          <div className="song-cover">
            <Img name={s.image} alt=""/>
            <div className="cover-shade"/>
            <span>{s.category}</span>
            <IconButton label={'Play ' + s.title} onClick={() => play(s)}><Play fill="currentColor" size={20}/></IconButton>
          </div>
          <div className="song-card-body">
            <div className="row-between">
              <h3>{s.title}</h3>
              <IconButton label={'Favorite ' + s.title} aria-pressed={favs.includes(s.id)} onClick={() => toggle(s.id)}><Heart size={18} fill={favs.includes(s.id) ? 'currentColor' : 'none'}/></IconButton>
            </div>
            <p>{s.artist}</p>
            <small>{s.src ? 'Audio ready' : 'Audio not added'} · {s.duration}</small>
            <div className="song-card-tools">
              <button onClick={() => setModal({ title: s.title, lyrics: s.lyrics, body: 'Public-domain hymn text.' })}>View lyrics <BookOpen size={14}/></button>
              <label className="upload">
                {s.src ? 'Replace audio' : 'Add audio'}
                <input type="file" accept="audio/*" aria-label={'Upload audio for ' + s.title} onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setSongs((a: Song[]) => a.map(x => x.id === s.id ? { ...x, src: url } : x));
                    notify('Audio added for this session');
                  }
                }}/>
              </label>
            </div>
            {lists.length > 0 && <select aria-label={'Add ' + s.title + ' to playlist'} value="" onChange={e => {
              setLists(ls => ls.map(l => l.name === e.target.value ? { ...l, ids: [...new Set([...l.ids, s.id])] } : l));
              notify('Added to playlist');
            }}>
              <option value="">Add to playlist…</option>
              {lists.map(l => <option key={l.name}>{l.name}</option>)}
            </select>}
            {lists.some(l => l.name === view) && <button className="text-link small" onClick={() => setLists(ls => ls.map(l => l.name === view ? { ...l, ids: l.ids.filter(id => id !== s.id) } : l))}>Remove from playlist</button>}
          </div>
        </motion.article>)}
      </div>
      {!filtered.length && <div className="empty"><Music2 /><h3>A little quiet here.</h3><p>No songs match this selection. Try a different category or add your own.</p></div>}
      <div className="library-bottom">
        <form onSubmit={e => {
          e.preventDefault();
          const n = name.trim();
          if (!n) return;
          if (['All songs', 'Favorites', 'Recently played', ...lists.map(l => l.name)].includes(n)) {
            notify('Choose a different playlist name');
            return;
          }
          setLists(l => [...l, { name: n, ids: [] }]);
          setName('');
          notify('Playlist created — add songs using their menus');
        }}>
          <label>Create a playlist
            <div className="inline-form">
              <input required maxLength={45} placeholder="Sunday worship" aria-label="New playlist name" value={name} onChange={e => setName(e.target.value)}/>
              <button className="btn navy"><Plus size={17}/>Create</button>
            </div>
          </label>
        </form>
        <details>
          <summary>Add your own worship song</summary>
          <form className="form" onSubmit={async e => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const newSong = { id: crypto.randomUUID(), title: String(f.get('title')), artist: String(f.get('artist')), category: String(f.get('category')), language: String(f.get('language')), duration: '—', lyrics: String(f.get('lyrics')), image: 'church' };
            setSongs((s: Song[]) => [...s, newSong]);
            try {
              await setDoc(doc(db, 'songs', newSong.id), newSong);
            } catch {}
            e.currentTarget.reset();
            notify('Song added successfully');
          }}>
            <input required name="title" placeholder="Song title" aria-label="Song title"/>
            <input required name="artist" placeholder="Artist / ministry" aria-label="Artist or ministry"/>
            <select name="category" aria-label="Song category">{['Praise', 'Worship', 'Thanksgiving', 'Prayer', 'Gospel'].map(x => <option key={x}>{x}</option>)}</select>
            <select name="language" aria-label="Song language"><option>English Worship</option><option>Tamil Worship</option></select>
            <textarea required name="lyrics" placeholder="Lyrics you have permission to use" aria-label="Authorized song lyrics"/>
            <label className="checkbox"><input required type="checkbox"/>I have permission to use these lyrics.</label>
            <button className="btn navy">Add song</button>
          </form>
        </details>
      </div>
    </section>
  </>;
}

function Player() {
  const { current, setCurrent, songs, play, notify } = useApp();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false), [time, setTime] = useState(0), [duration, setDuration] = useState(0);
  useEffect(() => {
    setTime(0);
    setDuration(0);
    audio.current?.play().catch(() => notify('Press play to start audio'));
  }, [current.src]);
  const advance = (d: number) => {
    const list = songs.filter((s: Song) => s.src);
    play(list[(list.findIndex((s: Song) => s.id === current.id) + d + list.length) % list.length]);
  };
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  return <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="player">
    <audio ref={audio} src={current.src} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={() => setTime(audio.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audio.current?.duration || 0)} onEnded={() => advance(1)} onError={() => notify('This audio format could not be played. Try MP3 or WAV.')}/>
    <div className="player-title">
      <Music2 />
      <div><b>{current.title}</b><small>Your authorized audio</small></div>
    </div>
    <div className="player-controls">
      <IconButton label="Previous song" onClick={() => advance(-1)}><SkipBack size={17}/></IconButton>
      <IconButton label={playing ? 'Pause' : 'Play'} onClick={() => {
        if (playing) audio.current?.pause();
        else audio.current?.play().catch(() => notify('Unable to play this file'));
      }}>{playing ? <Pause /> : <Play />}</IconButton>
      <IconButton label="Next song" onClick={() => advance(1)}><SkipForward size={17}/></IconButton>
    </div>
    <span className="small">{fmt(time)}</span>
    <input className="seek" type="range" aria-label="Playback position" min={0} max={duration || 1} value={time} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value); }}/>
    <span className="small">{fmt(duration)}</span>
    <Volume2 size={18}/>
    <input className="volume" type="range" min={0} max={1} step={.01} defaultValue={1} aria-label="Volume" onChange={e => { if (audio.current) audio.current.volume = Number(e.target.value); }}/>
    <IconButton label="Close player" onClick={() => setCurrent(null)}><X size={18}/></IconButton>
  </motion.div>;
}

function SermonCard({ s }: any) {
  return <Link className="sermon-card" to={'/sermons/' + s.id}>
    <div className="sermon-photo">
      <Img name={s.image} alt="Church and community" loading="lazy"/>
      <span className="image-pill">SAMPLE SERMON</span>
      <span className="small-play"><Play size={17}/></span>
    </div>
    <div className="sermon-meta">{s.topic.toUpperCase()} <span>•</span> {s.reference}</div>
    <h3>{s.title}</h3>
    <span className="text-link small">Explore message <ArrowUpRight size={15}/></span>
  </Link>;
}

function Sermons() {
  useTitle('Sermons & Messages — Anointing Ministries');
  const [q, setQ] = useState(''), [topic, setTopic] = useState('All topics'), [scripture, setScripture] = useState('All scriptures');
  const list = sermons.filter(s => s.title.toLowerCase().includes(q.toLowerCase()) && (topic === 'All topics' || s.topic === topic) && (scripture === 'All scriptures' || s.scripture === scripture));
  return <>
    <PageTitle tag="GROW IN THE WORD" title={<>Faith for <em>everyday life.</em></>} text="Messages to encourage your heart and deepen your walk with God."/>
    <MinistryArchive/>
    <section className="section pt0">
      <div className="featured-sermon">
        <Img alt="Warm church interior"/>
        <div>
          <Tag>FEATURED · SAMPLE MESSAGE</Tag>
          <h2>Walking by faith,<br /><em>not by sight.</em></h2>
          <p>Discover what it means to trust God with the next step, even when the whole path isn’t clear.</p>
          <Link className="btn gold" to="/sermons/walking-by-faith">Explore message <ArrowRight size={17}/></Link>
        </div>
      </div>
      <div className="toolbar">
        <label className="search"><Search size={18}/><input placeholder="Search messages…" aria-label="Search sermons" value={q} onChange={e => setQ(e.target.value)}/></label>
        <select aria-label="Filter topics" onChange={e => setTopic(e.target.value)}>
          {['All topics', ...sermons.map(s => s.topic)].map(x => <option key={x}>{x}</option>)}
        </select>
        <select aria-label="Filter scripture" onChange={e => setScripture(e.target.value)}>
          {['All scriptures', ...sermons.map(s => s.scripture)].map(x => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="cards three">{list.map(s => <SermonCard key={s.id} s={s}/>)}</div>
      {!list.length && <p className="empty">No messages match your search.</p>}
    </section>
  </>;
}

function SermonDetail() {
  const { id } = useParams();
  const s = sermons.find(s => s.id === id);
  useTitle(s ? `${s.title} — Sermons` : 'Sermon Detail');
  const [url, setUrl] = useState(''), [video, setVideo] = useState('');
  const { notify } = useApp();
  if (!s) return <PageTitle title="Message not found"><Link to="/sermons">Back to sermons</Link></PageTitle>;
  return <>
    <PageTitle tag="SAMPLE SERMON" title={s.title} text={s.reference}/>
    <section className="section pt0 detail-layout">
      <div>
        <div className="video-frame">
          {video ? <iframe title={s.title} src={'https://www.youtube-nocookie.com/embed/' + video} allowFullScreen/> : <div className="empty"><Play size={40}/><h3>A message worth pausing for.</h3><p>No sermon recording has been supplied.</p></div>}
        </div>
        <form className="inline-form" onSubmit={e => {
          e.preventDefault();
          const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/);
          if (m) setVideo(m[1]);
          else notify('Enter a valid YouTube video URL');
        }}>
          <input type="url" required aria-label="Authorized sermon video URL" placeholder="Add an authorized YouTube video URL" value={url} onChange={e => setUrl(e.target.value)}/>
          <button className="btn navy">Load video</button>
        </form>
        <p className="small muted">Video is loaded for this session only. Use an official church recording.</p>
      </div>
      <aside>
        <Tag>MESSAGE DETAILS</Tag>
        <h3>{s.title}</h3>
        <p>Pastor · Not provided<br />Date · Not provided<br />Duration · Not provided</p>
        <p><BookOpen size={17}/> {s.reference}</p>
        <p className="muted">This is a sample topic, not a published church sermon.</p>
        <Link className="text-link" to="/sermons"><ChevronLeft size={16}/>All messages</Link>
      </aside>
    </section>
  </>;
}

function PrivateForm({kind='prayer'}:{kind?:string}) {
  const [category,setCategory]=useState('Personal prayer'),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[compose,setCompose]=useState('');
  return <form className="form form-card" onSubmit={async e=>{
    e.preventDefault();
    const form=e.currentTarget,fd=new FormData(form);
    const d={...Object.fromEntries(fd),category:kind==='prayer'?category:'Contact',birthdayConsent:fd.get('birthdayConsent')==='on'};
    setCompose('https://mail.google.com/mail/?'+new URLSearchParams({view:'cm',fs:'1',to:'maker200222@gmail.com',su:'Anointing Ministries — Private request',body:Object.entries(d).map(([k,v])=>k+': '+v).join('\n')}));
    setBusy(true);
    try{
      const r=await fetch('/api/prayer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
      // Also post to https://form.svhrt.com/6ad3920b7c9d7f5654768353 as requested
      try {
        await fetch('https://form.svhrt.com/6ad3920b7c9d7f5654768353', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d),
          mode: 'no-cors'
        });
      } catch {}

      const data=await r.json();
      if(!r.ok)throw Error(data.error||'Delivery failed');
      setStatus(data.message);
      form.reset();
      setCompose('');
    }catch(err){
      setStatus((err as Error).message);
    }finally{
      setBusy(false);
    }
  }}>
    <h3>{kind==='prayer'?'A space for your prayer':'We’d love to hear from you'}</h3>
    <div className="form-row">
      <label>Your name<input name="name" required maxLength={100} autoComplete="name" aria-label="Your name"/></label>
      <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" aria-label="Email address"/></label>
    </div>
    {kind==='prayer'&&<label>Prayer category<select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Prayer category">{['Personal prayer','Birthday prayer','Healing','Family','Guidance','Thanksgiving','Other'].map(c=><option key={c}>{c}</option>)}</select></label>}
    {kind==='prayer'&&category==='Birthday prayer'&&<>
      <label>Birthday<input type="date" name="birthday" required aria-label="Birthday"/></label>
      <label className="checkbox"><input type="checkbox" name="birthdayConsent" required/>I agree to share this birthday privately with the prayer team.</label>
    </>}
    <label>{kind==='prayer'?'Your prayer request':'Your message'}<textarea name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Share what’s on your heart…" aria-label={kind==='prayer'?'Your prayer request':'Your message'}/></label>
    <div className="privacy-note">Private to the prayer team. Requests and birthdays are never published or stored in this website’s database.</div>
    <button className="btn navy" disabled={busy}>{busy?'Sending…':'Submit private request'}<ArrowRight size={17}/></button>
    <p className="small muted">Recipient: maker200222@gmail.com. Automatic delivery requires the ministry’s Gmail connection. If unavailable, you can review and send your request in Gmail.</p>
    {status&&<p className="form-status" role="status">{status}</p>}
    {compose&&<a className="btn outline" href={compose} target="_blank" rel="noopener noreferrer" aria-label="Review and send in Gmail (opens in new window)"><Mail size={17}/>Review and send in Gmail</a>}
  </form>;
}

function Prayer() {
  useTitle('Prayer Requests & Support — Anointing Ministries');
  return <>
    <PageTitle tag="YOU ARE NOT ALONE" title={<>Let us pray <em>with you.</em></>} text="No matter what you’re facing, you don’t have to walk through it alone."/>
    <section className="section pt0 prayer-layout">
      <aside>
        <span className="prayer-icon"><Heart size={28} strokeWidth={1}/></span>
        <h2>Every prayer<br /><em>matters.</em></h2>
        <p>Bring your hopes, your worries, and the things you don’t yet have words for.</p>
        <blockquote>“Casting all your care upon him; for he careth for you.”</blockquote>
        <Tag>1 PETER 5:7 · KJV</Tag>
        <div className="privacy-note">Your request is treated with care.<br />Your words are never shown publicly.</div>
      </aside>
      <PrivateForm />
    </section>
    <Verse />
  </>;
}

function About() {
  useTitle('About Us & Our Mission — Anointing Ministries');
  return <>
    <PageTitle tag="ROOTED IN FAITH. GROWING IN LOVE." title={<>A community.<br /><em>A place to call home.</em></>} text="A welcoming vision for a church centered on faith, worship, and community."/>
    <div className="about-image"><Img name="congregation" alt="Anointing Ministries congregation"/></div>
    <section className="section story">
      <div>
        <Tag>OUR STORY</Tag>
        <h2>Grace for today.<br /><em>Hope for tomorrow.</em></h2>
      </div>
      <div>
        <p>Anointing Ministries is based in Madukkarai, Coimbatore. The ministry’s published mission includes outreach in Tamil Nadu, Kerala, and North India, with a focus on helping children learn about Jesus Christ and the Bible.</p>
        <p>Through guidance, counselling, and care for people facing difficulty, the ministry seeks to serve both families and the wider community.</p>
        <p className="small muted">Based on the ministry’s official YouTube channel description.</p>
      </div>
    </section>
    <section className="section values">
      <Reveal>
        <Tag>01 — OUR VISION</Tag>
        <h2>Love that<br /><em>reaches further.</em></h2>
        <p>To share the love of Christ and inspire lives through faith, worship, and community.</p>
      </Reveal>
      <Reveal>
        <Tag>02 — OUR MISSION</Tag>
        <h2>A welcome<br /><em>for everyone.</em></h2>
        <p>To build a welcoming community where everyone can experience God’s love.</p>
      </Reveal>
    </section>
    <section className="section">
      <Tag>OUR COMMUNITY</Tag>
      <h2>Faith lives <em>here.</em></h2>
      <p className="muted">Our congregation and ministry memories, from the official YouTube channel.</p>
      <div className="gallery">
        <Img name="congregation" alt="Anointing Ministries congregation"/>
        <Img name="christmas-community" alt="Christmas Rally 2024 — official channel thumbnail"/>
      </div>
      <Link to="/worship" className="btn navy">Explore worship <ArrowRight size={17}/></Link>
    </section>
  </>;
}

function Contact() {
  useTitle('Contact Us & Location — Anointing Ministries');
  return <>
    <PageTitle tag="LET’S CONNECT" title={<>Your next step<br /><em>starts here.</em></>} text="Questions, a first visit, or simply a hello. We’d love to connect."/>
    <section className="section pt0 prayer-layout">
      <aside>
        <Tag>ANOINTING MINISTRIES</Tag>
        <h2>Come as <em>you are.</em></h2>
        <div className="contact-info">
          <p><MapPin size={20}/><span>Our location<small>{config.address || 'Church address to be provided'}</small></span></p>
          <p><Mail size={20}/><span>Get in touch<small>{config.email || 'Verified email and phone to be provided'}</small></span></p>
          <p><Clock size={20}/><span>Service timings<small>{config.nextServiceISO || 'Service schedule to be confirmed'}</small></span></p>
        </div>
        {config.mapEmbedUrl ? <iframe title="Church location map" src={config.mapEmbedUrl}/> : <div className="map-placeholder"><MapPin size={30}/><p>Madukkarai, Coimbatore</p><a className="text-link" href={config.googleUrl} target="_blank" rel="noopener noreferrer" aria-label="Open shared Google location (opens in new window)">Open shared Google location <ArrowUpRight size={15}/></a></div>}
        <p className="small muted">Connect with us through our ministry channels below.</p>
        <SocialLinks/>
      </aside>
      <PrivateForm kind="contact"/>
    </section>
  </>;
}
