import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Play, Film,
  Image as ImageIcon, Eye, LayoutGrid, List, Sparkles,
  Calendar, Tag, ExternalLink, Filter, Video, Layers,
  ChevronRight, CheckCircle2, ShieldCheck, Info
} from 'lucide-react';

import StatusBadge from '../components/StatusBadge';

// Ekstrak ID video YouTube
function getYouTubeVideoId(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// Dapatkan thumbnail YouTube
function getYouTubeThumbnail(url) {
  const vidId = getYouTubeVideoId(url);
  if (vidId) {
    return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
  }
  return null;
}

// Dapatkan embed URL YouTube
function getYouTubeEmbedUrl(url) {
  const vidId = getYouTubeVideoId(url);
  if (vidId) {
    return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
  }
  if (url && url.includes('embed')) return url;
  return url;
}

export default function GalleryTab({
  filteredMediaList = [],
  mediaTypeFilter = 'all',
  setMediaTypeFilter,
  allMediaList = [],
  galleryActivities = [],
  videoList = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  formatImageUrl
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | categoryName
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [previewMedia, setPreviewMedia] = useState(null); // Lightbox / Video Modal

  // Ekstrak semua kategori unik
  const categories = useMemo(() => {
    const set = new Set();
    allMediaList.forEach(m => {
      const cat = typeof m.category === 'object'
        ? (m.category?.name || m.categoryName)
        : (m.category || m.categoryName);
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return Array.from(set);
  }, [allMediaList]);

  // Filter gabungan
  const displayMediaList = useMemo(() => {
    return filteredMediaList.filter(m => {
      // Filter status
      const mStatus = (m.status || 'active').toLowerCase();
      if (statusFilter === 'active' && mStatus !== 'active') return false;
      if (statusFilter === 'inactive' && mStatus !== 'inactive') return false;

      if (activeCategory === 'all') return true;
      const cat = typeof m.category === 'object'
        ? (m.category?.name || m.categoryName)
        : (m.category || m.categoryName);
      return (cat || '').toLowerCase() === activeCategory.toLowerCase();
    });
  }, [filteredMediaList, activeCategory, statusFilter]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = allMediaList.length;
    const photoCount = galleryActivities.length;
    const videoCount = videoList.length;
    const activeCount = allMediaList.filter(m => (m.status || 'active') === 'active').length;
    const inactiveCount = allMediaList.filter(m => (m.status || 'active') === 'inactive').length;
    return { total, photoCount, videoCount, activeCount, inactiveCount, categoryCount: categories.length };
  }, [allMediaList, galleryActivities, videoList, categories]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Dokumentasi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Dokumentasi
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {stats.total}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Media aktif di website
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Layers size={24} />
          </div>
        </div>

        {/* Foto Kegiatan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Foto Kegiatan
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-sky-700 leading-none">
              {stats.photoCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Aktivitas RS &amp; fasilitas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <ImageIcon size={24} />
          </div>
        </div>

        {/* Video YouTube */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Video Edukasi YouTube
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-rose-700 leading-none">
              {stats.videoCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Video profil &amp; kesehatan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Film size={24} />
          </div>
        </div>

        {/* Kategori Dokumentasi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Kategori Kegiatan
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-teal-700 leading-none">
              {stats.categoryCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Topik publikasi aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Tag size={24} />
          </div>
        </div>

      </div>

      {/* ── Main Container: Toolbar & View ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Header Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                  Dokumentasi Galeri &amp; Video ({displayMediaList.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publikasi foto aktivitas rumah sakit dan video edukasi kesehatan bagi masyarakat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Type Switcher Pills */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaTypeFilter === 'all'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({allMediaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mediaTypeFilter === 'photo'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>Foto ({galleryActivities.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mediaTypeFilter === 'video'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Film size={13} />
                  <span>Video ({videoList.length})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 sm:w-60">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari dokumentasi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* View Switcher (Grid vs Table) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-teal-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tampilan Grid Galeri Visual"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-teal-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tampilan Tabel Rapi"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Tombol Tambah Media */}
              <button
                type="button"
                onClick={() => handleOpenCreate('gallery')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Tambah Media</span>
              </button>
            </div>
          </div>

          {/* Filter Bar: Category & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Category Filter Pills (Jika ada kategori) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Kategori:
              </span>
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer font-medium"
              >
                <option value="all">Semua Status ({stats.total})</option>
                <option value="active">Aktif / Tampil ({stats.activeCount})</option>
                <option value="inactive">Non-Aktif / Arsip ({stats.inactiveCount})</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── View 1: Grid Mode (Visual Gallery Showcase) ── */}
        {viewMode === 'grid' && (
          <div className="p-4 sm:p-6">
            {displayMediaList.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <ImageIcon size={44} className="mx-auto text-slate-300 mb-3" />
                <h4 className="font-heading text-base font-bold text-slate-700">Tidak ada media dokumentasi ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter tipe media.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayMediaList.map(item => {
                  const isVideo = item.type === 'video';
                  const ytThumb = isVideo ? getYouTubeThumbnail(item.youtubeEmbed || item.url) : null;
                  const imgSrc = isVideo
                    ? (ytThumb || '/images/default-video.jpg')
                    : (formatImageUrl ? formatImageUrl(item.image || item.url, '/images/default-image.svg') : (item.image || item.url || '/images/default-image.svg'));

                  const catLabel = typeof item.category === 'object'
                    ? (item.category?.name || item.categoryName || 'Kegiatan Naray')
                    : (item.category || item.categoryName || 'Kegiatan Naray');

                  return (
                    <div
                      key={item.id || item.dbId}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Media Thumbnail Box */}
                      <div
                        className="relative aspect-16/10 bg-slate-900 overflow-hidden cursor-pointer"
                        onClick={() => setPreviewMedia(item)}
                      >
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                          onError={e => { e.target.src = '/images/default-image.svg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                        {/* Play Button Icon for Video */}
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-2xs ring-4 ring-white/30">
                              <Play size={22} fill="#ffffff" className="ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1.5 ${
                              isVideo
                                ? 'bg-rose-600/90 text-white'
                                : 'bg-sky-600/90 text-white'
                            }`}>
                              {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
                              <span>{isVideo ? 'Video YouTube' : 'Foto'}</span>
                            </span>
                            <StatusBadge status={(item.status || 'active').toLowerCase()} />
                          </div>

                          <span className="text-[10px] font-semibold bg-slate-950/70 text-slate-200 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {catLabel}
                          </span>
                        </div>

                        {/* Bottom Date Overlay */}
                        {item.date && (
                          <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-slate-300 flex items-center gap-1 drop-shadow-xs">
                            <Calendar size={11} />
                            <span>{item.date}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Card Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h4
                            onClick={() => setPreviewMedia(item)}
                            className="font-heading text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                          >
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.desc || item.description || item.url || 'Dokumentasi resmi Naray Hospital'}
                          </p>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewMedia(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            {isVideo ? <Play size={12} className="text-rose-600" /> : <Eye size={12} className="text-teal-600" />}
                            <span>{isVideo ? 'Tonton' : 'Buka'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(isVideo ? 'video' : 'gallery', item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Edit Media"
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete(isVideo ? 'video' : 'gallery', item, item.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Hapus Media"
                            >
                              <Trash2 size={12} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── View 2: Table Mode (Data Dense) ── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-24">Media</th>
                  <th className="py-3 px-4">Judul &amp; Deskripsi</th>
                  <th className="py-3 px-4">Tipe Media</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tanggal Publikasi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {displayMediaList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <ImageIcon size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada media dokumentasi ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter tipe.</p>
                    </td>
                  </tr>
                ) : (
                  displayMediaList.map(item => {
                    const isVideo = item.type === 'video';
                    const ytThumb = isVideo ? getYouTubeThumbnail(item.youtubeEmbed || item.url) : null;
                    const imgSrc = isVideo
                      ? (ytThumb || '/images/default-video.jpg')
                      : (formatImageUrl ? formatImageUrl(item.image || item.url, '/images/default-image.svg') : (item.image || item.url || '/images/default-image.svg'));

                    const catLabel = typeof item.category === 'object'
                      ? (item.category?.name || item.categoryName || 'Kegiatan Naray')
                      : (item.category || item.categoryName || 'Kegiatan Naray');

                    return (
                      <tr key={item.id || item.dbId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setPreviewMedia(item)}
                            className="w-16 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center relative cursor-pointer group"
                          >
                            <img
                              src={imgSrc}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={e => { e.target.src = '/images/default-image.svg'; }}
                            />
                            {isVideo && (
                              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                <Play size={16} fill="#ffffff" className="text-white" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <strong
                            onClick={() => setPreviewMedia(item)}
                            className="block text-slate-900 font-bold hover:text-teal-700 cursor-pointer transition-colors max-w-md truncate"
                          >
                            {item.title}
                          </strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 block max-w-md">
                            {item.desc || item.description || item.url || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                            isVideo
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            {isVideo ? <Film size={12} /> : <ImageIcon size={12} />}
                            <span>{isVideo ? 'Video YouTube' : 'Foto Kegiatan'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            {catLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                          {item.date || 'Terbaru'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={(item.status || 'active').toLowerCase()} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewMedia(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                              title="Pratinjau Media"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(isVideo ? 'video' : 'gallery', item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Edit Media"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete(isVideo ? 'video' : 'gallery', item, item.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Hapus Media"
                            >
                              <Trash2 size={13} />
                              <span>Hapus</span>
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
        )}

      </div>

      {/* ── Modal Pratinjau Media (Lightbox & Video Player) ── */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button Floating */}
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
            >
              <X size={18} />
            </button>

            {/* Media Player or Full Image */}
            <div className="relative aspect-16/9 bg-slate-950 shrink-0 flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewMedia.youtubeEmbed || previewMedia.url)}
                  title={previewMedia.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={formatImageUrl ? formatImageUrl(previewMedia.image || previewMedia.url, '/images/default-image.svg') : (previewMedia.image || previewMedia.url || '/images/default-image.svg')}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                  onError={e => { e.target.src = '/images/default-image.svg'; }}
                />
              )}
            </div>

            {/* Media Information */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  previewMedia.type === 'video'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}>
                  {previewMedia.type === 'video' ? 'Video YouTube' : 'Foto Kegiatan'}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {typeof previewMedia.category === 'object'
                    ? (previewMedia.category?.name || previewMedia.categoryName || 'Kegiatan Naray')
                    : (previewMedia.category || previewMedia.categoryName || 'Kegiatan Naray')}
                </span>

                {previewMedia.date && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{previewMedia.date}</span>
                  </span>
                )}
              </div>

              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {previewMedia.title}
              </h3>

              {(previewMedia.desc || previewMedia.description) && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {previewMedia.desc || previewMedia.description}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                Dokumentasi Publik Naray Hospital
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = previewMedia;
                    setPreviewMedia(null);
                    handleOpenEdit(m.type === 'video' ? 'video' : 'gallery', m);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Ubah Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
