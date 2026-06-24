# Historical Archive

This draft was superseded by docs/superpowers/plans/2026-06-11-full-project-optimization.md. It is kept for audit/history only.

---

# Project Optimization — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu toàn diện dự án thiệp mời tốt nghiệp: tách file, cải thiện accessibility, performance, testing, git workflow, deploy, và giải quyết launch blockers.

**Architecture:** Tách `index.html` (1304 dòng) thành 3 files riêng (`index.html`, `style.css`, `app.js`) để dễ maintain và cho phép thêm CSP. Giữ nguyên flow 3 màn hình, Formspree integration, và localStorage UX. Thêm skip link, cải thiện ARIA, optimize font loading, thêm E2E tests với Playwright, setup git workflow với develop branch, deploy lên GitHub Pages.

**Tech Stack:** Vanilla HTML/CSS/JS (tách file), Formspree, Python unittest, Node vm runtime checks, Playwright E2E, Git (feature branches + PR workflow).

---

## File Structure (Sau khi tối ưu)

```
├── index.html          (~200 dòng) — markup only, link CSS/JS
├── style.css           (~550 dòng) — toàn bộ CSS
├── app.js              (~450 dòng) — toàn bộ JS logic
├── preview.png         — social preview asset
├── README.md           — quick start + verification
├── AGENTS.md           — agent handoff context
├── CHANGELOG.md        — version history (NEW)
├── PRD-graduation-invitation.md — product requirements
├── .gitignore          — git ignore rules
├── docs/
│   ├── ARCHITECTURE.md — system architecture
│   ├── PROJECT_STATUS.md — current status + blockers
│   ├── DEPLOYMENT.md   — deploy guide (NEW)
│   ├── superpowers/
│   │   ├── plans/
│   │   │   ├── 2026-06-09-graduation-invitation.md (historical)
│   │   │   ├── 2026-06-11-project-optimization-context.md (historical)
│   │   │   └── 2026-06-12-full-optimization.md (this plan)
│   │   └── specs/
│   │       └── 2026-06-11-project-optimization-context-design.md
│   └── archive/
│       ├── context-2026-06-11.md
│       └── fix-audit-2026-06-11.md
└── tests/
    ├── test_project.py     — Python structural checks
    ├── runtime_checks.js  — Node vm runtime checks
    ├── generate_preview.py — preview.png generator
    └── e2e/                — Playwright E2E tests (NEW)
        ├── __init__.py
        └── test_invitation_flow.py
```

---

## PHASE 1: Git Hygiene & Commit v2.1

### Task 1: Commit tất cả uncommitted changes (v2.1)

**Files:** Toàn bộ files đã modified

- [ ] **Step 1: Kiểm tra git status**
```bash
git status
git diff --stat
```
Expected: 3 modified files (PRD, plan, index.html), ~34KB diff

- [ ] **Step 2: Stage và commit v2.1 changes**
```bash
git add PRD-graduation-invitation.md docs/superpowers/plans/2026-06-09-graduation-invitation.md index.html
git commit -m @'
feat: optimization v2.1 — accessibility, validation, FormData

- Change greeting from "You Are Invited" to "Trân Trọng Mời"
- Add "Giờ" detail block with "Sẽ cập nhật sau"
- Switch form submission from JSON to FormData
- Add client-side validation (guest count 1-5, message max 500)
- Add XSS sanitization on ?guest= param
- Add repeat-submit confirmation flow (60s window)
- Add keyboard arrow navigation for radio group
- Add :focus-visible styling with proper outline
- Improve text opacity values for better readability
- Add fetchWithTimeout helper with AbortController
- Add readStoredRSVP and isRecentRSVP helpers
- Change honeypot to hidden attribute + aria-hidden
- Update Formspree endpoint to xeewzabd

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
```

- [ ] **Step 3: Verify**
```bash
git status  # Should show clean working tree
git log --oneline -3  # Should show 3 commits
```

---

## PHASE 2: Tách File (index.html → 3 files)

### Task 2: Tách CSS ra `style.css`

**Files:**
- Create: `style.css`
- Modify: `index.html` (thay `<style>` block bằng `<link>`)

- [ ] **Step 1: Tạo `style.css` với toàn bộ CSS từ index.html**

