import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, BedDouble, Bed, Crown,
  ShieldCheck, CheckCircle2, Activity, Wifi, Tv, Bath, Sparkles,
  Eye, Users, CreditCard, LayoutGrid, List, Info, Check, Filter,
  PhoneCall, HeartPulse, Building2, ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

// Helper format Rupiah & Rentang Tarif
function formatPriceRupiah(val) {
  if (!val) return 'Hubungi Admisi';
  const str = String(val).trim();
  if (!str || str === '0' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === 'Hubungi Admisi') {
    return 'Hubungi Admisi';
  }
  if (str.includes('-') || str.includes('–')) {
    let out = str;
    if (!str.toLowerCase().includes('rp')) {
      out = `Rp ${str}`;
    }
    return out.endsWith('/ malam') ? out : `${out} / malam`;
  }
  let cleanStr = str.replace(/\s*\/\s*malam$/i, '').trim();

  // PENTING: Bersihkan desimal .00 bawaan MySQL DECIMAL agar tidak dikira 60 Juta!
  if (/^\d+\.00$/.test(cleanStr)) {
    cleanStr = cleanStr.replace(/\.00$/, '');
  }

  if (cleanStr.toLowerCase().includes('rp')) {
    cleanStr = cleanStr.replace(/\.00$/, '');
    return cleanStr.endsWith('/ malam') ? cleanStr : `${cleanStr} / malam`;
  }

  const num = typeof val === 'number' ? val : parseInt(cleanStr.replace(/\D/g, ''), 10);
  if (isNaN(num) || num <= 0) return 'Hubungi Admisi';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num) + ' / malam';
}

