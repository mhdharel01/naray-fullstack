import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Ambulance, 
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function Footer() {
  const { hospitalInfo = {} } = useHospitalData();
  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.phone || '+62 811-7529-798').replace(/[^0-9]/g, '');
  const rawEmergency = (hospitalInfo?.emergencyHotline || '+62 853-6339-5383').replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-[#121E24] text-slate-300 border-t border-slate-800" role="contentinfo" aria-label="Informasi Footer Rumah Sakit">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Kolom 1: Brand & Lokasi Singkat */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-700 bg-white flex items-center justify-center">
                <img src="/images/logo/logo.jpeg" alt="Naray Hospital Dumai" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-2xl leading-none tracking-tight text-white group-hover:text-teal-400 transition-colors">NARAY</span>
                <span className="text-[11px] font-bold tracking-widest text-teal-400 uppercase mt-0.5">HOSPITAL</span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed font-normal max-w-sm mt-1">
              Pelayanan medis modern berstandar Paripurna di Kota Dumai, menghadirkan kenyamanan, kepedulian, dan keunggulan klinis bagi setiap pasien dan keluarga.
            </p>

            <div className="flex items-start gap-2.5 text-xs text-slate-400 mt-2">
              <MapPin size={16} className="text-teal-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{hospitalInfo.address}</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-5">
              Akses Cepat
            </h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li>
                <Link to="/profil" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Profil &amp; Visi Misi</span>
                </Link>
              </li>
              <li>
                <Link to="/dokter-jadwal" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Dokter &amp; Jadwal Praktik</span>
                </Link>
              </li>
              <li>
                <Link to="/kamar-rawat-inap" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Kamar Rawat Inap &amp; ICU</span>
                </Link>
              </li>
              <li>
                <Link to="/layanan-medis" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Layanan Medis Unggulan</span>
                </Link>
              </li>
              <li>
                <Link to="/paket-mcu" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Paket Medical Check Up</span>
                </Link>
              </li>
              <li>
                <Link to="/berita-artikel" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Berita &amp; Edukasi Sehat</span>
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-teal-400 transition-colors">
                  <ChevronRight size={14} className="text-teal-500" /> 
                  <span>Pusat Bantuan &amp; Kontak</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Darurat & Kontak */}
          <div className="lg:col-span-4 flex flex-col">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-5">
              Layanan &amp; Bantuan
            </h3>
            
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Ambulance size={20} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-300">UGD &amp; Ambulans 24 Jam</span>
                <a href={`tel:${rawEmergency}`} className="text-base font-extrabold text-white hover:text-red-300 transition-colors tracking-wide">
                  {hospitalInfo.emergencyHotline}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <MessageCircle size={15} className="text-teal-400 shrink-0" />
                <a 
                  href={`https://wa.me/${rawPhone}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  WhatsApp: <strong className="text-slate-200">{hospitalInfo.whatsappHotline}</strong>
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Clock size={15} className="text-teal-400 shrink-0" />
                <span>Poliklinik: <strong className="text-slate-200">08.00 – 21.00 WIB</strong></span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <ShieldCheck size={15} className="text-amber-400 shrink-0" />
                <span>Terakreditasi Paripurna Kemenkes RI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-slate-800/80 py-6 bg-[#0D161B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Naray Hospital Dumai. All rights reserved.
          </p>
          <div className="flex items-center gap-3.5 flex-wrap justify-center">
            <Link to="/profil" className="hover:text-slate-300 transition-colors">Profil</Link>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <Link to="/dokter-jadwal" className="hover:text-slate-300 transition-colors">Dokter</Link>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <Link to="/kamar-rawat-inap" className="hover:text-slate-300 transition-colors">Rawat Inap</Link>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <Link to="/berita-artikel" className="hover:text-slate-300 transition-colors">Artikel</Link>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <Link to="/kontak" className="hover:text-slate-300 transition-colors">Kontak</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
