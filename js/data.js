// ===== Constants =====

const RESOURCES = ["forest", "water", "mountain", "activity"];
const RESOURCE_EMOJI = { forest: "🌳", water: "🌊", mountain: "⛰️", activity: "☀️" };
const RESOURCE_NAMES = { forest: "ป่า", water: "น้ำ", mountain: "เขา", activity: "กิจกรรม" };

const REGION_COLORS = {
  "เหนือ": { primary: "#2E7D32", secondary: "#A5D6A7", bg: "#E8F5E9", text: "#1B5E20" },
  "อีสาน": { primary: "#E65100", secondary: "#FFCC80", bg: "#FFF3E0", text: "#BF360C" },
  "กลาง":  { primary: "#1565C0", secondary: "#90CAF9", bg: "#E3F2FD", text: "#0D47A1" },
  "ใต้":   { primary: "#00838F", secondary: "#80DEEA", bg: "#E0F7FA", text: "#006064" }
};

const TIER_COLORS = {
  1: "#9E9E9E",
  2: "#FFB300",
  3: "#FF6F00",
  4: "#D32F2F"
};

const MAX_RESOURCES = 8;
const MAX_TURNS = 20;
const MARKET_SIZE = 3;

const SOLO_RANKS = [
  { min: 30, label: "🏆 ตำนานแห่งอุทยาน" },
  { min: 25, label: "🥇 ผู้พิทักษ์อุทยาน" },
  { min: 20, label: "🥈 นักสำรวจ" },
  { min: 0,  label: "🥉 นักท่องเที่ยว" }
];

const EFFECT_INFO = {
  I1: { type: "instant", name: "ค้นพบ", desc: "ดูการ์ดบนสำรับ 3 ใบ เลือก 1 ใบวางในกองกลาง" },
  I2: { type: "instant", name: "ตั้งแคมป์", desc: "รับทรัพยากร 2 ชิ้นทันที" },
  I3: { type: "instant", name: "เส้นทางลัด", desc: "สำรวจ ★ เพิ่ม 1 ใบทันที (จ่าย cost ตามปกติ)" },
  O1: { type: "ongoing", name: "แหล่งธรรมชาติ", desc: "+1🌳 ต้นเทิร์น", resource: "forest" },
  O2: { type: "ongoing", name: "จุดชมวิว", desc: "+1🌊 ต้นเทิร์น", resource: "water" },
  O3: { type: "ongoing", name: "เส้นทางสะดวก", desc: "+1⛰️ ต้นเทิร์น", resource: "mountain" },
  O4: { type: "ongoing", name: "ไกด์ท้องถิ่น", desc: "อุทยานภาคเดียวกัน ลด cost 1 ชิ้น" },
  S1: { type: "endgame", name: "นักสะสม", desc: "+1 ต่อทุก 3 ใบจากภาคเดียวกัน" },
  S2: { type: "endgame", name: "นักเดินทาง", desc: "+1 ต่อทุกภาคที่มี 3+ ใบ" },
  S3: { type: "endgame", name: "ผู้พิทักษ์", desc: "+2 ถ้ามีอุทยานมากที่สุด" }
};

// ===== Park Data (80 cards) =====

