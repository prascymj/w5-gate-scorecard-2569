# W5 User-Validation Gate Scorecard — 1305493 (2569)

แบบให้คะแนน **W5 User Validation Gate** (DISCOVER phase, 10/50 project points) ของวิชา
Software Case Studies (1305493) · ADT, Mae Fah Luang University · Dr. Prasara Jakkaew

## ใช้ยังไง
- เปิดหน้าเว็บ → กรอกชื่อทีม/ผู้ประเมิน → เลือก **P / C / F** ทั้ง 4 เสา
- ระบบคิด verdict อัตโนมัติ (PASS / CONDITIONAL / FAIL) → กดส่ง
- ข้อมูลบันทึกลง Google Sheet อัตโนมัติ · โหมด **append** (ส่งกี่ครั้งก็ต่อแถวใหม่ — peer หลายคน + อาจารย์ ต่างได้แถวของตัวเอง ไม่ทับกัน)
- อยากได้ "1 ทีม 1 แถว" แทน? มีบล็อก upsert คอมเมนต์พร้อมวิธีสลับไว้ท้าย `apps-script.gs`

## โครงสร้าง
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้ากรอกจริง (frontend) |
| `apps-script.gs` | โค้ด backend + วิธี deploy Google Apps Script Web App |

Backend เชื่อมกับ Google Sheet ผ่าน Apps Script Web App — ดูขั้นตอนติดตั้งในหัวไฟล์ `apps-script.gs`
