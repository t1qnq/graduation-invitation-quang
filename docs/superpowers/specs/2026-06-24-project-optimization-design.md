# Project Optimization & Workflow-Consistency Design

> Date: 2026-06-24
> Status: Approved (design)
> Topic: Make the graduation-invitation project the best it can be, and fix the
> documentation/handoff files so future agent workflows stay consistent.

## 1. Goal

Two intertwined goals, in order of importance:

1. **Workflow consistency.** Remove the contradictions that make handoff between
   sessions error-prone: two coexisting plans, stale git assumptions, a README
   pointer to the wrong plan, a version mismatch (PRD says v2.1, git history says
   v1.0), and a single-file-vs-multi-file architecture conflict. After this pass,
   any future agent reading `AGENTS.md` first should reach a single, coherent
   source of truth.
2. **Safe technical improvements.** Split `index.html` into three static assets,
   fix the honeypot, improve accessibility, and make small performance and
   robustness fixes — without changing the visual design or the Vietnamese copy.

This is explicitly *not* a launch. No real deploy, no real Formspree submission,
no event-time guesswork.

## 2. Versioning & Git Workflow

### 2.1 Single version source

Create `CHANGELOG.md` as the **single source of truth for version numbers**.
Reconstruct the history honestly, in chronological order:

- `v1.0` — initial graduation invitation (`6003130 feat: graduation invitation v1.0`).
- `v2.0` — Formspree endpoint wired up (`09a2dbf feat: add Formspree endpoint`).
- `v2.1` — accessibility, repeat-submit guard, contrast, docs (AGENTS/ARCHITECTURE/
  PROJECT_STATUS), regression tests. This is the currently-uncommitted improvement
  work and matches the label the PRD already uses; it becomes the baseline commit.
- `v2.2` — *this* optimization pass (asset split, honeypot fix, a11y, perf,
  deploy prep). Marked "Unreleased" until merged.

This ordering is chronologically honest (the Formspree commit predates the a11y
work) **and** keeps the PRD's existing "v2.1" label valid, so no version churn is
needed in the PRD beyond confirming it (see §4).

### 2.2 Git workflow

Agreed: **Baseline → feature branch → PR.**

1. Commit the current uncommitted tree as the **v2.1 baseline** on `main`
   (this captures the existing docs + tests as the starting point). The design
   spec from this brainstorm is part of that baseline.
2. Create a feature branch `feat/optimization` for all §3–§4 work.
3. Open a PR back into `main`; merge when verification passes.

This convention is documented in `AGENTS.md` so future sessions follow it.

## 3. Documentation Unification (structure-independent — done first)

These edits do not depend on the code split, so they land first and give every
later commit a coherent doc base.

| File | Change |
| --- | --- |
| `AGENTS.md` | Add a **Workflow** section (baseline → branch → PR; commit conventions; "run verification before claiming done"). Change "single-page site … Main file `index.html` contains HTML, CSS, and JavaScript" to "**3-file static site, no build**: `index.html` + `style.css` + `app.js`." Fix the Source-of-Truth order to include `CHANGELOG.md`. |
| `CHANGELOG.md` | New file, per §2.1. |
| `README.md` | Fix the **Current Context** pointer (currently points at the old context plan) to point at this spec and the new plan. Update file list to mention `style.css` / `app.js`. |
| `docs/PROJECT_STATUS.md` | Add a **domain-confirm** blocker (final domain must be set before deploy; `og:image`/canonical depend on it). Update "Implemented" once the split lands. |
| `docs/ARCHITECTURE.md` | Update the Files table and Overview to describe the 3-asset structure. |
| `docs/superpowers/plans/2026-06-11-project-optimization-context.md` | Mark header **COMPLETED** (historical). |
| `docs/superpowers/plans/2026-06-11-full-project-optimization.md` | Mark header **SUPERSEDED by 2026-06-24 plan** (its git assumptions are stale). |

Order rule going forward (recorded in `AGENTS.md`):
`AGENTS.md → PROJECT_STATUS → ARCHITECTURE → CHANGELOG → README → PRD`.

## 4. PRD Reconciliation

`PRD-graduation-invitation.md` is updated to match reality, not the reverse:

- Background color stated as `#0a0a14` (matches `index.html` line ~39), not
  `#1a1a2e`.
- §6.3 honeypot: rewrite to describe the **fixed** behavior (see §5b) — `_gotcha`
  is appended to `FormData` *and* the client-side early-return check remains.
- Error-button copy: the PRD's "Thử lại" retry text becomes the implemented
  behavior (see §5d).
