import React from 'react';
import {
  CalendarDays,
  CalendarOff,
  Users,
  Clock,
  Activity,
  Plus,
  Search,
  X,
  RefreshCw,
  Pencil,
  Trash2
} from 'lucide-react';

export default function SchedulesTab({
  doctorSchedules = [],
  doctors = [],
  doctorLeaves = [],
  poliklinikList = [],
  activeSchedulesCount = 0,
  onLeaveSchedulesCount = 0,
  scheduledDoctorCount = 0,
  schedulesTodayCount = 0,
  todayIndo = 'Hari ini',
  activePoliCount = 0,
  scheduleSubTab = 'routine',
  setScheduleSubTab,
  scheduleSearch = '',
  setScheduleSearch,
  scheduleFilterStatus = 'all',
  setScheduleFilterStatus,
  scheduleFilterDay = 'all',
  setScheduleFilterDay,
  scheduleFilterPoli = 'all',
  setScheduleFilterPoli,
  scheduleFilterDoctor = 'all',
  setScheduleFilterDoctor,
  filteredSchedules = [],
  setActiveTab,
  openDoctorStatusPage,
  handleOpenCreateSchedule,
  handleOpenEditSchedule,
  promptDelete,
  adminDeleteDoctorLeave,
  showToast,
  formatImageUrl
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* SIMRS Dekago Notice Banner */}
      <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarDays size={20} />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm sm:text-base text-teal-950 leading-tight">
              Sinkronisasi Jadwal Praktik Poliklinik dari SIMRS Dekago (Read-Only)
            </h4>
            <p className="text-xs text-teal-800/90 mt-1 max-w-2xl leading-relaxed">
              Data sesi praktik ditarik otomatis dari server SIMRS antrol. Untuk meliburkan dokter tanpa mengubah database SIMRS, silakan gunakan fitur <strong className="font-bold text-teal-950">Cuti Dokter Mandiri</strong>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <CalendarOff size={14} />
          <span>Kelola Cuti Mandiri</span>
        </button>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <CalendarDays size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Slot</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{doctorSchedules.length}</span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-0.5 block">{activeSchedulesCount} aktif {onLeaveSchedulesCount > 0 ? `• ${onLeaveSchedulesCount} cuti` : ''}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Dokter Terjadwal</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{scheduledDoctorCount}</span>
            <span className="text-[11px] font-semibold text-blue-600 mt-0.5 block">Dari {doctors.length} dokter</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Praktik Hari Ini</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{schedulesTodayCount}</span>
            <span className="text-[11px] font-semibold text-amber-600 mt-0.5 block">{todayIndo}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Activity size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Poliklinik</span>
            <span className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-none mt-0.5 block">{activePoliCount}</span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-0.5 block">Unit rawat jalan</span>
          </div>
        </div>
      </div>

      {/* Main Schedule Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Toolbar & Subtab Switcher */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setScheduleSubTab('routine')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                scheduleSubTab === 'routine'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CalendarDays size={15} />
              <span>Jadwal Praktik Rutin ({filteredSchedules.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setScheduleSubTab('leaves')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                scheduleSubTab === 'leaves'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CalendarOff size={15} />
              <span>Daftar Cuti &amp; Libur ({doctorLeaves.filter(l => l.status === 'active').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => openDoctorStatusPage(null, null, 'schedules')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <CalendarOff size={14} className="text-amber-600" />
              <span>Atur Dokter Libur / Cuti</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateSchedule()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Jadwal Rutin</span>
            </button>
          </div>
        </div>

        {/* ── SUB-TAB 1: JADWAL PRAKTIK RUTIN ── */}
        {scheduleSubTab === 'routine' && (
          <div>
            {/* Filter bar */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari dokter, poli, ruangan..."
                  value={scheduleSearch}
                  onChange={e => setScheduleSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                />
                {scheduleSearch && (
                  <button onClick={() => setScheduleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={scheduleFilterStatus}
                onChange={e => setScheduleFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Jadwal Aktif Rutin</option>
                <option value="inactive">Jadwal Nonaktif</option>
                <option value="on_leave">Dokter Sedang Cuti</option>
              </select>

              <select
                value={scheduleFilterDay}
                onChange={e => setScheduleFilterDay(e.target.value)}
                className="px-2.5 py-1.5 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Hari</option>
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={scheduleFilterPoli}
                onChange={e => setScheduleFilterPoli(e.target.value)}
                className="px-2.5 py-1.5 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Poliklinik</option>
                {poliklinikList.map(p => (
                  <option key={p.id || p.dbId} value={String(p.dbId || p.id)}>{p.name}</option>
                ))}
              </select>

              <select
                value={scheduleFilterDoctor}
                onChange={e => setScheduleFilterDoctor(e.target.value)}
                className="px-2.5 py-1.5 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer max-w-[180px]"
              >
                <option value="all">Semua Dokter</option>
                {doctors.map(d => (
                  <option key={d.id || d.dbId} value={String(d.dbId || d.id)}>{d.name}</option>
                ))}
              </select>

              {(scheduleFilterStatus !== 'all' || scheduleFilterDay !== 'all' || scheduleFilterPoli !== 'all' || scheduleFilterDoctor !== 'all' || scheduleSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setScheduleFilterStatus('all');
                    setScheduleFilterDay('all');
                    setScheduleFilterPoli('all');
                    setScheduleFilterDoctor('all');
                    setScheduleSearch('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  title="Reset semua filter"
                >
                  <RefreshCw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Dokter</th>
                    <th className="py-3 px-4">Poliklinik &amp; Ruangan</th>
                    <th className="py-3 px-4">Hari</th>
                    <th className="py-3 px-4">Jam Praktik</th>
                    <th className="py-3 px-4">Status Operasional</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <CalendarDays size={36} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">Tidak ada jadwal yang cocok dengan filter</p>
                        <p className="text-xs text-slate-400 mt-0.5">Silakan ubah filter atau klik "Tambah Jadwal Rutin".</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map(sch => {
                      const poli = poliklinikList.find(p => String(p.dbId || p.id) === String(sch.poliklinikId));
                      const matchedDoc = doctors.find(d => String(d.id || d.dbId) === String(sch.doctorDbId || sch.doctorId));
                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={formatImageUrl ? formatImageUrl(sch.doctorPhoto, '/images/default-doctor.svg') : (sch.doctorPhoto || '/images/default-doctor.svg')}
                                alt={sch.doctorName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                                onError={e => { e.target.src = '/images/default-doctor.svg'; }}
                              />
                              <div>
                                <strong className="block text-slate-900 font-bold text-xs sm:text-sm">{sch.doctorName}</strong>
                                <span className="text-[11px] text-slate-500">{sch.doctorSpecialty}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100">
                              {poli?.name || sch.room || 'Poliklinik Spesialis'}
                            </span>
                            {sch.room && sch.room !== poli?.name && (
                              <span className="block text-[11px] text-slate-500 mt-0.5">📍 {sch.room}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                              {sch.day || 'Senin'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 text-teal-900 text-xs font-semibold border border-teal-100">
                              <Clock size={12} className="text-teal-600" />
                              <span>{sch.time || `${sch.startTime} - ${sch.endTime} WIB`}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                sch.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sch.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>{sch.status === 'active' ? 'Aktif Rutin' : 'Nonaktif Rutin'}</span>
                              </span>

                              {sch.doctorIsOnLeave && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold" title={`Dokter sedang cuti: ${sch.doctorCurrentLeave?.reason || 'Cuti'}`}>
                                  <CalendarOff size={11} />
                                  <span>Sedang Cuti ({sch.doctorCurrentLeave?.reason || 'Cuti'})</span>
                                </span>
                              )}

                              {!sch.doctorIsOnLeave && sch.doctorUpcomingLeave && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                                  <CalendarOff size={11} />
                                  <span>Akan Cuti ({new Date(sch.doctorUpcomingLeave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => openDoctorStatusPage(sch, matchedDoc, 'schedules')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                                title="Atur dokter tidak praktik pada tanggal tertentu (cuti/izin)"
                              >
                                <CalendarOff size={13} className="text-amber-600" />
                                <span>Atur Libur</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSchedule(sch)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                title="Edit Jam & Ruangan Jadwal"
                              >
                                <Pencil size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDelete('doctor_schedule', sch, `Jadwal ${sch.doctorName} (${sch.day} ${sch.time})`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                title="Hapus Jadwal"
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
          </div>
        )}

        {/* ── SUB-TAB 2: DAFTAR CUTI & TIDAK PRAKTIK DOKTER ── */}
        {scheduleSubTab === 'leaves' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Dokter</th>
                  <th className="py-3 px-4">Sesi / Cakupan</th>
                  <th className="py-3 px-4">Periode Tidak Praktik</th>
                  <th className="py-3 px-4">Alasan &amp; Catatan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {doctorLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <CalendarOff size={36} className="mx-auto text-teal-600/40 mb-2" />
                      <p className="font-semibold text-slate-700">Belum ada dokter yang dijadwalkan cuti / tidak praktik</p>
                      <p className="text-xs text-slate-400 mt-0.5">Gunakan tombol "Atur Dokter Libur / Cuti" untuk mengatur.</p>
                    </td>
                  </tr>
                ) : (
                  doctorLeaves.map(leave => {
                    const doc = doctors.find(d => String(d.id || d.dbId) === String(leave.doctor_id));
                    const isCurrent = leave.is_active_today;
                    const isUpcoming = !isCurrent && new Date(leave.start_date) > new Date();

                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={formatImageUrl ? formatImageUrl(doc?.photo || doc?.photo_url, '/images/default-doctor.svg') : (doc?.photo || doc?.photo_url || '/images/default-doctor.svg')}
                              alt={doc?.name || 'Dokter'}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={e => { e.target.src = '/images/default-doctor.svg'; }}
                            />
                            <div>
                              <strong className="block text-slate-900 font-bold">{doc?.name || `Dokter ID #${leave.doctor_id}`}</strong>
                              <span className="text-[11px] text-slate-500">{doc?.specialty || doc?.specialization?.name || 'Dokter Spesialis'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100">
                            {leave.scope_label || 'Semua Sesi Praktik'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 text-xs">
                            {new Date(leave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {leave.start_date !== leave.end_date && ` s/d ${new Date(leave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {leave.reason || 'Izin / Cuti Dokter'}
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
                              const res = await adminDeleteDoctorLeave(leave.id);
                              if (res?.success) {
                                showToast('Jadwal cuti berhasil dibatalkan. Dokter kembali aktif berpraktik.');
                              } else {
                                showToast(res?.message || 'Gagal membatalkan cuti.', 'error');
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Batalkan cuti ini dan kembalikan dokter ke jadwal praktik"
                          >
                            <Trash2 size={13} className="text-rose-600" />
                            <span>Batalkan Cuti</span>
                          </button>
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
    </div>
  );
}
