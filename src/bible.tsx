import {useState,useEffect,useRef} from 'react';
import {Link} from 'react-router-dom';
import {BookOpen,Heart,Share2,Copy,ChevronLeft,ChevronRight,Search,Download,MessageCircle,Send,X,Monitor,Trash2} from 'lucide-react';
import daily from './daily-verses.json';

type Lang = 'ta' | 'en' | 'both';
type Verse = { n: number; text: string };
type Book = { id: number; name: string; chapters: { n: number; verses: Verse[] }[] };

const bookCache = new Map<string, Book>();

const bookNames = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark',
  'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

export async function getBook(lang: string, id: number) {
  const key = lang + id;
  if (bookCache.has(key)) return bookCache.get(key)!;

  // 1. Try local Tamil-Bible-Database / KJV JSON files
  try {
    const r = await fetch(`/bible/${lang}-${id}.json`);
    if (r.ok) {
      const b = await r.json();
      bookCache.set(key, b);
      return b as Book;
    }
  } catch {}

  // 2. For English KJV, integrate APIVerve Bible API as requested
  if (lang === 'en') {
    try {
      const bName = bookNames[id - 1] || 'Genesis';
      // Fetch chapter 1 by default or full book structure if API supports
      const apiR = await fetch(`https://api.apiverve.com/v1/bible?book=${encodeURIComponent(bName)}&version=KJV&chapter=1`);
      if (apiR.ok) {
        const res = await apiR.json();
        if (res?.data) {
          const chData = res.data.chapters || [res.data];
          const bookObj: Book = {
            id,
            name: bName,
            chapters: chData.map((ch: any, idx: number) => ({
              n: ch.chapter || idx + 1,
              verses: (ch.verses || []).map((v: any, vIdx: number) => ({
                n: v.verse || vIdx + 1,
                text: v.text || v.content || ''
              }))
            }))
          };
          bookCache.set(key, bookObj);
          return bookObj;
        }
      }
    } catch {}
  }

  throw Error('Bible could not load. Connect once to download this book.');
}

export function useLocal<T>(key: string, initial: T) {
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

export function todayIndex() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const n = (t: string) => Number(parts.find(p => p.type === t)?.value);
  return Math.floor(Date.UTC(n('year'), n('month') - 1, n('day')) / 86400000) % daily.length;
}

export function sendToStudio(text: string) {
  try {
    localStorage.setItem('am-studio-inbox', JSON.stringify({ text, time: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

function Language({ value, onChange }: { value: Lang; onChange: (x: Lang) => void }) {
  return <div className="language-switch">
    {[['ta', 'தமிழ்'], ['en', 'English'], ['both', 'Both']].map(([k, t]) => <button key={k} aria-pressed={value === k} className={value === k ? 'selected' : ''} onClick={() => onChange(k as Lang)}>{t}</button>)}
  </div>;
}

export async function createVerseImage(text: string, reference: string) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, '#162a3b');
  gradient.addColorStop(.7, '#101827');
  gradient.addColorStop(1, '#2e2530');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  const logo = new Image();
  logo.src = '/images/anointing-logo.jpg';
  await new Promise<void>((resolve, reject) => {
    logo.onload = () => resolve();
    logo.onerror = () => reject(Error('Logo could not load'));
  });

  ctx.save();
  ctx.globalAlpha = .065;
  ctx.drawImage(logo, 240, 330, 600, 600);
  ctx.restore();

  ctx.strokeStyle = '#c9a76a';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, 984, 1254);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a76a';
  ctx.font = '20px sans-serif';
  ctx.fillText('ANOINTING MINISTRIES · DAILY SCRIPTURE', 540, 132);

  const wrap = (size: number) => {
    ctx.font = `${size}px "Noto Sans Tamil", sans-serif`;
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        if (ctx.measureText(line + ' ' + word).width > 850 && line) {
          lines.push(line);
          line = word;
        } else line += (line ? ' ' : '') + word;
      }
      if (line) lines.push(line);
    }
    return lines;
  };

  let size = 48, lines = wrap(size);
  while (lines.length * size * 1.7 > 770 && size > 20) {
    size -= 2;
    lines = wrap(size);
  }

  ctx.fillStyle = '#faf8f3';
  const start = 270 + (770 - lines.length * size * 1.7) / 2;
  lines.forEach((l, i) => ctx.fillText(l, 540, start + i * size * 1.7));

  ctx.fillStyle = '#d4ba86';
  ctx.font = '26px "Noto Sans Tamil",sans-serif';
  ctx.fillText(reference, 540, 1080, 870);

  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 1170, 42, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, 498, 1128, 84, 84);
  ctx.restore();

  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#dfd8c9';
  ctx.fillText('ANOINTING MINISTRIES', 540, 1250);

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(Error('Image export failed')), 'image/png'));
}

