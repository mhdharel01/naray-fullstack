import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Activity, 
  Calendar, 
  RefreshCw, 
  PhoneCall,
  Stethoscope
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { hospitalInfo } from '../data/hospitalData';

export default function SurgerySchedulePage() {
  const { simrsSurgeryData, refreshSurgeryData, doctors = [] } = useHospitalData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ambil data jadwal operasi dari SIMRS feed
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

  // Helper untuk mencocokkan foto dokter dari database/data lokal
  const getDoctorPhoto = (docName) => {
    if (!docName) return '/images/doctors/doctor-male-default.jpg';
    const cleanName = docName.toLowerCase().replace(/dr\.?\s*/i, '').trim();
    
    const matched = doctors.find(d => {
      const dClean = (d.name || '').toLowerCase().replace(/dr\.?\s*/i, '').trim();
      return dClean.includes(cleanName) || cleanName.includes(dClean);
    });

    if (matched?.photo && !matched.photo.includes('.svg') && !matched.photo.includes('default-doctor')) {
      return matched.photo;
    }

    const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(docName);
    return isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
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
              <span>Instalasi Bedah Sentral (IBS)</span>
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
                INSTALASI BEDAH SENTRAL
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Daftar Jadwal Operasi
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Informasi jadwal pelaksanaan tindakan operasi dokter spesialis Naray Hospital Kota Dumai yang terhubung langsung dengan sistem SIMRS.
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
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">TOTAL TINDAKAN</span>
                  <span className="font-heading text-lg font-black text-slate-900">{rawList.length} Operasi Terdaftar</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLiveSimrs ? 'bg-emerald-500' : 'bg-teal-500'} animate-pulse`} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    {isLiveSimrs ? 'Sinkronisasi Live SIMRS Dekago' : 'Sistem Antrean Operasi Terjadwal'}
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

        {/* ── 4. Main Surgery Schedule Grid (Style Disamakan Persis dengan Jadwal Dokter) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
              JADWAL TINDAKAN BEDAH
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Daftar Operasi Dokter Spesialis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Menampilkan <strong>{rawList.length}</strong> jadwal pelaksanaan operasi dokter penanggung jawab
            </p>
          </div>

          {/* Cards Grid — 3 Kolom Responsif seperti DoctorSchedulePage */}
          {rawList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Activity size={32} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800 mb-1">
                Tidak Ada Jadwal Operasi Terdaftar
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Saat ini belum ada jadwal tindakan bedah elektif yang terdaftar pada sistem SIMRS.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
              {rawList.map((item, idx) => {
                const doctorName = item.nama_dokter || item.dokter?.nama || 'Dokter Spesialis';
                const smfName = item.nama_smf || item.smf?.nama || 'Spesialis Bedah';
                const dateStr = item.tanggal || '-';
                const photoSrc = getDoctorPhoto(doctorName);

                return (
                  <div
                    key={idx}
                    className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar Dokter + Nama Dokter + Nama SMF */}
                      <div className="flex items-start gap-4 mb-5">
                        <img
                          src={photoSrc}
                          alt={`Foto ${doctorName}`}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover object-top border border-slate-100 bg-slate-100 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doctorName);
                            e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
                          }}
                        />

                        <div className="min-w-0 flex-1">
                          <span className="block text-teal-600 font-extrabold text-xs uppercase tracking-wider mb-1 font-mono truncate">
                            {smfName}
                          </span>
                          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                            {doctorName}
                          </h3>
                        </div>
                      </div>

                      {/* Middle Row: Tanggal Pelaksanaan Operasi (Clean & Simple) */}
                      <div className="py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <Calendar size={15} className="text-teal-600 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">Tgl Pelaksanaan</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 5. Assistance CTA Card ── */}
          <div className="mt-12 bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 block mb-2 font-mono">
                LAYANAN DARURAT &amp; BEDAH CITO 24 JAM
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold leading-tight mb-2">
                Informasi &amp; Panggilan Darurat Kamar Operasi
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Untuk koordinasi pasien rujukan dan persiapan tindakan bedah darurat (cito), hubungi Customer Care atau Instalasi Gawat Darurat (IGD) Naray Hospital Kota Dumai.
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
                <Stethoscope size={16} />
                <span>Jadwal Praktik Poliklinik</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
