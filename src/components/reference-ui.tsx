import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, ChevronRight, Heart, MessageCircle, Music2, Play, Radio, Send, ShieldCheck, User, X, Bell, LogOut, Bookmark, MapPin } from 'lucide-react';
import { DailyVerse, getBook, useLocal } from '../bible';
import { pastorSongs } from '../songs';
import { config } from '../config';

export function ReferenceHeading({ title, href, label = 'View all' }: { title: string; href?: string; label?: string }) {
  return <div className="ref-section-heading"><h2>{title}</h2>{href && <Link to={href}>{label}<ArrowRight size={15}/></Link>}</div>;
}

export function QuickAccess() {
  return <section className="ref-quick-access" aria-label="Quick access">
    <ReferenceHeading title="Quick Access"/>
    <div className="ref-quick-grid">{[
      { title: 'Bible', to: '/bible', Icon: BookOpen },
      { title: 'Songs', to: '/worship#songs', Icon: Music2 },
      { title: 'Prayer', to: '/prayer', Icon: Heart },
      { title: 'Events', to: '/community#services', Icon: CalendarDays },
    ].map(({ title, to, Icon }) => <Link to={to} key={title}><Icon size={26} strokeWidth={1.5}/><span>{title}</span></Link>)}</div>
  </section>;
}

export function CommunityInvite() {
  return <Link to="/community" className="ref-community-invite">
    <img src="/images/congregation.jpg" alt="" loading="lazy"/>
    <div><span>BETTER TOGETHER</span><h2>Be a part of our<br/>growing community.</h2></div><ArrowRight size={22}/>
  </Link>;
}

export function WorshipPreview() {
  const [selected, setSelected] = useState<(typeof pastorSongs)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (selected) dialog.current?.showModal(); else dialog.current?.close(); }, [selected]);
  const songs = pastorSongs.filter(song => song.video).slice(0, 3);
  return <section className="ref-song-preview">
    <ReferenceHeading title="Worship Songs" href="/worship#pastor-songs"/>
    <div className="ref-song-list">{songs.map((song, index) => <button key={song.id} className="ref-song-item" onClick={() => setSelected(song)} aria-label={'Watch ' + song.title}>
      <img src={'/images/' + ['worship-song', 'church-worship', 'congregation'][index] + '.jpg'} alt="" loading="lazy" width={64} height={64}/>
      <span className="ref-song-copy"><b>{song.title}</b><small>Pastor David Samson</small></span>
      <span className="ref-song-play"><Play size={15} fill="currentColor"/></span>
    </button>)}</div>
    <dialog className="ref-video-dialog" aria-label={selected?.title || 'Worship video'} ref={dialog} onCancel={() => setSelected(null)} onClick={e => { if (e.target === dialog.current) setSelected(null); }}>
      <div className="ref-dialog-heading"><h2>{selected?.title}</h2><button onClick={() => setSelected(null)} aria-label="Close worship video"><X size={20}/></button></div>
      {selected && <><iframe title={selected.title} src={'https://www.youtube-nocookie.com/embed/' + selected.video} allow="autoplay; encrypted-media; fullscreen" allowFullScreen/><a href={'https://www.youtube.com/watch?v=' + selected.video} target="_blank" rel="noopener noreferrer">Open original video on YouTube ↗</a></>}
    </dialog>
  </section>;
}

export function BroadcastPreview({ isLive = false, title }: { isLive?: boolean; title?: string }) {
  return <section className="ref-broadcast-preview">
    <ReferenceHeading title="Worship Service" href="/live" label="Open"/>
    <div className="ref-broadcast-card">
      <img src="/images/church-worship.jpg" alt="Anointing Ministries worship service" loading="lazy" width={116} height={140}/>
      <div><span className={'ref-status ' + (isLive ? 'is-live' : '')}>{isLive ? '● LIVE NOW' : 'WORSHIP WITH US'}</span><h3>{isLive && title ? title : 'A moment in His presence'}</h3><p>Praise, prayer and the Word. Wherever you are, you belong here.</p><Link className="ref-primary" to="/live"><Play size={14} fill="currentColor"/>{isLive ? 'Join live worship' : 'Watch worship'}</Link></div>
    </div>
  </section>;
}

