    // ================================================================
    // CONFIG
    // ================================================================
    const RSVP_ENDPOINT = 'https://formspree.io/f/xeewzabd';
    const FETCH_TIMEOUT = 15000;
    const RSVP_REPEAT_WINDOW_MS = 60000;
    const EVENT_DATETIME = '2026-07-05T10:00:00+07:00';

    // ================================================================
    // STATE
    // ================================================================
    let isAnimating = false;
    let isSubmitting = false;
    let rsvpCheckInitialized = false;
    let repeatSubmitConfirmedKey = null;
    let activeConfetti = null;
    let soundMuted = false;
    let audioCtx = null;

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
      const count = (typeof window !== 'undefined' && window.innerWidth && window.innerWidth <= 600) ? 10 : 20;
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
      playChime('open');
      sparkleBurst();

      const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const envelope = document.querySelector('.envelope');
      if (!reduceMotion) {
        envelope.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), opacity .6s ease';
        envelope.style.transform = 'scale(0.3)';
        envelope.style.opacity = '0';
      }

      setTimeout(() => {
        showScreen('screen-invite');
        prefillNameFromURL();
        checkPreviousRSVP();
        envelope.style.transition = 'none';
        envelope.style.transform = '';
        envelope.style.opacity = '';
        isAnimating = false;
      }, reduceMotion ? 0 : 600);
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

      // Validate name (cap length defensively, mirroring the prefill guard)
      const name = document.getElementById('rsvp-name').value.trim().slice(0, 100);
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
        // Gửi _gotcha để Formspree cũng lọc spam phía server (đã check rỗng ở trên).
        formData.append('_gotcha', gotcha ?? '');

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
          playChime('success');
          sparkleBurst();
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
    // SOUND + SPARKLE (moment effects)
    // ================================================================
    function updateSoundToggle(toggle) {
      toggle.textContent = soundMuted ? '🔇' : '🔊';
      toggle.setAttribute('aria-label', soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh');
      toggle.setAttribute('aria-pressed', soundMuted ? 'true' : 'false');
    }

    function initSound() {
      try { soundMuted = localStorage.getItem('grad_sound_muted') === '1'; } catch (e) {}
      const toggle = document.getElementById('sound-toggle');
      if (!toggle) return;
      updateSoundToggle(toggle);
      toggle.addEventListener('click', () => {
        soundMuted = !soundMuted;
        try { localStorage.setItem('grad_sound_muted', soundMuted ? '1' : '0'); } catch (e) {}
        updateSoundToggle(toggle);
      });
    }

    async function playChime(type) {
      if (soundMuted) return;
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return;
      try {
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const now = audioCtx.currentTime;
        const notes = type === 'success' ? [523.25, 659.25, 783.99] : [659.25, 880.0];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const start = now + i * 0.12;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(start);
          osc.stop(start + 0.55);
        });
      } catch (e) { /* audio unavailable — silent */ }
    }

    function sparkleBurst() {
      const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      const layer = document.getElementById('sparkle-layer');
      if (!layer) return;
      if (layer.childElementCount > 40) return;
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.textContent = '✨';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 60 + '%';
        s.style.animationDelay = (Math.random() * 0.3) + 's';
        layer.appendChild(s);
        setTimeout(() => s.remove(), 1400);
      }
    }

    // ================================================================
    // COUNTDOWN
    // ================================================================
    function computeCountdown(targetIso, nowMs) {
      const target = Date.parse(targetIso);
      if (!Number.isFinite(target)) return { valid: false };
      const diff = target - nowMs;
      if (diff <= 0) return { valid: true, past: true };
      const totalSec = Math.floor(diff / 1000);
      return {
        valid: true,
        past: false,
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        mins: Math.floor((totalSec % 3600) / 60),
        secs: totalSec % 60
      };
    }

    function initCountdown() {
      const box = document.getElementById('countdown');
      const msg = document.getElementById('countdown-msg');
      if (!box || !msg) return;
      const pad = (n) => String(n).padStart(2, '0');
      const render = () => {
        const r = computeCountdown(EVENT_DATETIME, Date.now());
        if (!r.valid) {
          box.style.display = 'none';
          msg.textContent = 'Sẽ cập nhật sau';
          return true;
        }
        if (r.past) {
          box.style.display = 'none';
          msg.textContent = 'Buổi lễ đã diễn ra — cảm ơn bạn!';
          return true;
        }
        document.getElementById('cd-days').textContent = pad(r.days);
        document.getElementById('cd-hours').textContent = pad(r.hours);
        document.getElementById('cd-mins').textContent = pad(r.mins);
        document.getElementById('cd-secs').textContent = pad(r.secs);
        return false;
      };
      if (render()) return;
      const timer = setInterval(() => { if (render()) clearInterval(timer); }, 1000);
    }

    // ================================================================
    // INIT
    // ================================================================
    document.addEventListener('DOMContentLoaded', () => {
      initParticles();
      initCountdown();
      initSound();

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
