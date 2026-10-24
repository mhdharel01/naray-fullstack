import React from 'react';
import { Stethoscope, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function PoliklinikSection({ onFilterDoctorByPoli }) {
  const { poliklinikList } = useHospitalData();

  return (
    <section id="poliklinik" className="section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-header-top-row">
            <div className="section-tag">
              <Stethoscope size={14} />
              <span>Layanan Poliklinik Spesialis</span>
            </div>
          </div>
          <h2 className="section-title">{poliklinikList.length} Poliklinik Terpadu Naray Hospital</h2>
          <p className="section-subtitle">
            Dilayani oleh dokter spesialis dan subspesialis berpengalaman dengan fasilitas poliklinik modern yang nyaman untuk seluruh keluarga Anda di Kota Dumai dan sekitarnya.
          </p>
        </div>

        {/* Poliklinik Grid */}
        <div className="poli-cards-grid">
          {poliklinikList.map((poli) => (
            <div 
              key={poli.id} 
              className="poli-card glass-card card-hover"
              onClick={() => onFilterDoctorByPoli(poli.name.replace(/.*Poliklinik\s+/, ''))}
            >

              <div className="poli-card-icon-wrap">
                <span className="poli-emoji-icon">{poli.icon}</span>
              </div>

              <div className="poli-card-content">
                <h3 className="poli-card-title">{poli.name}</h3>
                <p className="poli-card-desc">{poli.desc}</p>

                <div className="poli-card-footer">
                  <span className="poli-action-link">
                    <span>Lihat Dokter & Jadwal</span>
                    <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
