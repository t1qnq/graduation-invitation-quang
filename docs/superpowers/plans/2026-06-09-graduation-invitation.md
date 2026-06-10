# Implementation Plan — Thiệp Mời Tốt Nghiệp V1

> **Ngày:** 2026-06-09
> **Trạng thái:** Ready for execution
> **PRD:** `PRD-graduation-invitation.md` (v2.0, approved)
> **Architecture:** Single-file HTML, vanilla JS, Formspree backend

---

## Tổng quan viết lại

Viết lại `index.html` từ V2 (OCR/check-in flow ~970 lines) sang V1 (envelope → RSVP → thanks ~600 lines).

**Thay đổi chính:**
- Bỏ: Tesseract.js, signature canvas, handwriting canvas, guest DB (25 người), OCR, name matching
- Thêm: Màn envelope mở, Formspree POST, `?guest=` URL param, dynamic thank you text, honeypot `_gotcha`
- Giữ: Background particles, confetti, checkmark animation, radio card selection, responsive breakpoints

---

## Task 1: HTML Structure

**File:** `C:/Users/Admin/Documents/Vin/New folder/index.html`

### 1.1 `<head>` (giữ nguyên từ V2, bỏ Tesseract script)
- Meta charset, viewport, title, description
- OG meta tags (og:title, og:description, og:type)
- Favicon SVG inline
- Google Fonts: Playfair Display + Cormorant Garamond
- **Xóa:** `<script src="tesseract.js">`
- **Thêm:** `<link rel="canonical" href="...">` với canonical date 2026-07-05

### 1.2 Màn 1 — Envelope (thiệp đóng)
```html
<div id="screen-envelope" class="screen active">
  <button class="envelope-btn" onclick="openEnvelope()" aria-label="Mở thiệp mời">
    <div class="envelope">
      <div class="envelope-seal">🎓</div>
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
```
- **Button** (không phải div) để keyboard accessible
- Seal vàng với radial-gradient + shimmer animation
- CTA text có pulse animation

### 1.3 Màn 2 — Thiệp mở + Form RSVP
```html
<div id="screen-invite" class="screen">
  <div class="invite-wrapper">
    <!-- Header -->
    <span class="inv-emoji" aria-hidden="true">🎓</span>
    <div class="inv-greeting">You Are Invited</div>
    <h2 class="inv-name">Quách Ngọc Quang</h2>
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
        <span class="detail-icon">🎓</span>
        <span class="detail-label">Sự kiện</span>
        <span class="detail-value">Lễ Tốt Nghiệp</span>
      </div>
    </div>

    <!-- Form -->
    <form id="rsvp-form" onsubmit="submitRSVP(event)" novalidate>
      <!-- Honeypot -->
      <input type="text" name="_gotcha"
             style="position:absolute;opacity:0;width:0;height:0;pointer-events:none"
             tabindex="-1" autocomplete="off">

      <!-- Name -->
      <div class="form-group">
        <label for="rsvp-name">Họ và tên</label>
        <input type="text" id="rsvp-name" name="name" required
               placeholder="Nhập họ và tên..." autocomplete="name">
        <span class="form-error" id="error-name" role="alert"></span>
      </div>

      <!-- Attendance -->
      <div class="form-group">
        <label>Tham dự</label>
        <div class="radio-group" role="radiogroup" aria-label="Xác nhận tham dự">
          <label class="radio-card selected" data-value="yes" onclick="selectRadio(this)">
            <input type="radio" name="attendance" value="yes" checked>
            <span>Có</span>
          </label>
          <label class="radio-card" data-value="no" onclick="selectRadio(this)">
            <input type="radio" name="attendance" value="no">
            <span>Không</span>
          </label>
        </div>
      </div>

      <!-- Guest count (conditional) -->
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
        <textarea id="rsvp-message" name="message" rows="2"
                  placeholder="Chúc Quang..."></textarea>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-submit" id="btn-submit">
        <span class="btn-text">Gửi xác nhận</span>
      </button>
      <span class="form-error" id="error-submit" role="alert" aria-live="polite"></span>
    </form>

    <!-- Already sent banner -->
    <div class="sent-banner" id="sent-banner" style="display:none">
      Bạn đã gửi xác nhận trước đó. Bạn vẫn có thể sửa và gửi lại.
    </div>
  </div>
</div>
```

