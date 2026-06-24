# PRD — Thiệp Mời Tốt Nghiệp Quách Ngọc Quang

> **Phiên bản:** 2.1
> Version history is tracked in CHANGELOG.md (current: v2.1; v2.2 in progress).
> **Ngày tạo:** 2026-06-09
> **Cập nhật:** 2026-06-11
> **Trạng thái:** Implemented locally — launch pending event time confirmation, deployed Formspree test, and physical device QA

---

## 1. Tổng quan

### 1.1 Mô tả sản phẩm

Một trang web thiệp mời tốt nghiệp dạng single-page, hoạt động như thiệp mời điện tử. Người dùng mở trang → thấy thiệp đóng trong phong bì → click để mở → đọc nội dung thiệp → điền form xác nhận tham dự (RSVP) → nhận màn cảm ơn.

**Phiên bản 2.0 thay đổi so với v1:**
- Bỏ hoàn toàn OCR/Tesseract.js và hệ thống check-in danh tính
- Bỏ chữ ký canvas (không có giá trị nghiệp vụ thực tế)
- Thay guest database hardcoded bằng URL param `?guest=` để pre-fill tên
- RSVP data gửi về Formspree (chủ thiệp nhận được email)
- localStorage chỉ dùng để nhớ "đã gửi RSVP" cho UX mượt
- Bỏ trường email khỏi form

### 1.2 Thông tin sự kiện

| Trường | Giá trị |
|--------|---------|
| Tên người tốt nghiệp | Quách Ngọc Quang |
| Sự kiện | Lễ tốt nghiệp |
| Ngày | 05/07/2026 (display) / 2026-07-05 (canonical) |
| Địa điểm | Hội trường Nguyễn Văn Đạo |
| Giờ | *(chưa có — sẽ cập nhật sau)* |

> **Launch blocker:** Giờ lễ là thông tin cốt lõi. Thiệp không được launch cho đến khi giờ được xác nhận. Cho đến khi có giờ, hiển thị "Giờ sẽ cập nhật sau" thay vì để trống.

### 1.3 Mục tiêu

- Tạo trải nghiệm mở thiệp như thật, có cảm xúc
- Thu thập RSVP từ người được mời một cách đáng tin cậy
- Responsive, đẹp trên cả điện thoại và desktop
- Dễ deploy, không cần backend tự vận hành (Formspree xử lý phía server)
- Mở nhanh, ít phụ thuộc ngoài, ít lỗi

### 1.4 Không phải mục tiêu

- Hệ thống quản lý khách mời phức tạp
- Xác thực danh tính người dùng
- Lưu trữ chữ ký hay dữ liệu nhạy cảm
- Multi-user, real-time sync
- Anti-spam enterprise-grade (chỉ cần mức cơ bản)

---

## 2. User Flow

