import React from 'react';
import { Search, Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function PoliTab({
  poliklinikList = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete
}) {
  const filteredPoli = poliklinikList.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                Daftar Layanan Poliklinik Rawat Jalan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {poliklinikList.length} unit poliklinik operasional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari poliklinik..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenCreate('poliklinik')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Tambah Poliklinik</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-16">Ikon</th>
                <th className="py-3 px-4">Nama Poliklinik</th>
                <th className="py-3 px-4">Deskripsi Layanan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredPoli.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada poliklinik ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredPoli.map(p => (
                  <tr key={p.id || p.dbId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      {p.image || p.image_url ? (
                        <img
                          src={p.image || p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={e => { e.target.src = '/images/default-image.svg'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-lg shrink-0">
                          {p.icon || '🩺'}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 font-bold">{p.name}</strong>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-600 line-clamp-2 max-w-md">
                        {p.desc || p.description || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={p.status || 'active'} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit('poliklinik', p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          title="Edit Poliklinik"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete('poliklinik', p, p.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          title="Hapus Poliklinik"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
