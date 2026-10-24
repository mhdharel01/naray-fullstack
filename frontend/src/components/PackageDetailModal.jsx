import React, { useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  UserCheck, 
  Sparkles, 
  FileText, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function PackageDetailModal({ pkg, onClose }) {
  const { hospitalInfo = {} } = useHospitalData();

  // Escape key & body scroll lock
  useEffect(() => {
    if (!pkg) return;

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
  }, [pkg, onClose]);

  if (!pkg) return null;

  const mcuPhone = (hospitalInfo?.mcuWhatsapp || hospitalInfo?.whatsappHotline || hospitalInfo?.phone || '6285363624796').replace(/[^0-9]/g, '');
  const targetAudience = pkg.target || pkg.targetPatient || 'Pria & Wanita Dewasa';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-modal-title"
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col" 
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

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-br from-[#042622] via-teal-950 to-slate-900 text-white p-6 sm:p-8 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} />
            <span>{pkg.badge || "Paket Medical Check Up"}</span>
          </span>
          <h2 
            id="package-modal-title"
            className="font-heading text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2"
          >
            {pkg.name}
          </h2>
          <p className="text-teal-200/90 text-xs sm:text-sm leading-relaxed m-0">
            {pkg.highlight || pkg.tagline || 'Pemeriksaan kesehatan preventif komprehensif.'}
          </p>

          <div className="flex items-baseline gap-3 mt-4 pt-3 border-t border-teal-800/40">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{pkg.price}</span>
            {pkg.originalPrice && (
              <span className="text-sm text-teal-300/70 line-through">{pkg.originalPrice}</span>
            )}
            {pkg.originalPrice && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                Promo Spesial
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-slate-700">
          {/* Metadata chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimasi Waktu:</span>
                <strong className="text-xs sm:text-sm text-slate-900 font-bold truncate">{pkg.duration || '2 - 3 Jam'}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Pasien:</span>
                <strong className="text-xs sm:text-sm text-slate-900 font-bold truncate">{targetAudience}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div>
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Deskripsi Paket
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                {pkg.description}
              </p>
            </div>
          )}

          {/* Included Items Checklist */}
          {Array.isArray(pkg.items) && pkg.items.length > 0 && (
            <div>
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <FileText size={15} className="text-teal-600" />
                <span>Rincian Item Pemeriksaan Termasuk ({pkg.items.length} Item)</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {pkg.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-colors hover:bg-teal-50/50 hover:border-teal-100">
                    <Check size={16} className="text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fasting Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Persiapan Sebelum Pemeriksaan:</span>
              <p className="m-0 leading-relaxed text-amber-900/90">
                Disarankan berpuasa 10–12 jam sebelum jadwal pemeriksaan untuk tes gula darah puasa dan profil kolesterol. Tetap diperbolehkan minum air putih.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95" 
            onClick={onClose}
          >
            Tutup
          </button>
          <a 
            href={`https://wa.me/${mcuPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin reservasi / konsultasi Paket MCU: ${pkg.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer hover:shadow-lg hover:shadow-teal-700/25 active:scale-95"
          >
            <MessageCircle size={16} />
            <span>Reservasi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