```
┌─────────────────────────────────────────────────────────┐
│ MÀN 1: THIỆP ĐÓNG                                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │                                                   │     │
│ │              ✉️ PHONG BÌ THIỆP MỜI               │     │
│ │                                                   │     │
│ │         ┌─────────────────────────┐               │     │
│ │         │  🔸 Seal vàng 🎓        │               │     │
│ │         │                         │               │     │
│ │         │  QUÁCH NGỌC QUANG       │               │     │
│ │         │  LỄ TỐT NGHIỆP 2026     │               │     │
│ │         │  05 . 07 . 2026         │               │     │
│ │         │  Hội trường Nguyễn Văn  │               │     │
│ │         │  Đạo                     │               │     │
│ │         └─────────────────────────┘               │     │
│ │                                                   │     │
│ │         ▼ CLICK TO OPEN ▼                         │     │
│ │                                                   │     │
│ └─────────────────────────────────────────────────┘     │
│                          │ click                         │
│                          ▼                               │
│ MÀN 2: THIỆP MỞ + FORM RSVP                             │
│ ┌─────────────────────────────────────────────────┐     │
│ │                                                   │     │
│ │  🎓 Trân Trọng Mời                                │     │
│ │  Quách Ngọc Quang                                 │     │
│ │  ───────────── (divider)                          │     │
│ │  "Mình trân trọng mời bạn đến dự lễ tốt           │     │
│ │   nghiệp của mình. Sự hiện diện của bạn           │     │
│ │   sẽ là món quà ý nghĩa nhất..."                  │     │
│ │                                                   │     │
│ │  📅 05 / 07 / 2026    📍 Hội trường Nguyễn Văn   │     │
│ │                        Đạo    🎓 Lễ Tốt Nghiệp    │     │
│ │                                                   │     │
│ │  ─── Xác nhận tham dự ───                         │     │
│ │                                                   │     │
│ │  Họ và tên: [Nguyễn Văn Anh]  ← pre-fill nếu     │     │
│ │                      ?guest= có trong URL          │     │
│ │                                                   │     │
│ │  Tham dự:  [Có]  [Không]  ← radio cards          │     │
│ │                                                   │     │
│ │  Số người:  [1 ▼]  ← ẩn nếu chọn "Không"         │     │
│ │                                                   │     │
│ │  Lời chúc:  [Chúc Quang...]  ← tùy chọn           │     │
│ │  (tùy chọn)                                        │     │
│ │                                                   │     │
│ │  [ GỬI XÁC NHẬN ]                                 │     │
│ │                                                   │     │
│ └─────────────────────────────────────────────────┘     │
│                          │ submit                        │
│                    ┌─────┴─────┐                         │
│                    ▼           ▼                         │
│              (thành công)  (thất bại)                    │
│                    │           │                         │
│                    ▼           ▼                         │
│              MÀN 3      Giữ màn 2,                       │
│              CẢM ƠN     hiện lỗi rõ                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │                                                   │     │
│ │              ✓                                    │     │
│ │        Cảm ơn bạn nhé!                            │     │
│ │        Hẹn gặp tại buổi lễ 🎓                     │     │
│ │                                                   │     │
│ │        [Xem lại thiệp]                            │     │
│ │                                                   │     │
│ └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Luồng thất bại (error flow)

```
Submit RSVP
    │
    ▼
Formspree trả lỗi / network fail
    │
    ▼
Giữ nguyên màn 2
Hiển thị message lỗi:
"Chưa gửi được xác nhận, bạn thử lại giúp mình nhé."
Button "Gửi lại" (enable lại form)
    │
    ▼
User thử lại → success → màn 3
```

---

## 3. Thiết kế giao diện

### 3.1 Phong cách

- **Tên:** Elegant Classic
- **Mô tả:** Tối sang trọng, viền vàng đồng, chữ serif cổ điển
- **Cảm xúc:** Trang trọng nhưng ấm áp, đúng chất thiệp mời cá nhân

### 3.2 Màu sắc

| Vai trò | Màu | Hex |
|---------|-----|-----|
| Background chính | Deep Navy | `#0a0a14` |
| Background phụ | Navy đậm | `#16213e` |
| Accent (vàng đồng) | Metallic Gold | `#e2b04a` |
| Text chính | Trắng | `#ffffff` |
| Text phụ | Trắng mờ | `rgba(255,255,255,0.6)` |
| Border | Vàng đồng nhạt | `rgba(226,176,74,0.4)` |
| Error | Đỏ nhạt | `#f87171` |
| Success | Xanh lá | `#4ade80` |

### 3.3 Typography

- **Font chính:** 'Playfair Display' (Google Fonts) — cho headings, tên, emphasis
- **Font phụ:** 'Cormorant Garamond' (Google Fonts) — cho body text, labels
- **Fallback:** Georgia / 'Times New Roman' (serif)