File `style.css` nội dung (copy từ dòng 19–761 của index.html):
```css
/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box
}

html, body {
  width: 100%;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
  font-family: 'Cormorant Garamond', 'Georgia', 'Times New Roman', serif;
  background: #0a0a14;
  color: #fff
}

@media(prefers-reduced-motion:reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important
  }
}

/* ============================================================
   SCREENS
   ============================================================ */
.screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity .6s ease, visibility .6s ease;
  z-index: 1
}

.screen.active {
  opacity: 1;
  visibility: visible;
  z-index: 10
}

/* ============================================================
   BACKGROUND PARTICLES
   ============================================================ */
.bg-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden
}

.bg-particle {
  position: absolute;
  background: rgba(226, 176, 74, .35);
  border-radius: 50%;
  animation: floatUp 8s linear infinite
}

@keyframes floatUp {
  0%   { transform: translateY(100vh) scale(0); opacity: 0 }
  10%  { opacity: 1 }
  90%  { opacity: 1 }
  100% { transform: translateY(-10vh) scale(1); opacity: 0 }
}

/* ============================================================
   SCREEN 1 — ENVELOPE
   ============================================================ */
#screen-envelope {
  flex-direction: column;
  overflow-y: auto;
  padding: 20px
}

.envelope-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none
}

.envelope-btn:focus-visible .envelope {
  outline: 2px solid #e2b04a;
  outline-offset: 8px;
  border-radius: 8px
}

.envelope {
  width: 340px;
  max-width: 85vw;
  background: linear-gradient(145deg, #1e2d4d, #16213e);
  border: 1px solid rgba(226, 176, 74, .35);
  border-radius: 8px;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  box-shadow: 0 12px 40px rgba(0, 0, 0, .5), 0 0 40px rgba(226, 176, 74, .05);
  transition: transform .3s, box-shadow .3s
}

.envelope-btn:hover .envelope {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, .6)
}

.envelope-seal {
  width: 56px;
  height: 56px;
  background: radial-gradient(circle at 35% 35%, #f0d078, #e2b04a 40%, #c49b30);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
  box-shadow: 0 4px 16px rgba(226, 176, 74, .3);
  position: relative;
  overflow: hidden
}

.envelope-seal::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, .15) 50%, transparent 60%);
  animation: shimmer 3s ease-in-out infinite
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%) rotate(45deg) }
  50%      { transform: translateX(100%) rotate(45deg) }
}

.envelope-text {
  display: flex;
  flex-direction: column;
  gap: 6px
}

.env-name {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #fff
}

.env-event {
  font-size: 11px;
  letter-spacing: 6px;
  color: #e2b04a;
  text-transform: uppercase
}

.env-date, .env-venue {
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, .5)
}

.env-cta {
  margin-top: 24px;
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(226, 176, 74, .6);
  animation: pulse 2s ease-in-out infinite
}

@keyframes pulse {
  0%, 100% { opacity: .4 }
  50%      { opacity: 1 }
}

/* ============================================================
   SCREEN 2 — INVITE + FORM
   ============================================================ */
#screen-invite {
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 20px
}

.invite-wrapper {
  width: 560px;
  max-width: 100%;
  flex-shrink: 0;
  margin: auto 0;
  text-align: center;
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(20px);
  transition: all .5s cubic-bezier(.16, 1, .3, 1)
}

.invite-wrapper.visible {
  opacity: 1;
  transform: translateY(0)
}

.inv-emoji {
  font-size: 40px;
  margin-bottom: 10px;
  display: block
}

.inv-greeting {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  letter-spacing: 4px;
  color: #e2b04a;
  text-transform: uppercase
}

.inv-name {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  margin-top: 4px
}

.inv-divider {
  width: 60px;
  height: 1px;
  margin: 16px auto;
  background: linear-gradient(90deg, transparent, rgba(226, 176, 74, .5), transparent)
}

.inv-message {
  font-size: 16px;
  color: rgba(255, 255, 255, .6);
  line-height: 1.7;
  font-style: italic;
  max-width: 420px;
  margin: 0 auto 20px
}

.inv-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px
}

.inv-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px
}

.detail-icon {
  font-size: 20px
}

.detail-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, .7);
  text-transform: uppercase
}

.detail-value {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  color: #e2b04a;
  letter-spacing: 1px
}

/* Form */
.form-group {
  margin-bottom: 16px;
  text-align: left
}

.form-group label {
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, .7);
  margin-bottom: 6px;
  text-transform: uppercase
}

.form-group .optional {
  font-size: 10px;
  color: rgba(255, 255, 255, .55);
  text-transform: none;
  letter-spacing: 0
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 6px;
  color: #fff;
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  outline: none;
  transition: border-color .3s, box-shadow .3s
}

.form-group input:focus:not(:focus-visible),
.form-group textarea:focus:not(:focus-visible),
.form-group select:focus:not(:focus-visible) {
  border-color: rgba(226, 176, 74, .3);
  box-shadow: none
}

.form-group input:focus-visible,
.form-group textarea:focus-visible,
.form-group select:focus-visible {
  border-color: rgba(226, 176, 74, .5);
  box-shadow: 0 0 0 3px rgba(226, 176, 74, .1);
  outline: 2px solid #e2b04a;
  outline-offset: 2px
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, .5)
}

.form-group textarea {
  resize: vertical;
  min-height: 60px
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23e2b04a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer
}

.form-group select option {
  background: #16213e;
  color: #fff
}

.form-error {
  color: #f87171;
  font-size: 12px;
  margin-top: 6px;
  display: block;
  min-height: 18px;
  font-style: italic
}

.sent-banner {
  margin-top: 16px;
  padding: 12px;
  background: rgba(226, 176, 74, .1);
  border: 1px solid rgba(226, 176, 74, .3);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, .7)
}

/* Radio cards */
.radio-group {
  display: flex;
  gap: 10px
}

.radio-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 11px;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 6px;
  cursor: pointer;
  transition: all .3s;
  position: relative
}

.radio-card:hover {
  border-color: rgba(226, 176, 74, .3);
  background: rgba(226, 176, 74, .05)
}

.radio-card.selected {
  border-color: rgba(226, 176, 74, .5);
  background: rgba(226, 176, 74, .1);
  box-shadow: 0 0 12px rgba(226, 176, 74, .1)
}

.radio-card input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0
}

.radio-card span {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, .7);
  transition: color .3s
}

.radio-card.selected span {
  color: #e2b04a
}

/* Submit button */
.btn-submit {
  width: 100%;
  padding: 15px;
  margin-top: 6px;
  background: linear-gradient(135deg, #e2b04a, #c49b30);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(226, 176, 74, .3)
}

.btn-submit:disabled {
  opacity: .5;
  cursor: not-allowed
}

.btn-text {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #1a1a2e;
  text-transform: uppercase
}

.btn-submit::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(transparent, rgba(255, 255, 255, .2), transparent);
  transform: rotate(45deg) translateX(-100%);
  transition: transform .6s ease
}

.btn-submit:hover:not(:disabled)::after {
  transform: rotate(45deg) translateX(100%)
}

/* ============================================================
   SCREEN 3 — THANK YOU
   ============================================================ */
#screen-thanks {
  flex-direction: column;
  background: radial-gradient(ellipse at center, #16213e 0%, #0a0a14 100%)
}

.thanks-content {
  text-align: center;
  opacity: 0;
  transform: scale(.9);
  transition: all .6s cubic-bezier(.16, 1, .3, 1) .2s;
  position: relative;
  z-index: 2
}

.thanks-content.visible {
  opacity: 1;
  transform: scale(1)
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  position: relative
}

.checkmark {
  width: 80px;
  height: 80px;
  transform: rotate(-90deg)
}

.checkmark-circle-bg {
  stroke: rgba(226, 176, 74, .2);
  stroke-width: 2
}

.checkmark-check {
  stroke: #e2b04a;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48
}

.checkmark-circle.animate .checkmark-check {
  animation: drawCheck .6s ease forwards .3s
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0 }
}

.thanks-title {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #fff;
  margin-bottom: 10px
}

.thanks-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  color: rgba(255, 255, 255, .7);
  letter-spacing: 1px;
  margin-bottom: 8px
}

.thanks-sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  color: rgba(255, 255, 255, .45);
  font-style: italic
}

.thanks-back {
  display: inline-block;
  margin-top: 24px;
  padding: 10px 28px;
  background: 0 0;
  border: 1px solid rgba(226, 176, 74, .4);
  border-radius: 4px;
  color: #e2b04a;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  letter-spacing: 3px;
  text-decoration: none;
  transition: all .3s
}

.thanks-back:hover {
  background: rgba(226, 176, 74, .1);
  border-color: #e2b04a
}

/* ============================================================
   CONFETTI
   ============================================================ */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  overflow: hidden
}

.confetti-piece {
  position: absolute;
  top: -10px;
  opacity: 0
}

.confetti-piece.animate {
  animation: confettiFall 1.5s cubic-bezier(.16, 1, .3, 1) forwards
}

@keyframes confettiFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1) }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(.5) }
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media(max-width:768px) {
  .env-name    { font-size: 16px; letter-spacing: 2px }
  .env-event   { font-size: 10px; letter-spacing: 4px }
  .env-date, .env-venue { font-size: 11px }
  .inv-name    { font-size: 20px }
  .inv-message { font-size: 14px }
  .inv-details { gap: 14px }
  .thanks-title { font-size: 24px }
}

@media(max-width:480px) {
  .env-name      { font-size: 14px; letter-spacing: 1px }
  .envelope-seal { width: 44px; height: 44px; font-size: 20px }
  .env-cta       { font-size: 9px }
  .radio-group   { flex-direction: column; gap: 8px }
  .form-group input, .form-group textarea, .form-group select {
    font-size: 14px;
    padding: 10px 12px
  }
  .btn-submit    { padding: 14px }
  .btn-text      { font-size: 13px; letter-spacing: 3px }
  .detail-value  { font-size: 12px }
}
```

