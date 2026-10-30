import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash, 
  Sparkles,
  Info 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function PoliTab({
  poliklinikList = [],
  searchQuery = '',
  setSearchQuery,
  handleOpenCreate,
  handleOpenEdit,
  promptDelete,
  adminSyncPolikliniksFromSimrs,
  adminCleanStalePolikliniks,
  simrsDoctorSchedules,
  showToast
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Kumpulkan daftar nama ruangan resmi dari API SIMRS
  const simrsRoomsMap = useMemo(() => {
    const set = new Set();
    const rawSchedules = simrsDoctorSchedules?.data?.jadwal_dokter || simrsDoctorSchedules?.jadwal_dokter || [];
    if (Array.isArray(rawSchedules)) {
      rawSchedules.forEach(day => {
        (day.jadwal || []).forEach(item => {
          if (item.ruangan?.nama) {
            const clean = String(item.ruangan.nama)
              .toLowerCase()
              .replace(/^(poliklinik\s+poli|poliklinik|poli)\s+/i, '')
              .replace(/[.\s]+$/g, '')
              .trim();
            if (clean) set.add(clean);
          }
        });
      });
    }
    return set;
  }, [simrsDoctorSchedules]);

  // Helper cek apakah suatu poli sesuai dengan ruangan SIMRS
  const isPoliInSimrs = (poliName) => {
    if (!poliName || simrsRoomsMap.size === 0) return true; // Default true jika SIMRS belum dimuat
    const clean = String(poliName)
      .toLowerCase()
      .replace(/^(poliklinik\s+poli|poliklinik|poli)\s+/i, '')
      .replace(/[.\s]+$/g, '')
      .trim();
    return simrsRoomsMap.has(clean);
  };

  // Handler Sinkronkan dari SIMRS
  const handleSyncSimrs = async () => {
    if (!adminSyncPolikliniksFromSimrs) return;
    setIsSyncing(true);
    try {
      const res = await adminSyncPolikliniksFromSimrs();
      if (showToast) {
        showToast(res.message || 'Nama poliklinik berhasil diselaraskan dengan API SIMRS Dekago.');
      }
    } catch (e) {
      if (showToast) {
        showToast('Gagal menyinkronkan poliklinik dari SIMRS: ' + (e.message || ''), 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler Pembersihan Poli Lama yang sudah tidak ada di SIMRS
  const handleCleanStale = async () => {
    if (!adminCleanStalePolikliniks) return;
    const confirm = window.confirm(
      'Apakah Anda yakin ingin membersihkan dan menghapus poliklinik lama di database yang sudah tidak ada di API SIMRS Dekago?\n\nTindakan ini aman dan akan menghapus poliklinik usang agar tidak ada duplikasi data.'
    );
    if (!confirm) return;

    setIsCleaning(true);
    try {
      const res = await adminCleanStalePolikliniks();
      if (showToast) {
        showToast(res.message || 'Poliklinik lama yang tidak ada di SIMRS berhasil dibersihkan.');
      }
    } catch (e) {
      if (showToast) {
        showToast('Gagal membersihkan poliklinik lama: ' + (e.message || ''), 'error');
      }
    } finally {
      setIsCleaning(false);
    }
  };

  const filteredPoli = useMemo(() => {
    return (poliklinikList || []).filter(p =>
      p.name?.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes((searchQuery || '').toLowerCase()))
    );
  }, [poliklinikList, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ── 1. Banner Sinkronisasi SIMRS & Pembersihan Poli Lama ── */}
      <div className="bg-gradient-to-r from-teal-50/90 via-cyan-50/80 to-slate-50 border border-teal-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-tight">
                  Sinkronisasi &amp; Penyelarasan Poliklinik SIMRS Dekago
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  <CheckCircle2 size={12} />
                  <span>Selaras dengan API Jadwal</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Nama poliklinik dan ruangan diselaraskan secara otomatis dengan data API jadwal dokter (termasuk Poli Paru, Poli Kulit dan Kelamin, Poli Bedah, dan Poli Bedah Mulut). Poliklinik lama yang sudah tidak aktif dapat dibersihkan agar tidak terjadi duplikasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncSimrs}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Sinkronkan dan perbarui nama poliklinik langsung dari SIMRS"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan dari SIMRS'}</span>
            </button>

            <button
              type="button"
              disabled={isCleaning}
              onClick={handleCleanStale}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Hapus data poliklinik lama yang sudah tidak ada di SIMRS"
            >
              <Trash size={14} className={isCleaning ? 'animate-spin text-rose-600' : ''} />
              <span>{isCleaning ? 'Membersihkan...' : 'Bersihkan Poli Lama'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Tabel Poliklinik ── */}
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
                Total <strong>{poliklinikList.length}</strong> unit poliklinik operasional
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
                <th className="py-3 px-4">Integrasi SIMRS</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredPoli.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada poliklinik ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredPoli.map(p => {
                  const inSimrs = isPoliInSimrs(p.name);
                  return (
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
                        <strong className="text-slate-900 font-bold block">{p.name}</strong>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-600 line-clamp-2 max-w-md">
                          {p.desc || p.description || 'Layanan konsultasi dan tindakan medis terpadu.'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {inSimrs ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/70">
                            <CheckCircle2 size={12} className="text-teal-600" />
                            <span>Terdaftar di SIMRS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70" title="Poli lokal ini tidak ditemukan dalam jadwal aktif SIMRS">
                            <AlertCircle size={12} className="text-amber-600" />
                            <span>Poli Lokal / Lama</span>
                          </span>
                        )}
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
                            title="Hapus Poliklinik ini"
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

        {/* Footer Summary */}
        <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>
              Menampilkan <strong>{filteredPoli.length}</strong> dari <strong>{poliklinikList.length}</strong> unit poliklinik terdaftar.
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Naray Hospital Dumai &bull; Pelayanan Rawat Jalan Terintegrasi
          </div>
        </div>
      </div>
    </div>
  );
}
