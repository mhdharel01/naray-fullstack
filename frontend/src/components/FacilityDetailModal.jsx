import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Cpu, 
  Info 
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function FacilityDetailModal({ facility, onClose }) {
  const { hospitalInfo = {}, formatImageUrl } = useHospitalData();

  // Handle ESC key and lock body scroll
  useEffect(() => {
    if (!facility) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [facility, onClose]);

  if (!facility) return null;

  // Resolve facility fields safely
  const facName = facility.name || 'Fasilitas Layanan Medis';
  const facCategory = typeof facility.category === 'object' 
    ? (facility.category?.name || 'Fasilitas Diagnostik & Medis') 
    : (facility.category || facility.tag || facility.type || 'Fasilitas Diagnostik & Medis');
  const facDesc = facility.description || facility.desc || 'Fasilitas penunjang medis modern berstandar akreditasi paripurna yang dirancang untuk mendukung diagnosis akurat dan perawatan pasien secara komprehensif.';
  
  // Resolve image URL with formatImageUrl and fallback
  const rawImage = facility.image_url || facility.image || facility.photo;
  const facImage = formatImageUrl 
    ? formatImageUrl(rawImage, '/images/discovery/diagnostic-center.jpg') 
    : (rawImage || '/images/discovery/diagnostic-center.jpg');

  // Features list
  const featuresList = Array.isArray(facility.features) && facility.features.length > 0 
    ? facility.features 
    : [
        'Presisi diagnosa tinggi dengan radiasi minimal dan akurasi terkalibrasi',
        'Waktu prosedur cepat, higienis, dan nyaman bagi pasien',
        'Terintegrasi secara real-time dengan Rekam Medis Elektronik (RME) Rumah Sakit',
        'Dioperasikan oleh tenaga medis & radiografer/analis bersertifikasi nasional'
      ];

  const operationalHours = facility.operational_hours || facility.operationalHours || facility.hours || '24 Jam (IGD/Rawat Inap) & 08:00 - 20:00 WIB (Rawat Jalan)';
  const location = facility.location || facility.room || facility.floor || 'Gedung Utama RS Naray Dumai';
  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button 
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-30 backdrop-blur-md shadow-md hover:scale-105 active:scale-95" 
          onClick={onClose} 
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Hero Visual Header with Image Overlay */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-950 shrink-0">
          <img 
            src={facImage} 
            alt={facName} 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = '/images/discovery/diagnostic-center.jpg';
            }}
          />
          {/* Subtle gradient vignette for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

          {/* Badges & Title in Banner */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end pointer-events-none">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/25 border border-teal-400/40 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                <Sparkles size={12} />
                <span>{facCategory}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <ShieldCheck size={13} />
                <span>Standar KARS Paripurna</span>
              </span>
            </div>

            <h2 
              id="facility-modal-title" 
              className="font-heading text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-sm"
            >
              {facName}
            </h2>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-slate-700">
          
          {/* Overview Section */}
          <div>
            <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-2">
              <Cpu size={16} className="text-teal-600" />
              <span>Deskripsi &amp; Peran Klinis</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              {facDesc}
            </p>
          </div>

          {/* Clinical Advantages */}
          <div>
            <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>Keunggulan Fasilitas &amp; Pelayanan:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {featuresList.map((feat, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-colors hover:bg-teal-50/50 hover:border-teal-100"
                >
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Grid (Hours & Location) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">Waktu Operasional</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight mt-0.5">{operationalHours}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">Lokasi Penunjang</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight mt-0.5">{location}</span>
              </div>
            </div>
          </div>

          {/* Patient Notice / Info Callout */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2.5">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="m-0 leading-relaxed text-amber-900/90">
              Untuk pemeriksaan radiologi terencana, laboratorium khusus, atau tindakan bedah elektif, Anda disarankan melakukan pendaftaran atau konsultasi awal dengan dokter poliklinik terkait.
            </p>
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95" 
            onClick={onClose}
          >
            Tutup
          </button>
          
          <a 
            href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan jadwal dan informasi fasilitas: ${facName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer hover:shadow-lg hover:shadow-teal-700/25 active:scale-95"
          >
            <MessageCircle size={16} />
            <span>Tanya Jadwal via WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
