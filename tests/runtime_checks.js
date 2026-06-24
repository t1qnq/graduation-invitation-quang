const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const appSource = fs.readFileSync('app.js', 'utf8');

function classList() {
  const values = new Set();
  return {
    add(value) { values.add(value); },
    remove(value) { values.delete(value); },
    contains(value) { return values.has(value); }
  };
}

const focusTarget = {
  focused: false,
  focus(options) {
    this.focused = true;
    this.options = options;
  }
};

function screen(id) {
  return {
    id,
    classList: classList(),
    inert: false,
    scrollTop: 99,
    attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
    removeAttribute(name) { this.attributes.delete(name); },
    querySelector(selector) {
      return selector === '[data-screen-focus]' ? focusTarget : null;
    }
  };
}

const envelopeScreen = screen('screen-envelope');
const inviteScreen = screen('screen-invite');
const thanksScreen = screen('screen-thanks');
envelopeScreen.classList.add('active');

const nameInput = { value: '', addEventListener() {} };
const guestCount = { value: '1' };
const messageInput = { value: 'a'.repeat(501) };
const errorName = { textContent: '' };
const errorSubmit = { textContent: '' };
const sentBanner = { style: { display: 'none' } };
const buttonText = { textContent: 'Gửi xác nhận' };
const submitButton = {
  disabled: false,
  querySelector(selector) {
    return selector === '.btn-text' ? buttonText : null;
  }
};

const elements = {
  'screen-envelope': envelopeScreen,
  'screen-invite': inviteScreen,
  'screen-thanks': thanksScreen,
  'rsvp-name': nameInput,
  'guest-count': guestCount,
  'rsvp-message': messageInput,
  'error-name': errorName,
  'error-submit': errorSubmit,
  'sent-banner': sentBanner,
  'btn-submit': submitButton
};

const storage = new Map();
let reduceMotion = false;
let fetchCount = 0;
let lastFetchBody = null;

class FakeFormData {
  constructor() { this.values = new Map(); }
  append(name, value) { this.values.set(name, value); }
}

const envelopeNode = { style: {} };

const documentStub = {
  addEventListener() {},
  getElementById(id) { return elements[id] || null; },
  querySelectorAll(selector) {
    if (selector === '.screen') return [envelopeScreen, inviteScreen, thanksScreen];
    return [];
  },
  querySelector(selector) {
    if (selector.includes('attendance')) return { value: 'yes' };
    if (selector.includes('_gotcha')) return { value: '' };
    if (selector === '.envelope') return envelopeNode;
    return null;
  },
  body: { appendChild() {} },
  createElement() { return { classList: classList(), style: {}, setAttribute() {}, appendChild() {} }; }
};

const context = vm.createContext({
  AbortController,
  URLSearchParams,
  console: { error() {} },
  document: documentStub,
  FormData: FakeFormData,
  fetch: async (url, options) => {
    fetchCount += 1;
    lastFetchBody = options && options.body ? options.body : null;
    return { ok: false, status: 500 };
  },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, value); }
  },
  requestAnimationFrame(callback) { callback(); },
  setTimeout(callback) { callback(); return 1; },
  clearTimeout() {},
  // openEnvelope consults prefers-reduced-motion via matchMedia; toggle via reduceMotion.
  window: {
    location: { search: '?guest=Nh%C3%B3m%20100%25' },
    matchMedia: (query) => ({ matches: reduceMotion && /reduce/.test(query) })
  }
});

vm.runInContext(appSource, context, { filename: 'app.js' });

context.showScreen('screen-invite');
assert.equal(envelopeScreen.inert, true, 'Hidden screen should become inert');
assert.equal(inviteScreen.inert, false, 'Visible screen should not be inert');
assert.equal(inviteScreen.scrollTop, 0, 'Visible screen should reset its scroll position');
assert.equal(focusTarget.focused, true, 'Visible screen heading should receive focus');
assert.equal(focusTarget.options.preventScroll, true);

context.prefillNameFromURL();
assert.equal(nameInput.value, 'Nhóm 100%', 'Guest query parameter should be decoded exactly once');

context.submitRSVP({ preventDefault() {} }).then(() => {
  assert.equal(errorSubmit.textContent, 'Lời chúc không quá 500 ký tự');
  assert.equal(submitButton.disabled, false, 'Validation should return before loading state');

  nameInput.value = 'Test Guest';
  messageInput.value = '';
  storage.set('grad_rsvp_test_guest', JSON.stringify({
    sent: true,
    timestamp: new Date().toISOString(),
    attendance: 'yes'
  }));

  return context.submitRSVP({ preventDefault() {} });
}).then(() => {
  assert.equal(fetchCount, 0, 'First repeat submit within 60 seconds should only warn');
  assert.match(errorSubmit.textContent, /vừa gửi xác nhận/);
  return context.submitRSVP({ preventDefault() {} });
}).then(() => {
  assert.equal(fetchCount, 1, 'Second explicit repeat submit should continue');
  assert.ok(lastFetchBody, 'Expected fetch to receive a FormData body');
  assert.ok(lastFetchBody.values.has('_gotcha'), 'Expected _gotcha to be appended to the submitted FormData');

  // Name length is capped at 100 chars on submit (fresh path: a name that
  // hasn't been stored, so the 60s repeat guard does not trip).
  nameInput.value = 'a'.repeat(200);
  messageInput.value = '';
  return context.submitRSVP({ preventDefault() {} });
}).then(() => {
  assert.equal(fetchCount, 2, 'Long-name submit should reach fetch');
  assert.equal(lastFetchBody.values.get('name').length, 100, 'Submitted name should be capped at 100 chars');

  // Reduced-motion: openEnvelope consults window.matchMedia and must still
  // reach the invite screen without throwing (the stub setTimeout fires
  // synchronously, so the scale/opacity animation is never observable here;
  // the prefers-reduced-motion source guard is asserted by the Python tests).
  reduceMotion = true;
  inviteScreen.classList.remove('active');
  context.openEnvelope();
  assert.equal(inviteScreen.classList.contains('active'), true, 'Reduced motion should still reach the invite screen');

  console.log('Runtime checks passed');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