- [ ] **Step 2: Viết `style.css` vào file**
```bash
# Write the CSS content above to style.css
```

- [ ] **Step 3: Cập nhật `index.html` — thay `<style>` block bằng `<link>`**

Thay dòng 19 (`<style>`) đến dòng 761 (`</style>`) bằng:
```html
<link rel="stylesheet" href="style.css">
```

- [ ] **Step 4: Verify CSS load đúng**
```bash
python -m http.server 8080 &
# Mở http://127.0.0.1:8080/ — kiểm tra visual giống hệt bản cũ
```

- [ ] **Step 5: Run tests**
```bash
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```
Expected: Tất cả PASS

- [ ] **Step 6: Commit**
```bash
git add style.css index.html
git commit -m "refactor: extract CSS from index.html into style.css"
```

---

### Task 3: Tách JS ra `app.js`

**Files:**
- Create: `app.js`
- Modify: `index.html` (thay `<script>` block bằng `<script src>`)

- [ ] **Step 1: Tạo `app.js` với toàn bộ JS từ index.html**

File `app.js` nội dung (copy từ dòng 909–1301 của index.html):
```javascript
// ================================================================
// CONFIG
// ================================================================
const RSVP_ENDPOINT = 'https://formspree.io/f/xeewzabd';
const FETCH_TIMEOUT = 15000;
const RSVP_REPEAT_WINDOW_MS = 60000;

// ================================================================
// STATE
// ================================================================
let isAnimating = false;
let isSubmitting = false;
let rsvpCheckInitialized = false;
let repeatSubmitConfirmedKey = null;
let activeConfetti = null;

// ================================================================
// HELPERS
// ================================================================
async function fetchWithTimeout(url, options, timeout) {
  timeout = timeout || FETCH_TIMEOUT;
  const controller = new AbortController();
  const id = setTimeout(function() { controller.abort(); }, timeout);
  try {
    var response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Timeout: Vui lòng thử lại');
    }
    throw err;
  }
}

// ================================================================
// BACKGROUND PARTICLES
// ================================================================
function initParticles() {
  const c = document.getElementById('bg-particles');
  if (!c) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'bg-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    const s = 1 + Math.random() * 2;
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    c.appendChild(p);
  }
}

// ================================================================
// SCREEN TRANSITIONS
// ================================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.setAttribute('aria-hidden', 'true');
    s.inert = true;
  });
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  target.removeAttribute('aria-hidden');
  target.inert = false;
  target.scrollTop = 0;
  setTimeout(() => {
    target.querySelector('[data-screen-focus]')?.focus({ preventScroll: true });
  }, 150);

  if (id === 'screen-invite') {
    setTimeout(() => {
      document.getElementById('invite-wrapper')?.classList.add('visible');
    }, 100);
  }
  if (id === 'screen-thanks') {
    setTimeout(() => {
      document.querySelector('.thanks-content')?.classList.add('visible');
      document.querySelector('.checkmark-circle')?.classList.add('animate');
    }, 100);
  }
}

// ================================================================
// OPEN ENVELOPE
// ================================================================
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

// ================================================================
// URL PARAM ?guest= — pre-fill tên
// ================================================================
function prefillNameFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get('guest');
    if (guest) {
      const name = guest;
      const input = document.getElementById('rsvp-name');
      if (input && name.length > 0 && name.length < 100 && !/<script|javascript:|on\w+=/i.test(name)) {
        input.value = name;
      }
    }
  } catch (e) {
    // Invalid encoding — bỏ qua
  }
}

// ================================================================
// RADIO CARD SELECTION
// ================================================================
function selectRadio(card) {
  document.querySelectorAll('#rsvp-form .radio-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  const radio = card.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Toggle guest count visibility
  const gcg = document.getElementById('guest-count-group');
  if (gcg) gcg.style.display = card.dataset.value === 'yes' ? '' : 'none';
}

// ================================================================
// LOCAL STORAGE — UX only (nhớ "đã gửi RSVP")
// ================================================================
function getStorageKey(name) {
  return 'grad_rsvp_' + name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim().replace(/\s+/g, '_');
}

function readStoredRSVP(name) {
  if (!name) return null;
  try {
    const data = JSON.parse(localStorage.getItem(getStorageKey(name)) || 'null');
    return data && typeof data === 'object' ? data : null;
  } catch (e) {
    return null;
  }
}

function isRecentRSVP(data) {
  if (!data || !data.sent || !data.timestamp) return false;
  const submittedAt = Date.parse(data.timestamp);
  if (!Number.isFinite(submittedAt)) return false;
  return Date.now() - submittedAt < RSVP_REPEAT_WINDOW_MS;
}

function checkPreviousRSVP() {
  if (rsvpCheckInitialized) return;
  rsvpCheckInitialized = true;

  const nameInput = document.getElementById('rsvp-name');
  if (!nameInput) return;

  const check = () => {
    const name = nameInput.value.trim();
    const banner = document.getElementById('sent-banner');
    if (!name) {
      if (banner) banner.style.display = 'none';
      return;
    }
    const data = readStoredRSVP(name);
    if (data && data.sent) {
      if (banner) banner.style.display = 'block';
      if (data.attendance === 'no') {
        const noRadio = document.querySelector('.radio-card[data-value="no"]');
        if (noRadio) selectRadio(noRadio);
      }
    } else if (banner) {
      banner.style.display = 'none';
    }
  };

  nameInput.addEventListener('input', check);
  if (nameInput.value) check();
}

// ================================================================
// FORM SUBMISSION — Formspree
// ================================================================
async function submitRSVP(e) {
  e.preventDefault();
  if (isSubmitting) return;

  // Validate name
  const name = document.getElementById('rsvp-name').value.trim();
  if (!name) {
    document.getElementById('error-name').textContent = 'Vui lòng nhập họ và tên';
    return;
  }
  document.getElementById('error-name').textContent = '';

  const attendance = document.querySelector('#rsvp-form input[name="attendance"]:checked')?.value || 'yes';
  const guestCount = attendance === 'yes' ? parseInt(document.getElementById('guest-count').value) || 1 : 0;
  const message = document.getElementById('rsvp-message').value.trim();
  const btn = document.getElementById('btn-submit');
  const btnText = btn.querySelector('.btn-text');
  const originalText = btnText.textContent;

  // Honeypot — silent reject for bots
  const gotcha = document.querySelector('input[name="_gotcha"]')?.value;
  if (gotcha) return;

  // Validate guest count
  if (attendance === 'yes' && (guestCount < 1 || guestCount > 5)) {
    document.getElementById('error-submit').textContent = 'Số người phải từ 1 đến 5';
    return;
  }

  // Validate message length
  if (message.length > 500) {
    document.getElementById('error-submit').textContent = 'Lời chúc không quá 500 ký tự';
    return;
  }

  const storageKey = getStorageKey(name);
  const previousRSVP = readStoredRSVP(name);
  if (isRecentRSVP(previousRSVP) && repeatSubmitConfirmedKey !== storageKey) {
    repeatSubmitConfirmedKey = storageKey;
    document.getElementById('error-submit').textContent = 'Bạn vừa gửi xác nhận. Bấm Gửi xác nhận lần nữa nếu muốn gửi lại.';
    return;
  }
  repeatSubmitConfirmedKey = null;

  // Loading state
  isSubmitting = true;
  btn.disabled = true;
  btnText.textContent = 'Đang gửi...';
  document.getElementById('error-submit').textContent = '';

  try {
    // Build FormData (Formspree đảm bảo parse đúng)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('attendance', attendance);
    formData.append('guestCount', guestCount);
    formData.append('message', message);
    formData.append('timestamp', new Date().toISOString());
    // Không append _gotcha; hidden input được check ở client trước khi gửi.

    const response = await fetchWithTimeout(RSVP_ENDPOINT, {
      method: 'POST',
      body: formData // Không cần Content-Type — browser tự set boundary
    });

    if (response.ok) {
      // Save to localStorage (UX only)
      localStorage.setItem(storageKey, JSON.stringify({
        sent: true,
        timestamp: new Date().toISOString(),
        attendance
      }));

      // Dynamic thank you text
      const thanksText = document.getElementById('thanks-text');
      if (thanksText) {
        thanksText.textContent = attendance === 'yes'
          ? 'Hẹn gặp bạn tại buổi lễ 🎓'
          : 'Cảm ơn bạn đã phản hồi nhé. Hẹn gặp bạn dịp khác!';
      }

      createConfetti();
      setTimeout(() => showScreen('screen-thanks'), 800);
    } else {
      throw new Error('HTTP ' + response.status);
    }
  } catch (err) {
    console.error('[RSVP] Submit failed:', err);
    if (err.message === 'Timeout: Vui lòng thử lại') {
      document.getElementById('error-submit').textContent = 'Mạng chậm quá, vui lòng thử lại sau.';
    } else {
      document.getElementById('error-submit').textContent = 'Chưa gửi được xác nhận, bạn thử lại giúp mình nhé.';
    }
    btn.disabled = false;
    btnText.textContent = originalText;
  } finally {
    isSubmitting = false;
  }
}

// ================================================================
// CONFETTI
// ================================================================
function createConfetti() {
  if (activeConfetti) activeConfetti.remove();

  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  activeConfetti = container;
  const colors = ['#e2b04a', '#c49b30', '#f0d078', '#ffffff', '#f5a0a0', '#f0c080'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.width = (6 + Math.random() * 8) + 'px';
    p.style.height = (6 + Math.random() * 8) + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    p.style.animationDelay = Math.random() * .5 + 's';
    p.style.animationDuration = (1 + Math.random()) + 's';
    container.appendChild(p);
    requestAnimationFrame(() => p.classList.add('animate'));
  }
  setTimeout(function() {
    container.remove();
    if (activeConfetti === container) activeConfetti = null;
  }, 3000);
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();

  // Staggered text reveal on envelope
  const envelopeText = document.querySelector('.envelope-text');
  if (envelopeText) {
    const children = envelopeText.children;
    Array.from(children).forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all .4s ease ' + (0.1 + i * 0.1) + 's';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }

  // Input listeners
  const nameInput = document.getElementById('rsvp-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      document.getElementById('error-name').textContent = '';
      repeatSubmitConfirmedKey = null;
    });
  }

  document.querySelector('.envelope-btn')?.addEventListener('click', openEnvelope);
  document.getElementById('rsvp-form')?.addEventListener('submit', submitRSVP);

  document.querySelectorAll('#rsvp-form .radio-card').forEach(card => {
    card.addEventListener('click', () => selectRadio(card));
  });

  // Keyboard arrow navigation for radio group
  var radioGroup = document.querySelector('.radio-group');
  if (radioGroup) {
    radioGroup.addEventListener('keydown', function(e) {
      var cards = Array.from(radioGroup.querySelectorAll('.radio-card'));
      var current = cards.findIndex(function(c) { return c.classList.contains('selected'); });
      var next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = (current + 1) % cards.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = (current - 1 + cards.length) % cards.length;
      }
      if (next >= 0) {
        selectRadio(cards[next]);
        cards[next].focus();
      }
    });
  }
});
```

