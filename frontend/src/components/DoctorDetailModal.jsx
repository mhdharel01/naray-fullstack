import React from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Award, 
  GraduationCap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck,
  Stethoscope,
  MessageCircle
} from 'lucide-react';
import { hospitalInfo } from '../data/hospitalData';

export function DoctorDetailModal({ doctor, onClose }) {
  if (!doctor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-doctor-detail glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Tutup Modal">
          <X size={20} />
        </button>

        <div className="doc-detail-header">
          <div className="doc-detail-avatar-wrap">
            <img 
              src={doctor.photo && !doctor.photo.includes('.svg') ? doctor.photo : (/siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doctor.name || '') ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg')} 
              alt={doctor.name} 
              className="doc-detail-avatar" 
              onError={(e) => {
                const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doctor.name || '');
                e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
              }}
            />
            <div className="doc-detail-rating">
              <Star size={14} fill="#D4AF37" color="#D4AF37" />
              <span>{doctor.rating}</span>
              <small>({doctor.reviewCount} Pasien)</small>
            </div>
          </div>

          <div className="doc-detail-intro">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="badge-tag badge-teal">
                {typeof doctor.specialtyGroup === 'object' ? (doctor.specialtyGroup?.name || 'Dokter Spesialis') : (doctor.specialtyGroup || 'Dokter Spesialis')}
              </span>
              <span className={`doctor-status-badge ${doctor.isOnLeave ? 'status-leave' : (doctor.isPracticing ? 'status-practicing' : 'status-offduty')}`}>
                <span className="status-dot" />
                <span>{doctor.isOnLeave ? 'Sedang Cuti' : (doctor.isPracticing ? 'Praktik Sesuai Jadwal' : 'Tidak Praktik')}</span>
              </span>
            </div>
            <h2 className="doc-detail-name">{doctor.name}</h2>
            <p className="doc-detail-specialty">
              {typeof doctor.specialty === 'object' ? (doctor.specialty?.name || 'Spesialis') : doctor.specialty}
            </p>

            <div className="doc-detail-meta-row">
              <div className="doc-detail-meta-item">
                <MapPin size={15} className="icon-teal" />
                <span>{typeof doctor.branchName === 'object' ? (doctor.branchName?.name || 'Naray Hospital') : (doctor.branchName || 'Naray Hospital')}</span>
              </div>
              <div className="doc-detail-meta-item">
                <Award size={15} className="icon-gold" />
                <span>{doctor.experience}</span>
              </div>
            </div>

            <p className="doc-detail-bio">{doctor.bio}</p>
          </div>
        </div>

        <div className="doc-detail-body">
          {/* Subspecialty & Focus */}
          <div className="doc-detail-section">
            <h4 className="doc-section-title">
              <Stethoscope size={16} className="icon-teal" />
              <span>Fokus Keahlian Klinis &amp; Subspesialisasi:</span>
            </h4>
            <div className="subspecialty-pill">
              <CheckCircle2 size={15} className="icon-teal" />
              <span>{doctor.subSpecialty}</span>
            </div>
          </div>

          {/* Education & Fellowship */}
          <div className="doc-detail-section">
            <h4 className="doc-section-title">
              <GraduationCap size={16} className="icon-teal" />
              <span>Riwayat Pendidikan &amp; Pelatihan Internasional:</span>
            </h4>
            <p className="education-text">{doctor.education}</p>
          </div>

          {/* Weekly Schedules */}
          <div className="doc-detail-section">
            <h4 className="doc-section-title">
              <Clock size={16} className="icon-teal" />
              <span>Jadwal Lengkap Praktik Poliklinik:</span>
            </h4>

            {!doctor.isPracticing && (
              <div className={`doc-modal-offduty-banner ${doctor.isOnLeave ? 'is-leave' : ''}`}>
                <span className="status-dot" />
                <div>
                  <strong>
                    {doctor.isOnLeave
                      ? `Dokter Sedang Cuti (${doctor.currentLeave?.reason || 'Cuti'})`
                      : 'Dokter Sedang Tidak Berpraktik'}
                  </strong>
                  <p>
                    {doctor.isOnLeave && doctor.currentLeave ? (
                      <>
                        Periode cuti: <strong>{new Date(doctor.currentLeave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> s/d{' '}
                        <strong>{new Date(doctor.currentLeave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                        Dokter otomatis akan kembali aktif berpraktik sesuai jadwal reguler setelah masa cuti berakhir.
                        {doctor.currentLeave.notes && <span style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>Catatan: {doctor.currentLeave.notes}</span>}
                      </>
                    ) : (
                      'Dokter saat ini sedang tidak melayani rawat jalan di poliklinik. Jadwal di bawah ini adalah jam praktik reguler dokter saat aktif bertugas kembali.'
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="schedule-table-wrap">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Jam Praktik</th>
                    <th>Ruang Poliklinik</th>
                  </tr>
                </thead>
                <tbody>
                  {((doctor.schedules || []).filter(s => (s.status || 'active') === 'active' && doctor.status !== 'inactive')).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        Belum ada jadwal praktik aktif untuk dokter ini.
                      </td>
                    </tr>
                  ) : (
                    (doctor.schedules || [])
                      .filter(s => (s.status || 'active') === 'active' && doctor.status !== 'inactive')
                      .map((sch, idx) => (
                        <tr key={idx}>
                          <td><strong>{sch.day}</strong></td>
                          <td><span className="schedule-time-badge">{sch.time}</span></td>
                          <td>{sch.room || '-'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="doc-detail-footer">
          <button className="btn btn-outline" onClick={onClose}>
            <span>Tutup</span>
          </button>
          <a 
            href={`https://wa.me/${(hospitalInfo.whatsapp || hospitalInfo.whatsappHotline || '+62 811-7529-798').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Naray Hospital Dumai, saya ingin menanyakan jadwal praktik ${doctor.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <MessageCircle size={16} />
            <span>Tanya via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
