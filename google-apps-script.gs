/**
 * RSVP → Google Sheet (Thiệp mời tốt nghiệp Quách Ngọc Quang)
 *
 * Cách dùng: xem file HUONG-DAN-GOOGLE-SHEETS.md
 * Script này nhận dữ liệu từ form và ghi thành 1 dòng trong Sheet đang mở.
 */

var HEADERS = ['Thời điểm gửi', 'Họ và tên', 'Tham dự', 'Số người', 'Lời chúc', 'ID'];
var ID_COL = 6; // cột F chứa ID

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // tránh xung đột khi nhiều người gửi cùng lúc
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Tạo / bổ sung dòng tiêu đề
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    } else if (!sheet.getRange(1, ID_COL).getValue()) {
      sheet.getRange(1, ID_COL).setValue('ID'); // sheet cũ chưa có cột ID
    }

    var p = (e && e.parameter) ? e.parameter : {};
    var attending = p.attending === 'yes' ? 'Có' : 'Không';
    var id = p.id || '';
    var row = [
      p.timestamp || new Date().toISOString(),
      p.name || '',
      attending,
      p.guests || '0',
      p.wishes || '',
      id
    ];

    // Nếu đã có dòng cùng ID → ghi đè; nếu chưa → thêm dòng mới
    var updated = false;
    var last = sheet.getLastRow();
    if (id && last >= 2) {
      var ids = sheet.getRange(2, ID_COL, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(id)) {
          sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
          updated = true;
          break;
        }
      }
    }
    if (!updated) sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, updated: updated }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Mở link web app bằng trình duyệt sẽ thấy dòng này → xác nhận đã deploy đúng.
function doGet() {
  return ContentService.createTextOutput('RSVP endpoint OK');
}
