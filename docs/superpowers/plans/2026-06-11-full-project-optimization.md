> **STATUS: SUPERSEDED (historical).** Its git assumptions are stale. Replaced by
> `docs/superpowers/plans/2026-06-24-project-optimization.md`. Do not execute.

# Full Project Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the current v2.1 work into git, split the static invitation into `index.html` + `style.css` + `app.js`, add only the remaining accessibility/performance improvements, and prepare GitHub Pages deployment without submitting real RSVP data.

**Architecture:** Keep the app static and dependency-light. First commit the already-working v2.1 baseline, then do the file split and test-harness migration in one atomic green commit. Accessibility/performance gaps are added after the split as small tested commits.

**Tech Stack:** Vanilla HTML/CSS/JS, Formspree, Python `unittest`, Node `vm`, Git, GitHub Pages.

---

## Ground Rules

- Do not invent the ceremony time. Keep `Sẽ cập nhật sau` until the user provides a confirmed time.
- Do not submit a real valid RSVP to Formspree during automated/browser smoke tests.
- Do not commit a known failing test state.
- Use `main` as the deploy branch and `codex/full-project-optimization` as the working branch. Do not create a long-lived `develop` branch for this small project.
- Treat `docs/superpowers/plans/2026-06-11-full-project-optimization.md` as the active plan. The existing `docs/superpowers/plans/2026-06-12-full-optimization.md` is a superseded draft and must not be committed as a current plan.

---

## Target File Structure

```text
index.html
style.css
app.js
preview.png
.gitignore
.nojekyll
AGENTS.md
README.md
PRD-graduation-invitation.md
docs/ARCHITECTURE.md
docs/PROJECT_STATUS.md
docs/archive/context-2026-06-11.md
docs/archive/fix-audit-2026-06-11.md
docs/archive/full-optimization-draft-2026-06-12.md
docs/superpowers/plans/2026-06-09-graduation-invitation.md
docs/superpowers/plans/2026-06-11-project-optimization-context.md
docs/superpowers/plans/2026-06-11-full-project-optimization.md
docs/superpowers/specs/2026-06-11-project-optimization-context-design.md
tests/generate_preview.py
tests/runtime_checks.js
tests/test_project.py
```

---

## Task 0: Pre-Flight And Draft Triage

**Files:**
- Read: all project files
- Move: `docs/superpowers/plans/2026-06-12-full-optimization.md`
- Create: `docs/archive/full-optimization-draft-2026-06-12.md`

- [ ] **Step 1: Verify current baseline passes**

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

Expected:
- `python -m unittest` reports all tests `ok`.
- `node tests\runtime_checks.js` prints `Runtime checks passed`.
- `git diff --check` exits `0`.

- [ ] **Step 2: Inspect current git status**

```powershell
git status --short --untracked-files=all
```

Expected before cleanup: modified `index.html`, `PRD-graduation-invitation.md`, `docs/superpowers/plans/2026-06-09-graduation-invitation.md`, plus new docs/tests/assets from v2.1.

- [ ] **Step 3: Archive the superseded 2026-06-12 draft plan**

Run this PowerShell command from the repo root:

```powershell
$source = "docs\superpowers\plans\2026-06-12-full-optimization.md"
$target = "docs\archive\full-optimization-draft-2026-06-12.md"
if (Test-Path $source) {
  Move-Item -LiteralPath $source -Destination $target
  $body = Get-Content -Raw -Encoding UTF8 $target
  $header = "# Historical Archive`r`n`r`nThis draft was superseded by `docs/superpowers/plans/2026-06-11-full-project-optimization.md`. It is kept for audit/history only.`r`n`r`n---`r`n`r`n"
  Set-Content -Path $target -Value ($header + $body) -Encoding UTF8
} else {
  Write-Host "No superseded draft found at $source; skipping archive."
}
```

Expected:
- `docs/superpowers/plans/2026-06-12-full-optimization.md` no longer appears in `git status`.
- `docs/archive/full-optimization-draft-2026-06-12.md` appears as untracked or staged later.

---

## Task 1: Commit Current v2.1 Baseline

