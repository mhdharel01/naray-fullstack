import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Film,
  MessageCircle,
  Stethoscope,
  BedDouble,
  Building2,
  BookOpen,
  MapPin,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function Navbar({ onSearchDoctorClick, onOpenEmergency }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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
    setInfoDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown or mobile drawer on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setInfoDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setInfoDropdownOpen(false);
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

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setInfoDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setInfoDropdownOpen(false);
    }, 220);
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setInfoDropdownOpen((prev) => !prev);
  };

  // ── Primary Navigation Items (Revamped Grammar & Positioning) ──
  const primaryNavItems = [
    { label: 'Beranda', to: '/' },
    { label: 'Layanan Medis', to: '/layanan-medis' },
    { label: 'Jadwal Dokter', to: '/dokter-jadwal' },
    { label: 'Rawat Inap', to: '/kamar-rawat-inap' },
    { label: 'Paket MCU', to: '/paket-mcu' },
  ];

  // ── Dropdown: Informasi & Edukasi Publik ──
  const infoDropdownItems = [
    {
      label: 'Artikel & Edukasi Sehat',
      desc: 'Panduan medis dokter spesialis',
      to: '/berita-artikel',
      icon: FileText
    },
    {
      label: 'Galeri & Video Kegiatan',
      desc: 'Dokumentasi fasilitas & bakti sosial',
      to: '/galeri-video',
      icon: Film
    },
    {
      label: 'Profil Rumah Sakit',
      desc: 'Visi, misi, manajemen & mutu KARS',
      to: '/profil',
      icon: Building2
    },
    {
      label: 'Kontak & Lokasi',
      desc: 'Alamat, peta rujukan & nomor telepon',
      to: '/kontak',
      icon: MapPin
    }
  ];

  const isDropdownActive = ['/berita-artikel', '/galeri-video', '/profil', '/kontak'].some(p => location.pathname.startsWith(p));

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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi Utama">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {primaryNavItems.map((item, idx) => {
              const isActive = item.to === '/' 
                ? location.pathname === '/' || location.pathname === ''
                : location.pathname.startsWith(item.to);

              return (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {/* Dropdown "Informasi & Publikasi" */}
            <li
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  infoDropdownOpen || isDropdownActive
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/70 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
                onClick={handleDropdownToggle}
                aria-haspopup="true"
                aria-expanded={infoDropdownOpen}
              >
                <span>Informasi</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 text-slate-400 ${
                    infoDropdownOpen ? 'rotate-180 text-teal-600' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Panel Menu */}
              {infoDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Publikasi &amp; Tentang RS
                    </span>
                  </div>

                  {infoDropdownItems.map((sub, sIdx) => {
                    const IconComp = sub.icon;
                    const isSubActive = location.pathname.startsWith(sub.to);
                    return (
                      <Link
                        key={sIdx}
                        to={sub.to}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 ${
                          isSubActive 
                            ? 'bg-teal-50 text-teal-900 font-semibold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                        onClick={() => setInfoDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <IconComp size={17} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold leading-snug">{sub.label}</span>
                          <span className="text-[11px] text-slate-500 font-normal leading-normal">{sub.desc}</span>
                        </div>
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

      {/* ── Mobile Menu Drawer (Positioned absolute relative to sticky header) ── */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-slate-200 shadow-2xl px-5 py-6 z-50 max-h-[calc(100vh-72px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          
          <div className="mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2 px-1">
              Layanan Utama Rumah Sakit
            </span>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {primaryNavItems.map((item, idx) => {
                const isActive = item.to === '/' 
                  ? location.pathname === '/' || location.pathname === ''
                  : location.pathname.startsWith(item.to);

                return (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive 
                          ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="my-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2 px-1">
              Informasi &amp; Edukasi
            </span>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {infoDropdownItems.map((sub, idx) => {
                const IconComp = sub.icon;
                const isSubActive = location.pathname.startsWith(sub.to);
                return (
                  <li key={`sub-${idx}`}>
                    <Link
                      to={sub.to}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isSubActive 
                          ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconComp size={16} className="text-teal-600 shrink-0" />
                      <span>{sub.label}</span>
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
