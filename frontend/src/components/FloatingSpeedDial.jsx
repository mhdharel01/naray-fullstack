import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Ambulance, 
  Headphones
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function FloatingSpeedDial({ onOpenEmergency }) {
  const [isOpen, setIsOpen] = useState(false);
  const { hospitalInfo = {} } = useHospitalData();

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Halo Naray Hospital, saya ingin mendapatkan informasi jadwal dokter / reservasi layanan rumah sakit.");
    const wa = (hospitalInfo.whatsappHotline || hospitalInfo.phone || '628117529798').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${wa}?text=${text}`, '_blank');
  };

  const handleWhatsAppUGD = () => {
    const text = encodeURIComponent("Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis gawat darurat.");
    const waUGD = (hospitalInfo.emergencyHotline || hospitalInfo.ambulanceHotline || '6285363395383').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${waUGD}?text=${text}`, '_blank');
  };

  const handleCallCenter = () => {
    const text = encodeURIComponent("Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi pelayanan rumah sakit.");
    const callCenterWa = (hospitalInfo.callCenter || '628137258376').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${callCenterWa}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* WhatsApp Layanan & Poliklinik */}
          <button 
            type="button"
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={handleWhatsApp}
            title="Chat WhatsApp Informasi & Pendaftaran"
          >
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
              WhatsApp 24 Jam
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-all">
              <MessageCircle size={22} />
            </div>
          </button>

          {/* WhatsApp UGD & Ambulans 24 Jam */}
          <button 
            type="button"
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={handleWhatsAppUGD}
            title="Chat WhatsApp UGD & Ambulans 24 Jam"
          >
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
              WhatsApp UGD &amp; Ambulans 24 Jam
            </span>
            <div className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-all">
              <Ambulance size={22} className="animate-pulse" />
            </div>
          </button>

          {/* WhatsApp Call Center */}
          <button 
            type="button"
            onClick={handleCallCenter}
            className="flex items-center gap-3 group cursor-pointer"
            title="Chat WhatsApp Call Center Naray"
          >
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
              Call Center {hospitalInfo.callCenter || '+62 813-7258-376'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-105 transition-all">
              <Headphones size={22} />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Toggle Button */}
      <button 
        type="button"
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all cursor-pointer ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-90 scale-95 shadow-slate-900/30' 
            : 'bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-teal-700/30 hover:scale-105 active:scale-95'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Akses Bantuan & Kontak Cepat"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
