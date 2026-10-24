import React from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Microscope
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function HospitalServicesDiscovery({ onOpenEmergency }) {
  const { inpatientRooms = [], centersOfExcellence = [], formatImageUrl } = useHospitalData();

  // Ensure high-end realistic imagery is always rendered
  const roomImage = '/images/discovery/vip-room.jpg';
  const mcuImage = '/images/discovery/mcu-lab.jpg';
  const centerImage = '/images/discovery/diagnostic-center.jpg';

  return (
    <section className="py-20 sm:py-28 bg-slate-50/70 border-b border-slate-200/80" id="eksplorasi-layanan" aria-labelledby="discovery-heading">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              FASILITAS &amp; PROGRAM
            </span>
            <h2 id="discovery-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2.5">
              Eksplorasi Fasilitas &amp; Program Perawatan Terpadu
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Temukan informasi mendalam seputar fasilitas rawat inap, paket pencegahan penyakit, dan layanan gawat darurat yang dirancang khusus untuk kenyamanan Anda dan keluarga.
            </p>
          </div>
          <div className="shrink-0">
            <Link 
              to="/kamar-rawat-inap" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-teal-300 px-5 py-2.5 rounded-full shadow-2xs transition-all"
            >
              <span>Detail Fasilitas</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* 3-Column Discovery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {/* Card 1: Kamar Rawat Inap & ICU */}
          <div className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
            <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden">
              <img
                src={roomImage}
                alt="Fasilitas Kamar Rawat Inap VIP Naray Hospital"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-teal-700 flex items-center justify-center shadow-md">
                <BedDouble size={20} />
              </div>
              <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
                Kenyamanan Pasien
              </span>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-xs font-semibold text-teal-200">101 Tempat Tidur</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex flex-col flex-1">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-teal-700 transition-colors">
                Kamar Rawat Inap &amp; ICU Eksklusif
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                Dirancang dengan standar higienis rumah sakit terakreditasi KARS dan kenyamanan setara hotel berbintang. Menyediakan 101 tempat tidur mulai dari VVIP Pistillum, Kelas 1, hingga Ruang ICU intensif.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>VVIP Pistillum (1 Pasien, Sofa Keluarga &amp; TV)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Ruang Rawat Intensif ICU Staments</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Ruang Isolasi Berstandar Hepafilter</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to="/kamar-rawat-inap"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span>Lihat Tipe Kamar &amp; Fasilitas</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Paket Skrining & Medical Check Up */}
          <div className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
            <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden">
              <img
                src={mcuImage}
                alt="Pemeriksaan Laboratorium & MCU Naray Hospital"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-teal-700 flex items-center justify-center shadow-md">
                <ShieldCheck size={20} />
              </div>
              <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
                Pencegahan &amp; Skrining
              </span>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-xs font-semibold text-teal-200">Lab Patologi Otomatis</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex flex-col flex-1">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-teal-700 transition-colors">
                Paket Medical Check Up (MCU)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                Pemeriksaan kesehatan preventif menyeluruh oleh dokter spesialis dengan dukungan laboratorium otomatis dan radiologi digital untuk deteksi dini risiko penyakit.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Paket Sehat Geriatri (Lansia Usia 55+)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Paket Skrining Jantung Koroner Terpadu</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Paket Platinum Eksekutif &amp; Pra-Nikah</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to="/paket-mcu"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span>Lihat Seluruh Paket MCU</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Pusat Layanan Medis & Diagnostik */}
          <div className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
            <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden">
              <img
                src={centerImage}
                alt="Teknologi Diagnostik & Layanan Unggulan Naray Hospital"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-teal-700 flex items-center justify-center shadow-md">
                <Microscope size={20} />
              </div>
              <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
                Teknologi &amp; Spesialis
              </span>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-xs font-semibold text-teal-200">Radiologi &amp; CT-Scan Digital</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex flex-col flex-1">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-teal-700 transition-colors">
                Pusat Medis &amp; Fasilitas Diagnostik
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                Pusat layanan terpadu yang memadukan dokter subspesialis berpengalaman dengan peralatan radiologi digital, CT-Scan 128 slice, dan laboratorium modern.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Pusat Jantung, Stroke &amp; Ibu-Anak</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Radiologi Digital &amp; USG 4D Terkini</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Laboratorium Klinik Otomatis 24 Jam</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to="/layanan-medis"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span>Eksplorasi Layanan Medis</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
