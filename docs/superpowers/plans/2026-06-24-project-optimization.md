# Project Optimization & Workflow-Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the graduation-invitation project internally consistent (one source of truth across docs) and apply safe technical improvements — split `index.html` into 3 static assets, fix the honeypot, improve accessibility and performance — without changing the visual design or Vietnamese copy.

**Architecture:** Static, no-build, 3-file site: `index.html` (markup) + `style.css` + `app.js` (vanilla JS, `defer`). RSVP posts `FormData` to Formspree. Two regression harnesses: Python structural checks (`tests/test_project.py`) and a Node `vm` runtime harness (`tests/runtime_checks.js`). Work happens on a `feat/optimization` branch after a baseline commit on `main`, merged via PR.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES2020), Python `unittest`, Node.js `vm`, Git/GitHub, PowerShell (Windows shell).

**Design spec:** `docs/superpowers/specs/2026-06-24-project-optimization-design.md`

---

## Conventions for every task

- Run commands from the project root: `C:\Users\Admin\Documents\Vin\New folder`.
- The Windows shell is PowerShell. Test commands shown use PowerShell syntax.
- Full verification gate (run before any commit that touches code or tests):
  ```powershell
  python tests\generate_preview.py
  python -m unittest -v tests.test_project
  node tests\runtime_checks.js
  git diff --check
  ```
- Commit message trailer (end every commit message with):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```
- Preserve Vietnamese copy and the formal-but-warm tone. Do not invent the ceremony time (`Sẽ cập nhật sau` stays). Do not perform a real Formspree submission.

---

## Task 1: Baseline commit + feature branch

This captures the current uncommitted v2.1 work (docs, tests) plus the brainstorm spec/plan as the baseline on `main`, then branches for the optimization. This deliberately commits to `main` first — it is the user-approved "baseline → branch → PR" workflow.

**Files:**
- Modify: git tree (no source edits)

- [ ] **Step 1: Confirm current branch and state**

Run:
```powershell
git branch --show-current
git status --short
```
Expected: branch is `main`; a list of staged/unstaged files including `AGENTS.md`, `README.md`, `docs/...`, `tests/...`, and the new `docs/superpowers/specs/2026-06-24-project-optimization-design.md` and `docs/superpowers/plans/2026-06-24-project-optimization.md`.

- [ ] **Step 2: Stage everything and commit the baseline**

Run:
```powershell
git add -A
git commit -m @'
chore: baseline v2.1 (docs, regression tests, Formspree endpoint, optimization spec+plan)

Captures the accessibility/contrast/repeat-guard work, handoff docs, and the
2026-06-24 optimization spec and plan as the starting point before the v2.2
optimization pass.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```
Expected: a commit is created. `git status --short` is now empty.

- [ ] **Step 3: Create and switch to the feature branch**

Run:
```powershell
git checkout -b feat/optimization
git branch --show-current
```
Expected: output `feat/optimization`.

---

## Task 2: Documentation unification, CHANGELOG, PRD reconciliation

All edits here are structure-independent (they don't depend on the code split), so they land first. No automated test for prose; verified by a new structural test (Step 7) plus `git diff` review.

**Files:**
- Create: `CHANGELOG.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/superpowers/plans/2026-06-11-project-optimization-context.md` (header only)
- Modify: `docs/superpowers/plans/2026-06-11-full-project-optimization.md` (header only)
- Modify: `PRD-graduation-invitation.md`
- Test: `tests/test_project.py`

- [ ] **Step 1: Create `CHANGELOG.md`**

Create `CHANGELOG.md`:
```markdown
# Changelog

This file is the single source of truth for version numbers. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — v2.2

Optimization & workflow-consistency pass.

- Split `index.html` into `index.html` + `style.css` + `app.js` (no build step).
- Honeypot `_gotcha` is now appended to the submitted `FormData` so Formspree's
  server-side spam filter sees it (client-side check retained).
- Accessibility: skip-link to the RSVP form, `aria-hidden` on decorative detail
  icons, `aria-describedby` hints for the name and message fields, focusable
  radio cards for keyboard arrow navigation, and an instant (no-delay) envelope
  open under `prefers-reduced-motion`.
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
```

- [ ] **Step 2: Update `AGENTS.md` — app type, source-of-truth order, workflow**

In `AGENTS.md`, replace this line (under "Project Snapshot"):
```markdown
- Main file: `index.html` contains HTML, CSS, and vanilla JavaScript.
```
with:
```markdown
- Structure: 3-file static site, no build step — `index.html` (markup),
  `style.css` (styles), `app.js` (vanilla JavaScript, loaded with `defer`).
