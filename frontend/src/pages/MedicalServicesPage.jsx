import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  PhoneCall, 
  ArrowRight, 
  ChevronRight, 
  Home, 
  Search, 
  Layers, 
  ShieldCheck, 
  Users, 
  MessageCircle, 
  Building2,
  Stethoscope,
  HeartPulse,
  AlertCircle,
  HelpCircle,
  Shield,
  Activity
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { CenterDetailModal } from '../components/CenterDetailModal';
import { FacilityDetailModal } from '../components/FacilityDetailModal';

export default function MedicalServicesPage() {
  const navigate = useNavigate();
  const { 
    centersOfExcellence = [], 
    facilitiesData = [], 
    facilities = [], 
    doctors = [],
    hospitalInfo = {},
    formatImageUrl 
  } = useHospitalData();
  
  const allFacilities = facilitiesData.length > 0 ? facilitiesData : facilities;

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'centers' | 'facilities'
  const [activeCenterDetail, setActiveCenterDetail] = useState(null);
  const [activeFacilityDetail, setActiveFacilityDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Quick categories for smart filtering
  const quickCategories = [
    { id: 'all', label: 'Semua Bidang' },
    { id: 'jantung', label: 'Jantung & Darah' },
    { id: 'ibu-anak', label: 'Ibu & Anak' },
    { id: 'bedah', label: 'Bedah & Trauma' },
    { id: 'organ-dalam', label: 'Penyakit Dalam' },
    { id: 'paru', label: 'Paru & Pernapasan' },
    { id: 'mata-tht', label: 'Mata & THT' },
    { id: 'diagnostik', label: 'Radiologi & Lab' }
  ];

  // Helper to match doctors with a center
  const getRelatedDoctors = (center) => {
    const shortT = (center.shortTitle || center.title || '').toLowerCase();
    const titleT = (center.title || '').toLowerCase();
    return (doctors || []).filter(d => {
      const spec = (d.specialtyGroup || d.specialty || '').toLowerCase();
      return spec.includes(shortT) || titleT.includes(spec) || shortT.includes(spec);
    });
  };

  // Filter Centers
  const filteredCenters = useMemo(() => {
    return (centersOfExcellence || []).filter(c => {
      const matchesSearch = !searchTerm || 
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.tagline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.technologies || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTag = true;
      if (selectedTag === 'jantung') matchesTag = (c.id || '').includes('jantung') || (c.title || '').toLowerCase().includes('jantung');
      else if (selectedTag === 'ibu-anak') matchesTag = (c.id || '').includes('ibu-anak') || (c.title || '').toLowerCase().includes('anak');
      else if (selectedTag === 'bedah') matchesTag = (c.id || '').includes('bedah') || (c.title || '').toLowerCase().includes('bedah');
      else if (selectedTag === 'organ-dalam') matchesTag = (c.id || '').includes('penyakit-dalam') || (c.title || '').toLowerCase().includes('dalam');
      else if (selectedTag === 'paru') matchesTag = (c.id || '').includes('paru') || (c.title || '').toLowerCase().includes('paru');
      else if (selectedTag === 'mata-tht') matchesTag = (c.id || '').includes('mata-tht') || (c.title || '').toLowerCase().includes('mata') || (c.title || '').toLowerCase().includes('tht');
      else if (selectedTag === 'diagnostik') matchesTag = false;

      return matchesSearch && matchesTag;
    });
  }, [centersOfExcellence, searchTerm, selectedTag]);

  // Filter Facilities
  const filteredFacilities = useMemo(() => {
    return (allFacilities || []).filter(f => {
      const cat = typeof f.category === 'object' ? (f.category?.name || '') : (f.category || f.tag || '');
      const desc = f.description || f.desc || '';
      
      const matchesSearch = !searchTerm || 
        (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.features || []).some(feat => feat.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTag = true;
      if (selectedTag === 'diagnostik') matchesTag = true;
      else if (selectedTag === 'bedah') matchesTag = (f.name || '').toLowerCase().includes('bedah') || (f.name || '').toLowerCase().includes('operasi');
      else if (selectedTag !== 'all') matchesTag = false;

      return matchesSearch && matchesTag;
    });
  }, [allFacilities, searchTerm, selectedTag]);

  const totalFilteredCount = (activeTab === 'all' 
    ? filteredCenters.length + filteredFacilities.length 
    : (activeTab === 'centers' ? filteredCenters.length : filteredFacilities.length));

  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
  const emergencyPhone = hospitalInfo?.emergencyHotline || hospitalInfo?.phone || '+6285363395383';

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
              <span className="text-slate-900 font-semibold">Layanan Medis &amp; Fasilitas Modern</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Standar Akreditasi KARS Paripurna • 30 Dokter Spesialis SIMRS
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
                <span>Pusat Layanan Medis Terpadu</span>
                <span className="text-emerald-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700">6 Centers of Excellence &amp; Diagnostik Modern</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Pelayanan Medis &amp; Fasilitas Terpadu
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Menghadirkan 6 Pusat Unggulan Terpadu (Centers of Excellence) dan fasilitas penunjang medis berstandar KARS Paripurna di Kota Dumai, didukung 30 dokter spesialis SIMRS terintegrasi dan IGD 24 Jam siaga cepat.
              </p>
            </div>

            {/* Quick Accreditation Badge */}
            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 text-right">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                STANDAR PELAYANAN RS TIPE B
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat 1: Centers of Excellence */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  PUSAT UNGGULAN
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                    {(centersOfExcellence || []).length || 6}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Divisi CoE</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Fasilitas Penunjang */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                  UNIT DIAGNOSTIK
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-emerald-950">
                    {(allFacilities || []).length || 6}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">Unit Siap</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Tim Dokter Spesialis */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  DOKTER SPESIALIS
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                    {doctors?.length || 30}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Spesialis</span>
                </div>
              </div>
            </div>

            {/* Stat 4: IGD 24 Jam */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  IGD &amp; TRAUMA
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                    24 Jam
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Siaga Nonstop</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Segmented Filter & Live Search Toolbar (Matching InpatientRoomsPage) ── */}
        <div id="katalog-layanan" className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-4">
            
            {/* Row 1: Primary Tabs & Search Input */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Primary Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 gap-1 overflow-x-auto max-w-full" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <Layers size={15} />
                  <span>Semua Layanan</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {(centersOfExcellence || []).length + (allFacilities || []).length}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'centers'}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'centers' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  onClick={() => setActiveTab('centers')}
                >
                  <Sparkles size={15} />
                  <span>Pusat Unggulan (CoE)</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    activeTab === 'centers' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {(centersOfExcellence || []).length}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'facilities'}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'facilities' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  onClick={() => setActiveTab('facilities')}
                >
                  <Cpu size={15} />
                  <span>Fasilitas Diagnostik</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    activeTab === 'facilities' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {(allFacilities || []).length}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari layanan, dokter, atau fasilitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-slate-50/50"
                  aria-label="Cari layanan medis"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>

            {/* Row 2: Secondary Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 font-mono">
                Bidang Spesifik:
              </span>
              {quickCategories.map((cat) => {
                const isActive = selectedTag === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedTag(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-teal-50 text-teal-800 border border-teal-300 shadow-2xs font-bold' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── 5. Main Catalog Sections ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* A. Centers of Excellence Catalog */}
          {(activeTab === 'all' || activeTab === 'centers') && filteredCenters.length > 0 && (
            <section className="mb-16">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1 font-mono">
                    CENTERS OF EXCELLENCE
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Pusat Layanan Unggulan Terpadu
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Kolaborasi tim dokter spesialis multidisiplin dengan fasilitas medis khusus untuk penanganan komprehensif.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                  Menampilkan <span className="text-teal-700 font-bold">{filteredCenters.length}</span> pusat unggulan
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredCenters.map((center) => {
                  const relatedDocs = getRelatedDoctors(center);
                  const shortT = center.shortTitle || center.title;
                  const cImg = formatImageUrl ? formatImageUrl(center.image, '/images/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp') : (center.image || '/images/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp');

                  return (
                    <article 
                      key={center.id} 
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                      onClick={() => setActiveCenterDetail(center)}
                    >
                      {/* Image Banner */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-900 shrink-0">
                        <img 
                          src={cImg} 
                          alt={center.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = '/images/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/75 backdrop-blur-md text-teal-300 border border-teal-500/30 shadow-sm font-mono">
                          <Sparkles size={12} />
                          <span>{shortT}</span>
                        </span>

                        <span className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-teal-800 border border-white/80 shadow-md font-mono">
                          <Users size={12} className="text-teal-600" />
                          <span>{relatedDocs.length > 0 ? `${relatedDocs.length} Dokter Spesialis` : 'Tim Terpadu'}</span>
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                            {center.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {center.tagline || center.description}
                          </p>

                          {/* Top 3 Services Included */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 mb-4">
                            {(center.services || []).slice(0, 3).map((srv, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                                <span className="line-clamp-1">{srv}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button 
                            type="button" 
                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCenterDetail(center);
                            }}
                          >
                            <span>Rincian Layanan</span>
                            <ArrowRight size={15} />
                          </button>

                          <a 
                            href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan jadwal dan informasi di ${center.title}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                            title="Konsultasi WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* B. Diagnostic Facilities Catalog */}
          {(activeTab === 'all' || activeTab === 'facilities') && filteredFacilities.length > 0 && (
            <section className="mb-16">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1 font-mono">
                    FASILITAS DIAGNOSTIK &amp; MEDIS
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Fasilitas Penunjang Medis &amp; Diagnostik Presisi
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Instrumen medis digital terkalibrasi untuk ketepatan diagnosis dan kecepatan terapi pasien.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
                  Menampilkan <span className="text-teal-700 font-bold">{filteredFacilities.length}</span> fasilitas medis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredFacilities.map((fac) => {
                  const facTag = typeof fac.category === 'object' ? (fac.category?.name || "Fasilitas Medis") : (fac.category || fac.tag || "Fasilitas Medis");
                  const facDesc = fac.description || fac.desc;
                  const fImg = formatImageUrl ? formatImageUrl(fac.image || fac.image_url, '/images/discovery/diagnostic-center.jpg') : (fac.image || '/images/discovery/diagnostic-center.jpg');
                  const facFeatures = Array.isArray(fac.features) && fac.features.length > 0 ? fac.features : [
                    "Pemeriksaan berstandar akurasi tinggi",
                    "Didukung radiografer & analis bersertifikat",
                    "Hasil terintegrasi dengan rekam medis digital"
                  ];

                  return (
                    <article 
                      key={fac.id} 
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                      onClick={() => setActiveFacilityDetail(fac)}
                    >
                      {/* Image Wrap */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-900 shrink-0">
                        <img 
                          src={fImg} 
                          alt={fac.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy" 
                          onError={(e) => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                        
                        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/75 backdrop-blur-md text-sky-300 border border-sky-500/30 shadow-sm font-mono">
                          {facTag}
                        </span>

                        <span className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-emerald-700 border border-white/80 shadow-md font-mono">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>Siap Melayani</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                            {fac.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {facDesc}
                          </p>

                          {/* Feature Checklist */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 mb-4">
                            {facFeatures.slice(0, 3).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button 
                            type="button" 
                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFacilityDetail(fac);
                            }}
                          >
                            <span>Informasi Fasilitas</span>
                            <ArrowRight size={15} />
                          </button>
                          
                          <a 
                            href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan jadwal dan informasi fasilitas: ${fac.name}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                            title="Tanya Fasilitas via WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {totalFilteredCount === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Search size={30} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                Layanan Tidak Ditemukan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Tidak ada pusat layanan atau fasilitas medis yang sesuai dengan kata kunci "{searchTerm}". Silakan periksa ejaan atau reset filter.
              </p>
              <button 
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('all');
                  setActiveTab('all');
                }}
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}

          {/* ── 6. Panduan Alur Rujukan & Pendaftaran Poliklinik (Matching Jam Kunjungan di Kamar) ── */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    ALUR &amp; PROSEDUR LAYANAN
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Panduan Rujukan &amp; Konsultasi Poliklinik Terpadu
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                Integrasi SIMRS Dekago v2 &amp; BPJS V-Claim
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  PASIEN BPJS KESEHATAN
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Rujukan Faskes Tingkat 1
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Bawa surat rujukan aktif dari Puskesmas/Klinik Pratama dan KTP/Kartu JKN aktif.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  PASIEN UMUM &amp; ASURANSI SWASTA
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Jalur Cepat (Cashless Partner)
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Bebas antre lama dengan registrasi online via WhatsApp hotline atau meja pendaftaran admisi.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  TINDAKAN MEDIS TERENCANA
                </span>
                <strong className="font-heading text-sm sm:text-base font-extrabold text-amber-950 block">
                  Operasi Elektif &amp; Diagnostik
                </strong>
                <p className="text-xs text-amber-800 mt-1">
                  Dilakukan sesuai rekomendasi dokter spesialis penanggung jawab pasien (DPJP).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed">
                <strong>Catatan Pelayanan Kegawatdaruratan (IGD 24 Jam):</strong> Kasus kegawatdaruratan medis, kecelakaan, atau serangan jantung akut langsung ditangani di Instalasi Gawat Darurat tanpa perlu membawa surat rujukan terlebih dahulu.
              </p>
            </div>
          </section>

          {/* ── 7. Bottom Fast Action Callout Banner (Matching InpatientRoomsPage Line 1120) ── */}
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>LAYANAN INFORMASI MEDIS &amp; RUJUKAN 24 JAM</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Butuh Kepastian Jadwal Spesialis atau Penanganan Medis Segera?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Petugas customer care dan perawat jaga Naray Hospital siap 24 jam membantu Anda mendapatkan rincian layanan dokter spesialis, alur rujukan, hingga penjemputan darurat ambulans.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent('Halo Naray Hospital, saya ingin menanyakan informasi layanan medis dan jadwal spesialis.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Hubungi Kami via WhatsApp</span>
              </a>
              <a
                href={`tel:${emergencyPhone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all text-center cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>Telepon UGD: (0765) 31234</span>
              </a>
            </div>
          </section>

        </div>

        {/* ── 8. Modals Integration ── */}
        {activeCenterDetail && (
          <CenterDetailModal 
            center={activeCenterDetail}
            onClose={() => setActiveCenterDetail(null)}
            onSelectDoctor={(doc) => {
              setActiveCenterDetail(null);
              navigate(`/dokter-jadwal?keyword=${encodeURIComponent(doc.name || '')}`);
            }}
          />
        )}

        {activeFacilityDetail && (
          <FacilityDetailModal 
            facility={activeFacilityDetail}
            onClose={() => setActiveFacilityDetail(null)}
          />
        )}

      </div>
    </PageLayout>
  );
}
