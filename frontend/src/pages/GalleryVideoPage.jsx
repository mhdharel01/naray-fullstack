import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Image as ImageIcon,
  Calendar,
  ChevronRight,
  Home,
  Play,
  X,
  Search,
  Camera,
  Maximize2,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

const GALLERY_CATEGORIES = [
  'Semua',
  'Kegiatan Sosial / CSR',
  'Edukasi Komunitas Sehat',
  'Pelayanan Geriatri',
  'Fasilitas Medis'
];

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/)([^?&"'>]+)/);
  return match ? match[1] : '';
};

export default function GalleryVideoPage() {
  const { 
    videoList = [], 
    galleryActivities = [], 
    hospitalInfo = {},
    formatImageUrl 
  } = useHospitalData();

  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'gallery'
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [lightboxVideo, setLightboxVideo] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
  const emergencyPhone = hospitalInfo?.emergencyHotline || hospitalInfo?.phone || '+6285363395383';

  // Handle ESC key and lock body scroll for lightboxes
  useEffect(() => {
    if (!lightboxVideo && !lightboxImg) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxVideo(null);
        setLightboxImg(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxVideo, lightboxImg]);

  // Filter gallery photos
  const filteredGallery = useMemo(() => {
    return galleryActivities.filter((gal) => {
      const catStr = typeof gal.category === 'object' ? (gal.category?.name || '') : String(gal.category || '');
      const matchCat =
        selectedCategory === 'Semua' ||
        (catStr && catStr.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === 'Fasilitas Medis' && catStr.toLowerCase().includes('fasilitas'));
      const matchSearch =
        !searchKeyword ||
        gal.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        gal.desc?.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [galleryActivities, selectedCategory, searchKeyword]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videoList.filter((vid) => {
      return (
        !searchKeyword ||
        vid.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        vid.desc?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });
  }, [videoList, searchKeyword]);

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
              <span className="text-slate-900 font-semibold">Galeri &amp; Video Dokumentasi</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Arsip Resmi Multimedia • Naray Hospital Dumai
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
                <span>Dokumentasi Resmi &amp; Publikasi</span>
                <span className="text-emerald-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700">Arsip Multimedia SIMRS</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Galeri Kegiatan &amp; Video Dokumentasi
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Dokumentasi visual rangkaian kegiatan bakti sosial, edukasi kesehatan masyarakat, dan fasilitas pelayanan penunjang medis Naray Hospital di Kota Dumai.
              </p>
            </div>

            {/* Quick Accreditation Badge */}
            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 text-right">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                ARSIP DOKUMENTASI RESMI
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
            
            {/* Stat 1: Total Video */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Video size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  VIDEO DOKUMENTASI
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                    {videoList.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Video</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Total Galeri Foto */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Camera size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                  ARSIP FOTO KEGIATAN
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl sm:text-3xl font-black text-emerald-950">
                    {galleryActivities.length}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">Foto</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Kegiatan CSR & Komunitas */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  PROGRAM KOMUNITAS
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                    CSR &amp; Sosial
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Aktif</span>
                </div>
              </div>
            </div>

            {/* Stat 4: Privasi & Etika Pasien */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  ETIKA PUBLIKASI
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                    KARS &amp; UU
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Privasi Terjaga</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Segmented Media Tab Switcher & Live Search Toolbar ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-4">
            
            {/* Row 1: Primary Media Tabs & Search Input */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Primary Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 gap-1 overflow-x-auto max-w-full" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'video'}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'video' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  onClick={() => setActiveTab('video')}
                >
                  <Video size={16} />
                  <span>Video Dokumentasi</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    activeTab === 'video' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {videoList.length}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'gallery'}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'gallery' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  onClick={() => setActiveTab('gallery')}
                >
                  <ImageIcon size={16} />
                  <span>Galeri Foto Kegiatan</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    activeTab === 'gallery' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {galleryActivities.length}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'video' ? 'Cari video dokumentasi...' : 'Cari foto kegiatan...'}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-slate-50/50"
                  aria-label="Cari dokumentasi"
                />
                {searchKeyword && (
                  <button 
                    type="button" 
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>

            {/* Row 2: Secondary Category Filter Pills (Khusus Foto) */}
            {activeTab === 'gallery' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 font-mono">
                  Kategori Foto:
                </span>
                {GALLERY_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-teal-50 text-teal-800 border border-teal-300 shadow-2xs font-bold' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ── 5. Catalog Grid Section ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          
          {/* Section Heading Meta */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1 font-mono">
                {activeTab === 'video' ? 'VIDEO DOKUMENTASI RESMI' : 'ARSIP FOTO KEGIATAN'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeTab === 'video' ? 'Koleksi Video Profil & Edukasi Medis' : 'Dokumentasi Visual Aktivitas & Fasilitas'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === 'video' 
                  ? 'Menampilkan video komprehensif profil rumah sakit, testimoni, dan sosialisasi program layanan Naray Hospital.' 
                  : 'Dokumentasi kegiatan bakti sosial, penyuluhan kesehatan terpadu, dan fasilitas medis terbaru di Kota Dumai.'}
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500 shrink-0 font-mono">
              Menampilkan <span className="text-teal-700 font-bold">{activeTab === 'video' ? filteredVideos.length : filteredGallery.length}</span> {activeTab === 'video' ? 'video' : 'foto'}
              {searchKeyword && <span> untuk "{searchKeyword}"</span>}
            </div>
          </div>

          {/* ── A. Tab Video Grid ── */}
          {activeTab === 'video' && (
            <div>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredVideos.map((vid) => {
                    const ytId = getYouTubeId(vid.youtubeEmbed);
                    const thumbUrl = ytId
                      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                      : '/images/discovery/diagnostic-center.jpg';

                    return (
                      <article 
                        key={vid.id} 
                        className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                        onClick={() => setLightboxVideo(vid)}
                      >
                        {/* Video Thumbnail Wrap with 16:9 Aspect Ratio */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 shrink-0">
                          <img 
                            src={thumbUrl} 
                            alt={vid.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

                          {/* YouTube Badge */}
                          <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md font-mono">
                            <Play size={10} fill="currentColor" />
                            <span>YouTube HD</span>
                          </span>

                          {/* Centered Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-teal-500 transition-all duration-300 backdrop-blur-xs">
                              <Play size={24} fill="currentColor" className="ml-1 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                              {vid.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                              {vid.desc}
                            </p>
                          </div>

                          {/* Card Footer Action */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                            <button
                              type="button"
                              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxVideo(vid);
                              }}
                            >
                              <Play size={15} fill="currentColor" />
                              <span>Putar Video Dokumentasi</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* Empty Video State */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <Video size={30} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    Video Tidak Ditemukan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                    Tidak ada video dokumentasi yang sesuai dengan kata kunci "{searchKeyword}". Silakan coba kata kunci lain.
                  </p>
                  <button 
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                    onClick={() => setSearchKeyword('')}
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── B. Tab Galeri Foto Grid ── */}
          {activeTab === 'gallery' && (
            <div>
              {filteredGallery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredGallery.map((gal) => {
                    const rawImg = gal.image || gal.image_url || gal.photo;
                    const photoImg = formatImageUrl 
                      ? formatImageUrl(rawImg, '/images/discovery/diagnostic-center.jpg') 
                      : (rawImg || '/images/discovery/diagnostic-center.jpg');
                    const categoryLabel = typeof gal.category === 'object' ? (gal.category?.name || 'Kegiatan Naray') : (gal.category || 'Kegiatan Naray');

                    return (
                      <article 
                        key={gal.id} 
                        className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                        onClick={() => setLightboxImg(gal)}
                      >
                        {/* Photo Wrap */}
                        <div className="relative h-56 w-full overflow-hidden bg-slate-950 shrink-0">
                          <img 
                            src={photoImg} 
                            alt={gal.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                          {/* Category Badge */}
                          <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/75 backdrop-blur-md text-teal-300 border border-teal-500/30 shadow-sm font-mono">
                            <Camera size={12} />
                            <span>{categoryLabel}</span>
                          </span>

                          {/* Hover Zoom Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-bold backdrop-blur-md shadow-lg">
                              <Maximize2 size={13} />
                              <span>Perbesar Foto</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex flex-col flex-1 justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5 font-mono">
                              <Calendar size={13} className="text-teal-600 shrink-0" />
                              <time>{gal.date || 'Dokumentasi Resmi'}</time>
                            </div>
                            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                              {gal.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                              {gal.desc}
                            </p>
                          </div>

                          {/* Card Footer Action */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                            <button
                              type="button"
                              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImg(gal);
                              }}
                            >
                              <Maximize2 size={15} />
                              <span>Lihat Detail Foto</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* Empty Photo State */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={30} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    Foto Tidak Ditemukan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                    Tidak ada arsip foto yang sesuai dengan filter atau kata kunci "{searchKeyword}". Silakan reset filter Anda.
                  </p>
                  <button 
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedCategory('Semua');
                    }}
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── 6. Panduan Etika Dokumentasi & Perlindungan Privasi Pasien (Matching Jam Kunjungan di Kamar) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    KEBIJAKAN PUBLIKASI &amp; ETIKA
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Standar Perlindungan Privasi Pasien &amp; Publikasi Rumah Sakit
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                Sesuai UU Kesehatan No. 17 Tahun 2023
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  PRIVASI &amp; INFORMED CONSENT
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Persetujuan Pasien
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh dokumentasi pasien telah mendapatkan persetujuan tertulis demi menjaga kerahasiaan medis.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  EDUKASI KESEHATAN TERBUKA
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  Materi Penyuluhan Publik
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Video dan infografis edukasi kesehatan ditujukan untuk meningkatkan kesadaran preventif masyarakat luas.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  LIPUTAN MEDIA &amp; HUMAS
                </span>
                <strong className="font-heading text-sm sm:text-base font-extrabold text-amber-950 block">
                  Koordinasi Resmi Humas
                </strong>
                <p className="text-xs text-amber-800 mt-1">
                  Peliputan jurnalis dan media luar wajib berkoordinasi terlebih dahulu dengan Bagian Humas Naray Hospital.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed">
                <strong>Larangan Pengambilan Foto/Video Tanpa Izin:</strong> Demi menjaga privasi medis dan ketenangan pasien, pengunjung dan keluarga pasien dilarang mengambil gambar atau video di area tindakan medis, IGD, ICU, dan ruang rawat tanpa izin tertulis dari pihak rumah sakit.
              </p>
            </div>
          </section>
        </div>

        {/* ── 7. Bottom Fast Action Callout Banner (Matching InpatientRoomsPage Line 1120) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>LAYANAN INFORMASI &amp; HUMAS RS NARAY DUMAI</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Tertarik Menjalin Kemitraan Liputan atau Program CSR Kesehatan?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Tim Humas dan Komunikasi Publik Naray Hospital siap berkolaborasi dalam kegiatan bakti sosial, edukasi kesehatan masyarakat, dan keterbukaan informasi publik di Kota Dumai.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent('Halo Tim Humas Naray Hospital, saya ingin menanyakan informasi terkait dokumentasi, liputan, atau kerjasama kegiatan CSR.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Hubungi Humas via WhatsApp</span>
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

        {/* ── 8. Video Lightbox Modal (Pure Tailwind) ── */}
        {lightboxVideo && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setLightboxVideo(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            <div 
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-30 backdrop-blur-md shadow-md hover:scale-105 active:scale-95"
                onClick={() => setLightboxVideo(null)}
                aria-label="Tutup jendela video"
              >
                <X size={20} />
              </button>

              {/* YouTube Video Player Embed */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(lightboxVideo.youtubeEmbed)}?autoplay=1&rel=0`}
                  title={lightboxVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Modal Video Caption */}
              <div className="p-6 sm:p-8 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 font-mono">
                    <Video size={13} className="text-teal-600" />
                    <span>Video Dokumentasi Resmi</span>
                  </span>
                </div>
                <h3 
                  id="video-modal-title" 
                  className="font-heading text-xl sm:text-2xl font-bold text-slate-900 leading-snug mt-1"
                >
                  {lightboxVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                  {lightboxVideo.desc}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    onClick={() => setLightboxVideo(null)}
                  >
                    Tutup
                  </button>
                  <a
                    href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital, saya melihat video "${lightboxVideo.title}" dan ingin menanyakan informasi lebih lanjut.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>Tanya via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. Image Lightbox Modal (Pure Tailwind) ── */}
        {lightboxImg && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setLightboxImg(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-modal-title"
          >
            <div 
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-30 backdrop-blur-md shadow-md hover:scale-105 active:scale-95"
                onClick={() => setLightboxImg(null)}
                aria-label="Tutup jendela foto"
              >
                <X size={20} />
              </button>

              {/* High-Resolution Photo Viewer */}
              <div className="relative w-full max-h-[70vh] flex items-center justify-center bg-slate-950 overflow-hidden">
                <img
                  src={lightboxImg.image ? (formatImageUrl ? formatImageUrl(lightboxImg.image, '/images/discovery/diagnostic-center.jpg') : lightboxImg.image) : '/images/discovery/diagnostic-center.jpg'}
                  alt={lightboxImg.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                />
              </div>

              {/* Modal Image Caption */}
              <div className="p-6 sm:p-8 bg-white flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 font-mono">
                    <Camera size={13} className="text-teal-600" />
                    <span>
                      {typeof lightboxImg.category === 'object' ? (lightboxImg.category?.name || 'Kegiatan Naray') : (lightboxImg.category || 'Kegiatan Naray')}
                    </span>
                  </span>
                  {lightboxImg.date && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Calendar size={13} className="text-teal-600" />
                      <time>{lightboxImg.date}</time>
                    </div>
                  )}
                </div>

                <h3 
                  id="image-modal-title" 
                  className="font-heading text-xl sm:text-2xl font-bold text-slate-900 leading-snug mt-1"
                >
                  {lightboxImg.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                  {lightboxImg.desc}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    onClick={() => setLightboxImg(null)}
                  >
                    Tutup
                  </button>
                  <a
                    href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital, saya melihat foto dokumentasi "${lightboxImg.title}" dan ingin menanyakan informasi terkait kegiatan ini.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>Tanya via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
