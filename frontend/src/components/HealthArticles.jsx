import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function HealthArticles({ onSelectArticle }) {
  const { healthArticles } = useHospitalData();

  return (
    <section id="artikel" className="section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-header-top-row">
            <div className="section-tag">
              <BookOpen size={14} />
              <span>Edukasi &amp; Wawasan Medis</span>
            </div>
          </div>
          <h2 className="section-title">Artikel Kesehatan Terpercaya</h2>
          <p className="section-subtitle">
            Informasi medis yang ditulis dan ditinjau langsung oleh tim dokter spesialis RS Naray Hospital untuk membantu Anda dan keluarga hidup lebih sehat.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="articles-grid">
          {healthArticles.filter(art => (art.status || 'published').toLowerCase() === 'published').map((art) => (
            <article 
              key={art.id} 
              className="article-card glass-card card-hover"
              onClick={() => onSelectArticle(art)}
            >

              <div className="article-img-wrap">
                <img src={art.image} alt={art.title} className="article-img" />
                <span className="article-category-badge">
                  {typeof art.category === 'object' ? (art.category?.name || 'Kesehatan') : (art.category || 'Kesehatan')}
                </span>
              </div>

              <div className="article-body">
                <div className="article-meta-top">
                  <span className="article-date">
                    <Calendar size={13} /> {art.date}
                  </span>
                  <span className="article-readtime">
                    <Clock size={13} /> {art.readTime}
                  </span>
                </div>

                <h3 className="article-title">{art.title}</h3>
                <p className="article-summary">{art.summary}</p>

                <div className="article-footer">
                  <div className="article-author">
                    <User size={14} className="icon-teal" />
                    <span>Oleh: <strong>{art.author}</strong></span>
                  </div>

                  <button 
                    className="article-read-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectArticle(art);
                    }}
                  >
                    <span>Baca Selengkapnya</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
