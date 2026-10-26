import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  ExternalLink,
  Calendar,
  User,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ArticlesTab({
  healthArticles = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  formatImageUrl
}) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [previewArticle, setPreviewArticle] = useState(null);

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const cats = new Set();
    healthArticles.forEach(art => {
      const cat = typeof art.category === 'string' ? art.category : (art.category?.name || '');
      if (cat) cats.add(cat);
    });
    return ['Semua', ...Array.from(cats)];
  }, [healthArticles]);

  // Filter logic
  const filteredArticles = useMemo(() => {
    return healthArticles.filter(art => {
      const q = (searchQuery || '').toLowerCase();
      const matchTitle = (art.title || '').toLowerCase().includes(q);
      const catName = typeof art.category === 'string' ? art.category : (art.category?.name || '');
      const matchCategorySearch = catName.toLowerCase().includes(q);
      const matchAuthor = (art.author || '').toLowerCase().includes(q);
      const matchExcerpt = (art.excerpt || art.snippet || art.summary || '').toLowerCase().includes(q);

      const matchesSearch = !q || matchTitle || matchCategorySearch || matchAuthor || matchExcerpt;

      const matchesCatFilter =
        selectedCategoryFilter === 'Semua' ||
        catName.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const artStatus = art.status || 'published';
      const matchesStatusFilter =
        selectedStatusFilter === 'Semua' ||
        artStatus.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesCatFilter && matchesStatusFilter;
    });
  }, [healthArticles, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  // Metrics
  const publishedCount = healthArticles.filter(a => (a.status || 'published').toLowerCase() === 'published').length;
  const draftCount = healthArticles.filter(a => (a.status || '').toLowerCase() === 'draft').length;

  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ── TOP HERO BANNER & METRICS ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-heading font-bold uppercase tracking-wider">
              <BookOpen size={14} className="text-teal-300" />
              <span>Manajemen Konten &amp; Edukasi Kesehatan</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Pusat Berita &amp; Artikel Medis
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Kelola publikasi berita kegiatan, tips dokter spesialis, serta edukasi kesehatan keluarga terverifikasi. Semua artikel langsung terindeks di mesin pencari (SEO) dan halaman publik Naray Hospital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/berita-artikel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-heading font-bold border border-slate-600/80 transition-all cursor-pointer shadow-xs"
              title="Buka halaman publik berita & artikel"
            >
              <ArrowUpRight size={15} />
              <span>Lihat di Website</span>
            </a>

            <button
              type="button"
              onClick={() => handleOpenCreate('article')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-heading font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Tulis Artikel Baru</span>
            </button>
          </div>
        </div>

        {/* ── METRICS STRIP ── */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono block">Total Artikel</span>
            <strong className="text-xl sm:text-2xl font-black text-white">{healthArticles.length}</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-mono block">Tayang (Published)</span>
            <strong className="text-xl sm:text-2xl font-black text-emerald-300">{publishedCount}</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-amber-400 uppercase tracking-wider font-mono block">Draf (Draft)</span>
            <strong className="text-xl sm:text-2xl font-black text-amber-300">{draftCount}</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-teal-400 uppercase tracking-wider font-mono block">Kategori Aktif</span>
            <strong className="text-xl sm:text-2xl font-black text-teal-300">{categoriesList.length - 1}</strong>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Toolbar & Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari judul, dokter/penulis, atau kata kunci..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div className="sm:w-48 shrink-0">
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer font-medium"
              >
                {categoriesList.map(c => (
                  <option key={c} value={c}>
                    {c === 'Semua' ? 'Semua Kategori' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown Filter */}
            <div className="sm:w-36 shrink-0">
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-700 rounded-xl border border-slate-200 focus:border-teal-500 outline-none cursor-pointer font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="published">Tayang</option>
                <option value="draft">Draf</option>
              </select>
            </div>
          </div>

          {/* Right: View Mode Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Tampilan:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-teal-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu Visual"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-teal-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Ringkas"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA: CARDS MODE OR TABLE MODE ── */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText size={32} />
            </div>
            <p className="font-heading font-bold text-slate-800 text-base">Tidak ada artikel yang cocok</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategoryFilter !== 'Semua' || selectedStatusFilter !== 'Semua'
                ? 'Coba sesuaikan kata kunci pencarian atau reset filter kategori/status.'
                : 'Belum ada artikel di sistem. Silakan klik tombol Tulis Artikel Baru untuk mempublikasikan.'}
            </p>
            {(searchQuery || selectedCategoryFilter !== 'Semua' || selectedStatusFilter !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilter('Semua');
                  setSelectedStatusFilter('Semua');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-heading font-bold transition-all cursor-pointer"
              >
                <X size={14} />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* ── CARDS VIEW MODE (Editorial UI/UX) ── */
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map(art => {
              const displayImg = formatImageUrl
                ? formatImageUrl(art.thumbnail_url || art.image, '/images/discovery/diagnostic-center.jpg')
                : (art.thumbnail_url || art.image || '/images/discovery/diagnostic-center.jpg');
              const targetSlug = art.slug || toSlug(art.title) || art.id;
              const catName = typeof art.category === 'string' ? art.category : (art.category?.name || 'Edukasi Medis');
              const isDraft = art.status === 'draft';

              return (
                <div
                  key={art.id || art.dbId}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={displayImg}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {catName}
                      </span>

                      {/* Status Badge */}
                      <span className={`absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                        isDraft
                          ? 'bg-amber-500/90 backdrop-blur-xs text-white'
                          : 'bg-emerald-600/90 backdrop-blur-xs text-white'
                      }`}>
                        {isDraft ? 'Draf' : 'Tayang'}
                      </span>

                      {/* Date on image */}
                      <span className="absolute bottom-2.5 left-3 text-[11px] text-slate-200 flex items-center gap-1 font-medium drop-shadow-sm">
                        <Calendar size={12} className="text-teal-400" />
                        <span>{art.date || art.published_at || 'Terbaru'}</span>
                      </span>
                    </div>

                    {/* Body content */}
                    <div className="p-4 sm:p-5">
                      <h4 className="font-heading text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {art.excerpt || art.snippet || art.summary || (art.content ? art.content.slice(0, 110) + '...' : 'Edukasi dan kabar kesehatan terverifikasi dari Naray Hospital.')}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <User size={12} className="text-teal-600" />
                        <span className="truncate">Oleh: <strong className="text-slate-700">{art.author || 'Tim Medis Naray'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`/berita-artikel/${targetSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline"
                      title="Lihat halaman artikel"
                    >
                      <Eye size={13} />
                      <span>Lihat Artikel</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit('article', art)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        title="Edit Artikel"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => promptDelete('article', art, art.title)}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs transition-colors cursor-pointer"
                        title="Hapus Artikel"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── TABLE VIEW MODE ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-20">Cover</th>
                  <th className="py-3 px-4">Judul &amp; Ringkasan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Penulis</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredArticles.map(art => {
                  const targetSlug = art.slug || toSlug(art.title) || art.id;
                  const catName = typeof art.category === 'string' ? art.category : (art.category?.name || 'Kesehatan');

                  return (
                    <tr key={art.id || art.dbId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={formatImageUrl ? formatImageUrl(art.thumbnail_url || art.image, '/images/default-image.svg') : (art.thumbnail_url || art.image || '/images/default-image.svg')}
                          alt={art.title}
                          className="w-14 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={e => { e.currentTarget.src = '/images/default-image.svg'; }}
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <strong className="block text-slate-900 font-bold truncate">
                          {art.title}
                        </strong>
                        <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {art.excerpt || art.snippet || art.summary || 'Tidak ada ringkasan.'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100">
                          {catName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {art.author || 'Tim Medis'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {art.date || art.published_at || 'Hari ini'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={art.status || 'published'} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <a
                            href={`/berita-artikel/${targetSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                            title="Buka artikel"
                          >
                            <ExternalLink size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('article', art)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Edit Artikel"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete('article', art, art.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Hapus Artikel"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