### 1.4 Màn 3 — Cảm ơn
```html
<div id="screen-thanks" class="screen">
  <div class="thanks-content">
    <div class="checkmark-circle">
      <svg class="checkmark" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
    </div>
    <h2 class="thanks-title">Cảm ơn bạn nhé!</h2>
    <p class="thanks-text" id="thanks-text">Hẹn gặp tại buổi lễ 🎓</p>
    <a href="/" class="thanks-back">Xem lại thiệp</a>
  </div>
</div>
```
- `#thanks-text` dynamic: `attendance=yes` → "Hẹn gặp bạn tại buổi lễ 🎓", `attendance=no` → "Cảm ơn bạn đã phản hồi nhé. Hẹn gặp bạn dịp khác!"

### 1.5 Confetti container (fixed, outside screens)
```html
<div class="bg-particles" id="bg-particles" aria-hidden="true"></div>
```

- [ ] **Verify:** Open `index.html`, confirm 3 screens exist, only Screen 1 visible

---

## Task 2: CSS

**File:** `C:/Users/Admin/Documents/Vin/New folder/index.html` (fill `<style>` block)

### 2.1 Reset & Base
```css
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;background:#0a0a14;color:#fff}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
```

### 2.2 Screens
```css
.screen{
  position:fixed;top:0;left:0;width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  opacity:0;visibility:hidden;
  transition:opacity .6s ease,visibility .6s ease;z-index:1
}
.screen.active{opacity:1;visibility:visible;z-index:10}
```

### 2.3 Background Particles
```css
.bg-particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.bg-particle{position:absolute;background:rgba(226,176,74,.3);border-radius:50%;animation:floatUp 8s linear infinite}
@keyframes floatUp{
  0%{transform:translateY(100vh) scale(0);opacity:0}
  10%{opacity:1}90%{opacity:1}
  100%{transform:translateY(-10vh) scale(1);opacity:0}
}
```

### 2.4 Envelope (Màn 1)
```css
.envelope-btn{
  background:none;border:none;cursor:pointer;padding:0;font-family:inherit;
  display:flex;flex-direction:column;align-items:center
}
.envelope{
  width:340px;max-width:85vw;
  background:linear-gradient(145deg,#1e2d4d,#16213e);
  border:1px solid rgba(226,176,74,.35);border-radius:8px;
  padding:40px 30px;text-align:center;position:relative;
  box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 40px rgba(226,176,74,.05);
  transition:transform .3s,box-shadow .3s
}
.envelope-btn:hover .envelope{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.6)}
.envelope-seal{
  width:56px;height:56px;
  background:radial-gradient(circle at 35% 35%,#f0d078,#e2b04a 40%,#c49b30);
  border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:24px;margin:0 auto 20px;
  box-shadow:0 4px 16px rgba(226,176,74,.3);
  position:relative;overflow:hidden
}
.envelope-seal::after{
  content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
  background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%);
  animation:shimmer 3s ease-in-out infinite
}
@keyframes shimmer{0%,100%{transform:translateX(-100%) rotate(45deg)}50%{transform:translateX(100%) rotate(45deg)}}
.envelope-text{display:flex;flex-direction:column;gap:6px}
.env-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;letter-spacing:3px;color:#fff}
.env-event{font-size:11px;letter-spacing:6px;color:#e2b04a;text-transform:uppercase}
.env-date,.env-venue{font-size:12px;letter-spacing:2px;color:rgba(255,255,255,.5)}
.env-cta{margin-top:24px;font-size:11px;letter-spacing:3px;color:rgba(226,176,74,.6);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
```

