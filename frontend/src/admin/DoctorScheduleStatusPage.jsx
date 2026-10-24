import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, Clock, Stethoscope, AlertCircle, CheckCircle2,
  Trash2, CalendarOff, Check, CalendarCheck,
  Filter, Info, ChevronRight, User, MapPin, Building2, HelpCircle,
  Sparkles, ShieldAlert, AlertTriangle, RotateCcw, CalendarRange,
  ChevronLeft
} from 'lucide-react';
import { formatImageUrl } from '../context/HospitalDataContext';

const REASON_OPTIONS = [
  'Cuti Tahunan',
  'Sakit / Izin Medis',
  'Seminar / Tugas Luar',
  'Cuti Melahirkan',
  'Libur Khusus Poliklinik',
  'Keperluan Pribadi / Keluarga',
  'Lainnya'
];

const DAY_NAME_TO_NUM = {
  'minggu': 0, 'ahad': 0,
  'senin': 1,
  'selasa': 2,
  'rabu': 3,
  'kamis': 4,
  'jumat': 5, "jum'at": 5,
  'sabtu': 6
};

const NUM_TO_DAY_NAME = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Format tanggal lokal YYYY-MM-DD
function formatLocalDate(dateObj) {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse string tanggal lokal ke Date object
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const cleanStr = String(dateStr).slice(0, 10);
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(cleanStr);
}