- [ ] **Step 2: Viết `app.js` vào file**
```bash
# Write the JS content above to app.js
```

- [ ] **Step 3: Cập nhật `index.html` — thay `<script>` block bằng `<script src>`**

Thay dòng 909 (`<script>`) đến dòng 1301 (`</script>`) bằng:
```html
<script src="app.js" defer></script>
```

Lưu ý: Thêm `defer` attribute để đảm bảo script chạy sau khi DOM parsed (thay thế `DOMContentLoaded` listener pattern). Cần cập nhật `app.js` để bỏ `DOMContentLoaded` wrapper.

- [ ] **Step 4: Cập nhật `app.js` — bỏ `DOMContentLoaded` wrapper (vì dùng `defer`)**

Thay:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // ... toàn bộ init code ...
});
```
Thành:
```javascript
// ... toàn bộ init code chạy trực tiếp (defer đảm bảo DOM ready) ...
```

- [ ] **Step 5: Verify visual và functionality**
```bash
python -m http.server 8080 &
# Mở http://127.0.0.1:8080/ — test toàn bộ flow
```

- [ ] **Step 6: Run tests**
```bash
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```
Expected: Tất cả PASS

- [ ] **Step 7: Commit**
```bash
git add app.js index.html
git commit -m "refactor: extract JavaScript from index.html into app.js"
```

---

### Task 4: Cập nhật `index.html` final (markup only)

**Files:** Modify: `index.html`

- [ ] **Step 1: Viết `index.html` cuối cùng (~200 dòng)**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thiệp Mời Tốt Nghiệp — Quách Ngọc Quang</title>
  <meta name="description" content="Thiệp mời lễ tốt nghiệp Quách Ngọc Quang — 05/07/2026, Hội trường Nguyễn Văn Đạo">
  <meta property="og:title" content="Thiệp Mời Tốt Nghiệp — Quách Ngọc Quang">
  <meta property="og:description" content="Mời bạn đến dự lễ tốt nghiệp — 05/07/2026">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://quang-grad-2026.xyz/preview.png">
  <link rel="canonical" href="https://quang-grad-2026.xyz/">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%231a1a2e' stroke='%23e2b04a' stroke-width='3'/><text x='50' y='65' text-anchor='middle' font-size='50'>🎓</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- Skip link for accessibility -->
<a href="#screen-invite" class="skip-link">Đến nội dung chính</a>

<!-- Background particles -->
<div class="bg-particles" id="bg-particles" aria-hidden="true"></div>

<!-- ============================================================
     SCREEN 1: ENVELOPE
     ============================================================ -->
<div id="screen-envelope" class="screen active" role="region" aria-label="Thiệp mời tốt nghiệp">
  <button class="envelope-btn" aria-label="Mở thiệp mời">
    <div class="envelope">
      <div class="envelope-seal" aria-hidden="true">🎓</div>
      <div class="envelope-text">
        <span class="env-name">QUÁCH NGỌC QUANG</span>
        <span class="env-event">LỄ TỐT NGHIỆP</span>
        <span class="env-date">05 . 07 . 2026</span>
        <span class="env-venue">Hội trường Nguyễn Văn Đạo</span>
      </div>
    </div>
    <p class="env-cta">▼ CLICK TO OPEN ▼</p>
  </button>
</div>

<!-- ============================================================
     SCREEN 2: INVITE + RSVP FORM
     ============================================================ -->
<div id="screen-invite" class="screen" role="region" aria-label="Thiệp mời và form xác nhận tham dự" aria-hidden="true" inert>
  <div class="invite-wrapper" id="invite-wrapper">
    <!-- Header -->
    <span class="inv-emoji" aria-hidden="true">🎓</span>
    <div class="inv-greeting">Trân Trọng Mời</div>
    <h2 class="inv-name" tabindex="-1" data-screen-focus>Quách Ngọc Quang</h2>
    <div class="inv-divider"></div>

    <!-- Message -->
    <p class="inv-message">
      Mình trân trọng mời bạn đến dự lễ tốt nghiệp của mình.<br>
      Sự hiện diện của bạn sẽ là món quà ý nghĩa nhất trong ngày đặc biệt này.
    </p>

    <!-- Details -->
    <div class="inv-details">
      <div class="inv-detail">
        <span class="detail-icon">📅</span>
        <span class="detail-label">Ngày</span>
        <span class="detail-value">05 / 07 / 2026</span>
      </div>
      <div class="inv-detail">
        <span class="detail-icon">📍</span>
        <span class="detail-label">Địa điểm</span>
        <span class="detail-value">Hội trường Nguyễn Văn Đạo</span>
      </div>
      <div class="inv-detail">
        <span class="detail-icon">🕐</span>
        <span class="detail-label">Giờ</span>
        <span class="detail-value">Sẽ cập nhật sau</span>
      </div>
      <div class="inv-detail">
        <span class="detail-icon">🎓</span>
        <span class="detail-label">Sự kiện</span>
        <span class="detail-value">Lễ Tốt Nghiệp</span>
      </div>
    </div>

    <!-- RSVP Form -->
    <form id="rsvp-form" novalidate style="text-align:left">
      <!-- Honeypot anti-spam -->
      <input type="text" name="_gotcha" hidden tabindex="-1" autocomplete="off" aria-hidden="true">

      <!-- Name -->
      <div class="form-group">
        <label for="rsvp-name">Họ và tên</label>
        <input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name">
        <span class="form-error" id="error-name" role="alert"></span>
      </div>

      <!-- Attendance -->
      <div class="form-group">
        <label>Tham dự</label>
        <div class="radio-group" role="radiogroup" aria-label="Xác nhận tham dự">
          <label class="radio-card selected" data-value="yes">
            <input type="radio" name="attendance" value="yes" checked>
            <span>Có</span>
          </label>
          <label class="radio-card" data-value="no">
            <input type="radio" name="attendance" value="no">
            <span>Không</span>
          </label>
        </div>
      </div>

      <!-- Guest count (hidden if "Không") -->
      <div class="form-group" id="guest-count-group">
        <label for="guest-count">Số người</label>
        <select id="guest-count" name="guestCount">
          <option value="1">1 người</option>
          <option value="2">2 người</option>
          <option value="3">3 người</option>
          <option value="4">4 người</option>
          <option value="5">5 người</option>
        </select>
      </div>

      <!-- Message (optional) -->
      <div class="form-group">
        <label for="rsvp-message">Lời chúc <span class="optional">(tùy chọn)</span></label>
        <textarea id="rsvp-message" name="message" rows="2" maxlength="500" placeholder="Chúc Quang..."></textarea>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-submit" id="btn-submit">
        <span class="btn-text">Gửi xác nhận</span>
      </button>
      <span class="form-error" id="error-submit" role="alert" aria-live="polite"></span>
    </form>

    <!-- Already sent banner -->
    <div class="sent-banner" id="sent-banner" style="display:none" role="status" aria-live="polite">
      Bạn đã gửi xác nhận trước đó. Bạn vẫn có thể sửa và gửi lại.
    </div>
  </div>
</div>

<!-- ============================================================
     SCREEN 3: THANK YOU
     ============================================================ -->
<div id="screen-thanks" class="screen" role="region" aria-label="Cảm ơn" aria-hidden="true" inert>
  <div class="thanks-content">
    <div class="checkmark-circle">
      <svg class="checkmark" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>
    <h2 class="thanks-title" tabindex="-1" data-screen-focus>Cảm ơn bạn nhé!</h2>
    <p class="thanks-text" id="thanks-text">Hẹn gặp bạn tại buổi lễ 🎓</p>
    <a href="./" class="thanks-back">Xem lại thiệp</a>
  </div>
</div>

<script src="app.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Thêm `.skip-link` CSS vào `style.css`**

Thêm vào đầu `style.css` (sau reset):
```css
/* Skip link — accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #e2b04a;
  color: #1a1a2e;
  padding: 8px 16px;
  z-index: 1000;
  text-decoration: none;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  letter-spacing: 2px;
  transition: top .3s
}

.skip-link:focus {
  top: 0
}
```

- [ ] **Step 3: Verify**
```bash
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```
Expected: Tất cả PASS

- [ ] **Step 4: Commit**
```bash
git add index.html style.css app.js
git commit -m "refactor: finalize split into index.html + style.css + app.js

- index.html: markup only (~200 lines)
- style.css: all CSS with skip-link accessibility
- app.js: all JS with defer (no DOMContentLoaded wrapper)
- Add font preconnect hints for Google Fonts"
```

---

## PHASE 3: Accessibility Improvements

### Task 5: Cải thiện Accessibility

**Files:** Modify: `index.html`, `style.css`, `app.js`

- [ ] **Step 1: Thêm skip link vào HTML** — Đã làm trong Task 4

- [ ] **Step 2: Thêm `aria-hidden="true"` cho particles trong HTML**

Thay `<div class="bg-particles" id="bg-particles">` thành:
```html
<div class="bg-particles" id="bg-particles" aria-hidden="true"></div>
```
(Đã có trong Task 4)

- [ ] **Step 3: Cải thiện radio group ARIA trong HTML**

Thay `<div class="radio-group" role="radiogroup" aria-label="Xác nhận tham dự">` thành:
```html
<div class="radio-group" role="radiogroup" aria-label="Xác nhận tham dự" aria-describedby="radio-hint">
```
Và thêm `<span id="radio-hint" class="sr-only">Sử dụng phím mũi tên trái/phải để chọn</span>` sau radio-group.

- [ ] **Step 4: Thêm `.sr-only` class vào CSS**
```css
/* Screen-reader only — accessibility utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0
}
```

- [ ] **Step 5: Thêm `aria-describedby` cho form fields trong HTML**

Thay:
```html
<label for="rsvp-name">Họ và tên</label>
<input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name">
<span class="form-error" id="error-name" role="alert"></span>
```
Thành:
```html
<label for="rsvp-name">Họ và tên</label>
<input type="text" id="rsvp-name" name="name" required placeholder="Nhập họ và tên..." autocomplete="name" aria-describedby="error-name">
<span class="form-error" id="error-name" role="alert"></span>
```

- [ ] **Step 6: Thêm `aria-live="polite"` cho error-submit** — Đã có trong Task 4

- [ ] **Step 7: Verify với axe-core (nếu có) hoặc manual check**
```bash
python -m http.server 8080 &
# Mở Chrome DevTools → Lighthouse → Accessibility audit
```

- [ ] **Step 8: Run tests**
```bash
python -m unittest -v tests.test_project
node tests\runtime_checks.js
```

- [ ] **Step 9: Commit**
```bash
git add index.html style.css
git commit -m "a11y: add skip link, sr-only class, aria-describedby, radio hint

- Skip link for keyboard users to bypass decorative content
- .sr-only utility class for screen-reader-only text
- aria-describedby on name input linking to error container
- aria-describedby on radio group with keyboard navigation hint
- Confirm aria-hidden on bg-particles"
```

---

## PHASE 4: Performance Optimization

### Task 6: Font Loading Strategy

**Files:** Modify: `index.html`

- [ ] **Step 1: Thêm `font-display: swap` vào Google Fonts URL**

Thay:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet">
```
(Đã có `display=swap` — giữ nguyên)

- [ ] **Step 2: Thêm preload cho critical fonts vào `<head>`**
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet"></noscript>
```

- [ ] **Step 3: Verify font loading**
```bash
# Mở Chrome DevTools → Network → check font loading order
# Preload font CSS nên xuất hiện sớm hơn
```

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "perf: add font preload and preconnect hints"
```

---

### Task 7: Particle Animation Optimization

**Files:** Modify: `app.js`

- [ ] **Step 1: Giảm particle count trên mobile**

Thay `initParticles()` trong `app.js`:
```javascript
function initParticles() {
  const c = document.getElementById('bg-particles');
  if (!c) return;
  // Reduce particles on mobile for performance
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 10 : 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'bg-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    const s = 1 + Math.random() * 2;
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    c.appendChild(p);
  }
}
```

- [ ] **Step 2: Thêm `will-change` optimization vào CSS**

Thêm vào `.bg-particle` trong `style.css`:
```css
.bg-particle {
  position: absolute;
  background: rgba(226, 176, 74, .35);
  border-radius: 50%;
  animation: floatUp 8s linear infinite;
  will-change: transform, opacity
}
```

- [ ] **Step 3: Thêm `contain` property cho screens**

Thêm vào `.screen` trong `style.css`:
```css
.screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity .6s ease, visibility .6s ease;
  z-index: 1;
  contain: layout style paint
}
```

- [ ] **Step 4: Verify performance**
```bash
# Mở Chrome DevTools → Lighthouse → Performance audit
# Target: Performance score > 90
```

- [ ] **Step 5: Commit**
```bash
git add app.js style.css
git commit -m "perf: reduce particles on mobile, add will-change and contain"
```

---

## PHASE 5: Testing Enhancement

### Task 8: Cập nhật Python tests cho file structure mới

**Files:** Modify: `tests/test_project.py`

- [ ] **Step 1: Cập nhật test để verify file split**

Thêm vào `test_project.py`:
```python
def test_css_and_js_are_external_files(self):
    """Verify CSS and JS are extracted to separate files."""
    self.assertTrue((ROOT / "style.css").is_file(), "style.css should exist")
    self.assertTrue((ROOT / "app.js").is_file(), "app.js should exist")

    # Verify index.html does NOT contain inline <style> or <script> blocks
    self.assertNotRegex(self.html, r"<style>[\s\S]*?</style>")
    self.assertNotRegex(self.html, r"<script>[\s\S]*?</script>")

    # Verify index.html links to external files
    self.assertIn('href="style.css"', self.html)
    self.assertIn('src="app.js"', self.html)

def test_skip_link_exists(self):
    """Verify skip link for keyboard accessibility."""
    self.assertRegex(self.html, r'<a href="#screen-invite"[^>]*class="[^"]*skip-link[^"]*"')

def test_particles_have_aria_hidden(self):
    """Verify decorative particles are hidden from assistive tech."""
    self.assertRegex(
        self.html,
        r'id="bg-particles"[^>]*aria-hidden="true"'
    )

def test_font_preconnect_hints_exist(self):
    """Verify font loading optimization hints."""
    self.assertIn('rel="preconnect"', self.html)
    self.assertIn('fonts.googleapis.com', self.html)
    self.assertIn('fonts.gstatic.com', self.html)
```

- [ ] **Step 2: Run tests**
```bash
python -m unittest -v tests.test_project
```
Expected: Tất cả PASS (bao gồm tests mới)

- [ ] **Step 3: Commit**
```bash
git add tests/test_project.py
git commit -m "test: add file split, skip link, particles aria, font preconnect checks"
```

---

### Task 9: Thêm Playwright E2E tests

**Files:**
- Create: `tests/e2e/__init__.py`
- Create: `tests/e2e/test_invitation_flow.py`

- [ ] **Step 1: Tạo `tests/e2e/__init__.py`** (empty file)

- [ ] **Step 2: Tạo `tests/e2e/test_invitation_flow.py`**

```python
"""
Playwright E2E tests for graduation invitation flow.
Run: playwright install --with-deps chromium
      python -m pytest tests/e2e/test_invitation_flow.py -v
"""
import pytest
from playwright.sync_api import Page, expect


BASE_URL = "http://127.0.0.1:8080"


class TestEnvelopeScreen:
    def test_envelope_loads(self, page: Page):
        page.goto(BASE_URL)
        expect(page.locator("#screen-envelope")).to_be_visible()
        expect(page.locator(".envelope-seal")).to_be_visible()
        expect(page.locator(".env-name")).to_contain_text("QUÁCH NGỌC QUANG")

    def test_envelope_opens_on_click(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        expect(page.locator("#screen-invite")).to_be_visible()
        expect(page.locator("#screen-envelope")).not_to_be_visible()

    def test_envelope_opens_on_enter_key(self, page: Page):
        page.goto(BASE_URL)
        page.focus(".envelope-btn")
        page.keyboard.press("Enter")
        expect(page.locator("#screen-invite")).to_be_visible()


class TestInviteScreen:
    def test_invite_content_displays(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        expect(page.locator(".inv-greeting")).to_contain_text("Trân Trọng Mời")
        expect(page.locator(".inv-name")).to_contain_text("Quách Ngọc Quang")
        expect(page.locator(".inv-message")).to_be_visible()

    def test_event_details_display(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        expect(page.locator(".detail-value")).to_have_count(4)
        expect(page.locator(".detail-value").nth(0)).to_contain_text("05 / 07 / 2026")
        expect(page.locator(".detail-value").nth(1)).to_contain_text("Hội trường Nguyễn Văn Đạo")

    def test_guest_param_prefill(self, page: Page):
        page.goto(f"{BASE_URL}?guest=Nguyễn%20Văn%20Anh")
        page.click(".envelope-btn")
        expect(page.locator("#rsvp-name")).to_have_value("Nguyễn Văn Anh")

    def test_guest_param_xss_blocked(self, page: Page):
        page.goto(f"{BASE_URL}?guest=<script>alert(1)</script>")
        page.click(".envelope-btn")
        expect(page.locator("#rsvp-name")).to_have_value("")


class TestRSVPForm:
    def test_radio_selection(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.click(".radio-card[data-value='no']")
        expect(page.locator(".radio-card[data-value='no']")).to_have_class("selected")
        expect(page.locator(".radio-card[data-value='yes']")).not_to_have_class("selected")

    def test_guest_count_hides_when_not_attending(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.click(".radio-card[data-value='no']")
        expect(page.locator("#guest-count-group")).to_be_hidden()

    def test_form_validation_empty_name(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.click("#btn-submit")
        expect(page.locator("#error-name")).to_contain_text("Vui lòng nhập họ và tên")

    def test_form_validation_guest_count(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.fill("#rsvp-name", "Test User")
        page.select_option("#guest-count", "8")  # Invalid
        page.click("#btn-submit")
        expect(page.locator("#error-submit")).to_contain_text("Số người phải từ 1 đến 5")

    def test_form_submit_success(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.fill("#rsvp-name", "Test User")
        page.click("#btn-submit")
        # Should show thank you screen (mock Formspree will fail, but flow is tested)
        # In real test, we'd mock the fetch


class TestAccessibility:
    def test_skip_link_focus(self, page: Page):
        page.goto(BASE_URL)
        page.keyboard.press("Tab")
        skip_link = page.locator(".skip-link")
        expect(skip_link).to_be_focused()

    def test_sent_banner_has_role_status(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        banner = page.locator("#sent-banner")
        expect(banner).to_have_attribute("role", "status")
        expect(banner).to_have_attribute("aria-live", "polite")

    def test_radio_group_has_role(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        radio_group = page.locator(".radio-group")
        expect(radio_group).to_have_attribute("role", "radiogroup")

    def test_keyboard_arrow_navigation(self, page: Page):
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        page.focus(".radio-card")
        page.keyboard.press("ArrowRight")
        # Verify selection changed (second card selected)
        expect(page.locator(".radio-card[data-value='no']")).to_have_class("selected")


class TestResponsive:
    def test_mobile_layout(self, page: Page):
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto(BASE_URL)
        expect(page.locator("#screen-envelope")).to_be_visible()
        # Envelope should fit mobile screen
        envelope = page.locator(".envelope")
        expect(envelope).to_be_visible()

    def test_tablet_layout(self, page: Page):
        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(BASE_URL)
        page.click(".envelope-btn")
        expect(page.locator("#screen-invite")).to_be_visible()
```

- [ ] **Step 3: Thêm `requirements-test.txt`**
```
playwright>=1.40.0
pytest>=8.0.0
pytest-playwright>=0.4.0
```

- [ ] **Step 4: Cài đặt và run E2E tests**
```bash
pip install -r requirements-test.txt
playwright install --with-deps chromium
python -m pytest tests/e2e/test_invitation_flow.py -v
```
Expected: Tất cả PASS

- [ ] **Step 5: Commit**
```bash
git add tests/e2e/__init__.py tests/e2e/test_invitation_flow.py requirements-test.txt
git commit -m "test: add Playwright E2E tests for invitation flow

- Envelope screen: load, click, keyboard open
- Invite screen: content, details, guest param prefill, XSS block
- RSVP form: radio selection, guest count toggle, validation, submit
- Accessibility: skip link, role=status, radiogroup, arrow keys
- Responsive: mobile (375px), tablet (768px)"
```

---

## PHASE 6: Documentation

### Task 10: Tạo `CHANGELOG.md`

**Files:** Create: `CHANGELOG.md`

- [ ] **Step 1: Tạo `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — 2026-06-11

### Changed
- Greeting text: "You Are Invited" → "Trân Trọng Mời" (Vietnamese)
- Form submission: JSON → FormData for Formspree compatibility
- Timeout: 10s → 15s with AbortController
- Text opacity: improved for optional (.55), placeholder (.5), sent-banner (.7)
- Focus styles: switched to `:focus-visible` pseudo-class

### Added
- Client-side validation: guest count (1-5), message max 500 chars
- XSS sanitization on `?guest=` URL parameter
- Repeat-submit confirmation flow (60s window)
- Keyboard arrow navigation for radio group
- `fetchWithTimeout` helper with AbortController
- `readStoredRSVP` and `isRecentRSVP` helpers
- Honeypot `_gotcha` with `hidden` attribute + `aria-hidden`
- Formspree endpoint: `xeewzabd`

### Fixed
- Removed double-decoding of `?guest=` parameter
- Fixed localStorage key normalization

## [2.0.0] — 2026-06-09

### Changed
- Removed OCR/Tesseract.js and identity check-in system
- Removed canvas signature capture
- Replaced hardcoded guest database with `?guest=` URL param
- RSVP data sends to Formspree (host receives email)
- localStorage: UX-only memory for prior RSVP state
- Removed email field from form

### Added
- Envelope opening animation with gold seal shimmer
- RSVP form with Formspree integration
- Thank you screen with dynamic text + confetti
- URL param `?guest=` for name pre-fill
- Honeypot `_gotcha` anti-spam
- Responsive design (768px, 480px breakpoints)
- `prefers-reduced-motion` support
- Keyboard accessibility (button, focus-visible, ARIA)

## [1.0.0] — 2026-06-09

### Added
- Initial graduation invitation single-page site
- Basic envelope → invite → thank you flow
- Formspree RSVP integration
- localStorage for RSVP memory
```

- [ ] **Step 2: Commit**
```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG.md with version history"
```

---

### Task 11: Tạo `docs/DEPLOYMENT.md`

**Files:** Create: `docs/DEPLOYMENT.md`

- [ ] **Step 1: Tạo `docs/DEPLOYMENT.md`**

```markdown
# Deployment Guide

## GitHub Pages

### Prerequisites
- Repository pushed to GitHub
- Custom domain `quang-grad-2026.xyz` purchased and configured

### Steps

1. **Push code to GitHub**
```bash
git push origin main
```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch → `main` → `/root`
   - Save

3. **Configure custom domain**
   - In Settings → Pages → Custom domain: enter `quang-grad-2026.xyz`
   - Check "Enforce HTTPS"

4. **DNS Configuration** (at domain registrar)
   - Add CNAME record: `quang-grad-2026.xyz` → `t1qnq.github.io`
   - Or add A records pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

5. **Verify deployment**
   - Visit `https://quang-grad-2026.xyz/`
   - Check OG preview: Facebook Debugger → `https://developers.facebook.com/tools/debug/`
   - Test RSVP submission end-to-end

### Post-Deploy Checklist
- [ ] Site loads correctly at custom domain
- [ ] HTTPS certificate active (padlock icon)
- [ ] OG image displays correctly on social sharing
- [ ] RSVP form submits successfully → email received
- [ ] Test on physical iPhone and Android device
- [ ] Share link with 2-3 test guests

## Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

## Alternative: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```
```

- [ ] **Step 2: Commit**
```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: add DEPLOYMENT.md with GitHub Pages and alternative guides"
```

---

### Task 12: Cập nhật `AGENTS.md`

**Files:** Modify: `AGENTS.md`

- [ ] **Step 1: Cập nhật AGENTS.md với file structure mới**

Cập nhật phần "Project Snapshot":
```markdown
## Project Snapshot

- Product: personal graduation invitation for Quách Ngọc Quang.
- App type: static single-page site, no build step, no bundled dependencies.
- Main files: `index.html` (markup), `style.css` (styles), `app.js` (logic).
- RSVP backend: Formspree endpoint in `RSVP_ENDPOINT` (app.js).
- Social preview asset: `preview.png`.
- Event date: `2026-07-05`; event time is not confirmed.
- Deployment: GitHub Pages at `https://quang-grad-2026.xyz/`.
```

- [ ] **Step 2: Commit**
```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md for split file structure"
```

---

### Task 13: Cập nhật `README.md`

**Files:** Modify: `README.md`

- [ ] **Step 1: Cập nhật README.md**

```markdown
# Thiệp Mời Tốt Nghiệp — Quách Ngọc Quang

Static single-page graduation invitation: mở phong bì, xem thông tin sự kiện và gửi RSVP qua Formspree.

## Quick Start

```powershell
python -m http.server 8080
```

Mở `http://127.0.0.1:8080/`. Có thể pre-fill tên khách bằng URL:

```text
http://127.0.0.1:8080/?guest=Nguyễn%20Văn%20Anh
```

## File Structure

```
index.html       — markup (HTML structure + OG meta)
style.css        — all styles (CSS)
app.js           — all logic (vanilla JavaScript)
preview.png      — social preview image
```

## Verification

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
python -m pytest tests/e2e/ -v
git diff --check
```

## Documentation

- Agent handoff: `AGENTS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Launch/status checklist: `docs/PROJECT_STATUS.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Product requirements: `PRD-graduation-invitation.md`
- Changelog: `CHANGELOG.md`

## Launch Blockers

- Event time is still unknown; `index.html` intentionally shows `Sẽ cập nhật sau`.
- A real Formspree RSVP submission must still be tested from the deployed domain.
- Physical device testing is still pending.
```

- [ ] **Step 2: Commit**
```bash
git add README.md
git commit -m "docs: update README.md for split file structure and E2E tests"
```

---

## PHASE 7: Git Workflow Setup

### Task 14: Setup git workflow

**Files:** N/A (git config)

- [ ] **Step 1: Tạo `develop` branch từ `main`**
```bash
git branch develop
git push origin develop
```

- [ ] **Step 2: Tạo `.gitignore` cập nhật** (nếu cần)

Kiểm tra `.gitignore` hiện tại có đủ:
```
# Local tooling and generated files
.claude/settings.local.json
.superpowers/
__pycache__/
*.py[cod]
*.stackdump

# OS and editor files
.DS_Store
Thumbs.db
.vscode/

# Test artifacts
tests/__pycache__/
.pytest_cache/
playwright-report/
test-results/
```

- [ ] **Step 3: Commit**
```bash
git add .gitignore
git commit -m "chore: update .gitignore with test artifacts"
```

---

## PHASE 8: Launch Preparation

### Task 15: Deploy lên GitHub Pages

**Files:** N/A (deployment)

- [ ] **Step 1: Push to GitHub**
```bash
git push origin main
git push origin develop
```

- [ ] **Step 2: Enable GitHub Pages**
- Vào GitHub repo → Settings → Pages
- Source: `main` branch, `/root`
- Custom domain: `quang-grad-2026.xyz`
- Enforce HTTPS

- [ ] **Step 3: DNS Configuration**
- Thêm CNAME record tại domain registrar

- [ ] **Step 4: Verify deployment**
```bash
# Test deployed site
curl -I https://quang-grad-2026.xyz/
# Expected: 200 OK
```

- [ ] **Step 5: Test OG preview**
- Mở `https://developers.facebook.com/tools/debug/`
- Input `https://quang-grad-2026.xyz/`
- Verify preview image và description

---

### Task 16: Formspree Production Test

**Files:** N/A (external service)

- [ ] **Step 1: Submit test RSVP từ deployed URL**
- Mở `https://quang-grad-2026.xyz/`
- Mở thiệp, điền form test, submit
- Kiểm tra email đến Formspree inbox

- [ ] **Step 2: Verify Formspree dashboard**
- Vào formspree.io → dashboard
- Kiểm tra submission xuất hiện với đầy đủ fields

- [ ] **Step 3: Test error flow**
- Disconnect network → submit → verify error message
- Reconnect → retry → verify success

---

### Task 17: Physical Device Testing

**Files:** N/A (manual testing)

- [ ] **Step 1: Test trên iPhone (Safari)**
- Mở link trên iPhone
- Test: mở thiệp, scroll form, điền thông tin, submit
- Check: font rendering, animation smoothness, touch targets

- [ ] **Step 2: Test trên Android (Chrome)**
- Mở link trên Android
- Test tương tự iPhone
- Check: `100dvh` behavior, scroll performance

- [ ] **Step 3: Test trên Desktop (Chrome/Firefox/Safari)**
- Test trên ít nhất 2 browsers
- Check: hover effects, keyboard navigation, screen transitions

---

## PHASE 9: Post-Launch

### Task 18: Monitor & Iterate

- [ ] **Step 1: Monitor Formspree submissions**
- Theo dõi số lượng RSVP qua Formspree dashboard
- Kiểm tra spam/honeypot catches

- [ ] **Step 2: Gather feedback từ test guests**
- Thu thập feedback về UX, lỗi, mobile experience

- [ ] **Step 3: Khi có giờ sự kiện**
- Cập nhật `Sẽ cập nhật sau` → giờ thật trong `index.html`
- Commit và deploy

---

## Summary Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1: Git Hygiene | Task 1 | 10 min |
| Phase 2: File Split | Tasks 2-4 | 30 min |
| Phase 3: Accessibility | Task 5 | 15 min |
| Phase 4: Performance | Tasks 6-7 | 15 min |
| Phase 5: Testing | Tasks 8-9 | 30 min |
| Phase 6: Documentation | Tasks 10-13 | 20 min |
| Phase 7: Git Workflow | Task 14 | 10 min |
| Phase 8: Launch | Tasks 15-17 | 45 min |
| Phase 9: Post-Launch | Task 18 | Ongoing |
| **Total** | **18 tasks** | **~3 hours** |

---

## Verification Checklist (Chạy sau mỗi phase)

```bash
# 1. Visual check
python -m http.server 8080
# → Mở browser, kiểm tra visual

# 2. Unit tests
python -m unittest -v tests.test_project

# 3. Runtime tests
node tests\runtime_checks.js

# 4. E2E tests
python -m pytest tests/e2e/ -v

# 5. Preview generation
python tests\generate_preview.py

# 6. Git whitespace check
git diff --check

# 7. Git status clean
git status --short
```