**Files:**
- Stage/commit all current v2.1 files after Task 0 triage

- [ ] **Step 1: Stage all intended files**

```powershell
git add -A
```

- [ ] **Step 2: Verify staged contents**

```powershell
git status --short --untracked-files=all
```

Expected: every line is staged (`A`, `M`, `R`, or `D` in the index column). There should be no accidental patch scripts or crash dumps.

- [ ] **Step 3: Commit baseline**

```powershell
git commit -m "feat: graduation invitation v2.1"
```

Expected: commit succeeds.

- [ ] **Step 4: Create isolated working branch**

```powershell
git switch -c codex/full-project-optimization
```

Expected: current branch is `codex/full-project-optimization`.

---

## Task 2: Prepare Test Harness For Split Without Breaking Current App

**Files:**
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`

### Task 2.1: Make Python Tests Read HTML/CSS/JS Sources

- [ ] **Step 1: Replace the top constants and setup in `tests/test_project.py`**

Use this block at the top of the file:

```python
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
CSS_PATH = ROOT / "style.css"
JS_PATH = ROOT / "app.js"


def read_optional(path):
    return path.read_text(encoding="utf-8-sig") if path.is_file() else ""


class GraduationInvitationChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8-sig")
        cls.css = read_optional(CSS_PATH)
        cls.js = read_optional(JS_PATH)
        cls.all_source = "\n".join([cls.html, cls.css, cls.js])
