# Deployment

> Pre-deploy checklist. This is an internal handoff doc. The launch blockers
> below are tracked in `docs/PROJECT_STATUS.md`.

## Pre-Deploy Checklist

1. **Confirm the final domain.** The `og:image` (`index.html` line ~12) and the
   canonical URL (`index.html` line ~13) currently point at
   `https://quang-grad-2026.xyz/`. Update BOTH to the real confirmed domain
   before launch.
2. **Set the ceremony time.** Replace `Sẽ cập nhật sau` (the 🕐 detail in
   `index.html`) with the confirmed event time once it is known.
3. **Run one real Formspree test from the live URL.** Submit one RSVP from the
   deployed site and verify it arrives in the Formspree dashboard / host email.
   Endpoint: `https://formspree.io/f/xeewzabd`.
4. **Test mobile + desktop on the live URL.** Check layout on both, and verify
   the social preview card (the `og:image`) by sharing the live link.
5. **GitHub Pages settings.** Deploy from the repo. `.nojekyll` is present at the
   repo root, so assets (including `app.js` and `style.css`) serve verbatim with
   no Jekyll processing.
6. **CNAME deferred.** Create the `CNAME` file only once the real domain is
   confirmed — not now.

## What Is Intentionally NOT Done Yet

- The final domain, ceremony time, real Formspree delivery check, and physical
  device testing are deliberately left open. These are the launch blockers
  tracked in `docs/PROJECT_STATUS.md`.
- A Content-Security-Policy is a recommended NEXT security step now that CSS and
  JS are external files, but it is out of scope for this pass.