```

In the "Source Of Truth Order" list, insert `CHANGELOG.md` as a new item before `PRD-graduation-invitation.md`, so the list reads:
```markdown
1. `AGENTS.md` for working context and constraints.
2. `docs/PROJECT_STATUS.md` for current status, blockers, and verification history.
3. `docs/ARCHITECTURE.md` for runtime structure and data flow.
4. `CHANGELOG.md` for version history and the current version number.
5. `README.md` for quick start commands.
6. `PRD-graduation-invitation.md` for product intent and acceptance criteria.
```

Add a new section immediately after "Development Rules":
```markdown
## Git Workflow

- Versions are tracked only in `CHANGELOG.md`. Do not put version numbers in
  other docs except as a cross-reference to the changelog.
- Work pattern: commit a baseline on `main`, branch (`feat/<topic>`), then open a
  PR back into `main`. Merge only after the full verification gate passes.
- One logical change per commit. Run the verification commands below before
  claiming a change is complete.
```

- [ ] **Step 3: Fix the `README.md` "Current Context" pointer and file list**

In `README.md`, find the "Current Context" pointer that references
`docs/superpowers/plans/2026-06-11-project-optimization-context.md` and repoint it:
```markdown
## Current Context

- Active spec: `docs/superpowers/specs/2026-06-24-project-optimization-design.md`
- Active plan: `docs/superpowers/plans/2026-06-24-project-optimization.md`
- Version history: `CHANGELOG.md`
```
Also, wherever `README.md` lists project files and mentions `index.html` as
containing CSS/JS, update it to list the 3 files:
```markdown
- `index.html` — markup and screen structure
- `style.css` — all styles
- `app.js` — vanilla JavaScript (loaded with `defer`)
```
(If `README.md` has no such file list, skip the second edit.)

- [ ] **Step 4: Add a domain-confirm blocker to `docs/PROJECT_STATUS.md`**

In `docs/PROJECT_STATUS.md`, under "## Still Blocking Launch", add this bullet:
```markdown
- Final domain is not confirmed. `og:image` and the canonical URL currently
  point at `https://quang-grad-2026.xyz/`; these must be updated to the real
  domain before launch (see `docs/DEPLOYMENT.md`).
```
Update the "> Last updated" line to `2026-06-24`.

- [ ] **Step 5: Mark the two older plans as historical (header edits only)**

At the very top of `docs/superpowers/plans/2026-06-11-project-optimization-context.md`, add:
```markdown
> **STATUS: COMPLETED (historical).** Superseded by the 2026-06-24 optimization
> plan. Kept for history; do not execute.
```
At the very top of `docs/superpowers/plans/2026-06-11-full-project-optimization.md`, add:
```markdown
> **STATUS: SUPERSEDED (historical).** Its git assumptions are stale. Replaced by
> `docs/superpowers/plans/2026-06-24-project-optimization.md`. Do not execute.
```

- [ ] **Step 6: Reconcile `PRD-graduation-invitation.md` with reality**

Make these edits in `PRD-graduation-invitation.md`:
1. Background color: wherever it states the background is `#1a1a2e`, change to
   `#0a0a14` (matches `index.html`/`style.css`).
2. §6.3 honeypot: replace the note that says `_gotcha` is not appended to the
   payload with:
   > `_gotcha` is checked client-side (empty-string early return) **and** appended
   > to the submitted `FormData`, so Formspree's server-side spam filter also sees
   > it.
3. Error-button copy: where the PRD specifies the submit button shows "Thử lại"
   on error, note it is implemented as a retry affordance — see Task 6, Step 7.
   (Reword the PRD sentence to describe current behavior, do not delete the intent.)
4. Add a one-line cross-reference near the version label: `Version history is
   tracked in CHANGELOG.md (current: v2.1; v2.2 in progress).`

- [ ] **Step 7: Write a failing doc-consistency test**

In `tests/test_project.py`, add this test method inside `GraduationInvitationChecks`:
```python
    def test_docs_are_consistent_after_unification(self):
        self.assertTrue((ROOT / "CHANGELOG.md").is_file())
        agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8-sig")
        self.assertIn("style.css", agents)
        self.assertIn("app.js", agents)
        self.assertIn("CHANGELOG.md", agents)
        readme = (ROOT / "README.md").read_text(encoding="utf-8-sig")
        self.assertNotIn("2026-06-11-project-optimization-context.md", readme)
```

