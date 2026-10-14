import {useState,useEffect,useRef} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Monitor,ChevronLeft,ChevronRight,Plus,Trash2,Save,Upload,Download,ExternalLink,Maximize,Eye,EyeOff,Music2,BookOpen,XCircle,FileVideo,FileImage,FileText} from 'lucide-react';
import {BibleReader,useLocal} from './bible';
import {initialSongs} from './content';
import {pastorSongs} from './songs';

type Slide = { id: string; title: string; text: string; mediaUrl?: string; mediaType?: string };
type Show = { slides: Slide[]; index: number; background: string; size: number; align: 'left' | 'center' | 'right'; effect: string; blank: boolean; logo: boolean; title: string };

const initial: Show = {
  title: 'Sunday worship',
  slides: [{ id: 'welcome', title: 'Welcome', text: 'Welcome to worship\n\nAnointing Ministries' }],
  index: 0,
  background: 'midnight',
  size: 48,
  align: 'center',
  effect: 'fade',
  blank: false,
  logo: true
};

const key = 'am-pro-live';

export function validShow(x: any): x is Show {
  return !!x && Array.isArray(x.slides) && x.slides.length > 0 && x.slides.length <= 500 &&
    x.slides.every((s: any) => typeof s.id === 'string' && typeof s.title === 'string' && typeof s.text === 'string' && s.text.length <= 10000) &&
    Number.isInteger(x.index) && x.index >= 0 && x.index < x.slides.length &&
    ['midnight', 'gold', 'church', 'light'].includes(x.background) &&
    Number.isFinite(x.size) && x.size >= 24 && x.size <= 90 &&
    ['left', 'center', 'right'].includes(x.align) &&
    ['fade', 'rise', 'none'].includes(x.effect);
}

function Stage({ show, onToggleBlank }: { show: Show, onToggleBlank?: () => void }) {
  const currentSlide = show.slides[show.index];
  return <div className={'pro-stage stage-' + show.background + (show.blank ? ' blanked' : '')} style={{ textAlign: show.align }}>
    {!show.blank && <>
      {currentSlide?.mediaUrl && currentSlide.mediaType?.startsWith('image') && <img src={currentSlide.mediaUrl} alt={currentSlide.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>}
      {currentSlide?.mediaUrl && currentSlide.mediaType?.startsWith('video') && <video src={currentSlide.mediaUrl} autoPlay loop muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
      <div key={show.index + (currentSlide?.id || '') + (currentSlide?.text || '')} className={'stage-words effect-' + show.effect} style={{ fontSize: `${show.size / 12}cqw`, textAlign: show.align, zIndex: 2, position: 'relative' }}>
        {currentSlide?.text}
      </div>
      {show.logo && <img className="stage-logo" src="/images/anointing-logo.jpg" alt="Anointing Ministries" style={{zIndex:3}}/>}
    </>}
    {show.blank && <div 
      className="blank-indicator" 
      onClick={onToggleBlank}
      style={{
        color: '#888', 
        fontSize: '13px', 
        letterSpacing: '1.5px', 
        textAlign: 'center', 
        cursor: onToggleBlank ? 'pointer' : 'default',
        padding: '1.5rem'
      }}>
        Blackout active (Click or press B)
      </div>}
  </div>;
}

export function ProAudience() {
  const [show, setShow] = useState<Show>(initial);
  
  const unblank = () => {
    setShow(s => {
      const next = { ...s, blank: false };
      localStorage.setItem(key, JSON.stringify(next));
      const bc = new BroadcastChannel('am-presentation');
      bc.postMessage(next);
      bc.close();
      return next;
    });
  };

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) || 'null');
      if (validShow(s)) setShow(s);
    } catch {}
    
    const receive = (x: any) => {
      if (validShow(x)) setShow(x);
    };
    
    const bc = new BroadcastChannel('am-presentation');
    bc.onmessage = e => receive(e.data);
    
    const storage = (e: StorageEvent) => {
      if (e.key === key) try { receive(JSON.parse(e.newValue || 'null')); } catch {}
    };
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') unblank();
    };

    window.addEventListener('storage', storage);
    window.addEventListener('keydown', handleKey);
    
    return () => {
      bc.close();
      window.removeEventListener('storage', storage);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return <div className="pro-audience" onDoubleClick={() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  }}>
    <Stage show={show} onToggleBlank={unblank} />
  </div>;
}