### 2.5 Invite / Form (Màn 2)
```css
#screen-invite{flex-direction:column;overflow-y:auto;padding:20px}
.invite-wrapper{width:560px;max-width:92vw;text-align:center;position:relative;z-index:2}
.inv-emoji{font-size:40px;margin-bottom:10px;display:block}
.inv-greeting{font-family:'Cormorant Garamond',serif;font-size:13px;letter-spacing:4px;color:#e2b04a;text-transform:uppercase}
.inv-name{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;letter-spacing:2px;color:#fff;margin-top:4px}
.inv-divider{width:60px;height:1px;margin:16px auto;background:linear-gradient(90deg,transparent,rgba(226,176,74,.5),transparent)}
.inv-message{font-size:16px;color:rgba(255,255,255,.6);line-height:1.7;font-style:italic;max-width:420px;margin:0 auto 20px}
.inv-details{display:flex;flex-wrap:wrap;justify-content:center;gap:20px}
.inv-detail{display:flex;flex-direction:column;align-items:center;gap:4px}
.detail-icon{font-size:20px}
.detail-label{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.35);text-transform:uppercase}
.detail-value{font-family:'Playfair Display',serif;font-size:14px;color:#e2b04a;letter-spacing:1px}
```

**Form:**
```css
.form-group{margin-bottom:16px}
.form-group label{display:block;font-family:'Cormorant Garamond',serif;font-size:12px;letter-spacing:2px;color:rgba(255,255,255,.55);margin-bottom:6px;text-transform:uppercase}
.form-group .optional{font-size:10px;color:rgba(255,255,255,.3);text-transform:none;letter-spacing:0}
.form-group input[type="text"],.form-group textarea,.form-group select{
  width:100%;padding:11px 14px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#fff;
  font-family:'Cormorant Garamond',serif;font-size:16px;outline:none;
  transition:border-color .3s,box-shadow .3s
}
.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:rgba(226,176,74,.5);box-shadow:0 0 0 3px rgba(226,176,74,.1)}
.form-group input::placeholder,.form-group textarea::placeholder{color:rgba(255,255,255,.25)}
.form-group textarea{resize:vertical;min-height:60px}
.form-group select{appearance:none;background-image:url("data:image/svg+xml,...");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;cursor:pointer}
.form-group select option{background:#16213e;color:#fff}
.form-error{color:#f87171;font-size:12px;margin-top:6px;display:block;min-height:18px;font-style:italic}
.sent-banner{margin-top:16px;padding:12px;background:rgba(226,176,74,.1);border:1px solid rgba(226,176,74,.3);border-radius:8px;font-size:13px;color:rgba(255,255,255,.6)}
```

**Radio cards:**
```css
.radio-group{display:flex;gap:10px}
.radio-card{
  flex:1;display:flex;align-items:center;justify-content:center;padding:11px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:6px;cursor:pointer;transition:all .3s
}
.radio-card:hover{border-color:rgba(226,176,74,.3);background:rgba(226,176,74,.05)}
.radio-card input[type="radio"]{position:absolute;opacity:0;width:0;height:0}
.radio-card span{font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:2px;color:rgba(255,255,255,.55);transition:color .3s}
.radio-card.selected{border-color:rgba(226,176,74,.5);background:rgba(226,176,74,.1)}
.radio-card.selected span{color:#e2b04a}
```

**Submit button:**
```css
.btn-submit{
  width:100%;padding:15px;margin-top:6px;
  background:linear-gradient(135deg,#e2b04a,#c49b30);border:none;border-radius:8px;
  cursor:pointer;position:relative;overflow:hidden;
  transition:transform .2s,box-shadow .2s
}
.btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(226,176,74,.3)}
.btn-submit:disabled{opacity:.5;cursor:not-allowed}
.btn-text{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;letter-spacing:4px;color:#1a1a2e;text-transform:uppercase}
.btn-submit::after{
  content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
  background:linear-gradient(transparent,rgba(255,255,255,.2),transparent);
  transform:rotate(45deg) translateX(-100%);transition:transform .6s ease
}
.btn-submit:hover:not(:disabled)::after{transform:rotate(45deg) translateX(100%)}
```

