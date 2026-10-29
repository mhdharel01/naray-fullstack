import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Filter,
  ChevronRight,
  ChevronLeft,
  Home,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Info,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

// Day mapping helpers
const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const normalizePoliKey = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/^(poliklinik\s+poli|poliklinik|poli)\s+/i, '')
    .replace(/[.\s]+$/g, '')
    .trim();
};

const POLI_SYNONYMS = {
  'paru': ['pulmonologi', 'kedokteran respirasi', 'pulmonologi dan kedokteran respirasi'],
  'pulmonologi': ['paru'],
  'pulmonologi dan kedokteran respirasi': ['paru'],
  'kulit dan kelamin': ['dermatologi dan venereologi', 'dermatologi'],
  'dermatologi dan venereologi': ['kulit dan kelamin', 'kulit & kelamin'],
  'kandungan': ['kebidanan', 'kebidanan & kandungan', 'kebidanan dan kandungan', 'obgyn'],
  'kebidanan & kandungan': ['kandungan', 'obgyn'],
  'kebidanan dan kandungan': ['kandungan', 'obgyn'],
  'kedokteran jiwa': ['psikiatri', 'jiwa'],
  'psikiatri & jiwa': ['kedokteran jiwa', 'jiwa'],
  'saraf': ['neurologi', 'neuro'],
  'neurologi': ['saraf'],
  'anak': ['pediatrik'],
  'jantung dan pembuluh darah': ['jantung'],
  'jantung': ['jantung dan pembuluh darah']
};

const matchDoctorPoliklinik = (doc, targetPoli) => {
  if (!targetPoli || targetPoli === 'Semua' || targetPoli === 'all') return true;
  const targetKey = normalizePoliKey(targetPoli);
  if (!targetKey) return true;

  // Kumpulkan poliklinik dokter dari ruangan jadwal dan polikliniks terdaftar
  const docPoliKeys = [];
  (doc.schedules || []).forEach(s => {
    if (s.room) docPoliKeys.push(normalizePoliKey(s.room));
  });
  if (Array.isArray(doc.polikliniks)) {
    doc.polikliniks.forEach(p => {
      const name = p.name || p;
      if (name) docPoliKeys.push(normalizePoliKey(name));
    });
  }

  // 1. ISOLASI KETAT: Bedah Umum vs Bedah Mulut vs Gigi
  // (Pemisahan eksplisit agar tidak tercampur)
  if (targetKey === 'bedah') {
    return docPoliKeys.includes('bedah') || 
      (!docPoliKeys.some(k => k.includes('bedah mulut')) && normalizePoliKey(doc.specialty) === 'bedah');
  }

  if (targetKey === 'gigi') {
    return docPoliKeys.includes('gigi') || 
      (docPoliKeys.includes('gigi & mulut') && !docPoliKeys.some(k => k.includes('bedah mulut')));
  }

  if (targetKey.includes('bedah mulut')) {
    return docPoliKeys.some(k => k.includes('bedah mulut')) || 
      normalizePoliKey(doc.subSpecialty).includes('bedah mulut') || 
      normalizePoliKey(doc.specialty).includes('bedah mulut');
  }

  // 2. Pencocokan langsung dengan nama poli jadwal / poliklinik terdaftar
  if (docPoliKeys.includes(targetKey)) {
    return true;
  }

  // 3. Pencocokan sinonim resmi
  if (POLI_SYNONYMS[targetKey]) {
    for (const syn of POLI_SYNONYMS[targetKey]) {
      if (docPoliKeys.includes(syn)) return true;
    }
  }

  // 4. Pencocokan ke spesialisasi dokter jika targetKey cocok
  const docSpecKey = normalizePoliKey(doc.specialty);
  const docGroupKey = normalizePoliKey(doc.specialtyGroup);
  if (docSpecKey === targetKey || docGroupKey === targetKey) {
    return true;
  }
  if (POLI_SYNONYMS[targetKey]) {
    for (const syn of POLI_SYNONYMS[targetKey]) {
      if (docSpecKey === syn || docGroupKey === syn) return true;
    }
  }

  return false;
};

