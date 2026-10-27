import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Stethoscope, 
  Share2, 
  Copy, 
  Check, 
  PhoneCall, 
  MessageCircle, 
  User, 
  ArrowLeft, 
  Building2, 
  Sparkles, 
  Star,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

export default function DoctorDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { doctors = [], hospitalInfo = {}, poliklinikList = [] } = useHospitalData();
  const [copied, setCopied] = useState(false);

  // Helper to generate a clean URL slug from name
  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Find doctor by slug, id, dbId, or formatted name slug
  const doctor = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = String(slug).toLowerCase().trim();
    return doctors.find(d => 
      String(d.slug || '').toLowerCase() === cleanSlug ||
      String(d.id || '').toLowerCase() === cleanSlug ||
      String(d.dbId || '').toLowerCase() === cleanSlug ||
      toSlug(d.name) === cleanSlug ||
      cleanSlug.includes(toSlug(d.name)) ||
      toSlug(d.name).includes(cleanSlug)
    );
  }, [doctors, slug]);

  // Doctor photo helper with fallback
  const getDoctorPhoto = (doc) => {
    if (!doc) return '/images/doctors/doctor-male-default.jpg';
    if (doc.photo && 
        !doc.photo.includes('.svg') && 
        !doc.photo.includes('default-doctor') && 
        !doc.photo.includes('SL99Oz3WyX0Wj5ZKUhthIhEg5VlDMqnLDPe685B4')) {
      return doc.photo;
    }
    const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doc.name || '');
    return isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
  };

  const doctorPhoto = getDoctorPhoto(doctor);

  // Dynamic SEO & Open Graph (OG) Meta Tags
  useEffect(() => {
    if (doctor) {
      document.title = `${doctor.name} - Dokter Spesialis ${doctor.specialty} | Naray Hospital Dumai`;

      const setMeta = (nameOrProperty, content) => {
        let el = document.querySelector(`meta[property="${nameOrProperty}"]`) || document.querySelector(`meta[name="${nameOrProperty}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(nameOrProperty.startsWith('og:') ? 'property' : 'name', nameOrProperty);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content || '');
      };

      const desc = `Profil lengkap ${doctor.name}, Dokter Spesialis ${doctor.specialty} di Naray Hospital Dumai. Cek jadwal praktik mingguan, jam pelayanan, ruangan poliklinik, dan pendaftaran konsultasi.`;
      const img = doctorPhoto.startsWith('http') ? doctorPhoto : `${window.location.origin}${doctorPhoto}`;
      const url = window.location.href;

      setMeta('description', desc);
      setMeta('og:title', `${doctor.name} - Dokter Spesialis ${doctor.specialty}`);
      setMeta('og:description', desc);
      setMeta('og:image', img);
      setMeta('og:url', url);
      setMeta('og:type', 'profile');

      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', `${doctor.name} | Naray Hospital Dumai`);
      setMeta('twitter:description', desc);
      setMeta('twitter:image', img);

      // Add Schema.org Physician JSON-LD
      const schemaScriptId = 'doctor-schema-jsonld';
      let script = document.getElementById(schemaScriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = schemaScriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": doctor.name,
        "image": img,
        "medicalSpecialty": doctor.specialty,
        "description": desc,
        "hospitalAffiliation": {
          "@type": "Hospital",
          "name": "Naray Hospital Dumai",
          "telephone": hospitalInfo.emergencyHotline || "+62 853-6339-5383",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Putri Tujuh No. 88, Dumai Barat",
            "addressLocality": "Dumai",
            "addressRegion": "Riau",
            "addressCountry": "ID"
          }
        }
      });
    }

    return () => {
      const script = document.getElementById('doctor-schema-jsonld');
      if (script) script.remove();
    };
  }, [doctor, doctorPhoto, hospitalInfo]);

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${doctor.name} - Naray Hospital Dumai`,
        text: `Lihat jadwal praktik dan profil ${doctor.name} di Naray Hospital Dumai:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  // WhatsApp Registration Link Helper
  const getWhatsAppRegistrationUrl = () => {
    if (!doctor) return '#';
    const phone = (hospitalInfo.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
    const msg = `Halo Naray Hospital Dumai, saya ingin mendaftar janji temu / konsultasi dengan:\n*Dokter:* ${doctor.name}\n*Spesialisasi:* ${doctor.specialty}\nMohon informasi ketersediaan nomor antrean. Terima kasih.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Related Doctors from same or complementary specialty
  const relatedDoctors = useMemo(() => {
    if (!doctor) return [];
    return doctors
      .filter(d => d.id !== doctor.id && (d.specialty === doctor.specialty || d.specialtyGroup === doctor.specialtyGroup))
      .slice(0, 3);
  }, [doctors, doctor]);

  // Days list for weekly schedule view
  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  if (!doctor) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Dokter Tidak Ditemukan
          </h1>
          <p className="text-slate-600 text-sm max-w-md mb-6 leading-relaxed">
            Profil atau jadwal dokter yang Anda cari tidak tersedia atau tautan telah diperbarui. Silakan kembali ke direktori dokter untuk mencari spesialis lainnya.
          </p>
          <Link
            to="/dokter-jadwal"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Jadwal Dokter</span>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-20">
        
        {/* ── 1. Top Breadcrumb & Back Link ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <Link to="/dokter-jadwal" className="hover:text-teal-600">
                <span>Dokter &amp; Jadwal</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                {doctor.name}
              </span>
            </nav>

            <Link
              to="/dokter-jadwal"
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Direktori Dokter</span>
            </Link>
          </div>
        </div>

        {/* ── 2. Hero Profile Header Banner ── */}
        <header className="bg-linear-to-r from-[#03201d] via-[#042622] to-[#084d45] text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#00a896_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
              
              {/* Doctor Avatar Portrait */}
              <div className="relative shrink-0 mx-auto lg:mx-0">
                <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800">
                  <img
                    src={doctorPhoto}
                    alt={`Foto profil ${doctor.name}`}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doctor.name || '');
                      e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
                    }}
                  />
                </div>

                {/* Status Pill Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold shadow-lg border backdrop-blur-md ${
                    doctor.isOnLeave 
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/40' 
                      : (doctor.isPracticing 
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' 
                          : 'bg-slate-900/90 text-slate-300 border-slate-600/40')
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${doctor.isOnLeave ? 'bg-rose-400' : (doctor.isPracticing ? 'bg-emerald-400' : 'bg-slate-400')}`} />
                    <span>{doctor.isOnLeave ? 'Sedang Cuti' : (doctor.isPracticing ? 'Praktik Sesuai Jadwal' : 'Tidak Praktik')}</span>
                  </span>
                </div>
              </div>

              {/* Doctor Credentials & Highlights */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
                    {doctor.specialtyGroup || doctor.specialty}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-teal-400" />
                    <span>SIP Terverifikasi Kemenkes</span>
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2">
                  {doctor.name}
                </h1>
                
                <p className="text-teal-200 font-medium text-sm sm:text-base mb-5 max-w-2xl">
                  {doctor.subSpecialty || doctor.specialty}
                </p>

                {/* Meta Attributes Pills */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-slate-200 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <MapPin size={14} className="text-teal-400" />
                    <span>{doctor.branchName || 'Naray Hospital Dumai'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{doctor.rating || 5.0}</span>
                    <span className="text-slate-400">({doctor.reviewCount || 180}+ Pasien)</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <Award size={14} className="text-teal-400" />
                    <span>{doctor.experience || 'Dokter Spesialis Senior'}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <a
                    href={getWhatsAppRegistrationUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                  >
                    <MessageCircle size={17} />
                    <span>Daftar Konsultasi via WhatsApp</span>
                  </a>

                  <a
                    href={`https://wa.me/628117529798?text=${encodeURIComponent('Halo Call Center Naray Hospital, saya ingin bertanya tentang jadwal dokter ' + (doctor.name || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Call Center ({hospitalInfo.callCenter || '+62 811-7529-798'})</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                    title="Bagikan Profil Dokter"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                    <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </header>

        {/* ── 3. Main Body Content (Left: Clinical Info, Right: Booking & Related) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Clinical Profile & Full Weekly Schedule */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Card 1: Leave Notice Alert (If on leave) */}
              {doctor.isOnLeave && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-start gap-3.5 shadow-xs">
                  <AlertCircle size={24} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm sm:text-base font-bold text-amber-950 mb-1">
                      Pemberitahuan Cuti Dokter
                    </strong>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-normal m-0">
                      {doctor.currentLeave?.end_date
                        ? `${doctor.name} sedang tidak melayani praktik rawat jalan hingga ${new Date(doctor.currentLeave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}${doctor.currentLeave?.reason ? ` (${doctor.currentLeave.reason})` : ''}. Jadwal rutin di bawah ini tetap aktif ditampilkan sebagai referensi jadwal kembali setelah masa cuti selesai.`
                        : `${doctor.name} sedang dalam masa cuti. Jadwal rutin tetap ditampilkan di bawah sebagai referensi bagi pasien.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Card 2: Biografi & Filosofi Pelayanan */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
                  PROFIL &amp; PENDEKATAN MEDIS
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  Tentang {doctor.name}
                </h2>
                
                {/* Doctor Quote Bubble */}
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-100/90 text-slate-700 italic text-sm leading-relaxed mb-6 flex items-start gap-3">
                  <span className="text-2xl text-teal-600 font-serif leading-none shrink-0">&ldquo;</span>
                  <p className="m-0 flex-1">
                    {doctor.bio || 'Mendampingi keluarga memahami kesehatan dengan bahasa yang mudah, memberikan penanganan tepat berdasarkan diagnosis medis terkini dan mengutamakan kenyamanan pasien.'}
                  </p>
                  <span className="text-2xl text-teal-600 font-serif leading-none shrink-0">&rdquo;</span>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {doctor.name} merupakan dokter spesialis {doctor.specialty} yang berpraktik di Naray Hospital Kota Dumai. Beliau memiliki pengalaman klinis komprehensif dalam menangani berbagai kasus medis, didukung fasilitas penunjang rekam medis elektronik terintegrasi dan laboratorium diagnostik 24 jam untuk ketepatan terapi.
                </p>
              </div>

              {/* Card 3: Jadwal Praktik Mingguan Lengkap */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs" id="jadwal-mingguan">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                      JADWAL PELAYANAN
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      Jadwal Praktik Mingguan
                    </h2>
                  </div>

                  <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    Waktu Indonesia Barat (WIB)
                  </span>
                </div>

                {/* Day-by-Day Schedule Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {daysOfWeek.map((dayName, dayIdx) => {
                    const activeSchedules = (doctor.schedules || []).filter(s => (s.status || 'active') === 'active');
                    const targetDayNum = dayIdx + 1; // 1 = Senin ... 7 = Minggu
                    const targetDayLower = dayName.toLowerCase();

                    const matchingDaySchedules = activeSchedules.filter(s => {
                      const sDow = Number(s.day_of_week);
                      if (sDow === targetDayNum || (targetDayNum === 7 && sDow === 0)) return true;
                      const sDay = (s.day || '').toLowerCase();
                      if (sDay.includes(targetDayLower)) return true;
                      if (sDay.includes('senin - sabtu') && dayIdx <= 5) return true;
                      if (sDay.includes('senin - jumat') && dayIdx <= 4) return true;
                      if (sDay.includes('senin - minggu') || sDay.includes('setiap hari')) return true;
                      return false;
                    });

                    const isAvailable = matchingDaySchedules.length > 0;
                    const primarySchedule = matchingDaySchedules[0];
                    const sessionTimes = matchingDaySchedules
                      .map(m => (m.time || '').replace(/\s*WIB/i, '').trim())
                      .filter(Boolean);
                    const uniqueTimes = Array.from(new Set(sessionTimes));
                    const timeFormatted = uniqueTimes.length > 0
                      ? `${uniqueTimes.join(' & ')} WIB`
                      : (primarySchedule?.time || 'Sesuai Jadwal');

                    return (
                      <div
                        key={dayName}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isAvailable
                            ? 'bg-slate-50/70 border-slate-200/80 hover:border-teal-400 hover:bg-white'
                            : 'bg-slate-50/30 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm font-bold text-slate-900">{dayName}</strong>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isAvailable
                              ? (doctor.isOnLeave ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                              : 'bg-slate-200/70 text-slate-500'
                          }`}>
                            {isAvailable ? (doctor.isOnLeave ? 'Cuti' : 'Praktik') : 'Libur'}
                          </span>
                        </div>

                        {isAvailable ? (
                          <div className="flex flex-col gap-1 text-xs text-slate-600 mt-1">
                            <div className="flex items-center gap-1.5 font-bold text-teal-700">
                              <Clock size={13} className="shrink-0" />
                              <span>{timeFormatted}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapPin size={13} className="shrink-0 text-slate-400" />
                              <span className="truncate">{primarySchedule?.room || `Poliklinik ${doctor.specialty}`}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic mt-1">Tidak ada jadwal praktik</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500 mt-5 leading-relaxed font-normal">
                  * Jadwal dokter dapat mengalami perubahan sewaktu-waktu sesuai penugasan tindakan operasi darurat. Pasien disarankan melakukan pendaftaran atau konfirmasi terlebih dahulu melalui WhatsApp Nurse Station.
                </p>
              </div>

              {/* Card 4: Pendidikan & Keahlian Klinis */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
                  KREDENSIAL &amp; KOMPETENSI
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-tight">
                  Pendidikan &amp; Fokus Penanganan
                </h2>

                <div className="flex flex-col gap-6">
                  {/* Riwayat Pendidikan */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <GraduationCap size={16} className="text-teal-600" />
                      <span>Riwayat Pendidikan &amp; Pelatihan Spesialis</span>
                    </h3>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {doctor.education || 'Fakultas Kedokteran Terakreditasi | Program Pendidikan Dokter Spesialis (PPDS) Berkelanjutan'}
                    </div>
                  </div>

                  {/* Fokus Tindakan & Keahlian */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-600" />
                      <span>Fokus Tindakan Klinis &amp; Layanan Medis</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `Konsultasi ${doctor.specialty}`,
                        `Pemeriksaan Diagnostik ${doctor.specialtyGroup || doctor.specialty}`,
                        'Perawatan Rawat Jalan & Rawat Inap',
                        'Pencegahan & Manajemen Penyakit Berkelanjutan',
                        'Tindakan Medis Berstandar Keselamatan Pasien'
                      ].map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Columns: Fast Booking Card & Related Doctors */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
              
              {/* Booking Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-900/5">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                  PENDAFTARAN PASIEN
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                  Daftar Konsultasi Dokter
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal mb-5">
                  Dapatkan nomor antrean digital langsung melalui WhatsApp Nurse Station Naray Hospital tanpa antre manual di loket.
                </p>

                <div className="flex flex-col gap-2.5 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                    <span>Menerima Pasien Umum, BPJS, &amp; Asuransi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                    <span>Rekam Medis Elektronik Terintegrasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                    <span>Konfirmasi Jadwal Otomatis</span>
                  </div>
                </div>

                <a
                  href={getWhatsAppRegistrationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Daftar via WhatsApp Sekarang</span>
                </a>
              </div>

              {/* Related Doctors Card */}
              {relatedDoctors.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                    DOKTER SPESIALIS LAINNYA
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-4">
                    Dokter di Bidang yang Sama
                  </h3>

                  <div className="flex flex-col divide-y divide-slate-100">
                    {relatedDoctors.map(rd => {
                      const rdPhoto = getDoctorPhoto(rd);
                      const rdSlug = rd.slug || toSlug(rd.name) || rd.id;

                      return (
                        <Link
                          key={rd.id}
                          to={`/dokter/${rdSlug}`}
                          className="py-3 flex items-center gap-3 group hover:text-teal-700 transition-colors"
                        >
                          <img
                            src={rdPhoto}
                            alt={rd.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <strong className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 truncate">
                              {rd.name}
                            </strong>
                            <span className="block text-[11px] text-slate-500 truncate">
                              {rd.specialty}
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-600 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Help & Emergency Callout */}
              <div className="p-5 rounded-3xl bg-[#042622] text-white flex flex-col gap-3">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                  <PhoneCall size={14} />
                  <span>Siaga Darurat 24 Jam</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Butuh penanganan gawat darurat segera? IGD Naray Hospital Dumai siaga 24 jam dengan tim dokter jaga dan ambulans.
                </p>
                <a
                  href={`https://wa.me/6285363395383?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan darurat.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all text-center cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp UGD: {hospitalInfo.emergencyHotline || '+62 853-6339-5383'}</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </PageLayout>
  );
}
