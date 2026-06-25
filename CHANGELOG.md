# Changelog

This file is the single source of truth for version numbers. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — v2.3

Feature pack: countdown, sound/sparkle effects, directions, share block.

- Added: countdown timer to the ceremony (`EVENT_DATETIME` in `app.js` is the
  single source of truth; shows `Sẽ cập nhật sau` if unset; shows a past-event
  message after the date passes).
- Added: moment-based Web Audio chimes + sparkle burst on envelope open and on
  RSVP success; 🔊/🔇 mute toggle persisted in `localStorage`
  (`grad_sound_muted`); sparkle suppressed under `prefers-reduced-motion`.
- Added: "Chỉ đường" Google Maps directions button linking to a Maps search for
  the venue.
- Added: share block — QR code of the live page URL (vendored
  `assets/qrcode.min.js`, no CDN) + copy-link button with clipboard API and
  text-selection fallback.
- Changed: set confirmed ceremony time to `10:00 – 11:45` (replaces the
  `Sẽ cập nhật sau` placeholder in the Giờ detail).
- Changed: emphasized the optional wishes field with dedicated styling.

## [Unreleased] — v2.2

Optimization & workflow-consistency pass.

- Split `index.html` into `index.html` + `style.css` + `app.js` (no build step).
- Honeypot `_gotcha` is now appended to the submitted `FormData` so Formspree's
  server-side spam filter sees it (client-side check retained).
- Accessibility: skip-link to the RSVP form, `aria-hidden` on decorative detail
  icons, `aria-describedby` hints for the name and message fields,
  `tabindex="-1"` on the radio-card labels so keyboard focus lands on the radio
  inputs, and an instant (no-delay) envelope open under
  `prefers-reduced-motion`.
- Performance: `preconnect` to the Google Fonts origins; fewer background
  particles on small viewports.
- Robustness: guest name is capped at 100 characters on submit.
- Added `.nojekyll` and `docs/DEPLOYMENT.md` (deploy prep only — no real deploy).

## [v2.1]

- Accessibility: inert/`aria-hidden` screen management, focus management on
  screen change, live regions for errors, reduced-motion handling.
- 60-second repeat-submit guard.
- Improved low-contrast helper text and status colors.
- Handoff docs: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STATUS.md`.
- Python and Node regression tests.

## [v2.0]

- Formspree RSVP endpoint wired up (`FormData` submission, timeout handling).

## [v1.0]

- Initial graduation invitation: envelope → invite/RSVP → thank-you flow,
  `?guest=` pre-fill, social preview image.
