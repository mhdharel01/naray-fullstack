import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  ShieldAlert,
  MessageCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function Navbar({ onSearchDoctorClick, onOpenEmergency }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'about' | 'patient' | 'media' | null

  const navContainerRef = useRef(null);
  const timeoutRef = useRef(null);

  const { isAdmin, hospitalInfo = {} } = useHospitalData();
  const location = useLocation();
  const navigate = useNavigate();

  const waNumber = (hospitalInfo.whatsappHotline || hospitalInfo.phone || '+62 811-7529-798').replace(/[^0-9]/g, '');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 25);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown and drawer on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown or mobile drawer on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open to prevent background page scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const handleOpenDropdown = (menuKey) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menuKey);
  };

  const handleCloseDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handleToggleDropdown = (menuKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown((prev) => (prev === menuKey ? null : menuKey));
  };

  // ── 1. Tentang Rumah Sakit (Urutan Pertama) ──
  const aboutNavItems = [
    {
      label: 'Profil Rumah Sakit',
      desc: 'Visi, misi, manajemen & mutu KARS',
      to: '/profil',
    },
    {
      label: 'Kontak & Lokasi',
      desc: 'Alamat, peta rujukan & nomor telepon',
      to: '/kontak',
    },
  ];

  // ── 2. Layanan Pasien & Medis (Urutan Kedua) ──
  const patientNavItems = [
    {
      label: 'Jadwal Dokter Spesialis',
      desc: 'Jadwal praktik poliklinik & cari dokter',
      to: '/dokter-jadwal',
    },
    {
      label: 'Kamar Rawat Inap & Bed',
      desc: 'Ketersediaan ranjang & fasilitas kamar',
      to: '/kamar-rawat-inap',
    },
    {
      label: 'Jadwal Tindakan Operasi',
      desc: 'Transparansi kamar bedah sentral (IBS)',
      to: '/jadwal-operasi',
    },
    {
      label: 'Layanan Medis & Fasilitas',
      desc: 'IGD 24 Jam, Centers of Excellence & Poli',
      to: '/layanan-medis',
    },
    {
      label: 'Paket Medical Check Up',
      desc: 'Paket skrining & pemeriksaan kesehatan',
      to: '/paket-mcu',
    },
  ];

  // ── 3. Berita & Edukasi Kesehatan (Urutan Ketiga) ──
  const mediaNavItems = [
    {
      label: 'Artikel & Edukasi Sehat',
      desc: 'Tips & panduan medis dokter spesialis',
      to: '/berita-artikel',
    },
    {
      label: 'Galeri & Video Kegiatan',
      desc: 'Dokumentasi bakti sosial & fasilitas RS',
      to: '/galeri-video',
    },
  ];

  // Active status helpers
  const isHomeActive = location.pathname === '/' || location.pathname === '';
  const isAboutActive = ['/profil', '/tentang-kami', '/kontak', '/hubungi-kami'].some(p => location.pathname.startsWith(p));
  const isPatientActive = ['/dokter-jadwal', '/dokter', '/kamar-rawat-inap', '/kamar', '/jadwal-operasi', '/operasi', '/layanan-medis', '/paket-mcu'].some(p => location.pathname.startsWith(p));
  const isMediaActive = ['/berita-artikel', '/artikel', '/berita', '/galeri-video'].some(p => location.pathname.startsWith(p));

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-200/80 py-2.5' 
          : 'bg-white border-b border-slate-100 py-3 sm:py-3.5'
      }`}
    >
      <div className="relative z-50 max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Brand Logo & Tagline */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl p-1 shrink-0"
          aria-label="Kembali ke Beranda Naray Hospital"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
            <img 
              src="/images/logo/logo.jpeg" 
              alt="Logo Naray Hospital Dumai" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl sm:text-2xl leading-none tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              NARAY
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-teal-600 uppercase font-mono mt-0.5">
              HOSPITAL DUMAI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Urutan: Beranda -> Tentang RS -> Layanan Pasien -> Berita & Edukasi) */}
        <nav 
          ref={navContainerRef}
          className="hidden lg:flex items-center gap-1.5" 
          aria-label="Navigasi Utama"
        >
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {/* 1. Beranda */}
            <li>
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isHomeActive
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                Beranda
              </Link>
            </li>

            {/* 2. Dropdown: Tentang RS */}
            <li
              className="relative"
              onMouseEnter={() => handleOpenDropdown('about')}
              onMouseLeave={handleCloseDropdown}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeDropdown === 'about' || isAboutActive
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
                onClick={(e) => handleToggleDropdown('about', e)}
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'about'}
              >
                <span>Tentang RS</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 text-slate-400 ${
                    activeDropdown === 'about' ? 'rotate-180 text-teal-600' : ''
                  }`} 
                />
              </button>

              {activeDropdown === 'about' && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                  onMouseEnter={() => handleOpenDropdown('about')}
                  onMouseLeave={handleCloseDropdown}
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                      Institusi Naray Hospital
                    </span>
                  </div>

                  {aboutNavItems.map((sub, sIdx) => {
                    const isSubActive = location.pathname.startsWith(sub.to);
                    return (
                      <Link
                        key={sIdx}
                        to={sub.to}
                        className={`block px-3 py-2 rounded-xl transition-all duration-150 ${
                          isSubActive 
                            ? 'bg-teal-50 text-teal-900 font-semibold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="block text-xs sm:text-sm font-bold leading-snug">
                          {sub.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          {sub.desc}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* 3. Dropdown: Layanan Pasien */}
            <li
              className="relative"
              onMouseEnter={() => handleOpenDropdown('patient')}
              onMouseLeave={handleCloseDropdown}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeDropdown === 'patient' || isPatientActive
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
                onClick={(e) => handleToggleDropdown('patient', e)}
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'patient'}
              >
                <span>Layanan Pasien</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 text-slate-400 ${
                    activeDropdown === 'patient' ? 'rotate-180 text-teal-600' : ''
                  }`} 
                />
              </button>

              {activeDropdown === 'patient' && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                  onMouseEnter={() => handleOpenDropdown('patient')}
                  onMouseLeave={handleCloseDropdown}
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                      Pelayanan Medis &amp; Pasien
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">5 Layanan</span>
                  </div>

                  {patientNavItems.map((sub, sIdx) => {
                    const isSubActive = location.pathname.startsWith(sub.to);
                    return (
                      <Link
                        key={sIdx}
                        to={sub.to}
                        className={`block px-3 py-2 rounded-xl transition-all duration-150 ${
                          isSubActive 
                            ? 'bg-teal-50 text-teal-900 font-semibold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="block text-xs sm:text-sm font-bold leading-snug">
                          {sub.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          {sub.desc}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* 4. Dropdown: Berita & Edukasi */}
            <li
              className="relative"
              onMouseEnter={() => handleOpenDropdown('media')}
              onMouseLeave={handleCloseDropdown}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeDropdown === 'media' || isMediaActive
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
                onClick={(e) => handleToggleDropdown('media', e)}
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'media'}
              >
                <span>Berita &amp; Edukasi</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 text-slate-400 ${
                    activeDropdown === 'media' ? 'rotate-180 text-teal-600' : ''
                  }`} 
                />
              </button>

              {activeDropdown === 'media' && (
                <div
                  className="absolute top-full left-0 mt-2 w-76 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                  onMouseEnter={() => handleOpenDropdown('media')}
                  onMouseLeave={handleCloseDropdown}
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                      Konten &amp; Edukasi Sehat
                    </span>
                  </div>

                  {mediaNavItems.map((sub, sIdx) => {
                    const isSubActive = location.pathname.startsWith(sub.to);
                    return (
                      <Link
                        key={sIdx}
                        to={sub.to}
                        className={`block px-3 py-2 rounded-xl transition-all duration-150 ${
                          isSubActive 
                            ? 'bg-teal-50 text-teal-900 font-semibold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="block text-xs sm:text-sm font-bold leading-snug">
                          {sub.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          {sub.desc}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          </ul>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isAdmin && (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[11px] sm:text-xs font-bold font-mono" 
              title="Mode Admin Aktif"
            >
              <ShieldAlert size={13} /> 
              <span>Admin</span>
            </span>
          )}

          {/* Quick Doctor Search Button */}
          <button
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50/50 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
            onClick={() => navigate('/dokter-jadwal')}
            title="Cari Dokter Spesialis &amp; Jadwal Praktik"
          >
            <Search size={15} className="text-teal-600" />
            <span>Cari Dokter</span>
          </button>

          {/* Primary WhatsApp / Hotline CTA */}
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Naray Hospital Dumai, saya ingin menanyakan informasi dan pendaftaran layanan.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-teal-700/20 hover:shadow-md hover:shadow-teal-700/30 transition-all cursor-pointer shrink-0"
            title="Hubungi Customer Care WhatsApp Naray Hospital"
          >
            <MessageCircle size={15} className="shrink-0" />
            <span className="hidden xs:inline">Hubungi Kami</span>
            <span className="xs:hidden">Kontak</span>
          </a>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? <X size={22} className="text-slate-900" /> : <Menu size={22} className="text-slate-700" />}
          </button>
        </div>

      </div>

      {/* ── Mobile Menu Backdrop (Portaled to body to ensure true full-viewport overlay) ── */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />,
        document.body
      )}

      {/* ── Mobile Menu Drawer (Urutan: Beranda -> Tentang RS -> Layanan Pasien -> Berita & Edukasi) ── */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-slate-200 shadow-2xl px-5 py-6 z-50 max-h-[calc(100vh-72px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          {/* Beranda Link */}
          <div className="mb-2">
            <Link
              to="/"
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isHomeActive 
                  ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
          </div>

          {/* Seksi 1: Tentang Rumah Sakit (Urutan Pertama) */}
          <div className="my-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono block mb-2 px-1">
              Tentang Rumah Sakit
            </span>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {aboutNavItems.map((item, idx) => {
                const isItemActive = location.pathname.startsWith(item.to);
                return (
                  <li key={`about-${idx}`}>
                    <Link
                      to={item.to}
                      className={`block px-3.5 py-2 rounded-xl text-sm transition-colors ${
                        isItemActive 
                          ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-semibold block leading-snug">{item.label}</span>
                      <span className="text-[11px] text-slate-400 font-normal block mt-0.5">{item.desc}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Seksi 2: Layanan Pasien & Medis (Urutan Kedua) */}
          <div className="my-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono block mb-2 px-1">
              Layanan Pasien &amp; Medis
            </span>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {patientNavItems.map((item, idx) => {
                const isItemActive = location.pathname.startsWith(item.to);
                return (
                  <li key={`patient-${idx}`}>
                    <Link
                      to={item.to}
                      className={`block px-3.5 py-2 rounded-xl text-sm transition-colors ${
                        isItemActive 
                          ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-semibold block leading-snug">{item.label}</span>
                      <span className="text-[11px] text-slate-400 font-normal block mt-0.5">{item.desc}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Seksi 3: Berita & Edukasi Sehat (Urutan Ketiga) */}
          <div className="my-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono block mb-2 px-1">
              Berita &amp; Edukasi Sehat
            </span>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {mediaNavItems.map((item, idx) => {
                const isItemActive = location.pathname.startsWith(item.to);
                return (
                  <li key={`media-${idx}`}>
                    <Link
                      to={item.to}
                      className={`block px-3.5 py-2 rounded-xl text-sm transition-colors ${
                        isItemActive 
                          ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-semibold block leading-snug">{item.label}</span>
                      <span className="text-[11px] text-slate-400 font-normal block mt-0.5">{item.desc}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Action CTAs in Mobile Drawer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Naray Hospital Dumai, saya ingin menanyakan informasi layanan.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageCircle size={18} />
              <span>Hubungi Kami via WhatsApp</span>
            </a>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm cursor-pointer"
              onClick={() => { 
                setMobileMenuOpen(false); 
                if (onOpenEmergency) onOpenEmergency(); 
              }}
            >
              <PhoneCall size={18} />
              <span>Panggilan Darurat UGD 24 Jam</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