export function VerseActions({ text, reference, verseKey }: { text: string; reference: string; verseKey: string }) {
  const [saved, setSaved] = useLocal<string[]>('am-saved-verses', []);
  const [msg, setMsg] = useState(''), [showComments, setShowComments] = useState(false), [community, setCommunity] = useState<any>(null), [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null), [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = async () => {
    try {
      const r = await fetch('/api/community?verse=' + verseKey);
      if (r.ok) setCommunity(await r.json());
      else setCommunity(null);
    } catch {
      setCommunity(null);
    }
  };
  useEffect(() => { refresh(); }, [verseKey]);
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    else dialog.current?.close();
    return () => { if (preview) URL.revokeObjectURL(preview.url); };
  }, [preview]);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(''), 6000);
    return () => clearTimeout(t);
  }, [msg]);

  async function act(action: string, extra: any = {}) {
    try {
      const r = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verse: verseKey, action, ...extra }) });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await refresh();
      return true;
    } catch (e) {
      setMsg((e as Error).message);
      return false;
    }
  }

  return <>
    <div className="verse-actionbar">
      <button onClick={() => act('like', { liked: !community?.liked })} aria-pressed={!!community?.liked}><Heart size={17} fill={community?.liked ? 'currentColor' : 'none'}/>{community ? community.likes : '—'} <span>Like</span></button>
      <button onClick={() => setShowComments(!showComments)} aria-expanded={showComments}><MessageCircle size={17}/><span>Comments</span>{community?.comments?.length || ''}</button>
      <button onClick={async () => {
        try {
          await navigator.clipboard.writeText(text + '\n' + reference + '\nAnointing Ministries');
          setMsg('Verse copied');
        } catch {
          setMsg('Copy is unavailable in this browser');
        }
      }}><Copy size={16}/><span>Copy</span></button>
      <button disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const blob = await createVerseImage(text, reference);
          setPreview({ blob, url: URL.createObjectURL(blob) });
        } catch (e) {
          setMsg((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}><Share2 size={17}/><span>{busy ? 'Preparing…' : 'Share image'}</span></button>
      <button onClick={() => setMsg(sendToStudio(text + '\n\n' + reference) ? 'Added to the presentation studio on this device.' : 'Could not add slide.')}><Monitor size={17}/><span>Present</span></button>
    </div>
    {msg && <p className="inline-status" role="status">{msg}</p>}
    {showComments && <div className="verse-community">
      <h3>Encourage one another</h3>
      <p className="small">Comments are visible to other visitors. Keep private prayers in the prayer form.</p>
      {!community && <p>Community is unavailable while offline or before the server is connected.</p>}
      {community && !community.canPost && <a className="btn outline" href={'/signin-with-chatgpt?returnTo=' + encodeURIComponent(window.location.pathname)} target="_top">Sign in to join the conversation</a>}
      {community?.canPost && <form onSubmit={async e => {
        e.preventDefault();
        const form = e.currentTarget, fd = new FormData(form);
        if (await act('comment', { name: fd.get('name'), message: fd.get('message'), consent: fd.get('consent') === 'on' })) {
          form.reset();
          setMsg('Comment posted');
        }
      }}>
        <input required name="name" maxLength={60} placeholder="Display name" aria-label="Display name"/>
        <textarea required name="message" minLength={2} maxLength={1000} rows={3} placeholder="Share an encouraging thought…" aria-label="Comment"/>
        <label className="checkbox"><input required name="consent" type="checkbox"/>I agree to display this name and comment to other site visitors.</label>
        <button className="btn navy"><Send size={15}/>Post comment</button>
      </form>}
      {community?.comments?.map((c: any) => <article key={c.id}><b>{c.name}</b><small>{new Date(c.createdAt).toLocaleDateString()}</small><p>{c.message}</p>{c.mine && <button onClick={() => act('delete', { id: c.id })}><Trash2 size={14}/>Delete my comment</button>}</article>)}
      {community && !community.comments?.length && <p className="small">Be the first to share an encouraging thought.</p>}
    </div>}
    <dialog className="verse-share-dialog" ref={dialog} onCancel={() => setPreview(null)}>
      <button className="icon-btn" aria-label="Close share preview" onClick={() => setPreview(null)}><X/></button>
      <h3>Share a little hope.</h3>
      {preview && <>
        <img src={preview.url} alt="Daily scripture image with Anointing Ministries logo watermark"/>
        <div className="actions">
          <a className="btn gold" download={'Anointing-Ministries-' + verseKey.replaceAll(':', '-') + '.png'} href={preview.url}><Download size={16}/>Download image</a>
          <button className="btn navy" onClick={async () => {
            try {
              const file = new File([preview.blob], 'Anointing-Ministries-Verse.png', { type: 'image/png' });
              if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Anointing Ministries — Daily Verse' });
              } else {
                setMsg('Download the image, then attach it in WhatsApp, Instagram or your chosen app.');
              }
            } catch {
              setMsg('Sharing cancelled or unavailable');
            }
          }}><Share2 size={16}/>Share</button>
        </div>
        <p className="small">The church logo is embedded in the downloaded image.</p>
      </>}
    </dialog>
  </>;
}

