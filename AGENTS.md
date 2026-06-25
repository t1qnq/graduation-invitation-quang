# AGENTS.md

This file is the first context stop for future Codex/agent sessions on this project.

## Project Snapshot

- Product: personal graduation invitation for Quách Ngọc Quang.
- App type: static single-page site, no build step, no bundled dependencies.
- Structure: 3-file static site — `index.html` (markup), `style.css` (styles),
  `app.js` (vanilla JavaScript, loaded with `defer`).
- RSVP backend: Formspree endpoint in `RSVP_ENDPOINT`.
- Social preview asset: `preview.png`.
- Current date context: event date is `2026-07-05`; ceremony time is confirmed
  as `10:00 – 11:45`. The countdown reads `EVENT_DATETIME` in `app.js` as the
  single source of truth. If the time ever changes, update it there **and** in
  the `Giờ` detail in `index.html`.

## Source Of Truth Order

1. `AGENTS.md` for working context and constraints.
2. `docs/PROJECT_STATUS.md` for current status, blockers, and verification history.
3. `docs/ARCHITECTURE.md` for runtime structure and data flow.
4. `CHANGELOG.md` for version history and the current version number.
5. `README.md` for quick start commands.
6. `PRD-graduation-invitation.md` for product intent and acceptance criteria.

Older reports in `docs/archive/` are historical. Do not treat them as current instructions unless the current docs explicitly reference them.

## Development Rules

- Keep the app static and dependency-light unless the user asks for a build system.
- The ceremony time is confirmed (`10:00 – 11:45` on `05/07/2026`). Do not revert to `Sẽ cập nhật sau`.
- Do not perform real Formspree submissions unless the user explicitly asks; that can email the host and consume quota.
- Preserve Vietnamese copy and the formal-but-warm invitation tone.
- Avoid inline event attributes. Bind interactions in the `DOMContentLoaded` initializer.
- Keep RSVP data as `FormData`, not JSON, for Formspree compatibility.
- Treat `localStorage` as UX-only memory. Formspree is the source of truth for actual RSVP data.

## Git Workflow

- Versions are tracked only in `CHANGELOG.md`. Do not put version numbers in
  other docs except as a cross-reference to the changelog.
- Work pattern: commit a baseline on `main`, branch (`feat/<topic>`), then open a
  PR back into `main`. Merge only after the full verification gate passes.
- One logical change per commit. Run the verification commands below before
  claiming a change is complete.

## Verification Commands

Run these before claiming a change is complete:

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

For visual changes, also open the page locally with `python -m http.server 8080` and inspect `http://127.0.0.1:8080/`.

## Known External Dependencies

- Google Fonts are loaded from `fonts.googleapis.com` / `fonts.gstatic.com`.
- Formspree receives RSVP submissions.
- Deployment/domain assumptions currently point at `https://quang-grad-2026.xyz/`.
- `assets/qrcode.min.js` is a vendored QR library (no CDN). The share QR
  encodes `window.location.href`, so it self-corrects across domains without
  any code change.

## Current Launch Blockers

- Test one real RSVP through Formspree from the deployed URL.
- Test on at least one iPhone-sized viewport, one Android/Chrome device or emulator, and desktop.
