import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Calendar, Clock, Stethoscope, MapPin, CheckCircle2,
  AlertCircle, Sparkles, Building2, Check, ShieldCheck
} from 'lucide-react';
import { formatImageUrl } from '../context/HospitalDataContext';

const DAYS_LIST = [
  { name: 'Senin', num: 1 },
  { name: 'Selasa', num: 2 },
  { name: 'Rabu', num: 3 },
  { name: 'Kamis', num: 4 },
  { name: 'Jumat', num: 5 },
  { name: 'Sabtu', num: 6 },
  { name: 'Minggu', num: 0 },
];

const TIME_PRESETS = [
  { label: 'Pagi (08:00 - 12:00)', start: '08:00', end: '12:00' },
  { label: 'Pagi Penuh (08:00 - 15:00)', start: '08:00', end: '15:00' },
  { label: 'Siang (13:00 - 16:00)', start: '13:00', end: '16:00' },
  { label: 'Sore (16:00 - 19:00)', start: '16:00', end: '19:00' },
  { label: 'Malam (19:00 - 21:00)', start: '19:00', end: '21:00' },
];

export function DoctorScheduleModal({
  isOpen,
  onClose,
  scheduleItem,
  doctors = [],
  polikliniks = [],
  onSave
}) {
  const isEdit = Boolean(scheduleItem && (scheduleItem.id || scheduleItem.dbId));

  const [formData, setFormData] = useState({
    doctor_id: '',
    poliklinik_id: '',
    day: 'Senin',
    start_time: '08:00',
    end_time: '12:00',
    room: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cek apakah modal dibuka dengan preset dokter yang terkunci
  const isDoctorPreset = Boolean(scheduleItem?.doctorDbId || scheduleItem?.doctorId);

  useEffect(() => {
    if (!isOpen) return;

    if (scheduleItem) {
      const docId = scheduleItem.doctorDbId || scheduleItem.doctorId || (doctors[0]?.dbId || doctors[0]?.id || '');
      const poliId = scheduleItem.poliklinikId || (polikliniks[0]?.dbId || polikliniks[0]?.id || '');

      setFormData({
        doctor_id: String(docId),
        poliklinik_id: String(poliId),
        day: scheduleItem.day || 'Senin',
        start_time: scheduleItem.startTime || (scheduleItem.time ? scheduleItem.time.split(' - ')[0] : '08:00'),
        end_time: scheduleItem.endTime || (scheduleItem.time ? scheduleItem.time.split(' - ')[1]?.replace(' WIB', '') : '12:00'),
        room: scheduleItem.room || '',
        status: scheduleItem.status || 'active',
      });
    } else {
      const defaultDocId = doctors[0]?.dbId || doctors[0]?.id || '';
      const defaultPoliId = polikliniks[0]?.dbId || polikliniks[0]?.id || '';

      setFormData({
        doctor_id: String(defaultDocId),
        poliklinik_id: String(defaultPoliId),
        day: 'Senin',
        start_time: '08:00',
        end_time: '12:00',
        room: '',
        status: 'active',
      });
    }
    setError('');
  }, [isOpen, scheduleItem, doctors, polikliniks]);

  const selectedDoctor = useMemo(() => {
    return (doctors || []).find(d => String(d.dbId || d.id) === String(formData.doctor_id));
  }, [doctors, formData.doctor_id]);

  const selectedPoli = useMemo(() => {
    return (polikliniks || []).find(p => String(p.dbId || p.id) === String(formData.poliklinik_id));
  }, [polikliniks, formData.poliklinik_id]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      start_time: preset.start,
      end_time: preset.end,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.doctor_id) {
      setError('Silakan pilih dokter spesialis terlebih dahulu.');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      setError('Jam mulai dan jam selesai praktik wajib diisi.');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError('Jam selesai praktik harus lebih akhir dari jam mulai.');
      return;
    }

    setLoading(true);
    try {
      const dayObj = DAYS_LIST.find(d => d.name.toLowerCase() === (formData.day || '').toLowerCase()) || { num: 1 };
      
      const payload = {
        doctor_id: formData.doctor_id,
        doctorId: formData.doctor_id,
        poliklinik_id: formData.poliklinik_id,
        poliklinikId: formData.poliklinik_id,
        day: formData.day,
        day_of_week: dayObj.num,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room,
        status: formData.status,
      };

      await onSave(payload, scheduleItem?.id, scheduleItem?.dbId);
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Gagal menyimpan jadwal dokter.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10050] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800">
                  Master SIMRS
                </span>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  {isEdit ? 'Ubah Slot Jadwal Praktik' : 'Tambah Slot Jadwal Praktik'}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Atur hari, jam operasional, poliklinik, dan ruangan praktik dokter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-150 shrink-0">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Dokter Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Stethoscope size={14} className="text-teal-600" />
                <span>Pilih Dokter Spesialis <span className="text-rose-500">*</span></span>
              </span>
              {selectedDoctor && (
                <span className="text-[11px] font-semibold text-teal-700">
                  {typeof selectedDoctor.specialty === 'object' ? selectedDoctor.specialty?.name : (selectedDoctor.specialty || selectedDoctor.specialization?.name || 'Spesialis')}
                </span>
              )}
            </label>

            {isDoctorPreset && selectedDoctor ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={formatImageUrl(selectedDoctor.photo || selectedDoctor.photo_url, '/images/default-doctor.svg')}
                  alt={selectedDoctor.name}
                  onError={(e) => { e.target.src = '/images/default-doctor.svg'; }}
                  className="w-11 h-11 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {selectedDoctor.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    SIP: {selectedDoctor.sip || 'SIP Terdaftar'} • Naray Hospital
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-teal-100 text-teal-800">
                  Dokter Terpilih
                </span>
              </div>
            ) : (
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="" disabled>-- Pilih Dokter Spesialis --</option>
                {(doctors || []).map(doc => (
                  <option key={doc.id || doc.dbId} value={String(doc.dbId || doc.id)}>
                    {doc.name} — {typeof doc.specialty === 'object' ? doc.specialty?.name : (doc.specialty || doc.specialization?.name || 'Spesialis')}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Poliklinik & Ruangan Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Poliklinik */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 size={14} className="text-teal-600" />
                <span>Poliklinik / Departemen <span className="text-rose-500">*</span></span>
              </label>
              <select
                name="poliklinik_id"
                value={formData.poliklinik_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="" disabled>-- Pilih Poliklinik --</option>
                {(polikliniks || []).map(p => (
                  <option key={p.id || p.dbId} value={String(p.dbId || p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ruangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-teal-600" />
                <span>Ruangan / Lokasi (Opsional)</span>
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="Contoh: Poli Saraf - R. 204"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

          </div>

          {/* Hari Praktik (Pill Selector) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-teal-600" />
                <span>Pilih Hari Praktik Rutin <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Hari {formData.day}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS_LIST.map(d => {
                const isSelected = formData.day === d.name;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, day: d.name }))}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jam Operasional Praktik */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-teal-600" />
                <span>Jam Operasional Praktik <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[11px] text-slate-400">Pilih jam atau preset</span>
            </div>

            {/* Preset Jam Cepat */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {TIME_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-200 transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Jam Mulai:</span>
                <input
                  type="time"
                  name="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Jam Selesai:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name="end_time"
                    required
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-200 px-2 py-2 rounded-xl shrink-0">
                    WIB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
              <CheckCircle2 size={15} className="text-teal-600" />
              <span>Ringkasan Slot Jadwal SIMRS:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Dokter</div>
                <div className="font-bold text-slate-900 truncate">{selectedDoctor?.name || 'Belum dipilih'}</div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Jadwal Praktik</div>
                <div className="font-bold text-teal-900">
                  Hari {formData.day} ({formData.start_time} - {formData.end_time} WIB)
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Departemen</div>
                <div className="font-bold text-slate-900 truncate">
                  {selectedPoli?.name || 'Poliklinik'} {formData.room ? `• ${formData.room}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Check size={16} />
              <span>{loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan Slot' : 'Tambahkan Slot Jadwal')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
