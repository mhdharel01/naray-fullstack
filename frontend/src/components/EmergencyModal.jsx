import React from 'react';
import { 
  X, 
  PhoneCall, 
  HeartPulse, 
  MapPin,
  MessageCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function EmergencyModal({ onClose }) {
  const { hospitalInfo = {} } = useHospitalData();
  const emNumber = hospitalInfo.emergencyHotline || '+62 853-6339-5383';
  const callCenterNum = hospitalInfo.callCenter || hospitalInfo.phone || '+62 811-7529-798';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer z-10" 
          onClick={onClose} 
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Emergency Header Banner */}
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Siaga UGD 24 Jam Nonstop</span>
          </div>
          <h2 id="emergency-modal-title" className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            Pusat Tanggap Darurat &amp; Ambulans
          </h2>
          <p className="text-red-100 text-sm leading-relaxed m-0">
            Dokter jaga bersertifikasi trauma, perawat gawat darurat, dan armada ambulans siaga 24 jam di Dumai Barat.
          </p>
        </div>

        {/* Main Emergency Call Band */}
        <div className="p-6 sm:p-8 bg-red-50/50 border-b border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Nomor WhatsApp &amp; Siaga UGD:</span>
            <strong className="font-heading text-2xl font-black text-slate-900 tracking-tight">{emNumber}</strong>
            <span className="text-xs text-slate-600 mt-0.5">Call Center: <strong className="text-slate-800">{callCenterNum}</strong></span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <a 
              href={`https://wa.me/${emNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <MessageCircle size={17} className="animate-bounce" />
              <span>WhatsApp UGD & Ambulans</span>
            </a>
            <a 
              href={`https://wa.me/${callCenterNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
              title="Chat WhatsApp Call Center"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Call Center</span>
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-4 bg-white">
          {/* Address */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <strong className="text-xs font-bold text-slate-900 uppercase tracking-wide">Lokasi Unit Gawat Darurat (UGD):</strong>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5 m-0">{hospitalInfo.address}</p>
            </div>
          </div>

          {/* Protocol Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <HeartPulse size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <strong className="text-xs font-bold text-slate-900 uppercase tracking-wide">Pelayanan Triase Cepat &amp; Pasien Kritis:</strong>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5 m-0">
                Penanganan cepat untuk pertolongan pertama kecelakaan, trauma kepala, serangan jantung, sesak napas berat, kejang demam anak, dan kegawatdaruratan kebidanan tanpa hambatan administratif.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer" 
            onClick={onClose}
          >
            Tutup Jendela Darurat
          </button>
        </div>
      </div>
    </div>
  );
}
