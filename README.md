# Thiệp Mời Tốt Nghiệp Quách Ngọc Quang

Static single-page graduation invitation: mở phong bì, xem thông tin sự kiện và gửi RSVP qua Formspree.

## Quick Start

```powershell
python -m http.server 8080
```

Mở `http://127.0.0.1:8080/`. Có thể pre-fill tên khách bằng URL:

```text
http://127.0.0.1:8080/?guest=Nguyễn%20Văn%20An
```

## Verification

```powershell
python tests\generate_preview.py
python -m unittest -v tests.test_project
node tests\runtime_checks.js
git diff --check
```

`tests/generate_preview.py` cần Pillow và tạo lại `preview.png` cho social sharing.

## Current Context

- Agent handoff: `AGENTS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Launch/status checklist: `docs/PROJECT_STATUS.md`
- Product requirements: `PRD-graduation-invitation.md`
- Current optimization plan: `docs/superpowers/plans/2026-06-11-project-optimization-context.md`

Historical reports are kept under `docs/archive/` when they are no longer the source of truth.

## Launch Blockers

- Event time is still unknown; `index.html` intentionally shows `Sẽ cập nhật sau`.
- A real Formspree RSVP submission must still be tested from the deployed domain.
- Physical mobile/device testing is still pending.
