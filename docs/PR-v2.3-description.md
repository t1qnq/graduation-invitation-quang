## Feature Pack v2.3

Adds five guest-facing features to the static graduation invitation — no build step, no backend, no runtime CDN.

### Features
- **Countdown timer** — live days/hours/minutes/seconds to the ceremony. Single source of truth `EVENT_DATETIME`; shows `Sẽ cập nhật sau` if unset and a static "Buổi lễ đã diễn ra" message once the event passes.
- **Moment-based sound + animation** — synthesized Web Audio chimes + a sparkle burst on envelope-open and on RSVP success. A 🔊/🔇 mute toggle is remembered in `localStorage`; the sparkle is suppressed under `prefers-reduced-motion`; the chime degrades silently if `AudioContext` is unavailable.
- **Directions** — a "Chỉ đường" button opening a Google Maps search for the venue (new tab, `rel="noopener"`, no iframe).
- **Share** — a QR code of the **live page URL** (vendored `assets/qrcode.min.js`, no CDN) plus a copy-link button with a clipboard fallback.
- **Wishes polish** — the optional Lời chúc field is visually emphasized (cosmetic only; still private via Formspree).

### Also
- Set the confirmed ceremony time **`10:00 – 11:45`** (replaces the `Sẽ cập nhật sau` placeholder in the Giờ detail).
- Docs updated: CHANGELOG v2.3, AGENTS.md (ceremony time confirmed + vendored QR note), README, PROJECT_STATUS.

### Verification
- `python -m unittest tests.test_project` → **23 passed**
- `node tests/runtime_checks.js` → **Runtime checks passed**
- `git diff --check` → clean
- Browser smoke test: no console errors; countdown live-ticking; QR rendered; directions link correct; all init functions present; envelope-open flow works.

### Constraints respected
No inline event handlers (all `addEventListener`); RSVP stays `FormData`; `localStorage` UX-only; Vietnamese tone preserved; no runtime CDN (QR vendored).

Spec: `docs/superpowers/specs/2026-06-25-feature-pack-design.md` · Plan: `docs/superpowers/plans/2026-06-25-feature-pack.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