- [ ] **Step 8: Run the test to verify it fails (then passes)**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_docs_are_consistent_after_unification
```
Expected: After Steps 1–6 are done, this PASSES. If you wrote Step 7 before doing
Steps 1–6, it FAILS first (missing `CHANGELOG.md` / README still references the old
plan), then passes once Steps 1–6 are complete.

- [ ] **Step 9: Run the full suite and commit**

Run the full verification gate (see Conventions). Expected: all green, `git diff --check` clean.

Run:
```powershell
git add -A
git commit -m @'
docs: unify handoff docs, add CHANGELOG, reconcile PRD with code

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 3: Split `index.html` into `index.html` + `style.css` + `app.js`

Pure refactor — no behavior change. Tests are migrated to read from the new files
(via a combined-source string) and a new test enforces externalization.

**Files:**
- Create: `style.css`
- Create: `app.js`
- Modify: `index.html` (replace inline `<style>` block at lines 19–761 and inline `<script>` block at lines 909–1301)
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Write the failing externalization test**

In `tests/test_project.py`, add:
```python
    def test_styles_and_script_are_external(self):
        self.assertTrue((ROOT / "style.css").is_file())
        self.assertTrue((ROOT / "app.js").is_file())
        html = HTML_PATH.read_text(encoding="utf-8-sig")
        self.assertIn('<link rel="stylesheet" href="style.css">', html)
        self.assertIn('<script src="app.js" defer></script>', html)
        # No inline style/script blocks remain in the markup.
        self.assertNotIn("<style>", html)
        self.assertNotIn("<script>", html)
```

- [ ] **Step 2: Run it to confirm it fails**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_styles_and_script_are_external
```
Expected: FAIL (`style.css`/`app.js` missing; inline blocks still present).

- [ ] **Step 3: Extract CSS and JS into external files**

Run this PowerShell extraction (reads the raw HTML, writes the two assets):
```powershell
$html = Get-Content -Raw -Encoding UTF8 index.html
$css = [regex]::Match($html, '(?s)<style>\r?\n(.*?)\r?\n  </style>').Groups[1].Value
Set-Content -Path style.css -Value $css -Encoding utf8
$js = [regex]::Match($html, '(?s)<script>\r?\n(.*?)\r?\n  </script>').Groups[1].Value
Set-Content -Path app.js -Value $js -Encoding utf8
Write-Host ("style.css lines: " + ((Get-Content style.css).Count))
Write-Host ("app.js lines: " + ((Get-Content app.js).Count))
```
Expected: `style.css` ≈ 740 lines, `app.js` ≈ 390 lines. If either is 0 lines, the
regex did not match — stop and inspect `index.html` markers manually.

- [ ] **Step 4: Replace the inline blocks in `index.html` with external references**

Run:
```powershell
$html = Get-Content -Raw -Encoding UTF8 index.html
$html = [regex]::Replace($html, '(?s)  <style>.*?</style>', '  <link rel="stylesheet" href="style.css">')
$html = [regex]::Replace($html, '(?s)  <script>.*?</script>', '  <script src="app.js" defer></script>')
Set-Content -Path index.html -Value $html -Encoding utf8 -NoNewline
```
Then confirm visually:
```powershell
Select-String -Path index.html -Pattern '<link rel="stylesheet" href="style.css">','<script src="app.js" defer></script>'
```
Expected: both lines present. The `<link>` sits in `<head>` where `<style>` was;
the `<script src>` sits at the end of `<body>` where the inline script was.

- [ ] **Step 5: Migrate `tests/test_project.py` to read all three files**

Replace the `setUpClass` method:
```python
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8-sig")
        cls.css = (ROOT / "style.css").read_text(encoding="utf-8-sig")
        cls.js = (ROOT / "app.js").read_text(encoding="utf-8-sig")
        # Combined source for pattern checks where file location is irrelevant.
        cls.source = "\n".join([cls.html, cls.css, cls.js])
