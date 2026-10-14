import {DailyVerse,BibleReader} from './bible';
import {PastorSongs} from './songs';
import {AppInstall,LiveStatus,LivePage,ChurchGallery} from './live-app';
import {ProStudio,ProAudience} from './presentation';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Play, Pause, Heart, Search, Menu, X, ChevronLeft, ChevronRight, Copy, Share2, Maximize, Monitor, Plus, Music2, Volume2, SkipForward, SkipBack, Check, CalendarDays, Clock, MapPin, BookOpen, Download, Trash2, Settings, ExternalLink, Mail, Cross } from 'lucide-react';
import './style.css';
import { initialSongs, verses, sermons, type Song } from './content';
import { config } from './config';
import {Brand,SocialLinks,MinistryArchive,CommunityConnect,MotionEnhancements,LightAtmosphere} from './ministry';

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
const Img = ({ name = 'church', ...props }: any) => <img src={'/images/' + name + '.jpg'} {...props}/>;
function IconButton({ label, children, ...props }: any) { return <button className="icon-btn" aria-label={label} title={label} {...props}>{children}</button>; }
function Tag({ children }: any) { return <span className="eyebrow">{children}</span>; }
function Reveal({ children, className = '' }: any) { return <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .65 }}>{children}</motion.div>; }

export function App() {
  const [songs, setSongs] = useState(initialSongs);
  const [current, setCurrent] = useState<Song | null>(null);
  const [favs, setFavs] = useStored<string[]>('grace-favorites', []);
  const [recent, setRecent] = useStored<string[]>('grace-recent', []);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<any>(null);
  const notify = (m: string) => setToast(m);

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

  return <Ctx.Provider value={{ songs, setSongs, current, setCurrent, favs, toggle, recent, play, notify, setModal }}>
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
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className={(home ? 'on-hero ' : 'solid ') + (scrolled ? 'scrolled' : '')}>
      <Brand/>
      <nav className={menu ? 'open' : ''} aria-label="Main navigation">
        {['Home', 'About', 'Worship', 'Sermons', 'Bible', 'Prayer', 'Contact'].map(x => {
          const path = x === 'Home' ? '/' : '/' + x.toLowerCase();
          return <Link key={x} className={location.pathname === path ? 'active' : ''} to={path}>{x}</Link>;
        })}
      </nav>
      <Link to="/worship" className="nav-join">Join worship <ArrowUpRight size={15}/></Link>
      <IconButton label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? <X /> : <Menu />}</IconButton>
    </header>
    <MotionEnhancements/>
    <main id="main">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/worship" element={<Worship />}/>
        <Route path="/sermons" element={<Sermons />}/>
        <Route path="/sermons/:id" element={<SermonDetail />}/>
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

function Home() {
  useTitle('Anointing Ministries — Madukkarai, Coimbatore');
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
          <Link to="/worship#live" className="hero-watch"><span><Play size={15} fill="currentColor"/></span> Watch worship</Link>
        </div>
      </motion.div>
      <div className="hero-bottom">
        <span>COME AS YOU ARE. YOU BELONG HERE.</span>
        <a href="#welcome">A little more about us <span>↓</span></a>
        <span className="sample-tag">MADUKKARAI · COIMBATORE</span>
      </div>
    </section>
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
          <div className="music-feature-head">
            <Music2 size={26} strokeWidth={1}/>
            <span>THE WORSHIP COLLECTION</span>
          </div>
          <h3>Let your heart<br /><em>find its song.</em></h3>
          <p>Timeless words. A renewed spirit.<br />Make space for a moment of praise.</p>
          {initialSongs.slice(0, 2).map(s => <SongRow key={s.id} song={s}/>)}
          <Link className="text-link" to="/worship#songs">Discover the song library <ArrowRight size={17}/></Link>
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
      </div>
      <div>
        <Link to="/worship">Worship library</Link>
        <Link to="/worship/presentation">Presentation studio <ArrowUpRight size={13}/></Link>
        <Link to="/contact">Contact us</Link>
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
      <IconButton label="Save verse" aria-pressed={saved.includes(verses[i][1])} onClick={() => setSaved(s => s.includes(verses[i][1]) ? s.filter(v => v !== verses[i][1]) : [...s, verses[i][1]])}><Heart size={17} fill={saved.includes(verses[i][1]) ? 'currentColor' : 'none'}/></IconButton>
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
  const [left, setLeft] = useState('');
  useEffect(() => {
    if (!config.nextServiceISO) return;
    const tick = () => {
      const ms = Date.parse(config.nextServiceISO) - Date.now();
      setLeft(ms > 0 ? `${Math.floor(ms / 86400000)}d ${Math.floor(ms / 3600000) % 24}h ${Math.floor(ms / 60000) % 60}m` : 'Service time has arrived');
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <section className="section live-section" id="live">
    <div className="live-screen">
      {config.youtubeVideoId ? <iframe title="Official worship broadcast" src={`https://www.youtube-nocookie.com/embed/${config.youtubeVideoId}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/> : <><Img alt="Church sanctuary"/><div className="photo-overlay"/><div className="live-empty"><span className="round-play"><Play size={26}/></span><h3>A moment of worship,<br />wherever you are.</h3><p>Join us for our next worship service.</p><span className="glass-label">BROADCAST NOT CONFIGURED</span></div></>}
    </div>
    <aside>
      <Tag>{config.liveActive && config.youtubeVideoId ? '● LIVE' : 'RECORDED WORSHIP'}</Tag>
      <h2>Wherever you are,<br /><em>you belong here.</em></h2>
      <p>Make a little room in your day to pause, reflect, and worship with us.</p>
      <div className="detail-line"><CalendarDays size={18}/>{config.nextServiceISO ? new Date(config.nextServiceISO).toLocaleString() : 'Next service · to be announced'}</div>
      {left && <p className="countdown">{left}</p>}
      <p className="muted small">Watch a recorded service from the ministry’s channel. Upcoming service timings will appear once confirmed.</p>
      <button className="text-link" onClick={() => copyShare(window.location.origin + '/worship', true, notify)}>Share this worship space <Share2 size={16}/></button>
      <a className="text-link" href={config.socials.youtube+"/streams"} target="_blank" rel="noopener noreferrer" aria-label="Visit official broadcasts on YouTube (opens in new window)">Visit official broadcasts <ArrowUpRight size={16}/></a>
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
    <div className="section"><LiveStatus/></div>
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
          <form className="form" onSubmit={e => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setSongs((s: Song[]) => [...s, { id: crypto.randomUUID(), title: String(f.get('title')), artist: String(f.get('artist')), category: String(f.get('category')), language: String(f.get('language')), duration: '—', lyrics: String(f.get('lyrics')), image: 'church' }]);
            e.currentTarget.reset();
            notify('Song added for this session');
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