### 2.6 Thank You (Màn 3)
```css
#screen-thanks{flex-direction:column;background:radial-gradient(ellipse at center,#16213e 0%,#0a0a14 100%)}
.thanks-content{text-align:center;opacity:0;transform:scale(.9);transition:all .6s cubic-bezier(.16,1,.3,1) .2s;position:relative;z-index:2}
.thanks-content.visible{opacity:1;transform:scale(1)}
.checkmark-circle{width:80px;height:80px;margin:0 auto 24px;position:relative}
.checkmark{width:80px;height:80px;transform:rotate(-90deg)}
.checkmark-circle-bg{stroke:rgba(226,176,74,.2);stroke-width:2}
.checkmark-check{stroke:#e2b04a;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48}
.checkmark-circle.animate .checkmark-check{animation:drawCheck .6s ease forwards .3s}
@keyframes drawCheck{to{stroke-dashoffset:0}}
.thanks-title{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;letter-spacing:3px;color:#fff;margin-bottom:10px}
.thanks-text{font-family:'Cormorant Garamond',serif;font-size:17px;color:rgba(255,255,255,.55);letter-spacing:1px;margin-bottom:8px}
.thanks-sub{font-family:'Cormorant Garamond',serif;font-size:13px;color:rgba(255,255,255,.3);font-style:italic}
.thanks-back{
  display:inline-block;margin-top:24px;padding:10px 28px;
  background:transparent;border:1px solid rgba(226,176,74,.4);border-radius:4px;
  color:#e2b04a;font-family:'Cormorant Garamond',serif;font-size:14px;
  letter-spacing:3px;text-decoration:none;transition:all .3s
}
.thanks-back:hover{background:rgba(226,176,74,.1);border-color:#e2b04a}
```

### 2.7 Confetti
```css
.confetti-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;overflow:hidden}
.confetti-piece{position:absolute;top:-10px;opacity:0}
.confetti-piece.animate{animation:confettiFall 1.5s cubic-bezier(.16,1,.3,1) forwards}
@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1)}100%{opacity:0;transform:translateY(100vh) rotate(720deg) scale(.5)}}
```

### 2.8 Responsive
```css
@media(max-width:768px){
  .envelope{width:85vw}
  .env-name{font-size:16px;letter-spacing:2px}
  .env-event{font-size:10px;letter-spacing:4px}
  .env-date,.env-venue{font-size:11px}
  .inv-name{font-size:20px}
  .inv-message{font-size:14px}
  .inv-details{gap:14px}
  .confirm-card,.rsvp-form{padding:22px 18px}
  .thanks-title{font-size:24px}
}
@media(max-width:480px){
  .env-name{font-size:14px;letter-spacing:1px}
  .seal{width:44px;height:44px}
  .seal-icon{font-size:20px}
  .env-cta{font-size:9px}
  .radio-group{flex-direction:column;gap:8px}
  .form-group input,.form-group textarea,.form-group select{font-size:14px;padding:10px 12px}
  .btn-submit{padding:14px}
  .btn-text{font-size:13px;letter-spacing:3px}
  .detail-value{font-size:12px}
}
```

- [ ] **Verify:** Open `index.html`, confirm envelope displays centered with gold seal shimmer, background particles float upward

---

## Task 3: JavaScript

**File:** `C:/Users/Admin/Documents/Vin/New folder/index.html` (fill `<script>` block)

### 3.1 Config
```javascript
const RSVP_ENDPOINT = 'https://formspree.io/f/FORM_ID'; // ← user điền FORM_ID
const EVENT_DATE = '05/07/2026';
const EVENT_VENUE = 'Hội trường Nguyễn Văn Đạo';
const EVENT_NAME = 'Quách Ngọc Quang';
```

### 3.2 State
```javascript
let isAnimating = false;
let isSubmitting = false;
```

### 3.3 Background Particles
```javascript
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
```

