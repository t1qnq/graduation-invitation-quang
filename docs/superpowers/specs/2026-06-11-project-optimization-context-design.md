# Project Optimization And Context Handoff Design

**Date:** 2026-06-11

## Goal

Improve the invitation's reliability and maintainability without changing its visual direction, then establish a compact source of truth that future work sessions can trust.

## Scope

### Runtime improvements

- Remove inline `onclick` and `onsubmit` attributes so each interaction has one JavaScript event binding.
- Keep the existing envelope, RSVP, and thank-you flow unchanged.
- Add a lightweight repeat-submit guard: when the same normalized guest submitted within 60 seconds, the first repeat attempt shows a warning; a second explicit attempt is allowed.
- Increase low-contrast helper and placeholder text.
- Announce the previous-RSVP banner as status information.

### Documentation handoff

- Add `AGENTS.md` as the first document future coding agents should read.
- Add `docs/ARCHITECTURE.md` for the actual system structure and data flow.
- Add `docs/PROJECT_STATUS.md` for current blockers, verified behavior, and the next safe actions.
- Synchronize the README and PRD with the implemented Vietnamese greeting and FormData submission.
- Mark the old implementation plan, `context.md`, and `fix.md` as historical rather than current sources of truth.

### Cleanup

- Delete obsolete one-off patch scripts and the shell crash dump after verifying their exact paths.
- Preserve `.superpowers/` and local Claude settings; they are already ignored and are outside this cleanup scope.

## Non-goals

- Do not invent or update the ceremony time.
- Do not send a real RSVP or make any external Formspree change.
- Do not add CSP while the page still intentionally uses inline CSS and JavaScript.
- Do not split `index.html` into multiple production assets in this pass.
- Do not redesign icons, typography, or animations.

## Testing

- Extend Python structural checks for event bindings, accessibility metadata, documentation, and cleanup.
- Extend Node runtime checks for repeat-submit confirmation and event-driven behavior.
- Run preview generation, all tests, `git diff --check`, and a final repository-status audit.

## Source-of-truth order

1. `AGENTS.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/ARCHITECTURE.md`
4. `README.md`
5. `PRD-graduation-invitation.md`

Historical reports and plans must not override current code or the documents above.