export default function RoomsTab({
  inpatientRooms = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  formatImageUrl
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'vip' | 'class1_2' | 'class3' | 'icu'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [previewRoom, setPreviewRoom] = useState(null); // Modal detail pratinjau

  // KPI Metrics
  const stats = useMemo(() => {
    const total = inpatientRooms.length;
    const rawatInapCount = inpatientRooms.filter(r => (r.category || '').toLowerCase() === 'rawat_inap').length;
    const intensifCount = inpatientRooms.filter(r => (r.category || '').toLowerCase() === 'intensif').length;
    const isolasiCount = inpatientRooms.filter(r => (r.category || '').toLowerCase() === 'isolasi').length;
    const emargensiCount = inpatientRooms.filter(r => (r.category || '').toLowerCase() === 'emargensi').length;
    const activeCount = inpatientRooms.filter(r => (r.status || 'active').toLowerCase() === 'active').length;
    const inactiveCount = total - activeCount;

    return { total, rawatInapCount, intensifCount, isolasiCount, emargensiCount, activeCount, inactiveCount };
  }, [inpatientRooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return inpatientRooms.filter(r => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.desc?.toLowerCase().includes(q) ||
        r.tag?.toLowerCase().includes(q) ||
        (Array.isArray(r.features) && r.features.some(f => f.toLowerCase().includes(q))) ||
        (Array.isArray(r.facilities) && r.facilities.some(f => f.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      // Status filter
      const roomStatus = (r.status || 'active').toLowerCase();
      if (statusFilter !== 'all' && roomStatus !== statusFilter) {
        return false;
      }

      // Category filter (rawat_inap | intensif | isolasi | emargensi)
      const cat = (r.category || '').toLowerCase();
      if (categoryFilter !== 'all' && cat !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [inpatientRooms, searchQuery, categoryFilter, statusFilter]);

  // Extract facilities array safely
  const getRoomFacilities = (r) => {
    if (!r) return [];
    if (Array.isArray(r.facilities)) return r.facilities;
    if (Array.isArray(r.features)) return r.features;
    if (typeof r.facilities === 'string' && r.facilities.trim()) {
      try {
        const parsed = JSON.parse(r.facilities);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return r.facilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }
    return [];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Tipe Kamar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Tipe Kamar
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {stats.total}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              {stats.activeCount} aktif di web {stats.inactiveCount > 0 ? `• ${stats.inactiveCount} nonaktif` : ''}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <BedDouble size={24} />
          </div>
        </div>

        {/* Rawat Inap */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Kamar Rawat Inap
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-teal-700 leading-none">
              {stats.rawatInapCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              Suite, VIP, Kelas 1, 2 &amp; 3
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Bed size={24} />
          </div>
        </div>

        {/* Unit Intensif */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Unit Intensif
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-rose-700 leading-none">
              {stats.intensifCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              ICU, PICU &amp; NICU
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <HeartPulse size={24} />
          </div>
        </div>

        {/* Isolasi & Emergensi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Isolasi &amp; Emergensi
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-black text-amber-700 leading-none">
              {stats.isolasiCount + stats.emargensiCount}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 inline-block">
              {stats.isolasiCount} Isolasi • {stats.emargensiCount} Emergensi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldCheck size={24} />
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
                <BedDouble size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                  Manajemen Kamar Rawat Inap
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar kelas kamar, kapasitas tempat tidur, fasilitas pendukung, dan tarif per malam.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama kamar, fasilitas..."
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

              {/* Tombol Tambah Kamar */}
              <button
                type="button"
                onClick={() => handleOpenCreate('room')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Tambah Tipe Kamar</span>
              </button>
            </div>
          </div>

          {/* Category & Status Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Kategori:
              </span>
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'rawat_inap', label: 'Rawat Inap' },
                { id: 'intensif', label: 'Intensif' },
                { id: 'isolasi', label: 'Isolasi' },
                { id: 'emargensi', label: 'Emergensi' }
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

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Status ({stats.total})</option>
                <option value="active">Aktif ({stats.activeCount})</option>
                <option value="inactive">Nonaktif ({stats.inactiveCount})</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── View 1: Grid Mode (Visual Showcase Modern) ── */}
        {viewMode === 'grid' && (
          <div className="p-4 sm:p-6">
            {filteredRooms.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <BedDouble size={44} className="mx-auto text-slate-300 mb-3" />
                <h4 className="font-heading text-base font-bold text-slate-700">Tidak ada tipe kamar ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter kategori.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRooms.map(r => {
                  const facilities = getRoomFacilities(r);
                  const isVip = (r.category || '').toLowerCase() === 'vip' || (r.name || '').toLowerCase().includes('vip') || (r.name || '').toLowerCase().includes('suite');
                  const isIntensive = (r.category || '').toLowerCase() === 'intensive' || (r.name || '').toLowerCase().includes('icu');

                  return (
                    <div
                      key={r.id || r.dbId}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                    >
                      {/* Image Banner */}
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        <img
                          src={formatImageUrl ? formatImageUrl(r.image || r.image_url, '/images/default-image.svg') : (r.image || r.image_url || '/images/default-image.svg')}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = '/images/default-image.svg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                            r.category === 'intensif'
                              ? 'bg-rose-600/90 text-white'
                              : r.category === 'isolasi'
                              ? 'bg-purple-600/90 text-white'
                              : r.category === 'emargensi'
                              ? 'bg-amber-600/90 text-white'
                              : 'bg-teal-700/90 text-white'
                          }`}>
                            {r.categoryLabel || (r.category === 'intensif' ? 'Intensif' : r.category === 'isolasi' ? 'Isolasi' : r.category === 'emargensi' ? 'Emergensi' : 'Rawat Inap')}
                          </span>

                          <StatusBadge status={r.status || 'active'} />
                        </div>

                        {/* Bottom Overlay: Price */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-300 block">Tarif per Malam</span>
                            <strong className="text-base sm:text-lg font-black font-heading text-white drop-shadow-xs">
                              {formatPriceRupiah(r.price || r.price_per_night || r.pricePerNight)}
                            </strong>
                          </div>
                          <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/30">
                            👥 {r.capacity || '1 - 2 Pasien'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-heading text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {r.name}
                          </h4>

                          {r.tag && (
                            <p className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100/80">
                              ✨ {r.tag}
                            </p>
                          )}

                          {r.desc && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {r.desc}
                            </p>
                          )}

                          {/* Facilities Preview Chips */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                              Fasilitas Kamar:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {facilities.slice(0, 3).map((f, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200/70"
                                >
                                  <Check size={11} className="text-teal-600" />
                                  <span className="truncate max-w-[170px]">{f}</span>
                                </span>
                              ))}
                              {facilities.length > 3 && (
                                <span className="text-[11px] font-bold text-slate-400 px-1 py-0.5">
                                  +{facilities.length - 3} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewRoom(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Pratinjau</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit('room', r)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Edit Tipe Kamar"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete('room', r, r.name)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Hapus Tipe Kamar"
                            >
                              <Trash2 size={13} />
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
                  <th className="py-3 px-4 w-20">Foto</th>
                  <th className="py-3 px-4">Nama Tipe Kamar</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Kapasitas Bed</th>
                  <th className="py-3 px-4">Tarif per Malam</th>
                  <th className="py-3 px-4">Fasilitas Utama</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      <BedDouble size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada tipe kamar ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map(r => {
                    const facilities = getRoomFacilities(r);
                    return (
                      <tr key={r.id || r.dbId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={formatImageUrl ? formatImageUrl(r.image || r.image_url, '/images/default-image.svg') : (r.image || r.image_url || '/images/default-image.svg')}
                            alt={r.name}
                            className="w-14 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewRoom(r)}
                            onError={e => { e.target.src = '/images/default-image.svg'; }}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 font-bold hover:text-teal-700 cursor-pointer transition-colors" onClick={() => setPreviewRoom(r)}>
                            {r.name}
                          </strong>
                          {r.tag ? (
                            <span className="text-[11px] text-teal-700 font-medium block mt-0.5">✨ {r.tag}</span>
                          ) : r.desc ? (
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 block">{r.desc}</span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                            r.category === 'intensif'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : r.category === 'isolasi'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : r.category === 'emargensi'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {r.categoryLabel || (r.category === 'intensif' ? 'Intensif' : r.category === 'isolasi' ? 'Isolasi' : r.category === 'emargensi' ? 'Emergensi' : 'Rawat Inap')}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            👥 {r.capacity || '1 - 2 Pasien'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <strong className="text-teal-700 font-bold">
                            {formatPriceRupiah(r.price || r.price_per_night || r.pricePerNight)}
                          </strong>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            {facilities.length} Fasilitas
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={r.status || 'active'} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewRoom(r)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                              title="Pratinjau Kamar"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit('room', r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Edit Tipe Kamar"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete('room', r, r.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Hapus Tipe Kamar"
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

      {/* ── Modal Pratinjau Detail Kamar (Quick Preview) ── */}
      {previewRoom && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setPreviewRoom(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Image Cover */}
            <div className="relative aspect-16/9 bg-slate-100 shrink-0">
              <img
                src={formatImageUrl ? formatImageUrl(previewRoom.image || previewRoom.image_url, '/images/default-image.svg') : (previewRoom.image || previewRoom.image_url || '/images/default-image.svg')}
                alt={previewRoom.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/images/default-image.svg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

              <button
                type="button"
                onClick={() => setPreviewRoom(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-600/90 text-white mb-1.5 inline-block">
                  Detail Kamar Rawat Inap
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white leading-tight">
                  {previewRoom.name}
                </h3>
                {previewRoom.tag && (
                  <p className="text-xs text-teal-200 font-semibold mt-0.5">
                    ✨ {previewRoom.tag}
                  </p>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {/* Highlight Price & Capacity */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Tarif per Malam</span>
                  <strong className="text-base font-black text-teal-700">
                    {formatPriceRupiah(previewRoom.price || previewRoom.price_per_night || previewRoom.pricePerNight)}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Kapasitas Tempat Tidur</span>
                  <strong className="text-sm font-bold text-slate-800">
                    {previewRoom.capacity || '1 - 2 Pasien per Kamar'}
                  </strong>
                </div>
              </div>

              {/* Deskripsi */}
              {previewRoom.desc && (
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Kamar</h5>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {previewRoom.desc}
                  </p>
                </div>
              )}

              {/* Fasilitas Kamar Lengkap */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Fasilitas Kamar ({getRoomFacilities(previewRoom).length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getRoomFacilities(previewRoom).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700"
                    >
                      <Check size={14} className="text-teal-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                Status: <strong className="text-slate-800 font-semibold">{previewRoom.status === 'inactive' ? 'Pemeliharaan' : 'Tersedia / Aktif'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const r = previewRoom;
                    setPreviewRoom(null);
                    handleOpenEdit('room', r);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Ubah Data Kamar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRoom(null)}
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
