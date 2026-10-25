import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Activity, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Stethoscope, 
  PhoneCall, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { hospitalInfo } from '../data/hospitalData';

export default function SurgerySchedulePage() {
  const { simrsSurgeryData, refreshSurgeryData } = useHospitalData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ambil data jadwal operasi dari context
  const rawList = Array.isArray(simrsSurgeryData?.jadwal_operasi) 
    ? simrsSurgeryData.jadwal_operasi 
    : (Array.isArray(simrsSurgeryData?.data?.jadwal_operasi) ? simrsSurgeryData.data.jadwal_operasi : []);

  const isLiveSimrs = simrsSurgeryData?.source === 'simrs_live';
  const lastUpdate = simrsSurgeryData?.last_fetched || 'Sinkronisasi Otomatis';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshSurgeryData) {
      await refreshSurgeryData(true);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('selesai') || s === '2') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 size={13} className="text-slate-500" />
          <span>Selesai Tindakan</span>
        </span>
      );
    }
    if (s.includes('sedang') || s.includes('proses') || s === '1') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Sedang Berlangsung</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
        <Clock size={13} className="text-teal-600" />
        <span>Terjadwal</span>
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        
        {/* ── 1. Breadcrumbs Bar ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <Link to="/layanan-medis" className="hover:text-teal-600">
                Layanan Medis
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Jadwal Operasi</span>
            </nav>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Standar Transparansi IBS &amp; Mobile JKN</span>
            </div>
          </div>
        </div>

        {/* ── 2. Header Banner ── */}
        <div className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white relative overflow-hidden py-14 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 font-mono">
                <Activity size={14} />
                INSTALASI BEDAH SENTRAL (IBS)
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Daftar Jadwal Tindakan Operasi
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Papan informasi keterbukaan jadwal tindakan bedah Naray Hospital Kota Dumai. Terhubung langsung dengan sistem SIMRS rumah sakit demi kemudahan pemantauan keluarga pasien.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Quick Stats & Live Indicator Bar ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                  <Activity size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">TOTAL JADWAL</span>
                  <span className="font-heading text-lg font-black text-slate-900">{rawList.length} Tindakan</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLiveSimrs ? 'bg-emerald-500' : 'bg-teal-500'} animate-pulse`} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    {isLiveSimrs ? 'Sinkronisasi Live SIMRS Dekago' : 'Sistem Antrean Terjadwal'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Pembaruan: {lastUpdate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── 4. Main Surgery Schedule List ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          
          {/* Privacy Notice Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
            <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold block mb-0.5">Komitmen Perlindungan Privasi Pasien:</strong>
              Sesuai ketentuan perundang-undangan perlindungan data medis dan standar BPJS Kesehatan, identitas nama pasien tidak dipublikasikan ke publik. Pasien dan keluarga dapat mengonfirmasi jadwal operasi kepada dokter penanggung jawab (DPJP) atau perawat ruang rawat inap.
            </div>
          </div>

          {/* Schedule List Cards */}
          {rawList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Activity size={32} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800 mb-1">
                Tidak Ada Jadwal Operasi Saat Ini
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Kamar operasi saat ini dalam kondisi siaga darurat atau belum ada rencana tindakan elektif yang terdaftar pada sistem.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {rawList.map((item, idx) => {
                  const doctorName = item.nama_dokter || item.dokter?.nama || 'Dokter Spesialis Bedah';
                  const smfName = item.nama_smf || item.smf?.nama || 'Instalasi Bedah';
                  const roomName = item.nama_ruangan || `Kamar Operasi ${item.ruangan_id || (idx + 1)}`;
                  const dateStr = item.tanggal || '-';

                  return (
                    <div 
                      key={idx} 
                      className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Doctor & Department Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <Stethoscope size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50/80 px-2.5 py-0.5 rounded-lg border border-teal-200/60 font-mono">
                              {smfName}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                              <Building2 size={13} className="text-slate-400" />
                              <span>{roomName}</span>
                            </span>
                          </div>
                          <h3 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 leading-snug truncate">
                            {doctorName}
                          </h3>
                        </div>
                      </div>

                      {/* Right: Date, Time & Status */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 font-mono">
                          <Calendar size={15} className="text-teal-600" />
                          <span className="font-semibold">{dateStr}</span>
                        </div>

                        <div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 5. Assistance CTA Card ── */}
          <div className="mt-12 bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 block mb-2 font-mono">
                LAYANAN DARURAT &amp; BEDAH CITO 24 JAM
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold leading-tight mb-2">
                Memerlukan Penanganan Operasi Darurat (Cito)?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Tim bedah dan anestesi Naray Hospital siaga 24 jam untuk penanganan kasus darurat trauma, bedah obstetri (caesar cito), dan gawat darurat medis lainnya.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href={`tel:${hospitalInfo.emergencyHotline || '+6285363395383'}`}
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>Hotline UGD 24 Jam</span>
              </a>
              <Link
                to="/dokter-jadwal"
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Cek Jadwal Poliklinik</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