- Version label: confirm the PRD's existing "v2.1" matches `CHANGELOG.md`
  (no change needed beyond a cross-reference).

## 5. Code Changes (TDD, on `feat/optimization`)

Each behavior change gets a failing test first (red), then implementation (green),
then commit. Visual design and Vietnamese copy are preserved throughout.

### 5a. Split `index.html` → `index.html` + `style.css` + `app.js`

- Move the inline `<style>` block to `style.css`, linked via `<link rel="stylesheet">`.
- Move the inline `<script>` block to `app.js`, loaded with `<script defer>`.
- No behavior change. `index.html` keeps the same markup, meta tags, and screens.
- Update `tests/test_project.py` and `tests/runtime_checks.js` to read from the
  new files: the Python structural checks point at whichever file owns each
  pattern (markup→`index.html`, CSS→`style.css`, JS→`app.js`); the Node harness
  loads `app.js` instead of regex-extracting script from HTML.
- `docs/ARCHITECTURE.md` + `AGENTS.md` file tables are updated **in the same
  commit** as the split so docs never describe a structure that doesn't exist.

### 5b. Honeypot fix

- Append `_gotcha` to the submitted `FormData` so Formspree's server-side spam
  filter also sees it (today it is only checked client-side and never sent).
- Keep the existing client-side early-return when `_gotcha` is non-empty.
- Update PRD §6.3 accordingly.

### 5c. Accessibility

- Add a **skip link** (`#skip-to-invite`) as the first focusable element.
- Mark decorative emoji icons (📅 📍 🕐 🎓) `aria-hidden="true"`.
- Add `aria-describedby` linking the name and message inputs to their hint text.
- Add `tabindex="-1"` to `.radio-card` wrappers so keyboard focus lands on the
  actual radio inputs, not the card div (current focus-order bug).
- Under `prefers-reduced-motion`, skip the 600ms envelope-open animation delay
  and transition screens immediately.

### 5d. Performance

- Add `<link rel="preconnect">` for `fonts.googleapis.com` and
  `fonts.gstatic.com` (the latter with `crossorigin`).
- Reduce particle count on mobile viewports (20 → 10) in `initParticles()`.

### 5e. Robustness

- Cap the name field length at submit time (defensive max length) before building
  `FormData`, mirroring the existing message-length cap.

## 6. Deploy Prep Only (no real deploy)

- Add an empty `.nojekyll` file (GitHub Pages should serve `app.js`/`style.css`
  verbatim).
- Create `docs/DEPLOYMENT.md` with a pre-deploy checklist: confirm final domain,
  update `og:image` + canonical URL to that domain, set the ceremony time, do one
  real Formspree test from the live URL, test mobile + desktop.
- `CNAME` is **deferred** — created only when the real domain is confirmed.

## 7. Testing

- Keep both harnesses (Python structural + Node `vm` runtime).
- Red-test-first for honeypot-in-FormData, skip-link presence, `aria-hidden`
  icons, name-length cap, and the reduced-motion path.
- Full verification gate before the PR:
  ```powershell
  python tests\generate_preview.py
  python -m unittest -v tests.test_project
  node tests\runtime_checks.js
  git diff --check
  ```

## 8. Commit Sequence

1. (baseline already committed on `main`; branch `feat/optimization`)
2. Docs unification (§3) + PRD reconciliation (§4) + `CHANGELOG.md`.
3. Asset split (§5a) — code + tests + structure docs together.
4. Honeypot fix (§5b) + PRD §6.3.
5. Accessibility (§5c).
6. Performance (§5d) + robustness (§5e).
7. `.nojekyll` + `docs/DEPLOYMENT.md` (§6); finalize `CHANGELOG.md` v2.2 entry.
8. Verify (§7) → open PR.

## 9. Out of Scope

- Real deployment, `CNAME`, final domain wiring.
- Inventing the ceremony time.
- Real Formspree submission.
- A Content-Security-Policy. **Note:** once CSS/JS are external files (§5a), a
  meaningful CSP becomes feasible — flag it as the natural *next* security step,
  but do not implement it in this pass.
- Playwright/browser E2E, analytics, and any new product features.

## 10. Follow-up (deferred, explicitly requested)

After this optimization pass is implemented and merged, run a **separate
brainstorming session to develop/expand the project's feature ideas** (e.g.
countdown timer, background music, embedded map, photo gallery, RSVP export,
QR code for sharing). That is its own spec → plan → implementation cycle and is
tracked as a follow-up task — it is intentionally not part of this design.
