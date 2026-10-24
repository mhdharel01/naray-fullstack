import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Calendar, Clock, Stethoscope, AlertCircle, CheckCircle2,
  Trash2, ToggleLeft, ToggleRight, CalendarOff, Check, CalendarCheck,
  Filter, Info
} from 'lucide-react';

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

// Fungsi pembantu mengekstrak nomor hari (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
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
  
  // Deteksi rentang hari (contoh: "Senin - Jumat")
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

  // Deteksi koma atau nama hari tunggal
  const set = new Set();
  Object.entries(DAY_NAME_TO_NUM).forEach(([name, num]) => {
    if (str.includes(name)) {
      set.add(num);
    }
  });
  return Array.from(set).sort((a, b) => a - b);
}

// Helper format tanggal lokal YYYY-MM-DD tanpa pergeseran timezone UTC
export function formatLocalDate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Mengelompokkan tanggal terpilih: rentang tanggal berturut-turut, atau tanggal tunggal
export function groupDatesIntoRanges(dateStrings) {
  if (!dateStrings || dateStrings.length === 0) return [];
  const uniqueSorted = Array.from(new Set(dateStrings)).sort();
  const ranges = [];
  let currentStart = uniqueSorted[0];
  let currentEnd = uniqueSorted[0];

  for (let i = 1; i < uniqueSorted.length; i++) {
    const parts = currentEnd.split('-');
    const prevDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    prevDate.setDate(prevDate.getDate() + 1);
    const nextExpectedStr = formatLocalDate(prevDate);
    const currentDateStr = uniqueSorted[i];

    if (currentDateStr === nextExpectedStr) {
      currentEnd = currentDateStr;
    } else {
      ranges.push({ start_date: currentStart, end_date: currentEnd });
      currentStart = currentDateStr;
      currentEnd = currentDateStr;
    }
  }
  ranges.push({ start_date: currentStart, end_date: currentEnd });
  return ranges;
}

