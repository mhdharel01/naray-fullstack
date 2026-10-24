import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Stethoscope,
  CalendarDays,
  CalendarOff,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Clock,
  RotateCcw,
  Building2,
  Activity,
  Info,
  CalendarCheck,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  GraduationCap,
  FileText,
  Check
} from 'lucide-react';

export default function DoctorsTab({
  // Active navigation
  activeTab = 'doctors',
  setActiveTab,

  // Doctor list and filters
  doctors = [],
  poliklinikList = [],
  specializationsList = [],
  searchQuery = '',
  setSearchQuery,
  doctorFilterPoli = 'all',
  setDoctorFilterPoli,
  doctorFilterSpecialization = 'all',
  setDoctorFilterSpecialization = () => {},
  doctorFilterStatus = 'all',
  setDoctorFilterStatus = () => {},
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  handleToggleDoctor,

  // Schedule list and actions
  doctorSchedules = [],
  handleOpenCreateSchedule,
  handleOpenEditSchedule,

  // Leave list and actions
  doctorLeaves = [],
  activeTodayLeaves = [],
  upcomingLeaves = [],
  todayYMD = '',
  adminDeleteDoctorLeave,

  // Dialog & Toast helpers
  setLeaveModal,
  openDoctorStatusPage,
  showToast,
  formatImageUrl
}) {
  // ── State Halaman Detail Khusus Dokter ──
  // Jika selectedDoctorId bernilai null -> Menampilkan Halaman Direktori Master Dokter
  // Jika selectedDoctorId terisi ID -> Menampilkan Halaman Khusus Detail Dokter tersebut 100%
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Jika activeTab dari luar adalah 'leaves', otomatis set filter status ke dokter cuti
  useEffect(() => {
    if (activeTab === 'leaves' && setDoctorFilterStatus) {
      setDoctorFilterStatus('leave');
    }
  }, [activeTab, setDoctorFilterStatus]);

  // Cari objek dokter yang sedang dibuka detailnya
  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find(d => String(d.id || d.dbId) === String(selectedDoctorId)) || null;
  }, [doctors, selectedDoctorId]);

  // ── Helper Pemformat Hari & Tanggal ──
  const formatDaysDisplay = (days = []) => {
    if (!days || days.length === 0) return null;
    if (days.length === 5 && days.includes('Senin') && days.includes('Jumat') && !days.includes('Sabtu') && !days.includes('Minggu')) {
      return 'Senin – Jumat';
    }
    if (days.length === 6 && days.includes('Senin') && days.includes('Sabtu') && !days.includes('Minggu')) {
      return 'Senin – Sabtu';
    }
    if (days.length === 7) return 'Setiap Hari';
    const shortMap = {
      Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', Jumat: 'Jum', Sabtu: 'Sab', Minggu: 'Min'
    };
    return days.map(d => shortMap[d] || d).join(', ');
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr).slice(5, 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return String(dateStr).slice(5, 10);
    }
  };

  const formatDateIndo = (dStr) => {
    if (!dStr) return '-';
    try {
      return new Date(dStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = new Date(end) - new Date(start);
    const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  // Metrik Ringkasan untuk Direktori
  const activeDoctorsCount = doctors.filter(d => (d.status || 'active') === 'active' && !d.isOnLeave).length;
  const onLeaveDoctorsCount = doctors.filter(d => d.isOnLeave).length;
  const inactiveDoctorsCount = doctors.filter(d => (d.status || 'active') === 'inactive').length;
  const totalSchedulesCount = doctors.reduce((acc, d) => acc + (d.schedules?.length || 0), 0);

  // Status Filter Aktif
  const hasActiveFilters = Boolean(
    searchQuery ||
    doctorFilterPoli !== 'all' ||
    doctorFilterSpecialization !== 'all' ||
    doctorFilterStatus !== 'all'
  );

  const resetFilters = () => {
    if (setSearchQuery) setSearchQuery('');
    if (setDoctorFilterPoli) setDoctorFilterPoli('all');
    if (setDoctorFilterSpecialization) setDoctorFilterSpecialization('all');
    if (setDoctorFilterStatus) setDoctorFilterStatus('all');
  };

  // Filter Dokter di Direktori
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = (searchQuery || '').toLowerCase().trim();
      const matchSearch =
        !q ||
        doc.name?.toLowerCase().includes(q) ||
        (typeof doc.specialty === 'string' && doc.specialty.toLowerCase().includes(q)) ||
        (doc.specialty?.name && doc.specialty.name.toLowerCase().includes(q)) ||
        (doc.specialization?.name && doc.specialization.name.toLowerCase().includes(q)) ||
        (doc.phone && doc.phone.includes(q)) ||
        (doc.email && doc.email.toLowerCase().includes(q)) ||
        (doc.poliklinikName && doc.poliklinikName.toLowerCase().includes(q)) ||
        (Array.isArray(doc.polikliniks) && doc.polikliniks.some(p => p.name?.toLowerCase().includes(q)));

      const matchPoli =
        doctorFilterPoli === 'all' ||
        String(doc.poliklinik_id) === String(doctorFilterPoli) ||
        (typeof doc.specialty === 'string' && doc.specialty.toLowerCase().includes(doctorFilterPoli.toLowerCase())) ||
        (doc.specialty?.name && doc.specialty.name.toLowerCase().includes(doctorFilterPoli.toLowerCase())) ||
        (doc.poliklinikName && doc.poliklinikName.toLowerCase().includes(doctorFilterPoli.toLowerCase())) ||
        (Array.isArray(doc.polikliniks) && doc.polikliniks.some(p =>
          String(p.id) === String(doctorFilterPoli) ||
          p.name?.toLowerCase().includes(doctorFilterPoli.toLowerCase())
        ));

      const matchSpecialization =
        doctorFilterSpecialization === 'all' ||
        String(doc.specialization_id) === String(doctorFilterSpecialization) ||
        String(doc.specialization?.id) === String(doctorFilterSpecialization) ||
        (typeof doc.specialty === 'string' && doc.specialty.toLowerCase() === doctorFilterSpecialization.toLowerCase()) ||
        (doc.specialty?.name && doc.specialty.name.toLowerCase() === doctorFilterSpecialization.toLowerCase()) ||
        (doc.specialization?.name && doc.specialization.name.toLowerCase() === doctorFilterSpecialization.toLowerCase());

      const matchStatus =
        doctorFilterStatus === 'all' ||
        (doctorFilterStatus === 'leave' && doc.isOnLeave) ||
        (doctorFilterStatus === 'active' && (doc.status || 'active') === 'active' && !doc.isOnLeave) ||
        (doctorFilterStatus === 'inactive' && (doc.status || 'active') === 'inactive');

      return matchSearch && matchPoli && matchSpecialization && matchStatus;
    });
  }, [doctors, searchQuery, doctorFilterPoli, doctorFilterSpecialization, doctorFilterStatus]);

  // Handler membatalkan cuti
  const handleCancelLeave = async (leaveId, doctorName) => {
    if (window.confirm(`Batalkan jadwal cuti untuk ${doctorName || 'dokter ini'}? Jadwal SIMRS dokter akan otomatis aktif kembali.`)) {
      try {
        if (adminDeleteDoctorLeave) {
          await adminDeleteDoctorLeave(leaveId);
          if (showToast) showToast('Jadwal cuti berhasil dibatalkan. Status jadwal dinas dokter kembali aktif.');
        }
      } catch (err) {
        if (showToast) showToast('Gagal membatalkan cuti.', 'error');
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: HALAMAN KHUSUS DETAIL DOKTER (DEDICATED DOCTOR DETAIL VIEW)
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedDoctor) {
    const doc = selectedDoctor;
    const docKey = String(doc.id || doc.dbId);

    const specName = typeof doc.specialty === 'object'
      ? doc.specialty?.name || 'Dokter Spesialis'
      : doc.specialty || doc.specialization?.name || 'Dokter Spesialis';

    const assignedPolis = Array.isArray(doc.polikliniks) && doc.polikliniks.length > 0
      ? doc.polikliniks.map(p => p.name)
      : (doc.poliklinikName ? [doc.poliklinikName] : (doc.schedules?.map(s => s.room).filter(Boolean) || []));
    const uniquePolis = Array.from(new Set(assignedPolis));
    const poliDisplay = uniquePolis.length > 0 ? uniquePolis.join(', ') : 'Poliklinik Rawat Jalan';

    const photoSrc = formatImageUrl
      ? formatImageUrl(doc.photo || doc.photo_url, '/images/default-doctor.svg')
      : doc.photo || doc.photo_url || '/images/default-doctor.svg';

    // Ambil jadwal dokter ini dari doctorSchedules / doc.schedules
    const docSchedules = (doctorSchedules || []).filter(s =>
      String(s.doctorDbId || s.doctorId) === String(doc.id || doc.dbId) ||
      (s.doctorName && doc.name && s.doctorName.toLowerCase().trim() === doc.name.toLowerCase().trim())
    );
    const effectiveSchedules = docSchedules.length > 0 ? docSchedules : (doc.schedules || []);

    // Ambil cuti dokter ini dari doctorLeaves
    const docLeaves = (doctorLeaves || []).filter(l =>
      String(l.doctor_id) === String(doc.id || doc.dbId)
    );
    const sortedDocLeaves = [...docLeaves].sort((a, b) => (b.start_date > a.start_date ? 1 : -1));

    const leaveInfo = doc.activeTodayLeave || doc.currentLeave || docLeaves.find(l => {
      if (l.status === 'cancelled' || l.status === 'rejected') return false;
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
      return s && e && s <= todayYMD && todayYMD <= e;
    });
    const leaveEndFormatted = leaveInfo?.end_date ? formatDateShort(leaveInfo.end_date) : '';

    return (
      <div className="space-y-6 animate-in fade-in duration-200 font-sans">
        
        {/* ── Top Navigation / Breadcrumb Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedDoctorId(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Daftar Dokter</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
              <span>Master Dokter</span>
              <ChevronRight size={13} />
              <span className="text-slate-700 font-semibold truncate max-w-[220px]">{doc.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setLeaveModal({ isOpen: true, doctorId: doc.dbId || doc.id })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-heading font-bold border border-amber-200 transition-all cursor-pointer shadow-2xs"
            >
              <CalendarOff size={15} className="text-amber-600" />
              <span>Jadwalkan Cuti</span>
            </button>

            {handleOpenCreateSchedule && (
              <button
                type="button"
                onClick={() => handleOpenCreateSchedule(doc.dbId || doc.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs sm:text-sm font-heading font-bold border border-teal-200 transition-all cursor-pointer shadow-2xs"
              >
                <Plus size={15} className="text-teal-600" />
                <span>Tambah Sesi Jadwal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenEdit('doctor', doc)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Pencil size={14} />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>

        {/* ── Hero Profile Card ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Foto Profil Besar dengan Status Dot */}
              <div className="relative shrink-0">
                <img
                  src={photoSrc}
                  alt={doc.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md bg-slate-100"
                  onError={e => { e.target.src = '/images/default-doctor.svg'; }}
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
                    doc.status !== 'active'
                      ? 'bg-slate-400'
                      : doc.isOnLeave
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  title={
                    doc.status !== 'active'
                      ? 'Nonaktif'
                      : doc.isOnLeave
                      ? 'Sedang Cuti'
                      : 'Aktif Melayani'
                  }
                />
              </div>

              {/* Data Identitas */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {doc.name}
                  </h1>
                  {doc.isOnLeave ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 shadow-2xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Sedang Cuti Hari Ini</span>
                    </span>
                  ) : doc.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300/80 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Praktik Aktif</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Nonaktif</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                    <Stethoscope size={13} className="text-teal-600" />
                    <span>{specName}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <Building2 size={13} className="text-slate-500" />
                    <span>{poliDisplay}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium pl-1">
                    <MapPin size={13} />
                    <span>{doc.branchName || 'Naray Hospital Dumai'}</span>
                  </span>
                </div>

                {/* Kontak Dokter Langsung */}
                <div className="flex items-center gap-4 pt-1 flex-wrap text-xs text-slate-600">
                  {doc.phone && (
                    <a
                      href={`tel:${doc.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 hover:text-teal-700 font-semibold transition-colors"
                      title="Hubungi Telepon / WhatsApp"
                    >
                      <Phone size={13} className="text-teal-600" />
                      <span>{doc.phone}</span>
                    </a>
                  )}
                  {doc.email && (
                    <a
                      href={`mailto:${doc.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-teal-700 transition-colors"
                      title="Kirim Email"
                    >
                      <Mail size={13} className="text-slate-400" />
                      <span>{doc.email}</span>
                    </a>
                  )}
                  {doc.subSpecialty && doc.subSpecialty !== specName && (
                    <span className="text-slate-500">
                      Sub-Spesialisasi: <strong>{doc.subSpecialty}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Toggle Button */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Dokter</span>
              <button
                type="button"
                onClick={() => handleToggleDoctor(doc)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold border cursor-pointer transition-all shadow-2xs ${
                  doc.status === 'active'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                }`}
                title="Klik untuk mengubah status dinas dokter"
              >
                <span className={`w-2 h-2 rounded-full ${doc.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>{doc.status === 'active' ? 'Status: Aktif' : 'Status: Nonaktif'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Grid 2 Kolom Lega: Jadwal SIMRS & Cuti Mandiri ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ══════════════════════════════════════════════════════════
              KOLOM KIRI: JADWAL PRAKTIK POLIKLINIK (SIMRS DEKAGO)
          ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 leading-tight">
                    Jadwal Praktik Poliklinik (SIMRS)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {effectiveSchedules.length} Sesi Rutin Terdaftar
                  </p>
                </div>
              </div>

              {handleOpenCreateSchedule && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateSchedule(doc.dbId || doc.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
                >
                  <Plus size={13} className="text-teal-600" />
                  <span>Tambah Sesi</span>
                </button>
              )}
            </div>

            {/* Edukasi Singkat */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
              <Info size={15} className="text-teal-600 shrink-0 mt-0.5" />
              <span>
                Jadwal ini disinkronkan langsung dari server SIMRS Dekago secara <em>read-only</em>. Jika dokter berhalangan hadir, cukup daftarkan cuti pada kolom kanan.
              </span>
            </div>

            {/* List Sesi Jadwal */}
            {effectiveSchedules.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CalendarDays size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">Belum ada sesi jadwal praktik</p>
                <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan jadwal rutin dokter ini.</p>
                {handleOpenCreateSchedule && (
                  <button
                    type="button"
                    onClick={() => handleOpenCreateSchedule(doc.dbId || doc.id)}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Sesi Pertama</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {effectiveSchedules.map(sch => {
                  const poli = poliklinikList.find(p => String(p.dbId || p.id) === String(sch.poliklinikId));
                  return (
                    <div
                      key={sch.id}
                      className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-center py-1.5 px-2 rounded-xl bg-white text-slate-900 text-xs font-heading font-black border border-slate-200 shadow-2xs shrink-0">
                          {sch.day || 'Senin'}
                        </span>
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Clock size={12} className="text-teal-600" />
                            <span>{sch.time || `${sch.startTime} - ${sch.endTime} WIB`}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {poli?.name || sch.room || 'Poliklinik Rawat Jalan'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Sesi */}
                        {doc.isOnLeave || sch.doctorIsOnLeave ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            Diliburkan (Cuti)
                          </span>
                        ) : sch.status === 'active' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Aktif Rutin
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">
                            Nonaktif
                          </span>
                        )}

                        {handleOpenEditSchedule && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditSchedule(sch)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 cursor-pointer"
                            title="Edit jam atau ruangan"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              KOLOM KANAN: STATUS & RIWAYAT CUTI MANDIRI (OVERRIDE SIMRS)
          ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                  <CalendarOff size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 leading-tight">
                    Pengaturan Cuti Mandiri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sortedDocLeaves.length} Catatan Izin / Libur
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLeaveModal({ isOpen: true, doctorId: doc.dbId || doc.id })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>+ Jadwalkan Cuti</span>
              </button>
            </div>

            {/* Status Kehadiran Hari Ini */}
            {doc.isOnLeave && leaveInfo ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 font-heading font-black text-xs text-amber-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Sedang Dalam Masa Cuti Hari Ini</span>
                  </div>
                  <div className="text-xs text-amber-900 font-bold">
                    {formatDateIndo(leaveInfo.start_date)} s/d {formatDateIndo(leaveInfo.end_date)} ({calculateDays(leaveInfo.start_date, leaveInfo.end_date)} Hari)
                  </div>
                  <div className="text-xs text-amber-800">
                    Alasan: <strong>{leaveInfo.reason || 'Cuti Dokter'}</strong>
                    {leaveInfo.notes && <span> • Catatan: {leaveInfo.notes}</span>}
                  </div>
                  <div className="text-[11px] text-amber-700/80 pt-1">
                    ✓ Jadwal dokter otomatis diliburkan di portal pasien Naray Hospital.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCancelLeave(leaveInfo.id, doc.name)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Batalkan cuti ini dan aktifkan jadwal dokter kembali"
                >
                  <Trash2 size={13} />
                  <span>Batalkan Cuti</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    Dokter tidak sedang cuti hari ini. Jadwal praktik aktif melayani pasien normal.
                  </span>
                </div>
              </div>
            )}

            {/* Riwayat / Daftar Cuti Dokter Ini */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Riwayat &amp; Jadwal Cuti Dokter
              </span>

              {sortedDocLeaves.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200/70">
                  Belum ada riwayat cuti yang tercatat untuk dokter ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {sortedDocLeaves.map(leave => {
                    const s = typeof leave.start_date === 'string' ? leave.start_date.slice(0, 10) : '';
                    const e = typeof leave.end_date === 'string' ? leave.end_date.slice(0, 10) : '';
                    const isCurrent = s && e && s <= todayYMD && todayYMD <= e;
                    const isUpcoming = s && s > todayYMD;
                    const dur = calculateDays(leave.start_date, leave.end_date);

                    return (
                      <div
                        key={leave.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800">
                            {formatDateIndo(leave.start_date)} {leave.start_date !== leave.end_date && ` s/d ${formatDateIndo(leave.end_date)}`}
                            <span className="font-normal text-slate-400 ml-1.5">({dur} Hari)</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {leave.reason || 'Izin Medis'} {leave.notes && `• ${leave.notes}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCurrent
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : isUpcoming
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {isCurrent ? 'Sedang Berlangsung' : isUpcoming ? 'Mendatang' : 'Riwayat'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCancelLeave(leave.id, doc.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Batalkan / Hapus cuti"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Biodata & Kualifikasi Tambahan ── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-heading font-black text-sm">
            <GraduationCap size={18} className="text-teal-600" />
            <span>Kualifikasi Medis &amp; Biodata Dokter</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {doc.bio || `${doc.name} merupakan dokter spesialis resmi di Naray Hospital yang berdedikasi melayani pasien rawat jalan dan konsultasi spesialisasi.`}
          </p>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: DAFTAR MASTER DOKTER (RINGKAS, BERSIH, CEPAT SCAN)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* ── 1. Header Toolbar Card ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
              <Stethoscope size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Master Data Dokter &amp; Tenaga Medis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-heading font-bold border border-teal-200/80">
                  {doctors.length} Dokter Terdaftar
                </span>
                {onLeaveDoctorsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{onLeaveDoctorsCount} Sedang Cuti</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
                Daftar tenaga dokter spesialis resmi Naray Hospital. Klik <strong>"Lihat Detail &amp; Jadwal"</strong> pada dokter untuk mengatur sesi dinas dan cuti dokter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <a
              href="/dokter-jadwal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-heading font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Buka portal jadwal dokter publik pasien"
            >
              <ExternalLink size={14} className="text-slate-500" />
              <span>Lihat Jadwal Pasien</span>
            </a>

            <button
              type="button"
              onClick={() => handleOpenCreate('doctor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-heading font-extrabold shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Dokter Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tenaga Medis */}
        <div
          onClick={() => {
            if (setDoctorFilterStatus) setDoctorFilterStatus('all');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-teal-300 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tenaga Medis</div>
            <div className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-tight">
              {doctors.length} <span className="text-xs font-medium text-slate-400">dr.</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Semua spesialis</div>
          </div>
        </div>

        {/* Praktik Aktif */}
        <div
          onClick={() => {
            if (setDoctorFilterStatus) setDoctorFilterStatus('active');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Praktik Aktif</div>
            <div className="text-xl sm:text-2xl font-heading font-black text-emerald-700 leading-tight">
              {activeDoctorsCount} <span className="text-xs font-medium text-slate-400">dokter</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Siap melayani pasien</div>
          </div>
        </div>

        {/* Sedang Cuti Hari Ini */}
        <div
          onClick={() => {
            if (setDoctorFilterStatus) setDoctorFilterStatus('leave');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <CalendarOff size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sedang Cuti Hari Ini</div>
            <div className="text-xl sm:text-2xl font-heading font-black text-amber-700 leading-tight">
              {onLeaveDoctorsCount} <span className="text-xs font-medium text-slate-400">dokter</span>
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">
              {onLeaveDoctorsCount > 0 ? 'Klik untuk saring cuti' : 'Tidak ada cuti'}
            </div>
          </div>
        </div>

        {/* Sesi Jadwal Terpasang */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <CalendarDays size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sesi Jadwal Terpasang</div>
            <div className="text-xl sm:text-2xl font-heading font-black text-blue-700 leading-tight">
              {totalSchedulesCount} <span className="text-xs font-medium text-slate-400">slot</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">Terintegrasi poliklinik</div>
          </div>
        </div>
      </div>

      {/* ── 3. Table Container & Filter Toolbar ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Table Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-slate-50/50">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-heading font-bold text-sm text-slate-800">
              Daftar Dokter
            </span>
            <span className="text-xs text-slate-400">
              ({filteredDoctors.length} dari {doctors.length})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 lg:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari dokter, spesialis, telp..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white hover:bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Poliklinik */}
            <select
              value={doctorFilterPoli}
              onChange={e => setDoctorFilterPoli(e.target.value)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Poliklinik</option>
              {poliklinikList.map(p => (
                <option key={p.id || p.dbId} value={String(p.id || p.name)}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Filter Spesialisasi */}
            <select
              value={doctorFilterSpecialization}
              onChange={e => setDoctorFilterSpecialization(e.target.value)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Spesialisasi</option>
              {specializationsList.map(s => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={doctorFilterStatus}
              onChange={e => setDoctorFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Status</option>
              <option value="active">Praktik Aktif Saja</option>
              <option value="leave">Sedang Cuti Hari Ini</option>
              <option value="inactive">Nonaktif Saja</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Reset semua filter dokter"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ── 4. Main Clean Master Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-5 w-[32%]">Dokter &amp; Spesialisasi</th>
                <th className="py-3.5 px-4 w-[20%]">Poliklinik Penugasan</th>
                <th className="py-3.5 px-4 w-[20%]">Hari &amp; Jam Praktik</th>
                <th className="py-3.5 px-4 w-[14%] text-center">Status Operasional</th>
                <th className="py-3.5 px-5 w-[14%] text-right">Detail &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-100 shadow-2xs">
                      <Stethoscope size={24} />
                    </div>
                    <p className="font-heading font-bold text-slate-800 text-base">
                      Data dokter tidak ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {hasActiveFilters
                        ? 'Tidak ada dokter yang cocok dengan kriteria filter atau pencarian Anda.'
                        : 'Belum ada data dokter yang tersimpan.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-colors cursor-pointer border border-teal-200"
                      >
                        <RotateCcw size={12} />
                        <span>Kembalikan Semua Filter</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredDoctors.map(doc => {
                  const docKey = String(doc.id || doc.dbId);

                  const specName = typeof doc.specialty === 'object'
                    ? doc.specialty?.name || 'Dokter Spesialis'
                    : doc.specialty || doc.specialization?.name || 'Dokter Spesialis';

                  const assignedPolis = Array.isArray(doc.polikliniks) && doc.polikliniks.length > 0
                    ? doc.polikliniks.map(p => p.name)
                    : (doc.poliklinikName ? [doc.poliklinikName] : (doc.schedules?.map(s => s.room).filter(Boolean) || []));
                  const uniquePolis = Array.from(new Set(assignedPolis));
                  const poliDisplay = uniquePolis.length > 0 ? uniquePolis.join(', ') : 'Poliklinik Rawat Jalan';

                  const daysText = formatDaysDisplay(doc.availableDays);
                  const timeText = doc.practiceStartTime && doc.practiceEndTime
                    ? `${doc.practiceStartTime} - ${doc.practiceEndTime} WIB`
                    : (doc.schedules?.[0]?.time || null);

                  const photoSrc = formatImageUrl
                    ? formatImageUrl(doc.photo || doc.photo_url, '/images/default-doctor.svg')
                    : doc.photo || doc.photo_url || '/images/default-doctor.svg';

                  const leaveInfo = doc.activeTodayLeave || doc.currentLeave;
                  const leaveEndFormatted = leaveInfo?.end_date ? formatDateShort(leaveInfo.end_date) : '';

                  return (
                    <tr
                      key={docKey}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // Jangan trigger jika klik tombol aksi
                        if (e.target.closest('button') || e.target.closest('a')) return;
                        setSelectedDoctorId(doc.dbId || doc.id);
                      }}
                    >
                      {/* 1. Profil & Identitas Dokter */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0 mt-0.5">
                            <img
                              src={photoSrc}
                              alt={doc.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/90 shadow-2xs bg-slate-100"
                              onError={e => { e.target.src = '/images/default-doctor.svg'; }}
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                doc.status !== 'active'
                                  ? 'bg-slate-400'
                                  : doc.isOnLeave
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              title={
                                doc.status !== 'active'
                                  ? 'Status: Nonaktif'
                                  : doc.isOnLeave
                                  ? `Sedang Cuti: ${leaveInfo?.reason || 'Cuti'} s/d ${leaveEndFormatted}`
                                  : 'Status: Aktif Melayani Pasien'
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-black text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition-colors">
                              {doc.name}
                            </div>

                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/80">
                                <Stethoscope size={11} className="text-teal-600 shrink-0" />
                                <span>{specName}</span>
                              </span>

                              {doc.subSpecialty && doc.subSpecialty !== specName && (
                                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]" title={doc.subSpecialty}>
                                  • {doc.subSpecialty}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                              {doc.phone && (
                                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                  <Phone size={11} className="text-teal-600 shrink-0" />
                                  <span>{doc.phone}</span>
                                </span>
                              )}
                              {doc.email && (
                                <span className="inline-flex items-center gap-1 text-slate-400 truncate max-w-[150px]">
                                  <Mail size={11} className="shrink-0" />
                                  <span className="truncate">{doc.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Poliklinik Penugasan */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 mt-0.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/70">
                            <Building2 size={13} className="text-teal-600 shrink-0" />
                            <span className="leading-tight">{poliDisplay}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 pl-1">
                            {doc.branchName || 'Naray Hospital Dumai'}
                          </div>
                        </div>
                      </td>

                      {/* 3. Jadwal Praktik Ringkas */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 mt-0.5">
                          {daysText ? (
                            <>
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                <CalendarDays size={13} className="text-teal-600 shrink-0" />
                                <span>{daysText}</span>
                              </div>
                              {timeText && (
                                <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium pl-4">
                                  <Clock size={11} className="text-slate-400 shrink-0" />
                                  <span>{timeText}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-slate-400 italic">
                              Belum ada hari dinas rutin
                            </div>
                          )}

                          <div className="text-[11px] font-bold text-blue-700 mt-1">
                            {doc.schedules?.length || 0} Sesi Praktik Terpasang
                          </div>
                        </div>
                      </td>

                      {/* 4. Status Operasional */}
                      <td className="py-4 px-4 text-center align-top whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1 mt-0.5">
                          {doc.status !== 'active' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDoctor(doc);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer shadow-2xs"
                              title="Dokter nonaktif. Klik untuk mengaktifkan kembali."
                            >
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>Nonaktif</span>
                            </button>
                          ) : doc.isOnLeave ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                                title={`Sedang Cuti s/d ${leaveEndFormatted}. Alasan: ${leaveInfo?.reason || 'Cuti'}`}
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Sedang Cuti</span>
                              </span>
                              {leaveEndFormatted && (
                                <span className="text-[10px] text-amber-700 font-semibold">
                                  Hingga {leaveEndFormatted}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDoctor(doc);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                              title="Dokter aktif melayani. Klik untuk mengubah status."
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Praktik Aktif</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 5. Tombol Detail & Aksi */}
                      <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end mt-0.5">
                          {/* Tombol Utama: Buka Halaman Khusus Detail Dokter */}
                          <button
                            type="button"
                            onClick={() => setSelectedDoctorId(doc.dbId || doc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 text-xs font-heading font-bold border border-teal-200 hover:border-teal-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group/btn"
                            title={`Buka rincian lengkap profil, jadwal dinas, dan cuti untuk ${doc.name}`}
                          >
                            <span>Detail &amp; Jadwal</span>
                            <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>

                          {/* Tombol Edit Profil */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit('doctor', doc);
                            }}
                            className="p-2 rounded-xl text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 hover:border-teal-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                            title={`Edit profil ${doc.name}`}
                            aria-label={`Edit ${doc.name}`}
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              promptDelete('doctor', doc, doc.name);
                            }}
                            className="p-2 rounded-xl text-slate-400 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                            title={`Hapus dokter ${doc.name}`}
                            aria-label={`Hapus ${doc.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 5. Table Footer Summary ── */}
        <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>
              Menampilkan <strong>{filteredDoctors.length}</strong> dari <strong>{doctors.length}</strong> dokter spesialis terdaftar.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Praktik: <strong>{activeDoctorsCount}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Cuti: <strong>{onLeaveDoctorsCount}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Nonaktif: <strong>{inactiveDoctorsCount}</strong></span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
