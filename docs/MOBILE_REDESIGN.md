# Mobile worship redesign

The website uses the supplied three-screen reference: warm ivory surfaces, burgundy controls, gold accents, church photography, a centered ministry header, and persistent Home/Bible/Worship/Community/Profile tabs on small screens.

## Screens and behavior

- Home places the daily scripture directly below the worship hero, followed by quick access and a community invitation. Existing ministry sections remain available below.
- `/bible` is a reading and worship hub. The full searchable Tamil/English reader remains at `/bible/read`; its chapter, language and saved-verse preferences persist locally.
- `/community` links to existing announcements and hands an unsent prayer draft to the existing validated `/prayer` form. It does not submit from the overview. A future service date appears only when configured in `src/config.ts`; otherwise visitors are directed to contact the ministry.
- `/profile` uses the existing membership modal and notification preferences. Header and profile update after sign-in/sign-out. Saved verses and favorite songs use existing local storage keys.
- Worship previews open the existing song video IDs in a closable, named native dialog, with an original YouTube link.
- Drawer navigation supports Escape, focus containment, focus restoration and body scroll locking. Bottom tabs identify the current page, account for safe areas and leave space for the existing player. Reduced-motion preferences remain supported.
- Operator studio and audience display stay outside the website shell and retain their existing interface.

## Validation

- `bun run test:mobile`: 13 passing regression cases (78 assertions), covering the new routes, retained reader, draft handoff, active navigation, audience separation and local image references.
- `tsc --noEmit` and `next build` passed. No dependency versions or lockfiles changed.
- Browser checks used a temporary React/MemoryRouter component harness because the managed Vinext dev root did not load in this environment. The harness was removed from the deliverable. These checks do not establish production SSR/API or deployed behavior.
- All three reference screens were checked at 320, 360, 390, 430, 768 and 1280px, with no horizontal document overflow. Browser interaction checks covered drawer opening/Escape, bottom tabs, profile preferences, English scripture, chapter selection, saved verses, prayer draft transfer and worship dialog opening/closing.
- No real prayer/contact submissions, push subscriptions or membership credentials were entered during testing.

## Existing integrations

Firebase content listeners, livestream detection, song data, prayer delivery, membership authentication and notification services are retained. This change does not provision their credentials, validate delivery to Gmail, replace the existing authentication model, or certify existing data/privacy handling. Configure and verify these services separately before treating the site as production-ready. Church images and song metadata are reused from the repository; no unverified event dates, pastor profiles or LIVE states were added to the new overview screens.