| Element | Font | Size | Weight | Letter-spacing | Color |
|---------|------|------|--------|----------------|-------|
| Tên người tốt nghiệp | Playfair Display | 24-28px | 700-900 | 2-3px | #fff |
| "LỄ TỐT NGHIỆP" | Cormorant Garamond | 11px | 400 | 6px | #e2b04a |
| Ngày/Địa điểm | Cormorant Garamond | 11-13px | 400 | 3px | rgba(255,255,255,0.55) |
| Form labels | Cormorant Garamond | 12px | 400 | 2px | rgba(255,255,255,0.55) |
| Button text | Playfair Display | 14-15px | 700 | 4px | #0a0a14 |
| Subtitle/body | Cormorant Garamond | 14-16px | 400 | 0 | rgba(255,255,255,0.6) |

### 3.4 Animation

| Animation | Trigger | Duration | Mô tả |
|-----------|---------|----------|-------|
| Pulse "Click to Open" | Auto (loop) | 2s | Opacity 0.4 → 1 |
| Staggered text reveal | Auto (màn 1) | 0.3s mỗi dòng | Seal → Tên → Ngày → Địa điểm → CTA |
| Content fade in | Mở màn 2 | 0.5s | Opacity 0 → 1, translateY |
| Confetti burst | Submit RSVP | 1.5s | Confetti particles bay ra từ nút |
| Success checkmark | Sau confetti | 0.6s | SVG stroke animation |
| Background particles | Auto (loop) | 6-12s | Float up từ dưới lên |

---

## 4. Chi tiết từng màn hình

### 4.1 Màn 1: Thiệp đóng (Envelope)

**Layout:**
- Phong bì giữa màn hình, có shadow
- Seal vàng lớn ở giữa phong bì với icon 🎓
- Tên "QUÁCH NGỌC QUANG" ở dưới seal
- Dòng "LỄ TỐT NGHIỆP" và ngày/địa điểm bên dưới
- CTA: "▼ CLICK TO OPEN ▼" với animation pulse

**Interactive:**
- Click bất kỳ vị trí trên phong bì → trigger animation mở
- Hover: phong bì có subtle lift effect (translateY -6px, shadow tăng)
- Keyboard: Tab đến phong bì → Enter/Space để mở

**Responsive:**
- Desktop: phong bì 340px wide
- Mobile: phong bì 85vw, tỷ lệ giữ nguyên

### 4.2 Màn 2: Thiệp mở + Form RSVP

**Layout:**
- Nội dung thiệp đầy đủ hiển thị trực tiếp (không còn hiệu ứng phong bì mở)
- Header: 🎓 emoji + "Trân Trọng Mời" + "Quách Ngọc Quang" + divider
- Message: lời mời cá nhân
- Details: ngày / địa điểm / giờ / sự kiện
- Form RSVP xuất hiện bên dưới nội dung thiệp

**Form fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| Họ và tên | Text input | ✅ | Tên người được mời. Pre-fill nếu URL có `?guest=` (URL-encoded UTF-8) |
| Tham dự | Radio (Có/Không) | ✅ | Mặc định: Có |
| Số người | Select (1-5) | ✅ | Số lượng người đi cùng. Ẩn nếu chọn "Không". Nếu chọn "Không" → gửi `guestCount: 0` |
| Lời chúc | Textarea | ❌ | Tùy chọn |

**Button:**
- "GỬI XÁC NHẬN" — full width, gradient vàng, hover shimmer effect
- Click → POST đến Formspree → thành công: confetti → màn 3
- Click → thất bại: giữ màn 2, hiện lỗi, enable lại form

**Error state:**
- Message: "Chưa gửi được xác nhận, bạn thử lại giúp mình nhé."
- Style: text màu đỏ, nhẹ nhàng, không alarming
- Khi gặp lỗi, button được enable lại và khôi phục về nhãn ban đầu để khách thử gửi lại

### 4.3 Màn 3: Cảm ơn

**Layout:**
- Checkmark animation (SVG stroke draw)
- Dynamic message dựa trên lựa chọn tham dự:
  - `attendance = "yes"` → "Cảm ơn bạn nhé! Hẹn gặp bạn tại buổi lễ 🎓"
  - `attendance = "no"` → "Cảm ơn bạn đã phản hồi nhé. Hẹn gặp bạn dịp khác!"
