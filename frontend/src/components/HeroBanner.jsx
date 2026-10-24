import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Award,
  Building2,
  Clock,
  ShieldCheck,
  Stethoscope,
  PhoneCall
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function HeroBanner({ onScrollToSection, onOpenEmergency }) {
  const navigate = useNavigate();
  const { bannerSlides, formatImageUrl, hospitalInfo = {} } = useHospitalData();

  const rawSlides = Array.isArray(bannerSlides) && bannerSlides.length > 0 ? bannerSlides : [
    {
      id: 'slide-1',
      badge: "Akreditasi Paripurna KARS",
      badgeType: "primary",
      title: "Pelayanan Medis Spesialis dan Rawat Inap Terpadu di Dumai",
      highlight: "Didukung 19 Dokter Spesialis dan Fasilitas Diagnostik Lengkap",
      description: "Naray Hospital melayani masyarakat Kota Dumai dengan 13 poliklinik spesialis, instalasi gawat darurat 24 jam, serta ruang perawatan berstandar keselamatan pasien Kemenkes RI.",
      ctaPrimary: "Lihat Jadwal Dokter",
      ctaSecondary: "Pilihan Kamar Rawat Inap",
      targetSection: "rawat-inap",
      image: "/images/default-image.svg"
    },
    {
      id: 'slide-2',
      badge: "Instalasi Gawat Darurat 24 Jam",
      badgeType: "emergency",
      title: "Siaga Tanggap Darurat Medis dan Ambulans 24 Jam",
      highlight: "Dokter Jaga Bersertifikasi Trauma dan Ruang Resusitasi",
      description: "Penanganan gawat darurat didukung ruang resusitasi, fasilitas perawatan intensif ICU, serta armada ambulans siaga di kawasan Dumai Barat untuk pertolongan medis segera.",
      ctaPrimary: "Hubungi UGD 24 Jam",
      ctaSecondary: "Pilihan Kamar Rawat Inap",
      targetSection: "rawat-inap",
      isEmergencyPrimary: true,
      image: "/images/default-image.svg"
    },
    {
      id: 'slide-3',
      badge: "19 Dokter Spesialis Tetap",
      badgeType: "primary",
      title: "Pemeriksaan Dokter Spesialis Lengkap untuk Keluarga",
      highlight: "Jadwal Praktik Mingguan dan Rekam Medis Terintegrasi",
      description: "Layanan konsultasi spesialis jantung, anak, kebidanan dan kandungan, penyakit dalam, paru, hingga bedah dengan sistem antrean teratur dan fasilitas laboratorium 24 jam.",
      ctaPrimary: "Cari Jadwal Praktik",
      ctaSecondary: "Pusat Layanan Medis",
      targetSection: "dokter",
      image: "/images/default-image.svg"
    }
  ];

  const slides = rawSlides.map(s => {
    let icon = ShieldCheck;
    if (s.badgeType === 'emergency') {
      icon = Clock;
    } else if (s.badge?.toLowerCase().includes('dokter') || s.badge?.toLowerCase().includes('spesialis')) {
      icon = Stethoscope;
    } else if (s.badge?.toLowerCase().includes('akreditasi')) {
      icon = ShieldCheck;
    }

    const formattedUrl = formatImageUrl
      ? formatImageUrl(s.image || s.image_url, '/images/default-image.svg')
      : (s.image || '/images/default-image.svg');

    return {
      ...s,
      badgeIcon: icon,
      imageUrl: formattedUrl,
      isEmergency: s.isEmergencyPrimary || s.badgeType === 'emergency' || String(s.ctaPrimary || '').toLowerCase().includes('ugd')
    };
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlideData = slides[currentSlide];

  return (
    <section
      id="hero"
      className="relative min-h-[580px] lg:min-h-[640px] bg-[#042622] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Hero Banner Informasi Rumah Sakit"
    >
      {/* Background Slides with accessibility & clean gradient overlay */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const BadgeIcon = slide.badgeIcon;
        return (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out flex items-center pt-14 pb-24 sm:pb-32 lg:pt-20 lg:pb-36 ${isActive ? 'opacity-100 scale-100 pointer-events-auto z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            aria-hidden={!isActive}
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(4, 38, 34, 0.96) 0%, rgba(4, 38, 34, 0.86) 50%, rgba(4, 38, 34, 0.45) 100%), url(${slide.imageUrl || slide.image || '/images/banners/TLM6XG9mB9hKhSQxLklmbGPrWXoDCLXMwJLdP03Q.webp'})`
            }}
          >
            <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl text-white">
                {/* Clinical Trust Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-5 ${slide.badgeType === 'emergency'
                  ? 'bg-red-500/20 border border-red-400/40 text-red-300'
                  : 'bg-teal-500/20 border border-teal-400/40 text-teal-300'
                  }`}>
                  <BadgeIcon size={15} className="shrink-0" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Hero Headline */}
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold !text-white leading-[1.15] tracking-tight mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {slide.title}
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold !text-teal-300 mt-2 font-body tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {slide.highlight}
                  </span>
                </h1>

                {/* Editorial Medical Description */}
                <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal max-w-2xl mb-8">
                  {slide.description}
                </p>

                {/* Call-to-Action Group */}
                <div className="flex flex-wrap items-center gap-3.5">
                  {slide.isEmergency ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 hover:-translate-y-0.5 transition-all cursor-pointer"
                      onClick={onOpenEmergency || (() => window.open(`tel:${hospitalInfo.emergencyHotline}`))}
                    >
                      <PhoneCall size={18} className="animate-bounce" />
                      <span>{slide.ctaPrimary}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-900/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                      onClick={() => navigate('/dokter-jadwal')}
                    >
                      <Calendar size={18} />
                      <span>{slide.ctaPrimary}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/40 hover:border-white hover:bg-white/10 active:bg-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-xs transition-all cursor-pointer"
                    onClick={() => onScrollToSection(slide.targetSection)}
                  >
                    <span>{slide.ctaSecondary}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Hero Controls: Accessible arrows & indicator dots (Aligned with grid container) */}
      <div className="absolute inset-x-0 bottom-24 sm:bottom-28 z-20 pointer-events-none">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <div className="pointer-events-auto flex items-center gap-3" aria-label="Navigasi Banner">
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-slate-900/60 hover:bg-teal-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1.5" role="tablist">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentSlide}
                  aria-label={`Buka slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-teal-400' : 'w-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-slate-900/60 hover:bg-teal-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
              onClick={nextSlide}
              aria-label="Slide berikutnya"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
