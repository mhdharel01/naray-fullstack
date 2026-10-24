import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Calendar, Clock, Trash2, Plus, AlertCircle, CheckCircle2,
  CalendarOff, Check, RotateCcw, CalendarRange, CalendarCheck, Sparkles
} from 'lucide-react';
import { formatImageUrl } from '../context/HospitalDataContext';

const REASON_OPTIONS = [
  'Cuti Tahunan',
  'Seminar / Tugas Medis',
  'Sakit / Pemulihan',
  'Cuti Melahirkan',
  'Keperluan Pribadi / Keluarga',
  'Libur Khusus Poliklinik',
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

function formatLocalDate(dateObj) {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const d1 = parseLocalDate(startDate);
  const d2 = parseLocalDate(endDate);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

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

  const set = new Set();
  Object.entries(DAY_NAME_TO_NUM).forEach(([name, num]) => {
    if (str.includes(name)) {
      set.add(num);
    }
  });
  return Array.from(set).sort((a, b) => a - b);
}

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

export function DoctorLeaveModal({
  isOpen,
  onClose,
  doctors = [],
  doctorSchedules = [],
  doctorLeaves = [],
  presetDoctorId = null,
  onCreateLeave,
  onDeleteLeave,
  showToast
}) {
  const _now = new Date();
  const todayStr = formatLocalDate(_now);

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [leaveMode, setLeaveMode] = useState('sessions'); // 'sessions' | 'recurring' | 'range'

  // Mode 1: Sesi Terpilih
  const [selectedSessionDates, setSelectedSessionDates] = useState([]);

  // Mode 2: Cuti Berulang
  const [recurringDayNum, setRecurringDayNum] = useState(2);
  const defaultUntil = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return formatLocalDate(d);
  }, []);
  const [recurringUntilDate, setRecurringUntilDate] = useState(defaultUntil);

  // Mode 3: Rentang Cuti
  const [rangeStartDate, setRangeStartDate] = useState(todayStr);
  const [rangeEndDate, setRangeEndDate] = useState(todayStr);

  // Form info
  const [reason, setReason] = useState('Cuti Tahunan');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (presetDoctorId) {
        setSelectedDoctorId(String(presetDoctorId));
      } else if (doctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(String(doctors[0].dbId || doctors[0].id));
      }
      setSelectedSessionDates([]);
      setRangeStartDate(todayStr);
      setRangeEndDate(todayStr);
      setReason('Cuti Tahunan');
      setCustomReason('');
      setNotes('');
      setFeedbackMsg(null);
      setLeaveMode('sessions');
    }
  }, [isOpen, presetDoctorId, doctors, todayStr]);

  // Selected doctor object
  const selectedDocObj = useMemo(() => {
    return doctors.find(d => String(d.dbId || d.id) === String(selectedDoctorId));
  }, [doctors, selectedDoctorId]);

  // Jadwal dinas rutin dokter
  const activeDoctorSchedules = useMemo(() => {
    if (!selectedDoctorId) return [];
    return (doctorSchedules || []).filter(s => {
      return String(s.doctorDbId || s.doctorId) === String(selectedDoctorId);
    });
  }, [doctorSchedules, selectedDoctorId]);

  // Nomor hari dinas dokter
  const doctorDayNums = useMemo(() => {
    const set = new Set();
    if (selectedDocObj?.schedules && selectedDocObj.schedules.length > 0) {
      selectedDocObj.schedules.forEach(s => parseDayNumbers(s.day).forEach(n => set.add(n)));
    }
    if (selectedDocObj?.availableDays && selectedDocObj.availableDays.length > 0) {
      parseDayNumbers(selectedDocObj.availableDays).forEach(n => set.add(n));
    }
    activeDoctorSchedules.forEach(s => parseDayNumbers(s.day).forEach(n => set.add(n)));
    if (set.size === 0) set.add(1);
    return Array.from(set).sort((a, b) => a - b);
  }, [selectedDocObj, activeDoctorSchedules]);

  useEffect(() => {
    if (doctorDayNums.length > 0) {
      setRecurringDayNum(doctorDayNums[0]);
    }
  }, [doctorDayNums]);

  // Filter leaves for selected doctor
  const currentDocLeaves = useMemo(() => {
    return (doctorLeaves || []).filter(l => {
      if (l.status === 'cancelled') return false;
      if (!selectedDoctorId) return true;
      return String(l.doctor_id) === String(selectedDoctorId);
    }).sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  }, [doctorLeaves, selectedDoctorId]);

  // Generator sesi praktik mendatang dokter ini
  const upcomingDoctorSessions = useMemo(() => {
    if (!activeDoctorSchedules || activeDoctorSchedules.length === 0) {
      return [];
    }

    const results = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 45; i++) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + i);
      const dayOfWeek = candidate.getDay();
      const dateStr = formatLocalDate(candidate);

      activeDoctorSchedules.forEach(sch => {
        const schDayNums = parseDayNumbers(sch.day);
        if (schDayNums.includes(dayOfWeek)) {
          const isAlreadyLeave = currentDocLeaves.some(l => {
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
  }, [activeDoctorSchedules, currentDocLeaves]);

  // Sesi berulang Mode 2
  const recurringGeneratedSessions = useMemo(() => {
    if (leaveMode !== 'recurring') return [];
    const filtered = upcomingDoctorSessions.filter(s => {
      return s.dayOfWeek === Number(recurringDayNum) && s.dateStr >= todayStr && s.dateStr <= recurringUntilDate;
    });
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.dateStr)) map.set(s.dateStr, s);
    });
    return Array.from(map.values());
  }, [leaveMode, upcomingDoctorSessions, recurringDayNum, todayStr, recurringUntilDate]);

  // Sesi rentang Mode 3
  const rangeGeneratedSessions = useMemo(() => {
    if (leaveMode !== 'range') return [];
    if (!rangeStartDate || !rangeEndDate || rangeStartDate > rangeEndDate) return [];
    const filtered = upcomingDoctorSessions.filter(s => s.dateStr >= rangeStartDate && s.dateStr <= rangeEndDate);
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.dateStr)) map.set(s.dateStr, s);
    });
    return Array.from(map.values());
  }, [leaveMode, upcomingDoctorSessions, rangeStartDate, rangeEndDate]);

  if (!isOpen) return null;

  const handleToggleSessionDate = (dateStr) => {
    setSelectedSessionDates(prev => {
      if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
      return [...prev, dateStr];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!selectedDoctorId) {
      setFeedbackMsg({ type: 'error', text: 'Silakan pilih dokter spesialis terlebih dahulu.' });
      return;
    }

    let rangesToSubmit = [];

    if (leaveMode === 'sessions') {
      if (selectedSessionDates.length === 0) {
        setFeedbackMsg({ type: 'error', text: 'Silakan pilih minimal satu tanggal sesi praktik yang diliburkan.' });
        return;
      }
      rangesToSubmit = groupConsecutiveDates(selectedSessionDates);
    } else if (leaveMode === 'recurring') {
      if (recurringGeneratedSessions.length === 0) {
        setFeedbackMsg({ type: 'error', text: `Tidak ditemukan sesi hari ${NUM_TO_DAY_NAME[recurringDayNum]} dalam periode ini.` });
        return;
      }
      rangesToSubmit = groupConsecutiveDates(recurringGeneratedSessions.map(s => s.dateStr));
    } else if (leaveMode === 'range') {
      if (!rangeStartDate || !rangeEndDate) {
        setFeedbackMsg({ type: 'error', text: 'Tanggal mulai dan selesai cuti harus diisi.' });
        return;
      }
      if (rangeStartDate > rangeEndDate) {
        setFeedbackMsg({ type: 'error', text: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.' });
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
        const res = await onCreateLeave({
          doctor_id: Number(selectedDoctorId),
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
          ? `${selectedSessionDates.length} sesi praktik`
          : (leaveMode === 'recurring' ? `${recurringGeneratedSessions.length} sesi hari ${NUM_TO_DAY_NAME[recurringDayNum]}` : `${calculateDays(rangeStartDate, rangeEndDate)} hari`);

        setFeedbackMsg({
          type: 'success',
          text: `Cuti untuk ${selectedDocObj?.name || 'Dokter'} (${descMsg}) berhasil dijadwalkan.`
        });
        showToast?.(`Jadwal cuti ${selectedDocObj?.name || 'Dokter'} berhasil disimpan.`);
        // Reset
        setSelectedSessionDates([]);
        setCustomReason('');
        setNotes('');
      } else {
        setFeedbackMsg({ type: 'error', text: lastError || 'Gagal menambahkan jadwal cuti.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm('Batalkan jadwal cuti ini? Dokter akan otomatis kembali aktif pada tanggal tersebut.')) {
      return;
    }
    setDeletingId(leaveId);
    try {
      const res = await onDeleteLeave(leaveId);
      if (res?.success) {
        setFeedbackMsg({ type: 'success', text: 'Jadwal cuti berhasil dibatalkan.' });
        showToast?.('Jadwal cuti berhasil dibatalkan.');
      } else {
        setFeedbackMsg({ type: 'error', text: res?.message || 'Gagal membatalkan cuti.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Gagal membatalkan cuti.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10050] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80">
              <CalendarOff size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800">
                  Override SIMRS
                </span>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  Pengaturan Cuti Praktik Dokter
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih tanggal cuti langsung dari jadwal dinas dokter (fleksibel per tanggal sesi atau berulang).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMsg && (
          <div className={`px-6 py-3 flex items-center justify-between text-xs font-semibold shrink-0 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
              : 'bg-rose-50 text-rose-800 border-b border-rose-100'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Doctor Info Card */}
          {selectedDocObj && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={formatImageUrl(selectedDocObj.photo || selectedDocObj.photo_url, '/images/default-doctor.svg')}
                alt={selectedDocObj.name}
                onError={(e) => { e.target.src = '/images/default-doctor.svg'; }}
                className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-heading text-sm font-bold text-slate-900 truncate">
                  {selectedDocObj.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-teal-700">
                    {typeof selectedDocObj.specialty === 'object' ? selectedDocObj.specialty?.name : (selectedDocObj.specialty || 'Dokter Spesialis')}
                  </span>
                  <span>•</span>
                  <span>{activeDoctorSchedules.length} Sesi Praktik Terdaftar</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setLeaveMode('sessions')}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                leaveMode === 'sessions'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck size={14} />
              <span>Pilih Tanggal Sesi</span>
            </button>

            <button
              type="button"
              onClick={() => setLeaveMode('recurring')}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                leaveMode === 'recurring'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw size={14} />
              <span>Cuti Berulang (Hari Tertentu)</span>
            </button>

            <button
              type="button"
              onClick={() => setLeaveMode('range')}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                leaveMode === 'range'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange size={14} />
              <span>Rentang Panjang</span>
            </button>
          </div>

          {/* Grid 2 Kolom Form vs Riwayat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── Kolom Kiri: Form Input Sesuai Mode (7 Cols) ── */}
            <div className="lg:col-span-7 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. KONTEN MODE 1: PILIH TANGGAL SESI */}
                {leaveMode === 'sessions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Pilih Sesi Praktik yang Diliburkan:
                      </span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {selectedSessionDates.length} Sesi Terpilih
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
                      {upcomingDoctorSessions.map(item => {
                        const isSelected = selectedSessionDates.includes(item.dateStr);

                        return (
                          <div
                            key={item.sessionKey}
                            onClick={() => !item.isAlreadyLeave && handleToggleSessionDate(item.dateStr)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              item.isAlreadyLeave
                                ? 'bg-amber-50/70 border-amber-300 opacity-80 cursor-not-allowed'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-extrabold uppercase ${
                                isSelected ? 'text-teal-100' : 'text-slate-500'
                              }`}>
                                {item.dayName}
                              </span>
                              {isSelected ? (
                                <Check size={12} className="text-white" strokeWidth={3} />
                              ) : item.isAlreadyLeave ? (
                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded-sm">Cuti</span>
                              ) : null}
                            </div>
                            <div className={`font-heading text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {item.formattedDate}
                            </div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                              {item.schedule.time || `${item.schedule.startTime}-${item.schedule.endTime}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. KONTEN MODE 2: CUTI BERULANG HARI TERTENTU */}
                {leaveMode === 'recurring' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                      Pilih Hari Praktik Rutin yang Libur:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {doctorDayNums.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRecurringDayNum(n)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            Number(recurringDayNum) === n
                              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {NUM_TO_DAY_NAME[n]}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Libur Setiap {NUM_TO_DAY_NAME[recurringDayNum]} Sampai Tanggal:
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={recurringUntilDate}
                        onChange={e => setRecurringUntilDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
                      <span className="font-bold">
                        {recurringGeneratedSessions.length} Sesi Hari {NUM_TO_DAY_NAME[recurringDayNum]} Terpilih:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recurringGeneratedSessions.map(s => (
                          <span key={s.dateStr} className="px-1.5 py-0.5 rounded-md bg-white border border-teal-200 font-semibold text-[10px]">
                            {s.shortFormattedDate || s.formattedDate}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. KONTEN MODE 3: RENTANG CUTI */}
                {leaveMode === 'range' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Mulai Cuti *</label>
                      <input
                        type="date"
                        required
                        value={rangeStartDate}
                        onChange={e => setRangeStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Selesai Cuti *</label>
                      <input
                        type="date"
                        required
                        min={rangeStartDate}
                        value={rangeEndDate}
                        onChange={e => setRangeEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Alasan Cuti */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alasan Cuti</label>
                  <select
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  >
                    {REASON_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {reason === 'Lainnya' && (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="text-xs font-bold text-slate-700">Keterangan Khusus Alasan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Menghadiri Seminar Dokter Bedah di Surabaya"
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                )}

                {/* Catatan Tambahan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catatan (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Pasien darurat dialihkan ke dokter poliklinik rekanan."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 resize-none"
                  />
                </div>

                {/* Action Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || (leaveMode === 'sessions' && selectedSessionDates.length === 0)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>
                    {isSubmitting
                      ? 'Menyimpan Cuti...'
                      : leaveMode === 'sessions'
                      ? `Simpan (${selectedSessionDates.length} Sesi Libur)`
                      : leaveMode === 'recurring'
                      ? `Simpan (${recurringGeneratedSessions.length} Hari ${NUM_TO_DAY_NAME[recurringDayNum]})`
                      : `Simpan Cuti Rentang`}
                  </span>
                </button>
              </form>
            </div>

            {/* ── Kolom Kanan: Riwayat Cuti Dokter (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  Daftar Cuti Terdaftar ({currentDocLeaves.length})
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                  {selectedDocObj?.name || 'Dokter'}
                </span>
              </div>

              {currentDocLeaves.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Calendar size={18} />
                  </div>
                  <div className="font-heading text-xs font-bold text-slate-700">
                    Belum Ada Jadwal Cuti
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dokter berpraktik normal tanpa ada jadwal libur yang tercatat.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {currentDocLeaves.map(leave => {
                    const isTodayActive = leave.start_date <= todayStr && todayStr <= leave.end_date;
                    const isUpcoming = leave.start_date > todayStr;
                    const daysCount = calculateDays(leave.start_date, leave.end_date);

                    return (
                      <div
                        key={leave.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isTodayActive
                            ? 'bg-amber-50/70 border-amber-200'
                            : (isUpcoming ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50 border-slate-200')
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isTodayActive
                              ? 'bg-amber-200 text-amber-900'
                              : (isUpcoming ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700')
                          }`}>
                            {isTodayActive ? 'Sedang Cuti' : (isUpcoming ? 'Akan Datang' : 'Selesai')}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDelete(leave.id)}
                            disabled={deletingId === leave.id}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                            title="Batalkan cuti ini"
                          >
                            <Trash2 size={12} />
                            <span>Batalkan</span>
                          </button>
                        </div>

                        <div className="font-heading text-xs font-bold text-slate-900 mt-2 flex items-center justify-between">
                          <span>{formatDateIndo(leave.start_date)} {leave.start_date !== leave.end_date && `s/d ${formatDateIndo(leave.end_date)}`}</span>
                          <span className="text-[10px] font-semibold text-slate-500">({daysCount} Hari)</span>
                        </div>

                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Alasan: <strong className="text-slate-800">{leave.reason || 'Cuti'}</strong>
                        </div>

                        {leave.notes && (
                          <div className="text-[10px] text-slate-500 mt-1 italic bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                            {leave.notes}
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
