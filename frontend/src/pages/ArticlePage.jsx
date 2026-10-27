import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Home,
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  PhoneCall,
  Stethoscope,
  X,
  RefreshCw,
  Info,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

const DEFAULT_CATEGORIES = [
  'Semua',
  'Edukasi Kesehatan',
  'Penyakit Dalam',
  'Kesehatan Jantung',
  'Kesehatan Anak',
  'Kesehatan Paru',
  'Bedah & Ortopedi',
  'Kebidanan & Kandungan',
  'Berita',
  'Pengumuman',
  'Tips Sehat'
];

export default function ArticlePage() {
  const { healthArticles = [], hospitalInfo = {}, refreshBackendData } = useHospitalData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('kategori') || 'Semua'
  );
  const [searchKeyword, setSearchKeyword] = useState(
    () => searchParams.get('q') || ''
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 articles (2 rows of 3) per page for clean alignment

  useEffect(() => {
    const k = searchParams.get('kategori');
    const q = searchParams.get('q');
    if (k !== null) setSelectedCategory(k);
    if (q !== null) setSearchKeyword(q);
  }, [searchParams]);

  // Reset pagination to page 1 whenever category, search, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchKeyword, itemsPerPage]);

  const updateQueryParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'Semua') p.set(key, val);
    else p.delete(key);
    setSearchParams(p, { replace: true });
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    updateQueryParam('kategori', cat);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedCategory('Semua');
    setSearchKeyword('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof refreshBackendData === 'function') {
        await refreshBackendData();
      }
    } catch (err) {
      console.warn('Gagal memuat ulang data artikel:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Helper to get curated high-resolution photography for fallback
  const getArticleImage = (art, idx) => {
    if (art.image && !art.image.includes('.svg') && !art.image.includes('default')) {
      return art.image;
    }
    const fallbacks = [
      '/images/discovery/diagnostic-center.jpg',
      '/images/discovery/mcu-lab.jpg',
      '/images/discovery/vip-room.jpg',
      '/images/articles/p24ZdJ92E65CCO3e57TrP5CbqDz37IPgJwfgkDVp.webp',
      '/images/facilities/qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f.webp',
      '/images/rooms/t86h6byAPNNbxedD8th6bYZoUF6jevuBwVBObKD6.webp'
    ];
    return fallbacks[idx % fallbacks.length];
  };

  // Helper to convert title to canonical slug
  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Filter only published articles for public view
  const publishedArticles = useMemo(() => {
    return healthArticles.filter(a => (a.status || 'published').toLowerCase() === 'published');
  }, [healthArticles]);

  // Calculate dynamic article counts per category
  const categoryCounts = useMemo(() => {
    const counts = { 'Semua': publishedArticles.length };
    DEFAULT_CATEGORIES.forEach(cat => {
      if (cat !== 'Semua') {
        const catLower = cat.toLowerCase();
        counts[cat] = publishedArticles.filter(a => {
          const aCat = (a.category || '').toLowerCase();
          return aCat.includes(catLower) || catLower.includes(aCat);
        }).length;
      }
    });
    return counts;
  }, [publishedArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        (art.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes((art.category || '').toLowerCase());

      const matchSearch =
        !searchKeyword ||
        (art.title || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (art.summary || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (art.content || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (art.author || '').toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [publishedArticles, selectedCategory, searchKeyword]);

  // Pagination computations
  const effectiveItemsPerPage = itemsPerPage === -1 ? filteredArticles.length : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / (effectiveItemsPerPage || 1)));
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const paginatedArticles = itemsPerPage === -1
    ? filteredArticles
    : filteredArticles.slice(startIndex, startIndex + effectiveItemsPerPage);
  const showingStart = filteredArticles.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + (effectiveItemsPerPage || filteredArticles.length), filteredArticles.length);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('article-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasFilter = selectedCategory !== 'Semua' || Boolean(searchKeyword);

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
              <span className="text-slate-900 font-semibold">Berita &amp; Artikel Edukasi</span>
            </nav>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pusat Edukasi Medis Naray Hospital
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title (Matching DoctorSchedulePage Reference) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Temukan artikel &amp; kabar kesehatan
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Pilih kategori artikel untuk membaca edukasi medis, tips gaya hidup sehat, kabar layanan, dan informasi resmi dari dokter spesialis Naray Hospital.
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
                placeholder="Cari topik kesehatan, gejala, atau judul berita..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  updateQueryParam('q', e.target.value);
                }}
                className="w-full h-12 pl-11 pr-10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:bg-slate-50/50 outline-none transition-all font-medium"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    updateQueryParam('q', '');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Category Select Dropdown */}
            <div className="md:w-72 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-xs sm:text-sm text-slate-700 bg-transparent focus:bg-slate-50/50 outline-none cursor-pointer font-medium appearance-none"
              >
                <option value="Semua">Semua Kategori ({publishedArticles.length})</option>
                {DEFAULT_CATEGORIES.filter(c => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCounts[cat] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Reset & Refresh */}
            <div className="flex items-center gap-2 shrink-0">
              {hasFilter && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Reset filter dan pencarian"
                >
                  <X size={15} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui berita'}</span>
              </button>
            </div>
          </div>

          {/* ── 4. Signature Yellow / Amber Alert Box (Matching Reference Screenshot) ── */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3 my-6 shadow-2xs">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal m-0">
              <strong>Informasi medis terverifikasi.</strong> Seluruh artikel dan edukasi kesehatan disusun atau ditinjau langsung oleh tim dokter spesialis Naray Hospital untuk memastikan keakuratan informasi ilmiah bagi masyarakat Kota Dumai.
            </p>
          </div>

          {/* ── 5. Category Filter Pills Row (Horizontal Carousel with Badges) ── */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Kategori Artikel">
            {DEFAULT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20 scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-medium'
                  }`}
                >
                  <span>{cat}</span>
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
          <div id="article-grid-start" className="scroll-mt-28" />

          {/* ── 6. Section Sub-header & Results Count + Legend ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                {selectedCategory === 'Semua' ? 'ARTIKEL TERBARU' : `KATEGORI: ${selectedCategory.toUpperCase()}`}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedCategory === 'Semua' ? 'Daftar Artikel & Berita Medis' : selectedCategory}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Menampilkan <strong>{showingStart} - {showingEnd}</strong> dari <strong>{filteredArticles.length}</strong> artikel terverifikasi
                {searchKeyword && <> yang memuat kata kunci <strong>&quot;{searchKeyword}&quot;</strong></>}
              </p>
            </div>

            {/* Status Legend Badges */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                Medis Terverifikasi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
                Kabar Resmi RS
              </span>
            </div>
          </div>

          {/* ── 7. 3-Column Articles Grid (Identical to HospitalNewsSection & Reference) ── */}
          {paginatedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 mb-10">
                {paginatedArticles.map((article, idx) => {
                  const imgSrc = getArticleImage(article, idx);
                  const dateStr = article.date || 'Terbaru';
                  const targetSlug = article.slug || toSlug(article.title) || article.id;
                  const catName = typeof article.category === 'object' 
                    ? (article.category?.name || 'Kesehatan') 
                    : (article.category || 'Edukasi Kesehatan');

                  return (
                    <Link
                      key={article.id || idx}
                      to={`/berita-artikel/${targetSlug}`}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer no-underline"
                    >
                      {/* Image Cover with Floating Category Badge & Read Time Badge */}
                      <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden shrink-0">
                        <img
                          src={imgSrc}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40" />

                        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                          {catName}
                        </span>

                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-xs text-white text-[11px] font-medium shadow-md">
                          <Clock size={11} className="text-teal-400" />
                          <span>{article.readTime || '4 Menit'}</span>
                        </span>
                      </div>

                      {/* Card Body (Strict Vertical Equalization) */}
                      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                        <div>
                          {/* Date */}
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-teal-600 shrink-0" />
                              <span>{dateStr}</span>
                            </div>
                            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                              Terverifikasi
                            </span>
                          </div>

                          {/* Title with min-h for strict alignment */}
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2.5 min-h-[3.25rem]">
                            {article.title}
                          </h3>

                          {/* Excerpt with min-h for strict alignment */}
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal line-clamp-2 mb-6 min-h-[2.5rem]">
                            {article.snippet || article.summary || (article.content ? article.content.slice(0, 140) + '...' : 'Informasi kesehatan keluarga terpercaya dari tim dokter spesialis Naray Hospital.')}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium truncate max-w-[160px] sm:max-w-[190px] flex items-center gap-1.5">
                            <User size={13} className="text-teal-600 shrink-0" />
                            <span className="truncate">Oleh: <strong className="text-slate-700">{article.author ? article.author.split(',')[0] : 'Humas Naray'}</strong></span>
                          </span>

                          <span className="inline-flex items-center gap-1 font-bold text-teal-700 group-hover:text-teal-800 transition-all group-hover:translate-x-1 shrink-0">
                            <span>Baca Selengkapnya</span>
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ── 8. Responsive Pagination Controls Bar (Identical to DoctorSchedulePage) ── */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Left: Summary & Items Per Page Selector */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                  <span>
                    Menampilkan <strong>{showingStart} - {showingEnd}</strong> dari <strong>{filteredArticles.length}</strong> artikel
                  </span>
                  
                  <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                    <span className="text-slate-400 text-xs">Per halaman:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value={6}>6 artikel</option>
                      <option value={9}>9 artikel</option>
                      <option value={12}>12 artikel</option>
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
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Page Number Pills */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;

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
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                <BookOpen size={30} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                Tidak Ada Artikel yang Sesuai
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Tidak ditemukan artikel untuk kata kunci atau kategori yang Anda pilih. Silakan gunakan kata kunci lain atau tampilkan seluruh artikel.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Tampilkan Semua Artikel</span>
              </button>
            </div>
          )}

          {/* ── 9. Bottom Fast Action Callout Banner (Matching DoctorSchedulePage) ── */}
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mt-16">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>KONSULTASI SPESIALIS</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Konsultasikan Keluhan Kesehatan Anda Langsung dengan Dokter Spesialis
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Dapatkan pemeriksaan menyeluruh dan panduan terapi klinis yang tepat di Naray Hospital Kota Dumai. Siap melayani pasien Umum, BPJS, dan Asuransi Swasta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/dokter-jadwal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Stethoscope size={16} />
                <span>Lihat Jadwal Dokter</span>
              </Link>
              <a
                href={`https://wa.me/${(hospitalInfo?.callCenter || '628137258376').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi pelayanan.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Call Center: {hospitalInfo?.callCenter || '+62 813-7258-376'}</span>
              </a>
            </div>
          </section>

        </div>

      </div>
    </PageLayout>
  );
}
