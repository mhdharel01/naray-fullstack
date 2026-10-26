import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  Home,
  HelpCircle,
  ChevronDown,
  Microscope,
  Stethoscope,
  Search,
  MessageCircle,
  Building2,
  PhoneCall,
  AlertCircle,
  ArrowRight,
  Info,
  Shield,
  BadgeCheck
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { PackageDetailModal } from '../components/PackageDetailModal';

const FAQ_LIST = [
  {
    q: 'Apakah hasil pemeriksaan MCU bisa diterima pada hari yang sama?',
    a: 'Sebagian besar hasil pemeriksaan laboratorium rutin dapat diterima pada hari yang sama atau maksimal 1×24 jam kerja. Untuk pemeriksaan penunjang lanjutan, dokter spesialis akan merangkumnya dalam rekam medis elektronik resmi.'
  },
  {
    q: 'Apakah pasien diwajibkan berpuasa sebelum menjalani MCU?',
    a: 'Ya, untuk akurasi pemeriksaan gula darah puasa dan profil lipid (kolesterol), pasien dianjurkan berpuasa selama 10–12 jam sebelum pemeriksaan. Minum air putih tanpa rasa tetap diperbolehkan.'
  },
  {
    q: 'Apakah Naray Hospital melayani pemeriksaan MCU kolektif untuk perusahaan?',
    a: 'Tentu. Naray Hospital menyediakan paket Medical Check-Up Korporasi khusus untuk karyawan perusahaan dengan kuota fleksibel, termasuk opsi layanan pemeriksaan on-site di lokasi instansi Anda di Kota Dumai dan sekitarnya.'
  },
  {
    q: 'Apakah paket MCU dapat diklaim menggunakan asuransi kesehatan?',
    a: 'Beberapa jenis asuransi rekanan dan korporasi menanggung biaya MCU berkala. Silakan berkonsultasi dengan tim administrasi kami sebelum jadwal pemeriksaan dengan membawa kartu kepesertaan aktif.'
  },
  {
    q: 'Berapa lama estimasi waktu yang diperlukan selama proses MCU?',
    a: 'Durasi pemeriksaan bervariasi bergantung paket yang dipilih: rata-rata 1.5–2 jam untuk paket dasar/skrining rutin, dan 3–4 jam untuk paket komprehensif jantung atau platinum geriatri.'
  }
];

const MCU_STEPS = [
  {
    step: '01',
    title: 'Pilih Paket & Jadwal',
    desc: 'Tentukan paket pemeriksaan yang sesuai kebutuhan Anda dan lakukan reservasi tanggal secara online atau via WhatsApp.',
    icon: Calendar
  },
  {
    step: '02',
    title: 'Persiapan & Puasa',
    desc: 'Lakukan puasa 10–12 jam sebelum jadwal pemeriksaan laboratorium darah (tetap boleh minum air putih).',
    icon: Clock
  },
  {
    step: '03',
    title: 'Rangkaian Pemeriksaan',
    desc: 'Tiba di unit MCU Naray Hospital. Tim medis profesional kami akan memandu seluruh alur pemeriksaan secara efisien.',
    icon: Microscope
  },
  {
    step: '04',
    title: 'Konsultasi & Resume RME',
    desc: 'Dokter spesialis menjelaskan hasil diagnosis dan menyerahkan resume medis serta rekomendasi preventif bagi Anda.',
    icon: Stethoscope
  }
];

