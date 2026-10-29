

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Award, 
  ChevronRight, 
  UserCheck, 
  Stethoscope,
  Filter,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

const normalizePoliKey = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/^(poliklinik\s+poli|poliklinik|poli)\s+/i, '')
    .replace(/[.\s]+$/g, '')
    .trim();
};

const POLI_SYNONYMS = {
  'paru': ['pulmonologi', 'kedokteran respirasi', 'pulmonologi dan kedokteran respirasi'],
  'pulmonologi': ['paru'],
  'pulmonologi dan kedokteran respirasi': ['paru'],
  'kulit dan kelamin': ['dermatologi dan venereologi', 'dermatologi'],
  'dermatologi dan venereologi': ['kulit dan kelamin', 'kulit & kelamin'],
  'kandungan': ['kebidanan', 'kebidanan & kandungan', 'kebidanan dan kandungan', 'obgyn'],
  'kebidanan & kandungan': ['kandungan', 'obgyn'],
  'kebidanan dan kandungan': ['kandungan', 'obgyn'],
  'kedokteran jiwa': ['psikiatri', 'jiwa'],
  'psikiatri & jiwa': ['kedokteran jiwa', 'jiwa'],
  'saraf': ['neurologi', 'neuro'],
  'neurologi': ['saraf'],
  'anak': ['pediatrik'],
  'jantung dan pembuluh darah': ['jantung'],
  'jantung': ['jantung dan pembuluh darah']
};

const matchDoctorPoliklinik = (doc, targetPoli) => {
  if (!targetPoli || targetPoli === 'Semua' || targetPoli === 'all') return true;
  const targetKey = normalizePoliKey(targetPoli);
  if (!targetKey) return true;

  const docPoliKeys = [];
  (doc.schedules || []).forEach(s => {
    if (s.room) docPoliKeys.push(normalizePoliKey(s.room));
  });
  if (Array.isArray(doc.polikliniks)) {
    doc.polikliniks.forEach(p => {
      const name = p.name || p;
      if (name) docPoliKeys.push(normalizePoliKey(name));
    });
  }

  // 1. ISOLASI KETAT: Bedah Umum vs Bedah Mulut vs Gigi
  if (targetKey === 'bedah') {
    return docPoliKeys.includes('bedah') || 
      (!docPoliKeys.some(k => k.includes('bedah mulut')) && normalizePoliKey(doc.specialty) === 'bedah');
  }

  if (targetKey === 'gigi') {
    return docPoliKeys.includes('gigi') || 
      (docPoliKeys.includes('gigi & mulut') && !docPoliKeys.some(k => k.includes('bedah mulut')));
  }

  if (targetKey.includes('bedah mulut')) {
    return docPoliKeys.some(k => k.includes('bedah mulut')) || 
      normalizePoliKey(doc.subSpecialty).includes('bedah mulut') || 
      normalizePoliKey(doc.specialty).includes('bedah mulut');
  }

  if (docPoliKeys.includes(targetKey)) {
    return true;
  }

  if (POLI_SYNONYMS[targetKey]) {
    for (const syn of POLI_SYNONYMS[targetKey]) {
      if (docPoliKeys.includes(syn)) return true;
    }
  }

  const docSpecKey = normalizePoliKey(doc.specialty);
  const docGroupKey = normalizePoliKey(doc.specialtyGroup);
  if (docSpecKey === targetKey || docGroupKey === targetKey) {
    return true;
  }
  if (POLI_SYNONYMS[targetKey]) {
    for (const syn of POLI_SYNONYMS[targetKey]) {
      if (docSpecKey === syn || docGroupKey === syn) return true;
    }
  }

  return false;
};

const matchDayDoctor = (doc, dayTerm) => {
  if (doc.status === 'inactive') return false;
  const activeSchedules = (doc.schedules || []).filter(s => (s.status || 'active') === 'active');
  if (activeSchedules.length === 0) return false;

  if (!dayTerm) return true;
  const day = dayTerm.toLowerCase().trim();
  const dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  const dayIdx = dayOrder.indexOf(day);
  const targetDayNum = dayIdx !== -1 ? dayIdx + 1 : null;

  return activeSchedules.some(s => {
    const sDow = Number(s.day_of_week);
    if (targetDayNum !== null && (sDow === targetDayNum || (targetDayNum === 7 && sDow === 0))) return true;
    const sDay = (s.day || '').toLowerCase();
    if (sDay.includes(day)) return true;
    if (sDay.includes('senin - sabtu') && dayIdx <= 5) return true;
    if (sDay.includes('senin - jumat') && dayIdx <= 4) return true;
    if (sDay.includes('senin - minggu') || sDay.includes('setiap hari')) return true;

    if (sDay.includes('-')) {
      const parts = sDay.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const startIdx = dayOrder.indexOf(parts[0]);
        const endIdx = dayOrder.indexOf(parts[1]);
        if (startIdx !== -1 && endIdx !== -1 && dayIdx >= startIdx && dayIdx <= endIdx) {
          return true;
        }
      }
    }
    return false;
  });
};

