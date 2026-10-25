import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Search, 
  Calendar, 
  RefreshCw, 
  Info, 
  ChevronLeft,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function SurgerySchedulePage() {
  const { simrsSurgeryData, refreshSurgeryData, doctors = [], isLoadingBackend } = useHospitalData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper untuk menentukan nama hari hari ini dalam bahasa Indonesia
  const getCurrentDayName = () => {
    const dayIndex = new Date().getDay(); // 0 is Sunday
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || 'Senin';
  };

  const [keyword, setKeyword] = useState(() => searchParams.get('q') || '');
  const [selectedDay, setSelectedDay] = useState(() => searchParams.get('day') || 'Semua');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 kartu per halaman (2 baris x 3 kolom)

  // Ambil data jadwal operasi dari SIMRS feed
  const rawList = useMemo(() => {
    if (Array.isArray(simrsSurgeryData?.jadwal_operasi)) {
      return simrsSurgeryData.jadwal_operasi;
    }
    if (Array.isArray(simrsSurgeryData?.data?.jadwal_operasi)) {
      return simrsSurgeryData.data.jadwal_operasi;
    }
    return [];
  }, [simrsSurgeryData]);

  // Helper untuk membaca nama hari dari string tanggal (contoh: "23/10/2026 09:00" atau "2026-10-23")
  const getDayNameFromDateStr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.trim().split(/[\/\-\s:]/);
      let d = null;
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          // DD/MM/YYYY
          d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
      if (d && !isNaN(d.getTime())) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[d.getDay()] || '';
      }
    } catch (e) {
      // Fallback silent
    }
    return '';
  };

  // Hitung jumlah operasi per hari untuk counter pada pills
  const daySurgeryCounts = useMemo(() => {
    const counts = {};
    DAY_ORDER.forEach(day => { counts[day] = 0; });
    
    rawList.forEach(item => {
      const day = getDayNameFromDateStr(item.tanggal);
      if (day && counts[day] !== undefined) {
        counts[day] += 1;
      }
    });
    return counts;
  }, [rawList]);

  // Filter operasi berdasarkan pencarian kata kunci & hari
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const doctorName = (item.nama_dokter || item.dokter?.nama || '').toLowerCase();
      const smfName = (item.nama_smf || item.smf?.nama || '').toLowerCase();
      const search = keyword.toLowerCase().trim();

      const matchSearch = !search || doctorName.includes(search) || smfName.includes(search);
      
      const itemDay = getDayNameFromDateStr(item.tanggal);
      const matchDay = selectedDay === 'Semua' || itemDay === selectedDay;

      return matchSearch && matchDay;
    });
  }, [rawList, keyword, selectedDay]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedDay]);

  // Komputasi Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);
  const showingStart = filteredList.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + itemsPerPage, filteredList.length);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('surgery-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshSurgeryData) {
      await refreshSurgeryData(true);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Helper untuk mencocokkan foto dokter
  const getDoctorPhoto = (docName) => {
    if (!docName) return '/images/doctors/doctor-male-default.jpg';
    const cleanName = docName.toLowerCase().replace(/dr\.?\s*/i, '').trim();
    
    const matched = doctors.find(d => {
      const dClean = (d.name || '').toLowerCase().replace(/dr\.?\s*/i, '').trim();
      return dClean.includes(cleanName) || cleanName.includes(dClean);
    });

    if (matched?.photo && !matched.photo.includes('.svg') && !matched.photo.includes('default-doctor')) {
      return matched.photo;
    }

    const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(docName);
    return isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
  };

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
              <Link to="/layanan-medis" className="hover:text-teal-600">
                Layanan Medis
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Jadwal Operasi</span>
            </nav>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              Instalasi Bedah Sentral (IBS)
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title (Persis Gaya DoctorSchedulePage) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Jadwal Operasi Rumah Sakit
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-3">
              Pilih hari untuk melihat jadwal operasi dokter spesialis dari hari ini dan hari mendatang. Data disinkronkan langsung secara real-time dengan SIMRS Naray Hospital.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SIMRS Real-Time Live
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Periode: Hari ini s/d 14 hari ke depan
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. Search Bar Container (Persis Gaya DoctorSchedulePage) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama dokter atau SMF bedah..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:bg-slate-50/50 outline-none transition-all font-medium"
              />
            </div>

            {/* Refresh Button */}
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

          {/* ── 4. Yellow Notice Alert Box (Persis Gaya DoctorSchedulePage) ── */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3 my-6 shadow-2xs">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal m-0">
              <strong>Transparansi Pelayanan Kamar Bedah.</strong> Jadwal operasi disinkronkan langsung dari SIMRS Naray Hospital. Sesuai ketentuan perlindungan data medis dan UU PDP, identitas nama pasien dirahasiakan ke publik.
            </p>
          </div>

          {/* ── 5. Day Filter Pills Row (Persis Gaya DoctorSchedulePage: [Semua Hari 7] [Senin 2] [Selasa 1] ...) ── */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter Hari Operasi">
            {/* Opsi Semua Hari */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedDay === 'Semua'}
              onClick={() => setSelectedDay('Semua')}
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
                {rawList.length}
              </span>
            </button>

            {/* Senin s/d Minggu */}
            {DAY_ORDER.map((dayName) => {
              const isActive = selectedDay === dayName;
              const count = daySurgeryCounts[dayName] || 0;

              return (
                <button
                  key={dayName}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedDay(dayName)}
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

          {/* Anchor for smooth scroll on pagination */}
          <div id="surgery-grid-start" className="scroll-mt-28" />

          {/* ── 6. Section Sub-header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-10 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                {selectedDay === 'Semua' ? 'SELURUH OPERASI' : `JADWAL HARI ${selectedDay.toUpperCase()}`}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedDay === 'Semua' ? 'Semua Jadwal Operasi Dokter' : `Jadwal Operasi ${selectedDay}`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Menampilkan <strong>{showingStart}-{showingEnd}</strong> dari <strong>{filteredList.length}</strong> jadwal tindakan operasi yang terdaftar
                {selectedDay !== 'Semua' && ` pada hari ${selectedDay}`}
              </p>
            </div>
          </div>

          {/* ── 7. Surgery Cards Grid (Persis Gaya DoctorSchedulePage: 3 Kolom Responsif) ── */}
          {isLoadingBackend && rawList.length === 0 ? (
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
          ) : paginatedList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
                {paginatedList.map((item, idx) => {
                  const doctorName = item.nama_dokter || item.dokter?.nama || 'Dokter Spesialis';
                  const smfName = item.nama_smf || item.smf?.nama || 'Spesialis Bedah';
                  const dateStr = item.tanggal || '-';
                  const photoSrc = getDoctorPhoto(doctorName);

                  return (
                    <div
                      key={idx}
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Row: Avatar Dokter + Nama Dokter + Nama SMF */}
                        <div className="flex items-start gap-4 mb-5">
                          <img
                            src={photoSrc}
                            alt={`Foto ${doctorName}`}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover object-top border border-slate-100 bg-slate-100 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doctorName);
                              e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <span className="block text-teal-600 font-extrabold text-xs uppercase tracking-wider mb-1 font-mono truncate">
                              {smfName}
                            </span>
                            <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                              {doctorName}
                            </h3>
                          </div>
                        </div>

                        {/* Middle Row: Tanggal Pelaksanaan Operasi (Clean & Simple, Tanpa Status) */}
                        <div className="py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Calendar size={15} className="text-teal-600 shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">Tgl Pelaksanaan</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── 8. Pagination Controls (Persis Gaya DoctorSchedulePage) ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 mb-12">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Halaman Selanjutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : rawList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 text-center shadow-xs mb-10">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
                <Activity size={32} />
              </div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Belum Ada Jadwal Operasi Terdaftar
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6 leading-relaxed">
                Data diambil langsung secara <strong>real-time dari API SIMRS</strong> untuk periode <strong>hari ini dan hari mendatang</strong>. Saat ini belum ada antrean tindakan operasi yang dijadwalkan oleh staf bedah/IBS di sistem SIMRS.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Periksa Ulang Data SIMRS'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs mb-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Activity size={32} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800 mb-1">
                Tidak Ada Jadwal Operasi pada Hari {selectedDay}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                Tidak ditemukan rencana tindakan bedah dokter spesialis yang sesuai dengan pilihan hari atau kata kunci pencarian Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDay('Semua');
                  setKeyword('');
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Tampilkan Semua Hari
              </button>
            </div>
          )}

        </div>

      </div>
    </PageLayout>
  );
}
