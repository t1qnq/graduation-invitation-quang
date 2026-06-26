# Hướng dẫn nối form RSVP vào Google Sheet

Làm 1 lần, khoảng 5 phút. Sau đó mỗi khi khách bấm "Gửi xác nhận", một dòng mới sẽ tự xuất hiện trong Google Sheet của bạn.

## Bước 1 — Tạo Google Sheet
1. Vào https://sheets.google.com → tạo một bảng tính mới (Trống).
2. Đặt tên tuỳ ý, ví dụ "RSVP Tốt nghiệp".

## Bước 2 — Dán script
1. Trong Sheet đó, mở menu **Tiện ích mở rộng → Apps Script** (Extensions → Apps Script).
2. Xoá hết nội dung mẫu trong ô soạn thảo.
3. Mở file `google-apps-script.gs` (trong cùng thư mục này), copy toàn bộ và dán vào.
4. Bấm biểu tượng **Lưu** (đĩa mềm).

## Bước 3 — Deploy thành Web App
1. Bấm nút **Triển khai → Tạo bản triển khai mới** (Deploy → New deployment).
2. Bấm biểu tượng bánh răng ⚙ cạnh "Chọn loại" → chọn **Ứng dụng web** (Web app).
3. Thiết lập:
   - **Thực thi với tư cách / Execute as:** Tôi (chính bạn).
   - **Ai có quyền truy cập / Who has access:** **Bất kỳ ai** (Anyone).
     → Bắt buộc chọn "Bất kỳ ai" thì form mới gửi được.
4. Bấm **Triển khai**. Google sẽ hỏi cấp quyền → bấm **Cho phép** (Authorize), chọn tài khoản của bạn, "Nâng cao → Đi tới … (không an toàn)" nếu có cảnh báo (đây là script của chính bạn nên an toàn).
5. Copy **URL ứng dụng web** hiện ra — dạng:
   `https://script.google.com/macros/s/AKfyc..../exec`

> Kiểm tra nhanh: mở URL đó bằng trình duyệt, nếu thấy chữ **RSVP endpoint OK** là đã deploy đúng.

## Bước 4 — Dán URL vào trang thiệp
1. Mở file `index.html`, tìm dòng (gần đầu phần `<script>`):
   ```js
   var SHEET_ENDPOINT = '';
   ```
2. Dán URL vào giữa hai dấu nháy:
   ```js
   var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfyc..../exec';
   ```
3. Lưu file.

Xong! Mở `index.html`, gửi thử một RSVP, rồi quay lại Google Sheet để xem dòng mới.

## Lưu ý
- Mỗi cột trong Sheet: Thời điểm gửi · Họ và tên · Tham dự (Có/Không) · Số người · Lời chúc.
- Nếu để `SHEET_ENDPOINT = ''` (rỗng), trang vẫn chạy nhưng chỉ lưu trong trình duyệt khách, **không** gửi về Sheet.
- Sau này nếu sửa script, nhớ **Triển khai → Quản lý bản triển khai → chỉnh sửa → phiên bản mới** để cập nhật (URL giữ nguyên).
- Muốn nhận email mỗi khi có RSVP: trong Google Sheet vào **Công cụ → Quy tắc thông báo** (Tools → Notification rules) → báo khi "có thay đổi".
