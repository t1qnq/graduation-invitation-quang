# Project Status

> Last updated: 2026-06-25

## Current State

The site is a functional static invitation with envelope opening, responsive invite content, RSVP form, Formspree submission, local previous-submit hint, social preview asset, and regression tests.

## Implemented

- Single-page invitation flow: envelope -> invite/RSVP -> thank-you screen.
- `?guest=` pre-fill without double decoding.
- Formspree `FormData` submission through `RSVP_ENDPOINT`.
- Submit timeout handling via `AbortController`.
- Client honeypot check before submission.
- Message max length validation.
- `localStorage` UX memory for prior RSVP state.
- 60-second repeat-submit warning; second explicit click can resend.
- Screen focus/inert handling for accessibility.
- Social preview image `preview.png`.
- Regression tests in Python and Node.
- Countdown timer to the ceremony (`EVENT_DATETIME` single source of truth).
- Moment-based Web Audio chimes + sparkle effects on envelope open and RSVP
  success; mute toggle (🔊/🔇) persisted in `localStorage`; sparkle suppressed
  under `prefers-reduced-motion`.
- "Chỉ đường" Google Maps directions button.
- Share block: QR code of the live URL (vendored `assets/qrcode.min.js`, no
  CDN) + copy-link button with clipboard fallback.

## Still Blocking Launch

- Real Formspree delivery has not been verified from production/deployed URL.
- Physical device testing is still pending.
- Final domain is not confirmed. `og:image` and the canonical URL currently
  point at `https://quang-grad-2026.xyz/`; these must be updated to the real
  domain before launch (see `docs/DEPLOYMENT.md`).

## Safe Next Steps

1. Deploy to the final domain.
2. Submit one real RSVP and verify the email/Formspree dashboard entry.
3. Test on mobile and desktop with the final URL and social preview.

## Verification Commands

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

## Notes For Future Work

- CSS and JS are now external files (`style.css` / `app.js`), so a meaningful Content-Security-Policy is feasible without inline hashes/nonces. A CSP is the recommended next security step (see `docs/DEPLOYMENT.md`); it is intentionally out of scope for this pass.
- The Formspree endpoint is public in client code, which is normal for static forms but means quota/spam monitoring must happen in Formspree.
- Do not remove the local tests when doing visual-only edits; they protect previous production issues.
