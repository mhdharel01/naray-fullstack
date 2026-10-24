import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Calendar,
  Layers,
  BedDouble,
  Package,
  FileText,
  Video
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import ImageUploadField from '../admin/ImageUploadField';

export function AdminEditModal({ editState, onClose, onShowToast }) {
  const { saveItem } = useHospitalData();

  // editState format: { type: 'poliklinik'|'doctor'|'center'|'facility'|'room'|'package'|'gallery'|'video'|'article', item: object, isNew: boolean }
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editState && editState.item) {
      setFormData({ ...editState.item });
    } else {
      setFormData({});
    }
  }, [editState]);

  if (!editState) return null;

  const { type, isNew } = editState;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // List field helper (newline separated or array)
  const handleListChange = (field, text) => {
    const arr = text.split('\n').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [field]: arr
    }));
  };

  // Schedule helper for doctors
  const handleAddSchedule = () => {
    const curr = formData.schedules || [];
    setFormData(prev => ({
      ...prev,
      schedules: [...curr, { day: 'Senin - Jumat', time: '09:00 - 14:00 WIB', room: 'Poliklinik Naray' }]
    }));
  };

  const handleUpdateSchedule = (index, field, value) => {
    const curr = [...(formData.schedules || [])];
    if (curr[index]) {
      curr[index] = { ...curr[index], [field]: value };
      setFormData(prev => ({ ...prev, schedules: curr }));
    }
  };

  const handleRemoveSchedule = (index) => {
    const curr = [...(formData.schedules || [])];
    curr.splice(index, 1);
    setFormData(prev => ({ ...prev, schedules: curr }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveItem(type, { ...formData, isNew });
    if (onShowToast) {
      const labelMap = {
        poliklinik: 'Poliklinik',
        doctor: 'Dokter & Jadwal',
        center: 'Pusat Unggulan Medis',
        facility: 'Fasilitas Medis',
        room: 'Kamar Rawat Inap',
        package: 'Paket MCU',
        gallery: 'Galeri Foto',
        video: 'Video Dokumentasi',
        article: 'Berita & Artikel'
      };
      onShowToast(`Data ${labelMap[type] || 'konten'} berhasil disimpan!`);
    }
    onClose();
  };

  const getTitle = () => {
    const action = isNew ? 'Tambah' : 'Ubah / Edit';
    switch (type) {
      case 'poliklinik': return `${action} Data Poliklinik`;
      case 'doctor': return `${action} Dokter & Jadwal Praktik`;
      case 'center': return `${action} Pusat Layanan Unggulan`;
      case 'facility': return `${action} Fasilitas Medis Canggih`;
      case 'room': return `${action} Kamar Rawat Inap / ICU`;
      case 'package': return `${action} Paket Medical Check Up (MCU)`;
      case 'gallery': return `${action} Foto Dokumentasi Galeri`;
      case 'video': return `${action} Video Edukasi / YouTube`;
      case 'article': return `${action} Berita & Artikel Kesehatan`;
      default: return `${action} Data Konten`;
    }
  };

  return (
    <div className="modal-backdrop admin-edit-backdrop" onClick={onClose}>
      <div className="admin-edit-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="admin-edit-modal-header">
          <div className="admin-edit-header-title">
            <span className="admin-edit-type-badge">{type.toUpperCase()}</span>
            <h3>{getTitle()}</h3>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="admin-edit-form">
          <div className="admin-edit-fields-scroll">

            {/* ──────── 1. POLIKLINIK FORM ──────── */}
            {type === 'poliklinik' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Poliklinik *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Contoh: Poliklinik Jantung & Pembuluh Darah"
                    required
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Ikon Emoji</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.icon || ''}
                      onChange={e => handleChange('icon', e.target.value)}
                      placeholder="Contoh: 🩺, ❤️, 👶"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">ID Unik (Slug)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.id || ''}
                      onChange={e => handleChange('id', e.target.value)}
                      placeholder="poli-nama-unik"
                      disabled={!isNew}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Deskripsi Layanan *</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.desc || ''}
                    onChange={e => handleChange('desc', e.target.value)}
                    placeholder="Jelaskan cakupan tindakan atau pemeriksaan poliklinik ini..."
                    required
                  />
                </div>
              </>
            )}

            {/* ──────── 2. DOKTER & JADWAL FORM ──────── */}
            {type === 'doctor' && (
              <>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nama Dokter & Gelar *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="dr. Contoh Nama, Sp.PD"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Spesialisasi Resmi *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.specialty || ''}
                      onChange={e => handleChange('specialty', e.target.value)}
                      placeholder="Spesialis Penyakit Dalam"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Grup Poliklinik (Kategori Filter)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.specialtyGroup || ''}
                      onChange={e => handleChange('specialtyGroup', e.target.value)}
                      placeholder="Penyakit Dalam / Anak / Jantung / dll"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Cabang RS</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.branchName || 'Naray Hospital Dumai'}
                      onChange={e => handleChange('branchName', e.target.value)}
                      placeholder="Naray Hospital Dumai"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Sub-Spesialis / Fokus Keahlian</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.subSpecialty || ''}
                    onChange={e => handleChange('subSpecialty', e.target.value)}
                    placeholder="Diabetes, Hipertensi, Endokrinologi, dll"
                  />
                </div>

                <ImageUploadField
                  label="Unggah Foto Dokter"
                  value={formData.photo || ''}
                  folder="doctors"
                  isRound={true}
                  onChange={(uploadedUrl) => handleChange('photo', uploadedUrl)}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis rasio 1:1 aman untuk profil dokter."
                />

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Pengalaman / Posisi</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.experience || ''}
                      onChange={e => handleChange('experience', e.target.value)}
                      placeholder="Dokter Spesialis Senior (10+ Tahun)"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Pendidikan / Almamater</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.education || ''}
                      onChange={e => handleChange('education', e.target.value)}
                      placeholder="Fakultas Kedokteran Universitas..."
                    />
                  </div>
                </div>

                {/* Schedules Manager */}
                <div className="admin-form-group">
                  <div className="admin-schedules-header">
                    <label className="admin-form-label">Jadwal Praktik Dokter</label>
                    <button type="button" className="btn-add-schedule-row" onClick={handleAddSchedule}>
                      <Plus size={14} /> Tambah Jam Praktik
                    </button>
                  </div>

                  <div className="admin-schedules-list">
                    {(formData.schedules || []).map((sch, sIdx) => (
                      <div key={sIdx} className="admin-schedule-edit-row">
                        <input
                          type="text"
                          className="admin-form-input schedule-day"
                          value={sch.day || ''}
                          onChange={e => handleUpdateSchedule(sIdx, 'day', e.target.value)}
                          placeholder="Hari (e.g. Senin, Rabu)"
                        />
                        <input
                          type="text"
                          className="admin-form-input schedule-time"
                          value={sch.time || ''}
                          onChange={e => handleUpdateSchedule(sIdx, 'time', e.target.value)}
                          placeholder="Jam (e.g. 09:00 - 13:00 WIB)"
                        />
                        <input
                          type="text"
                          className="admin-form-input schedule-room"
                          value={sch.room || ''}
                          onChange={e => handleUpdateSchedule(sIdx, 'room', e.target.value)}
                          placeholder="Ruangan (e.g. R. 102)"
                        />
                        <button
                          type="button"
                          className="admin-btn-delete-row"
                          onClick={() => handleRemoveSchedule(sIdx)}
                          title="Hapus baris jadwal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(!formData.schedules || formData.schedules.length === 0) && (
                      <p className="admin-empty-helper">Belum ada jadwal praktik. Klik tombol '+ Tambah Jam Praktik' di atas.</p>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Biografi Singkat</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.bio || ''}
                    onChange={e => handleChange('bio', e.target.value)}
                    placeholder="Profil singkat dokter dan dedikasi pelayanan pasien..."
                  />
                </div>
              </>
            )}

            {/* ──────── 3. LAYANAN MEDIS / CENTERS OF EXCELLENCE FORM ──────── */}
            {type === 'center' && (
              <>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Judul Layanan Unggulan *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.title || ''}
                      onChange={e => handleChange('title', e.target.value)}
                      placeholder="Pusat Jantung & Kardiovaskular"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nama Pendek</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.shortTitle || ''}
                      onChange={e => handleChange('shortTitle', e.target.value)}
                      placeholder="Pusat Jantung"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tagline Layanan</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.tagline || ''}
                    onChange={e => handleChange('tagline', e.target.value)}
                    placeholder="Pemeriksaan Komprehensif & Deteksi Dini..."
                  />
                </div>

                <ImageUploadField
                  label="Unggah Foto Layanan / Pusat Unggulan"
                  value={formData.image || ''}
                  folder="centers"
                  onChange={(uploadedUrl) => handleChange('image', uploadedUrl)}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan & aman."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">Deskripsi Lengkap *</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Uraian keunggulan teknologi dan dokter spesialis pada layanan ini..."
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Daftar Tindakan / Layanan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={4}
                    className="admin-form-textarea font-mono"
                    value={(formData.services || []).join('\n')}
                    onChange={e => handleListChange('services', e.target.value)}
                    placeholder="Konsultasi Spesialis&#10;Pemeriksaan Ekokardiografi&#10;Treadmill Stress Test"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Teknologi & Peralatan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea font-mono"
                    value={(formData.technologies || []).join('\n')}
                    onChange={e => handleListChange('technologies', e.target.value)}
                    placeholder="Ekokardiografi Doppler&#10;Resting ECG 12-Lead"
                  />
                </div>
              </>
            )}

            {/* ──────── 4. FASILITAS MEDIS FORM ──────── */}
            {type === 'facility' && (
              <>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nama Fasilitas Medis *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Unit Gawat Darurat (UGD) 24 Jam"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kategori</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.category || ''}
                      onChange={e => handleChange('category', e.target.value)}
                      placeholder="Gawat Darurat & Trauma"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Unggah Foto Fasilitas Medis"
                  value={formData.image || ''}
                  folder="facilities"
                  onChange={(uploadedUrl) => handleChange('image', uploadedUrl)}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan & aman."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">Deskripsi Fasilitas *</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Jelaskan peralatan dan kapasitas fasilitas medis ini..."
                    required
                  />
                </div>
              </>
            )}

            {/* ──────── 5. KAMAR RAWAT INAP FORM ──────── */}
            {type === 'room' && (
              <>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nama Tipe Kamar *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Pistillum (Presidential Suite / VVIP)"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kapasitas Tempat Tidur</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.capacity || ''}
                      onChange={e => handleChange('capacity', e.target.value)}
                      placeholder="1 Pasien per Kamar"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tag / Slogan Kamar</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.tag || ''}
                    onChange={e => handleChange('tag', e.target.value)}
                    placeholder="Kemewahan Maksimal & Perawatan Personal"
                  />
                </div>

                <ImageUploadField
                  label="Unggah Foto Kamar Rawat Inap"
                  value={formData.image || ''}
                  folder="rooms"
                  onChange={(uploadedUrl) => handleChange('image', uploadedUrl)}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan & aman."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Daftar Fasilitas & Keunggulan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={5}
                    className="admin-form-textarea font-mono"
                    value={(formData.features || []).join('\n')}
                    onChange={e => handleListChange('features', e.target.value)}
                    placeholder="1 Bed Pasien Elektrik Otomatis&#10;Sofa Penunggu Nyaman&#10;Smart TV & WiFi&#10;Kamar Mandi Water Heater"
                  />
                </div>
              </>
            )}

            {/* ──────── 6. PAKET MCU FORM ──────── */}
            {type === 'package' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Paket MCU *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Paket Skrining Sehat Naray"
                    required
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Badge Label Promo</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.badge || ''}
                      onChange={e => handleChange('badge', e.target.value)}
                      placeholder="Paling Populer / Layanan Unggulan"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Durasi Pemeriksaan</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.duration || ''}
                      onChange={e => handleChange('duration', e.target.value)}
                      placeholder="1.5 - 2 Jam"
                    />
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Harga Promo / Berlaku *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.price || ''}
                      onChange={e => handleChange('price', e.target.value)}
                      placeholder="Rp 850.000"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Harga Asli (Coret)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.originalPrice || ''}
                      onChange={e => handleChange('originalPrice', e.target.value)}
                      placeholder="Rp 1.150.000"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Target Pasien</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.target || ''}
                    onChange={e => handleChange('target', e.target.value)}
                    placeholder="Pria & Wanita (Usia 18 - 50 Tahun)"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Highlight / Ringkasan</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.highlight || ''}
                    onChange={e => handleChange('highlight', e.target.value)}
                    placeholder="Pemeriksaan dasar kesehatan untuk deteksi dini penyakit..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Daftar Item Pemeriksaan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={5}
                    className="admin-form-textarea font-mono"
                    value={(formData.items || []).join('\n')}
                    onChange={e => handleListChange('items', e.target.value)}
                    placeholder="Konsultasi Dokter Umum&#10;Darah Lengkap 18 Parameter&#10;Kolesterol Total & Trigliserida&#10;Foto Rontgen Thorax"
                  />
                </div>
              </>
            )}

            {/* ──────── 7. GALERI FOTO FORM ──────── */}
            {type === 'gallery' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Judul Kegiatan Foto *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Pemeriksaan Kesehatan Gratis..."
                    required
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kategori</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.category || ''}
                      onChange={e => handleChange('category', e.target.value)}
                      placeholder="CSR / Edukasi / Pelayanan"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Tanggal Kegiatan</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.date || ''}
                      onChange={e => handleChange('date', e.target.value)}
                      placeholder="18 Mei 2025"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Unggah Foto Kegiatan / Dokumentasi *"
                  value={formData.image || ''}
                  folder="media"
                  required={true}
                  onChange={(uploadedUrl) => handleChange('image', uploadedUrl)}
                  helperText="Format: JPG, PNG, WEBP. Otomatis dikompresi menjadi WebP super ringan & aman."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">Keterangan / Cerita Kegiatan</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.desc || ''}
                    onChange={e => handleChange('desc', e.target.value)}
                    placeholder="Ceritakan jalannya acara dan antusiasme masyarakat..."
                  />
                </div>
              </>
            )}

            {/* ──────── 8. VIDEO DOKUMENTASI FORM ──────── */}
            {type === 'video' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Judul Video *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Company Profile Naray Hospital..."
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL Embed YouTube *</label>
                  <input
                    type="url"
                    className="admin-form-input font-mono"
                    value={formData.youtubeEmbed || ''}
                    onChange={e => handleChange('youtubeEmbed', e.target.value)}
                    placeholder="https://www.youtube.com/embed/XXXXXX"
                    required
                  />
                  <span className="admin-field-hint">
                    Tips: Gunakan tautan berformat <code>https://www.youtube.com/embed/VIDEO_ID</code>
                  </span>
                </div>

                <ImageUploadField
                  label="Unggah Thumbnail Kustom Video (Opsional)"
                  value={formData.thumbnail_url || formData.image || ''}
                  folder="media"
                  onChange={(uploadedUrl) => {
                    handleChange('thumbnail_url', uploadedUrl);
                    handleChange('image', uploadedUrl);
                  }}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan untuk sampul video."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">Deskripsi Video</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={formData.desc || ''}
                    onChange={e => handleChange('desc', e.target.value)}
                    placeholder="Penjelasan singkat mengenai video dokumentasi ini..."
                  />
                </div>
              </>
            )}

            {/* ──────── 9. BERITA & ARTIKEL FORM ──────── */}
            {type === 'article' && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">Judul Artikel *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Pentingnya Menjaga Pola Makan dan Gula Darah..."
                    required
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kategori Artikel</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.category || ''}
                      onChange={e => handleChange('category', e.target.value)}
                      placeholder="Penyakit Dalam / Jantung / Anak"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Penulis / Dokter</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.author || ''}
                      onChange={e => handleChange('author', e.target.value)}
                      placeholder="dr. Rizka Nadia, Sp.PD"
                    />
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Tanggal Terbit</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.date || ''}
                      onChange={e => handleChange('date', e.target.value)}
                      placeholder="2 September 2026"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Estimasi Baca</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.readTime || ''}
                      onChange={e => handleChange('readTime', e.target.value)}
                      placeholder="4 Menit Baca"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Unggah Gambar / Foto Utama Artikel"
                  value={formData.image || formData.thumbnail_url || ''}
                  folder="articles"
                  onChange={(uploadedUrl) => {
                    handleChange('image', uploadedUrl);
                    handleChange('thumbnail_url', uploadedUrl);
                  }}
                  helperText="Format: JPG, PNG, WEBP. Otomatis dikompresi menjadi WebP super ringan & aman."
                />

                <div className="admin-form-group">
                  <label className="admin-form-label">Ringkasan / Sinopsis Singkat *</label>
                  <textarea
                    rows={2}
                    className="admin-form-textarea"
                    value={formData.summary || ''}
                    onChange={e => handleChange('summary', e.target.value)}
                    placeholder="Ringkasan 1-2 kalimat pengantar artikel..."
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Isi Konten Lengkap Artikel *</label>
                  <textarea
                    rows={6}
                    className="admin-form-textarea"
                    value={formData.content || ''}
                    onChange={e => handleChange('content', e.target.value)}
                    placeholder="Tuliskan isi artikel edukasi kesehatan lengkap di sini..."
                    required
                  />
                </div>
              </>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="admin-edit-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-save-admin-data">
              <Save size={16} />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
