import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Activity, Sparkles, HeartPulse,
  Clock, Users, CheckCircle2, Check, Eye, LayoutGrid, List,
  ShieldCheck, FileText, Stethoscope, HelpCircle, AlertCircle,
  Tag, Award, ChevronRight
} from 'lucide-react';

import StatusBadge from '../components/StatusBadge';

// Helper format Rupiah
function formatPriceRupiah(val) {
  if (!val) return 'Hubungi Kami';
  if (typeof val === 'string' && val.toLowerCase().includes('rp')) {
    return val;
  }
  const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(num) || num <= 0) return typeof val === 'string' ? val : 'Hubungi Kami';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function McuTab({
  mcuPackages = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'popular' | 'general' | 'specific'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [previewPackage, setPreviewPackage] = useState(null); // Modal detail pratinjau

  // Ekstrak item pemeriksaan
  const getPackageItems = (pkg) => {
    if (Array.isArray(pkg.items) && pkg.items.length > 0) return pkg.items;
    if (Array.isArray(pkg.features) && pkg.features.length > 0) return pkg.features;
    if (typeof pkg.items === 'string') {
      return pkg.items.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (typeof pkg.description === 'string') {
      return pkg.description.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [
      'Pemeriksaan Fisik oleh Dokter',
      'Hematologi Darah Lengkap',
      'Profil Kolesterol & Gula Darah',
      'Resume Medis Hasil MCU'
    ];
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const total = mcuPackages.length;
    const popularCount = mcuPackages.filter(m => Boolean(m.badge)).length;
    const activeCount = mcuPackages.filter(m => (m.status || 'active') === 'active').length;
    const inactiveCount = mcuPackages.filter(m => (m.status || 'active') === 'inactive').length;

    let totalItemsCount = 0;
    mcuPackages.forEach(m => {
      totalItemsCount += getPackageItems(m).length;
    });

    return {
      total,
      popularCount,
      activeCount,
      inactiveCount,
      totalItemsCount,
      avgItems: total > 0 ? Math.round(totalItemsCount / total) : 0
    };
  }, [mcuPackages]);

  // Filtered packages
  const filteredMcu = useMemo(() => {
    return mcuPackages.filter(m => {
      const q = searchQuery.toLowerCase();
      const items = getPackageItems(m);

      const matchesSearch = !q ||
        m.name?.toLowerCase().includes(q) ||
        (m.badge && m.badge.toLowerCase().includes(q)) ||
        (m.target && m.target.toLowerCase().includes(q)) ||
        (m.highlight && m.highlight.toLowerCase().includes(q)) ||
        items.some(it => it.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter status
      const mStatus = (m.status || 'active').toLowerCase();
      if (statusFilter === 'active' && mStatus !== 'active') return false;
      if (statusFilter === 'inactive' && mStatus !== 'inactive') return false;

      // Filter category
      const name = (m.name || '').toLowerCase();
      const badge = (m.badge || '').toLowerCase();

      if (categoryFilter === 'popular') {
        return Boolean(m.badge) || badge.includes('populer') || badge.includes('unggulan') || badge.includes('rekomendasi');
      }
      if (categoryFilter === 'general') {
        return name.includes('umum') || name.includes('rutin') || name.includes('dasar');
      }
      if (categoryFilter === 'specific') {
        return name.includes('jantung') || name.includes('geriatri') || name.includes('nikah') || name.includes('lansia');
      }

      return true;
    });
  }, [mcuPackages, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Paket MCU */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Paket MCU
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {stats.total}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Skrining preventif terdaftar
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Activity size={24} />
          </div>
        </div>

        {/* Layanan Unggulan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Paket Unggulan
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-amber-700 leading-none">
              {stats.popularCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Berlabel rekomendasi dokter
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Award size={24} />
          </div>
        </div>

        {/* Akumulasi Item Skrining */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Item Skrining
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-emerald-700 leading-none">
              {stats.totalItemsCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Item lab, EKG &amp; spesialis
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Rata-rata Pemeriksaan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Rata-rata Item / Paket
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-teal-700 leading-none">
              {stats.avgItems}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Pemeriksaan komprehensif
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Sparkles size={24} />
          </div>
        </div>

      </div>

      {/* ── Main Container: Toolbar & View ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Header Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                  Paket Medical Check Up (MCU)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar paket skrining kesehatan preventif, rincian pemeriksaan laboratorium, dan tarif.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama paket, item lab..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={14} />
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
                  title="Tampilan Grid Kartu Visual"
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

              {/* Tombol Tambah MCU */}
              <button
                type="button"
                onClick={() => handleOpenCreate('mcu')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Tambah Paket MCU</span>
              </button>
            </div>
          </div>

          {/* Filter Bar: Category & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Kategori:
              </span>
              {[
                { id: 'all', label: 'Semua Paket' },
                { id: 'popular', label: 'Unggulan & Populer' },
                { id: 'general', label: 'Skrining Umum & Rutin' },
                { id: 'specific', label: 'Spesifik (Jantung / Lansia / Pranikah)' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
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
                <option value="active">Aktif / Tersedia ({stats.activeCount})</option>
                <option value="inactive">Non-Aktif / Arsip ({stats.inactiveCount})</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── View 1: Grid Mode (Visual Showcase) ── */}
        {viewMode === 'grid' && (
          <div className="p-4 sm:p-6">
            {filteredMcu.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Activity size={44} className="mx-auto text-slate-300 mb-3" />
                <h4 className="font-heading text-base font-bold text-slate-700">Tidak ada paket MCU ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter kategori / status.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredMcu.map(m => {
                  const items = getPackageItems(m);

                  return (
                    <div
                      key={m.id || m.dbId}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Card Header Top */}
                      <div className="p-5 sm:p-6 pb-4 space-y-3">
                        
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.badge ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                                <Sparkles size={12} className="text-amber-600" />
                                <span>{m.badge}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                Paket Skrining Medis
                              </span>
                            )}
                            <StatusBadge status={(m.status || 'active').toLowerCase()} />
                          </div>

                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 shrink-0">
                            {items.length} Item Skrining
                          </span>
                        </div>

                        {/* Title & Target */}
                        <div>
                          <h4 className="font-heading text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                            {m.name}
                          </h4>

                          {m.target && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                              <Users size={13} className="text-slate-400 shrink-0" />
                              <span>{m.target}</span>
                            </div>
                          )}
                        </div>

                        {/* Price Banner */}
                        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-teal-700 block">Tarif Biaya Paket</span>
                            <div className="flex items-baseline gap-2">
                              <strong className="text-lg font-black text-teal-900 font-heading">
                                {formatPriceRupiah(m.price)}
                              </strong>
                              {m.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  {m.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Durasi</span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                              <Clock size={12} className="text-teal-600" />
                              <span>{m.duration || '2-3 Jam'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Highlight Quote */}
                        {m.highlight && (
                          <p className="text-xs text-slate-600 italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/50 leading-relaxed">
                            "{m.highlight}"
                          </p>
                        )}

                        {/* Items Checklist Preview */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                            Cakupan Pemeriksaan:
                          </span>
                          <div className="space-y-1">
                            {items.slice(0, 4).map((it, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <Check size={13} className="text-teal-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{it}</span>
                              </div>
                            ))}
                            {items.length > 4 && (
                              <span className="text-[11px] font-bold text-teal-700 block pt-0.5">
                                +{items.length - 4} item pemeriksaan lainnya...
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPackage(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Pratinjau</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('mcu', m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit Paket MCU"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete('mcu', m, m.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Hapus Paket MCU"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
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
                  <th className="py-3 px-4">Nama Paket MCU</th>
                  <th className="py-3 px-4">Badge / Kategori</th>
                  <th className="py-3 px-4">Tarif Biaya</th>
                  <th className="py-3 px-4">Durasi &amp; Sasaran</th>
                  <th className="py-3 px-4">Item Skrining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredMcu.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <Activity size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada paket MCU ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
                    </td>
                  </tr>
                ) : (
                  filteredMcu.map(m => {
                    const items = getPackageItems(m);

                    return (
                      <tr key={m.id || m.dbId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <strong
                            className="block text-slate-900 font-bold hover:text-teal-700 cursor-pointer transition-colors"
                            onClick={() => setPreviewPackage(m)}
                          >
                            {m.name}
                          </strong>
                          {m.highlight && (
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 block">{m.highlight}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {m.badge ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                              <Sparkles size={11} className="text-amber-600" />
                              <span>{m.badge}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <strong className="text-teal-700 font-bold">
                            {formatPriceRupiah(m.price)}
                          </strong>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{m.duration || '2-3 Jam'}</div>
                          <div className="text-[11px] text-slate-500">{m.target || 'Umum'}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            {items.length} Item Pemeriksaan
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={(m.status || 'active').toLowerCase()} />
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewPackage(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                              title="Pratinjau Paket"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit('mcu', m)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Edit Paket MCU"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete('mcu', m, m.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Hapus Paket MCU"
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

      {/* ── Modal Pratinjau Detail Paket MCU ── */}
      {previewPackage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setPreviewPackage(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-6 bg-gradient-to-r from-teal-700 to-emerald-700 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => setPreviewPackage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
              >
                <X size={18} />
              </button>

              <div className="space-y-2 pr-8">
                {previewPackage.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    <Sparkles size={12} />
                    <span>{previewPackage.badge}</span>
                  </span>
                )}
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white leading-tight">
                  {previewPackage.name}
                </h3>
                {previewPackage.target && (
                  <p className="text-xs text-teal-100 flex items-center gap-1.5">
                    <Users size={13} />
                    <span>Target: {previewPackage.target}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {/* Tarif & Durasi Highlights */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Biaya Paket MCU</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-lg font-black text-teal-700 font-heading">
                      {formatPriceRupiah(previewPackage.price)}
                    </strong>
                    {previewPackage.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {previewPackage.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Estimasi Waktu</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <Clock size={14} className="text-teal-600" />
                    <span>{previewPackage.duration || '2 - 3 Jam'}</span>
                  </div>
                </div>
              </div>

              {/* Highlight Manfaat Klinis */}
              {previewPackage.highlight && (
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ringkasan Manfaat Skrining</h5>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                    {previewPackage.highlight}
                  </p>
                </div>
              )}

              {/* Daftar Lengkap Item Pemeriksaan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Rincian Item Pemeriksaan Medis ({getPackageItems(previewPackage).length})
                  </h5>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Lengkap
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getPackageItems(previewPackage).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700"
                    >
                      <Check size={14} className="text-teal-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const p = previewPackage;
                  setPreviewPackage(null);
                  handleOpenEdit('mcu', p);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Pencil size={13} />
                <span>Ubah Paket MCU</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPackage(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