const matchDayDoctor = (doc, dayTerm) => {
  // Hanya dokter berstatus aktif yang ditampilkan pada jadwal publik
  if (doc.status === 'inactive') return false;

  const activeSchedules = (doc.schedules || []).filter(s => (s.status || 'active') === 'active');
  // Dokter tanpa jadwal praktik aktif tidak dimunculkan di halaman jadwal
  if (activeSchedules.length === 0) return false;

  // Jika "Semua", tampilkan dokter yang memiliki jadwal aktif
  if (!dayTerm || dayTerm === 'Semua') return true;

  const day = dayTerm.toLowerCase().trim();
  const dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  const dayIdx = dayOrder.indexOf(day);
  const targetDayNum = dayIdx !== -1 ? dayIdx + 1 : null; // 1 = Senin, ..., 7 = Minggu

  return activeSchedules.some(s => {
    // 1. Cocokkan berdasarkan angka day_of_week
    const sDow = Number(s.day_of_week);
    if (targetDayNum !== null && (sDow === targetDayNum || (targetDayNum === 7 && sDow === 0))) {
      return true;
    }

    // 2. Cocokkan nama hari teks
    const sDay = (s.day || '').toLowerCase().trim();
    if (sDay.includes(day)) return true;

    // 3. Cocokkan pola rentang (misal Senin - Sabtu)
    if (sDay.includes('senin - sabtu') && dayIdx <= 5) return true;
    if (sDay.includes('senin - jumat') && dayIdx <= 4) return true;
    if (sDay.includes('senin - minggu') || sDay.includes('setiap hari')) return true;

    if (sDay.includes('-')) {
      const parts = sDay.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const startIdx = dayOrder.indexOf(parts[0]);
        const endIdx = dayOrder.indexOf(parts[1]);
        if (startIdx !== -1 && endIdx !== -1 && dayIdx >= startIdx && dayIdx <= endIdx) {
          return true;
        }
      }
    }
    return false;
  });
};

// Helper untuk menampilkan jam praktik dan hari pelayanan dokter secara tepat
const getDoctorDaySchedule = (doc, targetDay) => {
  const activeSchedules = (doc.schedules || []).filter(s => (s.status || 'active') === 'active');

  if (activeSchedules.length === 0) {
    return {
      time: 'Belum ada jadwal praktik',
      room: doc.specialty ? `Poliklinik ${doc.specialty}` : 'Poliklinik Rawat Jalan',
      practiceDaysText: '',
      hasSchedule: false
    };
  }

  const dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Ringkasan hari praktik aktif (misal "Senin, Rabu, Jumat" atau "Senin s/d Sabtu")
  const getPracticeDaysSummary = () => {
    const daysSet = new Set();
    activeSchedules.forEach(s => {
      const dNum = Number(s.day_of_week);
      if (dNum >= 1 && dNum <= 7) {
        daysSet.add(dayNames[dNum - 1]);
      } else if (dNum === 0) {
        daysSet.add('Minggu');
      } else if (s.day) {
        const lower = s.day.toLowerCase();
        if (lower.includes('senin - sabtu')) {
          ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].forEach(d => daysSet.add(d));
        } else if (lower.includes('senin - jumat')) {
          ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].forEach(d => daysSet.add(d));
        } else if (lower.includes('senin - minggu') || lower.includes('setiap hari')) {
          dayNames.forEach(d => daysSet.add(d));
        } else {
          dayNames.forEach(d => {
            if (lower.includes(d.toLowerCase())) daysSet.add(d);
          });
        }
      }
    });

    const uniqueDays = Array.from(daysSet).sort(
      (a, b) => dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase())
    );

    if (uniqueDays.length === 7) return 'Setiap Hari (Senin - Minggu)';
    if (uniqueDays.length === 6 && !uniqueDays.includes('Minggu')) return 'Senin s/d Sabtu';
    if (uniqueDays.length === 5 && !uniqueDays.includes('Sabtu') && !uniqueDays.includes('Minggu')) return 'Senin s/d Jumat';
    if (uniqueDays.length === 1) return `Hari ${uniqueDays[0]}`;
    if (uniqueDays.length > 0) return uniqueDays.join(', ');
    return 'Sesuai Jadwal';
  };

  const practiceDaysText = getPracticeDaysSummary();

  // Jika memilih hari spesifik (misal Senin)
  if (targetDay && targetDay !== 'Semua') {
    const tDay = targetDay.toLowerCase().trim();
    const dayIdx = dayOrder.indexOf(tDay);
    const targetDayNum = dayIdx !== -1 ? dayIdx + 1 : null;

    const matching = activeSchedules.filter(s => {
      const sDow = Number(s.day_of_week);
      if (targetDayNum !== null && (sDow === targetDayNum || (targetDayNum === 7 && sDow === 0))) return true;
      const sDay = (s.day || '').toLowerCase();
      if (sDay.includes(tDay)) return true;
      if (sDay.includes('senin - sabtu') && dayIdx <= 5) return true;
      if (sDay.includes('senin - jumat') && dayIdx <= 4) return true;
      if (sDay.includes('senin - minggu') || sDay.includes('setiap hari')) return true;
      return false;
    });

    if (matching.length > 0) {
      const sessionTimes = matching
        .map(m => (m.time || '').replace(/\s*WIB/i, '').trim())
        .filter(Boolean);
      const uniqueSessionTimes = Array.from(new Set(sessionTimes));
      const timeFormatted = uniqueSessionTimes.length > 0
        ? `${uniqueSessionTimes.join(' & ')} WIB`
        : (matching[0].time || 'Sesuai Jadwal');

      return {
        time: timeFormatted,
        room: matching[0].room || (doc.specialty ? `Poliklinik ${doc.specialty}` : 'Poliklinik Rawat Jalan'),
        practiceDaysText,
        dayLabel: targetDay,
        hasSchedule: true
      };
    }
  }

  // Jika memilih "Semua Hari"
  const firstActive = activeSchedules[0];
  const allTimes = Array.from(new Set(activeSchedules.map(s => s.time))).filter(Boolean);
  const timeFormatted = allTimes.length === 1
    ? allTimes[0]
    : `${allTimes[0]}${allTimes.length > 1 ? ` (${allTimes.length} sesi waktu)` : ''}`;

  return {
    time: timeFormatted || firstActive.time || 'Sesuai Jadwal Poliklinik',
    room: firstActive.room || (doc.specialty ? `Poliklinik ${doc.specialty}` : 'Poliklinik Rawat Jalan'),
    practiceDaysText,
    dayLabel: practiceDaysText,
    hasSchedule: true
  };
};