### 3.4 Screen Transitions
```javascript
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.setAttribute('aria-hidden', 'true');
  });
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  target.removeAttribute('aria-hidden');

  // Trigger entrance animations
  if (id === 'screen-invite') {
    setTimeout(() => {
      document.querySelector('.invite-wrapper')?.style.setProperty('opacity','1');
      document.querySelector('.invite-wrapper')?.style.setProperty('transform','translateY(0)');
    }, 100);
  }
  if (id === 'screen-thanks') {
    setTimeout(() => {
      document.querySelector('.thanks-content')?.classList.add('visible');
      document.querySelector('.checkmark-circle')?.classList.add('animate');
    }, 100);
  }
}
```

### 3.5 Open Envelope
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
    // Reset envelope for next time
    envelope.style.transition = 'none';
    envelope.style.transform = '';
    envelope.style.opacity = '';
    isAnimating = false;
  }, 600);
}
```

### 3.6 URL param `?guest=`
```javascript
function prefillNameFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get('guest');
    if (guest) {
      const name = decodeURIComponent(guest);
      const input = document.getElementById('rsvp-name');
      if (input && name.length > 0 && name.length < 100) {
        input.value = name;
      }
    }
  } catch (e) {
    // Invalid encoding — bỏ qua
  }
}
```

### 3.7 Radio Card Selection
```javascript
function selectRadio(card) {
  document.querySelectorAll('#rsvp-form .radio-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  const radio = card.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Toggle guest count visibility
  const gcg = document.getElementById('guest-count-group');
  if (gcg) gcg.style.display = card.dataset.value === 'yes' ? '' : 'none';
}
```

### 3.8 localStorage — UX only
```javascript
function getStorageKey(name) {
  return 'grad_rsvp_' + name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '_');
}

