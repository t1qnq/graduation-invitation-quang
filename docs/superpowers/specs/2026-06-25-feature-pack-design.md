# Feature Pack v2.3 — Design Spec

> Date: 2026-06-25
> Status: Approved design, ready for implementation plan
> Branch target: a new feature branch off `main` after v2.2 merges

## Goal

Add five guest-facing features to the static graduation invitation — a countdown
timer, moment-based sound + animation effects, a directions button, a shareable
QR code, and a polished wishes field — without introducing a build step, a
backend, or any external CDN runtime dependency.

## Confirmed Inputs (from the user)

- **Ceremony date/time:** 05/07/2026 (5 July 2026), **10:00 – 11:45** (Vietnam time, UTC+7).
  This replaces the `Sẽ cập nhật sau` placeholder in the Giờ detail.
- **Venue:** Hội trường Nguyễn Văn Đạo – VNU (already shown in the invite).

These satisfy the long-standing AGENTS.md launch blocker: "Keep `Sẽ cập nhật sau`
until the user provides a confirmed time." The time is now confirmed.

## Architecture

Approach **A** (chosen): keep the existing 3-file static structure
(`index.html` + `style.css` + `app.js`). Each feature is a self-contained,
clearly-sectioned init function in `app.js` (`initCountdown()`, `initSound()`,
`initShare()`), markup in `index.html`, styles in `style.css`. The only new
third-party code is a **vendored QR library file** in `assets/` — no CDN, no
build, works offline. The sound effects are **synthesized with the Web Audio
API** (no audio file, no CDN).

`app.js` keeps its current shape: top-level function declarations as `window`
globals (load-bearing for `tests/runtime_checks.js`, which reads `app.js` and
runs it in a Node `vm`). New init functions follow the same pattern and are
called from the existing `DOMContentLoaded` handler.

### New / changed files

- **`index.html`** — add markup: countdown block, directions button, share
  block, a floating sound on/off toggle, and a sparkle overlay container. Update
  the Giờ detail value to `10:00 – 11:45`.
- **`style.css`** — styles for the new blocks + the sparkle/celebration
  animations; respects the existing `@media (prefers-reduced-motion: reduce)` block.
- **`app.js`** — `initCountdown()`, `initSound()`, `initShare()`; wire them into
  `DOMContentLoaded`; trigger the sound+animation inside the existing
  `openEnvelope()` and on RSVP success.
- **`assets/qrcode.min.js`** — vendored QR generator (single static file).
- **`tests/test_project.py`** — structural regex checks for the new markup/functions.
- **`tests/runtime_checks.js`** — runtime checks for countdown math, music toggle
  state, and share init (with DOM/clipboard stubs).
- **`CHANGELOG.md`** — new `[Unreleased] — v2.3` section.

## Feature Details

### 1. Countdown timer

- Single source of truth: a constant `EVENT_DATETIME = '2026-07-05T10:00:00+07:00'`
  near the top of `app.js`.
- `initCountdown()` computes the delta to now every 1 second and writes
  days/hours/minutes/seconds into four DOM slots.
