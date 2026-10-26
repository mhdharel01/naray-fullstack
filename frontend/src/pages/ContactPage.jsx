import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  MessageCircle, 
  Ambulance, 
  ChevronRight, 
  Home, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  ExternalLink,
  ShieldCheck,
  Building2,
  CalendarCheck2,
  Users,
  HeartPulse
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { hospitalInfo } from '../data/hospitalData';

export default function ContactPage() {
  const { hospitalInfo: contextInfo = {} } = useHospitalData();
  const info = { ...hospitalInfo, ...contextInfo };

  const rawPhone = (info?.whatsappHotline || info?.phone || '+62 811-7529-798').replace(/[^0-9]/g, '');
  const rawEmergency = (info?.emergencyHotline || '+62 853-6339-5383').replace(/[^0-9+]/g, '');
  const rawMcu = (info?.mcuHotline || '+62 853-6362-4796').replace(/[^0-9]/g, '');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'umum',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // null | 'submitting' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      // Redirect to WhatsApp with formatted message
      const textMsg = `Halo Naray Hospital Kota Dumai,%0A%0ASaya ingin menyampaikan pesan / pertanyaan:%0A*Nama:* ${encodeURIComponent(formData.name)}%0A*No. Kontak:* ${encodeURIComponent(formData.phone)}%0A*Kategori:* ${encodeURIComponent(formData.category)}%0A*Pesan:*%0A${encodeURIComponent(formData.message)}`;
      window.open(`https://wa.me/${rawPhone}?text=${textMsg}`, '_blank');
    }, 600);
  };

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
              <span className="text-slate-900 font-semibold">Pusat Bantuan &amp; Kontak</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Call Center 24 Jam Siaga Melayani
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              PUSAT INFORMASI &amp; LAYANAN DARURAT
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Hubungi Naray Hospital Kota Dumai
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Kami siap melayani kebutuhan informasi pendaftaran berobat, kepastian ketersediaan kamar, pemeriksaan berkala (MCU), dan penanganan gawat darurat 24 jam di Kota Dumai, Riau.
            </p>
          </div>
        </div>

        {/* ── 3. Four Core Emergency & Fast-Action Cards ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: UGD 24 Jam */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Ambulance size={24} className="animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-red-200 uppercase tracking-wider block font-mono">
                  DARURAT &amp; AMBULANS 24 JAM
                </span>
                <h3 className="font-heading text-xl font-bold leading-tight mb-1 text-white">
                  Instalasi Gawat Darurat
                </h3>
                <p className="text-xs text-red-100 leading-relaxed mb-4">
                  Penanganan medis darurat, kecelakaan kerja, dan panggilan ambulans cepat.
                </p>
              </div>

              <a 
                href={`https://wa.me/${rawEmergency.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp UGD: {info.emergencyHotline}</span>
              </a>
            </div>

            {/* Card 2: WhatsApp Admisi & Rawat Inap */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <MessageCircle size={24} />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block font-mono">
                  WHATSAPP ADMISI RESMI
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 leading-tight mb-1">
                  Pendaftaran &amp; Kamar
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Cek jadwal praktik dokter spesialis dan ketersediaan ranjang rawat inap.
                </p>
              </div>

              <a 
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent('Halo Admisi Naray Hospital Dumai, saya ingin menanyakan jadwal dokter atau ketersediaan kamar.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <MessageCircle size={16} />
                <span>Chat WhatsApp</span>
              </a>
            </div>

            {/* Card 3: Call Center & Informasi Umum */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block font-mono">
                  CALL CENTER KOTA DUMAI
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 leading-tight mb-1">
                  Informasi Umum
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Layanan pelanggan, informasi asuransi mitra BPJS, dan panduan rujukan.
                </p>
              </div>

              <a 
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent('Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi umum.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp: {info.phone}</span>
              </a>
            </div>

            {/* Card 4: Paket MCU & Pemeriksaan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
                  <HeartPulse size={24} />
                </div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block font-mono">
                  MEDICAL CHECK UP (MCU)
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 leading-tight mb-1">
                  Skrining Kesehatan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Pemeriksaan kesehatan perorangan, sertifikat sehat pelaut/maritim, dan korporasi.
                </p>
              </div>

              <a 
                href={`https://wa.me/${rawMcu}?text=${encodeURIComponent('Halo Naray Wellness MCU, saya ingin konsultasi paket medical check up.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <MessageCircle size={16} />
                <span>Reservasi MCU</span>
              </a>
            </div>

          </div>
        </div>

        {/* ── 4. Main Body: Form Pengaduan / Pesan & Lokasi Peta ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Column: Form Pesan & Aspirasi Pasien */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                  LAYANAN ASPIRASI &amp; PERTANYAAN
                </span>
                <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  Kirim Pesan ke Tim Naray Care
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Punya pertanyaan seputar layanan medis, tarif rawat inap, atau ingin menyampaikan saran pelayanan? Tim kami siap menanggapi secara profesional.
                </p>

                {formStatus === 'success' ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-heading text-base font-bold text-emerald-900 mb-1">Pesan Berhasil Disiapkan</h3>
                    <p className="text-xs text-emerald-700 mb-4">
                      Kami telah membuka saluran WhatsApp untuk menghubungkan Anda langsung dengan staf layanan pelanggan kami.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormStatus(null)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Kirim Pesan Lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                        NAMA LENGKAP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                        NOMOR WHATSAPP / TELEPON <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 0812-3456-7890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                        KATEGORI KEBUTUHAN
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="Jadwal Dokter & Pendaftaran">Informasi Jadwal Dokter &amp; Rawat Jalan</option>
                        <option value="Kamar Rawat Inap & Tarif">Ketersediaan Kamar Rawat Inap</option>
                        <option value="Paket MCU">Pemeriksaan Medical Check Up</option>
                        <option value="Asuransi & BPJS">Klaim Asuransi &amp; BPJS Kesehatan</option>
                        <option value="Saran & Keluhan Pelayanan">Saran &amp; Keluhan Pasien</option>
                        <option value="Lainnya">Pertanyaan Umum Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                        ISI PESAN <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tuliskan pertanyaan atau informasi yang ingin Anda tanyakan..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-75"
                    >
                      <Send size={16} />
                      <span>{formStatus === 'submitting' ? 'Menghubungkan...' : 'Kirim Pesan ke Layanan Pelanggan'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Google Maps & Alamat Rumah Sakit */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Map Container */}
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <MapPin size={18} className="text-teal-600" />
                    <span>Lokasi Naray Hospital Dumai</span>
                  </div>
                  <a 
                    href="https://maps.google.com/?q=Naray+Hospital+Dumai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    <span>Buka Peta Besar</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="relative aspect-16/10 bg-slate-100">
                  <iframe
                    title="Peta Lokasi Naray Hospital Kota Dumai"
                    src={info.gmapsIframe || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.0645585284587!2d101.39689867423775!3d1.6988783603561073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d3a978dfcdb1fb%3A0xeffaf38f1dce7e9c!2sNaray%20Hospital!5e0!3m2!1sen!2sid!4v1749523003379!5m2!1sen!2sid"}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="p-5 bg-slate-50 border-t border-slate-100">
                  <strong className="block text-xs font-bold text-slate-900 mb-1 font-mono uppercase">
                    ALAMAT RESMI GEDUNG UTAMA:
                  </strong>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal m-0">
                    {info.address || "Jl. Dr. Wahidin No.98-99, Purnama, Kec. Dumai Barat, Kota Dumai, Riau 28823"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} className="text-teal-600" />
                    <span>Email Resmi: <strong>{info.email || "kawannaray@narayhospital.com"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Jam Pelayanan Unit-Unit Medis */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
                  JAM OPERASIONAL PELAYANAN
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-4">
                  Waktu Kunjungan &amp; Operasional Unit
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Instalasi Gawat Darurat (IGD)</span>
                    <span className="font-bold text-red-600 font-mono">24 Jam Non-stop</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Poliklinik Rawat Jalan</span>
                    <span className="font-bold text-slate-900 font-mono">Senin – Sabtu (08.00 – 21.00 WIB)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Farmasi &amp; Laboratorium</span>
                    <span className="font-bold text-teal-700 font-mono">24 Jam Terbuka</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Jam Besuk Siang</span>
                    <span className="font-semibold text-slate-600 font-mono">11.00 – 13.00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-slate-700">Jam Besuk Sore / Malam</span>
                    <span className="font-semibold text-slate-600 font-mono">17.00 – 19.30 WIB</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </PageLayout>
  );
}
