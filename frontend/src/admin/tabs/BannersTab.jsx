import React, { useState } from 'react';
import {
  LayoutTemplate, Plus, Pencil, Trash2, ArrowUp, ArrowDown,
  Eye, CheckCircle2, AlertTriangle, Sparkles, Layers,
  ExternalLink, Info, RotateCcw, Copy, MousePointerClick, ShieldCheck
} from 'lucide-react';

export default function BannersTab({
  bannerSlides = [],
  setBannerSlides,
  DEFAULT_BANNER_SLIDES = [],
  showToast,
  setCrudModal,
  promptDelete,
  formatImageUrl
}) {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Pastikan index preview aman jika jumlah slide berubah
  const activeSlide = bannerSlides[selectedPreviewIndex] || bannerSlides[0] || null;

  // Move slide up / down for ordering
  const handleMoveSlide = (index, direction) => {
    if (!setBannerSlides) return;
    const newSlides = [...bannerSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setBannerSlides(newSlides);
    try {
      localStorage.setItem('naray_banner_slides', JSON.stringify(newSlides));
      if (showToast) showToast(`Urutan slide #${index + 1} berhasil dipindahkan ke #${targetIndex + 1}.`);
    } catch (e) {
      console.warn('Gagal menyimpan urutan banner:', e);
    }

    if (selectedPreviewIndex === index) {
      setSelectedPreviewIndex(targetIndex);
    } else if (selectedPreviewIndex === targetIndex) {
      setSelectedPreviewIndex(index);
    }
  };

  // Duplicate slide as template
  const handleDuplicateSlide = (slide) => {
    if (!setCrudModal) return;
    const duplicatedItem = {
      ...slide,
      id: undefined, // ensure new ID generated
      title: `${slide.title} (Salinan)`
    };
    setCrudModal({ isOpen: true, entity: 'banner', item: duplicatedItem });
  };

  // Reset to default banners
  const handleResetToDefault = () => {
    if (!setBannerSlides || !DEFAULT_BANNER_SLIDES.length) return;
    const confirmReset = window.confirm(
      'Kembalikan seluruh slide banner ke setelan bawaan Naray Hospital? Semua perubahan kustom slide akan di-reset.'
    );
    if (!confirmReset) return;

    setBannerSlides(DEFAULT_BANNER_SLIDES);
    try {
      localStorage.setItem('naray_banner_slides', JSON.stringify(DEFAULT_BANNER_SLIDES));
      if (showToast) showToast('Slide banner beranda berhasil dikembalikan ke standar awal.');
      setSelectedPreviewIndex(0);
    } catch (e) {
      console.warn('Gagal reset banner:', e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ── TOP HERO BANNER & CONTROL BAR ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-heading font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-teal-300" />
              <span>Etalase Hero Beranda Pasien</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Manajemen Slide Banner Beranda
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Atur urutan tayang, judul promo/layanan, highlight spesialis, badge akreditasi, dan tombol panggilan aksi (CTA) yang tampil pada layar pertama pengunjung website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {DEFAULT_BANNER_SLIDES.length > 0 && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-heading font-bold border border-slate-600/80 transition-all cursor-pointer shadow-xs"
                title="Reset banner ke standar bawaan rumah sakit"
              >
                <RotateCcw size={15} />
                <span>Reset Standar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: null })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-heading font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>Tambah Slide Baru</span>
            </button>
          </div>
        </div>

        {/* Mini stats metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 font-medium block">Total Slide Aktif</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-heading font-black text-xl text-teal-400">{bannerSlides.length}</span>
              <span className="text-[11px] text-slate-400 font-mono">Slide</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 font-medium block">Mode Urutan</span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-200 text-xs font-semibold">
              <Layers size={14} className="text-teal-400" />
              <span>Hierarkis (Top to Down)</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 font-medium block">Slide UGD / Darurat</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-heading font-black text-xl text-rose-400">
                {bannerSlides.filter(s => s.badgeType === 'emergency').length}
              </span>
              <span className="text-[11px] text-rose-300">Siaga 24 Jam</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 font-medium block">Kondisi Penyimpanan</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={15} />
              <span>Tersinkron Web</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE INTERACTIVE PREVIEW CARD (WYSIWYG) ── */}
      {activeSlide && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                <Eye size={17} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-tight">
                  Simulasi Tampilan Hero Beranda (Live Preview)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pratinjau langsung bagaimana slide terpilih akan tampil di mata pasien
                </p>
              </div>
            </div>

            {/* Slide Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {bannerSlides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setSelectedPreviewIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPreviewIndex === idx
                      ? 'bg-teal-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Slide #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Stage Mockup */}
          <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] bg-slate-900 flex flex-col justify-end p-6 sm:p-8 text-white shadow-inner">
            {/* Background Image with Dark Vignette */}
            {activeSlide.image && (
              <img
                src={formatImageUrl ? formatImageUrl(activeSlide.image, '/images/default-image.svg') : activeSlide.image}
                alt={activeSlide.title}
                className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105 filter blur-[0.5px]"
                onError={e => { e.currentTarget.src = '/images/default-image.svg'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

            {/* Slide Content Overlays */}
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-wider border shadow-xs ${
                  activeSlide.badgeType === 'emergency'
                    ? 'bg-rose-500/90 text-white border-rose-400'
                    : 'bg-teal-500/90 text-slate-950 border-teal-300'
                }`}>
                  {activeSlide.badge || 'Informasi Utama'}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  Slide {selectedPreviewIndex + 1} dari {bannerSlides.length}
                </span>
              </div>

              <h4 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-white leading-tight drop-shadow-xs">
                {activeSlide.title || 'Judul Utama Belum Diisi'}
              </h4>

              {activeSlide.highlight && (
                <p className="text-teal-300 font-heading font-bold text-xs sm:text-sm drop-shadow-xs">
                  {activeSlide.highlight}
                </p>
              )}

              {activeSlide.description && (
                <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {activeSlide.description}
                </p>
              )}

              {/* Action Buttons Mockup */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {activeSlide.ctaPrimary && (
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold shadow-sm ${
                    activeSlide.isEmergencyPrimary || activeSlide.badgeType === 'emergency'
                      ? 'bg-rose-600 text-white'
                      : 'bg-teal-500 text-slate-950'
                  }`}>
                    <MousePointerClick size={14} />
                    <span>{activeSlide.ctaPrimary}</span>
                  </span>
                )}
                {activeSlide.ctaSecondary && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-white text-xs font-heading font-semibold border border-white/20">
                    <span>{activeSlide.ctaSecondary}</span>
                    <span className="text-[10px] text-slate-400 font-mono">→ #{activeSlide.targetSection || 'poliklinik'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Overlay on Preview */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: activeSlide })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-heading font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              >
                <Pencil size={13} className="text-teal-700" />
                <span>Edit Slide Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN SLIDES LIST & CONTROLS ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Toolbar & View Toggle */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                Daftar Susunan Slide Banner ({bannerSlides?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan panah naik/turun untuk mengatur prioritas urutan tampil di halaman depan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher: Cards vs Table */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu Visual
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabel Ringkas
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: null })}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-heading font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Slide</span>
            </button>
          </div>
        </div>

        {/* ── CARD GRID VIEW (PREMIUM VISUAL) ── */}
        {viewMode === 'cards' && (
          <div className="p-4 sm:p-6">
            {(!bannerSlides || bannerSlides.length === 0) ? (
              <div className="py-16 text-center text-slate-500">
                <LayoutTemplate size={44} className="mx-auto text-slate-300 mb-3" />
                <h4 className="font-heading font-bold text-slate-800 text-base">Belum ada slide kustom</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Slide bawaan sistem saat ini ditampilkan secara default di halaman depan. Klik Tambah Slide untuk membuat banner promosi atau layanan baru.
                </p>
                <button
                  type="button"
                  onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: null })}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-heading font-bold shadow-xs hover:bg-teal-700 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Buat Slide Pertama</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bannerSlides.map((slide, index) => {
                  const displayImg = formatImageUrl
                    ? formatImageUrl(slide.image, '/images/default-image.svg')
                    : (slide.image || '/images/default-image.svg');
                  const isSelected = selectedPreviewIndex === index;

                  return (
                    <div
                      key={slide.id || index}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/15 shadow-sm'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Card Top: Image & Header info */}
                      <div>
                        <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={displayImg}
                            alt={slide.title || 'Slide'}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            onError={e => { e.currentTarget.src = '/images/default-image.svg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-black/20" />

                          {/* Order Badge & Badge Type */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-white/95 font-heading font-black text-slate-900 text-xs shadow-md">
                              #{index + 1}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                              slide.badgeType === 'emergency'
                                ? 'bg-rose-500 text-white border border-rose-400'
                                : 'bg-teal-500 text-slate-950 border border-teal-300'
                            }`}>
                              {slide.badge || 'Informasi'}
                            </span>
                          </div>

                          {/* Quick Preview Pin Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewIndex(index)}
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[11px] font-heading font-bold shadow-md transition-all cursor-pointer backdrop-blur-md ${
                              isSelected
                                ? 'bg-teal-500 text-slate-950 ring-1 ring-white'
                                : 'bg-black/50 hover:bg-black/70 text-white'
                            }`}
                          >
                            <Eye size={12} className="inline mr-1" />
                            {isSelected ? 'Pratinjau Aktif' : 'Lihat'}
                          </button>

                          {/* Slide Title in image overlay */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h4 className="font-heading font-bold text-white text-sm line-clamp-1 drop-shadow-xs">
                              {slide.title}
                            </h4>
                            {slide.highlight && (
                              <p className="text-teal-300 text-xs font-semibold line-clamp-1 mt-0.5">
                                {slide.highlight}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Body: Details */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {slide.description || 'Tidak ada deskripsi rinci untuk slide ini.'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tombol Utama (CTA 1)</span>
                              <span className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
                                {slide.ctaPrimary || '-'}
                              </span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tombol Kedua (CTA 2)</span>
                              <span className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
                                {slide.ctaSecondary || '-'}
                                {slide.targetSection && (
                                  <span className="text-[10px] text-teal-700 ml-1">#{slide.targetSection}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Reorder & Action buttons */}
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Order Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveSlide(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                            title="Pindah urutan ke atas"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSlide(index, 'down')}
                            disabled={index === bannerSlides.length - 1}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                            title="Pindah urutan ke bawah"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono ml-1">
                            Urutan #{index + 1}
                          </span>
                        </div>

                        {/* Edit, Copy, Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateSlide(slide)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                            title="Duplikat sebagai draft baru"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: slide })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-heading font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <Pencil size={13} className="text-teal-700" />
                            <span>Edit</span>
                          </button>

                          {bannerSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => promptDelete('banner', slide, slide.title)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs transition-colors cursor-pointer shadow-2xs"
                              title="Hapus slide banner"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TABLE VIEW (FOR QUICK BATCH REVIEWS) ── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-heading font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-20 text-center">Urutan</th>
                  <th className="py-3 px-4 w-32">Preview Foto</th>
                  <th className="py-3 px-4 w-36">Badge &amp; Tema</th>
                  <th className="py-3 px-4">Judul &amp; Highlight</th>
                  <th className="py-3 px-4">Tombol Aksi (CTA)</th>
                  <th className="py-3 px-4 text-right w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {(!bannerSlides || bannerSlides.length === 0) ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <LayoutTemplate size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Belum ada slide banner kustom</p>
                      <p className="text-xs text-slate-400 mt-0.5">Slide bawaan sistem akan aktif secara otomatis.</p>
                    </td>
                  </tr>
                ) : (
                  bannerSlides.map((slide, index) => {
                    const displayImg = formatImageUrl
                      ? formatImageUrl(slide.image, '/images/default-image.svg')
                      : (slide.image || '/images/default-image.svg');
                    const isSelected = selectedPreviewIndex === index;

                    return (
                      <tr
                        key={slide.id || index}
                        className={`transition-colors ${
                          isSelected ? 'bg-teal-50/30' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded bg-slate-100 hover:bg-teal-50 text-slate-600 disabled:opacity-20 cursor-pointer"
                              title="Naik"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span className="font-heading font-black text-slate-800 text-xs px-1">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(index, 'down')}
                              disabled={index === bannerSlides.length - 1}
                              className="p-1 rounded bg-slate-100 hover:bg-teal-50 text-slate-600 disabled:opacity-20 cursor-pointer"
                              title="Turun"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setSelectedPreviewIndex(index)}
                            className="w-24 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-teal-400 transition-all relative group"
                            title="Klik untuk pratinjau di layar atas"
                          >
                            <img
                              src={displayImg}
                              alt={slide.title || 'Slide'}
                              className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.src = '/images/default-image.svg'; }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                              Lihat
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border ${
                            slide.badgeType === 'emergency'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {slide.badge || 'Informasi'}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-1 font-medium">
                            {slide.badgeType === 'emergency' ? '🔴 Merah UGD' : '🟢 Toska Medis'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 font-heading font-bold">{slide.title}</strong>
                          {slide.highlight && (
                            <span className="text-xs text-teal-700 font-semibold block mt-0.5">{slide.highlight}</span>
                          )}
                          <span className="text-xs text-slate-500 line-clamp-2 block mt-1 leading-relaxed">
                            {slide.description}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-slate-800 space-y-0.5">
                            <div><strong>CTA 1:</strong> {slide.ctaPrimary || '-'}</div>
                            <div className="text-slate-500">
                              <strong>CTA 2:</strong> {slide.ctaSecondary || '-'} → <em className="text-teal-700">#{slide.targetSection || 'poliklinik'}</em>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedPreviewIndex(index)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                              title="Tampilkan di Pratinjau Atas"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateSlide(slide)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                              title="Duplikat Slide"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCrudModal({ isOpen: true, entity: 'banner', item: slide })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-heading font-bold transition-colors cursor-pointer"
                              title="Edit Slide Banner"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            {bannerSlides.length > 1 && (
                              <button
                                type="button"
                                onClick={() => promptDelete('banner', slide, slide.title)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs transition-colors cursor-pointer"
                                title="Hapus Slide Banner"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
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

      {/* ── FOOTER GUIDE / TIPS CARD ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={17} />
        </div>
        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
          <h5 className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
            Panduan Optimalisasi Banner Beranda (UI/UX Best Practices)
          </h5>
          <p>
            • <strong>Ukuran Gambar Optimal</strong>: Gunakan rasio 16:9 atau 21:9 dengan resolusi minimal 1920×1080 px agar tajam di layar desktop maupun ponsel.
          </p>
          <p>
            • <strong>Slide Pertama (#1)</strong>: Disarankan memuat layanan unggulan spesialis atau akreditasi utama rumah sakit.
          </p>
          <p>
            • <strong>Tema UGD (Merah)</strong>: Pilih badge type <em>🔴 Merah UGD</em> untuk mengaktifkan tombol kontak darurat langsung ke hotline ambulans / IGD Naray Hospital.
          </p>
        </div>
      </div>
    </div>
  );
}