export function DoctorDirectory({ 
  filterState, 
  onResetFilter, 
  onSelectDoctor
}) {
  const { doctors, poliklinikList } = useHospitalData();

  const [keyword, setKeyword] = useState(filterState.keyword || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(filterState.specialty || '');
  const [selectedDay, setSelectedDay] = useState(filterState.day || '');

  React.useEffect(() => {
    if (filterState.keyword !== undefined) setKeyword(filterState.keyword);
    if (filterState.specialty !== undefined) setSelectedSpecialty(filterState.specialty);
    if (filterState.day !== undefined) setSelectedDay(filterState.day);
  }, [filterState]);

  const daysList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const poliklinikOptions = useMemo(() => {
    const list = [];
    const seen = new Set();

    const addPoli = (rawName, id) => {
      if (!rawName) return;
      let clean = String(rawName).trim().replace(/[.\s]+$/g, '');
      if (!clean.toLowerCase().startsWith('poli')) {
        clean = `Poli ${clean}`;
      }
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: id || key, name: clean });
      }
    };

    (poliklinikList || []).forEach(p => {
      addPoli(p.name, p.id || p.dbId);
    });

    (doctors || []).forEach(d => {
      (d.schedules || []).forEach(s => {
        if (s.room) addPoli(s.room);
      });
    });

    return list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [poliklinikList, doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (doc.status === 'inactive') return false;
      const hasActive = (doc.schedules || []).some(s => (s.status || 'active') === 'active');
      if (!hasActive) return false;

      const matchKeyword = !keyword || 
        (doc.name && doc.name.toLowerCase().includes(keyword.toLowerCase())) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(keyword.toLowerCase())) ||
        (doc.subSpecialty && doc.subSpecialty.toLowerCase().includes(keyword.toLowerCase()));

      const matchSpecialty = matchDoctorPoliklinik(doc, selectedSpecialty);
      const matchDay = matchDayDoctor(doc, selectedDay);

      return matchKeyword && matchSpecialty && matchDay;
    });
  }, [doctors, keyword, selectedSpecialty, selectedDay]);

  const handleReset = () => {
    setKeyword('');
    setSelectedSpecialty('');
    setSelectedDay('');
    onResetFilter();
  };

  return (
    <section id="dokter" className="section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-header-top-row">
            <div className="section-tag">
              <UserCheck size={14} />
              <span>Dokter Spesialis &amp; Jaga</span>
            </div>
          </div>
          <h2 className="section-title">Dokter Kami & Jadwal Praktik ({doctors.length} Dokter)</h2>
          <p className="section-subtitle">
            Pilih dari tim dokter spesialis dan dokter jaga terpercaya Naray Hospital yang berdedikasi memberikan perawatan terbaik dengan sepenuh hati (Serve With Heart).
          </p>
        </div>

        {/* Live Filter Bar */}
        <div className="doctor-filter-box glass-card">
          <div className="filter-header-bar">
            <div className="filter-title">
              <Filter size={18} className="icon-teal" />
              <span>Filter Pencarian Dokter & Jadwal</span>
            </div>
            {(keyword || selectedSpecialty || selectedDay) && (
              <button className="reset-filter-btn" onClick={handleReset}>
                Reset Filter
              </button>
            )}
          </div>

          <div className="filter-controls-grid">
            <div className="filter-field">
              <label>Cari Nama Dokter / Keluhan</label>
              <div className="filter-input-wrap">
                <Search size={16} className="filter-icon" />
                <input 
                  type="text" 
                  placeholder="Ketik nama dokter atau spesialis..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Poliklinik Spesialis</label>
              <select 
                value={selectedSpecialty} 
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Poliklinik</option>
                {poliklinikOptions.map((p) => (
                  <option key={p.id || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Hari Praktik</label>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Hari</option>
                {daysList.map((d, idx) => (
                  <option key={idx} value={d}>Hari {d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="doctor-results-bar">
          <span>Menampilkan <strong>{filteredDoctors.length}</strong> Dokter Spesialis & Jaga Tersedia</span>
        </div>

        {/* Doctor Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="doctor-grid">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="doctor-card glass-card card-hover">

                {/* Doctor Photo & Badges */}
                <div className="doctor-card-top">
                  <div className="doctor-img-wrap">
                    <img src={doc.photo} alt={doc.name} className="doctor-img" />
                    <div className="doctor-rating-badge">
                      <Star size={13} fill="#D4AF37" color="#D4AF37" />
                      <span>{doc.rating}</span>
                      <small>({doc.reviewCount})</small>
                    </div>
                  </div>

                  <div className="doctor-meta">
                    <div className="doctor-meta-badges">
                      <span className="badge-tag badge-teal">
                        {typeof doc.specialtyGroup === 'object' ? (doc.specialtyGroup?.name || 'Spesialis') : (doc.specialtyGroup || 'Spesialis')}
                      </span>
                      <span className={`doctor-status-badge ${doc.isOnLeave ? 'status-leave' : (doc.isPracticing ? 'status-practicing' : 'status-offduty')}`}>
                        <span className="status-dot" />
                        <span>{doc.isOnLeave ? 'Sedang Cuti' : (doc.isPracticing ? 'Praktik Sesuai Jadwal' : 'Tidak Praktik')}</span>
                      </span>
                    </div>
                    <h3 className="doctor-name">{doc.name}</h3>
                    <p className="doctor-specialty-text">
                      {typeof doc.specialty === 'object' ? (doc.specialty?.name || 'Spesialis') : (doc.specialty || 'Spesialis')}
                    </p>
                    
                    <div className="doctor-branch-tag">
                      <MapPin size={13} />
                      <span>{doc.branchName || 'Naray Hospital Dumai'}</span>
                    </div>

                    <div className="doctor-exp-tag">
                      <Award size={13} className="icon-gold" />
                      <span>{doc.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Schedules Accordion / Preview */}
                <div className={`doctor-schedule-box ${!doc.isPracticing ? 'is-offduty' : ''}`}>
                  <div className="schedule-box-header">
                    <Clock size={14} className="icon-teal" />
                    <span>{doc.isPracticing ? 'Jadwal Praktik Tersedia:' : 'Status Praktik Dokter:'}</span>
                  </div>
                  
                  {!doc.isPracticing ? (
                    <div className="doctor-offduty-notice">
                      <div className={`doctor-offduty-tag ${doc.isOnLeave ? 'tag-leave' : ''}`}>
                        <span className="status-dot" />
                        <span>{doc.isOnLeave ? 'Sedang Dalam Masa Cuti' : 'Sedang Tidak Berpraktik'}</span>
                      </div>
                      <p className="doctor-offduty-desc">
                        {doc.isOnLeave && doc.currentLeave ? (
                          <>
                            Dokter mengambil cuti ({doc.currentLeave.reason || 'Cuti'}) dari{' '}
                            <strong>{new Date(doc.currentLeave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</strong> s/d{' '}
                            <strong>{new Date(doc.currentLeave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.
                            Jadwal di bawah ini adalah sesi rutin saat aktif kembali:
                          </>
                        ) : (
                          'Dokter saat ini sedang tidak melayani rawat jalan di poliklinik. Jadwal berikut adalah sesi rutin saat aktif kembali:'
                        )}
                      </p>
                      <div className="schedule-pills schedule-pills-muted">
                        {(doc.schedules || []).map((sch, idx) => (
                          <div key={idx} className="schedule-pill inactive">
                            <strong>{sch.day}:</strong> {sch.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="schedule-pills">
                      {(doc.schedules || [])
                        .filter(s => (s.status || 'active') === 'active')
                        .map((sch, idx) => (
                          <div key={idx} className="schedule-pill">
                            <strong>{sch.day}:</strong> {sch.time}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="doctor-card-actions">
                  <button 
                    className="btn btn-primary w-full"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
                    onClick={() => onSelectDoctor(doc)}
                  >
                    <Calendar size={15} />
                    <span>{doc.isPracticing ? 'Profil Lengkap & Jadwal Praktik' : 'Lihat Profil & Info Praktik'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="doctor-empty-state glass-card">
            <Stethoscope size={48} className="empty-icon" />
            <h3>Tidak Ada Dokter Ditemukan</h3>
            <p>Silakan coba ubah kata kunci pencarian, poliklinik spesialis, atau hari praktik yang Anda pilih.</p>
            <button className="btn btn-primary mt-4" onClick={handleReset}>
              Lihat Semua Dokter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