// Format tanggal Indonesia ramah pengguna
function formatDateIndo(dateStr, withDay = false) {
  if (!dateStr) return '-';
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('id-ID', {
      ...(withDay ? { weekday: 'long' } : {}),
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Hitung durasi hari kalender (inklusif)
function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const d1 = parseLocalDate(startDate);
  const d2 = parseLocalDate(endDate);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

// Ekstrak nomor hari (0 = Minggu ... 6 = Sabtu)
function parseDayNumbers(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    const set = new Set();
    input.forEach(item => {
      parseDayNumbers(item).forEach(num => set.add(num));
    });
    return Array.from(set).sort((a, b) => a - b);
  }

  const str = String(input).toLowerCase().trim();
  
  // Rentang hari (contoh: "Senin - Jumat")
  if (str.includes('-')) {
    const parts = str.split('-').map(p => p.trim());
    const start = DAY_NAME_TO_NUM[parts[0]];
    const end = DAY_NAME_TO_NUM[parts[1]];
    if (start !== undefined && end !== undefined && start <= end) {
      const arr = [];
      for (let i = start; i <= end; i++) arr.push(i);
      return arr;
    }
  }

  // Nama hari tunggal atau list koma
  const set = new Set();
  Object.entries(DAY_NAME_TO_NUM).forEach(([name, num]) => {
    if (str.includes(name)) {
      set.add(num);
    }
  });
  return Array.from(set).sort((a, b) => a - b);
}

// Kelompokkan array tanggal yang berurutan menjadi ranges
function groupConsecutiveDates(dateStrs) {
  if (!dateStrs || dateStrs.length === 0) return [];
  const sorted = Array.from(new Set(dateStrs)).sort();
  const ranges = [];

  let currentStart = sorted[0];
  let currentEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseLocalDate(currentEnd);
    const expectedNext = new Date(prevDate);
    expectedNext.setDate(expectedNext.getDate() + 1);
    const expectedNextStr = formatLocalDate(expectedNext);

    if (sorted[i] === expectedNextStr) {
      currentEnd = sorted[i];
    } else {
      ranges.push({ start_date: currentStart, end_date: currentEnd });
      currentStart = sorted[i];
      currentEnd = sorted[i];
    }
  }

  ranges.push({ start_date: currentStart, end_date: currentEnd });
  return ranges;
}

export function DoctorScheduleStatusPage({
  initialSchedule = null,
  initialDoctor = null,
  doctors = [],
  doctorSchedules = [],
  doctorLeaves = [],
  onBack,
  onSetTemporaryLeave,
  onCancelTemporaryLeave,
  showToast
}) {
  const _now = new Date();
  const todayStr = formatLocalDate(_now);

  // Dokter aktif terpilih
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialDoctor?.dbId || initialDoctor?.id || initialSchedule?.doctorDbId || initialSchedule?.doctorId || (doctors[0]?.dbId || doctors[0]?.id)
  );

  // Sesi spesifik terpilih jika dibuka dari jadwal tertentu
  const [focusedSchedule, setFocusedSchedule] = useState(initialSchedule || null);

  // Mode Pengaturan Cuti:
  // 'sessions'  : Pilih langsung tanggal-tanggal sesi praktik (misal tgl 12 Rabu, tgl 24 Kamis)
  // 'recurring' : Cuti berulang pada hari tertentu (misal: setiap hari Selasa cuti sampai tgl X)
  // 'range'     : Cuti rentang penuh (misal: cuti melahirkan / haji dari tgl A s/d B)
  const [leaveMode, setLeaveMode] = useState('sessions');

  // Ambil objek dokter aktif
  const activeDoctor = useMemo(() => {
    return (
      doctors.find(d => String(d.dbId || d.id) === String(selectedDoctorId)) ||
      initialDoctor ||
      doctors[0] ||
      null
    );
  }, [doctors, selectedDoctorId, initialDoctor]);

  const doctorDbId = activeDoctor?.dbId || activeDoctor?.id;

  // Jadwal rutin dokter dari doctorSchedules
  const activeDoctorSchedules = useMemo(() => {
    return (doctorSchedules || []).filter(s => {
      return String(s.doctorDbId || s.doctorId) === String(doctorDbId);
    });
  }, [doctorSchedules, doctorDbId]);

  // Hari dinas rutin dokter
  const doctorDayNums = useMemo(() => {
    const set = new Set();
    if (activeDoctor?.schedules && activeDoctor.schedules.length > 0) {
      activeDoctor.schedules.forEach(s => {
        parseDayNumbers(s.day).forEach(n => set.add(n));
      });
    }
    if (activeDoctor?.availableDays && activeDoctor.availableDays.length > 0) {
      parseDayNumbers(activeDoctor.availableDays).forEach(n => set.add(n));
    }
    activeDoctorSchedules.forEach(s => {
      parseDayNumbers(s.day).forEach(n => set.add(n));
    });
    if (set.size === 0 && focusedSchedule?.day) {
      parseDayNumbers(focusedSchedule.day).forEach(n => set.add(n));
    }
    if (set.size === 0) set.add(1); // Fallback Senin
    return Array.from(set).sort((a, b) => a - b);
  }, [activeDoctor, focusedSchedule, activeDoctorSchedules]);

  // Cuti terdaftar untuk dokter ini
  const doctorLeavesList = useMemo(() => {
    return (doctorLeaves || []).filter(l => {
      if (l.status === 'cancelled') return false;
      return String(l.doctor_id) === String(doctorDbId);
    }).sort((a, b) => (a.start_date > b.start_date ? -1 : 1));
  }, [doctorLeaves, doctorDbId]);

  // Cek apakah dokter sedang cuti hari ini
  const activeTodayLeave = useMemo(() => {
    return doctorLeavesList.find(l => {
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
      return s && e && s <= todayStr && todayStr <= e;
    });
  }, [doctorLeavesList, todayStr]);

  // ─────────────────────────────────────────────────────────────
  // GENERATOR SESI PRAKTIK MENDATANG DOKTER INI (Hanya Hari Praktik)
  // ─────────────────────────────────────────────────────────────
  const upcomingDoctorSessions = useMemo(() => {
    if (!activeDoctorSchedules || activeDoctorSchedules.length === 0) {
      // Fallback jika belum ada sesi spesifik di doctorSchedules
      return [];
    }

    const results = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Scan 60 hari ke depan
    for (let i = 0; i < 60; i++) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + i);
      const dayOfWeek = candidate.getDay();
      const dateStr = formatLocalDate(candidate);

      // Cari sesi mana saja yang jatuh pada hari ini
      activeDoctorSchedules.forEach(sch => {
        const schDayNums = parseDayNumbers(sch.day);
        if (schDayNums.includes(dayOfWeek)) {
          const isAlreadyLeave = doctorLeavesList.some(l => {
            const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
            const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
            return s && e && s <= dateStr && dateStr <= e;
          });

          let relativeLabel = '';
          if (i === 0) relativeLabel = 'Hari Ini';
          else if (i === 1) relativeLabel = 'Besok';
          else if (i <= 7) relativeLabel = 'Pekan Ini';
          else if (i <= 14) relativeLabel = 'Pekan Depan';
          else relativeLabel = `${Math.ceil(i / 7)} Pekan Lagi`;

          results.push({
            sessionKey: `${dateStr}_${sch.id}`,
            dateStr,
            dayOfWeek,
            dayName: NUM_TO_DAY_NAME[dayOfWeek],
            formattedDate: candidate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            shortFormattedDate: candidate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short'
            }),
            relativeLabel,
            schedule: sch,
            isAlreadyLeave
          });
        }
      });
    }

    return results;
  }, [activeDoctorSchedules, doctorLeavesList]);

  // State untuk Mode 1: Sesi Terpilih (array of dateStr)
  const [selectedSessionDates, setSelectedSessionDates] = useState([]);

  // State untuk Mode 2: Cuti Berulang Hari Tertentu (misal: Setiap Hari Selasa)
  const [recurringDayNum, setRecurringDayNum] = useState(
    doctorDayNums.length > 0 ? doctorDayNums[0] : 2 // Default Selasa (2) atau hari pertama
  );
  const defaultUntilDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // Default 1 bulan ke depan
    return formatLocalDate(d);
  }, []);
  const [recurringUntilDate, setRecurringUntilDate] = useState(defaultUntilDate);

  // State untuk Mode 3: Cuti Rentang Penuh
  const [rangeStartDate, setRangeStartDate] = useState(todayStr);
  const [rangeEndDate, setRangeEndDate] = useState(todayStr);

  // Form info
  const [reason, setReason] = useState('Cuti Tahunan');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Reset form saat dokter berubah
  useEffect(() => {
    setSelectedSessionDates([]);
    if (doctorDayNums.length > 0) {
      setRecurringDayNum(doctorDayNums[0]);
    }
    setRangeStartDate(todayStr);
    setRangeEndDate(todayStr);
    setReason('Cuti Tahunan');
    setCustomReason('');
    setNotes('');
  }, [selectedDoctorId, todayStr, doctorDayNums]);

  // Toggle tanggal sesi pada Mode 1
  const handleToggleSessionDate = (dateStr) => {
    setSelectedSessionDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  // Preset shortcut pemilihan sesi Mode 1
  const selectNextSessions = (count) => {
    const availableDates = Array.from(new Set(upcomingDoctorSessions.filter(s => !s.isAlreadyLeave).map(s => s.dateStr)));
    setSelectedSessionDates(availableDates.slice(0, count));
  };

  const selectThisWeekSessions = () => {
    const dates = Array.from(new Set(upcomingDoctorSessions.filter(s => (s.relativeLabel === 'Hari Ini' || s.relativeLabel === 'Besok' || s.relativeLabel === 'Pekan Ini') && !s.isAlreadyLeave).map(s => s.dateStr)));
    setSelectedSessionDates(dates);
  };

  const selectNextWeekSessions = () => {
    const dates = Array.from(new Set(upcomingDoctorSessions.filter(s => s.relativeLabel === 'Pekan Depan' && !s.isAlreadyLeave).map(s => s.dateStr)));
    setSelectedSessionDates(dates);
  };

  // Kalkulasi sesi yang terkena cuti berulang (Mode 2)
  const recurringGeneratedSessions = useMemo(() => {
    if (leaveMode !== 'recurring') return [];
    const filtered = upcomingDoctorSessions.filter(s => {
      return s.dayOfWeek === Number(recurringDayNum) && s.dateStr >= todayStr && s.dateStr <= recurringUntilDate;
    });
    // Unik berdasarkan dateStr
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.dateStr)) {
        map.set(s.dateStr, s);
      }
    });
    return Array.from(map.values());
  }, [leaveMode, upcomingDoctorSessions, recurringDayNum, todayStr, recurringUntilDate]);

  // Kalkulasi sesi yang terkena cuti rentang (Mode 3)
  const rangeGeneratedSessions = useMemo(() => {
    if (leaveMode !== 'range') return [];
    if (!rangeStartDate || !rangeEndDate || rangeStartDate > rangeEndDate) return [];
    const filtered = upcomingDoctorSessions.filter(s => {
      return s.dateStr >= rangeStartDate && s.dateStr <= rangeEndDate;
    });
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.dateStr)) {
        map.set(s.dateStr, s);
      }
    });
    return Array.from(map.values());
  }, [leaveMode, upcomingDoctorSessions, rangeStartDate, rangeEndDate]);

  // Hitung target tanggal cuti final yang akan disimpan berdasarkan mode aktif
  const finalTargetDates = useMemo(() => {
    if (leaveMode === 'sessions') {
      return selectedSessionDates.slice().sort();
    }
    if (leaveMode === 'recurring') {
      return recurringGeneratedSessions.map(s => s.dateStr).sort();
    }
    if (leaveMode === 'range') {
      // Pada mode range, kita gunakan langsung rangeStartDate s/d rangeEndDate
      return [];
    }
    return [];
  }, [leaveMode, selectedSessionDates, recurringGeneratedSessions]);

  // Submit Simpan Cuti Dokter
  const handleSaveLeave = async (e) => {
    e.preventDefault();

    let rangesToSubmit = [];

    if (leaveMode === 'sessions') {
      if (selectedSessionDates.length === 0) {
        showToast?.('Silakan pilih minimal satu tanggal sesi praktik dokter yang ingin diliburkan.', 'error');
        return;
      }
      rangesToSubmit = groupConsecutiveDates(selectedSessionDates);
    } else if (leaveMode === 'recurring') {
      if (recurringGeneratedSessions.length === 0) {
        showToast?.(`Tidak ditemukan sesi hari ${NUM_TO_DAY_NAME[recurringDayNum]} dalam rentang waktu sampai ${formatDateIndo(recurringUntilDate)}.`, 'error');
        return;
      }
      const dates = recurringGeneratedSessions.map(s => s.dateStr);
      rangesToSubmit = groupConsecutiveDates(dates);
    } else if (leaveMode === 'range') {
      if (!rangeStartDate || !rangeEndDate) {
        showToast?.('Silakan tentukan tanggal mulai dan selesai cuti.', 'error');
        return;
      }
      if (rangeStartDate > rangeEndDate) {
        showToast?.('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', 'error');
        return;
      }
      rangesToSubmit = [{ start_date: rangeStartDate, end_date: rangeEndDate }];
    }

    const finalReason = reason === 'Lainnya' && customReason.trim() ? customReason.trim() : reason;

    setIsSubmitting(true);
    let successCount = 0;
    let lastError = null;

    try {
      for (const r of rangesToSubmit) {
        const res = await onSetTemporaryLeave({
          doctor_id: Number(doctorDbId),
          doctor_schedule_id: (focusedSchedule?.id) ? Number(focusedSchedule.id) : null,
          start_date: r.start_date,
          end_date: r.end_date,
          reason: finalReason,
          notes: notes.trim(),
          status: 'active'
        });

        if (res?.success) {
          successCount++;
        } else {
          lastError = res?.message;
        }
      }

      if (successCount > 0) {
        const descMsg = leaveMode === 'sessions'
          ? `${selectedSessionDates.length} sesi praktik terpilih`
          : (leaveMode === 'recurring' ? `${recurringGeneratedSessions.length} sesi hari ${NUM_TO_DAY_NAME[recurringDayNum]}` : `${calculateDays(rangeStartDate, rangeEndDate)} hari`);

        showToast?.(`Jadwal cuti ${activeDoctor?.name || 'Dokter'} (${descMsg}) berhasil disimpan.`);
        // Reset pilihan
        setSelectedSessionDates([]);
        setCustomReason('');
        setNotes('');
      } else {
        showToast?.(lastError || 'Gagal menyimpan cuti dokter.', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Terjadi kesalahan sistem saat menyimpan cuti.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batalkan cuti dokter
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Batalkan jadwal cuti ini? Dokter akan otomatis kembali aktif berpraktik pada tanggal tersebut.')) {
      return;
    }

    setDeletingId(leaveId);
    try {
      const res = await onCancelTemporaryLeave(leaveId);
      if (res?.success) {
        showToast?.('Jadwal cuti berhasil dibatalkan. Status dokter kembali aktif normal.');
      } else {
        showToast?.(res?.message || 'Gagal membatalkan cuti.', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Terjadi kesalahan saat membatalkan cuti.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14 animate-in fade-in duration-200">
      
      {/* ── Top Bar: Back & Doctor Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Jadwal</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-900 leading-tight">
              Pengaturan Cuti Praktik Dokter (Fleksibel &amp; Customizable)
            </h1>
            <p className="text-xs text-slate-500">
              Pilih tanggal cuti langsung dari jadwal dinas dokter yang bersangkutan (override SIMRS).
            </p>
          </div>
        </div>

        {/* Doctor Switcher Dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Pilih Dokter:</span>
          <select
            className="w-full sm:w-72 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setFocusedSchedule(null);
            }}
          >
            {doctors.map(d => (
              <option key={d.dbId || d.id} value={d.dbId || d.id}>
                {d.name} — {typeof d.specialty === 'object' ? d.specialty?.name : (d.specialty || 'Spesialis')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Doctor Identity & Status Hero Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Doctor Profile Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <img
              src={formatImageUrl(activeDoctor?.photo || activeDoctor?.photo_url, '/images/default-doctor.svg')}
              alt={activeDoctor?.name}
              onError={(e) => { e.target.src = '/images/default-doctor.svg'; }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-slate-100 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                  {activeDoctor?.name}
                </h2>
                {focusedSchedule && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    <Sparkles size={12} />
                    <span>Fokus: Hari {focusedSchedule.day} ({focusedSchedule.time || `${focusedSchedule.startTime} - ${focusedSchedule.endTime} WIB`})</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
                  {typeof activeDoctor?.specialty === 'object' ? activeDoctor?.specialty?.name : (activeDoctor?.specialty || 'Spesialis')}
                </span>
                <span>•</span>
                <span>SIP: {activeDoctor?.sip || 'SIP Terdaftar'}</span>
                <span>•</span>
                <span>{activeDoctor?.phone || 'RS Naray Hospital'}</span>
              </div>

              {/* Hari Praktik Rutin Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-bold text-slate-500 mr-1">Jadwal Praktik Aktif:</span>
                {doctorDayNums.map(n => (
                  <span
                    key={n}
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {NUM_TO_DAY_NAME[n]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Current Live Status Box */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            activeTodayLeave
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          } min-w-[280px]`}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Status Praktik Hari Ini
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTodayLeave ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  activeTodayLeave ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span>{activeTodayLeave ? 'Sedang Cuti' : 'Aktif Berpraktik'}</span>
              </span>
            </div>

            {activeTodayLeave ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-950">
                  {activeTodayLeave.reason || 'Izin Cuti Dokter'}
                </div>
                <div className="text-xs text-amber-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600 shrink-0" />
                  <span>{formatDateIndo(activeTodayLeave.start_date)} s/d {formatDateIndo(activeTodayLeave.end_date)}</span>
                </div>
                {activeTodayLeave.notes && (
                  <p className="text-[11px] text-amber-700 italic border-l-2 border-amber-300 pl-2">
                    "{activeTodayLeave.notes}"
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleCancelLeave(activeTodayLeave.id)}
                  disabled={deletingId === activeTodayLeave.id}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Check size={13} />
                  <span>Aktifkan Kembali Praktik</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-emerald-700">
                Dokter berpraktik normal melayani pasien. Belum ada catatan cuti untuk hari ini.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ── Mode Selection Tabs (3 Mode Fleksibel Sesuai Keinginan User) ── */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLeaveMode('sessions')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            leaveMode === 'sessions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
          }`}
        >
          <CalendarCheck size={17} />
          <span>Mode 1: Pilih Tanggal Sesi Praktik (Spesifik)</span>
        </button>

        <button
          type="button"
          onClick={() => setLeaveMode('recurring')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            leaveMode === 'recurring'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
          }`}
        >
          <RotateCcw size={17} />
          <span>Mode 2: Cuti Berulang Hari Tertentu (Contoh: Setiap Selasa)</span>
        </button>

        <button
          type="button"
          onClick={() => setLeaveMode('range')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            leaveMode === 'range'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
          }`}
        >
          <CalendarRange size={17} />
          <span>Mode 3: Cuti Rentang Panjang (Cuti Melahirkan / Dinas)</span>
        </button>
      </div>

      {/* ── Main Two Columns Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Left Column: Form Penetapan Cuti Sesuai Mode (7 Cols) ── */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
          
          {/* Header Title per Mode */}
          <div className="pb-4 border-b border-slate-100">
            {leaveMode === 'sessions' && (
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={18} className="text-teal-600" />
                  <span>Pilih Tanggal Sesi Praktik yang Diliburkan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih langsung sesi jadwal dokter yang libur (contoh: Rabu 12 Nov dan Kamis 24 Nov). Tanggal di luar hari dinas dokter tidak akan dimunculkan agar Anda tidak salah pilih.
                </p>
              </div>
            )}

            {leaveMode === 'recurring' && (
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw size={18} className="text-teal-600" />
                  <span>Cuti Berulang pada Hari Tertentu</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Atur agar dokter libur pada hari dinas tertentu secara berulang (contoh: <em>"Setiap hari Selasa dokter cuti sampai 31 Desember 2026"</em>).
                </p>
              </div>
            )}

            {leaveMode === 'range' && (
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange size={18} className="text-teal-600" />
                  <span>Cuti Rentang Panjang (Semua Sesi Dinas)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tentukan rentang tanggal cuti penuh (contoh: cuti tahunan panjang atau cuti dinas luar negeri).
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveLeave} className="space-y-5">
            
            {/* ══════════════════════════════════════════════════════════
                KONTEN MODE 1: PILIH TANGGAL SESI PRAKTIK LANGSUNG
            ══════════════════════════════════════════════════════════ */}
            {leaveMode === 'sessions' && (
              <div className="space-y-4">
                
                {/* Shortcut Presets Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Pilihan Cepat Sesi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectNextSessions(1)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all cursor-pointer"
                    >
                      1 Sesi Terdekat
                    </button>
                    <button
                      type="button"
                      onClick={selectThisWeekSessions}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all cursor-pointer"
                    >
                      Semua Pekan Ini
                    </button>
                    <button
                      type="button"
                      onClick={selectNextWeekSessions}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all cursor-pointer"
                    >
                      Semua Pekan Depan
                    </button>
                    {selectedSessionDates.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSessionDates([])}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                      >
                        Reset Pilihan ({selectedSessionDates.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Sesi Praktik Grid / Kalender Card */}
                {upcomingDoctorSessions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold">
                      Belum ada sesi jadwal rutin untuk dokter ini di SIMRS.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">
                        Klik tanggal sesi di bawah untuk memilih:
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {selectedSessionDates.length} Sesi Terpilih
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1 border border-slate-200/90 rounded-2xl bg-slate-50/50">
                      {upcomingDoctorSessions.map(item => {
                        const isSelected = selectedSessionDates.includes(item.dateStr);

                        return (
                          <div
                            key={item.sessionKey}
                            onClick={() => !item.isAlreadyLeave && handleToggleSessionDate(item.dateStr)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              item.isAlreadyLeave
                                ? 'bg-amber-50/60 border-amber-300 opacity-80 cursor-not-allowed'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                                isSelected ? 'text-teal-100' : 'text-slate-500'
                              }`}>
                                {item.dayName}
                              </span>
                              {isSelected ? (
                                <Check size={14} className="text-white" strokeWidth={3} />
                              ) : item.isAlreadyLeave ? (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                                  Cuti
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  {item.relativeLabel}
                                </span>
                              )}
                            </div>

                            <div className={`font-heading text-sm font-black ${
                              isSelected ? 'text-white' : 'text-slate-900'
                            }`}>
                              {item.shortFormattedDate}
                            </div>

                            <div className={`text-[11px] mt-1 truncate ${
                              isSelected ? 'text-teal-100' : 'text-slate-500'
                            }`}>
                              {item.schedule.time || `${item.schedule.startTime}-${item.schedule.endTime}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sesi Terpilih Summary */}
                {selectedSessionDates.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-teal-600" />
                      <span>{selectedSessionDates.length} Sesi Praktik Siap Diliburkan:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedSessionDates.slice().sort().map(d => (
                        <span key={d} className="px-2 py-0.5 rounded-md bg-white text-teal-950 border border-teal-300 font-semibold text-[11px]">
                          {formatDateIndo(d, true)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                KONTEN MODE 2: CUTI BERULANG HARI TERTENTU (Contoh: Selasa)
            ══════════════════════════════════════════════════════════ */}
            {leaveMode === 'recurring' && (
              <div className="space-y-4">
                
                {/* Pilih Hari Dinas Dokter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Hari Praktik yang Ingin Diliburkan Rutin:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {doctorDayNums.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRecurringDayNum(n)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          Number(recurringDayNum) === n
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {NUM_TO_DAY_NAME[n]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tentukan Batas Akhir Tanggal Cuti Berulang */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Libur Setiap Hari {NUM_TO_DAY_NAME[recurringDayNum]} Sampai Dengan Tanggal:
                    </label>
                    <span className="text-[11px] text-slate-400">Pilih durasi</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {[
                      { label: '2 Pekan', days: 14 },
                      { label: '1 Bulan', days: 30 },
                      { label: '2 Bulan', days: 60 },
                      { label: '3 Bulan', days: 90 },
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + p.days);
                          setRecurringUntilDate(formatLocalDate(d));
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={recurringUntilDate}
                    onChange={e => setRecurringUntilDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                  />
                </div>

                {/* Preview Daftar Sesi yang Otomatis Diliburkan */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-950">
                      Ditemukan {recurringGeneratedSessions.length} Sesi Hari {NUM_TO_DAY_NAME[recurringDayNum]}:
                    </span>
                    <span className="text-[11px] font-extrabold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                      Sampai {formatDateIndo(recurringUntilDate)}
                    </span>
                  </div>

                  {recurringGeneratedSessions.length === 0 ? (
                    <p className="text-xs text-teal-700 italic">
                      Tidak ada sesi praktik hari {NUM_TO_DAY_NAME[recurringDayNum]} dalam periode ini.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {recurringGeneratedSessions.map(s => (
                        <span key={s.dateStr} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-teal-900 border border-teal-200 shadow-2xs">
                          <Check size={12} className="text-teal-600" />
                          <span>{s.dayName}, {s.shortFormattedDate}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                KONTEN MODE 3: CUTI RENTANG PANJANG
            ══════════════════════════════════════════════════════════ */}
            {leaveMode === 'range' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Mulai Cuti <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">{formatDateIndo(rangeStartDate)}</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={rangeStartDate}
                      onChange={e => {
                        setRangeStartDate(e.target.value);
                        if (rangeEndDate < e.target.value) {
                          setRangeEndDate(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Selesai Cuti <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">{formatDateIndo(rangeEndDate)}</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={rangeStartDate}
                      value={rangeEndDate}
                      onChange={e => setRangeEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sesi Praktik yang Terkena Dampak */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-xs text-teal-900 space-y-1.5">
                  <div className="font-bold flex items-center justify-between">
                    <span>Durasi: {calculateDays(rangeStartDate, rangeEndDate)} Hari Kalender</span>
                    <span className="font-extrabold text-teal-700">{rangeGeneratedSessions.length} Sesi Terkena Libur</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                    {rangeGeneratedSessions.map(s => (
                      <span key={s.dateStr} className="px-2 py-0.5 rounded-md bg-white text-teal-950 border border-teal-200 text-[11px] font-semibold">
                        {s.dayName}, {s.shortFormattedDate}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                FORM FIELD: ALASAN CUTI & CATATAN
            ══════════════════════════════════════════════════════════ */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              
              {/* Alasan Cuti */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Alasan Izin / Cuti Dokter <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                >
                  {REASON_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {reason === 'Lainnya' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-slate-700">
                    Keterangan Khusus Alasan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mengisi simposium bedah internasional di Jakarta"
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              )}

              {/* Catatan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pasien darurat dapat dialihkan ke dokter poliklinik rekanan."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (leaveMode === 'sessions' && selectedSessionDates.length === 0)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <CalendarOff size={16} />
                  <span>
                    {isSubmitting
                      ? 'Menyimpan...'
                      : leaveMode === 'sessions'
                      ? `Simpan (${selectedSessionDates.length} Sesi Libur)`
                      : leaveMode === 'recurring'
                      ? `Simpan (${recurringGeneratedSessions.length} Hari ${NUM_TO_DAY_NAME[recurringDayNum]})`
                      : `Simpan Cuti Rentang`}
                  </span>
                </button>
              </div>

            </div>

          </form>
        </div>

        {/* ── Right Column: Jadwal Rutin SIMRS & Riwayat Cuti (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Jadwal Rutin SIMRS (Persis seperti yang diinginkan user) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-teal-600" />
                <h4 className="font-heading text-sm font-bold text-slate-900">
                  Jadwal Praktik Poliklinik (SIMRS)
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {activeDoctorSchedules.length} Sesi Terdaftar
              </span>
            </div>

            {activeDoctorSchedules.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada jadwal praktik rutin untuk dokter ini di SIMRS.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeDoctorSchedules.map(sch => {
                  return (
                    <div
                      key={sch.id}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-center py-1.5 px-2 rounded-xl bg-white text-slate-900 text-xs font-heading font-black border border-slate-200 shadow-2xs shrink-0">
                          {sch.day}
                        </span>
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Clock size={12} className="text-teal-600" />
                            <span>{sch.time || `${sch.startTime} - ${sch.endTime} WIB`}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {sch.room || 'Poliklinik Spesialis'}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Aktif Rutin
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Riwayat & Jadwal Cuti Terdaftar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarOff size={16} className="text-amber-600" />
                <h4 className="font-heading text-sm font-bold text-slate-900">
                  Riwayat &amp; Jadwal Cuti ({doctorLeavesList.length})
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Override Aktif</span>
            </div>

            {doctorLeavesList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-500">Belum ada riwayat cuti</p>
                <p>Dokter berpraktik normal tanpa ada jadwal libur.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {doctorLeavesList.map(item => {
                  const s = typeof item.start_date === 'string' ? item.start_date.slice(0, 10) : '';
                  const e = typeof item.end_date === 'string' ? item.end_date.slice(0, 10) : '';
                  const isCurrent = s && e && s <= todayStr && todayStr <= e;
                  const isUpcoming = s && s > todayStr;
                  const daysCount = calculateDays(item.start_date, item.end_date);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-200'
                          : (isUpcoming ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50 border-slate-200')
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isCurrent
                            ? 'bg-amber-200 text-amber-900'
                            : (isUpcoming ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700')
                        }`}>
                          {isCurrent ? 'Sedang Berlangsung' : (isUpcoming ? 'Akan Datang' : 'Telah Selesai')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCancelLeave(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                          title="Batalkan cuti ini"
                        >
                          <Trash2 size={12} />
                          <span>Batalkan</span>
                        </button>
                      </div>

                      <div className="font-heading text-xs sm:text-sm font-bold text-slate-900 mt-2 flex items-center justify-between">
                        <span>{formatDateIndo(item.start_date)} {item.start_date !== item.end_date && `s/d ${formatDateIndo(item.end_date)}`}</span>
                        <span className="text-[10px] font-semibold text-slate-500">({daysCount} Hari)</span>
                      </div>

                      <div className="text-xs text-slate-600 mt-0.5">
                        Alasan: <strong className="text-slate-800">{item.reason || 'Izin Cuti'}</strong>
                      </div>

                      {item.notes && (
                        <div className="text-[11px] text-slate-500 mt-1 italic bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          Catatan: {item.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
