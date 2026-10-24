import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, ChevronRight, User } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function HospitalNewsSection({ onSelectArticle }) {
  const navigate = useNavigate();
  const { healthArticles = [] } = useHospitalData();
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Edukasi Kesehatan', 'Berita', 'Pengumuman'];

  // Smart filter based on selected category
  const filteredArticles = healthArticles.filter(art => {
    if (selectedCategory === 'Semua') return true;
    const cat = (art.category || '').toLowerCase();
    if (selectedCategory === 'Edukasi Kesehatan') {
      return cat.includes('edukasi') || cat.includes('kesehatan') || cat.includes('jantung') || cat.includes('anak') || cat.includes('paru') || cat.includes('dalam');
    }
    if (selectedCategory === 'Berita') {
      return cat.includes('berita') || cat.includes('kegiatan') || cat.includes('sosial') || cat.includes('csr') || cat.includes('umum');
    }
    if (selectedCategory === 'Pengumuman') {
      return cat.includes('pengumuman') || cat.includes('layanan') || cat.includes('jadwal') || cat.includes('info');
    }
    return true;
  });

  const displayArticles = filteredArticles.slice(0, 3);

  // Curated high-resolution medical photography for pristine aesthetic presentation
  const getArticleImage = (art, idx) => {
    if (art.image && !art.image.includes('.svg') && !art.image.includes('default')) {
      return art.image;
    }
    const fallbacks = [
      '/images/discovery/diagnostic-center.jpg',
      '/images/discovery/mcu-lab.jpg',
      '/images/discovery/vip-room.jpg'
    ];
    return fallbacks[idx % fallbacks.length];
  };

  return (
    <section 
      id="berita-edukasi" 
      className="py-20 sm:py-28 bg-white border-b border-slate-200/80" 
      aria-labelledby="news-heading"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Clean Editorial Label, Hierarchy & Pill Filters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              BERITA &amp; EDUKASI
            </span>
            <h2 id="news-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2.5">
              Informasi sehat untuk keluarga
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Berita rumah sakit, pengumuman layanan, dan panduan kesehatan dari tim kami.
            </p>
          </div>

          {/* Category Filter Pills (Aligned Right to match reference) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5" role="tablist" aria-label="Kategori Berita">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20 font-bold scale-[1.02]' 
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Articles Grid with Strict Vertical Pixel Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 mb-12 sm:mb-16">
          {displayArticles.map((article, idx) => {
            const imgSrc = getArticleImage(article, idx);
            const dateStr = article.date || '22 Oktober 2026';
            const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const targetSlug = article.slug || toSlug(article.title) || article.id;

            return (
              <Link 
                key={article.id || idx}
                to={`/berita-artikel/${targetSlug}`}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer no-underline"
              >
                {/* 1. Article Image Cover with Floating Category Badge */}
                <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden shrink-0">
                  <img 
                    src={imgSrc} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40" />

                  <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                    {article.category || 'Edukasi Kesehatan'}
                  </span>
                </div>

                {/* 2. Article Body (Equalized Heights for Pixel-Perfect Neatness) */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                      <Calendar size={13} className="text-teal-600 shrink-0" />
                      <span>{dateStr}</span>
                    </div>

                    {/* Title with min-h for strict alignment */}
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2.5 min-h-[3.25rem]">
                      {article.title}
                    </h3>

                    {/* Excerpt with min-h for strict alignment */}
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal line-clamp-2 mb-6 min-h-[2.5rem]">
                      {article.snippet || article.summary || (article.content ? article.content.slice(0, 140) + '...' : 'Informasi kesehatan keluarga terpercaya dari dokter spesialis Naray Hospital.')}
                    </p>
                  </div>

                  {/* 3. Card Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium truncate max-w-[160px] sm:max-w-[190px]">
                      Oleh: <strong className="text-slate-600">{article.author ? article.author.split(',')[0] : 'Humas Naray Hospital'}</strong>
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-teal-700 group-hover:text-teal-800 transition-all group-hover:translate-x-1 shrink-0">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Centered Outline Pill Button */}
        <div className="flex justify-center">
          <Link
            to="/berita-artikel"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white hover:bg-teal-50 text-teal-700 font-bold text-sm border border-teal-500 shadow-2xs hover:shadow-md hover:border-teal-600 transition-all"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
