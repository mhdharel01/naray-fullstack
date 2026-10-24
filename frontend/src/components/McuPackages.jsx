import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  UserCheck,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function McuPackages({ onSelectPackage }) {
  const { mcuPackages = [], hospitalInfo = {} } = useHospitalData();
  const mcuPhone = (hospitalInfo?.mcuWhatsapp || hospitalInfo?.whatsappHotline || hospitalInfo?.phone || '6285363624796').replace(/[^0-9]/g, '');

  return (
    <section id="paket-mcu" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mb-2.5">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Pencegahan &amp; Skrining</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-3">
            Paket Pemeriksaan Kesehatan (MCU)
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Deteksi dini adalah langkah terbaik menjaga kualitas hidup Anda dan orang terkasih. Didesain secara komprehensif oleh tim dokter spesialis Naray Hospital.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {mcuPackages.map((pkg) => (
            <article 
              key={pkg.id} 
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1.5"
              onClick={() => onSelectPackage && onSelectPackage(pkg)}
            >
              {/* Header Box */}
              <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    <Sparkles size={12} className="text-teal-600" />
                    <span className="truncate">{pkg.badge || 'Pemeriksaan Rutin'}</span>
                  </span>
                  {pkg.originalPrice && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                      Promo
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2 font-heading">
                  {pkg.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {pkg.highlight}
                </p>

                {/* Price Row */}
                <div className="flex items-baseline gap-2.5 pt-2 border-t border-slate-100">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {pkg.price}
                  </span>
                  {pkg.originalPrice && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through">
                      {pkg.originalPrice}
                    </span>
                  )}
                </div>

                {/* Meta Chips */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Clock size={14} className="text-teal-600 shrink-0" />
                    <span className="truncate">{pkg.duration || '1.5 - 2 Jam'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <UserCheck size={14} className="text-sky-600 shrink-0" />
                    <span className="truncate">{pkg.target || 'Semua Usia'}</span>
                  </div>
                </div>
              </div>

              {/* Inclusions List */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                    Pemeriksaan Unggulan Termasuk:
                  </span>
                  <ul className="flex flex-col gap-2">
                    {(pkg.items || []).slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 size={15} className="text-teal-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {(pkg.items || []).length > 5 && (
                    <span className="inline-block text-[11px] font-bold text-teal-700 hover:text-teal-800 mt-2.5">
                      + {(pkg.items || []).length - 5} item pemeriksaan lainnya
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button 
                    type="button"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-700 group-hover:text-white group-hover:border-teal-700 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectPackage) onSelectPackage(pkg);
                    }}
                  >
                    <span>Rincian Paket</span>
                    <ArrowRight size={15} />
                  </button>

                  <a 
                    href={`https://wa.me/${mcuPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan pendaftaran ${pkg.name} (${pkg.price}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Daftar via WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
