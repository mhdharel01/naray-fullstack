import React, { useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function ArticleDetailModal({ article, onClose }) {
  const { hospitalInfo = {}, formatImageUrl } = useHospitalData();

  useEffect(() => {
    if (!article) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [article, onClose]);

  if (!article) return null;

  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
  const categoryName = typeof article.category === 'object' ? (article.category?.name || 'Kesehatan') : (article.category || 'Kesehatan');
  const rawImage = article.image || article.image_url;
  const articleImg = formatImageUrl 
    ? formatImageUrl(rawImage, '/images/articles/default-health.jpg') 
    : (rawImage || '/images/articles/default-health.jpg');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer z-30 backdrop-blur-md shadow-md hover:scale-105 active:scale-95" 
          onClick={onClose} 
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Hero Image */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-950 shrink-0">
          <img 
            src={articleImg} 
            alt={article.title} 
            className="w-full h-full object-cover object-center" 
            onError={(e) => { e.currentTarget.src = '/images/articles/default-health.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles size={12} />
            <span>{categoryName}</span>
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-slate-700">
          <div>
            <h2 
              id="article-modal-title" 
              className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-3"
            >
              {article.title}
            </h2>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pb-4 border-b border-slate-100">
              {article.author && (
                <div className="inline-flex items-center gap-1.5 text-teal-700">
                  <User size={14} />
                  <span>Oleh: <strong className="text-slate-800">{article.author}</strong></span>
                </div>
              )}
              {article.date && (
                <div className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{article.date}</span>
                </div>
              )}
              {article.readTime && (
                <div className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{article.readTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Article Body Text */}
          <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {article.content ? (
              article.content.split('\n\n').map((para, idx) => (
                <p key={idx} className="m-0">{para}</p>
              ))
            ) : (
              <p className="m-0">{article.summary || article.desc || 'Konten edukasi kesehatan dari RS Naray Dumai.'}</p>
            )}
          </div>

          {/* Consultation CTA Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Stethoscope size={20} />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  Ingin Berkonsultasi Mengenai Kondisi Anda?
                </strong>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 m-0">
                  Jadwalkan konsultasi dengan dokter spesialis kami untuk diagnosis akurat dan rencana terapi terbaik.
                </p>
              </div>
            </div>

            <a 
              href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya membaca artikel "${article.title}" dan ingin menanyakan informasi konsultasi dokter spesialis.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Tanya WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer" 
            onClick={onClose}
          >
            Tutup Artikel
          </button>
        </div>
      </div>
    </div>
  );
}
