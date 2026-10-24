import React, { useState } from 'react';
import { 
  BedDouble, 
  Sparkles, 
  Check, 
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function InpatientRooms() {
  const { inpatientRooms = [] } = useHospitalData();
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const safeIndex = activeRoomIndex < (inpatientRooms?.length || 0) ? activeRoomIndex : 0;
  const activeRoom = inpatientRooms && inpatientRooms.length > 0 ? inpatientRooms[safeIndex] : null;

  if (!activeRoom) return null;

  return (
    <section id="rawat-inap" className="section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-header-top-row">
            <div className="section-tag">
              <BedDouble size={14} />
              <span>Kenyamanan Rawat Inap</span>
            </div>
          </div>
          <h2 className="section-title">Kamar Rawat Inap & ICU Eksklusif</h2>
          <p className="section-subtitle">
            Didesain layaknya hotel berbintang dengan standar kebersihan rumah sakit internasional untuk mendukung ketenangan dan proses penyembuhan Anda sekeluarga.
          </p>
        </div>

        {/* Room Category Tabs */}
        <div className="room-tabs-wrapper">
          {inpatientRooms.map((room, idx) => (
            <button 
              key={room.id}
              className={`room-tab-btn ${idx === safeIndex ? 'active' : ''}`}
              onClick={() => setActiveRoomIndex(idx)}
            >
              <BedDouble size={16} />
              <span>{room.name}</span>
            </button>
          ))}
        </div>

        {/* Active Room Showcase Card */}
        <div className="room-showcase-card glass-card">
          <div className="room-showcase-grid">
            {/* Room Image */}
            <div className="room-image-pane">
              <img src={activeRoom.image} alt={activeRoom.name} className="room-main-img" />
              <div className="room-tag-overlay">
                <Sparkles size={14} />
                <span>{activeRoom.tag}</span>
              </div>
            </div>

            {/* Room Content & Amenities */}
            <div className="room-details-pane">
              <div className="room-capacity-badge">
                <span>{activeRoom.capacity || 'Rawat Inap Naray'}</span>
              </div>
              <h3 className="room-heading">{activeRoom.name}</h3>
              <p className="room-subheading">Fasilitas dan Kenyamanan Unggulan:</p>

              <div className="room-amenities-list">
                {(activeRoom.features || []).map((feature, idx) => (
                  <div key={idx} className="room-amenity-item">
                    <div className="amenity-check-icon">
                      <Check size={14} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="room-actions-bar">
                <a 
                  href={`https://wa.me/628117676766?text=${encodeURIComponent(`Halo Admission Naray Hospital, saya ingin menanyakan ketersediaan kamar rawat inap ${activeRoom.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={16} />
                  <span>Cek Ketersediaan via WhatsApp</span>
                </a>

                <div className="room-contact-hint">
                  <span>Pendaftaran Rawat Inap (Admission 24 Jam): <strong>+62 811-7529-798</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