```
Then update the existing pattern-matching tests to use `self.source` instead of
`self.html` in these methods (the regex/`assertIn`/`assertNotIn`/`assertRegex`
calls that look for CSS or JS content):
- `test_submit_controls_are_declared_before_validation_returns` → `self.source`
- `test_long_invite_starts_at_top_and_cannot_overflow_horizontally` → `self.source`
- `test_screen_switching_manages_inert_state_and_focus` → `self.source`
- `test_honeypot_is_hidden_from_assistive_technology` → `self.source`
- `test_guest_query_parameter_is_not_decoded_twice` → `self.source`
- `test_interactions_are_bound_without_inline_event_attributes` → `self.source`
- `test_repeat_rsvp_guard_is_configured_for_sixty_seconds` → `self.source`
- `test_low_contrast_helper_text_and_status_are_accessible` → `self.source`

Leave file-existence tests (`test_social_preview_asset_exists`,
`test_repository_has_basic_public_documentation`, `test_handoff_documentation_exists`,
`test_obsolete_patch_scripts_and_crash_dump_are_removed`, `test_docs_are_consistent_after_unification`,
`test_styles_and_script_are_external`) unchanged — they use `ROOT` paths or read a
specific file directly.

- [ ] **Step 6: Migrate `tests/runtime_checks.js` to load `app.js`**

Replace lines 5–7:
```javascript
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.ok(scripts.length, 'Expected an inline application script');
```
with:
```javascript
const appSource = fs.readFileSync('app.js', 'utf8');
```
And replace the run line (was `vm.runInContext(scripts.at(-1)[1], ...)`):
```javascript
vm.runInContext(appSource, context, { filename: 'app.js' });
```

- [ ] **Step 7: Update `docs/ARCHITECTURE.md` to describe the 3-file structure**

In the Overview, change "The production surface is primarily `index.html` plus the
social preview image." to "The production surface is `index.html`, `style.css`,
`app.js`, plus the social preview image."

In the Files table, replace the `index.html` row and add two rows:
```markdown
| `index.html` | Markup and screen structure (no inline CSS/JS). |
| `style.css` | All styles. |
| `app.js` | Vanilla JavaScript application logic, loaded with `defer`. |
```

- [ ] **Step 8: Run the full suite to verify green**

Run:
```powershell
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```
Expected: all Python tests pass (including `test_styles_and_script_are_external`);
Node prints `Runtime checks passed`.

- [ ] **Step 9: Verify in the browser (visual unchanged)**

Use the preview workflow: start the server (`python -m http.server 8080` config),
load `http://127.0.0.1:8080/`, confirm the envelope renders styled and clicking it
opens the invite (styles + JS load from the external files). Check the console for
404s on `style.css`/`app.js`.

- [ ] **Step 10: Commit**

Run the full verification gate, then:
```powershell
git add -A
git commit -m @'
refactor: split index.html into index.html + style.css + app.js

No behavior change. Tests read from a combined source of the three files; a new
test enforces externalization. Architecture doc updated to match.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 4: Honeypot fix — append `_gotcha` to FormData

**Files:**
- Modify: `app.js` (the `submitRSVP` FormData build; was `index.html:1170`)
- Modify: `tests/runtime_checks.js`
- Modify: `PRD-graduation-invitation.md` (already reconciled in Task 2 Step 6; verify only)

- [ ] **Step 1: Add a failing runtime assertion (capture submitted body)**

In `tests/runtime_checks.js`, add a capture variable near the top (after `let fetchCount = 0;`):
```javascript
let lastFetchBody = null;
```
Change the `fetch` stub in the `vm.createContext({...})` block from:
```javascript
  fetch: async () => {
    fetchCount += 1;
    return { ok: false, status: 500 };
  },
```
to:
```javascript
  fetch: async (url, options) => {
    fetchCount += 1;
    lastFetchBody = options.body;
    return { ok: false, status: 500 };
  },
```
Then, in the `.then` block that asserts `fetchCount === 1` (the second explicit
repeat submit), add before the `console.log('Runtime checks passed')` line:
```javascript
  assert.ok(lastFetchBody && lastFetchBody.values.has('_gotcha'),
    '_gotcha should be appended to the submitted FormData');
```

- [ ] **Step 2: Run it to confirm it fails**

Run:
```powershell
node tests\runtime_checks.js
```
Expected: FAIL — assertion error "_gotcha should be appended to the submitted FormData".

- [ ] **Step 3: Append `_gotcha` in `app.js`**

In `app.js`, in `submitRSVP`, find the FormData build that ends with:
```javascript
        formData.append('timestamp', new Date().toISOString());
        // Không append _gotcha; hidden input được check ở client trước khi gửi.
```
Replace the comment line with an actual append (keeping the client-side check
above intact at `const gotcha = ...; if (gotcha) return;`):
```javascript
        formData.append('timestamp', new Date().toISOString());
        // Gửi cả _gotcha để Formspree lọc spam phía server (client đã chặn ở trên).
        formData.append('_gotcha', gotcha || '');
```

- [ ] **Step 4: Run to verify it passes**

Run:
```powershell
node tests\runtime_checks.js
```
Expected: `Runtime checks passed`.

- [ ] **Step 5: Verify PRD §6.3 already reflects this**

Confirm `PRD-graduation-invitation.md` §6.3 was updated in Task 2 Step 6. If not, update it now.

- [ ] **Step 6: Commit**

Run the full verification gate, then:
```powershell
git add -A
git commit -m @'
fix: append _gotcha to RSVP FormData for server-side spam filtering

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 5: Accessibility improvements

