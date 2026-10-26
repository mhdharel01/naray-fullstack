import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  MessageCircle,
  Copy,
  Stethoscope,
  PhoneCall,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { healthArticles = [], doctors = [], hospitalInfo = {} } = useHospitalData();
  const [copied, setCopied] = useState(false);

  // Helper to generate a clean URL slug from title
  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Find article by slug, id, or dbId
  const article = healthArticles.find(a => 
    String(a.slug || a.id) === slug || 
    String(a.id) === slug || 
    String(a.dbId) === slug ||
    toSlug(a.title) === slug
  );

  // Match author with doctor profile if available
  const matchedDoctor = doctors.find(doc => {
    if (!article?.author) return false;
    const cleanAuthor = article.author.toLowerCase().replace(/dr\.?\s*/i, '').trim();
    const cleanDoc = doc.name.toLowerCase().replace(/dr\.?\s*/i, '').trim();
    return cleanAuthor.includes(cleanDoc) || cleanDoc.includes(cleanAuthor);
  });

  // Dynamic SEO & Open Graph (OG) Meta Tags
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Naray Hospital Dumai`;

      const setMeta = (nameOrProperty, content) => {
        let el = document.querySelector(`meta[property="${nameOrProperty}"]`) || document.querySelector(`meta[name="${nameOrProperty}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(nameOrProperty.startsWith('og:') ? 'property' : 'name', nameOrProperty);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content || '');
      };

      const desc = article.summary || article.snippet || 'Informasi kesehatan terpercaya dari dokter spesialis Naray Hospital Kota Dumai.';
      const img = article.image || `${window.location.origin}/images/discovery/diagnostic-center.jpg`;
      const url = window.location.href;

      setMeta('description', desc);
      setMeta('og:title', article.title);
      setMeta('og:description', desc);
      setMeta('og:image', img);
      setMeta('og:url', url);
      setMeta('og:type', 'article');
      setMeta('og:site_name', 'Naray Hospital Dumai');
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', article.title);
      setMeta('twitter:description', desc);
      setMeta('twitter:image', img);

      // JSON-LD Structured Data for Google Search Engine
      let script = document.getElementById('naray-article-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'naray-article-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "headline": article.title,
        "image": [img],
        "datePublished": article.date,
        "author": {
          "@type": "Person",
          "name": article.author || "Tim Medis Naray Hospital"
        },
        "publisher": {
          "@type": "Hospital",
          "name": "Naray Hospital Dumai",
          "url": window.location.origin,
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/images/logo/logo.jpeg`
          }
        },
        "description": desc
      });
    }

    return () => {
      document.title = 'Naray Hospital - Rumah Sakit Terpadu Kota Dumai';
      const script = document.getElementById('naray-article-schema');
      if (script) script.remove();
    };
  }, [article]);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Gagal menyalin link:', e);
    }
  };

  // Related articles (pick 3 other published articles)
  const relatedArticles = healthArticles
    .filter(a => a.id !== article?.id && a.dbId !== article?.dbId && (a.status || 'published').toLowerCase() === 'published')
    .slice(0, 3);

  // If article not found
  if (!article) {
    return (
      <PageLayout>
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Artikel Tidak Ditemukan
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed text-sm">
            Halaman artikel yang Anda tuju mungkin telah dipindahkan atau tautan yang Anda gunakan tidak valid. Silakan kembali ke pusat edukasi berita &amp; artikel.
          </p>
          <Link
            to="/berita-artikel"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pusat Berita &amp; Artikel</span>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const shareText = encodeURIComponent(`${article.title} - Naray Hospital Dumai`);
  const shareUrl = encodeURIComponent(window.location.href);
  const catName = typeof article.category === 'object' ? (article.category?.name || 'Kesehatan') : (article.category || 'Edukasi Kesehatan');

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        
        {/* ── 1. Top Breadcrumb & Back Bar (Matching DoctorDetailPage) ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <Link to="/berita-artikel" className="hover:text-teal-600">
                <span>Berita &amp; Artikel</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
                {article.title}
              </span>
            </nav>

            <Link
              to="/berita-artikel"
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Semua Artikel</span>
            </Link>
          </div>
        </div>

        {/* ── 2. Hero Editorial Banner (Matching DoctorDetailPage Deep Teal Palette) ── */}
        <header className="bg-linear-to-r from-[#03201d] via-[#042622] to-[#084d45] text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#00a896_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl">
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
                  {catName}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal-400" />
                  <span>Ditinjau Tim Medis Naray Hospital</span>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-5">
                {article.title}
              </h1>

              {/* Author & Publishing Meta Bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-teal-100/90 pt-2 border-t border-teal-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-600/60 border border-teal-400/40 text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                    <User size={14} />
                  </div>
                  <span>
                    Penulis: <strong className="text-white font-semibold">{article.author || 'Tim Medis Naray Hospital'}</strong>
                  </span>
                </div>

                <span className="w-1 h-1 rounded-full bg-teal-400/60 hidden sm:inline-block" />

                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-300 shrink-0" />
                  <span>{article.date}</span>
                </div>

                <span className="w-1 h-1 rounded-full bg-teal-400/60 hidden sm:inline-block" />

                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-teal-300 shrink-0" />
                  <span>{article.readTime || '4 Menit Baca'}</span>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* ── 3. Main Body Container (2-Column Magazine Layout) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ── Left Column: Article Content (8 Cols) ── */}
            <article className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Featured Cover Image */}
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 border border-slate-200/90 bg-slate-100 relative max-h-[480px]">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover max-h-[480px]"
                />
              </div>

              {/* Lead Summary Highlight Box */}
              {article.summary && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 border-l-4 border-l-teal-600 shadow-xs">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1 font-mono">
                    RINGKASAN ARTIKEL
                  </span>
                  <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed italic m-0">
                    &ldquo;{article.summary}&rdquo;
                  </p>
                </div>
              )}

              {/* Main Editorial Content Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
                
                {/* Content Body Text */}
                <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-5 font-normal whitespace-pre-line">
                  {article.content || (
                    <p>
                      Informasi kesehatan yang disajikan disusun secara teliti oleh tim medis Naray Hospital untuk membantu masyarakat Kota Dumai memahami langkah pencegahan dan penanganan dini terhadap berbagai kondisi kesehatan.
                    </p>
                  )}
                </div>

                {/* Clinical Medical Disclaimer Box */}
                <div className="mt-10 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 shadow-2xs">
                  <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-950 mb-1">Catatan Medis Penting</strong>
                    <span className="text-amber-900 leading-relaxed">
                      Artikel ini bertujuan untuk edukasi informasi kesehatan umum dan tidak menggantikan konsultasi langsung dengan dokter spesialis. Jika Anda atau keluarga mengalami keluhan medis serius, segera kunjungi Instalasi Gawat Darurat (UGD) Naray Hospital atau buat janji temu dengan dokter spesialis terkait.
                    </span>
                  </div>
                </div>

                {/* Social Share Action Bar */}
                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Share2 size={15} className="text-teal-600" />
                    <span>Bagikan Artikel Ini:</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* WhatsApp Share */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      aria-label="Bagikan ke WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>

                    {/* Facebook Share */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                      aria-label="Bagikan ke Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    {/* Twitter / X Share */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 hover:bg-black text-white shadow-xs transition-all cursor-pointer"
                      aria-label="Bagikan ke X/Twitter"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        copied 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Matched Doctor Bio Card (If article is written by an active doctor) */}
              {matchedDoctor && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shrink-0 bg-slate-50">
                    <img 
                      src={matchedDoctor.photo || '/images/doctors/doctor-male-default.jpg'} 
                      alt={matchedDoctor.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1">
                      PENULIS &amp; SPESIALIS
                    </span>
                    <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
                      {matchedDoctor.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      {matchedDoctor.specialty} • Naray Hospital Kota Dumai
                    </p>
                    <Link
                      to={`/dokter/${matchedDoctor.slug || matchedDoctor.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <Stethoscope size={14} />
                      <span>Lihat Profil &amp; Jadwal Praktik</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Back Link */}
              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/berita-artikel"
                  className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Semua Berita &amp; Artikel</span>
                </Link>
              </div>

            </article>

            {/* ── Right Column: Sidebar (4 Cols) ── */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Sidebar Card 1: Fast Doctor Booking CTA */}
              <div className="bg-linear-to-br from-teal-800 to-teal-950 text-white rounded-3xl p-6 border border-teal-700/60 shadow-lg">
                <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 mb-4">
                  <Stethoscope size={22} />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-white leading-snug mb-2">
                  Konsultasi Spesialis di Naray Hospital
                </h3>
                <p className="text-xs text-teal-100/80 leading-relaxed mb-5">
                  Daftarkan kunjungan poliklinik spesialis lebih cepat tanpa antrean panjang. Menerima pasien umum, asuransi rekanan, dan BPJS.
                </p>
                <div className="space-y-2.5">
                  <Link
                    to="/dokter-jadwal"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md transition-all text-center"
                  >
                    <span>Cari Jadwal Dokter</span>
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${(hospitalInfo.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '')}&text=Halo%20Naray%20Hospital,%20saya%20ingin%20konsultasi%20jadwal%20dokter.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all text-center"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Pendaftaran</span>
                  </a>
                </div>
              </div>

              {/* Sidebar Card 2: 24-Hour Emergency Banner */}
              <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 shadow-2xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block font-mono">
                      UGD 24 JAM
                    </span>
                    <h4 className="font-heading text-sm font-bold text-slate-900">
                      Gawat Darurat &amp; Ambulans
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Dokter emergensi dan armada ambulans siaga 24 jam penuh di kawasan Kota Dumai.
                </p>
                <a
                  href={`https://wa.me/${(hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp UGD: {hospitalInfo?.emergencyHotline || '+62 853-6339-5383'}</span>
                </a>
              </div>

              {/* Sidebar Card 3: Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span>Artikel Terkait</span>
                    <Sparkles size={16} className="text-teal-600" />
                  </h3>

                  <div className="space-y-4">
                    {relatedArticles.map((rel) => {
                      const targetSlug = rel.slug || toSlug(rel.title) || rel.id;
                      const relCat = typeof rel.category === 'object' ? (rel.category?.name || 'Kesehatan') : (rel.category || 'Edukasi');

                      return (
                        <Link
                          key={rel.id}
                          to={`/berita-artikel/${targetSlug}`}
                          className="group flex items-start gap-3.5 no-underline"
                        >
                          <div className="w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                            <img 
                              src={rel.image || '/images/discovery/diagnostic-center.jpg'} 
                              alt={rel.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                              {relCat}
                            </span>
                            <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-1">
                              {rel.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {rel.date}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sidebar Card 4: Quick Navigation to Other Services */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
                <h3 className="font-heading text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Layanan Naray Hospital
                </h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-700">
                  <li>
                    <Link to="/poliklinik" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition-colors">
                      <span>13 Poliklinik Terpadu</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/paket-mcu" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition-colors">
                      <span>Paket Medical Check Up (MCU)</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/kamar-rawat-inap" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition-colors">
                      <span>Kamar Rawat Inap &amp; VIP</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/galeri-video" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition-colors">
                      <span>Galeri Fasilitas &amp; Edukasi</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </li>
                </ul>
              </div>

            </aside>

          </div>
        </div>

        {/* ── 4. Bottom Fast Action Callout Banner (Matching DoctorSchedulePage) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>KONSULTASI SPESIALIS</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Punya Pertanyaan Mengenai Topik Medis Ini?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Jadwalkan konsultasi tatap muka bersama dokter spesialis Naray Hospital Kota Dumai untuk diagnosis klinis akurat dan penanganan terstandar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/dokter-jadwal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Stethoscope size={16} />
                <span>Lihat Jadwal Dokter</span>
              </Link>
              <a
                href={`https://wa.me/${(hospitalInfo?.callCenter || hospitalInfo?.whatsappHotline || '628117529798').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Call Center Naray Hospital Dumai, saya ingin menanyakan informasi pelayanan.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Call Center: {hospitalInfo?.callCenter || '+62 811-7529-798'}</span>
              </a>
            </div>
          </section>
        </div>

      </div>
    </PageLayout>
  );
}
