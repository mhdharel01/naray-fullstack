import React from 'react';
import {
  CalendarOff,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  Layers,
  Search,
  X,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function LeavesTab({
  activeTodayLeaves = [],
  upcomingLeaves = [],
  doctors = [],
  doctorLeaves = [],
  todayYMD = '',
  leaveSearch = '',
  setLeaveSearch,
  leaveFilterStatus = 'all',
  setLeaveFilterStatus,
  setLeaveModal,
  openDoctorStatusPage,
  adminDeleteDoctorLeave,
  showToast,
  formatImageUrl
}) {
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = new Date(end) - new Date(start);
    const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  const formatDateIndo = (dStr) => {
    if (!dStr) return '-';
    try {
      return new Date(dStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const filteredLeaves = (doctorLeaves || []).filter(leave => {
    const doc = doctors.find(d => String(d.id || d.dbId) === String(leave.doctor_id));
    const s = typeof leave.start_date === 'string' ? leave.start_date.slice(0, 10) : '';
    const e = typeof leave.end_date === 'string' ? leave.end_date.slice(0, 10) : '';
    const isCurrent = s && e && s <= todayYMD && todayYMD <= e;
    const isUpcoming = s && s > todayYMD;
    const isPast = e && e < todayYMD;

    if (leaveFilterStatus === 'ongoing' && !isCurrent) return false;
    if (leaveFilterStatus === 'upcoming' && !isUpcoming) return false;
    if (leaveFilterStatus === 'past' && !isPast) return false;

    if (leaveSearch) {
      const q = leaveSearch.toLowerCase();
      const docName = String(doc?.name || '').toLowerCase();
      const reason = String(leave.reason || '').toLowerCase();
      const notes = String(leave.notes || '').toLowerCase();
      if (!docName.includes(q) && !reason.includes(q) && !notes.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-bold mb-3 border border-white/20">
            <CalendarOff size={14} />
            <span>MANAJEMEN CUTI MANDIRI DATABASE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white">
            Pengaturan Cuti &amp; Pengecualian Jadwal Dokter
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed">
            Jadwal ditarik <em>read-only</em> dari SIMRS Dekago. Setiap cuti yang dijadwalkan di sini akan <strong className="text-white font-bold">otomatis menimpa (override)</strong> status jadwal dokter menjadi <strong className="text-amber-300 font-bold">SEDANG CUTI</strong> pada kartu dokter publik.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setLeaveModal({ isOpen: true, doctorId: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Jadwalkan Cuti</span>
          </button>
          <button
            type="button"
            onClick={() => openDoctorStatusPage(null, null, 'leaves')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/30 transition-all cursor-pointer"
          >
            <CalendarDays size={16} />
            <span>Kalender Sesi Libur</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <CalendarOff size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Cuti Hari Ini</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{activeTodayLeaves.length}</span>
            <span className="text-[11px] font-semibold text-amber-600 mt-0.5 block">
              {activeTodayLeaves.length > 0 ? 'Menimpa jadwal live' : 'Semua dokter bertugas'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Cuti Mendatang</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{upcomingLeaves.length}</span>
            <span className="text-[11px] font-semibold text-blue-600 mt-0.5 block">Terjadwal di sistem</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Dokter Bertugas</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{doctors.length - activeTodayLeaves.length}</span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-0.5 block">Dari {doctors.length} dokter</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Layers size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Riwayat</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{doctorLeaves.length}</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Tersimpan di database</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <CalendarOff size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                Daftar Pengecualian Cuti Dokter ({doctorLeaves.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {doctorLeaves.filter(l => l.status === 'active').length} cuti aktif tercatat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama dokter atau alasan..."
                value={leaveSearch}
                onChange={e => setLeaveSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
              />
              {leaveSearch && (
                <button onClick={() => setLeaveSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={leaveFilterStatus}
              onChange={e => setLeaveFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="ongoing">Sedang Berlangsung</option>
              <option value="upcoming">Akan Datang</option>
              <option value="past">Riwayat Selesai</option>
            </select>

            <button
              type="button"
              onClick={() => setLeaveModal({ isOpen: true, doctorId: null })}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Cuti</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Dokter</th>
                <th className="py-3 px-4">Periode Tanggal Cuti</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Alasan &amp; Keterangan</th>
                <th className="py-3 px-4">Dampak Web</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <CalendarOff size={36} className="mx-auto text-amber-500/40 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data cuti yang sesuai kriteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">Klik tombol Tambah Cuti di atas untuk menjadwalkan cuti dokter.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => {
                  const doc = doctors.find(d => String(d.id || d.dbId) === String(leave.doctor_id));
                  const s = typeof leave.start_date === 'string' ? leave.start_date.slice(0, 10) : '';
                  const e = typeof leave.end_date === 'string' ? leave.end_date.slice(0, 10) : '';
                  const isCurrent = s && e && s <= todayYMD && todayYMD <= e;
                  const isUpcoming = s && s > todayYMD;
                  const daysCount = calculateDays(s, e);

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={formatImageUrl ? formatImageUrl(doc?.photo || doc?.photo_url, '/images/default-doctor.svg') : (doc?.photo || doc?.photo_url || '/images/default-doctor.svg')}
                            alt={doc?.name || 'Dokter'}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={ev => { ev.target.src = '/images/default-doctor.svg'; }}
                          />
                          <div>
                            <strong className="block text-slate-900 font-bold">{doc?.name || `Dokter ID #${leave.doctor_id}`}</strong>
                            <span className="text-[11px] text-slate-500">
                              {typeof doc?.specialty === 'object' ? doc?.specialty?.name : (doc?.specialty || 'Spesialis')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <strong className="text-slate-800">{formatDateIndo(leave.start_date)}</strong>
                        {leave.start_date !== leave.end_date && (
                          <span className="text-slate-600"> s/d <strong className="text-slate-800">{formatDateIndo(leave.end_date)}</strong></span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          <Clock size={11} />
                          <span>{daysCount} Hari</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="block text-slate-900 font-bold">{leave.reason || 'Cuti Tahunan'}</strong>
                        {leave.notes && (
                          <span className="text-[11px] text-slate-500 italic block mt-0.5">{leave.notes}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                          <Sparkles size={11} className="text-amber-600" />
                          <span>Override SIMRS</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isCurrent
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isUpcoming
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCurrent ? 'bg-amber-500' : isUpcoming ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          <span>{isCurrent ? 'Sedang Berlangsung' : isUpcoming ? 'Akan Datang' : 'Selesai'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Batalkan cuti untuk ${doc?.name || 'dokter ini'}? Status dokter akan kembali aktif di website.`)) {
                              const res = await adminDeleteDoctorLeave(leave.id);
                              if (res?.success) {
                                showToast('Cuti dokter berhasil dibatalkan. Dokter kembali aktif.');
                              } else {
                                showToast(res?.message || 'Gagal membatalkan cuti.', 'error');
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          title="Batalkan cuti ini dan kembalikan dokter ke status aktif"
                        >
                          <Trash2 size={13} className="text-rose-600" />
                          <span>Batalkan</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