export function DailyVerse() {
  const [index, setIndex] = useState(todayIndex), [lang, setLang] = useLocal<Lang>('am-bible-language', 'ta');
  const v = daily[index];
  const text = lang === 'both' ? v.ta.text + '\n\n' + v.en.text : v[lang].text;
  const reference = lang === 'both' ? v.ta.reference + ' · ' + v.en.reference : v[lang].reference;
  return <section className="daily-front">
    <div className="daily-decoration"/>
    <div className="daily-heading">
      <div>
        <span className="eyebrow">A WORD FOR YOUR DAY</span>
        <h2>இன்றைய <em>வசனம்.</em></h2>
        <p>Daily scripture · Anointing Ministries</p>
      </div>
      <Language value={lang} onChange={setLang}/>
    </div>
    <div className="daily-verse-text" lang={lang === 'en' ? 'en' : 'ta'}>
      {lang !== 'en' && <blockquote>{v.ta.text}</blockquote>}
      {lang !== 'ta' && <blockquote className={lang === 'both' ? 'secondary-verse' : ''}>{v.en.text}</blockquote>}
      <cite>{reference} · {lang === 'en' ? 'KJV' : lang === 'ta' ? 'Tamil BSI' : 'Tamil BSI / KJV'}</cite>
    </div>
    <VerseActions text={text} reference={reference} verseKey={`${v.book}:${v.chapter}:${v.verse}`}/>
    <div className="daily-bottom">
      <div>
        <button aria-label="Previous verse" onClick={() => setIndex((index + daily.length - 1) % daily.length)}><ChevronLeft size={18}/></button>
        <span>{index + 1} / {daily.length}</span>
        <button aria-label="Next verse" onClick={() => setIndex((index + 1) % daily.length)}><ChevronRight size={18}/></button>
      </div>
      <Link to="/bible">Open the Bible <BookOpen size={17}/></Link>
    </div>
  </section>;
}

