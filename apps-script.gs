/**
 * W5 Gate Scorecard — Google Apps Script backend
 * รับข้อมูลจาก W5-Gate-Scorecard-Live-2569.html แล้วต่อแถวลง Google Sheet
 *
 * ── วิธีติดตั้ง (ทำครั้งเดียว) ──────────────────────────────
 * 1. สร้าง Google Sheet ใหม่ 1 ไฟล์ (เช่นชื่อ "W5 Gate Results 2569")
 * 2. เมนู Extensions → Apps Script  → ลบโค้ดเดิม → วางโค้ดนี้ทั้งหมด → Save
 * 3. กด Deploy → New deployment → เลือกชนิด "Web app"
 *      - Execute as:      Me (บัญชีอาจารย์)
 *      - Who has access:  Anyone   ← สำคัญ ให้ นศ. ส่งได้โดยไม่ต้องล็อกอิน
 *    กด Deploy → อนุญาตสิทธิ์ → คัดลอก "Web app URL"
 * 4. เปิดไฟล์ W5-Gate-Scorecard-Live-2569.html แก้บรรทัด
 *      const SHEET_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
 *    ให้เป็น URL ที่คัดลอกมา
 * 5. ทดสอบส่ง 1 ครั้งจากหน้าเว็บ → ต้องมีแถวใหม่โผล่ใน Sheet
 *
 * หมายเหตุ: ถ้าแก้โค้ดนี้ทีหลัง ต้อง Deploy → Manage deployments →
 * แก้ deployment เดิม (Edit ✏️) → Version: New version → Deploy
 * (ถ้า New deployment จะได้ URL ใหม่ ต้องไปแก้ในไฟล์ HTML อีกรอบ)
 */

var SHEET_NAME = 'Results';

var HEADERS = [
  'submittedAt', 'team', 'project', 'reviewer', 'reviewerId', 'role',
  'p1', 'p2', 'p3', 'p4', 'verdict',
  'notes', 'fixGap', 'fixOwner', 'fixBy', 'serverTime'
];

function doPost(e) {
  // กันชนกันเวลาหลายทีมกดส่งพร้อมกันในคาบ
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sh.setFrozenRows(1);
    }

    var row = HEADERS.map(function (h) {
      if (h === 'serverTime') return new Date();
      return data[h] !== undefined ? data[h] : '';
    });

    // ── 1 ทีม 1 แถว (upsert) ──
    // หาแถวที่ชื่อทีมตรงกัน (ตัดช่องว่าง + ไม่สนตัวพิมพ์เล็ก/ใหญ่) แล้วเขียนทับ
    // ถ้าไม่เจอ = ทีมใหม่ → ต่อแถว
    var key = normKey(data.team);
    var teamCol = HEADERS.indexOf('team') + 1;  // 1-based
    var updated = false;
    if (key) {
      var last = sh.getLastRow();
      if (last >= 2) {
        var teams = sh.getRange(2, teamCol, last - 1, 1).getValues();
        for (var i = 0; i < teams.length; i++) {
          if (normKey(teams[i][0]) === key) {
            sh.getRange(i + 2, 1, 1, HEADERS.length).setValues([row]);
            updated = true;
            break;
          }
        }
      }
    }
    if (!updated) sh.appendRow(row);

    return json({ ok: true, mode: updated ? 'updated' : 'inserted' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function normKey(s) {
  return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
}

// เผื่อเปิด URL ตรงๆ ในเบราว์เซอร์เพื่อเช็คว่า deploy แล้ว
function doGet() {
  return json({ ok: true, msg: 'W5 Gate Scorecard endpoint is live.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
