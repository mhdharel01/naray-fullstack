import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Users, 
  ChevronRight,
  MessageCircle 
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function CenterDetailModal({ center, onClose, onSelectDoctor }) {
  const { doctors = [], hospitalInfo = {} } = useHospitalData();
  if (!center) return null;

  const shortTitle = center.shortTitle || center.title || '';

  // Find related doctors from live context
  const relatedDoctors = doctors.filter(d => {
    const spec = (d.specialtyGroup || d.specialty || '').toLowerCase();
    const st = shortTitle.toLowerCase();
    const ct = (center.title || '').toLowerCase();
    return spec.includes(st) || ct.includes(spec);
  });

  const waNum = (hospitalInfo.whatsappHotline || '628117529798').replace(/[^0-9]/g, '');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer z-20 backdrop-blur-md" 
          onClick={onClose} 
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Hero Banner in Modal */}
        <div 
          className="relative p-6 sm:p-8 bg-cover bg-center text-white shrink-0" 
          style={{ backgroundImage: `linear-gradient(rgba(4, 38, 34, 0.9), rgba(4, 38, 34, 0.96)), url(${center.image || '/images/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp'})` }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} />
            <span>{shortTitle}</span>
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2">
            {center.title}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed m-0">
            {center.tagline}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
          {/* Overview */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Tentang Pusat Layanan
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              {center.description}
            </p>
          </div>

          {/* Services & Procedures */}
          {Array.isArray(center.services) && center.services.length > 0 && (
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                Layanan &amp; Prosedur Medis Unggulan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {center.services.map((srv, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                    <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {Array.isArray(center.technologies) && center.technologies.length > 0 && (
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <Cpu size={16} className="text-teal-600" />
                <span>Teknologi Medis Pendukung</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {center.technologies.map((tech, idx) => (
                  <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold">
                    <Sparkles size={13} className="text-teal-600" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors in this center */}
          {relatedDoctors.length > 0 && (
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <Users size={16} className="text-teal-600" />
                <span>Tim Dokter Spesialis Terkait</span>
              </h4>
              <div className="flex flex-col gap-2.5">
                {relatedDoctors.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <img 
                      src={doc.photo} 
                      alt={doc.name} 
                      className="w-11 h-11 rounded-lg object-cover object-top border border-slate-200" 
                      onError={(e) => { e.currentTarget.src = '/images/default-doctor.svg'; }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doc.name}</strong>
                      <span className="text-xs text-teal-600 truncate">{doc.specialty}</span>
                    </div>
                    <button 
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 hover:bg-teal-50 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                      onClick={() => {
                        onClose();
                        if (onSelectDoctor) onSelectDoctor(doc);
                      }}
                    >
                      <span>Jadwal</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button 
            type="button"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer" 
            onClick={onClose}
          >
            Tutup
          </button>
          <a 
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan informasi layanan di ${center.title}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Konsultasi WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
