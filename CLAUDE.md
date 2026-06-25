# CLAUDE.md

ไฟล์นี้ให้คำแนะนำแก่ Claude Code (claude.ai/code) สำหรับการทำงานกับโค้ดในโปรเจกต์นี้

## ภาพรวมโปรเจกต์

เกมการ์ดสะสมอุทยานแห่งชาติไทย สร้างด้วย HTML/CSS/JS แบบ static ปัจจุบันรองรับโหมด Solo (เล่น 12 เทิร์น สะสมการ์ดอุทยานและทำภารกิจเพื่อทำคะแนน) ตัวเกมออกแบบรองรับ Multiplayer 2-4 คน แต่ยังไม่ได้ implement

UI ทั้งหมดเป็นภาษาไทย ใช้ฟอนต์ Sarabun จาก Google Fonts

## วิธีรันแอป

ไม่มีขั้นตอน build เปิด `index.html` ในเบราว์เซอร์โดยตรง หรือใช้ static file server:

```
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

ยังไม่มี test, linter หรือ package manager

## สถาปัตยกรรม

ไฟล์ JS 4 ไฟล์ โหลดผ่าน `<script>` ใน `index.html` ต้องเรียงลำดับตามนี้เท่านั้น:

1. **`js/data.js`** — ค่าคงที่, ข้อมูลการ์ด (อุทยาน 80 ใบ, ภารกิจ 20 ใบ) และ `validateData()` กำหนด `PARKS`, `MISSIONS`, `RESOURCES`, `EFFECT_INFO` และค่าคงที่ของเกม (`MAX_TURNS=12`, `MAX_RESOURCES=8`, `MARKET_SIZE=3`)

2. **`js/effects.js`** — ระบบ Effect และการคิดคะแนน จัดการ Ongoing Effect (O1-O4), Instant Effect (I1-I3), Endgame Effect (S1-S3), ส่วนลด cost (`getEffectiveCost`) และตรวจสอบภารกิจ (`checkMission` มี 10 `checkType`)

3. **`js/game.js`** — จัดการ state ของเกม ดูแล global object `gameState`, การจัดการสำรับ/กองกลาง, ทรัพยากร, การเก็บ/สำรวจ, วงจรเทิร์น และคำนวณคะแนนสุดท้าย

4. **`js/ui.js`** — การเรนเดอร์ DOM และจัดการ event มี 4 หน้าจอ (title, mission-select, game-board, game-over) และ 3 modal (gather, effect-resolution, rules) เรนเดอร์ด้วย DOM manipulation ตรงๆ ไม่ใช้ framework

## ลำดับการเล่น

หน้าแรก → เลือกภารกิจ (เลือก 2 จาก 3) → เล่น 12 เทิร์น → จบเกมพร้อมสรุปคะแนน

แต่ละเทิร์น: รับโบนัส Ongoing → เลือกทำ (เก็บทรัพยากร หรือ สำรวจอุทยานจากกองกลาง) → แก้ Instant Effect → จบเทิร์น

## โครงสร้างข้อมูลหลัก

- **การ์ดอุทยาน**: `{ id, name, region, tier (1-4), points, cost: {forest, water, mountain, activity}, effects: string[], desc }`
- **ภารกิจ**: `{ id, name, difficulty, bonus, desc, checkType, params }` — `checkType` เป็น key สำหรับ dispatch ใน `checkMission()`
- **Game state** (`gameState`): global object ตัวเดียว มี `phase`, `turn`, `deck`, `market`, `player` (resources, parks, missions), `turnPhase`, `pendingEffect`, gather state

## ภาคและทรัพยากร

4 ภาค: เหนือ, อีสาน, กลาง, ใต้ — ภาคละ 20 อุทยาน
4 ทรัพยากร: ป่า (🌳 forest), น้ำ (🌊 water), เขา (⛰️ mountain), กิจกรรม (☀️ activity)

## ระบบ Effect

- **Instant (I1-I3)**: เกิดทันทีเมื่อสำรวจอุทยาน I1=ค้นพบ (ดูการ์ดจากสำรับ เพิ่มเข้ากองกลาง), I2=ตั้งแคมป์ (ได้ทรัพยากร 2 ชิ้น), I3=เส้นทางลัด (สำรวจ ★ เพิ่ม 1 ใบทันที)
- **Ongoing (O1-O4)**: ได้ทรัพยากรหรือส่วนลด cost ต้นเทิร์นทุกเทิร์น
- **Endgame (S1-S3)**: คะแนนโบนัสตอนจบเกม คำนวณจากการ์ดที่สะสมไว้

## ไฟล์ข้อมูล

- `parks_data.csv` / `missions_data.csv` / `Thai National Park - อุทยานแห่งชาติ.csv` — ไฟล์ spreadsheet ต้นฉบับ ข้อมูลหลักที่ใช้จริงอยู่ใน `js/data.js` ไฟล์ CSV เป็นแหล่งอ้างอิง
- `GAME_RULES.md` — กฎเกมฉบับสมบูรณ์เป็นภาษาไทย ครอบคลุม Solo, Multiplayer และ Board Game
