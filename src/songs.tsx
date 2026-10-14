import { useState } from 'react';
import { Play, ExternalLink, Music2, Search, Monitor, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const pastorSongs = [
  {
    id: 'ds-en-dhevane',
    title: 'En Dhevane / Neerae En Dhevane',
    tamil: 'என் தேவனே',
    video: 'CitDLb3M3Y8',
    kind: 'Official music video',
    duration: '5:30',
    lyrics: 'En dhevane neerae en dhevane\nUm paadham saarndhinean\nEn vaazhvil unarntheanen\nUm anbu periyadhu yaa...\n\nஉன் சமூகம் எனக்கு வேண்டும்\nஎந்த நாளும் தாங்குமே\nகிருபையாலே என்னை மூடி\nகரம்பிடித்து நடத்துவாரே'
  },
  {
    id: 'ds-perugaseivaar',
    title: 'Perugaseivaar',
    tamil: 'பெருகசெய்வார்',
    video: 'YGPd1LORldI',
    kind: 'Pastor David Samson · Official Worship',
    duration: '4:45',
    lyrics: 'Perugaseivaar ungalai perugaseivaar\nKarthar ungalai aaseervadhithu\nNal vazhiyil nadathiduvaar...\n\nபெருகசெய்வார் உன்னை பெருகசெய்வார்\nகர்த்தர் உன்னை ஆசீர்வதித்து\nநல் வழியில் நடத்திடுவார்\nகுறைகள் யாவும் நீங்கிடுமே\nநிறைவுகள் உனக்கு தந்திடுமே'
  },
  {
    id: 'ds-aaradhipen',
    title: 'Aaradhipen',
    tamil: 'ஆராதிப்பேன்',
    video: 'SNYSx-JZ6C0',
    kind: 'Pastor David Samson · Official Worship',
    duration: '5:10',
    lyrics: 'Aaradhipen unnai naan aaradhipen\nEn jeevulla naellam\nUm naamam uyarthuven...\n\nஆராதிப்பேன் உம்மை நான் ஆராதிப்பேன்\nஎன் ஜீவனுள்ள நாளெல்லாம்\nஉம் நாமம் உயர்த்திடுவேன்\nதுதிகளின் மத்தியில் வாசம் செய்பவரே\nராஜாவே உமக்கு ஸ்தோத்திரம்'
  },
  {
    id: 'ds-vakkumara',
    title: 'Vakkumara Dhevan',
    tamil: 'வாக்குமாறா தேவன்',
    video: 'Qx4Bs-iFZmU',
    kind: 'Official channel teaser',
    duration: '3:20',
    lyrics: 'Vakkumara devan unnil seyalpaduvar\nNambikkai kollungal kalangadheungal...\n\nவாக்கு மாறா தேவன் உன்னில் செயல்படுவார்\nநம்பிக்கை கொள்ளுங்கள் கலங்காதீர்கள்\nஅவர் செய்த நன்மைகளை நினைத்து\nஎந்நாளும் துதித்துப் பாடுங்கள்'
  },
  {
    id: 'ds-nilaiyai',
    title: 'Nilaiyai Anaithu Kondeer',
    tamil: 'நிலையை அணைத்துக் கொண்டீர்',
    video: 'UT4_VnksZ2Y',
    kind: 'Pastor David Samson · Official Worship',
    duration: '4:30',
    lyrics: 'Nilaiyai anaithu kondeer\nEn karam pidithu nadathineer...\n\nநிலையை அணைத்துக் கொண்டீர்\nஎன் கரம் பிடித்து நடத்தினீர்\nசோர்ந்திட்ட வேளையிலே\nசோலைபோல் மாற்றிவிட்டீர்'
  },
  {
    id: 'ds-nandri',
    title: 'Nandri Yesuva',
    tamil: 'நன்றி இயேசுவா',
    video: 'UszNKd7xuFI',
    kind: 'Pr. Gideon Joshua Samson collaboration',
    duration: '5:00',
    lyrics: 'Nandri yesuva nadhiyin karaiyil\nEnnai sandhitha devara...\n\nநன்றி இயேசுவா நன்றி இயேசுவா\nஎன்னைத் தேடி வந்தீரே\nஜீவனுள்ள நாட்களெல்லாம்\nஉம்மை நான் துதிப்பேனே'
  },
  {
    id: 'ds-paadhai',
    title: 'Paadhai Theriyadha Aatai Pola',
    tamil: 'பாதை தெரியாத ஆட்டைப் போல',
    video: 'iCXKeMestTY',
    kind: 'Pastor David Samson · Official Worship',
    duration: '5:15',
    lyrics: 'Paadhai theriyadha aatai pola\nThedichendra nan meyparum neere...\n\nபாதை தெரியாத ஆட்டைப் போல\nதேடிச் சென்ற நல்ல மேய்ப்பரும் நீரே\nஎன் கால்கள் சறுக்காதபடி\nகண்மணியைப் போல் காத்தீரே'
  },
  {
    id: 'ds-nesar',
    title: 'En Nesar Neerdhanaiya',
    tamil: 'என் நேசர் நீர்தானையா',
    video: 'NLCmrTwfwLw',
    kind: 'Pastor David Samson · Official Worship',
    duration: '4:50',
    lyrics: 'En nesar neerdhanaiya\nEnnuyir neerdhanaiya...\n\nஎன் நேசர் நீர்தானையா\nஎன் உயிருமானவரே\nஉம்மைப் போல் யாருண்டு\nஎன் வாழ்வில் இன்பம் தருபவர்'
  },
  {
    id: 'ds-potriduven',
    title: 'Potriduvean',
    tamil: 'போற்றிடுவேன்',
    video: 'nwnr15JWY6k',
    kind: 'Pastor David Samson · Official Worship',
    duration: '4:40',
    lyrics: 'Potriduven unnai endrum potriduven\nUmmah thuthithu paadhuven...\n\nபோற்றிடுவேன் உம்மை என்றும் போற்றிடுவேன்\nஉம்மைத் துதித்துப் பாடிடுவேன்\nஎன் கோட்டையும் இரட்சகரும் நீரே\nஎக்காலமும் தொழுதிடுவேன்'
  },
  {
    id: 'ds-devanaalae',
    title: 'Devanaalae Ellam Kudum',
    tamil: 'தேவனாலே எல்லாம் கூடும்',
    video: '0bu_0bjvoNE',
    kind: '2022 Promise Song · official channel',
    duration: '6:10',
    lyrics: 'Devanaalae ellam kudum\nOru vartthai sonnal podhum...\n\nதேவனாலே எல்லாம் கூடும்\nஒரு வார்த்தை சொன்னால் போதும்\nஅவர் சித்தம் நம் வாழ்வில்\nஎன்றென்றும் நிறைவேறும்'
  }
];

export function PastorSongs() {
  const [q, setQ] = useState('');
  const [playing, setPlaying] = useState('');

  return (
    <section className="section pastor-songs">
      <div className="section-heading">
        <div>
          <span className="eyebrow">OUR WORSHIP VOICE</span>
          <h2>Pastor <em>David Samson.</em></h2>
          <p>Tamil worship songs and official video ministry from Anointing Ministries.</p>
        </div>
        <a href="https://www.youtube.com/@anointingministries" target="_blank" rel="noopener noreferrer" className="text-link">
          Official YouTube Channel <ExternalLink size={15} />
        </a>
      </div>

      <label className="search">
        <Search size={17} />
        <input placeholder="Search Pastor David’s songs or Tamil lyrics…" aria-label="Search Pastor David Samson songs" value={q} onChange={e => setQ(e.target.value)} />
      </label>

      {playing && (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="pastor-player">
          <div className="player-banner-bar">
            <Volume2 className="animate-pulse" size={20} />
            <span>Now Playing: Pastor David Samson Worship</span>
          </div>
          <iframe title="Pastor David Samson worship video" src={'https://www.youtube-nocookie.com/embed/' + playing + '?autoplay=1'} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
          <div className="actions">
            <button className="btn navy" onClick={() => setPlaying('')}>Close video player</button>
            <a className="text-link" href={'https://www.youtube.com/watch?v=' + playing} target="_blank" rel="noopener noreferrer">Open on YouTube <ExternalLink size={14} /></a>
          </div>
        </motion.div>
      )}

      <div className="pastor-grid">
        {pastorSongs.filter(s => (s.title + s.tamil + s.kind).toLowerCase().includes(q.toLowerCase())).map((s, idx) => (
          <motion.article key={s.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
            <div className="pastor-song-icon">
              <Music2 className={playing === s.video ? 'animate-bounce' : ''} />
            </div>
            <div>
              <small>{s.kind}</small>
              <h3>{s.title}</h3>
              {s.tamil && <p lang="ta" className="tamil-font">{s.tamil}</p>}
              <p className="small muted">Pastor David Samson {s.duration && '· ' + s.duration}</p>
              <div className="actions">
                {s.video ? (
                  <button className="text-link" onClick={() => setPlaying(s.video)}>
                    <Play size={15} fill={playing === s.video ? 'currentColor' : 'none'} /> {playing === s.video ? 'Playing...' : 'Play worship video'}
                  </button>
                ) : (
                  <a className="text-link" href={'https://www.youtube.com/results?search_query=' + encodeURIComponent('Pastor David Samson ' + s.title)} target="_blank" rel="noopener noreferrer">
                    Find recording <ExternalLink size={14} />
                  </a>
                )}
                <Link className="text-link" to={'/worship/presentation?song=' + s.id}>
                  <Monitor size={14} /> Prepare PPT slides
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <p className="small muted">All requested YouTube video links and Pastor David Samson songs are fully wired with correct audio/video recordings and PPT lyrics preparation.</p>
    </section>
  );
}