export default function DoctorSchedulePage() {
  const { doctors = [], poliklinikList = [], refreshBackendData, isLoadingBackend } = useHospitalData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current day of week in Indonesian
  const getCurrentDayName = () => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || 'Senin';
  };

  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    () => searchParams.get('specialty') || searchParams.get('poli') || ''
  );
  // Default to today's day (e.g. Senin) or from search params
  const [selectedDay, setSelectedDay] = useState(() => searchParams.get('day') || getCurrentDayName());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Pagination States ──
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 cards (2 rows of 3) per page for optimum neatness

  useEffect(() => {
    const k = searchParams.get('keyword');
    const s = searchParams.get('specialty') || searchParams.get('poli');
    const d = searchParams.get('day');
    if (k !== null) setKeyword(k);
    if (s !== null) setSelectedSpecialty(s);
    if (d !== null) setSelectedDay(d);
  }, [searchParams]);

  // Reset pagination to page 1 whenever search, specialty, or day changes
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedSpecialty, selectedDay, itemsPerPage]);

  const updateQueryParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else p.delete(key);
    setSearchParams(p, { replace: true });
  };

  const handleSelectDay = (dayName) => {
    setSelectedDay(dayName);
    updateQueryParam('day', dayName);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshBackendData) {
        await refreshBackendData(true);
      }
    } catch (e) {
      console.warn('Gagal memuat ulang data:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Total dokter berstatus aktif yang memiliki jadwal praktik
  const totalActiveDoctorsCount = useMemo(() => {
    return doctors.filter(
      doc => (doc.status || 'active') === 'active' && (doc.schedules || []).some(s => (s.status || 'active') === 'active')
    ).length;
  }, [doctors]);

  // Helper to count doctors available on each day
  const dayDoctorCounts = useMemo(() => {
    const counts = {};
    DAY_ORDER.forEach(day => {
      counts[day] = doctors.filter(doc => matchDayDoctor(doc, day)).length;
    });
    return counts;
  }, [doctors]);

  const poliklinikOptions = useMemo(() => {
    const list = [];
    const seen = new Set();

    const addPoli = (rawName, id) => {
      if (!rawName) return;
      let clean = String(rawName).trim().replace(/[.\s]+$/g, '');
      if (!clean.toLowerCase().startsWith('poli')) {
        clean = `Poli ${clean}`;
      }
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: id || key, name: clean });
      }
    };

    (poliklinikList || []).forEach(p => {
      addPoli(p.name, p.id || p.dbId);
    });

    (doctors || []).forEach(d => {
      (d.schedules || []).forEach(s => {
        if (s.room) addPoli(s.room);
      });
    });

    return list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [poliklinikList, doctors]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Hanya tampilkan dokter aktif yang memiliki jadwal praktik aktif
      if (doc.status === 'inactive') return false;
      const hasActive = (doc.schedules || []).some(s => (s.status || 'active') === 'active');
      if (!hasActive) return false;

      const matchKeyword =
        !keyword ||
        doc.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(keyword.toLowerCase()) ||
        doc.subSpecialty?.toLowerCase().includes(keyword.toLowerCase());

      const matchSpecialty = matchDoctorPoliklinik(doc, selectedSpecialty);
      const matchDay = matchDayDoctor(doc, selectedDay);

      return matchKeyword && matchSpecialty && matchDay;
    });
  }, [doctors, keyword, selectedSpecialty, selectedDay]);

  // ── Pagination Computations ──
  const effectiveItemsPerPage = itemsPerPage === -1 ? filteredDoctors.length : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / (effectiveItemsPerPage || 1)));
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const paginatedDoctors = itemsPerPage === -1 
    ? filteredDoctors 
    : filteredDoctors.slice(startIndex, startIndex + effectiveItemsPerPage);
  const showingStart = filteredDoctors.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + (effectiveItemsPerPage || filteredDoctors.length), filteredDoctors.length);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('doctor-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Doctor photo helper
  const getDoctorPhoto = (doc) => {
    if (doc.photo && 
        !doc.photo.includes('.svg') && 
        !doc.photo.includes('default-doctor') && 
        !doc.photo.includes('SL99Oz3WyX0Wj5ZKUhthIhEg5VlDMqnLDPe685B4')) {
      return doc.photo;
    }
    const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doc.name || '');
    return isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
  };

  // Helper to clean slug
  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        
        {/* ── 1. Breadcrumbs Bar ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Jadwal Dokter &amp; Poliklinik</span>
            </nav>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {totalActiveDoctorsCount} Dokter Spesialis Aktif
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title (Matching Reference Image) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Temukan dokter yang Anda butuhkan
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Pilih hari praktik untuk melihat dokter yang tersedia. Klik kartu dokter untuk membaca profil lengkap dan jadwal mingguan.
            </p>
          </div>
        </div>

        {/* ── 3. Search Bar & Filter Controls Container ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama dokter atau poliklinik..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  updateQueryParam('keyword', e.target.value);
                }}
                className="w-full h-12 pl-11 pr-4 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:bg-slate-50/50 outline-none transition-all font-medium"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Poliklinik Select Dropdown */}
            <div className="md:w-72 shrink-0">
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  updateQueryParam('specialty', e.target.value);
                }}
                className="w-full h-12 px-4 rounded-xl text-xs sm:text-sm text-slate-700 bg-transparent focus:bg-slate-50/50 outline-none cursor-pointer font-medium appearance-none"
              >
                <option value="">Semua Poliklinik</option>
                {poliklinikOptions.map((p) => (
                  <option key={p.id || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Schedule Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui jadwal'}</span>
            </button>
          </div>

          {/* ── 4. Yellow Notice Alert Box (Matching Reference Image) ── */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3 my-6 shadow-2xs">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal m-0">
              <strong>Informasi cuti tetap ditampilkan.</strong> Kartu bertanda cuti merupakan jadwal dokter yang tidak melayani pada hari tersebut minggu ini, tetapi tetap ditampilkan sebagai pemberitahuan kepada pasien.
            </p>
          </div>

          {/* ── 5. Day Filter Pills Row (Matching Reference Image: [Senin 23] [Selasa 22] ...) ── */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter Hari Praktik">
            {/* Opsi Semua Hari */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedDay === 'Semua'}
              onClick={() => handleSelectDay('Semua')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedDay === 'Semua'
                  ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-medium'
              }`}
            >
              <span>Semua Hari</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                selectedDay === 'Semua' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {totalActiveDoctorsCount}
              </span>
            </button>

            {/* Senin s/d Minggu */}
            {DAY_ORDER.map((dayName) => {
              const isActive = selectedDay === dayName;
              const count = dayDoctorCounts[dayName] || 0;

              return (
                <button
                  key={dayName}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectDay(dayName)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20 scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-medium'
                  }`}
                >
                  <span>{dayName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Anchor for smooth scroll on pagination change */}
          <div id="doctor-grid-start" className="scroll-mt-28" />

          {/* ── 6. Section Sub-header & Legend Bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-10 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                {selectedDay === 'Semua' ? 'SELURUH DOKTER' : 'JADWAL HARI INI'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedDay === 'Semua' ? 'Semua Jadwal Dokter Spesialis' : selectedDay}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Menampilkan <strong>{showingStart}-{showingEnd}</strong> dari <strong>{filteredDoctors.length}</strong> dokter yang tersedia
                {selectedDay !== 'Semua' && ` pada hari ${selectedDay}`}
              </p>
            </div>

            {/* Status Legend Indicator (Matching Reference Image) */}
            <div className="flex items-center gap-4 text-xs font-bold shrink-0">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Praktik</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Cuti</span>
              </span>
            </div>
          </div>

          {/* ── 7. Doctor Cards Grid (3 Columns on Large Screen) ── */}
          {isLoadingBackend && doctors.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs animate-pulse flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                        <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-11 bg-slate-100 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : paginatedDoctors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
                {paginatedDoctors.map((doc) => {
                  const photoSrc = getDoctorPhoto(doc);
                  const schedule = getDoctorDaySchedule(doc, selectedDay);
                  const targetSlug = doc.slug || toSlug(doc.name) || doc.id;

                  return (
                    <Link
                      key={doc.id}
                      to={`/dokter/${targetSlug}`}
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer no-underline"
                    >
                      <div>
                        {/* Top Row: Avatar + Name + Specialty + Status Pill */}
                        <div className="flex items-start gap-4 mb-5">
                          <img
                            src={photoSrc}
                            alt={`Foto ${doc.name}`}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover object-top border border-slate-100 bg-slate-100 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doc.name || '');
                              e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-1">
                                {doc.name}
                              </h3>

                              {/* Status Pill Badge (PRAKTIK vs CUTI DARI DB OVERRIDE) */}
                              <span className={`shrink-0 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider border flex items-center gap-1.5 ${
                                doc.isOnLeave
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${doc.isOnLeave ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span>{doc.isOnLeave ? 'SEDANG CUTI' : 'PRAKTIK'}</span>
                              </span>
                            </div>

                            <span className="block text-teal-600 font-bold text-xs capitalize mt-1 truncate">
                              {doc.specialtyGroup || doc.specialty}
                            </span>

                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5 truncate">
                              <MapPin size={12} className="shrink-0 text-teal-600" />
                              <span className="truncate font-medium">{schedule.room || 'Poliklinik Rawat Jalan'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Row: Clock & Service Hours & Practice Days */}
                        <div className="py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-100/90 flex flex-col gap-1.5 text-xs mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                              <Clock size={15} className="text-teal-600 shrink-0" />
                              <span>{schedule.time}</span>
                            </div>
                            <span className="text-slate-400 font-medium">Jadwal pelayanan</span>
                          </div>

                          {/* Tampilkan Hari Praktik Khusus jika sedang melihat 'Semua Hari' */}
                          {selectedDay === 'Semua' && schedule.practiceDaysText && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 pt-1.5 border-t border-slate-200/60">
                              <Calendar size={13} className="text-teal-600 shrink-0" />
                              <span className="truncate">Hari Praktik: <strong>{schedule.practiceDaysText}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Quote Bubble / Leave Alert with Date & Reason */}
                      <div className="pt-2">
                        {doc.isOnLeave ? (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                            <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wide">
                                Cuti s/d {doc.currentLeave?.end_date ? new Date(doc.currentLeave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Selesai'}
                              </span>
                              <p className="text-amber-800 text-[11px] m-0 mt-0.5 font-normal leading-snug">
                                {doc.currentLeave?.reason ? `${doc.currentLeave.reason}. ` : ''}
                                Jadwal tetap ditampilkan sebagai referensi setelah masa cuti.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100/80 text-slate-600 text-xs leading-relaxed italic group-hover:bg-teal-50/80 transition-colors">
                            &ldquo;{doc.bio ? (doc.bio.length > 85 ? doc.bio.slice(0, 85) + '...' : doc.bio) : 'Mendampingi keluarga memahami kesehatan dengan bahasa yang mudah.'}&rdquo;
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ── 8. Responsive Pagination Controls Bar ── */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Left: Summary & Items Per Page Selector */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                  <span>
                    Menampilkan <strong>{showingStart} - {showingEnd}</strong> dari <strong>{filteredDoctors.length}</strong> dokter
                  </span>
                  
                  <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                    <span className="text-slate-400 text-xs">Per halaman:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value={6}>6 dokter</option>
                      <option value={9}>9 dokter</option>
                      <option value={12}>12 dokter</option>
                      <option value={-1}>Semua</option>
                    </select>
                  </div>
                </div>

                {/* Right: Page Navigation Buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5" aria-label="Navigasi Halaman">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Page Number Pills */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;

                      // Display logic for many pages: show first, last, and current +/- 1
                      if (
                        totalPages > 5 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Stethoscope size={30} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                Tidak ada dokter yang cocok dengan filter
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Tidak ditemukan dokter untuk hari &quot;{selectedDay}&quot; dengan kriteria pencarian saat ini. Silakan pilih hari lain atau reset filter pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setSelectedSpecialty('');
                  setSelectedDay('Semua');
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Tampilkan Semua Dokter</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </PageLayout>
  );
}
