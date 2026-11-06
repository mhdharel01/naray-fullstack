/**
 * Date and Schedule Helper Functions
 * Menghitung korelasi antara jadwal mingguan poliklinik dan masa cuti dokter
 */

export const DAY_NAME_TO_NUM = {
  'senin': 1,
  'selasa': 2,
  'rabu': 3,
  'kamis': 4,
  'jumat': 5,
  'sabtu': 6,
  'minggu': 7,
};

export const NUM_TO_DAY_NAME = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
  0: 'Minggu',
};

/**
 * Normalisasi nama hari atau angka hari ke format 1 (Senin) - 7 (Minggu)
 */
export function parseDayNum(day) {
  if (typeof day === 'number') {
    return day === 0 ? 7 : day;
  }
  if (!day || typeof day !== 'string') return null;
  const clean = day.toLowerCase().trim();
  if (DAY_NAME_TO_NUM[clean] !== undefined) return DAY_NAME_TO_NUM[clean];
  for (const [name, num] of Object.entries(DAY_NAME_TO_NUM)) {
    if (clean.includes(name)) return num;
  }
  return null;
}

/**
 * Mengecek apakah suatu hari (angka 1-7 atau nama hari) masuk dalam rentang tanggal
 * @param {string} startDateStr - YYYY-MM-DD
 * @param {string} endDateStr - YYYY-MM-DD
 * @param {number|string} target - 1-7 atau 'Senin', 'Jumat', dll.
 */
export function rangeIncludesDayOfWeek(startDateStr, endDateStr, target) {
  if (!startDateStr || !endDateStr || target === undefined || target === null) return false;
  const dayNum = typeof target === 'number' ? (target === 0 ? 7 : target) : parseDayNum(target);
  if (!dayNum) return false;

  const sStr = typeof startDateStr === 'string' ? startDateStr.slice(0, 10) : '';
  const eStr = typeof endDateStr === 'string' ? endDateStr.slice(0, 10) : '';
  if (!sStr || !eStr) return false;

  const start = new Date(sStr + 'T00:00:00');
  const end = new Date(eStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays >= 6) return true; // Rentang >= 7 hari mencakup seluruh hari dalam seminggu

  const curr = new Date(start);
  while (curr <= end) {
    const jsDay = curr.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const currentNum = jsDay === 0 ? 7 : jsDay;
    if (currentNum === dayNum) return true;
    curr.setDate(curr.getDate() + 1);
  }
  return false;
}

/**
 * Mengecek apakah suatu sesi jadwal praktik terkena dampak cuti aktif
 * @param {object} sch - Sesi jadwal
 * @param {object} leave - Data catatan cuti
 * @param {string|null} referenceDateStr - Tanggal referensi (YYYY-MM-DD) untuk memastikan cuti aktif hari ini
 */
export function isScheduleCoveredByLeave(sch, leave, referenceDateStr = null) {
  if (!sch || !leave) return false;
  if (leave.status === 'cancelled' || leave.status === 'rejected') return false;

  const lStart = typeof leave.start_date === 'string' ? leave.start_date.slice(0, 10) : '';
  const lEnd = typeof leave.end_date === 'string' ? leave.end_date.slice(0, 10) : '';
  if (!lStart || !lEnd) return false;

  // Jika diberikan referenceDateStr, pastikan tanggal tersebut berada dalam masa cuti
  if (referenceDateStr) {
    if (lStart > referenceDateStr || referenceDateStr > lEnd) return false;
  }

  // 1. Jika cuti terikat ke spesifik schedule ID
  if (leave.doctor_schedule_id && (sch.dbId || sch.id)) {
    if (String(leave.doctor_schedule_id) === String(sch.dbId || sch.id)) {
      return true;
    }
  }

  // 2. Cek apakah hari dari sesi jadwal masuk dalam rentang tanggal cuti
  const dayTarget = sch.day_of_week !== undefined && sch.day_of_week !== null ? sch.day_of_week : sch.day;
  return rangeIncludesDayOfWeek(lStart, lEnd, dayTarget);
}
