import React from 'react';
import {
  Building2,
  CalendarOff,
  UserCheck,
  TrendingUp,
  Plus,
  BedDouble,
  ChevronRight,
  CheckCircle,
  Stethoscope,
  Activity,
  Package,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export default function DashboardTab({
  doctorSchedules = [],
  poliklinikList = [],
  activeTodayLeaves = [],
  upcomingLeaves = [],
  doctors = [],
  liveStats = [],
  inpatientRooms = [],
  mcuPackages = [],
  healthArticles = [],
  setActiveTab,
  setLeaveModal,
  handleOpenCreate,
  formatImageUrl
}) {
  const activeDocCount = doctors?.filter(d => (d.status || 'active') === 'active')?.length || doctors?.length || 0;
  const totalSchedules = doctorSchedules?.length || 0;
  const totalLeaves = activeTodayLeaves.length + upcomingLeaves.length;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-300 font-sans">

      {/* ── 1. Executive Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-teal-900/50 shadow-xl shadow-slate-950/10">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Sistem Manajemen Terpadu Naray Hospital</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Pusat Kendali &amp; Operasional Rumah Sakit
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Pantau jadwal dokter SIMRS live, pengaturan cuti mandiri, ketersediaan kamar rawat inap, serta paket kesehatan terkini dalam satu dasbor eksekutif.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => (setLeaveModal ? setLeaveModal({ isOpen: true, doctorId: null }) : setActiveTab('leaves'))}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-heading font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <CalendarOff size={16} />
              <span>Jadwalkan Cuti</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <CalendarDays size={16} className="text-teal-300" />
              <span>Cek Jadwal SIMRS</span>
            </button>
          </div>
        </div>

        {/* Real-time sync badges bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Gateway SIMRS</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-sm font-heading font-bold text-emerald-300">Live Dekago</strong>
            </div>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Jadwal Praktik</span>
            <strong className="text-sm font-heading font-bold text-white mt-0.5 block">{totalSchedules} Sesi Aktif</strong>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Poliklinik</span>
            <strong className="text-sm font-heading font-bold text-white mt-0.5 block">{poliklinikList?.length || 13} Unit Spesialis</strong>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Override Status</span>
            <strong className="text-sm font-heading font-bold text-teal-300 mt-0.5 block">Web MySQL Aktif</strong>
          </div>
        </div>
      </div>

      {/* ── 2. Live Notification Banner: Cuti Dokter Hari Ini (Override Publik) ── */}
      {activeTodayLeaves.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                <CalendarOff size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-heading font-black text-base text-amber-950">
                    Pemberitahuan: {activeTodayLeaves.length} Dokter Sedang Cuti Hari Ini
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    Live Web Override
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                  Status dokter pada kartu website otomatis dialihkan menjadi <strong>Sedang Cuti</strong> sehingga pasien terhindar dari ketidaksesuaian kedatangan ke rumah sakit.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeTodayLeaves.map(l => {
                    const doc = doctors.find(d => String(d.id || d.dbId) === String(l.doctor_id));
                    return (
                      <span
                        key={l.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-heading font-bold text-amber-950 shadow-2xs"
                      >
                        <UserCheck size={14} className="text-amber-600" />
                        <span>{doc?.name || `Dokter ID #${l.doctor_id}`}</span>
                        <span className="font-normal text-amber-700">
                          (s/d {new Date(l.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-heading font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer shrink-0 self-start lg:self-center"
              onClick={() => setActiveTab('leaves')}
            >
              <CalendarOff size={16} />
              <span>Kelola Cuti</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* ── 3. High-Impact Operational KPI Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {liveStats.map((s, i) => (
          <div
            key={i}
            className="group bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${s.color}15`, color: s.color }}
              >
                <s.icon size={22} />
              </div>
              <div
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  s.positive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s.positive && <TrendingUp size={12} />}
                <span>{s.change}</span>
              </div>
            </div>

            <div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {s.value}
              </div>
              <div className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Quick Actions Hub (Clean Toolbar) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-slate-900">
              Aksi Cepat Manajemen
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses pintas untuk menambahkan data baru ke sistem dan website pasien.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70 shrink-0 self-start sm:self-auto">
            CRUD Terpusat
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => (setLeaveModal ? setLeaveModal({ isOpen: true, doctorId: null }) : setActiveTab('leaves'))}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CalendarOff size={16} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-xs text-amber-950">
                + Cuti Dokter
              </strong>
              <span className="text-[11px] text-amber-800/80 leading-tight">Atur izin praktik</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate('article')}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText size={16} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-xs text-slate-900 group-hover:text-teal-900">
                + Artikel Baru
              </strong>
              <span className="text-[11px] text-slate-500 leading-tight">Edukasi &amp; berita</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate('doctor')}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Stethoscope size={16} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-xs text-slate-900 group-hover:text-teal-900">
                + Profil Dokter
              </strong>
              <span className="text-[11px] text-slate-500 leading-tight">Biodata &amp; foto</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate('mcu')}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Package size={16} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-xs text-slate-900 group-hover:text-teal-900">
                + Paket MCU
              </strong>
              <span className="text-[11px] text-slate-500 leading-tight">Pemeriksaan check-up</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate('room')}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BedDouble size={16} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-xs text-slate-900 group-hover:text-teal-900">
                + Tipe Kamar
              </strong>
              <span className="text-[11px] text-slate-500 leading-tight">Fasilitas rawat inap</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 5. Detailed Two-Column Section: Inpatient Rooms & Doctor Leave Monitor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column Left: Kamar Rawat Inap Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <BedDouble size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-none">
                    Kamar Rawat Inap
                  </h3>
                  <span className="text-xs text-slate-400 font-medium mt-1 block">
                    {inpatientRooms?.length || 0} Tipe Kamar Tersedia di Web
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-heading font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                onClick={() => setActiveTab('rooms')}
              >
                <span>Kelola Kamar</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {inpatientRooms && inpatientRooms.length > 0 ? (
                inpatientRooms.slice(0, 6).map((r, i) => (
                  <div
                    key={r.id || i}
                    className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-teal-50/50 border border-slate-200/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <strong className="block font-heading font-bold text-xs text-slate-900 truncate">
                        {r.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                        {r.capacity ? `${r.capacity} • ` : ''}
                        {r.price || r.pricePerNight || 'Hubungi Admin'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0">
                      {Array.isArray(r.facilities) ? `${r.facilities.length} Fasilitas` : 'Lengkap'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                  Belum ada data kamar rawat inap.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Terhubung langsung ke tampilan kamar pasien</span>
            <button
              type="button"
              onClick={() => handleOpenCreate('room')}
              className="text-xs font-heading font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Tambah Kamar</span>
            </button>
          </div>
        </div>

        {/* Column Right: Doctor Leaves & Overrides */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <CalendarOff size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-none">
                    Status Cuti Dokter
                  </h3>
                  <span className="text-xs text-slate-400 font-medium mt-1 block">
                    Override Jadwal SIMRS Real-time
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-heading font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                onClick={() => setActiveTab('leaves')}
              >
                <span>Semua Cuti</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4">
              {activeTodayLeaves.length === 0 && upcomingLeaves.length === 0 ? (
                <div className="text-center py-8 px-4 bg-teal-50/40 rounded-2xl border border-teal-100/60">
                  <CheckCircle size={32} className="text-teal-600 mx-auto mb-2" />
                  <strong className="text-sm font-heading font-bold text-slate-900 block">
                    Seluruh Dokter Bertugas Normal
                  </strong>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Tidak ada dokter yang sedang cuti atau berhalangan hadir saat ini.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-heading font-bold shadow-xs transition-colors mt-3 cursor-pointer"
                    onClick={() => (setLeaveModal ? setLeaveModal({ isOpen: true, doctorId: null }) : setActiveTab('leaves'))}
                  >
                    <Plus size={14} />
                    <span>+ Jadwalkan Cuti</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...activeTodayLeaves, ...upcomingLeaves].slice(0, 4).map(l => {
                    const doc = doctors.find(d => String(d.id || d.dbId) === String(l.doctor_id));
                    const isToday = activeTodayLeaves.some(at => at.id === l.id);
                    return (
                      <div
                        key={l.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                          isToday
                            ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                            : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              formatImageUrl
                                ? formatImageUrl(doc?.photo || doc?.photo_url, '/images/default-doctor.svg')
                                : doc?.photo || doc?.photo_url || '/images/default-doctor.svg'
                            }
                            alt={doc?.name || 'Dokter'}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                            onError={e => { e.target.src = '/images/default-doctor.svg'; }}
                          />
                          <div className="min-w-0">
                            <strong className="block font-heading font-bold text-xs truncate">
                              {doc?.name || `Dokter ID #${l.doctor_id}`}
                            </strong>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {isToday ? 'Sedang Cuti' : 'Cuti Terjadwal'}: s/d{' '}
                              {new Date(l.end_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}{' '}
                              ({l.reason})
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isToday ? 'bg-amber-500 text-white' : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {isToday ? 'Hari Ini' : 'Mendatang'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total {totalLeaves} jadwal cuti terdata</span>
            <button
              type="button"
              onClick={() => (setLeaveModal ? setLeaveModal({ isOpen: true, doctorId: null }) : setActiveTab('leaves'))}
              className="text-xs font-heading font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Tambah Cuti</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
