# Project Optimization And Context Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicated interaction paths, add a lightweight repeat-submit guard, improve accessibility contrast, and leave reliable project context for future sessions.

**Architecture:** Keep `index.html` as the production application and use its existing functions and localStorage format. Add no runtime dependency; tests remain Python structural checks plus a Node `vm` runtime harness. Documentation is organized around `AGENTS.md`, architecture, and current status, while older reports are explicitly historical.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Formspree, Python `unittest`, Node.js `vm`, Markdown.

---

### Task 1: Lock The Desired Behavior With Tests

**Files:**
- Modify: `tests/test_project.py`
- Modify: `tests/runtime_checks.js`

- [ ] Add structural checks that reject inline `onclick`/`onsubmit`, require one event listener for envelope/form/radio controls, require improved contrast, and require `role="status"` on the sent banner.
- [ ] Add documentation checks for `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/PROJECT_STATUS.md`.
- [ ] Add a runtime check where recent RSVP metadata causes the first repeat submit to stop with a warning and the second submit to reach the fetch mock.
- [ ] Run `python -m unittest -v tests.test_project` and `node tests\runtime_checks.js`; verify the new checks fail for the intended missing behavior.

### Task 2: Optimize The Single-page Runtime

**Files:**
- Modify: `index.html`
- Test: `tests/test_project.py`
- Test: `tests/runtime_checks.js`

- [ ] Remove inline event attributes from the envelope button, RSVP form, and radio labels.
- [ ] Bind `openEnvelope`, `submitRSVP`, and radio selection once inside `DOMContentLoaded`.
- [ ] Add `RSVP_REPEAT_WINDOW_MS`, a per-name repeat-confirmation state, and a helper that safely reads recent RSVP metadata.
- [ ] On a recent duplicate, show `Bạn vừa gửi xác nhận. Bấm Gửi xác nhận lần nữa nếu muốn gửi lại.` and return; permit the next explicit submit for the same storage key.
- [ ] Set placeholder opacity to `.5`, optional text to `.55`, and sent-banner text to `.7`.
- [ ] Add `role="status" aria-live="polite"` to the sent banner.
- [ ] Run both test suites and verify they pass.

### Task 3: Establish Current Project Context

**Files:**
- Create: `AGENTS.md`
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/PROJECT_STATUS.md`
- Modify: `README.md`
- Modify: `PRD-graduation-invitation.md`
- Modify: `docs/superpowers/plans/2026-06-09-graduation-invitation.md`
- Move: `context.md` to `docs/archive/context-2026-06-11.md`
- Move: `fix.md` to `docs/archive/fix-audit-2026-06-11.md`

- [ ] Document stack, file ownership, flow, storage schema, Formspree boundary, test commands, and deployment assumptions.
- [ ] Record the ceremony time, real RSVP test, physical-device test, domain restriction, commit, and deployment as unresolved work.
- [ ] Update PRD implementation notes from JSON to FormData and from `You Are Invited` to `Trân Trọng Mời`.
- [ ] Mark the 2026-06-09 implementation plan and archived reports as historical.
- [ ] Update README links to the new source-of-truth documents.

### Task 4: Remove Obsolete Workspace Debris

**Files:**
- Delete: `apply_fixes.py`
- Delete: `apply_fixes2.py`
- Delete: `apply_fixes3.py`
- Delete: `fix_all.py`
- Delete: `fix_remaining.py`
- Delete: `bash.exe.stackdump`

- [ ] Resolve and verify every absolute path remains inside the workspace root.
- [ ] Delete only the approved files listed above.
- [ ] Confirm no application or test references those files.

### Task 5: Final Verification

**Files:**
- Verify all modified and created files.

- [ ] Run `python tests\generate_preview.py`.
- [ ] Run `python -m unittest -v tests.test_project` and confirm zero failures.
- [ ] Run `node tests\runtime_checks.js` and confirm `Runtime checks passed`.
- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Inspect `git status --short --branch` and ensure obsolete patch scripts/crash dump are gone while unrelated user files remain untouched.

