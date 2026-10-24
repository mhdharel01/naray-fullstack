import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Ambulance, 
  MessageCircle, 
  Navigation, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { hospitalInfo, branches } from '../data/hospitalData';

export function BranchLocations({ onOpenEmergency }) {
  const activeBranch = branches[0];

  return (
    <section id="cabang" className="section-branch-location">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-compact text-center">
          <div className="section-tag">
            <MapPin size={15} />
            <span>Akses &amp; Lokasi Rumah Sakit</span>
          </div>
          <h2 className="section-title-editorial">Lokasi dan Akses Naray Hospital di Kota Dumai</h2>
          <p className="section-subtitle-editorial">
            Berada di lokasi strategis kawasan Dumai Barat, mudah dijangkau dari berbagai penjuru kota dengan fasilitas parkir luas dan akses langsung UGD 24 jam.
          </p>
        </div>

        {/* Branch Detail & Map 2-Column Presentation */}
        <div className="branch-showcase-panel">
          <div className="branch-detail-grid">
            {/* Branch Info Pane */}
            <div className="branch-info-pane">
              <div className="branch-header-badge">
                <span className="branch-city-label">{activeBranch.location}</span>
                <span className="branch-status-indicator">
                  <span className="status-live-dot" />
                  <span>Pelayanan Buka 24 Jam</span>
                </span>
              </div>

              <h3 className="branch-name-large">{activeBranch.name}</h3>
              
              <div className="branch-contact-list">
                <div className="branch-info-block">
                  <div className="info-block-header">
                    <MapPin size={16} className="icon-teal" />
                    <span className="info-label">ALAMAT RUMAH SAKIT</span>
                  </div>
                  <p className="info-value">{activeBranch.address}</p>
                </div>

                <div className="branch-info-block branch-info-emergency">
                  <div className="info-block-header">
                    <Ambulance size={16} className="icon-red" />
                    <span className="info-label info-label-emergency">INSTALASI GAWAT DARURAT (UGD 24 JAM)</span>
                  </div>
                  <p className="info-value-important">{hospitalInfo.emergencyHotline}</p>
                </div>

                <div className="branch-info-block">
                  <div className="info-block-header">
                    <Clock size={16} className="icon-teal" />
                    <span className="info-label">JAM OPERASIONAL POLIKLINIK</span>
                  </div>
                  <p className="info-value">{hospitalInfo.operatingHours}</p>
                </div>

                <div className="branch-info-block">
                  <div className="info-block-header">
                    <Phone size={16} className="icon-teal" />
                    <span className="info-label">CALL CENTER / INFORMASI</span>
                  </div>
                  <p className="info-value">{hospitalInfo.callCenter}</p>
                </div>

                <div className="branch-info-block">
                  <div className="info-block-header">
                    <MessageCircle size={16} className="icon-teal" />
                    <span className="info-label">LAYANAN WHATSAPP PASIEN</span>
                  </div>
                  <p className="info-value">{hospitalInfo.whatsappHotline}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="branch-actions-row">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(hospitalInfo.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-branch-maps"
                >
                  <Navigation size={16} />
                  <span>Petunjuk Arah Google Maps</span>
                </a>

                <a 
                  href={`https://wa.me/${hospitalInfo.whatsappHotline.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-branch-whatsapp"
                >
                  <MessageCircle size={16} />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Embedded Live Google Maps */}
            <div className="branch-map-pane">
              <iframe 
                src={hospitalInfo.gmapsIframe}
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '440px', display: 'block', width: '100%' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi Naray Hospital Dumai"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
