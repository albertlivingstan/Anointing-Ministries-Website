import { json, settings } from '../../../server/common';
import { extractPlayer, confirmedLive, CHANNEL } from '../../../server/live';

// Safe in-memory cache
let memoryCache: { data: any; expires: number } | null = null;

const DEFAULT_VIDEO_ID = 'tKIroxrTbG8'; // Latest verified Anointing Ministries Sunday/Sabbath service
const DEFAULT_TITLE = 'Sunday Worship Service · Anointing Ministries';

export async function GET() {
  const e = settings();

  // Check cache first
  if (memoryCache && memoryCache.expires > Date.now()) {
    return json(memoryCache.data);
  }

  let state: any = {
    status: 'offline',
    videoId: DEFAULT_VIDEO_ID,
    title: DEFAULT_TITLE,
    channel: 'https://www.youtube.com/@AnointingMinistries',
    liveUrl: 'https://www.youtube.com/@AnointingMinistries/live',
    nextService: 'Sunday 9:00 AM & 6:30 PM IST',
    location: 'Madukkarai Sanctuary, Coimbatore',
    checkedAt: new Date().toISOString()
  };

  try {
    // If YouTube API Key is configured, use official API
    if (e.YOUTUBE_API_KEY) {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.search = new URLSearchParams({
        part: 'snippet',
        channelId: CHANNEL,
        eventType: 'live',
        type: 'video',
        key: e.YOUTUBE_API_KEY,
        maxResults: '1'
      }).toString();

      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const searchResult: any = await res.json();
        const hit = searchResult?.items?.[0];
        if (hit?.id?.videoId) {
          state = {
            status: 'live',
            videoId: hit.id.videoId,
            title: hit.snippet?.title || 'Live Worship Service',
            channel: 'https://www.youtube.com/@AnointingMinistries',
            liveUrl: 'https://www.youtube.com/@AnointingMinistries/live',
            checkedAt: new Date().toISOString()
          };
        }
      }
    } else {
      // Attempt channel check with timeout
      try {
        const r = await fetch('https://www.youtube.com/@AnointingMinistries/live', {
          signal: AbortSignal.timeout(5000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en'
          }
        });
        if (r.ok) {
          const html = await r.text();
          const player = extractPlayer(html);
          const live = confirmedLive(player);
          if (live) {
            state = {
              ...live,
              channel: 'https://www.youtube.com/@AnointingMinistries',
              liveUrl: 'https://www.youtube.com/@AnointingMinistries/live',
              checkedAt: new Date().toISOString()
            };
          }
        }
      } catch {
        // Fallback gracefully without throwing
      }
    }
  } catch (err) {
    console.warn('Live API check warning:', err);
  }

  // Cache for 60 seconds
  memoryCache = {
    data: state,
    expires: Date.now() + 60000
  };

  return json(state);
}