- **Empty/invalid constant** → render `Sẽ cập nhật sau` instead of numbers and do
  not start the interval (matches the project's placeholder convention).
- **Event already passed** (delta ≤ 0) → stop the interval and show a static
  message such as `Buổi lễ đã diễn ra — cảm ơn bạn!` (no negative numbers).
- Placed directly under the invite message, above the details grid.

### 2. Moment-based sound + animation

Two celebratory moments get a short synthesized chime plus a brief visual effect:

- **Envelope open** — a soft "ting" + a sparkle burst as the invite reveals
  (triggered inside the existing `openEnvelope()`).
- **RSVP success** — a brighter chime + a celebration effect when the thank-you
  screen appears (triggered on successful submit).

Details:
- **Sound source:** synthesized with the Web Audio API (`initSound()` creates an
  `AudioContext` lazily on first user gesture; a small `playChime(type)` helper
  plays a short oscillator note — no audio file, no CDN). The `AudioContext` is
  created/resumed only after a user gesture, satisfying browser autoplay policy.
- **Sound toggle + memory:** a fixed-position 🔊/🔇 toggle mutes/unmutes the
  chimes; the choice is stored in `localStorage` (UX-only memory) and honored on
  return visits. When muted, the visual animation still plays.
- **Reduced-motion:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`,
  skip the sparkle/celebration animation; the short chime may still play unless
  muted. (Sound is not motion, but the effect must never be jarring.)
- **No-audio fallback:** if `AudioContext` is unavailable or throws, the chime is
  silently skipped — the visual effect and the rest of the page are unaffected.

### 3. Directions (map)

- A "Chỉ đường" button under the details grid that opens, in a new tab,
  `https://www.google.com/maps/search/?api=1&query=<url-encoded venue name>`
  with `rel="noopener"`. No iframe, no third-party script, no invented
  coordinates — just a search link for the venue name the user confirmed.

### 4. Share (QR + copy link)

- `initShare()` uses the vendored `assets/qrcode.min.js` to render a QR code from
  **`window.location.href`** into a container in the share block. Because it reads
  the live URL, the QR is correct regardless of the final domain (which is still
  unconfirmed) — this removes the domain dependency.
- A "Sao chép liên kết" button calls `navigator.clipboard.writeText(window.location.href)`,
  with a `document.execCommand('copy')` fallback for older browsers, and shows a
  brief "Đã sao chép!" confirmation.
- Placed at the bottom of the invite screen.

### 5. Wishes field (polish only)

- The RSVP form already has an optional `Lời chúc` textarea submitted via
  Formspree. This feature is **cosmetic only**: nicer label/styling and slightly
  more prominence. No logic change. Wishes remain private to the host (sent via
  Formspree `FormData`); there is no public wishes wall (a public wall was
  rejected during brainstorming as it would require a backend and expose guest
  data).

## Data Flow

- Countdown, sound/animation, QR, and copy-link are entirely client-side; no
  network calls except the Google Maps link the user explicitly clicks.
- RSVP submission is unchanged: `FormData` to the existing Formspree endpoint
  (not JSON). The wishes field rides along in that same `FormData` as today.

## Error Handling

- Countdown: invalid constant → placeholder; past event → static message.
- Sound: `AudioContext` unavailable/throws → skip chime silently; reduced-motion
  → skip the visual animation.
- QR: if the vendored library fails to load, the share block hides the QR area
  but keeps the copy-link button working.
- Copy link: clipboard API failure → `execCommand` fallback → if both fail, show
  the URL in a selectable field.

## Constraints (preserved verbatim from AGENTS.md)

- No inline event attributes — all new handlers bind via `addEventListener`
  (the mockup's `onclick` was illustration only).
- RSVP data stays `FormData`, not JSON.
- `localStorage` is UX-only memory.
- Preserve the Vietnamese copy and the formal-but-warm invitation tone.
- No CDN at runtime — the QR library is vendored.

## Testing

- **`tests/test_project.py`** (Python `unittest`, structural regex): assert the
  countdown markup + `EVENT_DATETIME` constant exist; the sound toggle +
  `initSound` / `playChime` exist; the directions link points at
  `google.com/maps`; the share block + vendored `assets/qrcode.min.js` reference
  + `initShare` exist; the Giờ detail now reads `10:00 – 11:45` and the
  `Sẽ cập nhật sau` placeholder is gone.
- **`tests/runtime_checks.js`** (Node `vm`): countdown math returns correct
  remaining units for a fixed "now"; the past-event case yields the static
  message; the sound toggle flips state and persists to a `localStorage` stub,
  and `playChime` is a no-op (does not throw) when `AudioContext` is absent from
  the stubbed context; QR/copy init runs without throwing under DOM/clipboard stubs.
- All existing tests must continue to pass.

## Out of Scope (deferred)

- Public/live wishes wall (needs a backend) — rejected.
- "Add to calendar" / `.ics` — not selected this round.
- RSVP export tool — data already lives in the Formspree dashboard (YAGNI).
- Confirming the final production domain, creating `CNAME`, and the real
  Formspree delivery test — still tracked in `docs/DEPLOYMENT.md`.