Skip-link to the RSVP form, `aria-hidden` on decorative detail icons,
`aria-describedby` hints, focusable radio cards, and an instant envelope open under
`prefers-reduced-motion`.

> **Note / spec deviation:** the spec said skip-link `#skip-to-invite` → `#screen-invite`.
> That target is `inert` until the envelope opens, so the link would do nothing.
> Instead, the skip link lives inside the invite screen and jumps past the
> decorative header to the form (`href="#rsvp-form"`). This is the correct,
> functional version of the same intent.

**Files:**
- Modify: `index.html` (skip link, detail-icon `aria-hidden`, field hints, radio-card `tabindex`)
- Modify: `style.css` (`.skip-link`, `.sr-only`)
- Modify: `app.js` (`openEnvelope` reduced-motion path)
- Modify: `tests/test_project.py`

- [ ] **Step 1: Write failing accessibility structural tests**

In `tests/test_project.py`, add:
```python
    def test_skip_link_targets_the_form(self):
        self.assertRegex(
            self.html,
            r'class="skip-link"[^>]*href="#rsvp-form"',
        )
        self.assertIn(".skip-link", self.css)

    def test_decorative_detail_icons_are_hidden_from_at(self):
        icons = re.findall(r'<span class="detail-icon"[^>]*>', self.html)
        self.assertEqual(len(icons), 4)
        for tag in icons:
            self.assertIn('aria-hidden="true"', tag)

    def test_form_fields_have_described_by_hints(self):
        self.assertRegex(self.html, r'id="rsvp-name"[^>]*aria-describedby="name-hint"')
        self.assertRegex(self.html, r'id="rsvp-message"[^>]*aria-describedby="message-hint"')
        self.assertIn('id="name-hint"', self.html)
        self.assertIn('id="message-hint"', self.html)

    def test_radio_cards_are_focusable_for_arrow_navigation(self):
        cards = re.findall(r'<label class="radio-card[^"]*"[^>]*>', self.html)
        self.assertEqual(len(cards), 2)
        for tag in cards:
            self.assertIn('tabindex="-1"', tag)

    def test_envelope_open_respects_reduced_motion(self):
        self.assertIn("prefers-reduced-motion", self.js)
```
(These read `self.html`/`self.css`/`self.js` set up in Task 3 Step 5.)

- [ ] **Step 2: Run them to confirm they fail**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_skip_link_targets_the_form tests.test_project.GraduationInvitationChecks.test_decorative_detail_icons_are_hidden_from_at tests.test_project.GraduationInvitationChecks.test_form_fields_have_described_by_hints tests.test_project.GraduationInvitationChecks.test_radio_cards_are_focusable_for_arrow_navigation tests.test_project.GraduationInvitationChecks.test_envelope_open_respects_reduced_motion
```
Expected: all FAIL.

- [ ] **Step 3: Add the skip link inside the invite wrapper (`index.html`)**

In `index.html`, the invite wrapper starts with:
```html
    <div class="invite-wrapper" id="invite-wrapper">
      <!-- Header -->
      <span class="inv-emoji" aria-hidden="true">🎓</span>
```
Insert the skip link as the first child of `.invite-wrapper`:
```html
    <div class="invite-wrapper" id="invite-wrapper">
      <a class="skip-link" href="#rsvp-form">Bỏ qua phần giới thiệu, tới mẫu xác nhận</a>
      <!-- Header -->
      <span class="inv-emoji" aria-hidden="true">🎓</span>
```

- [ ] **Step 4: Mark the 4 decorative detail icons `aria-hidden` (`index.html`)**

In the `inv-details` block, add `aria-hidden="true"` to each `.detail-icon` span.
Change each of the four occurrences:
```html
          <span class="detail-icon">📅</span>
```
to (matching emoji per row — 📅, 📍, 🕐, 🎓):
```html
          <span class="detail-icon" aria-hidden="true">📅</span>
```
Do this for all four rows (📅 Ngày, 📍 Địa điểm, 🕐 Giờ, 🎓 Sự kiện).

- [ ] **Step 5: Add `aria-describedby` hints to name and message fields (`index.html`)**

Name field — change:
```html
          <label for="rsvp-name">Họ và tên</label>
          <input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name">
          <span class="form-error" id="error-name" role="alert"></span>
