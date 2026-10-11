# Anointing Ministries — Worship & Community

React 19 + TypeScript + Tailwind CSS + Framer Motion + Lucide + React Router, hosted through Vinext on Cloudflare Workers. This is an installable web app (PWA), not an App Store / Play Store binary.

## Run locally

Requires Node 22.13+ and pnpm 11.25.0. From the project directory:

```sh
corepack enable
pnpm install
pnpm dev
```

Open the URL printed by the server. Build with `pnpm build`; production server with `pnpm start`. The included hosting/build integration targets Sites. The `.openai/hosting.json` in the ZIP declares the DB binding without a Site identity; register a new Site or use your existing deployment workflow. If deploying independently, configure a Worker, static assets, and a real D1 database before deployment. Do not use the starter's placeholder database ID as a real remote ID. Execute `drizzle/0000_sleepy_hedge_knight.sql` on the chosen D1 database. Never expose database identity headers to untrusted clients: the Sites gateway supplies and verifies `oai-authenticated-user-id`. An independent host needs equivalent trusted authentication middleware.

## Included

- Real uploaded ministry logo, congregation photo, official channel banner and five ministry video thumbnails; responsive photo gallery. Additional Instagram/Facebook images were not available for complete import.
- Front-page daily scripture in Tamil, English or both. Daily selection uses Asia/Kolkata and rotates through 14 verified verses. Logo-watermarked PNG sharing, local favorites, copying and sending to presentation studio.
- Full user-supplied Tamil BSI and English KJV texts: each has 66 books and 31,102 verses. Search, book/chapter navigation, bilingual reading. Books load on demand. Previously read books are available through the offline reader after service-worker activation.
- D1-backed verse likes and comments for signed-in visitors. Explicit consent for public comments; visitors can delete their own comments. Rate limiting and same-origin checks. The current hosted site remains owner-private; broad community access requires an intentional sharing change.
- YouTube live checking with no fabricated LIVE badge. Checks every 90 seconds while a visible app is open. Confirms channel ID and active broadcast metadata; optional YouTube Data API fallback. Shows unknown if neither source can verify a stream. Browser notifications require permission and an open app; no closed-app push backend is included.
- Ten Pastor David Samson song entries, including all nine user-supplied titles. Four verified video/teaser links; remaining entries use labeled YouTube searches. Teasers are clearly marked. These are embedded videos, not downloadable audio or a licensed streaming catalog.
- FreeShow-inspired browser presentation studio: service rundown with drag and button reorder, lyrics split into slides, Tamil/English Bible picker, editable text, preview/take workflow, separate control-free audience tab, auto advance, black screen, transitions, background choices, type size/alignment, logo overlay, local save and JSON export/import. It is not FreeShow and does not implement native multi-monitor display enumeration, remote operator control, advanced video mixing, or hardware output.
- ChristSquare browse link and authorized text import. No complete third-party lyric catalog is bundled. Three public-domain hymn texts are included. Pastor song lyrics must be supplied with permission.
- Private prayer/contact forms with birthday category, birthday consent and validation. No prayer or birthday is stored in the site database. Gmail API integration is implemented; actual email delivery is NOT connected without the secrets below. If disconnected, the form says not sent and offers a Gmail compose page for the visitor to review and send manually.
- PWA install prompts and offline Bible reader. Browser support varies; iOS uses Safari > Share > Add to Home Screen. HTTPS required.

## Connect Gmail delivery

Destination is fixed server-side to **maker200222@gmail.com**. Do not put credentials in client files or commit them. Configure these runtime secrets through the host:

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_SENDER` (the Gmail account authorized by the token)

Enable Gmail API in your Google Cloud project; create an OAuth client and authorize the sender using `https://www.googleapis.com/auth/gmail.send` with offline access. Follow Google's OAuth setup and app verification requirements for your account. Store the refresh token as a secret. The server exchanges it for an access token and sends a UTF-8 MIME email via `users/me/messages/send`. Test with a non-sensitive request after connecting; a successful response means Gmail accepted the message, not guaranteed inbox delivery. No account authorization or outgoing test message was performed during development.

Docs: https://developers.google.com/workspace/gmail/api/guides/sending

## Optional reliable YouTube API fallback

Configure server-only `YOUTUBE_API_KEY` with YouTube Data API enabled. Channel ID: `UCVlqXBkmLozubnyVjUeD5Zw`. API search results are cached for 15 minutes to limit quota use; live metadata is rechecked before declaring LIVE. Detection may be delayed by caching and API availability. Public page metadata is tried first, but YouTube can block server requests or change its page structure.

Docs: https://developers.google.com/youtube/v3/docs/search/list

## Content and privacy

See SOURCES.md for media provenance. Bible data is generated from the two XML files supplied by the user. The Tamil BSI translation is not represented as public domain. Preserve the relevant publication permissions and notices when distributing it. To regenerate, place the original files in a folder and run `python3 scripts/import-bibles.py /path/to/folder`. Original XML is not required at runtime. No complete copyrighted ChristSquare lyrics were copied. Audio imports are browser-session-only; do not expect them to persist after closing the app.

Event schedules remain explicitly sample/unconfirmed. Sermons retain labeled sample content until actual recordings are supplied. Church phone, exact map embed and next service time remain unset instead of guessed. Official user-supplied social links are connected.

## Validation

TypeScript and optimized Worker build passed. Server-rendered route checks covered 13 paths including Bible, live, prayer, studio and audience. Audience markup contains no operator buttons. Bible counts and all 14 daily verse pairs were checked against supplied text. Live detector tests reject historical videos, a wrong channel and missing metadata. Presentation import validation rejects empty/out-of-range/malformed decks. These do not replace browser/device QA: responsive visual rendering, fullscreen, browser share, audio, notifications, installation, popup handling and projector use still need hands-on testing in target browsers. No Gmail message was sent during testing.