- Link "Xem lại thiệp" để quay về màn 1

---

## 5. Yêu cầu kỹ thuật

### 5.1 Tech stack

| Thành phần | Công nghệ | Lý do |
|-----------|-----------|-------|
| HTML/CSS/JS | Vanilla, single file | Không cần build tool, dễ deploy |
| Font | Google Fonts (Playfair Display + Cormorant Garamond) | Serif cổ điển, phù hợp thiệp mời |
| RSVP endpoint | Formspree | Setup nhanh, nhận email, CORS đơn giản |
| Storage | localStorage | Chỉ nhớ "đã gửi RSVP" cho UX |
| Deploy | GitHub Pages / Netlify / Vercel | Miễn phí, custom domain |

### 5.2 Không cần

- Backend tự vận hành (Formspree xử lý phía server)
- Build tool / bundler
- NPM packages
- OCR / Tesseract.js
- Canvas / chữ ký
- Guest database / xác thực danh tính

### 5.3 Responsive breakpoints

| Breakpoint | Width | Điều chỉnh |
|------------|-------|-------------|
| Desktop | > 768px | Layout đầy đủ |
| Mobile | ≤ 768px | Thiệp thu nhỏ, form full-width |
| Small mobile | ≤ 480px | Font giảm, padding giảm, radio card xếp dọc |

### 5.4 Browser support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 5.5 Performance

- Page load: < 2s trên 3G
- Animation FPS: 60fps
- File size: < 150KB (single HTML, không có Tesseract)
- CDN dependencies: chỉ Google Fonts

---

## 6. URL & Routing

### 6.1 URL structure

```
index.html                              → Màn 1 (thiệp đóng, không pre-fill)
index.html?guest=<encoded-name>         → Màn 1, pre-fill tên vào form ở màn 2
```

Ví dụ: `index.html?guest=Nguy%E1%BB%85n%20V%C4%83n%20Anh` → pre-fill "Nguyễn Văn Anh"

### 6.2 `?guest=` behavior

- Đọc param `guest` từ URL, decode URI component
- Pre-fill chuỗi decoded trực tiếp vào input "Họ và tên" ở màn 2
- **Không** dùng slug không dấu — dùng URL-encoded UTF-8 để giữ nguyên dấu tiếng Việt
- Không xác thực — user vẫn sửa được
- Không gọi là "check-in" hay "xác thực"
- Sau khi submit, có thể xóa param khỏi URL (replaceState) để link sạch
- Nếu `?guest=` chứa ký tự không hợp lệ, bỏ qua (không pre-fill)

### 6.3 Formspree integration

```javascript
// Endpoint — hiện tại đã cấu hình trong index.html
const RSVP_ENDPOINT = 'https://formspree.io/f/xeewzabd';

// POST body gửi đi dưới dạng FormData
const formData = new FormData();
formData.append('name', 'Nguyễn Văn Anh');
formData.append('attendance', 'yes'); // 'yes' | 'no'
formData.append('guestCount', 2);     // 0 nếu attendance = 'no'
formData.append('message', 'Chúc Quang thi tốt!');
formData.append('timestamp', new Date().toISOString());

// `_gotcha` is checked client-side (empty-string early return) and appended to
// the submitted `FormData`, so Formspree's server-side spam filter also sees it.

// Response xử lý
- 200 OK → success → màn 3
- Khác 200 → error → giữ màn 2, hiện lỗi
- Network error → same as above
```

**Formspree là third-party backend** — không tự host, nhưng vẫn là server bên ngoài xử lý data.

### 6.4 Formspree setup hướng dẫn

1. Vào formspree.io → tạo account (free)
2. Tạo new form → nhận endpoint URL (vd: `https://formspree.io/f/xvndrqgz`)
3. Thêm fields: `name`, `attendance`, `guestCount`, `message`, `timestamp`
4. Copy endpoint ID → paste vào `RSVP_ENDPOINT` trong code (hiện tại: `xeewzabd`)
5. Mỗi RSVP → Formspree gửi email đến inbox của chủ thiệp