```
to:
```html
          <label for="rsvp-name">Họ và tên</label>
          <input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name" aria-describedby="name-hint">
          <span class="sr-only" id="name-hint">Nhập họ và tên của bạn để mình ghi nhận xác nhận tham dự.</span>
          <span class="form-error" id="error-name" role="alert"></span>
```
Message field — change:
```html
          <label for="rsvp-message">Lời chúc <span class="optional">(tùy chọn)</span></label>
          <textarea id="rsvp-message" name="message" rows="2" maxlength="500"
            placeholder="Chúc Quang..."></textarea>
```
to:
```html
          <label for="rsvp-message">Lời chúc <span class="optional">(tùy chọn)</span></label>
          <textarea id="rsvp-message" name="message" rows="2" maxlength="500"
            placeholder="Chúc Quang..." aria-describedby="message-hint"></textarea>
          <span class="sr-only" id="message-hint">Lời chúc là tùy chọn, tối đa 500 ký tự.</span>
```

- [ ] **Step 6: Make radio cards focusable (`index.html`)**

Change:
```html
            <label class="radio-card selected" data-value="yes">
```
to:
```html
            <label class="radio-card selected" data-value="yes" tabindex="-1">
```
and:
```html
            <label class="radio-card" data-value="no">
```
to:
```html
            <label class="radio-card" data-value="no" tabindex="-1">