function checkPreviousRSVP() {
  const nameInput = document.getElementById('rsvp-name');
  if (!nameInput) return;

  const check = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const key = getStorageKey(name);
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (data && data.sent) {
      document.getElementById('sent-banner').style.display = 'block';
      if (data.attendance === 'no') {
        const noRadio = document.querySelector('.radio-card[data-value="no"]');
        if (noRadio) selectRadio(noRadio);
      }
    }
  };

  nameInput.addEventListener('input', check);
  if (nameInput.value) check(); // Pre-filled from URL
}
```

### 3.9 Form Submission — Formspree
```javascript
async function submitRSVP(e) {
  e.preventDefault();
  if (isSubmitting) return;

  const name = document.getElementById('rsvp-name').value.trim();
  if (!name) {
    document.getElementById('error-name').textContent = 'Vui lòng nhập họ và tên';
    return;
  }
  document.getElementById('error-name').textContent = '';

  const attendance = document.querySelector('#rsvp-form input[name="attendance"]:checked')?.value || 'yes';
  const guestCount = attendance === 'yes' ? parseInt(document.getElementById('guest-count').value) || 1 : 0;
  const message = document.getElementById('rsvp-message').value.trim();

  // Honeypot — silent reject for bots
  const gotcha = document.querySelector('input[name="_gotcha"]')?.value;
  if (gotcha) return;

  // Loading state
  isSubmitting = true;
  const btn = document.getElementById('btn-submit');
  const btnText = btn.querySelector('.btn-text');
  const originalText = btnText.textContent;
  btn.disabled = true;
  btnText.textContent = 'Đang gửi...';

  try {
    const response = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        attendance,
        guestCount,
        message,
        timestamp: new Date().toISOString(),
        _gotcha: ''
      })
    });

    if (response.ok) {
      // Save to localStorage (UX only)
      const key = getStorageKey(name);
      localStorage.setItem(key, JSON.stringify({
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
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    document.getElementById('error-submit').textContent = 'Chưa gửi được xác nhận, bạn thử lại giúp mình nhé.';
    btn.disabled = false;
    btnText.textContent = originalText;
  } finally {
    isSubmitting = false;
  }
}
```

### 3.10 Confetti
```javascript
function createConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  const colors = ['#e2b04a','#c49b30','#f0d078','#ffffff','#667eea','#764ba2'];
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
  setTimeout(() => container.remove(), 3000);
}
```

### 3.11 Init
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initParticles();

  // Staggered text reveal on envelope
  const envelope = document.querySelector('.envelope');
  if (envelope) {
    const children = envelope.querySelectorAll('.envelope-seal, .envelope-text > *');
    children.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = `all .4s ease ${0.1 + i * 0.1}s`;
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
    });
  }

  document.querySelectorAll('#rsvp-form .radio-card').forEach(card => {
    card.addEventListener('click', () => selectRadio(card));
  });
});
```

- [ ] **Verify full flow:**
  1. Open → envelope shows with staggered text animation
  2. Click envelope → smooth shrink → RSVP screen
  3. `?guest=` pre-fills name
  4. Radio Có/Không → guest count ẩn/hiện
  5. Submit → confetti → thank you screen
  6. Dynamic text: "Hẹn gặp tại buổi lễ 🎓" (Có) / "Cảm ơn bạn đã phản hồi..." (Không)
  7. "Xem lại thiệp" → back to envelope

---

## Task 4: Formspree Setup

**Hướng dẫn cho user:**

1. Vào [formspree.io](https://formspree.io/) → tạo account (free tier: 50 submissions/tháng)
2. Tạo new form → nhận endpoint URL (vd: `https://formspree.io/f/xvndrqgz`)
3. Copy endpoint ID → paste vào `RSVP_ENDPOINT` trong code
4. Form fields trên Formspree dashboard: `name`, `attendance`, `guestCount`, `message`, `timestamp`
5. Mỗi RSVP → Formspree gửi email đến inbox của chủ thiệp

**Quota monitoring:**
- Host theo dõi usage qua Formspree dashboard
- Formspree gửi notification khi đạt ngưỡng
- Code client chỉ xử lý error response khi Formspree trả lỗi

- [ ] **Verify:** Submit form → nhận email thành công tại inbox

---

## Task 5: Testing Checklist

- [ ] Mở trang → thấy envelope → click → màn 2 hiện ra
- [ ] `?guest=` param pre-fill tên (URL-encoded UTF-8)
- [ ] Chọn Có/Không → guest count ẩn/hiện đúng
- [ ] Submit thành công → confetti → màn 3
- [ ] Submit fail (disconnect network) → lỗi hiện, button "Thử lại"
- [ ] localStorage: gửi xong → reload → thấy banner "đã gửi trước đó"
- [ ] Dynamic thank you text đúng theo attendance
- [ ] Responsive: iPhone (375px), Android (414px), desktop (1440px)
- [ ] Keyboard: Tab đến envelope → Enter mở được
- [ ] `prefers-reduced-motion`: animation tắt
- [ ] Honeypot: bot điền `_gotcha` → Formspree reject
- [ ] No console errors
- [ ] Page load < 2s on 3G

---

## Task 6: Deploy

1. Push `index.html` lên GitHub repo
2. Enable GitHub Pages (Settings → Pages → Source: main branch)
3. Test link public trên thiệt bị thật
4. Gửi link thử cho 2-3 người, xem họ nhận được RSVP email không

---

## Files sẽ thay đổi

| File | Thay đổi |
|------|----------|
| `index.html` | **Viết lại hoàn toàn** — từ ~970 lines V2 → ~600 lines V1 |
| `PRD-graduation-invitation.md` | Không đổi (đã approved) |
| `.claude/launch.json` | Có thể dùng lại (port 8080) |

---

## Thứ tự thực hiện

| Task | Ưu tiên | Phụ thuộc | Thời gian |
|------|---------|-----------|-----------|
| 1. HTML Structure | P0 | — | 10 min |
| 2. CSS | P0 | Task 1 | 20 min |
| 3. JavaScript | P0 | Task 1, 2 | 20 min |
| 4. Formspree Setup | P1 | Task 3 | 15 min |
| 5. Testing | P1 | Task 1-4 | 20 min |
| 6. Deploy | P2 | Task 5 | 10 min |

**Tổng ước tính:** ~95 phút code + 15 phút Formspree + 20 phút testing = ~2.5 giờ.
