import React from 'react';
import { 
  Cpu, 
  ChevronRight, 
  Eye,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function AdvancedFacilities({ onSelectFacility }) {
  const { facilitiesData } = useHospitalData();

  return (
    <section id="fasilitas" className="section section-dark">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-header-top-row">
            <div className="section-tag">
              <Cpu size={14} />
              <span>Fasilitas &amp; Teknologi</span>
            </div>
          </div>
          <h2 className="section-title">Teknologi Medis Mutakhir Berstandar Global</h2>
          <p className="section-subtitle">
            Investasi berkelanjutan pada peralatan diagnostik dan bedah tercanggih untuk akurasi tindakan tertinggi, keamanan maksimal, dan kenyamanan tanpa kompromi.
          </p>
        </div>

        {/* Facilities Showcase Grid */}
        <div className="facilities-grid">
          {facilitiesData.map((item) => (
            <div 
              key={item.id} 
              className="facility-card glass-card card-hover"
              onClick={() => onSelectFacility(item)}
            >

              <div className="facility-img-wrap">
                <img src={item.image} alt={item.name} className="facility-img" />
                <div className="facility-overlay"></div>
                <span className="facility-category-badge">
                  {typeof item.category === 'object' ? (item.category?.name || 'Fasilitas Unggulan') : (item.category || 'Fasilitas Unggulan')}
                </span>
              </div>

              <div className="facility-card-content">
                <h3 className="facility-title">{item.name}</h3>
                <p className="facility-desc">{item.description}</p>

                <button 
                  className="facility-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(item);
                  }}
                >
                  <Eye size={16} />
                  <span>Pelajari Teknologi Ini</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