export function BibleLanding({ isLive, liveTitle }: { isLive?: boolean; liveTitle?: string }) {
  const [book] = useLocal('am-bible-book', 19);
  const [chapter] = useLocal('am-bible-chapter', 23);
  const [language] = useLocal('am-bible-language', 'ta');
  const [reading, setReading] = useState({ title: 'Continue reading', excerpt: 'Open your saved chapter in the Tamil or English Bible.' });
  useEffect(() => {
    let cancelled = false;
    getBook(language === 'en' ? 'en' : 'ta', book).then(data => {
      const current = data.chapters.find(item => item.n === chapter) || data.chapters[0];
      if (!cancelled) setReading({ title: data.name + ' · ' + current.n, excerpt: current.verses[0]?.text || '' });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [book, chapter, language]);
  return <div className="ref-page ref-bible-home">
    <DailyVerse variant="feature"/>
    <section><ReferenceHeading title="Read the Bible" href="/bible/read" label="Open Bible"/>
      <Link to="/bible/read" className="ref-reading-card"><div className="ref-reading-art"><BookOpen size={35} strokeWidth={1.3}/></div><div><span className="ref-kicker">PICK UP WHERE YOU LEFT OFF</span><h3>{reading.title}</h3><p>{reading.excerpt}</p></div><ChevronRight size={22}/></Link>
    </section>
    <div className="ref-two-column"><BroadcastPreview isLive={isLive} title={liveTitle}/><WorshipPreview/></div>
    <Link className="ref-studio-link" to="/worship/presentation"><Music2 size={18}/><div><b>Worship Presentation Studio</b><small>Prepare lyrics, scripture and service slides.</small></div><ArrowRight size={20}/></Link>
  </div>;
}

type ChurchAlert = { id: string; message?: string; title?: string; image?: string };
export function CommunityOverview({ alerts = [] }: { alerts?: ChurchAlert[] }) {
  const [request, setRequest] = useState('');
  const navigate = useNavigate();
  const date = config.nextServiceISO ? new Date(config.nextServiceISO) : null;
  const confirmed = date && Number.isFinite(date.getTime()) && date.getTime() > Date.now();
  return <div className="ref-page ref-community-home">
    <section className="ref-service-card" id="services">
      <img src="/images/congregation.jpg" alt="Worship at Anointing Ministries"/>
      <div className="ref-service-copy"><span className="ref-status">{confirmed ? 'UPCOMING' : 'COME AS YOU ARE'}</span><h1>Gather in<br/>His presence.</h1>
        {confirmed ? <p><CalendarDays size={16}/>{date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p> : <p><CalendarDays size={16}/>Ask us about our next gathering</p>}
        <p><MapPin size={16}/>Madukkarai · Coimbatore</p><Link to="/contact" className="ref-light-button">Service details <ArrowRight size={15}/></Link>
      </div>
    </section>
    <div className="ref-two-column">
      <section><ReferenceHeading title="Prayer Request" href="/prayer"/>
        <form className="ref-prayer-card" onSubmit={e => { e.preventDefault(); navigate('/prayer', { state: { prayerDraft: request } }); }}>
          <div className="ref-prayer-intro"><Heart size={32} strokeWidth={1.3}/><div><h3>Share your prayer request</h3><p>You don’t have to walk through it alone. Our prayer team is here for you.</p></div></div>
          <label className="sr-only" htmlFor="community-prayer-draft">Your private prayer draft</label><textarea id="community-prayer-draft" value={request} onChange={e => setRequest(e.target.value)} maxLength={5000} rows={2} placeholder="What’s on your heart?"/>
          <button className="ref-primary" type="submit"><Send size={16}/>Continue privately</button><small><ShieldCheck size={12}/>Complete the private form next. Nothing is sent yet.</small>
        </form>
      </section>
      <section><ReferenceHeading title="Announcements" href="/announcements"/>
        {alerts.length ? <div className="ref-announcement-list">{alerts.slice(0, 3).map(alert => <Link to="/announcements" className="ref-announcement-item" key={alert.id}><div className="ref-announcement-icon"><Bell size={23}/></div><div><h3>{alert.title || 'Ministry update'}</h3><p>{alert.message}</p></div><ChevronRight size={18}/></Link>)}</div> : <div className="ref-empty-card"><Bell size={25} strokeWidth={1.4}/><h3>Stay close. Stay encouraged.</h3><p>Ministry announcements will appear when published. Explore the community feed for more.</p><Link to="/announcements" className="text-link">Open community feed <ArrowRight size={15}/></Link></div>}
      </section>
    </div>
    <CommunityInvite/>
  </div>;
}

export function MemberProfile({ member, onLogin, onLogout, onNotifications }: { member: { name: string } | null; onLogin: () => void; onLogout: () => void; onNotifications: () => void }) {
  const [saved] = useLocal<string[]>('am-saved-verses', []);
  const [favorites] = useLocal<string[]>('grace-favorites', []);
  return <div className="ref-page ref-profile-page">
    <span className="ref-kicker">YOUR EVERYDAY WALK WITH GOD</span><h1>A little space<br/>for <em>your faith.</em></h1>
    <section className="ref-profile-card"><div className="ref-profile-avatar"><User size={35} strokeWidth={1.3}/></div><h2>{member ? member.name : 'Welcome to the family.'}</h2><p>{member ? 'Your ministry profile and worship preferences.' : 'Sign in with your existing ministry membership, or keep exploring as a guest.'}</p><button className="ref-primary" onClick={member ? onLogout : onLogin}>{member ? <LogOut size={17}/> : <User size={17}/>} {member ? 'Sign out' : 'Member sign in'}</button></section>
    <div className="ref-profile-stats"><Link to="/bible/read"><Bookmark size={21}/><b>{saved.length}</b><span>Saved verses</span></Link><Link to="/worship#songs"><Heart size={21}/><b>{favorites.length}</b><span>Favorite songs</span></Link></div>
    <section className="ref-profile-options"><button onClick={onNotifications}><Bell size={21}/><span><b>Notifications & preferences</b><small>Worship updates and church announcements</small></span><ChevronRight size={18}/></button><Link to="/prayer"><MessageCircle size={21}/><span><b>Private prayer request</b><small>Share with the prayer team</small></span><ChevronRight size={18}/></Link><Link to="/contact"><MapPin size={21}/><span><b>Connect with the ministry</b><small>Contact details and directions</small></span><ChevronRight size={18}/></Link></section>
  </div>;
}
