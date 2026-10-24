import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Search, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Home, 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall,
  Heart,
  Baby,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { hospitalInfo } from '../data/hospitalData';

const POLI_CATEGORIES = [
  { id: 'all', label: 'Semua Poliklinik' },
  { id: 'organ', label: 'Jantung & Organ Dalam' },
  { id: 'ibu-anak', label: 'Ibu & Anak' },
  { id: 'bedah-saraf', label: 'Bedah & Saraf' },
  { id: 'indera-gigi', label: 'Mata, THT & Gigi' },
  { id: 'spesial', label: 'Paru, Kulit & Jiwa' }
];

export default function PoliklinikPage() {
  const navigate = useNavigate();
  const { poliklinikList = [], doctors = [] } = useHospitalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Mapping poliklinik to categories
  const getPoliCategory = (poliId) => {
    if (['poli-jantung', 'poli-penyakit-dalam'].includes(poliId)) return 'organ';
    if (['poli-anak', 'poli-obgyn'].includes(poliId)) return 'ibu-anak';
    if (['poli-bedah', 'poli-saraf'].includes(poliId)) return 'bedah-saraf';
    if (['poli-mata', 'poli-tht', 'poli-gigi'].includes(poliId)) return 'indera-gigi';
    return 'spesial';
  };

  // Find associated doctors for a poliklinik
  const getDoctorsForPoli = (poliName) => {
    const cleanName = (poliName || '').replace(/.*Poliklinik\s+/, '').toLowerCase();
    return (doctors || []).filter(doc => {
      const spec = (doc.specialty || '').toLowerCase();
      const grp = (doc.specialtyGroup || '').toLowerCase();
      return spec.includes(cleanName) || grp.includes(cleanName) || cleanName.includes(spec);
    });
  };

  const filteredPoli = useMemo(() => {
    return poliklinikList.filter(poli => {
      const matchesSearch = 
        !searchTerm ||
        poli.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poli.desc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = 
        activeCategory === 'all' || 
        getPoliCategory(poli.id) === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [poliklinikList, searchTerm, activeCategory]);

  return (
    <PageLayout>
      <>
          {/* ── Subpage Hero Banner ── */}
          <div className="subpage-hero poli-hero">
            <div className="subpage-hero-overlay" />
            <div className="container subpage-hero-content">
              {/* Breadcrumb */}
              <nav className="subpage-breadcrumb">
                <Link to="/"><Home size={14} />Beranda</Link>
                <ChevronRight size={14} />
                <span>Poliklinik Terpadu</span>
              </nav>

              <h1 className="subpage-hero-title">
                13 Poliklinik Terpadu Spesialis &amp; Subspesialis
              </h1>
              <p className="subpage-hero-desc">
                Pelayanan rawat jalan terintegrasi dengan tim dokter spesialis berpengalaman, teknologi diagnostik modern, dan sistem antrean digital teratur demi kenyamanan Anda dan keluarga di Naray Hospital Dumai.
              </p>

            </div>
          </div>

          {/* ── Subpage Stats Bar ── */}
          <div className="subpage-stats-bar">
            <div className="container subpage-stats-grid">
              <div className="subpage-stat">
                <span className="stat-value">{poliklinikList.length || 13}</span>
                <span className="stat-label">Poliklinik Spesialis</span>
              </div>
              <div className="subpage-stat">
                <span className="stat-value">19+</span>
                <span className="stat-label">Dokter Ahli &amp; Subspesialis</span>
              </div>
              <div className="subpage-stat">
                <span className="stat-value">09:00 - 21:00</span>
                <span className="stat-label">Senin s/d Sabtu</span>
              </div>
              <div className="subpage-stat">
                <span className="stat-value">100%</span>
                <span className="stat-label">Rekam Medis Elektronik</span>
              </div>
            </div>
          </div>

          {/* ── Filter & Search Section ── */}
          <div className="subpage-filter-wrap">
            <div className="container">
              <div className="subpage-filter-card glass-card">
                <div className="poli-search-row">
                  <div className="poli-search-input-wrap">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text"
                      className="poli-search-input"
                      placeholder="Cari nama poliklinik atau keluhan medis (misal: Anak, Jantung, Gigi, Batuk)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        type="button" 
                        className="search-clear-btn"
                        onClick={() => setSearchTerm('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Pills */}
                <div className="poli-category-pills">
                  {POLI_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Poliklinik Cards Grid ── */}
          <section className="section poli-page-section">
            <div className="container">
              <div className="section-header text-left">
                <div className="section-tag">
                  <Stethoscope size={14} />
                  <span>Daftar Layanan Poliklinik</span>
                </div>
                <h2 className="section-title">
                  Menampilkan {filteredPoli.length} Poliklinik
                  {activeCategory !== 'all' && ` kategori "${POLI_CATEGORIES.find(c => c.id === activeCategory)?.label}"`}
                </h2>
                <p className="section-subtitle">
                  Klik tombol <strong>"Lihat Jadwal Dokter"</strong> untuk melihat daftar dokter spesialis serta hari dan jam praktik poliklinik rawat jalan.
                </p>
              </div>

              {filteredPoli.length === 0 ? (
                <div className="no-result-card glass-card">
                  <AlertCircle size={44} className="icon-muted" />
                  <h3>Poliklinik Tidak Ditemukan</h3>
                  <p>Tidak ada poliklinik yang sesuai dengan kata kunci "{searchTerm}".</p>
                  <button 
                    type="button" 
                    className="btn btn-outline mt-3"
                    onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <div className="poli-page-grid">
                  {filteredPoli.map(poli => {
                    const cleanPoliName = poli.name.replace(/.*Poliklinik\s+/, '');
                    const poliDoctors = getDoctorsForPoli(poli.name);

                    return (
                      <div key={poli.id} className="poli-page-card glass-card">
                        <div className="poli-page-card-header">
                          <div className="poli-page-icon-badge">
                            <span className="poli-page-emoji">{poli.icon}</span>
                          </div>
                          <div className="poli-page-meta">
                            <span className="poli-badge-tag">Poliklinik Spesialis</span>
                            <h3 className="poli-page-card-title">{poli.name}</h3>
                          </div>
                        </div>

                        <p className="poli-page-card-desc">{poli.desc}</p>

                        {/* Doctors practicing in this poli */}
                        {poliDoctors.length > 0 && (
                          <div className="poli-doctors-box">
                            <div className="poli-doctors-header">
                              <UserCheck size={14} />
                              <span>Dokter Praktik Terkait ({poliDoctors.length}):</span>
                            </div>
                            <ul className="poli-doctors-list">
                              {poliDoctors.slice(0, 3).map(doc => (
                                <li key={doc.id} className="poli-doctor-item">
                                  <span className="poli-doc-bullet">•</span>
                                  <span className="poli-doc-name">{doc.name}</span>
                                </li>
                              ))}
                              {poliDoctors.length > 3 && (
                                <li className="poli-doctor-more">
                                  +{poliDoctors.length - 3} dokter spesialis lainnya
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="poli-page-card-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm w-full"
                            style={{ justifyContent: 'center' }}
                            onClick={() => navigate(`/dokter-jadwal?poli=${encodeURIComponent(cleanPoliName)}`)}
                          >
                            <span>Lihat Jadwal Dokter</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── Standar Pelayanan Rawat Jalan ── */}
          <section className="section bg-light-tint">
            <div className="container">
              <div className="section-header text-center">
                <div className="section-tag">
                  <ShieldCheck size={14} />
                  <span>Keunggulan Layanan</span>
                </div>
                <h2 className="section-title">Standar Kenyamanan Rawat Jalan Naray Hospital</h2>
                <p className="section-subtitle">
                  Setiap poliklinik dirancang dengan standar keselamatan dan kenyamanan modern untuk pengalaman pengobatan yang menenangkan.
                </p>
              </div>

              <div className="poli-standards-grid">
                <div className="poli-standard-card glass-card">
                  <div className="standard-icon-wrap">
                    <Sparkles size={24} className="icon-teal" />
                  </div>
                  <h4>Rekam Medis Elektronik (RME)</h4>
                  <p>Data riwayat medis terintegrasi antar dokter spesialis, memudahkan penegakan diagnosis yang akurat dan aman.</p>
                </div>

                <div className="poli-standard-card glass-card">
                  <div className="standard-icon-wrap">
                    <Clock size={24} className="icon-teal" />
                  </div>
                  <h4>Sistem Antrean Teratur</h4>
                  <p>Pengingat jadwal konsultasi via WhatsApp dan estimasi waktu periksa yang transparan untuk menghemat waktu Anda.</p>
                </div>

                <div className="poli-standard-card glass-card">
                  <div className="standard-icon-wrap">
                    <CheckCircle2 size={24} className="icon-teal" />
                  </div>
                  <h4>Farmasi &amp; Laboratorium Dekat</h4>
                  <p>Pengambilan obat resep dan pengambilan sampel darah/laboratorium berada dalam satu lantai untuk mobilitas mudah.</p>
                </div>

                <div className="poli-standard-card glass-card">
                  <div className="standard-icon-wrap">
                    <Heart size={24} className="icon-teal" />
                  </div>
                  <h4>Layanan Ramah Lansia &amp; Disabilitas</h4>
                  <p>Disediakan kursi roda, jalur akses khusus, serta staf perawat pendamping untuk pasien prioritas dan lansia.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Callout Banner ── */}
          <section className="section">
            <div className="container">
              <div className="poli-cta-banner">
                <div className="poli-cta-content">
                  <span className="poli-cta-tag">Konsultasi Dokter Hari Ini</span>
                  <h2>Butuh Penanganan Cepat atau Informasi Poli Tertentu?</h2>
                  <p>
                    Hubungi Call Center Naray Hospital di <strong>{hospitalInfo.callCenter}</strong> atau layanan darurat IGD 24 Jam di <strong>{hospitalInfo.emergencyHotline}</strong>.
                  </p>
                  <div className="poli-cta-buttons">
                    <button 
                      type="button" 
                      className="btn btn-gold"
                      onClick={() => navigate('/dokter-jadwal')}
                    >
                      <Calendar size={18} />
                      <span>Lihat Jadwal Dokter</span>
                    </button>
                    <a 
                      href={`https://wa.me/${hospitalInfo.whatsappHotline.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-white"
                    >
                      <PhoneCall size={18} />
                      <span>Tanya via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </>
    </PageLayout>
  );
}