const PARKS = [
  // ===== ภาคเหนือ (20) =====
  // Tier 4
  { id: 1,  name: "ดอยอินทนนท์", region: "เหนือ", tier: 4, points: 4, cost: { forest: 1, water: 0, mountain: 2, activity: 1 }, effects: ["O3","S1"], desc: "ยอดเขาสูงสุดของไทย" },
  { id: 2,  name: "ถ้ำหลวง-ขุนน้ำนางนอน", region: "เหนือ", tier: 4, points: 4, cost: { forest: 1, water: 1, mountain: 1, activity: 1 }, effects: ["I1","S2"], desc: "ถ้ำดังระดับโลกจากเหตุการณ์กู้ภัย" },
  // Tier 3
  { id: 3,  name: "ดอยสุเทพ-ปุย", region: "เหนือ", tier: 3, points: 3, cost: { forest: 1, water: 0, mountain: 1, activity: 1 }, effects: ["O4"], desc: "สัญลักษณ์เชียงใหม่" },
  { id: 4,  name: "ภูชี้ฟ้า", region: "เหนือ", tier: 3, points: 3, cost: { forest: 1, water: 0, mountain: 2, activity: 0 }, effects: ["I2"], desc: "จุดชมทะเลหมอกชื่อดัง" },
  { id: 5,  name: "เขาค้อ", region: "เหนือ", tier: 3, points: 3, cost: { forest: 1, water: 0, mountain: 1, activity: 1 }, effects: ["O1"], desc: "สวิตเซอร์แลนด์เมืองไทย" },
  // Tier 2
  { id: 6,  name: "ห้วยน้ำดัง", region: "เหนือ", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: ["I2"], desc: "ทะเลหมอกยามเช้า" },
  { id: 7,  name: "ภูหินร่องกล้า", region: "เหนือ", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ลานหินปุ่ม ป่าสน ประวัติศาสตร์" },
  { id: 8,  name: "แจ้ซ้อน", region: "เหนือ", tier: 2, points: 2, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: ["O2"], desc: "น้ำพุร้อนธรรมชาติ" },
  { id: 9,  name: "ภูสอยดาว", region: "เหนือ", tier: 2, points: 2, cost: { forest: 0, water: 0, mountain: 1, activity: 1 }, effects: [], desc: "ทุ่งดอกบัวตอง" },
  { id: 10, name: "ออบหลวง", region: "เหนือ", tier: 2, points: 2, cost: { forest: 0, water: 1, mountain: 1, activity: 0 }, effects: ["I3"], desc: "แกรนด์แคนยอนเมืองไทย" },
  // Tier 1
  { id: 11, name: "ดอยภูคา", region: "เหนือ", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ต้นชมพูภูคาหนึ่งเดียวในโลก" },
  { id: 12, name: "คลองลาน", region: "เหนือ", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "น้ำตกสูง 100 เมตร" },
  { id: 13, name: "แม่วงก์", region: "เหนือ", tier: 1, points: 1, cost: { forest: 2, water: 0, mountain: 0, activity: 0 }, effects: ["O1"], desc: "ป่าลึก ถิ่นเสือโคร่ง" },
  { id: 14, name: "ทุ่งแสลงหลวง", region: "เหนือ", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: [], desc: "ทุ่งหญ้าสะวันนาภาคเหนือ" },
  { id: 15, name: "ดอยขุนตาล", region: "เหนือ", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "อุโมงค์รถไฟยาวที่สุดในไทย" },
  { id: 16, name: "สาละวิน", region: "เหนือ", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: ["I2"], desc: "แม่น้ำชายแดน ล่องเรือ" },
  { id: 17, name: "ศรีสัชนาลัย", region: "เหนือ", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: ["I1"], desc: "ป่ามรดกโลก" },
  { id: 18, name: "แม่ปิง", region: "เหนือ", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 0, activity: 1 }, effects: [], desc: "ล่องแก่งแม่น้ำปิง" },
  { id: 19, name: "ดอยผ้าห่มปก", region: "เหนือ", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ยอดเขาสูงอันดับ 2 ของไทย" },
  { id: 20, name: "รามคำแหง", region: "เหนือ", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: [], desc: "เขาหลวงสุโขทัย" },

  // ===== ภาคอีสาน (20) =====
  // Tier 4
  { id: 21, name: "เขาใหญ่", region: "อีสาน", tier: 4, points: 4, cost: { forest: 2, water: 0, mountain: 1, activity: 1 }, effects: ["O1","S3"], desc: "มรดกโลก อุทยานแห่งชาติแห่งแรก" },
  { id: 22, name: "ภูกระดึง", region: "อีสาน", tier: 4, points: 4, cost: { forest: 1, water: 0, mountain: 2, activity: 1 }, effects: ["O3","S1"], desc: "ตำนานนักปีนเขา ยอดราบบนภู" },
  // Tier 3
  { id: 23, name: "ผาแต้ม", region: "อีสาน", tier: 3, points: 3, cost: { forest: 1, water: 1, mountain: 1, activity: 0 }, effects: ["I1"], desc: "ภาพเขียนสีโบราณ 3000 ปี" },
  { id: 24, name: "น้ำหนาว", region: "อีสาน", tier: 3, points: 3, cost: { forest: 2, water: 0, mountain: 1, activity: 0 }, effects: ["O1"], desc: "ป่าสนเขตหนาว อากาศเย็น" },
  { id: 25, name: "ทับลาน", region: "อีสาน", tier: 3, points: 3, cost: { forest: 2, water: 0, mountain: 0, activity: 1 }, effects: ["I3"], desc: "ป่าดงดิบขนาดใหญ่" },
  // Tier 2
  { id: 26, name: "ภูเรือ", region: "อีสาน", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: ["I2"], desc: "ภูเขารูปเรือ ทะเลหมอก" },
  { id: 27, name: "ไทรทอง", region: "อีสาน", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 0, activity: 1 }, effects: [], desc: "ทุ่งดอกกระเจียวบาน" },
  { id: 28, name: "ตาพระยา", region: "อีสาน", tier: 2, points: 2, cost: { forest: 2, water: 0, mountain: 0, activity: 0 }, effects: ["O4"], desc: "ป่าชายแดนไทย-กัมพูชา" },
  { id: 29, name: "ป่าหินงาม", region: "อีสาน", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: ["I1"], desc: "คุนหมิงเมืองไทย ลานหินรูปร่างแปลก" },
  { id: 30, name: "ภูพาน", region: "อีสาน", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ป่าเต็งรัง พระตำหนักภูพานราชนิเวศน์" },
  // Tier 1
  { id: 31, name: "แก่งตะนะ", region: "อีสาน", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "แก่งหินแม่น้ำมูล" },
  { id: 32, name: "เขาพระวิหาร", region: "อีสาน", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ผาหินชายแดน" },
  { id: 33, name: "ตาดโตน", region: "อีสาน", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "น้ำตกหินปูนชัยภูมิ" },
  { id: 34, name: "นายูง-น้ำโสม", region: "อีสาน", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: ["I2"], desc: "ป่าดงดิบ ลำธาร" },
  { id: 35, name: "น้ำพอง", region: "อีสาน", tier: 1, points: 1, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "เขื่อนอุบลรัตน์" },
  { id: 36, name: "ภูเก้า-ภูพานคำ", region: "อีสาน", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ลานหินทราย ทุ่งดอกไม้" },
  { id: 37, name: "ภูผาม่าน", region: "อีสาน", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: ["I3"], desc: "หน้าผาสูงชัน วิวทะเลหมอก" },
  { id: 38, name: "ภูผายล", region: "อีสาน", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ลานหินรูปทรงแปลก" },
  { id: 39, name: "ภูเวียง", region: "อีสาน", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: ["I1"], desc: "แหล่งฟอสซิลไดโนเสาร์" },
  { id: 40, name: "ภูลังกา", region: "อีสาน", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ทะเลหมอก ภูผาหอ" },

  // ===== ภาคกลาง (20) =====
  // Tier 4
  { id: 41, name: "แก่งกระจาน", region: "กลาง", tier: 4, points: 4, cost: { forest: 2, water: 1, mountain: 0, activity: 1 }, effects: ["O1","S2"], desc: "อุทยานฯ ใหญ่ที่สุด มรดกโลก" },
  { id: 42, name: "หมู่เกาะช้าง", region: "กลาง", tier: 4, points: 4, cost: { forest: 1, water: 2, mountain: 0, activity: 1 }, effects: ["O2","S1"], desc: "เกาะใหญ่อันดับ 2 ของไทย" },
  // Tier 3
  { id: 43, name: "เอราวัณ", region: "กลาง", tier: 3, points: 3, cost: { forest: 1, water: 2, mountain: 0, activity: 0 }, effects: ["I3"], desc: "น้ำตก 7 ชั้น สีเขียวมรกต" },
  { id: 44, name: "เขาสามร้อยยอด", region: "กลาง", tier: 3, points: 3, cost: { forest: 0, water: 1, mountain: 1, activity: 1 }, effects: ["I1"], desc: "ถ้ำพระยานคร ศาลาแสงอาทิตย์" },
  { id: 45, name: "เขาแหลมหญ้า-หมู่เกาะเสม็ด", region: "กลาง", tier: 3, points: 3, cost: { forest: 0, water: 1, mountain: 0, activity: 2 }, effects: ["O2"], desc: "เกาะเสม็ด หาดทรายขาว" },
  // Tier 2
  { id: 46, name: "กุยบุรี", region: "กลาง", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 0, activity: 1 }, effects: ["I2"], desc: "จุดดูช้างป่า สัตว์ป่าตัวจริง" },
  { id: 47, name: "ไทรโยค", region: "กลาง", tier: 2, points: 2, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "แม่น้ำแคว น้ำตกไทรโยค" },
  { id: 48, name: "เขาคิชฌกูฏ", region: "กลาง", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: ["O3"], desc: "รอยพระพุทธบาท เทศกาลแห่" },
  { id: 49, name: "น้ำตกพลิ้ว", region: "กลาง", tier: 2, points: 2, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: ["I2"], desc: "น้ำตกชื่อดังจันทบุรี" },
  { id: 50, name: "ปางสีดา", region: "กลาง", tier: 2, points: 2, cost: { forest: 1, water: 0, mountain: 0, activity: 1 }, effects: [], desc: "ดูผีเสื้อนับร้อยชนิด" },
  // Tier 1
  { id: 51, name: "เจ็ดคด-โป่งก้อนเส้า", region: "กลาง", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: [], desc: "เส้นทางเดินป่าใกล้กรุง" },
  { id: 52, name: "น้ำตกเจ็ดสาวน้อย", region: "กลาง", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "น้ำตกเล็กๆ ร่มรื่น" },
  { id: 53, name: "น้ำตกสามหลั่น", region: "กลาง", tier: 1, points: 1, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: ["I1"], desc: "น้ำตก 3 ชั้น ป่าใกล้กรุง" },
  { id: 54, name: "พุเตย", region: "กลาง", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: [], desc: "ป่าดงดิบตะวันตก" },
  { id: 55, name: "เขาแหลม", region: "กลาง", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ป่าทึบริมเขื่อนวชิราลงกรณ์" },
  { id: 56, name: "เขื่อนศรีนครินทร์", region: "กลาง", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: ["O2"], desc: "เขื่อนกลางป่ากาญจนบุรี" },
  { id: 57, name: "ทองผาภูมิ", region: "กลาง", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "ภูเขาชายแดน ป่าลึก" },
  { id: 58, name: "หาดวนกร", region: "กลาง", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: [], desc: "หาดทรายริมอ่าวไทย" },
  { id: 59, name: "เขาชะเมา-เขาวง", region: "กลาง", tier: 1, points: 1, cost: { forest: 0, water: 0, mountain: 1, activity: 0 }, effects: ["I3"], desc: "ป่าเขาภาคตะวันออก" },
  { id: 60, name: "เขาสิบห้าชั้น", region: "กลาง", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: [], desc: "ป่าดิบชื้นระยอง" },

  // ===== ภาคใต้ (20) =====
  // Tier 4
  { id: 61, name: "หมู่เกาะสิมิลัน", region: "ใต้", tier: 4, points: 4, cost: { forest: 0, water: 2, mountain: 0, activity: 2 }, effects: ["O2","S2"], desc: "ดำน้ำระดับโลก น้ำใสติดอันดับ" },
  { id: 62, name: "หาดนพรัตน์ธารา-หมู่เกาะพีพี", region: "ใต้", tier: 4, points: 4, cost: { forest: 1, water: 1, mountain: 0, activity: 2 }, effects: ["I2","S1"], desc: "อ่าวมาหยา เกาะพีพี" },
  // Tier 3
  { id: 63, name: "ตะรุเตา", region: "ใต้", tier: 3, points: 3, cost: { forest: 0, water: 2, mountain: 0, activity: 1 }, effects: ["O4"], desc: "อุทยานทางทะเลแห่งแรก เกาะหลีเป๊ะ" },
  { id: 64, name: "อ่าวพังงา", region: "ใต้", tier: 3, points: 3, cost: { forest: 0, water: 1, mountain: 1, activity: 1 }, effects: ["I1"], desc: "เขาตะปู James Bond Island" },
  { id: 65, name: "เขาสก", region: "ใต้", tier: 3, points: 3, cost: { forest: 1, water: 1, mountain: 1, activity: 0 }, effects: ["O1"], desc: "กุ้ยหลินเมืองไทย เขื่อนรัชชประภา" },
  // Tier 2
  { id: 66, name: "หมู่เกาะสุรินทร์", region: "ใต้", tier: 2, points: 2, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: ["I2"], desc: "ดำน้ำตื้น ชาวมอแกน" },
  { id: 67, name: "หมู่เกาะอ่างทอง", region: "ใต้", tier: 2, points: 2, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: [], desc: "หมู่เกาะ 42 เกาะ ทะเลใน" },
  { id: 68, name: "หมู่เกาะลันตา", region: "ใต้", tier: 2, points: 2, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: ["I3"], desc: "เกาะลันตา ถ้ำเจ้าไหม" },
  { id: 69, name: "เขาหลวง", region: "ใต้", tier: 2, points: 2, cost: { forest: 1, water: 1, mountain: 1, activity: 0 }, effects: ["O3"], desc: "ยอดเขาสูงสุดภาคใต้" },
  { id: 70, name: "ทะเลบัน", region: "ใต้", tier: 2, points: 2, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "ทะเลสาบธรรมชาติ ป่าฝน" },
  // Tier 1
  { id: 71, name: "แก่งกรุง", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "ป่าดิบชื้น สุราษฎร์ธานี" },
  { id: 72, name: "เขาพนมเบญจา", region: "ใต้", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, effects: [], desc: "น้ำตกร้อน ป่าเมฆกระบี่" },
  { id: 73, name: "เขาลำปี-หาดท้ายเหมือง", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: ["I2"], desc: "หาดวางไข่เต่าทะเล" },
  { id: 74, name: "เขาหลัก-ลำรู่", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: [], desc: "หาดทรายยาว ดำน้ำ" },
  { id: 75, name: "สิรินาถ", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "หาดในยาง หาดไม้ขาว ภูเก็ต" },
  { id: 76, name: "ธารโบกขรณี", region: "ใต้", tier: 1, points: 1, cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, effects: ["I1"], desc: "สระมรกต น้ำใสสีเขียว" },
  { id: 77, name: "หมู่เกาะชุมพร", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "เกาะเต่า แนวปะการัง" },
  { id: 78, name: "หาดเจ้าไหม", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 1 }, effects: [], desc: "ถ้ำมรกต ทะเลตรัง" },
  { id: 79, name: "ศรีพังงา", region: "ใต้", tier: 1, points: 1, cost: { forest: 1, water: 0, mountain: 0, activity: 0 }, effects: ["O1"], desc: "ป่าดิบชื้น คลองนาคา" },
  { id: 80, name: "หมู่เกาะเภตรา", region: "ใต้", tier: 1, points: 1, cost: { forest: 0, water: 1, mountain: 0, activity: 0 }, effects: [], desc: "ซุ้มประตูหินธรรมชาติ" },
];

// ===== Mission Data (20 cards) =====

const MISSIONS = [
  // Easy (+3)
  { id: "M01", name: "นักเดินป่า", difficulty: "easy", bonus: 3, desc: "มีอุทยานที่ cost มี 🌳 ≥ 3 ใบ", checkType: "cost_has_resource", params: { resource: "forest", min: 3 } },
  { id: "M02", name: "นักปีนเขา", difficulty: "easy", bonus: 3, desc: "มีอุทยานที่ cost มี ⛰️ ≥ 3 ใบ", checkType: "cost_has_resource", params: { resource: "mountain", min: 3 } },
  { id: "M03", name: "คนรักทะเล", difficulty: "easy", bonus: 3, desc: "มีอุทยานที่ cost มี 🌊 ≥ 3 ใบ", checkType: "cost_has_resource", params: { resource: "water", min: 3 } },
  { id: "M04", name: "นักผจญภัย", difficulty: "easy", bonus: 3, desc: "มีอุทยานที่ cost มี ☀️ ≥ 3 ใบ", checkType: "cost_has_resource", params: { resource: "activity", min: 3 } },
  { id: "M05", name: "ขาเที่ยวเหนือ", difficulty: "easy", bonus: 3, desc: "มีอุทยานภาคเหนือ ≥ 2 ใบ", checkType: "region_count", params: { region: "เหนือ", min: 2 } },
  { id: "M06", name: "ขาเที่ยวอีสาน", difficulty: "easy", bonus: 3, desc: "มีอุทยานภาคอีสาน ≥ 2 ใบ", checkType: "region_count", params: { region: "อีสาน", min: 2 } },
  { id: "M07", name: "ขาเที่ยวกลาง", difficulty: "easy", bonus: 3, desc: "มีอุทยานภาคกลาง ≥ 2 ใบ", checkType: "region_count", params: { region: "กลาง", min: 2 } },
  { id: "M08", name: "ขาเที่ยวใต้", difficulty: "easy", bonus: 3, desc: "มีอุทยานภาคใต้ ≥ 2 ใบ", checkType: "region_count", params: { region: "ใต้", min: 2 } },
  { id: "M09", name: "นักสำรวจมือใหม่", difficulty: "easy", bonus: 3, desc: "มีอุทยาน ★ ≥ 3 ใบ", checkType: "tier_count", params: { tier: 1, min: 3 } },
  // Medium (+5)
  { id: "M10", name: "ผู้ชำนาญภาคเหนือ", difficulty: "medium", bonus: 5, desc: "มีอุทยานภาคเหนือ ≥ 4 ใบ", checkType: "region_count", params: { region: "เหนือ", min: 4 } },
  { id: "M11", name: "ผู้ชำนาญภาคอีสาน", difficulty: "medium", bonus: 5, desc: "มีอุทยานภาคอีสาน ≥ 4 ใบ", checkType: "region_count", params: { region: "อีสาน", min: 4 } },
  { id: "M12", name: "ผู้ชำนาญภาคกลาง", difficulty: "medium", bonus: 5, desc: "มีอุทยานภาคกลาง ≥ 4 ใบ", checkType: "region_count", params: { region: "กลาง", min: 4 } },
  { id: "M13", name: "ผู้ชำนาญภาคใต้", difficulty: "medium", bonus: 5, desc: "มีอุทยานภาคใต้ ≥ 4 ใบ", checkType: "region_count", params: { region: "ใต้", min: 4 } },
  { id: "M14", name: "นักเดินทางข้ามภาค", difficulty: "medium", bonus: 5, desc: "มีอุทยานจาก 3 ภาค ภาคละ ≥ 2 ใบ", checkType: "multi_region", params: { regionsNeeded: 3, minPerRegion: 2 } },
  { id: "M15", name: "นักสะสมระดับสูง", difficulty: "medium", bonus: 5, desc: "มีอุทยาน ★★★ ขึ้นไป ≥ 2 ใบ", checkType: "tier_min_count", params: { minTier: 3, min: 2 } },
  { id: "M16", name: "ป่าเขาล้วน", difficulty: "medium", bonus: 5, desc: "มีอุทยานที่ cost มีทั้ง 🌳 และ ⛰️ ≥ 3 ใบ", checkType: "cost_has_both", params: { resource1: "forest", resource2: "mountain", min: 3 } },
  // Hard (+7)
  { id: "M17", name: "ตำนานแห่งภาค", difficulty: "hard", bonus: 7, desc: "มีอุทยานภาคเดียวกัน ≥ 6 ใบ", checkType: "any_region_max", params: { min: 6 } },
  { id: "M18", name: "สี่ภาค สี่ดาว", difficulty: "hard", bonus: 7, desc: "มี ★★★★ จาก 2 ภาคที่ต่างกัน", checkType: "tier4_multi_region", params: { regionsNeeded: 2 } },
  { id: "M19", name: "นักสำรวจผู้ยิ่งใหญ่", difficulty: "hard", bonus: 7, desc: "สำรวจรวม ≥ 9 ใบ", checkType: "total_parks", params: { min: 9 } },
  { id: "M20", name: "เส้นทางในฝัน", difficulty: "hard", bonus: 7, desc: "มี ★★★★ + ★ จากภาคเดียวกัน ≥ 3 ใบ", checkType: "tier4_plus_tier1_region", params: { tier1Min: 3 } },
];

// ===== Seasons (4 ฤดู × 3 เทิร์น = 12 เทิร์น) =====

const SEASONS = [
  { id: "winter",  name: "ฤดูหนาว",      icon: "❄️", turns: [1,2,3],    bonusResource: "mountain", bonusRegion: "เหนือ" },
  { id: "summer",  name: "ฤดูร้อน",      icon: "🔥", turns: [4,5,6],    bonusResource: "activity", bonusRegion: "ใต้" },
  { id: "rainy",   name: "ฤดูฝน",        icon: "🌧️", turns: [7,8,9],    bonusResource: "water",    bonusRegion: "กลาง" },
  { id: "harvest", name: "ฤดูเก็บเกี่ยว", icon: "🍂", turns: [10,11,12], bonusResource: "forest",   bonusRegion: "อีสาน" },
];

function getCurrentSeason(turn) {
  return SEASONS.find(s => s.turns.includes(turn)) || SEASONS[0];
}

// ===== Gear (อุปกรณ์) =====

const GEARS = [
  { id: "G1", name: "เต็นท์พกพา",     icon: "⛺", cost: { forest: 1, water: 0, mountain: 0, activity: 1 }, desc: "ถือทรัพยากรสูงสุด +2 (เป็น 10)", effectType: "max_resources" },
  { id: "G2", name: "แผนที่เดินป่า",   icon: "🗺️", cost: { forest: 1, water: 0, mountain: 1, activity: 0 }, desc: "กองกลางเพิ่มเป็น 4 ใบ",         effectType: "market_size" },
  { id: "G3", name: "เข็มทิศ",         icon: "🧭", cost: { forest: 0, water: 0, mountain: 1, activity: 1 }, desc: "ลด cost อุทยานทั้งหมด 1 ชิ้น",   effectType: "cost_discount" },
  { id: "G4", name: "รองเท้าเดินป่า",   icon: "🥾", cost: { forest: 0, water: 0, mountain: 2, activity: 0 }, desc: "เก็บทรัพยากร +1 ชิ้น",           effectType: "gather_bonus" },
  { id: "G5", name: "กล้องถ่ายรูป",     icon: "📷", cost: { forest: 0, water: 0, mountain: 0, activity: 2 }, desc: "สำรวจอุทยาน ได้ทรัพยากรคืน 1",   effectType: "visit_refund" },
  { id: "G6", name: "คู่มือท่องเที่ยว",  icon: "📖", cost: { forest: 1, water: 1, mountain: 0, activity: 0 }, desc: "โบนัสฤดูกาลต้นเทิร์น ×2",       effectType: "season_double" },
];

// ===== Data Validation =====

function validateData() {
  let errors = 0;
  if (PARKS.length !== 80) { console.error(`Park count: ${PARKS.length}, expected 80`); errors++; }
  if (MISSIONS.length !== 20) { console.error(`Mission count: ${MISSIONS.length}, expected 20`); errors++; }

  const regionCounts = {};
  const tierCounts = {};
  PARKS.forEach(p => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    tierCounts[p.tier] = (tierCounts[p.tier] || 0) + 1;
    if (p.points !== p.tier) { console.error(`${p.name}: points ${p.points} !== tier ${p.tier}`); errors++; }
    const total = p.cost.forest + p.cost.water + p.cost.mountain + p.cost.activity;
    if (total < 1) { console.error(`${p.name}: cost total ${total} < 1`); errors++; }
    if (total < p.tier || total > p.tier + 1) { console.error(`${p.name}: cost total ${total} out of range for tier ${p.tier}`); errors++; }
  });

  ["เหนือ","อีสาน","กลาง","ใต้"].forEach(r => {
    if (regionCounts[r] !== 20) { console.error(`Region ${r}: ${regionCounts[r]}, expected 20`); errors++; }
  });
  if (tierCounts[1] !== 40) { console.error(`Tier 1: ${tierCounts[1]}, expected 40`); errors++; }
  if (tierCounts[2] !== 20) { console.error(`Tier 2: ${tierCounts[2]}, expected 20`); errors++; }
  if (tierCounts[3] !== 12) { console.error(`Tier 3: ${tierCounts[3]}, expected 12`); errors++; }
  if (tierCounts[4] !== 8) { console.error(`Tier 4: ${tierCounts[4]}, expected 8`); errors++; }

  if (errors === 0) { console.log("✅ Data validation passed"); }
  else { console.error(`❌ ${errors} validation errors`); }
}
