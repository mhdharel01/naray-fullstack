import React from 'react';
import { 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { useHospitalData, DEFAULT_LEADERSHIP_MESSAGE } from '../context/HospitalDataContext';

export function NarayIdentitySection() {
  const { leadershipMessage = DEFAULT_LEADERSHIP_MESSAGE, formatImageUrl } = useHospitalData();
  const leader = leadershipMessage || DEFAULT_LEADERSHIP_MESSAGE;
  
  const rawImage = formatImageUrl ? formatImageUrl(leader.image, '/images/doctors/doctor-male-default.jpg') : (leader.image || '/images/doctors/doctor-male-default.jpg');
  const imageSrc = (rawImage && !rawImage.includes('.svg')) ? rawImage : '/images/doctors/doctor-male-default.jpg';

  return (
    <div className="bg-white py-20 sm:py-28 border-b border-slate-200/80" id="standar-mutu">
      {/* ── Standar Mutu Klinis & Komitmen Rumah Sakit (Editorial Presentation) ── */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Narrative & Standards */}
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              STANDAR MUTU PELAYANAN
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Pelayanan Medis yang Menempatkan Keselamatan Pasien Sebagai Prioritas
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-8">
              Naray Hospital melayani masyarakat Kota Dumai dan wilayah pesisir Riau dengan komitmen keselamatan pasien sebagai prioritas tertinggi. Seluruh proses pemeriksaan klinis dijalankan sesuai standar nasional, didukung sistem rekam medis elektronik terintegrasi yang mempermudah koordinasi antar dokter, laboratorium, dan apotek tanpa resep kertas yang memakan waktu.
            </p>

            {/* 3 Core Quality Benchmarks */}
            <div className="flex flex-col gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-start gap-4 transition-all hover:border-teal-300 hover:shadow-sm">
                <span className="font-heading text-xl font-black text-teal-600 shrink-0">01</span>
                <div>
                  <strong className="block text-sm sm:text-base font-bold text-slate-900 mb-1">Akreditasi Paripurna KARS &amp; Kemenkes RI</strong>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed m-0">
                    Peringkat akreditasi tertinggi dalam pemenuhan standar keselamatan pasien, pencegahan infeksi, dan tata kelola rumah sakit.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-start gap-4 transition-all hover:border-teal-300 hover:shadow-sm">
                <span className="font-heading text-xl font-black text-teal-600 shrink-0">02</span>
                <div>
                  <strong className="block text-sm sm:text-base font-bold text-slate-900 mb-1">100% Rekam Medis Elektronik Terintegrasi</strong>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed m-0">
                    Riwayat kesehatan, hasil lab diagnostik, dan resep obat tersimpan aman, mempercepat proses rujukan dan konsultasi antar dokter.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs flex items-start gap-4 transition-all hover:border-teal-300 hover:shadow-sm">
                <span className="font-heading text-xl font-black text-teal-600 shrink-0">03</span>
                <div>
                  <strong className="block text-sm sm:text-base font-bold text-slate-900 mb-1">Fasilitas Higienis dan Menenangkan</strong>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed m-0">
                    Ruang tunggu dan kamar perawatan dirancang dengan sirkulasi udara berfilter medis, pencahayaan alami, serta sistem antrean tertib.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Clinical Leadership Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden">
              <div className="relative aspect-4/3.5 bg-slate-900 overflow-hidden">
                <img 
                  src={imageSrc} 
                  alt={leader.name || 'Direktur dan Komite Medis Naray Hospital Dumai'} 
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { e.currentTarget.src = '/images/default-doctor.svg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <strong className="block font-heading text-lg font-bold leading-tight">{leader.name || 'dr. Direktur & Komite Medis'}</strong>
                  <span className="text-xs text-teal-300 font-medium">{leader.title || 'Naray Hospital Kota Dumai, Riau'}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col gap-5 bg-white">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic m-0">
                  "{leader.quote || 'Bagi kami, setiap pasien adalah anggota keluarga yang sedang membutuhkan pertolongan. Dokter dan perawat kami hadir tidak hanya membawa keahlian medis, tetapi juga rasa hormat dan empati terhadap kenyamanan pasien selama masa perawatan.'}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs sm:text-sm font-bold text-slate-900 leading-tight">{leader.badgeTitle || 'Pesan Kepemimpinan Medis'}</strong>
                    <span className="text-[11px] text-slate-500 font-medium">{leader.badgeSubtitle || 'Dedikasi Pelayanan Kesehatan Kota Dumai'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
