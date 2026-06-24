# Project Status

> Last updated: 2026-06-11

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

## Still Blocking Launch

- Event time is still unknown. Do not launch final invitations until the real time replaces `Sẽ cập nhật sau`.
- Real Formspree delivery has not been verified from production/deployed URL.
- Physical device testing is still pending.

## Safe Next Steps

1. Confirm ceremony time and update all visible event-time text.
2. Deploy to the final domain.
3. Submit one real RSVP and verify the email/Formspree dashboard entry.
4. Test on mobile and desktop with the final URL and social preview.

## Verification Commands

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

## Notes For Future Work

- A CSP is intentionally not added yet because the page still uses inline CSS/JS and Google Fonts. Adding a meaningful CSP would require either hashes/nonces or moving assets into separate files.
- The Formspree endpoint is public in client code, which is normal for static forms but means quota/spam monitoring must happen in Formspree.
- Do not remove the local tests when doing visual-only edits; they protect previous production issues.
