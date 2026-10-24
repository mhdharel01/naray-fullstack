import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  ShieldCheck, 
  Heart, 
  Target, 
  Award, 
  Users, 
  BedDouble, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ArrowRight,
  PhoneCall,
  Activity,
  FileCheck2,
  Compass,
  Check
} from 'lucide-react';
import { useHospitalData, DEFAULT_LEADERSHIP_MESSAGE } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { hospitalInfo } from '../data/hospitalData';

export default function ProfilePage() {
  const { leadershipMessage = DEFAULT_LEADERSHIP_MESSAGE, formatImageUrl } = useHospitalData();
  const leader = leadershipMessage || DEFAULT_LEADERSHIP_MESSAGE;
  const rawImage = formatImageUrl ? formatImageUrl(leader.image, '/images/doctors/doctor-male-default.jpg') : (leader.image || '/images/doctors/doctor-male-default.jpg');
  const leaderImg = (rawImage && !rawImage.includes('.svg')) ? rawImage : '/images/doctors/doctor-male-default.jpg';

  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.phone || '+62 811-7529-798').replace(/[^0-9]/g, '');

  const coreValues = [
    {
      letter: 'N',
      title: 'Nurse with Empathy',
      desc: 'Pelayanan yang dilandasi empati mendalam, menghargai martabat setiap pasien dan keluarga.',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      letter: 'A',
      title: 'Accuracy & Safety',
      desc: 'Presisi klinis tinggi dan penerapan standar keselamatan pasien tanpa kompromi.',
      color: 'from-sky-500 to-blue-600'
    },
    {
      letter: 'R',
      title: 'Respect & Integrity',
      desc: 'Menjunjung tinggi transparansi, kode etik kedokteran, dan integritas profesional.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      letter: 'A',
      title: 'Advanced Care',
      desc: 'Pemanfaatan sarana medis mutakhir dan Rekam Medis Elektronik (RME) terpadu.',
      color: 'from-indigo-500 to-violet-600'
    },
    {
      letter: 'Y',
      title: 'Yielding Excellence',
      desc: 'Dedikasi berkelanjutan untuk memberikan hasil perawatan terbaik demi pemulihan pasien.',
      color: 'from-emerald-500 to-teal-700'
    }
  ];

  const milestones = [
    {
      year: 'Fokus Keselamatan Pasien',
      title: 'Akreditasi Paripurna Bintang 5',
      desc: 'Meraih predikat tertinggi akreditasi Kemenkes RI dan Komisi Akreditasi Rumah Sakit (KARS) atas pemenuhan standar mutu pelayanan dan pencegahan infeksi.'
    },
    {
      year: 'Modernisasi Terintegrasi',
      title: '100% Rekam Medis Elektronik (RME)',
      desc: 'Seluruh riwayat medis, hasil laboratorium otomatis, radiologi, dan peresepan obat terkoneksi digital untuk kecepatan tindakan dokter spesialis.'
    },
    {
      year: 'Kapasitas & Fasilitas',
      title: '101 Tempat Tidur & Rawat Intensif',
      desc: 'Menyediakan ruang rawat inap bertingkat kenyamanan tinggi, dari Suite VIP Pistillum hingga ICU Staments dengan ventilator dan monitor hemodinamik.'
    },
    {
      year: 'Jangkauan Pelayanan',
      title: 'Pusat Medis Pesisir Riau',
      desc: 'Menjadi mitra kesehatan tepercaya bagi masyarakat Kota Dumai, kawasan industri maritim, serta rujukan pasien lintas wilayah pesisir Riau.'
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        
        {/* ── 1. Breadcrumbs Bar ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Profil Rumah Sakit</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Akreditasi Paripurna Kemenkes RI
            </span>
          </div>
        </div>

        {/* ── 2. Hero Header Section ── */}
        <div className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 font-mono">
                <Building2 size={14} />
                TENTANG NARAY HOSPITAL
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Melayani dengan Hati, Merawat dengan Keunggulan Klinis
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
                Naray Hospital hadir di Kota Dumai, Riau sebagai wujud dedikasi untuk memberikan standar layanan kesehatan modern, aman, dan berorientasi seutuhnya pada kesembuhan dan kenyamanan pasien.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Quick Stats Metric Strip ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <BedDouble size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">KAPASITAS RAWAT</span>
                <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">101 Bed</span>
                <span className="text-xs text-slate-500 block">Kamar Modern &amp; ICU</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Stethoscope size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">TENAGA MEDIS</span>
                <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">19+</span>
                <span className="text-xs text-slate-500 block">Dokter Spesialis Ahli</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">MUTU PELAYANAN</span>
                <span className="font-heading text-xl sm:text-2xl font-black text-amber-700">Paripurna</span>
                <span className="text-xs text-slate-500 block">Bintang 5 Kemenkes RI</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-100">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">LAYANAN DARURAT</span>
                <span className="font-heading text-2xl sm:text-3xl font-black text-red-700">24 Jam</span>
                <span className="text-xs text-slate-500 block">IGD &amp; Ambulans Cepat</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Sejarah & Kisah Pendirian ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
                SEJARAH &amp; DEDIKASI
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
                Membangun Standar Baru Pelayanan Kesehatan di Kota Dumai
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                <p>
                  Naray Hospital didirikan dengan sebuah cita-cita mulia: menghadirkan fasilitas kesehatan berstandar rumah sakit metropolitan di kawasan pesisir Riau, sehingga masyarakat Kota Dumai dan sekitarnya tidak perlu lagi melakukan perjalanan jauh ke luar kota untuk mendapatkan penanganan medis spesialis yang akurat.
                </p>
                <p>
                  Dengan mengusung moto <strong>&quot;Serve With Heart&quot;</strong>, kami memadukan kecanggihan teknologi diagnostik mutakhir — seperti CT-Scan, laboratorium otomatis, dan fasilitas bedah modern — dengan pendekatan asuhan keperawatan yang hangat, manusiawi, dan sarat empati.
                </p>
                <p>
                  Setiap sudut rumah sakit, mulai dari ruang tunggu rawat jalan, ruang poliklinik spesialis, hingga kamar rawat inap, dirancang dengan konsep ramah pasien untuk menciptakan suasana yang menenangkan, higienis, dan mempercepat proses pemulihan.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Sistem Rekam Medis Digital</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Mitra BPJS &amp; Asuransi Swasta</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Farmasi &amp; Radiologi Siaga 24 Jam</span>
                </div>
              </div>
            </div>

            {/* Right Media Display */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 aspect-4/3">
                  <img 
                    src="/images/discovery/diagnostic-center.jpg" 
                    alt="Fasilitas Naray Hospital Dumai" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-200/90 max-w-xs hidden sm:flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 leading-tight">Standar Akreditasi Paripurna</strong>
                    <span className="text-[11px] text-slate-500">Kemenkes RI &amp; KARS</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 5. Visi & Misi Rumah Sakit ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              ARAH &amp; TUJUAN STRATEGIS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Visi &amp; Misi Naray Hospital
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Card Visi */}
            <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center mb-6">
                  <Target size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal-300 block mb-2 font-mono">
                  VISI RUMAH SAKIT
                </span>
                <h3 className="font-heading text-2xl font-bold leading-snug mb-4">
                  Menjadi Pusat Layanan Kesehatan Rujukan Terdepan dan Terpercaya di Riau
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  Memberikan pelayanan kesehatan berstandar nasional yang mengintegrasikan keahlian klinis, inovasi teknologi digital, serta keramahan yang tulus demi keselamatan pasien.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-teal-700/50 flex items-center gap-3 text-xs text-teal-200">
                <Sparkles size={16} />
                <span>Pelayanan Berorientasi Mutu dan Keselamatan Pasien</span>
              </div>
            </div>

            {/* Card Misi (4 Pilar) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center">
                    <Compass size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-700 block font-mono">
                      MISI UTAMA
                    </span>
                    <h3 className="font-heading text-xl font-bold text-slate-900">
                      Komitmen Operasional Naray Hospital
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-heading text-sm font-black text-teal-600 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                      01
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal m-0">
                      Memberikan pelayanan medis komprehensif, cepat, tepat, dan terjangkau bagi seluruh lapisan masyarakat tanpa membeda-bedakan.
                    </p>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-heading text-sm font-black text-teal-600 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                      02
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal m-0">
                      Mengembangkan sarana prasarana diagnostik mutakhir dan digitalisasi rumah sakit untuk memastikan ketepatan penegakan diagnosis.
                    </p>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-heading text-sm font-black text-teal-600 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                      03
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal m-0">
                      Meningkatkan kompetensi, profesionalisme, dan rasa empati seluruh tenaga medis dan staf pendukung melalui pendidikan berkelanjutan.
                    </p>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-heading text-sm font-black text-teal-600 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                      04
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal m-0">
                      Menciptakan lingkungan rumah sakit yang bersih, higienis, aman, dan ramah lingkungan sesuai regulasi Kemenkes RI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 6. Nilai Budaya N-A-R-A-Y ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              NILAI BUDAYA KERJA
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Nilai Utama &amp; Karakter Insan Naray
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Prinsip perilaku yang menjiwai setiap interaksi dokter, perawat, dan staf dalam melayani pasien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {coreValues.map((val, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${val.color} text-white font-heading font-black text-2xl flex items-center justify-center mb-4 shadow-sm`}>
                    {val.letter}
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-2 leading-snug">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. Pesan Kepemimpinan Medis ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Leader Photo */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-3/4 max-w-sm mx-auto shadow-sm">
                  <img 
                    src={leaderImg} 
                    alt={leader.name || 'Pimpinan Medis Naray Hospital'} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Leader Statement */}
              <div className="lg:col-span-8">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
                  {leader.badgeTitle || 'PESAN KEPEMIMPINAN MEDIS'}
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                  &quot;Bagi Kami, Setiap Pasien Adalah Bagian dari Keluarga Besar Naray&quot;
                </h3>
                <blockquote className="text-sm sm:text-base text-slate-600 leading-relaxed italic border-l-4 border-teal-500 pl-4 py-1 mb-6">
                  {leader.quote || 'Bagi kami, setiap pasien adalah anggota keluarga yang sedang membutuhkan pertolongan. Dokter dan perawat kami hadir tidak hanya membawa keahlian medis, tetapi juga rasa hormat dan empati terhadap kenyamanan pasien selama masa perawatan.'}
                </blockquote>
                <div>
                  <strong className="block font-heading text-lg font-bold text-slate-900">
                    {leader.name || 'dr. Direktur & Komite Medis'}
                  </strong>
                  <span className="text-xs sm:text-sm text-teal-700 font-medium">
                    {leader.title || 'Naray Hospital Kota Dumai, Riau'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── 8. Call to Action Banner ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 block mb-2 font-mono">
                SIAP MELAYANI KESEHATAN KELUARGA ANDA
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold leading-tight mb-2">
                Konsultasikan Kebutuhan Medis Anda Bersama Dokter Spesialis Kami
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Temukan jadwal praktik dokter spesialis atau hubungi pusat bantuan Naray Hospital Kota Dumai 24 jam.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <Link 
                to="/dokter-jadwal"
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Stethoscope size={16} />
                <span>Cari Jadwal Dokter</span>
              </Link>
              <Link 
                to="/kontak"
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Hubungi Kami</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
