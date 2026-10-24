import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Search,
  Stethoscope,
  BedDouble,
  UserCheck,
  ShieldCheck,
  PhoneCall,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function QuickSearchWidget({
  onOpenEmergency
}) {
  const navigate = useNavigate();
  const { poliklinikList = [], hospitalInfo = {} } = useHospitalData();

  // Search Doctor & Schedule Form State
  const [doctorKeyword, setDoctorKeyword] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (doctorKeyword.trim()) params.set('keyword', doctorKeyword.trim());
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);

    const query = params.toString();
    navigate(`/dokter-jadwal${query ? `?${query}` : ''}`);
  };

  // 5 Quick Action Items matching the user's reference (media_1792678797391.png)
  const quickActions = [
    {
      id: 'jadwal-dokter',
      title: 'Jadwal Dokter',
      subtitle: 'Temukan jadwal praktik',
      icon: Stethoscope,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
      action: () => navigate('/dokter-jadwal')
    },
    {
      id: 'pendaftaran-online',
      title: 'Daftar Online',
      subtitle: 'Daftar tanpa antre panjang',
      icon: UserCheck,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
      action: () => navigate('/dokter-jadwal')
    },
    {
      id: 'tempat-tidur',
      title: 'Tempat Tidur',
      subtitle: 'Cek ketersediaan kamar',
      icon: BedDouble,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
      action: () => navigate('/kamar-rawat-inap')
    },
    {
      id: 'paket-mcu',
      title: 'Paket MCU',
      subtitle: 'Informasi biaya layanan',
      icon: ShieldCheck,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
      action: () => navigate('/paket-mcu')
    },
    {
      id: 'kontak-darurat',
      title: 'UGD 24 Jam',
      subtitle: 'Kanal siaga darurat',
      icon: PhoneCall,
      iconColor: 'text-red-600 bg-red-50 border-red-100',
      action: () => {
        if (onOpenEmergency) {
          onOpenEmergency();
        } else {
          window.open('tel:+6285363395383');
        }
      }
    }
  ];

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 mb-12 sm:mb-16 relative z-30" aria-label="Widget Aksi Cepat dan Pencarian Dokter">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden transition-all">
        
        {/* 1. Five Quick Action Tiles (Matching Golden Reference: RSU Dadi Keluarga Ciamis) */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          {quickActions.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={`group flex items-center justify-between p-4 sm:p-5 lg:p-6 text-left hover:bg-slate-50/80 transition-all cursor-pointer ${
                  index === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${item.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug truncate">
                      {item.title}
                    </strong>
                    <span className="block text-[11px] sm:text-xs text-slate-500 font-normal leading-tight truncate mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        {/* 2. Streamlined Doctor & Polyclinic Fast Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            role="search"
            aria-label="Pencarian Cepat Dokter & Poliklinik"
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={doctorKeyword}
                onChange={(e) => setDoctorKeyword(e.target.value)}
                placeholder="Cari nama dokter spesialis (cth: dr. Ahmad Musa, Sp.B)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            {/* Polyclinic Dropdown */}
            <div className="sm:w-64 shrink-0">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">Semua Poliklinik Spesialis</option>
                {poliklinikList.map((p) => (
                  <option key={p.id || p.dbId} value={p.name.replace(/.*Poliklinik\s+/, '')}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Cari Dokter</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
