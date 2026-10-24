import React, { useState } from 'react';
import { Video, Image as ImageIcon, Calendar, Play } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function MediaGallerySection() {
  const { videoList = [], galleryActivities = [], formatImageUrl } = useHospitalData();
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'gallery'

  return (
    <section id="media-galeri" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mb-2.5">
            <Video size={14} className="text-teal-600" />
            <span>Galeri &amp; Video Dokumentasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-3">
            Dokumentasi &amp; Kegiatan Naray Hospital
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed mb-8">
            Lihat lebih dekat pelayanan, fasilitas terbaik, dan momen kebersamaan dalam kegiatan sosial serta edukasi kesehatan bersama masyarakat Kota Dumai.
          </p>

          {/* Sub Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 gap-1" role="tablist">
            <button 
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'video' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <Video size={16} />
              <span>Video Dokumentasi ({videoList.length})</span>
            </button>
            <button 
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'gallery' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('gallery')}
            >
              <ImageIcon size={16} />
              <span>Galeri Foto ({galleryActivities.length})</span>
            </button>
          </div>
        </div>

        {/* Video View */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {videoList.map((vid) => (
              <div key={vid.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-video w-full bg-slate-950">
                  <iframe 
                    src={vid.youtubeEmbed} 
                    title={vid.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                    {vid.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed m-0">
                    {vid.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Gallery View */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {galleryActivities.map((gal) => {
              const rawImg = gal.image || gal.image_url;
              const photoImg = formatImageUrl ? formatImageUrl(rawImg, '/images/discovery/diagnostic-center.jpg') : (rawImg || '/images/discovery/diagnostic-center.jpg');

              return (
                <div key={gal.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                    <img 
                      src={photoImg} 
                      alt={gal.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = '/images/discovery/diagnostic-center.jpg'; }}
                    />
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-teal-300 backdrop-blur-md">
                      {typeof gal.category === 'object' ? (gal.category?.name || 'Kegiatan Naray') : (gal.category || 'Kegiatan Naray')}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                        <Calendar size={13} className="text-teal-600" />
                        <span>{gal.date}</span>
                      </div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                        {gal.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed m-0">
                        {gal.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
