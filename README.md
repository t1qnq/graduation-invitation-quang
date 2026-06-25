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
- Project status: `docs/PROJECT_STATUS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Product requirements: `PRD-graduation-invitation.md`
- Active spec: `docs/superpowers/specs/2026-06-24-project-optimization-design.md`
- Active plan: `docs/superpowers/plans/2026-06-24-project-optimization.md`
- Feature pack spec: `docs/superpowers/specs/2026-06-25-feature-pack-design.md`
- Feature pack plan: `docs/superpowers/plans/2026-06-25-feature-pack.md`
- Version history: `CHANGELOG.md`

## Launch Blockers

- A real Formspree RSVP submission must still be tested from the deployed domain.
- Physical mobile/device testing is still pending.