```

- [ ] **Step 7: Add `.skip-link` and `.sr-only` styles (`style.css`)**

Append to `style.css`:
```css
/* ============================================================
ACCESSIBILITY HELPERS
============================================================ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: 8px 16px;
  background: #e2b04a;
  color: #1a1a2e;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

.skip-link:focus {
  left: 8px;
  top: 8px;
}
```

- [ ] **Step 8: Skip the 600ms envelope delay under reduced motion (`app.js`)**

In `app.js`, replace the whole `openEnvelope` function:
```javascript
    function openEnvelope() {
      if (isAnimating) return;
      isAnimating = true;

      const envelope = document.querySelector('.envelope');
      envelope.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), opacity .6s ease';
      envelope.style.transform = 'scale(0.3)';
      envelope.style.opacity = '0';

      setTimeout(() => {
        showScreen('screen-invite');
        prefillNameFromURL();
        checkPreviousRSVP();
        envelope.style.transition = 'none';
        envelope.style.transform = '';
        envelope.style.opacity = '';
        isAnimating = false;
      }, 600);
    }
```
with:
```javascript
    function openEnvelope() {
      if (isAnimating) return;
      isAnimating = true;

      const envelope = document.querySelector('.envelope');
      const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const reveal = () => {
        showScreen('screen-invite');
        prefillNameFromURL();
        checkPreviousRSVP();
        envelope.style.transition = 'none';
        envelope.style.transform = '';
        envelope.style.opacity = '';
        isAnimating = false;
      };

      if (reduceMotion) {
        reveal();
        return;
      }

      envelope.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), opacity .6s ease';
      envelope.style.transform = 'scale(0.3)';
      envelope.style.opacity = '0';
      setTimeout(reveal, 600);
    }
```

- [ ] **Step 9: Run the accessibility tests to verify they pass**

Run the same command as Step 2. Expected: all PASS.

- [ ] **Step 10: Run the full suite + browser check**

Run:
```powershell
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```
Expected: all green. Then in the browser, Tab into the invite screen and confirm
the skip link appears on focus and jumps to the form; arrow keys move the radio
selection.

- [ ] **Step 11: Commit**

Run the full verification gate, then:
```powershell
git add -A
git commit -m @'
feat: accessibility — skip link, hidden decorative icons, field hints, focusable
radio cards, reduced-motion envelope open

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 6: Performance + robustness

`preconnect` to font origins, fewer particles on small viewports, name length cap,
and confirming the error-state retry affordance.

**Files:**
- Modify: `index.html` (preconnect links)
- Modify: `app.js` (`initParticles` count, name cap in `submitRSVP`)
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`

- [ ] **Step 1: Write failing structural + runtime tests**

In `tests/test_project.py`, add:
```python
    def test_font_origins_are_preconnected(self):
        self.assertIn(
            '<link rel="preconnect" href="https://fonts.googleapis.com">',
            self.html,
        )
        self.assertIn(
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
            self.html,
        )

    def test_particle_count_is_reduced_on_small_viewports(self):
        self.assertRegex(self.js, r"innerWidth.*<=\s*600\s*\?\s*10\s*:\s*20")
```
In `tests/runtime_checks.js`, after the `fetchCount === 1` / `_gotcha` assertions,
add a new `.then` step before the final `console.log('Runtime checks passed')`.
Change the tail of the promise chain from:
```javascript
}).then(() => {
  assert.equal(fetchCount, 1, 'Second explicit repeat submit should continue');
  assert.ok(lastFetchBody && lastFetchBody.values.has('_gotcha'),
    '_gotcha should be appended to the submitted FormData');
  console.log('Runtime checks passed');
}).catch((error) => {
```
to:
```javascript
}).then(() => {
  assert.equal(fetchCount, 1, 'Second explicit repeat submit should continue');
  assert.ok(lastFetchBody && lastFetchBody.values.has('_gotcha'),
    '_gotcha should be appended to the submitted FormData');

  // Name length cap: a fresh long name submits and is capped at 100 chars.
  nameInput.value = 'x'.repeat(150);
  messageInput.value = '';
  return context.submitRSVP({ preventDefault() {} });
}).then(() => {
  assert.equal(fetchCount, 2, 'Fresh name should submit (no repeat warning)');
  assert.equal(lastFetchBody.values.get('name').length, 100,
    'Guest name should be capped at 100 characters');
  console.log('Runtime checks passed');
}).catch((error) => {
```

- [ ] **Step 2: Run to confirm failures**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_font_origins_are_preconnected tests.test_project.GraduationInvitationChecks.test_particle_count_is_reduced_on_small_viewports
node tests\runtime_checks.js
```
Expected: the two Python tests FAIL; Node FAILS on the name-cap assertion
(name length is 150, not 100).

- [ ] **Step 3: Add font preconnect links (`index.html`)**

In `<head>`, immediately before the Google Fonts stylesheet `<link>` (the one with
`href="https://fonts.googleapis.com/css2?family=Cormorant...`), insert:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

- [ ] **Step 4: Reduce particle count on small viewports (`app.js`)**

In `initParticles`, change:
```javascript
      const c = document.getElementById('bg-particles');
      if (!c) return;
      for (let i = 0; i < 20; i++) {
```
to:
```javascript
      const c = document.getElementById('bg-particles');
      if (!c) return;
      const count = (window.innerWidth && window.innerWidth <= 600) ? 10 : 20;
      for (let i = 0; i < count; i++) {
```

- [ ] **Step 5: Cap the guest name at 100 characters (`app.js`)**

In `submitRSVP`, change:
```javascript
      // Validate name
      const name = document.getElementById('rsvp-name').value.trim();
```
to:
```javascript
      // Validate name (cap length defensively, mirroring the message cap)
      const name = document.getElementById('rsvp-name').value.trim().slice(0, 100);
```

- [ ] **Step 6: Run the tests to verify green**

Run the same commands as Step 2. Expected: Python tests PASS; Node prints
`Runtime checks passed`.

- [ ] **Step 7: Confirm the error-state retry affordance**

The error path already restores the button to its original label and re-enables it
(`btn.disabled = false; btnText.textContent = originalText;` in the `catch`), so the
user can retry by submitting again. Confirm this matches the PRD wording reconciled
in Task 2 Step 6. No code change needed unless the PRD demands the button text
literally change to "Thử lại"; if so, set `btnText.textContent = 'Thử lại';` in the
`catch` block instead of restoring `originalText`, and note it in `CHANGELOG.md`.
Default: keep the current restore-and-retry behavior (no change).

- [ ] **Step 8: Commit**

Run the full verification gate, then:
```powershell
git add -A
git commit -m @'
perf+robustness: preconnect font origins, fewer mobile particles, cap name length

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 7: Deploy prep (no real deploy) + finalize CHANGELOG

**Files:**
- Create: `.nojekyll`
- Create: `docs/DEPLOYMENT.md`
- Modify: `CHANGELOG.md` (no change needed if Task 2 entry is complete — verify)
- Modify: `tests/test_project.py`

- [ ] **Step 1: Write a failing test for deploy-prep files**

In `tests/test_project.py`, add:
```python
    def test_deploy_prep_files_exist(self):
        self.assertTrue((ROOT / ".nojekyll").is_file())
        self.assertTrue((ROOT / "docs" / "DEPLOYMENT.md").is_file())
```

- [ ] **Step 2: Run to confirm it fails**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_deploy_prep_files_exist
```
Expected: FAIL.

- [ ] **Step 3: Create `.nojekyll`**

Run:
```powershell
if (-not (Test-Path .nojekyll)) { New-Item -ItemType File .nojekyll | Out-Null }
```
(Empty file. Ensures GitHub Pages serves `app.js`/`style.css` without Jekyll processing.)

- [ ] **Step 4: Create `docs/DEPLOYMENT.md`**

Create `docs/DEPLOYMENT.md`:
```markdown
# Deployment

Static site — deploy by serving the repository root over HTTPS (e.g. GitHub Pages).
`.nojekyll` is present so `app.js` and `style.css` are served as-is.

## Pre-deploy checklist

Do NOT launch invitations until every box is checked:

- [ ] Final domain confirmed.
- [ ] `index.html` `og:image` updated to `https://<final-domain>/preview.png`.
- [ ] `index.html` canonical `<link>` updated to `https://<final-domain>/`.
- [ ] Ceremony time confirmed and the `Giờ` field updated (replace `Sẽ cập nhật sau`).
- [ ] One real RSVP submitted from the live URL and verified in the Formspree dashboard.
- [ ] Tested on a phone-sized viewport and on desktop, including the social preview.
- [ ] `CNAME` added (only once the real domain is confirmed — deferred until then).

## Verification before deploy

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```
```

- [ ] **Step 5: Verify the CHANGELOG Unreleased/v2.2 entry is complete**

Confirm `CHANGELOG.md` (created in Task 2) lists all v2.2 changes: asset split,
honeypot fix, accessibility set, perf, name cap, and these deploy-prep files. Add
any missing bullet.

- [ ] **Step 6: Run the test to verify green, then commit**

Run:
```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_deploy_prep_files_exist
```
Expected: PASS. Then run the full verification gate and commit:
```powershell
git add -A
git commit -m @'
chore: deploy prep — add .nojekyll and docs/DEPLOYMENT.md checklist

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 8: Final verification + open PR

**Files:**
- No source edits.

- [ ] **Step 1: Run the full verification gate one final time**

Run:
```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```
Expected: preview regenerates with no diff (or a regenerated `preview.png`), all
tests pass, `git diff --check` reports nothing.

- [ ] **Step 2: Browser smoke test**

Start the local server and walk the full flow: open envelope → invite renders
styled → fill name → select attendance with mouse and with arrow keys → submit is
blocked from real send (do NOT do a real Formspree submit). Confirm no console
errors and `style.css`/`app.js` load (200, not 404).

- [ ] **Step 3: Push the branch and open the PR**

Run:
```powershell
git push -u origin feat/optimization
gh pr create --base main --head feat/optimization --title "Project optimization & workflow consistency (v2.2)" --body @'
## Summary
- Unify handoff docs, add CHANGELOG.md as the single version source, reconcile PRD with code
- Split index.html into index.html + style.css + app.js (no build)
- Fix honeypot: append _gotcha to the submitted FormData
- Accessibility: skip link to form, aria-hidden decorative icons, aria-describedby hints, focusable radio cards, reduced-motion envelope open
- Performance: preconnect font origins, fewer particles on small viewports
- Robustness: cap guest name at 100 chars
- Deploy prep: .nojekyll + docs/DEPLOYMENT.md (no real deploy)

## Testing
- python -m unittest -v tests.test_project
- node tests\runtime_checks.js
- git diff --check
- Browser smoke test of the full flow

## Out of scope
Real deploy/CNAME, ceremony time, real Formspree submission, CSP (now feasible — next step).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
```
Expected: a PR URL is printed. Report it to the user.

- [ ] **Step 4: Report and hand off**

Summarize the PR link, the verification results, and remind the user that the
deferred **feature-ideas brainstorm** (countdown, music, map, gallery, etc.) is
tracked as the next session once this merges.

---

## Self-review notes (author)

- **Spec coverage:** §2 versioning/git → Task 1 + CHANGELOG in Task 2. §3 docs
  unification → Task 2. §4 PRD reconciliation → Task 2 Step 6 (verified in Tasks
  4/6). §5a split → Task 3. §5b honeypot → Task 4. §5c a11y → Task 5. §5d perf →
  Task 6 Steps 3–4. §5e name cap → Task 6 Step 5. §6 deploy prep → Task 7. §7
  testing → red-first steps throughout + Task 8 gate. §10 follow-up → Task 8 Step 4
  reminder (tracked task).
- **Deviation:** skip-link targets `#rsvp-form` inside the (non-inert) invite
  screen rather than the inert `#screen-invite` — documented in Task 5.
- **Type/name consistency:** `lastFetchBody` introduced in Task 4 Step 1 and reused
  in Task 6 Step 1; `FakeFormData.values` is a `Map`, so `.has()`/`.get()` are valid.
  `self.source`/`self.css`/`self.js` defined in Task 3 Step 5 before later tasks use them.
- **Reduced-motion test** is structural only (the Node `setTimeout` stub fires
  synchronously, so a behavioral delay test isn't meaningful in that harness) — noted.