export function ProStudio() {
  const [deck, setDeck] = useLocal<Show>('am-pro-draft', initial);
  const [live, setLive] = useState<Show>(initial);
  const [tab, setTab] = useState('Songs');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('New worship song');
  const [lines, setLines] = useState(2);
  const [message, setMessage] = useState('');
  const [auto, setAuto] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saved, setSaved] = useLocal<Show[]>('am-pro-saved', []);
  const [query, setQuery] = useState('');
  const [params] = useSearchParams();
  const bc = useRef<BroadcastChannel | null>(null);
  const drag = useRef<number>(0);

  useEffect(() => {
    bc.current = new BroadcastChannel('am-presentation');
    try {
      const s = JSON.parse(localStorage.getItem(key) || 'null');
      if (validShow(s)) setLive(s);
    } catch {}
    const inbox = () => {
      try {
        const x = JSON.parse(localStorage.getItem('am-studio-inbox') || 'null');
        if (x?.text) {
          add(x.text, 'Scripture');
          localStorage.removeItem('am-studio-inbox');
        }
      } catch {}
    };
    inbox();
    window.addEventListener('storage', inbox);
    const song = pastorSongs.find(s => s.id === params.get('song'));
    if (song) {
      setTitle(song.title);
      setText(song.lyrics || '');
      setTab('Editor');
      setMessage('Lyrics loaded for ' + song.title);
    }
    return () => {
      bc.current?.close();
      window.removeEventListener('storage', inbox);
    };
  }, []);

  function take(s: Show = deck) {
    const updated = { ...s, blank: false };
    setLive(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    bc.current?.postMessage(updated);
  }

  function toggleBlackout() {
    setLive(l => {
      const next = { ...l, blank: !l.blank };
      localStorage.setItem(key, JSON.stringify(next));
      bc.current?.postMessage(next);
      return next;
    });
  }

  function clearAll() {
    setLive(l => {
      const next = { ...l, blank: true };
      localStorage.setItem(key, JSON.stringify(next));
      bc.current?.postMessage(next);
      return next;
    });
  }

  function toggleLogo() {
    setLive(l => {
      const next = { ...l, logo: !l.logo };
      localStorage.setItem(key, JSON.stringify(next));
      bc.current?.postMessage(next);
      return next;
    });
  }

  function patch(p: Partial<Show>) {
    setDeck(d => ({ ...d, ...p }));
  }

  function add(value: string, name: string, mediaUrl?: string, mediaType?: string) {
    const fresh = { id: crypto.randomUUID(), title: name, text: value, mediaUrl, mediaType };
    setDeck(d => ({ ...d, slides: [...d.slides, fresh], index: d.slides.length }));
    setMessage('Added ' + name + ' to the service');
  }

  function navigate(delta: number) {
    setDeck(d => {
      const next = { ...d, index: Math.max(0, Math.min(d.slides.length - 1, d.index + delta)) };
      if (auto) take(next);
      return next;
    });
  }

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); navigate(1); }
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key.toLowerCase() === 'b') toggleBlackout();
      if (e.key === 'Enter') take();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [deck, auto]);

  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(() => navigate(1), seconds * 1000);
    return () => clearInterval(timer);
  }, [seconds, auto]);

  function split() {
    if (!text.trim()) return;
    const chunks = text.split(/\n\s*\n/).flatMap(p => {
      const a = p.split('\n').filter(Boolean);
      return Array.from({ length: Math.ceil(a.length / lines) }, (_, i) => a.slice(i * lines, (i + 1) * lines).join('\n'));
    });
    setDeck(d => ({
      ...d,
      slides: [...d.slides, ...chunks.map((t, i) => ({ id: crypto.randomUUID(), title: title + ' · ' + (i + 1), text: t }))],
      index: d.slides.length
    }));
    setMessage(chunks.length + ' slides added');
    setTab('Service');
  }

  return <div className="pro-studio">
    <div className="pro-top">
      <Link to="/worship" className="pro-brand" aria-label="Anointing Ministries worship">
        <img src="/images/anointing-logo.jpg" alt=""/>
        <span>ANOINTING <b>Presentation Studio</b></span>
      </Link>
      <input aria-label="Presentation title" value={deck.title} onChange={e => patch({ title: e.target.value })}/>
      <div className="actions">
        <button onClick={() => { setSaved(s => [deck, ...s.filter(x => x.title !== deck.title)].slice(0, 20)); setMessage('Presentation saved on this device'); }}><Save size={16}/>Save</button>
        <button onClick={() => {
          const w = window.open('/worship/display', 'anointing-audience', 'popup,width=1280,height=720');
          setMessage(w ? 'Audience window opened. Move it to your projector; double-click it for fullscreen.' : 'Popup blocked. Allow popups or open the audience link below.');
        }}><ExternalLink size={16}/>Audience display</button>
        <Link to="/worship/display" target="_blank" aria-label="Open audience display tab (opens in new window)">Open tab ↗</Link>
      </div>
    </div>
    <div className="pro-workspace">
      <aside className="pro-library" aria-label="Presentation library">
        <div className="pro-tabs">
          {['Service', 'Songs', 'Bible', 'Editor'].map(x => <button className={tab === x ? 'active' : ''} key={x} onClick={() => setTab(x)}>{x}</button>)}
        </div>
        {tab === 'Bible' ? <BibleReader compact onSelect={t => add(t, 'Scripture')}/> : tab === 'Songs' ? <>
          <h3><Music2 size={17}/>Song library</h3>
          <input placeholder="Search worship songs" aria-label="Search studio songs" value={query} onChange={e => setQuery(e.target.value)}/>
          {initialSongs.filter(s => s.title.toLowerCase().includes(query.toLowerCase())).map(s => <button className="library-song" key={s.id} onClick={() => { setTitle(s.title); setText(s.lyrics); setTab('Editor'); }}><b>{s.title}</b><small>Public-domain lyrics · prepare slides</small></button>)}
          {pastorSongs.filter(s => (s.title + s.tamil).toLowerCase().includes(query.toLowerCase())).map(s => <button className="library-song" key={s.id} onClick={() => { setTitle(s.title); setText(''); setTab('Editor'); setMessage('Add authorized lyrics for ' + s.title); }}><b>{s.tamil || s.title}</b><small>{s.title} · Pastor David Samson</small></button>)}
          <a className="studio-external" href="https://www.christsquare.com/" target="_blank" rel="noopener noreferrer" aria-label="Browse ChristSquare (opens in new window)">Browse ChristSquare ↗</a>
          <p className="small muted">Import lyrics you own or have permission to display. ChristSquare’s complete song collection is not licensed into this app.</p>
        </> : tab === 'Editor' ? <div className="lyrics-editor">
          <h3>Build lyric slides</h3>
          <label>Song / message title<input value={title} aria-label="Song or message title" onChange={e => setTitle(e.target.value)}/></label>
          <label>Authorized lyrics<textarea rows={13} value={text} aria-label="Authorized lyrics" onChange={e => setText(e.target.value)} placeholder="Paste your lyrics. Empty lines start a new section."/></label>
          <label className="upload">Import UTF-8 text<input type="file" accept=".txt" aria-label="Import text file" onChange={async e => {
            const f = e.target.files?.[0];
            if (f && f.size < 200000) setText(await f.text());
            else setMessage('Use a text file under 200 KB');
          }}/></label>
          <label>Lines per slide<select value={lines} aria-label="Lines per slide" onChange={e => setLines(Number(e.target.value))}>{[2, 3, 4, 6].map(n => <option key={n}>{n}</option>)}</select></label>
          <button className="btn gold" onClick={split} disabled={!text.trim()}>Create slides <Plus size={16}/></button>
        </div> : <>
          <h3>Service rundown <span>{deck.slides.length}</span></h3>
          <p className="small muted">Drag to reorder · click to preview</p>
          {deck.slides.map((s, i) => <button draggable onDragStart={() => drag.current = i} onDragOver={e => e.preventDefault()} onDrop={() => {
            const a = [...deck.slides], moved = a.splice(drag.current, 1)[0];
            a.splice(i, 0, moved);
            patch({ slides: a, index: i });
          }} key={s.id} className={'rundown-item ' + (i === deck.index ? 'selected' : '')} onClick={() => patch({ index: i })} aria-label={'Slide ' + (i + 1) + ': ' + s.title}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div><b>{s.title}</b><small>{s.text.slice(0, 50)}</small></div>
          </button>)}
          <button className="studio-add" onClick={() => add('Welcome to our service', 'Announcement')}><Plus size={16}/>Add announcement</button>
          <button className="studio-add" onClick={() => add('Let us pray together', 'Prayer')}><Plus size={16}/>Add prayer</button>
          <button className="studio-add" onClick={() => add('Today’s message\nWalking by faith', 'Sermon title')}><Plus size={16}/>Add sermon title</button>
        </>}
      </aside>
      <section className="pro-center">
        <Stage show={{ ...deck, blank: false }}/>
        <div className="pro-transport">
          <button aria-label="Previous slide" disabled={!deck.index} onClick={() => navigate(-1)}><ChevronLeft/></button>
          <button className="take-button" onClick={() => take(deck)}>Send to audience <Monitor size={16}/></button>
          <button aria-label="Next slide" disabled={deck.index === deck.slides.length - 1} onClick={() => navigate(1)}><ChevronRight/></button>
          <label className="checkbox"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)}/>Follow navigation</label>
        </div>
        <div className="pro-edit">
          <input aria-label="Slide title" value={deck.slides[deck.index].title} onChange={e => patch({ slides: deck.slides.map((s, i) => i === deck.index ? { ...s, title: e.target.value } : s) })}/>
          <textarea aria-label="Slide text" rows={4} value={deck.slides[deck.index].text} onChange={e => patch({ slides: deck.slides.map((s, i) => i === deck.index ? { ...s, text: e.target.value } : s) })}/>
          <div className="actions">
            <button onClick={() => {
              if (deck.index > 0) {
                const a = [...deck.slides];
                [a[deck.index - 1], a[deck.index]] = [a[deck.index], a[deck.index - 1]];
                patch({ slides: a, index: deck.index - 1 });
              }
            }} disabled={!deck.index}>Move earlier</button>
            <button onClick={() => {
              if (deck.index < deck.slides.length - 1) {
                const a = [...deck.slides];
                [a[deck.index + 1], a[deck.index]] = [a[deck.index], a[deck.index + 1]];
                patch({ slides: a, index: deck.index + 1 });
              }
            }} disabled={deck.index === deck.slides.length - 1}>Move later</button>
            <button disabled={deck.slides.length === 1} onClick={() => patch({ slides: deck.slides.filter((_, i) => i !== deck.index), index: Math.max(0, deck.index - 1) })}><Trash2 size={15}/>Delete</button>
          </div>
        </div>
        <p className="pro-message" role="status">{message || 'Arrow keys: navigate · Enter: send · B: blackout · Audience changes only when sent'}</p>
      </section>
      <aside className="pro-settings" aria-label="Presentation settings">
        <div className="monitor-label">
          <div style={{display:'flex',gap:'8px',width:'100%',justifyContent:'flex-end'}}>
            <button className="btn outline" style={{padding:'6px 10px',fontSize:'10px'}} onClick={clearAll}><XCircle size={13}/> Clear all</button>
            <button aria-label="Fullscreen studio" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => setMessage('Fullscreen unavailable'))}><Maximize size={16}/></button>
          </div>
        </div>
        <Stage show={live} onToggleBlank={toggleBlackout}/>
        <div className="freeshow-actions" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',margin:'10px 0'}}>
          <button 
            className={'btn ' + (live.blank ? 'gold' : 'outline')} 
            onClick={(e) => {
              toggleBlackout();
              e.currentTarget.blur();
            }}
          >
            <EyeOff size={14}/> {live.blank ? 'Blackout On' : 'Blackout'}
          </button>
          <button 
            className={'btn ' + (live.logo ? 'gold' : 'outline')} 
            onClick={(e) => {
              toggleLogo();
              e.currentTarget.blur();
            }}
          >
            <Monitor size={14}/> Logo
          </button>
        </div>
        <h3>Design & atmosphere</h3>
        <label>Background
          <select value={deck.background} aria-label="Stage background" onChange={e => patch({ background: e.target.value })}>
            <option value="midnight">Midnight sanctuary</option>
            <option value="gold">Golden light</option>
            <option value="church">Our church family</option>
            <option value="light">Ivory scripture</option>
          </select>
        </label>
        <label>Text size · {deck.size}
          <input type="range" min="24" max="90" value={deck.size} aria-label="Text size" onChange={e => patch({ size: Number(e.target.value) })}/>
        </label>
        <label>Alignment
          <select value={deck.align} aria-label="Text alignment" onChange={e => patch({ align: e.target.value as Show['align'] })}>
            {['left', 'center', 'right'].map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>Transition
          <select value={deck.effect} aria-label="Slide transition effect" onChange={e => patch({ effect: e.target.value })}>
            <option value="fade">Gentle fade</option>
            <option value="rise">Soft rise</option>
            <option value="none">Instant</option>
          </select>
        </label>
        <label className="checkbox"><input type="checkbox" checked={deck.logo} onChange={e => patch({ logo: e.target.checked })}/>Ministry watermark</label>
        <label>Auto-advance preview
          <select value={seconds} aria-label="Auto advance interval" onChange={e => setSeconds(Number(e.target.value))}>
            <option value="0">Off</option>
            {[5, 10, 15, 20, 30, 60].map(n => <option value={n} key={n}>{n} seconds</option>)}
          </select>
        </label>
        <p className="small muted">Enable Follow navigation to auto-advance audience output too.</p>
        <h3>Saved presentations & Media</h3>
        <p className="small muted">Supports .json, .ppt, .pptx, images (.png, .jpg), .pdf, and videos (.mp4, .webm).</p>
        <select aria-label="Load saved presentation" value="" onChange={e => {
          const s = saved[Number(e.target.value)];
          if (validShow(s)) { setDeck(s); setMessage('Loaded saved presentation'); }
        }}>
          <option value="">Load from this device…</option>
          {saved.map((s, i) => <option key={i} value={i}>{s.title}</option>)}
        </select>
        <div className="actions">
          <button onClick={() => {
            const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Anointing-Presentation.json';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}><Download size={15}/>Export JSON</button>
          <label className="upload">
            <Upload size={15}/>Import media / PPT / PDF
            <input type="file" accept=".json,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.pdf,.mp4,.webm" aria-label="Import presentation or media file" onChange={async e => {
              try {
                const f = e.target.files?.[0];
                if (!f || f.size > 50000000) throw Error();
                const ext = f.name.split('.').pop()?.toLowerCase();
                if (ext === 'json') {
                  const d = JSON.parse(await f.text());
                  if (!validShow(d)) throw Error();
                  setDeck(d);
                  setMessage('Presentation imported successfully');
                } else {
                  const url = URL.createObjectURL(f);
                  const isVid = ext === 'mp4' || ext === 'webm';
                  const isImg = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif';
                  add(`[Media attachment: ${f.name}]\nFormat: ${ext?.toUpperCase()}`, f.name, url, f.type || (isVid ? 'video/mp4' : isImg ? 'image/png' : 'application/octet-stream'));
                  setMessage(`Imported ${f.name} into service slides`);
                }
              } catch {
                setMessage('Choose a valid presentation or media file under 50 MB');
              }
            }}/>
          </label>
        </div>
        <p className="small muted">FreeShow-inspired workflow. Presentations and media stay on this device.</p>
      </aside>
    </div>
  </div>;
}