---

## 7. Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Guest      │     │  index.html  │     │  Formspree        │
│   mở link    │────▶│  (client)    │────▶│  (server)         │
│              │     │              │     │  → Email đến chủ  │
│              │     │  ┌────────┐  │     │    thiệp          │
│              │     │  │local-  │  │     │                   │
│              │     │  │Storage │  │     │                   │
│              │     │  │(UX only)│ │     │                   │
│              │     │  └────────┘  │     │                   │
└─────────────┘     └──────────────┘     └──────────────────┘
```

**localStorage (UX only):**
- Key: `grad_rsvp_<normalized_name>` → `{ sent: true, timestamp, attendance }`
- Mục đích: nếu guest đã gửi RSVP rồi, mở lại link → hiển thị banner "Bạn đã gửi xác nhận trước đó" nhưng **vẫn cho phép xem và sửa form**
- Không auto-skip sang màn cảm ơn — tránh khóa form trên thiết bị dùng chung
- Scope key theo tên normalized để phân biệt các guest khác nhau trên cùng máy
- Không phải backup data — data thật ở Formspree
- Chỉ lưu metadata tối thiểu (không lưu message hay thông tin nhạy cảm)

**Duplicate prevention:**
- Trước khi submit, kiểm tra localStorage — nếu đã gửi trong 1 phút gần nhất, lần click đầu hiển thị warning; lần click thứ hai cho cùng tên vẫn gửi lại nếu user cố ý
- Formspree cũng có thể reject duplicate từ cùng IP
- Không chặn hoàn toàn — chỉ cảnh báo, user vẫn có thể gửi lại nếu muốn

### 7.1 Spam & Quota Protection

| Biện pháp | Mô tả | Mức độ |
|-----------|-------|--------|
| Honeypot field | Thêm input ẩn tên `_gotcha`; nếu có giá trị thì client silent reject trước khi gửi | Light |
| Double-submit guard | Disable button sau khi click, re-enable chỉ khi có lỗi | Light |
| Rate limit check | Kiểm tra localStorage — nếu đã gửi trong 60s gần nhất, hiện warning | Light |
| Formspree quota | Free tier: 50 submissions/tháng, history 30 ngày. Đủ cho thiệp mời cá nhân | Monitoring |

**Formspree quota monitoring:**
- Host theo dõi usage qua Formspree dashboard hoặc email cảnh báo từ Formspree
- Formspree gửi notification khi đạt ngưỡng usage
- Code client không thể biết quota toàn cục — chỉ xử lý error response khi Formspree trả lỗi

### 7.2 Formspree Error Handling — Acceptance Criteria

| Tình huống | HTTP status | Behavior |
|-----------|-------------|----------|
| Submit thành công | 2xx OK (`response.ok`) | Chuyển màn 3, confetti |
| Endpoint chưa config | 404 / network error | Giữ màn 2, hiện lỗi "Chưa gửi được xác nhận..." |
| Quota exceeded | 402 / 429 | Giữ màn 2, hiện lỗi, log cho host |
| Server error | 500 | Giữ màn 2, hiện lỗi, cho thử lại |
| Timeout (>15s) | — | Giữ màn 2, hiện lỗi, cho thử lại |

**Implementation requirements:**
- Button phải có loading state ("Đang gửi...") trong khi request
- Button disable trong request, re-enable khi có response
- Error message phải có `aria-live="polite"` cho screen reader
- Không bao giờ chuyển màn 3 nếu response không phải 200 OK

---

## 8. Tone & Content

### 8.1 Tone: Casual, ấm áp, cá nhân

| Vị trí | Text |
|--------|------|
| Subtitle (màn 1) | "Mời bạn đến dự lễ tốt nghiệp của mình nhé! Vui lòng xác nhận tham dự bên dưới 👇" |
| Form header | "Xác nhận tham dự" |
| Button submit | "Gửi xác nhận" |
| Button error | "Thử lại" |
| Màn 3 title | "Cảm ơn bạn nhé!" |
| Màn 3 subtitle | "Hẹn gặp tại buổi lễ 🎓" |
| Link quay lại | "Xem lại thiệp" |

### 8.2 Invitation message (màn 2)

```
Mình trân trọng mời bạn đến dự lễ tốt nghiệp của mình.
Sự hiện diện của bạn sẽ là món quà ý nghĩa nhất trong ngày đặc biệt này.
```

### 8.3 Error messages

| Tình huống | Message |
|-----------|---------|
| Submit fail (network/endpoint) | "Chưa gửi được xác nhận, bạn thử lại giúp mình nhé." |
| Tên trống | "Vui lòng nhập họ và tên" |
| Không chọn tham dự | *(không có — mặc định là "Có")* |

---

## 9. Tính năng bổ sung

### 9.1 V1.1 (sau launch)

- [ ] Countdown timer đến ngày lễ (05/07/2026)
- [ ] Nhạc nền Pomp and Circumstance (có nút tắt)
- [ ] Google Maps embed cho địa điểm
- [ ] RSVP data export từ Formspree → Google Sheets tự động

### 9.2 V2 (tương lai)

- [ ] Multi-step form (Tên → Tham dự → Lời chúc)
- [ ] Guest management dashboard cho host
- [ ] QR code in trên thiệp giấy → link đến thiệp điện tử
- [ ] Photo gallery 4 năm học

---

## 10. Deploy

### 10.1 Hosting

- **GitHub Pages** (khuyến nghị) — miễn phí, custom domain
- Hoặc: Netlify / Vercel

### 10.2 Custom domain (tùy chọn)

- `quang-grad-2026.xyz` hoặc tương tự
- Cấu hình CNAME → GitHub Pages

### 10.3 Share link

- Link public để gửi cho người được mời
- Có thể thêm `?guest=` param cá nhân hóa
- QR code có thể in trên thiệp giấy (nếu có)

---

## 11. Timeline

| Phase | Thời gian | Mô tả |
|-------|-----------|-------|
| Design finalization | Đã xong | Chốt concept, màu sắc, animation, flow |
| Development | 1-2 ngày | Code HTML/CSS/JS, Formspree integration |
| Testing | 0.5 ngày | Test trên nhiều devices, browsers |
| Deploy | 0.5 ngày | Push lên GitHub Pages |
| **Total** | **2-3 ngày** | |

---

## 12. Checklist trước launch

- [x] Tạo Formspree form, điền endpoint ID vào code
- [ ] Test submit RSVP → nhận email thành công
- [ ] Test error flow (disconnect network, submit → thấy lỗi)
- [x] Test `?guest=` param pre-fill bằng runtime test
- [ ] Test responsive trên iPhone, Android, desktop
- [x] Test keyboard/focus state bằng structural/runtime tests
- [ ] Test `prefers-reduced-motion`
- [ ] Deploy lên GitHub Pages
- [ ] Test link trên thiệt bị thật (không chỉ localhost)
- [ ] Gửi link thử cho 2-3 người, xem họ nhận được RSVP email không

---

## 13. Tài liệu tham khảo

- [Formspree Docs](https://help.formspree.io/)
- [Google Fonts — Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- [Google Fonts — Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond)
- [Greenvelope — Graduation Invitations Blog](https://www.greenvelope.com/blog/graduation-invitations/)
- [Paperless Post — Graduation Invitations](https://www.paperlesspost.com/invitations/graduation-invitations)

---

## 14. Ghi chú

- Giờ lễ chưa có — sẽ cập nhật sau khi xác nhận
- Formspree free tier: 50 submissions/month, đủ cho thiệp mời cá nhân
- Nếu cần nhiều hơn → nâng cấp Formspree hoặc chuyển Google Apps Script
- Single file HTML → dễ chỉnh sửa, không cần rebuild, chỉ upload lại