// Menghasilkan tanggal sesi praktik mendatang yang HANYA sesuai dengan hari kerja dokter/sesi ini
function getUpcomingScheduleDates(dayNumbers, count = 12) {
  if (!dayNumbers || dayNumbers.length === 0) {
    dayNumbers = [1]; // Fallback ke Senin
  }

  const results = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Scan hingga 90 hari ke depan untuk menemukan tanggal sesi praktik yang valid
  for (let i = 0; i < 90 && results.length < count; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i);
    const dayOfWeek = candidate.getDay();

    if (dayNumbers.includes(dayOfWeek)) {
      const dateStr = formatLocalDate(candidate);
      const dayName = NUM_TO_DAY_NAME[dayOfWeek];
      
      let relativeLabel = '';
      if (i === 0) relativeLabel = 'Hari Ini';
      else if (i === 1) relativeLabel = 'Besok';
      else if (i <= 7) relativeLabel = 'Pekan Ini';
      else if (i <= 14) relativeLabel = 'Pekan Depan';
      else relativeLabel = `${Math.ceil(i / 7)} Pekan Lagi`;

      results.push({
        dateStr,
        dayName,
        dayOfWeek,
        dateObj: candidate,
        formatted: candidate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        shortFormatted: candidate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short'
        }),
        relativeLabel,
        daysAway: i
      });
    }
  }

  return results;
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const cleanStr = String(dateStr).slice(0, 10);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function DoctorScheduleStatusModal({
  isOpen,
  onClose,
  schedule, // Sesi jadwal spesifik yang diklik (bisa null jika diklik dari dokter)
  doctor,   // Data dokter terkait
  doctorLeaves = [],
  onSetTemporaryLeave, // Callback untuk buat cuti/tidak praktik tanggal
  onCancelTemporaryLeave, // Callback untuk membatalkan cuti
  onTogglePermanentStatus, // Callback untuk toggle permanen status sesi
  showToast
}) {
  const todayStr = formatLocalDate(new Date());

  const [mode, setMode] = useState('temporary'); // 'temporary' | 'permanent'
  const [scope, setScope] = useState('all'); // 'all' (semua hari dokter) | 'slot' (hanya sesi jadwal ini)
  const [selectedDateStrs, setSelectedDateStrs] = useState([]);
  const [reason, setReason] = useState('Cuti Tahunan');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cari apakah sesi ini atau dokter ini sedang punya catatan tidak praktik/cuti aktif
  const doctorDbId = schedule?.doctorDbId || schedule?.doctorId || doctor?.dbId || doctor?.id;
  const scheduleDbId = schedule?.dbId || schedule?.id;

  // Ekstrak semua hari kerja rutin dokter ini (contoh: Senin, Rabu, Jumat -> [1, 3, 5])
  const doctorDayNums = useMemo(() => {
    const set = new Set();
    if (doctor?.schedules && doctor.schedules.length > 0) {
      doctor.schedules.forEach(s => {
        parseDayNumbers(s.day).forEach(n => set.add(n));
      });
    }
    if (doctor?.availableDays && doctor.availableDays.length > 0) {
      parseDayNumbers(doctor.availableDays).forEach(n => set.add(n));
    }
    if (set.size === 0 && schedule?.day) {
      parseDayNumbers(schedule.day).forEach(n => set.add(n));
    }
    if (set.size === 0) set.add(1); // Default Senin
    return Array.from(set).sort((a, b) => a - b);
  }, [doctor, schedule]);

  // Ekstrak hari kerja khusus sesi yang dipilih
  const scheduleDayNums = useMemo(() => {
    if (schedule?.day) {
      const parsed = parseDayNumbers(schedule.day);
      if (parsed.length > 0) return parsed;
    }
    return doctorDayNums;
  }, [schedule, doctorDayNums]);

  // Nama-nama hari kerja dokter dalam format teks (contoh: "Senin, Rabu, Jumat")
  const doctorDaysLabel = useMemo(() => {
    return doctorDayNums.map(n => NUM_TO_DAY_NAME[n]).join(', ');
  }, [doctorDayNums]);

  // Hari kerja yang aktif difilter pada kalender pilihan tanggal
  const activeDayNums = useMemo(() => {
    if (scope === 'slot' && scheduleDayNums.length > 0) {
      return scheduleDayNums;
    }
    return doctorDayNums;
  }, [scope, scheduleDayNums, doctorDayNums]);

  // Hasilkan daftar tanggal mendatang yang HANYA jatuh pada hari praktik dokter
  const validUpcomingDates = useMemo(() => {
    return getUpcomingScheduleDates(activeDayNums, 14);
  }, [activeDayNums]);

  // Daftar cuti relevan untuk dokter / sesi ini
  const relevantLeaves = useMemo(() => {
    return (doctorLeaves || []).filter(l => {
      if (l.status === 'cancelled') return false;
      const matchDoctor = String(l.doctor_id) === String(doctorDbId);
      if (!matchDoctor) return false;
      if (l.doctor_schedule_id && scheduleDbId) {
        return String(l.doctor_schedule_id) === String(scheduleDbId);
      }
      return true;
    });
  }, [doctorLeaves, doctorDbId, scheduleDbId]);

  const activeTodayLeave = relevantLeaves.find(l => {
    const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
    const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
    return s && e && s <= todayStr && todayStr <= e;
  });

  const upcomingLeave = relevantLeaves.find(l => {
    const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
    return s && s > todayStr;
  });

  const currentActiveLeave = activeTodayLeave || upcomingLeave;

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Default: jika dibuka dari jadwal spesifik, izinkan filter sesi atau semua
      setScope(schedule?.day ? 'slot' : 'all');
      setReason('Cuti Tahunan');
      setCustomReason('');
      setNotes('');
      setMode('temporary');
    }
  }, [isOpen, schedule]);

  // Ketika daftar tanggal yang valid berubah, pilih tanggal pertama jika belum ada
  useEffect(() => {
    if (isOpen && validUpcomingDates.length > 0) {
      setSelectedDateStrs([validUpcomingDates[0].dateStr]);
    }
  }, [isOpen, validUpcomingDates]);

  if (!isOpen) return null;

  const isScheduleActive = (schedule?.status || 'active') === 'active';
  const hasLeaveException = Boolean(currentActiveLeave);

  // Toggle tanggal sesi praktik
  const handleToggleDateSelection = (dateStr) => {
    if (selectedDateStrs.includes(dateStr)) {
      if (selectedDateStrs.length > 1) {
        setSelectedDateStrs(prev => prev.filter(d => d !== dateStr));
      }
    } else {
      setSelectedDateStrs(prev => [...prev, dateStr]);
    }
  };

  // Preset shortcut pemilihan sesi
  const handleSelectCount = (count) => {
    const subset = validUpcomingDates.slice(0, count).map(d => d.dateStr);
    setSelectedDateStrs(subset);
  };

  // Preset: Pilih 1 Pekan Penuh (seluruh sesi praktik di pekan terdekat)
  const handleSelectOneWeek = () => {
    const count = activeDayNums.length;
    const subset = validUpcomingDates.slice(0, count).map(d => d.dateStr);
    setSelectedDateStrs(subset);
  };

  // Preset: Pilih 2 Pekan
  const handleSelectTwoWeeks = () => {
    const count = activeDayNums.length * 2;
    const subset = validUpcomingDates.slice(0, count).map(d => d.dateStr);
    setSelectedDateStrs(subset);
  };

  // Preset: Pilih 1 Bulan
  const handleSelectOneMonth = () => {
    const count = activeDayNums.length * 4;
    const subset = validUpcomingDates.slice(0, count).map(d => d.dateStr);
    setSelectedDateStrs(subset);
  };

  // Submit set tidak praktik sementara
  const handleSaveTemporaryOff = async (e) => {
    e.preventDefault();
    if (!selectedDateStrs || selectedDateStrs.length === 0) {
      showToast?.('Pilih setidaknya satu tanggal sesi praktik yang diliburkan.', 'error');
      return;
    }

    const ranges = groupDatesIntoRanges(selectedDateStrs);
    const finalReason = reason === 'Lainnya' && customReason.trim() ? customReason.trim() : reason;

    setIsSubmitting(true);
    let successCount = 0;
    let lastError = null;

    try {
      for (const range of ranges) {
        const res = await onSetTemporaryLeave({
          doctor_id: Number(doctorDbId),
          doctor_schedule_id: (scope === 'slot' && scheduleDbId) ? Number(scheduleDbId) : null,
          start_date: range.start_date,
          end_date: range.end_date,
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
        showToast?.(`Jadwal ${schedule?.doctorName || doctor?.name} berhasil diset Tidak Praktik untuk ${selectedDateStrs.length} tanggal sesi terpilih.`);
        onClose();
      } else {
        showToast?.(lastError || 'Gagal menyimpan pengaturan status.', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batalkan cuti & aktifkan kembali sekarang
  const handleReactivateNow = async () => {
    if (!currentActiveLeave?.id) return;
    setIsSubmitting(true);
    try {
      const res = await onCancelTemporaryLeave(currentActiveLeave.id);
      if (res?.success) {
        showToast?.(`Jadwal ${schedule?.doctorName || doctor?.name} kini kembali Aktif Berpraktik.`);
        onClose();
      } else {
        showToast?.(res?.message || 'Gagal mengaktifkan kembali jadwal.', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status permanen
  const handleTogglePermanent = async () => {
    setIsSubmitting(true);
    try {
      const res = await onTogglePermanentStatus(schedule || doctor);
      if (res?.success) {
        showToast?.('Status jadwal berhasil diperbarui.');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-container schedule-status-modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header - Fixed */}
        <div className="admin-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="admin-leave-modal-pill">
              <Stethoscope size={13} />
              <span>Pengaturan Status Praktik Dokter</span>
            </div>
            <h3 className="admin-modal-title">
              {schedule?.doctorName || doctor?.name}
            </h3>
            <p className="admin-modal-subtitle">
              {schedule ? (
                <>
                  Sesi: <strong>Hari {schedule.day}</strong> ({schedule.time || `${schedule.startTime} - ${schedule.endTime} WIB`}) • {schedule.room || 'Poliklinik'}
                </>
              ) : (
                <>
                  Spesialisasi: <strong>{typeof doctor?.specialty === 'object' ? doctor?.specialty?.name : (doctor?.specialty || 'Spesialis')}</strong>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable Area */}
        <div
          className="admin-modal-body"
          style={{
            padding: '20px 24px',
            background: '#F8FAFC',
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0
          }}
        >
          {/* Card Status Saat Ini */}
          <div
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${hasLeaveException || !isScheduleActive ? '#FCD34D' : '#A7F3D0'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', fontWeight: 700 }}>
                Status Sesi Saat Ini:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: hasLeaveException || !isScheduleActive ? '#FEF3C7' : '#ECFDF5',
                    color: hasLeaveException || !isScheduleActive ? '#92400E' : '#065F46'
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: hasLeaveException || !isScheduleActive ? '#D97706' : '#059669'
                    }}
                  />
                  <span>
                    {hasLeaveException
                      ? `Tidak Praktik (${currentActiveLeave.reason || 'Cuti'})`
                      : (!isScheduleActive ? 'Tidak Praktik (Nonaktif Rutin)' : 'Aktif Berpraktik')}
                  </span>
                </span>
              </div>

              {hasLeaveException && (
                <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '6px' }}>
                  📅 Periode Tidak Praktik: <strong>{formatDateIndo(currentActiveLeave.start_date)}</strong> s/d <strong>{formatDateIndo(currentActiveLeave.end_date)}</strong>
                  {currentActiveLeave.notes && <div>Catatan: {currentActiveLeave.notes}</div>}
                </div>
              )}
            </div>

            {/* Quick Reactivate Button if on leave */}
            {hasLeaveException && (
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleReactivateNow}
                disabled={isSubmitting}
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                <Check size={14} />
                <span>Aktifkan Kembali Sekarang</span>
              </button>
            )}
          </div>

          {/* Form Options to Set "Tidak Praktik" */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>
              Ubah Status Praktik:
            </h4>

            {/* Mode Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMode('temporary')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: `1.5px solid ${mode === 'temporary' ? '#0D9488' : '#E2E8F0'}`,
                  background: mode === 'temporary' ? '#F0FDFA' : '#FFFFFF',
                  color: mode === 'temporary' ? '#0F766E' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarOff size={15} color={mode === 'temporary' ? '#0D9488' : '#64748B'} />
                  <span>Tidak Praktik Sementara (Cuti/Izin)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', fontWeight: 400 }}>
                  Pilih tanggal sesi yang diliburkan (otomatis aktif kembali di jadwal berikutnya)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('permanent')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: `1.5px solid ${mode === 'permanent' ? '#0D9488' : '#E2E8F0'}`,
                  background: mode === 'permanent' ? '#F0FDFA' : '#FFFFFF',
                  color: mode === 'permanent' ? '#0F766E' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isScheduleActive ? <ToggleRight size={16} color="#0D9488" /> : <ToggleLeft size={16} color="#64748B" />}
                  <span>Nonaktifkan Rutin (Permanen)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', fontWeight: 400 }}>
                  Matikan jadwal seterusnya sampai diaktifkan manual lagi
                </div>
              </button>
            </div>

            {/* Sub-form: Mode 1 - Tidak Praktik Sementara */}
            {mode === 'temporary' && (
              <form id="schedule-status-form" onSubmit={handleSaveTemporaryOff}>
                
                {/* Banner Penjelasan Jadwal Rutin Dokter */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#0F766E',
                  background: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#0D9488' }} />
                  <div>
                    <div>
                      Jadwal Rutin Dokter: <strong>Hari {doctorDaysLabel}</strong>
                    </div>
                    <div style={{ color: '#047857', fontSize: '0.74rem', marginTop: '2px' }}>
                      Sistem <strong>hanya menampilkan tanggal-tanggal yang memang merupakan hari praktik dokter</strong>. Tanggal di luar hari tersebut otomatis disembunyikan agar Anda tidak keliru meliburkan hari yang bukan jadwalnya.
                    </div>
                  </div>
                </div>

                {/* Filter Scope jika dibuka dari jadwal spesifik */}
                {schedule?.day && doctorDayNums.length > 1 && (
                  <div style={{ marginBottom: '14px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Cakupan Hari yang Diliburkan:
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setScope('slot')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1.5px solid ${scope === 'slot' ? '#0D9488' : '#CBD5E1'}`,
                          background: scope === 'slot' ? '#0D9488' : '#FFFFFF',
                          color: scope === 'slot' ? '#FFFFFF' : '#334155'
                        }}
                      >
                        Khusus Hari {schedule.day} Saja
                      </button>
                      <button
                        type="button"
                        onClick={() => setScope('all')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1.5px solid ${scope === 'all' ? '#0D9488' : '#CBD5E1'}`,
                          background: scope === 'all' ? '#0D9488' : '#FFFFFF',
                          color: scope === 'all' ? '#FFFFFF' : '#334155'
                        }}
                      >
                        Semua Hari Praktik ({doctorDaysLabel})
                      </button>
                    </div>
                  </div>
                )}

                {/* Pemilihan Tanggal Sesi Praktik */}
                <div className="leave-form-field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="leave-label" style={{ margin: 0, fontWeight: 700 }}>
                      Pilih Tanggal Sesi Praktik yang Libur <span className="req">*</span>
                    </label>

                    {/* Presets Pintar Sesuai Hari Rutin Dokter */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectCount(1)}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', color: '#1E293B', fontWeight: 600 }}
                        title="Hanya 1 sesi praktik terdekat"
                      >
                        1 Sesi
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectOneWeek}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', color: '#1E293B', fontWeight: 600 }}
                        title="Semua sesi praktik dalam 1 pekan"
                      >
                        1 Pekan
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectTwoWeeks}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', color: '#1E293B', fontWeight: 600 }}
                        title="Semua sesi praktik dalam 2 pekan"
                      >
                        2 Pekan
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectOneMonth}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', color: '#1E293B', fontWeight: 600 }}
                        title="Semua sesi praktik dalam 1 bulan (4 pekan)"
                      >
                        1 Bulan
                      </button>
                    </div>
                  </div>

                  {/* Grid Tanggal Sesi Praktik Dokter */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                      gap: '8px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      padding: '6px',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      background: '#F8FAFC'
                    }}
                  >
                    {validUpcomingDates.map(item => {
                      const isSelected = selectedDateStrs.includes(item.dateStr);
                      const isAlreadyOff = relevantLeaves.some(l => {
                        const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
                        const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
                        return s && e && s <= item.dateStr && item.dateStr <= e;
                      });

                      return (
                        <div
                          key={item.dateStr}
                          onClick={() => handleToggleDateSelection(item.dateStr)}
                          style={{
                            padding: '9px 10px',
                            borderRadius: '8px',
                            background: isSelected ? '#0D9488' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#1E293B',
                            border: `1.5px solid ${isSelected ? '#0D9488' : '#E2E8F0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            boxShadow: isSelected ? '0 2px 4px rgba(13, 148, 136, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              opacity: isSelected ? 1 : 0.8
                            }}>
                              {item.dayName}
                            </span>
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </div>

                          <strong style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                            {item.shortFormatted}
                          </strong>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.67rem', opacity: isSelected ? 0.9 : 0.65 }}>
                              {item.relativeLabel}
                            </span>
                            {isAlreadyOff && (
                              <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                background: isSelected ? '#FEF3C7' : '#FEF3C7',
                                color: '#92400E',
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}>
                                Cuti
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '7px' }}>
                    Sesi Terpilih: <strong>{selectedDateStrs.length} sesi praktik</strong> ({selectedDateStrs.slice().sort().map(d => formatDateIndo(d)).join(', ') || 'Belum dipilih'})
                  </div>
                </div>

                {/* Alasan Tidak Praktik */}
                <div className="leave-form-field">
                  <label className="leave-label">Alasan Tidak Praktik</label>
                  <select
                    className="leave-select"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  >
                    {REASON_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {reason === 'Lainnya' && (
                  <div className="leave-form-field">
                    <label className="leave-label">Keterangan Khusus *</label>
                    <input
                      type="text"
                      className="leave-input"
                      placeholder="Contoh: Mengisi simposium kedokteran"
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Catatan Tambahan */}
                <div className="leave-form-field">
                  <label className="leave-label">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    className="leave-input"
                    placeholder="Contoh: Pasien dengan rujukan dapat dialihkan ke dokter spesialis pengganti"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, background: '#F1F5F9', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  ℹ️ Dokter hanya berstatus <strong>"Tidak Praktik"</strong> pada tanggal sesi terpilih di atas. Begitu tanggal sesi tersebut terlewati, dokter <strong>otomatis aktif berpraktik kembali di minggu berikutnya</strong> tanpa perlu diubah manual.
                </div>
              </form>
            )}

            {/* Sub-form: Mode 2 - Nonaktif Rutin (Permanen) */}
            {mode === 'permanent' && (
              <div>
                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {isScheduleActive ? (
                    <>
                      Jadwal ini akan <strong>dinonaktifkan secara berkelanjutan</strong> (tutup poliklinik rutin) sampai Anda mengaktifkannya kembali di kemudian hari.
                    </>
                  ) : (
                    <>
                      Jadwal ini saat ini berstatus Nonaktif rutin. Klik tombol di bawah untuk <strong>mengaktifkannya kembali secara permanen</strong>.
                    </>
                  )}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer - Selalu Tampak (Sticky di Bawah) */}
        <div
          className="admin-modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '14px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>

          {mode === 'temporary' ? (
            <button
              type="submit"
              form="schedule-status-form"
              className="admin-btn-primary"
              disabled={isSubmitting || selectedDateStrs.length === 0}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarOff size={15} />
              <span>{isSubmitting ? 'Menyimpan...' : `Simpan (${selectedDateStrs.length} Sesi Tidak Praktik)`}</span>
            </button>
          ) : (
            <button
              type="button"
              className={isScheduleActive ? 'admin-btn-secondary' : 'admin-btn-primary'}
              onClick={handleTogglePermanent}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isScheduleActive ? '#FEF2F2' : undefined,
                color: isScheduleActive ? '#991B1B' : undefined,
                borderColor: isScheduleActive ? '#FECACA' : undefined
              }}
            >
              {isScheduleActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
              <span>{isScheduleActive ? 'Nonaktifkan Sesi Ini Seterusnya' : 'Aktifkan Sesi Ini Seterusnya'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