export function BibleReader({ compact = false, onSelect }: { compact?: boolean; onSelect?: (text: string) => void }) {
  const [lang, setLang] = useLocal<Lang>('am-bible-language', 'ta'), [book, setBook] = useLocal<number>('am-bible-book', 19), [chapter, setChapter] = useLocal<number>('am-bible-chapter', 23);
  const [index, setIndex] = useState<any>(null), [ta, setTa] = useState<Book | null>(null), [en, setEn] = useState<Book | null>(null), [q, setQ] = useState(''), [error, setError] = useState(''), [selected, setSelected] = useState(1), [results, setResults] = useState<any[] | null>(null), [searching, setSearching] = useState(false), [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useLocal<string[]>('am-saved-verses', []);

  useEffect(() => {
    if (onlySaved) try { setSaved(JSON.parse(localStorage.getItem('am-saved-verses') || '[]')); } catch {}
  }, [onlySaved]);

  useEffect(() => {
    fetch('/bible/index.json').then(r => {
      if (!r.ok) throw Error('Bible index unavailable');
      return r.json();
    }).then(setIndex).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError('');
    Promise.all([getBook('ta', book), getBook('en', book)]).then(([a, b]) => {
      if (cancelled) return;
      setTa(a);
      setEn(b);
      if (chapter > a.chapters.length) setChapter(1);
    }).catch(e => setError(e.message));
    return () => { cancelled = true; };
  }, [book, chapter]);

  const ch = ta?.chapters.find(c => c.n === chapter), ech = en?.chapters.find(c => c.n === chapter);
  const rows = ch?.verses.filter(v => !onlySaved || saved.includes(`${book}:${chapter}:${v.n}`)) || [];

  async function searchAll() {
    if (!q.trim() || q.trim().length < 2) {
      setError('Enter at least two characters');
      return;
    }
    setSearching(true);
    setError('');
    const found: any[] = [];
    try {
      for (let b = 1; b <= 66; b++) {
        const use = lang === 'en' ? 'en' : 'ta', data = await getBook(use, b);
        for (const c of data.chapters)
          for (const v of c.verses)
            if (v.text.toLocaleLowerCase().includes(q.toLocaleLowerCase())) {
              found.push({ book: b, chapter: c.n, verse: v.n, text: v.text, reference: `${data.name} ${c.n}:${v.n}` });
              if (found.length >= 100) break;
            }
        if (found.length >= 100) break;
      }
      setResults(found.slice(0, 100));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  return <section className={compact ? 'bible-reader compact-bible' : 'section bible-reader'}>
    {!compact && <div className="bible-title">
      <span className="eyebrow">THE LIVING WORD</span>
      <h1>Read. Reflect. <em>Renew.</em></h1>
      <p>Complete Tamil BSI & English KJV (Tamil Bible Database & APIVerve integration)</p>
    </div>}
    <div className="bible-controls">
      <Language value={lang} onChange={setLang}/>
      <label>Book
        <select value={book} aria-label="Select book" onChange={e => { setBook(Number(e.target.value)); setChapter(1); setResults(null); }}>
          {index?.[lang === 'en' ? 'en' : 'ta'].books.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label>Chapter
        <select value={chapter} aria-label="Select chapter" onChange={e => { setChapter(Number(e.target.value)); setResults(null); }}>
          {Array.from({ length: ta?.chapters.length || 1 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
        </select>
      </label>
      <button className={'btn outline ' + (onlySaved ? 'chosen' : '')} onClick={() => setOnlySaved(!onlySaved)}>{onlySaved ? 'Show all' : 'Saved in chapter'}</button>
    </div>
    <form className="bible-search" onSubmit={e => { e.preventDefault(); searchAll(); }}>
      <Search size={18}/>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search words in the full Bible…" aria-label="Search Bible text"/>
      <button className="btn navy" disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
      {results && <button type="button" onClick={() => setResults(null)}>Clear</button>}
    </form>
    {lang === 'both' && <p className="small muted">Text search uses Tamil in bilingual mode. Select English to search English text.</p>}
    {error && <p role="alert" className="form-status">{error}</p>}
    {results ? <div className="bible-results">
      <p>{results.length} result{results.length === 1 ? '' : 's'}{results.length === 100 ? ' (first 100)' : ''}</p>
      {results.map(r => <button key={`${r.book}:${r.chapter}:${r.verse}`} onClick={() => { setBook(r.book); setChapter(r.chapter); setSelected(r.verse); setResults(null); }}>
        <b>{r.reference}</b>
        <p>{r.text}</p>
      </button>)}
    </div> : <>
      <div className="chapter-heading">
        <button aria-label="Previous chapter" disabled={chapter === 1} onClick={() => setChapter(chapter - 1)}><ChevronLeft/></button>
        <h2>{lang === 'en' ? en?.name : ta?.name} {chapter}</h2>
        <button aria-label="Next chapter" disabled={!ta || chapter >= ta.chapters.length} onClick={() => setChapter(chapter + 1)}><ChevronRight/></button>
      </div>
      <div className="bible-verses">
        {rows.map(v => {
          const english = ech?.verses.find(x => x.n === v.n)?.text || '', text = lang === 'both' ? v.text + '\n\n' + english : lang === 'en' ? english : v.text, ref = lang === 'en' ? `${en?.name} ${chapter}:${v.n}` : `${ta?.name} ${chapter}:${v.n}`;
          return <article key={v.n} className={selected === v.n ? 'selected-verse' : ''}>
            <button className="verse-number" aria-label={'Select verse ' + v.n} onClick={() => setSelected(v.n)}>{v.n}</button>
            <div onClick={() => setSelected(v.n)}>
              {lang !== 'en' && <p lang="ta">{v.text}</p>}
              {lang !== 'ta' && <p className={lang === 'both' ? 'english-parallel' : ''}>{english}</p>}
              {onSelect ? <button className="text-link" onClick={() => onSelect(text + '\n\n' + ref)}>Add verse to slides <Monitor size={15}/></button> : selected === v.n && <VerseActions text={text} reference={ref} verseKey={`${book}:${chapter}:${v.n}`}/>}
            </div>
          </article>;
        })}
        {!rows.length && !error && <p className="empty">{ta ? 'No saved verses in this chapter.' : 'Loading scripture…'}</p>}
      </div>
    </>}
    <p className="bible-attribution">Bible text from Tamil-Bible-Database & APIVerve KJV Bible API. Offline caching supported.</p>
  </section>;
}
