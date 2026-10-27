import React from 'react';
import { Phone, Ambulance, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function TopBar({ onOpenEmergency }) {
  const { hospitalInfo = {} } = useHospitalData();
  const emergencyNum = hospitalInfo.emergencyHotline || '+62 853-6339-5383';
  const callCenterNum = hospitalInfo.callCenter || '+62 813-7258-376';
  const hours = hospitalInfo.operatingHours || 'Poliklinik: 08.00 - 21.00 WIB';

  return (
    <div 
      className="bg-[#042622] text-slate-200 border-b border-teal-900/40 text-xs py-1.5 sm:py-2 select-none relative z-40 w-full overflow-hidden" 
      role="region" 
      aria-label="Informasi Kontak Darurat dan Jam Buka"
    >
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-center sm:justify-between gap-3 font-medium min-w-0">
        {/* Left: Emergency Hotline, Call Center & Operating Hours */}
        <div className="flex items-center gap-x-2 sm:gap-x-4 min-w-0">
          <a
            href={`https://wa.me/${emergencyNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] sm:text-xs shadow-sm shadow-red-950/40 transition-all cursor-pointer shrink-0 max-w-full"
            aria-label={`Hubungi WhatsApp UGD 24 Jam di nomor ${emergencyNum}`}
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping shrink-0" />
            <Ambulance size={13} className="text-white shrink-0 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">
              <span>WhatsApp UGD: </span>
              <strong className="tracking-wide">{emergencyNum}</strong>
            </span>
          </a>

          <span className="hidden sm:inline-block w-px h-3.5 bg-teal-800/60" role="separator" />

          <a
            href={`https://wa.me/${callCenterNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi pelayanan.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 hover:text-teal-300 transition-colors"
            aria-label={`Hubungi WhatsApp Call Center Naray Hospital di ${callCenterNum}`}
          >
            <Phone size={13} className="text-teal-400 shrink-0" />
            <span>Call Center: <strong className="text-white font-semibold">{callCenterNum}</strong></span>
          </a>

          <span className="hidden xl:inline-block w-px h-3.5 bg-teal-800/60" role="separator" />

          <div className="hidden xl:inline-flex items-center gap-1.5 text-slate-300">
            <Clock size={13} className="text-teal-400 shrink-0" />
            <span>{hours.includes('Poliklinik') ? hours : `Poliklinik: 08.00 - 21.00 WIB`}</span>
          </div>
        </div>

        {/* Right: Hospital Location & Accreditation (Hidden on mobile < sm to prevent layout overflow) */}
        <div className="hidden sm:flex items-center gap-x-3 sm:gap-x-4 shrink-0">
          <div className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
            <MapPin size={13} className="text-teal-400 shrink-0" />
            <span>Dumai Barat, Kota Dumai</span>
          </div>

          <span className="hidden md:inline-block w-px h-3.5 bg-teal-800/60" role="separator" />

          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-semibold text-[11px] tracking-wide shrink-0" 
            title="Akreditasi Paripurna Kemenkes RI & KARS"
          >
            <ShieldCheck size={13} className="text-amber-400 shrink-0" />
            <span>Akreditasi Paripurna KARS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
