import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  BedDouble, 
  Syringe, 
  Baby, 
  Activity, 
  Scan, 
  FlaskConical, 
  Pill, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function CentersOfExcellence({ onSelectCenter, onOpenEmergency }) {
  const navigate = useNavigate();
  const { centersOfExcellence = [] } = useHospitalData();

  // 8 Core Integrated Hospital Services Matching World-Class Reference Standard
  const coreServices = [
    {
      id: 'igd',
      name: 'IGD 24 Jam',
      icon: HeartPulse,
      iconBg: 'bg-red-50 text-red-600 border-red-100',
      description: 'Tim kegawatdaruratan siaga setiap saat dengan respons cepat dan fasilitas triase modern.',
      badge: '24 JAM',
      badgeColor: 'text-red-700 bg-red-50/80',
      action: 'emergency'
    },
    {
      id: 'rawat-inap',
      name: 'Rawat Inap',
      icon: BedDouble,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pilihan kamar VIP dan standar yang nyaman serta asri untuk ketenangan proses pemulihan.',
      badge: 'SETIAP HARI',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'rooms'
    },
    {
      id: 'bedah',
      name: 'Bedah',
      icon: Syringe,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Layanan tindakan bedah komprehensif didukung kamar operasi steril dan peralatan mutakhir.',
      badge: 'SESUAI JADWAL',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    },
    {
      id: 'kebidanan',
      name: 'Kebidanan',
      icon: Baby,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pendampingan ibu dan bayi sejak masa kehamilan, persalinan aman, hingga pasca melahirkan.',
      badge: '24 JAM',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    },
    {
      id: 'hemodialisa',
      name: 'Hemodialisa',
      icon: Activity,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pelayanan dialisis terpadu oleh tim berpengalaman di ruang perawatan yang nyaman.',
      badge: 'SENIN - SABTU',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    },
    {
      id: 'radiologi',
      name: 'Radiologi',
      icon: Scan,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pemeriksaan diagnostik digital untuk mendukung ketepatan keputusan klinis dokter.',
      badge: '24 JAM',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    },
    {
      id: 'laboratorium',
      name: 'Laboratorium',
      icon: FlaskConical,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pemeriksaan spesimen darah dan cairan klinis cepat, akurat, dan terintegrasi sistem SIMRS.',
      badge: '24 JAM',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    },
    {
      id: 'farmasi',
      name: 'Farmasi',
      icon: Pill,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'Pelayanan obat resep dan konsultasi apoteker profesional untuk keselamatan konsumsi terapi.',
      badge: '24 JAM',
      badgeColor: 'text-teal-700 bg-teal-50/80',
      action: 'services'
    }
  ];

  const handleCardClick = (service) => {
    if (service.action === 'emergency') {
      if (onOpenEmergency) {
        onOpenEmergency();
      } else {
        window.open('tel:+6285363395383');
      }
      return;
    }
    if (service.action === 'rooms') {
      navigate('/kamar-rawat-inap');
      return;
    }
    // Check if this matches a center from DB
    const matchingDbCenter = centersOfExcellence.find(c => 
      c.title?.toLowerCase().includes(service.name.toLowerCase()) || 
      c.name?.toLowerCase().includes(service.name.toLowerCase())
    );
    if (matchingDbCenter && onSelectCenter) {
      onSelectCenter(matchingDbCenter);
    } else {
      navigate('/layanan-medis');
    }
  };

  return (
    <section 
      id="layanan-unggulan" 
      className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200/70"
      aria-labelledby="services-heading"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              LAYANAN UNGGULAN
            </span>
            <h2 id="services-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2.5">
              Perawatan terpadu dalam satu rumah sakit
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Dari kondisi darurat hingga perawatan lanjutan, tim kami hadir di setiap tahap pemulihan Anda.
            </p>
          </div>

          <div className="shrink-0">
            <Link 
              to="/layanan-medis" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-teal-300 px-5 py-2.5 rounded-full shadow-2xs transition-all"
            >
              <span>Semua Layanan</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* 8 Services Grid (4 Cols on Large, 2 Cols on Tablet, 1 on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {coreServices.map((service) => {
            const IconComponent = service.icon;

            return (
              <div
                key={service.id}
                onClick={() => handleCardClick(service)}
                className="group bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 hover:border-teal-400 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Service Icon Box */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 transition-transform duration-300 group-hover:scale-105 ${service.iconBg}`}>
                    <IconComponent size={22} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-2 leading-snug">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-6 min-h-[40px]">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Schedule Badge (Clean typography matching reference) */}
                <div className="pt-2 flex items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700 group-hover:text-teal-800 transition-colors">
                    {service.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