```

- [ ] **Step 2: Update existing CSS/JS structural tests**

In `tests/test_project.py`, change CSS/JS searches from `self.html` to `self.all_source` in these tests:

```python
test_submit_controls_are_declared_before_validation_returns
test_long_invite_starts_at_top_and_cannot_overflow_horizontally
test_screen_switching_manages_inert_state_and_focus
test_interactions_are_bound_without_inline_event_attributes
test_repeat_rsvp_guard_is_configured_for_sixty_seconds
test_low_contrast_helper_text_and_status_are_accessible
```

Keep pure HTML checks on `self.html`, including:

```python
test_honeypot_is_hidden_from_assistive_technology
test_guest_query_parameter_is_not_decoded_twice
test_social_preview_asset_exists
test_repository_has_basic_public_documentation
test_handoff_documentation_exists
test_obsolete_patch_scripts_and_crash_dump_are_removed
```

Concrete migration examples:

```python
# Before: CSS rule searched only in index.html
invite_rule = re.search(r"#screen-invite\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)

# After: CSS rule may live in style.css after the split
invite_rule = re.search(r"#screen-invite\s*\{(?P<body>.*?)\}", self.all_source, re.DOTALL)
```

```python
# Before: JS function searched only in index.html
function = re.search(
    r"async function submitRSVP\(e\) \{(?P<body>.*?)\n    \}",
    self.html,
    re.DOTALL,
)

# After: JS function may live in app.js after the split
function = re.search(
    r"async function submitRSVP\(e\) \{(?P<body>.*?)\n    \}",
    self.all_source,
    re.DOTALL,
)
```

```python
# Before: CSS contrast rules searched only in index.html
banner_rule = re.search(r"\.sent-banner\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)

# After: CSS contrast rules may live in style.css after the split
banner_rule = re.search(r"\.sent-banner\s*\{(?P<body>.*?)\}", self.all_source, re.DOTALL)
```

- [ ] **Step 3: Add split-file regression test**

Add this test to `GraduationInvitationChecks`:

```python
def test_css_and_js_are_external_files_after_split(self):
    self.assertTrue(CSS_PATH.is_file())
    self.assertTrue(JS_PATH.is_file())
    self.assertRegex(self.html, r'<link[^>]*rel="stylesheet"[^>]*href="style\.css"')
    self.assertRegex(self.html, r'<script[^>]*src="app\.js"[^>]*></script>')
    self.assertNotRegex(self.html, r"<style\b")
    self.assertNotRegex(self.html, r"<script(?![^>]*\bsrc=)[^>]*>")
```

Do not commit yet; this test should fail until Task 3 performs the split.

### Task 2.2: Make Runtime Harness Support Inline Or External JS

- [ ] **Step 1: Replace the script-loading section in `tests/runtime_checks.js`**

Replace the current `scripts` extraction block with:

```javascript
const html = fs.readFileSync('index.html', 'utf8');
const externalScriptExists = fs.existsSync('app.js');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const jsCode = externalScriptExists
  ? fs.readFileSync('app.js', 'utf8')
  : (assert.ok(scripts.length, 'Expected an inline application script'), scripts.at(-1)[1]);
```

- [ ] **Step 2: Replace the VM execution line**

Replace:

```javascript
vm.runInContext(scripts.at(-1)[1], context, { filename: 'index.html' });
```

with:

```javascript
vm.runInContext(jsCode, context, { filename: externalScriptExists ? 'app.js' : 'index.html' });
```

- [ ] **Step 3: Add external-file assertions after the split behavior assertions**

After the second repeat-submit assertion and before `console.log('Runtime checks passed')`, add:

```javascript
assert.ok(html.includes('href="style.css"'), 'index.html should reference style.css');
assert.ok(html.includes('src="app.js"'), 'index.html should reference app.js');
assert.equal(scripts.length, 0, 'index.html should not keep inline application scripts after split');
```

Do not commit yet; these new assertions should fail until Task 3 performs the split.

---

## Task 3: Split `index.html` Into `style.css` And `app.js`

**Files:**
- Create: `style.css`
- Create: `app.js`
- Modify: `index.html`
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`

- [ ] **Step 1: Extract CSS and JS mechanically**

Run this PowerShell script from the repo root:

```powershell
$htmlPath = "index.html"
$html = Get-Content -Raw -Encoding UTF8 $htmlPath
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$styleMatch = [regex]::Match($html, "(?s)<style>\s*(.*?)\s*</style>")
if (-not $styleMatch.Success) { throw "No <style> block found" }
[System.IO.File]::WriteAllText([System.IO.Path]::GetFullPath("style.css"), $styleMatch.Groups[1].Value.Trim(), $utf8NoBom)

$scriptMatch = [regex]::Match($html, "(?s)<script>\s*(.*?)\s*</script>\s*(?=</body>)")
if (-not $scriptMatch.Success) { throw "No application <script> block found before </body>" }
[System.IO.File]::WriteAllText([System.IO.Path]::GetFullPath("app.js"), $scriptMatch.Groups[1].Value.Trim(), $utf8NoBom)

$html = [regex]::Replace($html, "(?s)\s*<style>\s*.*?\s*</style>", "`r`n  <link rel=`"stylesheet`" href=`"style.css`">")
$html = [regex]::Replace($html, "(?s)\s*<script>\s*.*?\s*</script>\s*(?=</body>)", "`r`n  <script src=`"app.js`"></script>`r`n")
[System.IO.File]::WriteAllText([System.IO.Path]::GetFullPath($htmlPath), $html, $utf8NoBom)
```

- [ ] **Step 2: Verify split artifacts**

```powershell
Test-Path style.css
Test-Path app.js
node -c app.js
Select-String -Path index.html -Pattern '<style\b|<script(?![^>]*\bsrc=)'
```

Expected:
- `Test-Path` prints `True` for both files.
- `node -c app.js` exits `0`.
- `Select-String` returns no matches.

- [ ] **Step 3: Run full automated verification**

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Browser smoke test without Formspree side effects**

Run a local server:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/?guest=Nguy%E1%BB%85n%20V%C4%83n%20An` and verify:

- Envelope is visible.
- Clicking the envelope opens the invite screen.
- The name field is prefilled with `Nguyễn Văn An`.
- Clicking submit with an empty name shows the validation error.
- Do not submit a valid form.

- [ ] **Step 5: Commit split and harness migration atomically**

```powershell
git add index.html style.css app.js tests/test_project.py tests/runtime_checks.js preview.png
git commit -m "refactor: split invitation assets"
```

Expected: commit succeeds and all tests were green before commit.

---

## Task 4: Add Remaining Accessibility Improvements

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `app.js`
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js` only if runtime behavior needs coverage

### Task 4.1: Add Functional Skip Control That Opens The Invite Screen

The invite screen starts as `inert`, so a plain anchor to `#screen-invite` is not enough.

- [ ] **Step 1: Add failing Python test**

Add to `tests/test_project.py`:

```python
def test_skip_control_opens_invite_screen(self):
    self.assertRegex(
        self.html,
        r'<button[^>]*id="skip-to-invite"[^>]*class="skip-link"[^>]*type="button"',
    )
    self.assertIn("function skipToInvite()", self.all_source)
    self.assertIn("addEventListener('click', skipToInvite)", self.all_source)
```

Run:

```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_skip_control_opens_invite_screen
```

Expected: FAIL before implementation.

- [ ] **Step 2: Add skip button after `<body>`**

In `index.html`, immediately after `<body>`, add:

```html
  <button type="button" class="skip-link" id="skip-to-invite">Bỏ qua đến nội dung thiệp</button>
```

- [ ] **Step 3: Add skip styles to `style.css`**

Place after reset/base styles:

```css
.skip-link {
  position: fixed;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: #e2b04a;
  color: #1a1a2e;
  padding: 8px 16px;
  border: 0;
  border-radius: 4px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  letter-spacing: 2px;
  z-index: 1000;
  cursor: pointer;
  transition: top .2s
}

.skip-link:focus-visible {
  top: 16px;
  outline: 2px solid #fff;
  outline-offset: 3px
}
```

- [ ] **Step 4: Add skip behavior to `app.js`**

Add this function near `openEnvelope()`:

```javascript
function skipToInvite() {
  showScreen('screen-invite');
  prefillNameFromURL();
  checkPreviousRSVP();
}
```

In the `DOMContentLoaded` initializer, add:

```javascript
document.getElementById('skip-to-invite')?.addEventListener('click', skipToInvite);
```

- [ ] **Step 5: Verify and commit**

```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_skip_control_opens_invite_screen
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
git add index.html style.css app.js tests/test_project.py
git commit -m "a11y: add functional skip control"
```

### Task 4.2: Hide Decorative Detail Icons From Assistive Technology

- [ ] **Step 1: Add failing Python test**

```python
def test_detail_icons_are_hidden_from_assistive_technology(self):
    self.assertIn('<span class="detail-icon" aria-hidden="true">📅</span>', self.html)
    self.assertIn('<span class="detail-icon" aria-hidden="true">📍</span>', self.html)
    self.assertIn('<span class="detail-icon" aria-hidden="true">🕐</span>', self.html)
    self.assertIn('<span class="detail-icon" aria-hidden="true">🎓</span>', self.html)
```

Expected: FAIL before implementation.

- [ ] **Step 2: Update the four detail icon spans**

Change the four spans in `index.html` from:

```html
<span class="detail-icon">📅</span>
<span class="detail-icon">📍</span>
<span class="detail-icon">🕐</span>
<span class="detail-icon">🎓</span>
```

to:

```html
<span class="detail-icon" aria-hidden="true">📅</span>
<span class="detail-icon" aria-hidden="true">📍</span>
<span class="detail-icon" aria-hidden="true">🕐</span>
<span class="detail-icon" aria-hidden="true">🎓</span>
```

- [ ] **Step 3: Verify and commit**

```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_detail_icons_are_hidden_from_assistive_technology
python -m unittest -v tests.test_project
git add index.html tests/test_project.py
git commit -m "a11y: hide decorative detail icons"
```

### Task 4.3: Add `aria-describedby` Hints For Form Fields

- [ ] **Step 1: Add failing Python test**

```python
def test_form_fields_have_aria_describedby_hints(self):
    self.assertRegex(self.html, r'id="rsvp-name"[^>]*aria-describedby="name-hint error-name"')
    self.assertRegex(self.html, r'id="rsvp-message"[^>]*aria-describedby="message-hint"')
    self.assertIn('id="name-hint"', self.html)
    self.assertIn('id="message-hint"', self.html)
    self.assertIn(".form-hint", self.css)
```

Expected: FAIL before implementation.

- [ ] **Step 2: Update name field markup**

Change the name input block to include `aria-describedby` and hint:

```html
<input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name"
  aria-describedby="name-hint error-name">
<span class="form-hint" id="name-hint">Nhập đầy đủ họ tên để người tổ chức biết bạn là ai.</span>
<span class="form-error" id="error-name" role="alert"></span>
```

- [ ] **Step 3: Update message field markup**

Change the message textarea block to:

```html
<textarea id="rsvp-message" name="message" rows="2" maxlength="500" placeholder="Chúc Quang..."
  aria-describedby="message-hint"></textarea>
<span class="form-hint" id="message-hint">Tối đa 500 ký tự.</span>
```

- [ ] **Step 4: Add hint styles**

Add after `.form-error` in `style.css`:

```css
.form-hint {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, .55);
  margin-top: 4px;
  font-style: italic
}
```

- [ ] **Step 5: Verify and commit**

```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_form_fields_have_aria_describedby_hints
python -m unittest -v tests.test_project
git add index.html style.css tests/test_project.py
git commit -m "a11y: describe RSVP form fields"
```

---

## Task 5: Add Remaining Performance Improvements

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`

### Task 5.1: Add Google Fonts Preconnect

- [ ] **Step 1: Add failing Python test**

```python
def test_google_fonts_loading_is_optimized(self):
    self.assertIn('rel="preconnect"', self.html)
    self.assertIn('href="https://fonts.googleapis.com"', self.html)
    self.assertIn('href="https://fonts.gstatic.com"', self.html)
    self.assertIn('display=swap', self.html)
```

Expected: FAIL before implementation.

- [ ] **Step 2: Add preconnect links before the Google Fonts stylesheet**

In `index.html`, put the preconnect links before the existing Google Fonts stylesheet:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap"
    rel="stylesheet">
```

- [ ] **Step 3: Verify and commit**

```powershell
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_google_fonts_loading_is_optimized
python -m unittest -v tests.test_project
git add index.html tests/test_project.py
git commit -m "perf: add Google Fonts preconnect"
```

### Task 5.2: Reduce Particle Count On Mobile

- [ ] **Step 1: Add Python structural test**

```python
def test_mobile_particle_count_is_reduced(self):
    self.assertIn("const isMobile = window.innerWidth < 768", self.js)
    self.assertIn("const count = isMobile ? 10 : 20", self.js)
    self.assertIn("for (let i = 0; i < count; i++)", self.js)
```

Expected: FAIL before implementation.

- [ ] **Step 2: Update `initParticles()` in `app.js`**

Replace:

```javascript
for (let i = 0; i < 20; i++) {
```

with:

```javascript
const isMobile = window.innerWidth < 768;
const count = isMobile ? 10 : 20;
for (let i = 0; i < count; i++) {
```

- [ ] **Step 3: Ensure runtime VM has `window.innerWidth`**

In `tests/runtime_checks.js`, change the `window` stub from:

```javascript
window: { location: { search: '?guest=Nh%C3%B3m%20100%25' } }
```

to:

```javascript
window: { innerWidth: 1024, location: { search: '?guest=Nh%C3%B3m%20100%25' } }
```

- [ ] **Step 4: Verify and commit**

```powershell
node -c app.js
python -m unittest -v tests.test_project.GraduationInvitationChecks.test_mobile_particle_count_is_reduced
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git add app.js tests/test_project.py tests/runtime_checks.js
git commit -m "perf: reduce mobile particle count"
```

---

## Task 6: Update Documentation For Split Structure

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/PROJECT_STATUS.md`

- [ ] **Step 1: Update `AGENTS.md` project snapshot**

Replace the single-file description with:

```markdown
- Main files: `index.html` (markup), `style.css` (styles), and `app.js` (logic).
- RSVP backend: Formspree endpoint in `RSVP_ENDPOINT` inside `app.js`.
```

- [ ] **Step 2: Update `README.md` file structure**

Add:

```markdown
## File Structure

- `index.html` — markup and metadata.
- `style.css` — visual styling and responsive rules.
- `app.js` — screen transitions, RSVP flow, Formspree submission, and localStorage UX memory.
```

- [ ] **Step 3: Update `docs/ARCHITECTURE.md` file table**

Ensure the files table includes:

```markdown
| `style.css` | Styles, animation rules, responsive breakpoints. |
| `app.js` | Client-side logic: screen transitions, RSVP validation/submission, confetti, localStorage helpers. |
```

- [ ] **Step 4: Update `docs/PROJECT_STATUS.md` implemented list**

Add:

```markdown
- Static assets split into `index.html`, `style.css`, and `app.js`.
```

- [ ] **Step 5: Verify and commit**

```powershell
python -m unittest -v tests.test_project
git diff --check
git add AGENTS.md README.md docs/ARCHITECTURE.md docs/PROJECT_STATUS.md
git commit -m "docs: document split file structure"
```

---

## Task 7: Prepare GitHub Pages Deployment

**Files:**
- Create: `.nojekyll`
- Create only with user confirmation: `CNAME`

- [ ] **Step 1: Verify remote**

```powershell
git remote -v
```

Expected: remote points to the intended GitHub repository.

- [ ] **Step 2: Add `.nojekyll`**

```powershell
New-Item -ItemType File -Path .nojekyll -Force | Out-Null
```

- [ ] **Step 3: Decide custom domain before creating `CNAME`**

If the user confirms `quang-grad-2026.xyz` is the deployment domain, run:

```powershell
Set-Content -Path CNAME -Value "quang-grad-2026.xyz" -NoNewline -Encoding ASCII
```

If the user does not confirm the custom domain, do not create `CNAME`.

- [ ] **Step 4: Commit deployment files**

```powershell
git add .nojekyll
if (Test-Path CNAME) { git add CNAME }
git commit -m "chore: prepare GitHub Pages deployment"
```

---

## Task 8: Final Verification And Push Checkpoint

**Files:**
- All project files

- [ ] **Step 1: Run full verification**

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
Select-String -Path index.html -Pattern '<style\b|<script(?![^>]*\bsrc=)'
```

Expected:
- Tests pass.
- `git diff --check` exits `0`.
- `Select-String` returns no matches.

- [ ] **Step 2: Browser smoke test without valid RSVP submission**

Serve locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Verify:
- Envelope appears.
- Envelope click opens invite.
- `?guest=` prefill works.
- Empty-name submit shows validation.
- Responsive widths `768px` and `480px` do not break layout.
- Do not submit a valid RSVP.

- [ ] **Step 3: Inspect commit history**

```powershell
git log --oneline --decorate -8
git status --short
```

Expected: working tree clean.

- [ ] **Step 4: Ask before external push/deploy side effects**

Before pushing or configuring GitHub Pages, ask the user for confirmation. After confirmation:

```powershell
git push -u origin codex/full-project-optimization
```

If the user asks to merge directly to `main`, verify again first and then push `main`.

---

## Out Of Scope

| Item | Reason |
| --- | --- |
| Real Formspree RSVP submit | Requires explicit user confirmation because it sends data and consumes quota. |
| Ceremony time update | The time is unknown; do not invent it. |
| CSP | Splitting files makes CSP easier, but CSP policy design is a separate task. |
| Playwright dependency setup | The current tests are enough for this static project pass; adding a new dependency is optional later. |
| Analytics/service worker | Not required by the PRD and not needed for launch readiness. |
| Long-lived `develop` branch | Overkill for this small project; use `codex/full-project-optimization` instead. |

---

## Self-Review

- Spec coverage: v2.1 commit, file split, test-harness migration, a11y gaps, perf gaps, docs, deploy prep, and final verification all have explicit tasks.
- No broken commits: red tests added in the same task group as their implementation, with commit only after green verification.
- Side effects guarded: valid Formspree submit, custom-domain `CNAME`, push, and deploy require user confirmation.
- Test consistency: Python reads HTML/CSS/JS through `all_source`; Node runtime loads inline script before split and `app.js` after split.
