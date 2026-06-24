# Architecture

## Overview

This project is a static invitation site. There is no package manager, build step, router, database, or custom backend. The production surface is `index.html`, `style.css`, `app.js`, plus the social preview image.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Markup and screen structure (no inline CSS/JS). |
| `style.css` | All styles. |
| `app.js` | Vanilla JavaScript application logic, loaded with `defer`. |
| `preview.png` | Open Graph/social preview image. |
| `README.md` | Quick start and verification commands. |
| `AGENTS.md` | Handoff context for future agents. |
| `PRD-graduation-invitation.md` | Product requirements and acceptance criteria. |
| `tests/test_project.py` | Static structural regression checks. |
| `tests/runtime_checks.js` | Node `vm` runtime checks for client behavior. |
| `tests/generate_preview.py` | Regenerates `preview.png`. |

## Runtime Screens

`index.html` has three fixed screens:

1. `#screen-envelope`: closed invitation envelope and open button.
2. `#screen-invite`: invitation details and RSVP form.
3. `#screen-thanks`: success message after Formspree accepts the RSVP.

Screen changes go through `showScreen(id)`, which updates `active`, `aria-hidden`, `inert`, scroll position, and focus target.

## RSVP Flow

1. User opens the envelope.
2. `prefillNameFromURL()` reads `?guest=` once through `URLSearchParams` and fills `#rsvp-name` when safe.
3. `checkPreviousRSVP()` reads local UX state and shows the previous-submit banner when applicable.
4. `submitRSVP(event)` validates name, guest count, message length, and honeypot.
5. Recent repeat submissions within `RSVP_REPEAT_WINDOW_MS` warn first; a second explicit click for the same name proceeds.
6. Valid submissions are sent as `FormData` to `RSVP_ENDPOINT` through `fetchWithTimeout()`.
7. On `response.ok`, the app stores minimal local metadata and moves to the thank-you screen.

## Data Model

Submitted Formspree fields:

| Field | Meaning |
| --- | --- |
| `name` | Guest name from the form or `?guest=` pre-fill. |
| `attendance` | `yes` or `no`. |
| `guestCount` | `1` to `5` when attending, `0` when not attending. |
| `message` | Optional note, max 500 characters. |
| `timestamp` | Client ISO timestamp at submit time. |

Local storage key: `grad_rsvp_<normalized_name>`.

Local storage value: `{ sent: true, timestamp, attendance }`. It is only a UX hint and must not be treated as authoritative data.

## Accessibility Notes

- Screens outside the current view are marked inert.
- Form errors use live regions.
- The previous-submit banner uses `role="status"` and `aria-live="polite"`.
- Envelope and form submit interactions are bound in JavaScript instead of inline attributes.
- Motion is reduced under `prefers-reduced-motion`.

## Non-Goals

- No guest database.
- No authentication.
- No custom server.
- No RSVP admin dashboard inside this repo.
- No event-time guesswork.
