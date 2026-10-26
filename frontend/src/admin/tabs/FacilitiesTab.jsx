import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Building2,
  Activity,
  ShieldCheck,
  Plus,
  ExternalLink,
  Search,
  X,
  List,
  Grid,
  Cpu,
  Pencil,
  Trash2
} from 'lucide-react';

export default function FacilitiesTab({
  centersOfExcellence = [],
  facilities = [],
  serviceSubTab = 'centers',
  setServiceSubTab,
  searchQuery = '',
  setSearchQuery,
  facilityCategoryFilter = 'all',
  setFacilityCategoryFilter,
  facilityViewMode = 'table',
  setFacilityViewMode,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  formatImageUrl
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const totalCenters = centersOfExcellence.length;
    const activeCenters = centersOfExcellence.filter(c => (c.status || 'active').toLowerCase() === 'active').length;
    const inactiveCenters = totalCenters - activeCenters;

    const totalFacilities = facilities.length;
    const activeFacilities = facilities.filter(f => (f.status || 'active').toLowerCase() === 'active').length;
    const inactiveFacilities = totalFacilities - activeFacilities;

    const totalAll = totalCenters + totalFacilities;
    const activeAll = activeCenters + activeFacilities;
    const inactiveAll = totalAll - activeAll;

    return { totalCenters, activeCenters, inactiveCenters, totalFacilities, activeFacilities, inactiveFacilities, totalAll, activeAll, inactiveAll };
  }, [centersOfExcellence, facilities]);
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ── 1. Hero Header Banner ── */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-bold mb-3 border border-white/20">
            <Sparkles size={14} />
            <span>KATALOG MEDIS &amp; FASILITAS KLINIS TERPADU</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white">
            Pusat Layanan Medis &amp; Fasilitas Diagnostik Unggulan
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed">
            Kelola pusat keunggulan klinis multidisiplin (<em>Centers of Excellence</em>), unit perawatan intensif, armada darurat, serta sarana diagnostik modern berstandar Paripurna Naray Hospital Kota Dumai.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {serviceSubTab === 'centers' ? (
            <button
              type="button"
              onClick={() => handleOpenCreate('center')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Tambah Pusat Unggulan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCreate('facility')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Tambah Fasilitas Medis</span>
            </button>
          )}

          <a
            href="/layanan-medis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/30 transition-all cursor-pointer"
          >
            <ExternalLink size={15} />
            <span>Lihat Halaman Publik</span>
          </a>
        </div>
      </div>

      {/* ── 2. KPI Metrics Overview ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Building2 size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Layanan</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">
              {stats.totalAll}
            </span>
            <span className="text-[11px] font-semibold text-teal-600 mt-0.5 block">{stats.activeAll} Aktif di Web</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Pusat Unggulan (CoE)</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{stats.totalCenters}</span>
            <span className="text-[11px] font-semibold text-cyan-600 mt-0.5 block">{stats.activeCenters} Aktif {stats.inactiveCenters > 0 ? `• ${stats.inactiveCenters} Nonaktif` : ''}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Activity size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Fasilitas Diagnostik</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{stats.totalFacilities}</span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-0.5 block">{stats.activeFacilities} Siaga {stats.inactiveFacilities > 0 ? `• ${stats.inactiveFacilities} Nonaktif` : ''}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Standar Mutu</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">100%</span>
            <span className="text-[11px] font-semibold text-amber-600 mt-0.5 block">Akreditasi Paripurna</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main Catalog Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Subtabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setServiceSubTab('centers'); setSearchQuery(''); }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                serviceSubTab === 'centers'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={15} />
              <span>Pusat Layanan Unggulan</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${serviceSubTab === 'centers' ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
                {centersOfExcellence?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setServiceSubTab('facilities'); setSearchQuery(''); }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                serviceSubTab === 'facilities'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building2 size={15} />
              <span>Fasilitas Diagnostik &amp; Penunjang</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${serviceSubTab === 'facilities' ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
                {facilities?.length || 0}
              </span>
            </button>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={serviceSubTab === 'centers' ? "Cari pusat keunggulan klinis..." : "Cari fasilitas atau alat diagnostik..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Semua Status ({serviceSubTab === 'centers' ? stats.totalCenters : stats.totalFacilities})</option>
              <option value="active">Aktif ({serviceSubTab === 'centers' ? stats.activeCenters : stats.activeFacilities})</option>
              <option value="inactive">Nonaktif ({serviceSubTab === 'centers' ? stats.inactiveCenters : stats.inactiveFacilities})</option>
            </select>

            {serviceSubTab === 'facilities' && (
              <select
                value={facilityCategoryFilter}
                onChange={e => setFacilityCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="gawat">Gawat Darurat &amp; Trauma</option>
                <option value="kritis">Perawatan Kritis (ICU)</option>
                <option value="bedah">Kamar Bedah &amp; Operasi</option>
                <option value="lab">Laboratorium &amp; Patologi</option>
                <option value="radiologi">Radiologi &amp; Pencitraan</option>
                <option value="geriatri">Layanan Geriatri</option>
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setFacilityViewMode('table')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  facilityViewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Tampilan Tabel Data"
              >
                <List size={14} />
                <span>Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setFacilityViewMode('grid')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  facilityViewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Tampilan Kartu Visual"
              >
                <Grid size={14} />
                <span>Kartu</span>
              </button>
            </div>

            {serviceSubTab === 'centers' ? (
              <button
                type="button"
                onClick={() => handleOpenCreate('center')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah CoE</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreate('facility')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah Fasilitas</span>
              </button>
            )}
          </div>
        </div>

        {/* ── SUBTAB 1: CENTERS OF EXCELLENCE (COE) ── */}
        {serviceSubTab === 'centers' && (
          <div>
            {facilityViewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 w-24">Banner</th>
                      <th className="py-3 px-4">Pusat Unggulan &amp; Slogan</th>
                      <th className="py-3 px-4">Teknologi Klinis</th>
                      <th className="py-3 px-4">Deskripsi Layanan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {centersOfExcellence
                      .filter(c => {
                        const cStatus = (c.status || 'active').toLowerCase();
                        if (statusFilter !== 'all' && cStatus !== statusFilter) return false;
                        return (
                          (c.name || c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
                        );
                      })
                      .map(c => {
                        const bannerSrc = formatImageUrl ? formatImageUrl(c.image || c.image_url, '/images/discovery/diagnostic-center.jpg') : (c.image || c.image_url || '/images/discovery/diagnostic-center.jpg');
                        const techList = Array.isArray(c.technologies) ? c.technologies : ['Teknologi Medis Terkini', 'Sistem Digital Terpadu'];
                        return (
                          <tr key={c.id || c.dbId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={bannerSrc}
                                alt={c.name || c.title}
                                className="w-16 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                                onError={e => { e.target.src = '/images/discovery/diagnostic-center.jpg'; }}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <strong className="block text-slate-900 font-bold">{c.name || c.title}</strong>
                              {c.tagline && (
                                <span className="text-[11px] text-teal-700 font-semibold mt-0.5 block">{c.tagline}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {techList.slice(0, 3).map((tech, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100">
                                    <Cpu size={10} />
                                    <span>{tech}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">
                                {c.description ? c.description.slice(0, 110) + '...' : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                (c.status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${(c.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>{(c.status || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit('center', c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Edit Layanan Unggulan"
                                >
                                  <Pencil size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => promptDelete('center', c, c.name || c.title)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Hapus Layanan Unggulan"
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
            ) : (
              /* Grid Mode */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centersOfExcellence
                  .filter(c => {
                    const cStatus = (c.status || 'active').toLowerCase();
                    if (statusFilter !== 'all' && cStatus !== statusFilter) return false;
                    return (
                      (c.name || c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (c.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map(c => {
                    const bannerSrc = formatImageUrl ? formatImageUrl(c.image || c.image_url, '/images/discovery/diagnostic-center.jpg') : (c.image || c.image_url || '/images/discovery/diagnostic-center.jpg');
                    const techList = Array.isArray(c.technologies) ? c.technologies : ['Teknologi Medis Terkini', 'Sistem Digital Terpadu'];
                    return (
                      <div key={c.id || c.dbId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-44 bg-slate-900">
                          <img
                            src={bannerSrc}
                            alt={c.name || c.title}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = '/images/discovery/diagnostic-center.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-teal-600/90 text-white text-[11px] font-bold">
                            Pusat Unggulan
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-heading font-black text-base text-slate-900">{c.name || c.title}</h3>
                            {c.tagline && <p className="text-xs text-teal-700 font-semibold mt-0.5">{c.tagline}</p>}
                            <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                              {c.description || 'Layanan komprehensif didukung dokter spesialis dan peralatan mutakhir.'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {techList.slice(0, 3).map((tech, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-medium border border-teal-100">
                                  <Cpu size={10} className="text-teal-600" />
                                  <span>{tech}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              (c.status || 'active') === 'active' ? 'text-emerald-700' : 'text-slate-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${(c.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              <span>{(c.status || 'active') === 'active' ? 'Aktif Melayani' : 'Nonaktif'}</span>
                            </span>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit('center', c)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDelete('center', c, c.name || c.title)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
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

        {/* ── SUBTAB 2: DIAGNOSTIC & CLINICAL FACILITIES ── */}
        {serviceSubTab === 'facilities' && (
          <div>
            {facilityViewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 w-24">Foto</th>
                      <th className="py-3 px-4">Nama Fasilitas Medis</th>
                      <th className="py-3 px-4">Kategori Layanan</th>
                      <th className="py-3 px-4">Klasifikasi</th>
                      <th className="py-3 px-4">Deskripsi &amp; Peralatan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {facilities
                      .filter(f => {
                        const fStatus = (f.status || 'active').toLowerCase();
                        if (statusFilter !== 'all' && fStatus !== statusFilter) return false;

                        const q = searchQuery.toLowerCase();
                        const matchesSearch = !searchQuery ||
                          f.name?.toLowerCase().includes(q) ||
                          (f.desc && f.desc.toLowerCase().includes(q)) ||
                          (f.description && f.description.toLowerCase().includes(q));

                        if (!matchesSearch) return false;
                        if (facilityCategoryFilter === 'all') return true;
                        const fName = (f.name || '').toLowerCase();
                        const fDesc = (f.desc || f.description || '').toLowerCase();
                        const comb = `${fName} ${fDesc}`;
                        if (facilityCategoryFilter === 'gawat') return comb.includes('gawat') || comb.includes('ugd') || comb.includes('trauma');
                        if (facilityCategoryFilter === 'kritis') return comb.includes('icu') || comb.includes('intensif') || comb.includes('kritis');
                        if (facilityCategoryFilter === 'bedah') return comb.includes('bedah') || comb.includes('operasi');
                        if (facilityCategoryFilter === 'lab') return comb.includes('lab') || comb.includes('patologi') || comb.includes('darah');
                        if (facilityCategoryFilter === 'radiologi') return comb.includes('radiologi') || comb.includes('rontgen') || comb.includes('pencitraan');
                        if (facilityCategoryFilter === 'geriatri') return comb.includes('geriatri') || comb.includes('lansia');
                        return true;
                      })
                      .map(f => {
                        const fImg = formatImageUrl ? formatImageUrl(f.image || f.image_url, '/images/discovery/diagnostic-center.jpg') : (f.image || f.image_url || '/images/discovery/diagnostic-center.jpg');
                        const catName = f.category || (f.description?.includes('Kategori:') ? f.description.split('Kategori:')[1].split('\n')[0].trim() : 'Fasilitas Medis');
                        return (
                          <tr key={f.id || f.dbId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={fImg}
                                alt={f.name}
                                className="w-16 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                                onError={e => { e.target.src = '/images/discovery/diagnostic-center.jpg'; }}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <strong className="block text-slate-900 font-bold">{f.name}</strong>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-100">
                                {catName}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                f.type === 'advanced' ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {f.type === 'advanced' ? 'Layanan Unggulan' : 'Fasilitas Standar'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">
                                {(f.desc || f.description || '-').replace(/Kategori:.*\n?/, '').slice(0, 110) + '...'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                (f.status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${(f.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>{(f.status || 'active') === 'active' ? 'Siaga Aktif' : 'Nonaktif'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit('facility', f)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Edit Fasilitas"
                                >
                                  <Pencil size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => promptDelete('facility', f, f.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Hapus Fasilitas"
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
            ) : (
              /* Grid Mode for Facilities */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities
                  .filter(f => {
                    const fStatus = (f.status || 'active').toLowerCase();
                    if (statusFilter !== 'all' && fStatus !== statusFilter) return false;

                    const q = searchQuery.toLowerCase();
                    const matchesSearch = !searchQuery ||
                      f.name?.toLowerCase().includes(q) ||
                      (f.desc && f.desc.toLowerCase().includes(q)) ||
                      (f.description && f.description.toLowerCase().includes(q));

                    if (!matchesSearch) return false;
                    if (facilityCategoryFilter === 'all') return true;
                    const fName = (f.name || '').toLowerCase();
                    const fDesc = (f.desc || f.description || '').toLowerCase();
                    const comb = `${fName} ${fDesc}`;
                    if (facilityCategoryFilter === 'gawat') return comb.includes('gawat') || comb.includes('ugd') || comb.includes('trauma');
                    if (facilityCategoryFilter === 'kritis') return comb.includes('icu') || comb.includes('intensif') || comb.includes('kritis');
                    if (facilityCategoryFilter === 'bedah') return comb.includes('bedah') || comb.includes('operasi');
                    if (facilityCategoryFilter === 'lab') return comb.includes('lab') || comb.includes('patologi') || comb.includes('darah');
                    if (facilityCategoryFilter === 'radiologi') return comb.includes('radiologi') || comb.includes('rontgen') || comb.includes('pencitraan');
                    if (facilityCategoryFilter === 'geriatri') return comb.includes('geriatri') || comb.includes('lansia');
                    return true;
                  })
                  .map(f => {
                    const fImg = formatImageUrl ? formatImageUrl(f.image || f.image_url, '/images/discovery/diagnostic-center.jpg') : (f.image || f.image_url || '/images/discovery/diagnostic-center.jpg');
                    const catName = f.category || (f.description?.includes('Kategori:') ? f.description.split('Kategori:')[1].split('\n')[0].trim() : 'Fasilitas Medis');
                    return (
                      <div key={f.id || f.dbId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-44 bg-slate-900">
                          <img
                            src={fImg}
                            alt={f.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = '/images/discovery/diagnostic-center.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-white text-[11px] font-bold">
                            {catName}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-heading font-black text-base text-slate-900">{f.name}</h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                              {(f.desc || f.description || 'Fasilitas diagnostik dan penunjang modern Naray Hospital Kota Dumai.').replace(/Kategori:.*\n?/, '')}
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              (f.status || 'active') === 'active' ? 'text-emerald-700' : 'text-slate-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${(f.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              <span>{(f.status || 'active') === 'active' ? 'Siaga 24 Jam' : 'Nonaktif'}</span>
                            </span>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit('facility', f)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDelete('facility', f, f.name)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
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
      </div>
    </div>
  );
}