export default function McuPackagePage() {
  const { mcuPackages = [], hospitalInfo = {}, isLoadingBackend } = useHospitalData();
  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
  const mcuPhone = (hospitalInfo?.mcuWhatsapp || hospitalInfo?.whatsappHotline || hospitalInfo?.phone || '6285363624796').replace(/[^0-9]/g, '');
  const emergencyPhone = hospitalInfo?.emergencyHotline || hospitalInfo?.phone || '+6285363395383';

  const [activePackageDetail, setActivePackageDetail] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'umum' | 'jantung' | 'geriatri' | 'pranikah'
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (idx) => setOpenFaqIdx(openFaqIdx === idx ? null : idx);

  // Quick categories metadata
  const categories = [
    { id: 'all', label: 'Semua Paket' },
    { id: 'umum', label: 'Umum & Karyawan' },
    { id: 'jantung', label: 'Jantung & Vaskular' },
    { id: 'geriatri', label: 'Lansia (Geriatri)' },
    { id: 'pranikah', label: 'Pra-Nikah' }
  ];

  // Active packages only for public view
  const activePackages = useMemo(() => {
    return (mcuPackages || []).filter(pkg => (pkg.status || 'active').toLowerCase() === 'active');
  }, [mcuPackages]);

  // Filtering packages
  const filteredPackages = useMemo(() => {
    return activePackages.filter((pkg) => {
      const idLower = (pkg.id || '').toLowerCase();
      const nameLower = (pkg.name || '').toLowerCase();

      let matchesCategory = true;
      if (activeCategory === 'umum') {
        matchesCategory = idLower.includes('rutin') || nameLower.includes('skrining') || nameLower.includes('umum');
      } else if (activeCategory === 'jantung') {
        matchesCategory = idLower.includes('jantung') || nameLower.includes('jantung');
      } else if (activeCategory === 'geriatri') {
        matchesCategory = idLower.includes('geriatri') || nameLower.includes('geriatri') || nameLower.includes('lanjut');
      } else if (activeCategory === 'pranikah') {
        matchesCategory = idLower.includes('pranikah') || nameLower.includes('nikah');
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        nameLower.includes(q) ||
        (pkg.highlight || '').toLowerCase().includes(q) ||
        (pkg.target || '').toLowerCase().includes(q) ||
        (pkg.items || []).some((item) => item.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activePackages, activeCategory, searchQuery]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-800 antialiased">
        
        {/* ── 1. Top Breadcrumbs Bar (Matching InpatientRoomsPage) ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium" aria-label="Navigasi Breadcrumb">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Paket Medical Check-Up (MCU)</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Total {activePackages.length} Paket Skrining Terakreditasi KARS
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title Section (Matching InpatientRoomsPage) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs mb-3.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Pencegahan &amp; Deteksi Dini</span>
                <span className="text-emerald-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700">Skrining Preventif Komprehensif</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Paket Medical Check-Up Komprehensif
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Pemeriksaan kesehatan preventif menyeluruh oleh tim dokter spesialis Naray Hospital, didukung laboratorium klinik otomatis dan radiologi digital untuk deteksi dini risiko penyakit di Kota Dumai.
              </p>
            </div>

            {/* Quick Accreditation Badge */}
            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 text-right">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                STANDAR SKRINING KESEHATAN
              </span>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-teal-600" />
                Terakreditasi KARS Paripurna Bintang Lima
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. Real-Time 4-Cards Stat Strip (Matching InpatientRoomsPage) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat 1: 100% Dokter Spesialis */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  100%
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  DOKTER SPESIALIS
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                    100%
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Tatap Muka</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Hasil Hari yang Sama */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  RME Resmi
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-mono leading-tight">
                  HASIL REKAM MEDIS
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-lg sm:text-2xl font-black text-emerald-950 leading-tight">
                    Hari Sama
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-emerald-700">RME Resmi</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Lab & Radiologi Digital */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  Presisi
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  TEKNOLOGI MEDIS
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                    Digital Lab
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Presisi</span>
                </div>
              </div>
            </div>

            {/* Stat 4: Personal & Korporasi */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                  Mitra RS
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  LAYANAN PASIEN
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                    Korporasi
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500">&amp; Personal</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Segmented Category Filter & Real-Time Search Bar ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs border border-slate-200/90 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none -mx-0.5 px-0.5" role="tablist" aria-label="Kategori MCU">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-teal-600 text-white shadow-sm scale-[1.02]' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.id === 'all' && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {mcuPackages.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari paket atau item lab (mis. EKG, Thorax)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-slate-50/50"
                aria-label="Cari paket MCU"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── 5. MCU Packages Catalog Grid (Matching InpatientRoomsPage Cards) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1 font-mono">
                KATALOG SKRINING KESEHATAN
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pilihan Paket Pemeriksaan Kesehatan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Rangkaian pemeriksaan dirancang oleh tim dokter spesialis Naray Hospital untuk penegakan diagnosis yang akurat, aman, dan tepat sasaran.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
              Menampilkan <span className="text-teal-700 font-bold">{filteredPackages.length}</span> dari {activePackages.length} paket
            </div>
          </div>

          {/* Cards Grid */}
          {isLoadingBackend && mcuPackages.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs animate-pulse flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-slate-200 rounded-full w-24" />
                      <div className="h-6 bg-slate-100 rounded-full w-20" />
                    </div>
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-9 bg-slate-100 rounded-xl w-1/2" />
                    <div className="space-y-2 pt-2">
                      <div className="h-3.5 bg-slate-100 rounded w-full" />
                      <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                      <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-11 bg-slate-200 rounded-2xl mt-6" />
                </div>
              ))}
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPackages.map((pkg) => (
                <article
                  key={pkg.id}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                  onClick={() => setActivePackageDetail(pkg)}
                >
                  {/* Top Header Card */}
                  <div className="p-6 pb-4 border-b border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 font-mono">
                        <Sparkles size={12} className="text-teal-600" />
                        <span className="truncate">{pkg.badge || 'Pemeriksaan Rutin'}</span>
                      </span>
                      {pkg.originalPrice && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
                          Promo
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {pkg.highlight}
                    </p>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2.5 pt-3 border-t border-slate-100">
                      <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {pkg.price}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through">
                          {pkg.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Meta Chips */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Clock size={14} className="text-teal-600 shrink-0" />
                        <span className="truncate">{pkg.duration || '1.5 - 2 Jam'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <UserCheck size={14} className="text-sky-600 shrink-0" />
                        <span className="truncate">{pkg.target || 'Semua Usia'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Inclusions Checklist */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block mb-3 font-mono tracking-wider">
                        ITEM PEMERIKSAAN UTAMA:
                      </span>
                      <ul className="space-y-2.5 text-xs text-slate-600">
                        {(pkg.items || []).slice(0, 5).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <span className="leading-relaxed font-medium text-slate-700 line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                      {(pkg.items || []).length > 5 && (
                        <span className="inline-block text-xs font-bold text-teal-700 hover:text-teal-800 mt-3 font-mono">
                          + {(pkg.items || []).length - 5} pemeriksaan lainnya (Lihat Detail)
                        </span>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePackageDetail(pkg);
                        }}
                      >
                        <span>Rincian Paket</span>
                        <ArrowRight size={15} />
                      </button>

                      <a
                        href={`https://wa.me/${mcuPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin reservasi Paket MCU: ${pkg.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        title="Reservasi Cepat via WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Search size={30} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                Paket Tidak Ditemukan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Tidak ada paket pemeriksaan MCU yang sesuai dengan kata kunci "{searchQuery}". Silakan coba kata kunci lain atau reset filter.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Reset Filter &amp; Pencarian
              </button>
            </div>
          )}

        </div>

        {/* ── 6. Alur & Prosedur Pemeriksaan MCU (4 Tahapan) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    PANDUAN ALUR PASIEN
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Alur &amp; Prosedur Pemeriksaan MCU
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                Layanan Terpadu Satu Atap Unit MCU
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MCU_STEPS.map((s) => {
                const StepIcon = s.icon;
                return (
                  <div 
                    key={s.step} 
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:bg-teal-50/50 hover:border-teal-200 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-black text-teal-700/30 font-heading">
                          {s.step}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <StepIcon size={18} />
                        </div>
                      </div>
                      <h4 className="font-heading text-sm font-bold text-slate-900 mb-1.5">
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── 7. Ketentuan Persiapan Pasien MCU (Matching Ketentuan Jam Kunjungan di Kamar) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    TATA CARA &amp; PERSIAPAN MCU
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Ketentuan Penting Sebelum Menjalani Pemeriksaan
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                Pedoman Akurasi Hasil Laboratorium
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  PUASA 10 – 12 JAM
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Puasa Sebelum Tes Darah
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Wajib puasa untuk tes gula darah &amp; profil kolesterol (tetap boleh minum air putih).
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  ISTIRAHAT CUKUP
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Tidur Minimal 6–8 Jam
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Hindari begadang dan aktivitas fisik berat malam hari sebelum pemeriksaan EKG.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  OBAT RUTIN &amp; RIWAYAT
                </span>
                <strong className="font-heading text-sm sm:text-base font-extrabold text-amber-950 block">
                  Bawa Riwayat Medis
                </strong>
                <p className="text-xs text-amber-800 mt-1">
                  Informasikan obat rutin diabetes/hipertensi kepada perawat sebelum pengambilan sampel.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed">
                <strong>Catatan Khusus Wanita:</strong> Bagi wanita yang sedang mengalami masa menstruasi atau sedang hamil, pemeriksaan urine lengkap dan rontgen dada (foto thorax) sebaiknya ditunda dan dikonsultasikan terlebih dahulu dengan dokter pengawas MCU.
              </p>
            </div>
          </section>
        </div>

        {/* ── 8. Corporate MCU Callout Strip ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="rounded-3xl bg-gradient-to-br from-[#042622] via-[#06332d] to-teal-950 p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-teal-800/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3 font-mono">
                <Building2 size={13} />
                <span>LAYANAN KORPORASI &amp; INSTANSI KOTA DUMAI</span>
              </span>
              <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Kebutuhan MCU Karyawan &amp; Skrining Pra-Kerja Perusahaan?
              </h3>
              <p className="text-teal-100/80 text-xs sm:text-sm leading-relaxed m-0 font-normal">
                Naray Hospital melayani paket medical check-up berkala dan pra-karyawan untuk perusahaan swasta, BUMN, perbankan, serta instansi pemerintah di Kota Dumai dengan laporan kesehatan terintegrasi dan opsi on-site service.
              </p>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <a
                href={`https://wa.me/${mcuPhone}?text=${encodeURIComponent('Halo Tim Korporasi Naray Hospital, kami ingin informasi penawaran dan proposal Paket MCU Perusahaan.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Konsultasi MCU Korporasi</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── 9. FAQ Accordion ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    INFORMASI PASIEN
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Pertanyaan Umum (FAQ) Seputar MCU
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                Panduan Sebelum Pemeriksaan
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {FAQ_LIST.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-slate-50/50 ${
                      isOpen ? 'border-teal-500/50 bg-white shadow-xs' : 'border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {faq.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-teal-100 text-teal-800 rotate-180' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        <ChevronDown size={16} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        <p className="m-0">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── 10. Bottom Fast Action Callout Banner (Matching InpatientRoomsPage Line 1120) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>KONSULTASI &amp; RESERVASI MCU 24 JAM</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Ingin Berkonsultasi atau Memilih Paket MCU yang Tepat?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Konselor kesehatan dan tim admisi MCU Naray Hospital siap membantu Anda menentukan paket skrining yang paling sesuai dengan riwayat medis, usia, dan kebutuhan keluarga Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={`https://wa.me/${mcuPhone}?text=${encodeURIComponent('Halo Admisi MCU Naray Hospital, saya ingin konsultasi pemilihan paket medical check-up.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Hubungi Tim MCU WhatsApp</span>
              </a>
              <a
                href={`https://wa.me/${(hospitalInfo?.emergencyHotline || emergencyPhone || '6285363395383').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp UGD: {hospitalInfo?.emergencyHotline || emergencyPhone || '+62 853-6339-5383'}</span>
              </a>
            </div>
          </section>
        </div>

        {/* ── Modals ── */}
        {activePackageDetail && (
          <PackageDetailModal
            pkg={activePackageDetail}
            onClose={() => setActivePackageDetail(null)}
          />
        )}

      </div>
    </PageLayout>
  );
}
