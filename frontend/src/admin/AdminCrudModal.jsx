import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Calendar, Clock, Stethoscope, Check, Plus } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import api from '../services/api';

const DAY_NAME_TO_INT = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
  minggu: 7,
};

const ALL_DAYS = [
  { id: 1, label: 'Senin', short: 'Sen' },
  { id: 2, label: 'Selasa', short: 'Sel' },
  { id: 3, label: 'Rabu', short: 'Rab' },
  { id: 4, label: 'Kamis', short: 'Kam' },
  { id: 5, label: 'Jumat', short: 'Jum' },
  { id: 6, label: 'Sabtu', short: 'Sab' },
  { id: 7, label: 'Minggu', short: 'Min' },
];

export function AdminCrudModal({
  isOpen,
  entity,
  item,
  onClose,
  onSave,
  categories = [],
  specializations = [],
  polikliniks = [],
  onAddSpecialization,
}) {
  const isEdit = Boolean(item && (item.id || item.dbId));
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Add Specialization Micro-Modal State
  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [specError, setSpecError] = useState('');
  const [localSpecs, setLocalSpecs] = useState(specializations);
  const newSpecInputRef = useRef(null);

  // Sinkronkan data opsi spesialisasi dari props ke local state
  useEffect(() => {
    setLocalSpecs(specializations);
  }, [specializations]);

  // Reset saat modal ditutup atau entitas berganti
  useEffect(() => {
    if (!isOpen) {
      setShowAddSpecModal(false);
      setNewSpecName('');
      setSpecError('');
    }
  }, [isOpen, entity]);

  // Otomatis fokus ke input saat micro-modal dibuka
  useEffect(() => {
    if (showAddSpecModal) {
      const timer = setTimeout(() => {
        newSpecInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [showAddSpecModal]);

  // Initialize form based on entity & item
  useEffect(() => {
    if (item) {
      let initialPracticeDays = [];
      if (Array.isArray(item.practiceDays) && item.practiceDays.length > 0) {
        initialPracticeDays = item.practiceDays;
      } else if (Array.isArray(item.availableDays) && item.availableDays.length > 0) {
        initialPracticeDays = item.availableDays
          .map(d => DAY_NAME_TO_INT[d.toLowerCase()])
          .filter(Boolean);
      } else {
        initialPracticeDays = [1, 2, 3, 4, 5];
      }

      setFormData({
        ...item,
        category: typeof item.category === 'object' ? (item.category?.name || '') : (item.category || ''),
        category_id: Number(item.category_id || (typeof item.category === 'object' ? item.category?.id : 1) || 1),
        specialization_id: Number(item.specialization_id || item.specialization?.id || 1),
        practice_days: initialPracticeDays,
        start_time: item.practiceStartTime || item.start_time || '09:00',
        end_time: item.practiceEndTime || item.end_time || '14:00',
        poliklinik_id: item.poliklinik_id || item.assignedPoliId || (polikliniks[0]?.dbId || polikliniks[0]?.id || 1),
        capacity: item.capacity || item.bed_count || '',
        itemsText: Array.isArray(item.items) ? item.items.join('\n') : '',
        facilitiesText: Array.isArray(item.facilities) ? item.facilities.join('\n') : '',
      });
    } else {
      // Default empty templates
      const defaults = {
        article: { title: '', category_id: 1, thumbnail_url: '', excerpt: '', content: '', status: 'published' },
        doctor: {
          name: '',
          specialization_id: 1,
          poliklinik_id: polikliniks[0]?.dbId || polikliniks[0]?.id || 1,
          practice_days: [1, 2, 3, 4, 5],
          start_time: '09:00',
          end_time: '14:00',
          phone: '',
          email: '',
          photo_url: '',
          bio: '',
          status: 'active'
        },
        poliklinik: { name: '', description: '', image_url: '', status: 'active' },
        mcu: { name: '', badge: '', price: '', duration: '2 - 3 Jam', target: '', highlight: '', itemsText: '', status: 'active' },
        room: { name: '', capacity: '1 - 2 Pasien per Kamar', price: '', description: '', image_url: '', facilitiesText: '', status: 'active' },
        facility: { name: '', type: 'advanced', description: '', image_url: '', status: 'active' },
        center: { name: '', tagline: '', description: '', image_url: '', status: 'active' },
        media: { title: '', type: 'image', url: '', description: '', category: 'Kegiatan Naray', status: 'active' },
        gallery: { title: '', type: 'image', url: '', description: '', category: 'Kegiatan Naray', status: 'active' },
        video: { title: '', type: 'video', url: '', description: '', category: 'Edukasi Naray', status: 'active' },
        banner: {
          badge: 'Akreditasi Paripurna KARS',
          badgeType: 'primary',
          title: '',
          highlight: '',
          description: '',
          ctaPrimary: 'Lihat Jadwal Dokter',
          ctaSecondary: 'Lihat 13 Poliklinik',
          targetSection: 'poliklinik',
          image: '/images/default-image.svg',
          status: 'active'
        },
      };
      setFormData(defaults[entity] || { name: '', description: '', status: 'active' });
    }
    setError('');
  }, [entity, item, isOpen, polikliniks]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Jika admin memilih opsi 'Tambah Baru' dari select dropdown
    if (name === 'specialization_id' && value === '__NEW__') {
      setShowAddSpecModal(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: (name === 'specialization_id' || name === 'poliklinik_id' || name === 'category_id' || name === 'branch_id')
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  // Handler untuk menyimpan spesialisasi baru langsung ke database MySQL
  const handleQuickAddSpecialization = async () => {
    const trimmed = newSpecName.trim();
    if (!trimmed) {
      setSpecError('Ketik nama spesialisasi terlebih dahulu.');
      return;
    }

    setIsAddingSpec(true);
    setSpecError('');

    try {
      let createdSpec = null;

      if (typeof onAddSpecialization === 'function') {
        const res = await onAddSpecialization(trimmed);
        if (res && res.success && res.data) {
          createdSpec = res.data;
        } else {
          throw new Error(res?.message || 'Gagal menambahkan spesialisasi.');
        }
      } else {
        const res = await api.adminCreateSpecialization({ name: trimmed });
        if (res && (res.data || res.success)) {
          createdSpec = res.data;
        } else {
          throw new Error(res?.message || 'Gagal menambahkan spesialisasi.');
        }
      }

      if (createdSpec && createdSpec.id) {
        const numericId = Number(createdSpec.id);
        // Perbarui list spesialisasi lokal agar opsi baru langsung muncul di dropdown
        setLocalSpecs(prev => {
          const list = Array.isArray(prev) ? prev : [];
          const exists = list.some(s => Number(s.id) === numericId);
          if (exists) {
            return list.map(s => Number(s.id) === numericId ? { ...s, ...createdSpec } : s);
          }
          return [...list, createdSpec].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });

        // Otomatis pilih spesialisasi yang baru dibuat pada formulir dokter
        setFormData(prev => ({
          ...prev,
          specialization_id: numericId
        }));

        setNewSpecName('');
        setSpecError('');
        setShowAddSpecModal(false);
      }
    } catch (err) {
      setSpecError(err.message || 'Gagal menyimpan spesialisasi ke database.');
    } finally {
      setIsAddingSpec(false);
    }
  };

  const handleToggleDay = (dayId) => {
    setFormData(prev => {
      const current = Array.isArray(prev.practice_days) ? [...prev.practice_days] : [];
      const index = current.indexOf(dayId);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(dayId);
        current.sort((a, b) => a - b);
      }
      return { ...prev, practice_days: current };
    });
  };

  const handleSetDayPreset = (preset) => {
    let days = [];
    if (preset === 'weekdays') days = [1, 2, 3, 4, 5];
    else if (preset === 'mon_sat') days = [1, 2, 3, 4, 5, 6];
    else if (preset === 'everyday') days = [1, 2, 3, 4, 5, 6, 7];
    else if (preset === 'clear') days = [];
    setFormData(prev => ({ ...prev, practice_days: days }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };

      // Process newline-separated text for MCU items and Room facilities
      if (entity === 'mcu' && payload.itemsText !== undefined) {
        payload.items = payload.itemsText.split('\n').map(s => s.trim()).filter(Boolean);
        delete payload.itemsText;
      }
      if (entity === 'room' && payload.facilitiesText !== undefined) {
        payload.facilities = payload.facilitiesText.split('\n').map(s => s.trim()).filter(Boolean);
        delete payload.facilitiesText;
      }
      if (entity === 'banner') {
        payload.image = payload.image || payload.image_url || '/images/default-image.svg';
        payload.image_url = payload.image;
      }

      await onSave(payload, entity, item?.id, item?.dbId);
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Gagal menyimpan data ke database.');
    }
  };

  const getEntityTitle = () => {
    const names = {
      article: 'Artikel / Berita',
      doctor: 'Dokter',
      poliklinik: 'Poliklinik',
      mcu: 'Paket MCU',
      room: 'Tipe Kamar',
      facility: 'Fasilitas / Layanan',
      center: 'Pusat Unggulan (Center of Excellence)',
      media: 'Galeri & Video Dokumentasi',
      gallery: 'Foto Kegiatan / Galeri',
      video: 'Video Dokumentasi',
      banner: 'Slide Banner Beranda',
    };
    return names[entity] || 'Data';
  };

  return (
    <>
      <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container glass-card" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">
              {isEdit ? `Ubah Data ${getEntityTitle()}` : `Tambah ${getEntityTitle()} Baru`}
            </h3>
            <p className="admin-modal-subtitle">
              {isEdit ? 'Perbarui informasi dan simpan langsung ke database MySQL.' : 'Lengkapi formulir untuk menambahkan data baru ke sistem.'}
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="admin-modal-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-fields-grid">

            {/* ── ARTIKEL FIELDS ── */}
            {entity === 'article' && (
              <>
                <div className="admin-form-full">
                  <label>Judul Artikel <span className="req">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Pentingnya Menjaga Pola Hidup Sehat untuk Jantung"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Kategori Artikel</label>
                  <select
                    name="category_id"
                    value={formData.category_id || 1}
                    onChange={handleChange}
                  >
                    {categories.length > 0 ? (
                      categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      <>
                        <option value={1}>Edukasi Kesehatan</option>
                        <option value={2}>Penyakit Dalam &amp; Jantung</option>
                        <option value={3}>Ibu &amp; Anak</option>
                        <option value={4}>Tips Pola Makan &amp; Nutrisi</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="admin-form-half">
                  <label>Status Publikasi</label>
                  <select
                    name="status"
                    value={formData.status || 'published'}
                    onChange={handleChange}
                  >
                    <option value="published">Tayang (Published)</option>
                    <option value="draft">Draf (Draft)</option>
                  </select>
                </div>

                <div className="admin-form-full">
                  <label>Penulis / Dokter Narasumber</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author || ''}
                    onChange={handleChange}
                    placeholder="Contoh: dr. Anita Rahmawati, Sp.JP / Humas Naray Hospital"
                  />
                </div>

                <ImageUploadField
                  label="Unggah Gambar / Thumbnail Artikel"
                  value={formData.thumbnail_url || formData.image || ''}
                  folder="articles"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, thumbnail_url: uploadedUrl, image: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Otomatis dikompresi menjadi WebP super ringan & aman."
                />

                <div className="admin-form-full">
                  <label>Ringkasan Singkat (Excerpt)</label>
                  <textarea
                    rows={2}
                    name="excerpt"
                    value={formData.excerpt || ''}
                    onChange={handleChange}
                    placeholder="Ringkasan 1-2 kalimat untuk preview di kartu..."
                  />
                </div>

                <div className="admin-form-full">
                  <label>Isi Lengkap Artikel <span className="req">*</span></label>
                  <textarea
                    rows={6}
                    name="content"
                    value={formData.content || ''}
                    onChange={handleChange}
                    placeholder="Tulis artikel kesehatan selengkapnya di sini..."
                    required
                  />
                </div>
              </>
            )}

            {/* ── DOKTER FIELDS ── */}
            {entity === 'doctor' && (
              <>
                <div className="admin-form-full">
                  <label>Nama Lengkap &amp; Gelar Dokter <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Contoh: dr. Rizka Nadia, Sp.PD"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <div className="flex items-center justify-between">
                    <label>Spesialisasi <span className="req">*</span></label>
                    <button
                      type="button"
                      onClick={() => setShowAddSpecModal(true)}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Tambah Baru</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      name="specialization_id"
                      value={formData.specialization_id || (localSpecs[0]?.id || 1)}
                      onChange={handleChange}
                    >
                      {localSpecs.length > 0 ? (
                        localSpecs.map(s => <option key={s.id} value={Number(s.id)}>{s.name}</option>)
                      ) : (
                        <>
                          <option value={1}>UGD &amp; Dokter Umum</option>
                          <option value={2}>Penyakit Dalam</option>
                          <option value={3}>Gigi &amp; Mulut</option>
                          <option value={4}>Paru &amp; Pernapasan</option>
                          <option value={5}>Kulit &amp; Kelamin</option>
                          <option value={6}>THT-KL</option>
                          <option value={7}>Anak &amp; Pediatrik</option>
                          <option value={8}>Bedah</option>
                          <option value={9}>Mata</option>
                          <option value={10}>Kebidanan &amp; Kandungan</option>
                          <option value={11}>Jantung &amp; Pembuluh Darah</option>
                          <option value={12}>Saraf &amp; Neurologi</option>
                          <option value={13}>Psikiatri &amp; Jiwa</option>
                          <option value={14}>Geriatri &amp; Rehabilitasi</option>
                        </>
                      )}
                      <option value="__NEW__">+ Tambah Spesialisasi Baru...</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddSpecModal(true)}
                      title="Tambah Spesialisasi Baru Langsung"
                      className="px-3 py-2.5 bg-teal-50 hover:bg-teal-100/90 active:bg-teal-200/80 border border-teal-200 text-teal-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 hover:shadow-xs active:scale-95"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Baru</span>
                    </button>
                  </div>
                </div>

                <div className="admin-form-half">
                  <label>Status Praktik Dokter <span className="req">*</span></label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Praktik (Aktif Melayani Pasien)</option>
                    <option value="inactive">Tidak Praktik (Sedang Cuti / Libur)</option>
                  </select>
                </div>

                <div className="admin-form-half">
                  <label>Nomor Telepon / WhatsApp Konsultasi</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+62 811-xxxx-xxxx"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Email Dokter</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="dokter@narayhospital.com"
                  />
                </div>

                <ImageUploadField
                  label="Unggah Foto Profil Dokter"
                  value={formData.photo_url || formData.photo || ''}
                  folder="doctors"
                  isRound={true}
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, photo_url: uploadedUrl, photo: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis rasio 1:1 aman untuk profil dokter."
                />

                <div className="admin-form-full">
                  <label>Biografi, Pendidikan &amp; Sub-Spesialisasi</label>
                  <textarea
                    rows={4}
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Dokter spesialis penyakit dalam berpengalaman dengan fokus pada hipertensi, diabetes, dan penyakit metabolik..."
                  />
                </div>

                {/* ── Pemberitahuan Jadwal Praktik Mandiri ── */}
                <div className="admin-form-full admin-schedule-notice-banner">
                  <div className="schedule-notice-icon-box">
                    <Calendar size={22} color="#078F83" />
                  </div>
                  <div className="schedule-notice-text-content">
                    <div className="schedule-notice-heading">Pengaturan Jadwal Dokter Telah Dipisahkan</div>
                    <p className="schedule-notice-desc">
                      Untuk kemudahan dan fleksibilitas pengaturan sesi praktik (hari, jam, dan poliklinik), jadwal dokter kini dikelola secara mandiri pada menu khusus <strong>"Jadwal Dokter"</strong> di sidebar admin.
                    </p>
                    {item?.schedules?.length > 0 && (
                      <div className="schedule-notice-tag">
                        📌 Dokter ini memiliki <strong>{item.schedules.length} slot jadwal aktif</strong> di sistem.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── POLIKLINIK FIELDS ── */}
            {entity === 'poliklinik' && (
              <>
                <div className="admin-form-full">
                  <label>Nama Poliklinik <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Poliklinik Penyakit Dalam"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Buka / Aktif</option>
                    <option value="inactive">Tutup Sementara</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Unggah Foto / Ilustrasi Poliklinik"
                  value={formData.image_url || formData.image || ''}
                  folder="facilities"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, image_url: uploadedUrl, image: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan & aman."
                />

                <div className="admin-form-full">
                  <label>Deskripsi &amp; Layanan Poliklinik</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description || formData.desc || ''}
                    onChange={handleChange}
                    placeholder="Layanan medis dan konsultasi yang disediakan pada poli ini..."
                  />
                </div>
              </>
            )}

            {/* ── MCU PACKAGE FIELDS ── */}
            {entity === 'mcu' && (
              <>
                <div className="admin-form-full">
                  <label>Nama Paket MCU <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Paket Deteksi Dini Jantung Naray"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Badge / Label Unggulan</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Rekomendasi Spesialis Jantung"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Tarif Paket (Rp) <span className="req">*</span></label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 2100000"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Estimasi Durasi</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 2 - 3 Jam"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Target Pasien</label>
                  <input
                    type="text"
                    name="target"
                    value={formData.target || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Pria &amp; Wanita (Usia 18 - 50 Tahun)"
                  />
                </div>

                <div className="admin-form-full">
                  <label>Ringkasan Pemeriksaan (Highlight)</label>
                  <input
                    type="text"
                    name="highlight"
                    value={formData.highlight || ''}
                    onChange={handleChange}
                    placeholder="Pemeriksaan fungsi organ vital, kadar gula darah, kolesterol..."
                  />
                </div>

                <div className="admin-form-full">
                  <label>Daftar Item Pemeriksaan (1 baris per item)</label>
                  <textarea
                    rows={6}
                    name="itemsText"
                    value={formData.itemsText || ''}
                    onChange={handleChange}
                    placeholder="Pemeriksaan Fisik oleh Dokter Spesialis&#10;Hematologi Rutin Lengkap&#10;Profil Lemak Lengkap&#10;Elektrokardiogram (EKG)"
                  />
                </div>
              </>
            )}

            {/* ── ROOM FIELDS ── */}
            {entity === 'room' && (
              <>
                <div className="admin-form-half">
                  <label>Nama Tipe Kamar <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Pistillum Suite (VVIP)"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Kapasitas Bed / Pasien <span className="req">*</span></label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 1 Pasien per Kamar atau 2 Bed Pasien"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Tarif per Malam (Rp) <span className="req">*</span></label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price || formData.price_per_night || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 1850000"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Status Ketersediaan</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Tersedia / Aktif</option>
                    <option value="inactive">Pemeliharaan / Tutup</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Unggah Foto Tipe Kamar Rawat Inap"
                  value={formData.image_url || formData.image || ''}
                  folder="rooms"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, image_url: uploadedUrl, image: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Foto fasilitas kamar dikompresi ringan & aman."
                />

                <div className="admin-form-full">
                  <label>Deskripsi Fasilitas Kamar</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Kamar rawat inap privat berdesain elegan dengan kenyamanan bintang lima..."
                  />
                </div>

                <div className="admin-form-full">
                  <label>Daftar Fasilitas Utama (1 baris per item)</label>
                  <textarea
                    rows={4}
                    name="facilitiesText"
                    value={formData.facilitiesText || ''}
                    onChange={handleChange}
                    placeholder="1 Pasien per Kamar (Private)&#10;Sofa Bed Penunggu&#10;Smart TV 50 inch&#10;Kamar Mandi Air Hangat Pribadi"
                  />
                </div>
              </>
            )}

            {/* ── FACILITY FIELDS ── */}
            {entity === 'facility' && (
              <>
                <div className="admin-form-full">
                  <label>Nama Fasilitas / Layanan Medis <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Unit Hemodialisa (Cuci Darah)"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Kategori Layanan</label>
                  <select
                    name="type"
                    value={formData.type || 'advanced'}
                    onChange={handleChange}
                  >
                    <option value="advanced">Layanan Unggulan (Advanced)</option>
                    <option value="basic">Fasilitas Standar / Penunjang</option>
                  </select>
                </div>

                <div className="admin-form-half">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Siaga 24 Jam / Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Unggah Foto Fasilitas / Layanan Medis"
                  value={formData.image_url || formData.image || ''}
                  folder="facilities"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, image_url: uploadedUrl, image: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis aman tanpa celah skrip."
                />

                <div className="admin-form-full">
                  <label>Deskripsi Layanan &amp; Peralatan Medis</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Pusat cuci darah berstandar internasional dengan mesin dialisis modern..."
                  />
                </div>
              </>
            )}

            {/* ── CENTER OF EXCELLENCE FIELDS ── */}
            {entity === 'center' && (
              <>
                <div className="admin-form-full">
                  <label>Nama Pusat Unggulan <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || formData.title || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Naray Heart & Vascular Center"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Slogan / Tagline Unggulan</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Pusat Rujukan Penyakit Jantung Komprehensif"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Aktif / Beroperasi</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Unggah Foto / Banner Pusat Unggulan"
                  value={formData.image_url || formData.image || ''}
                  folder="centers"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, image_url: uploadedUrl, image: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Banner resolusi tinggi otomatis dikompresi ringan & aman."
                />

                <div className="admin-form-full">
                  <label>Deskripsi &amp; Cakupan Layanan</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Deskripsi spesialisasi, teknologi pendukung, dan pelayanan..."
                  />
                </div>
              </>
            )}

            {/* ── MEDIA / GALLERY / VIDEO FIELDS ── */}
            {(entity === 'media' || entity === 'gallery' || entity === 'video') && (
              <>
                <div className="admin-form-full">
                  <label>Judul Dokumentasi / Kegiatan <span className="req">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Peresmian Layanan Poliklinik Eksekutif"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Tipe Media <span className="req">*</span></label>
                  <select
                    name="type"
                    value={formData.type || (entity === 'video' ? 'video' : 'image')}
                    onChange={handleChange}
                  >
                    <option value="image">Foto Kegiatan (Gambar)</option>
                    <option value="video">Video YouTube (Dokumentasi / Edukasi)</option>
                  </select>
                </div>

                <div className="admin-form-half">
                  <label>Status Tampil</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Aktif / Tampil di Website</option>
                    <option value="inactive">Nonaktif / Arsip</option>
                  </select>
                </div>

                <div className="admin-form-full">
                  <label>Kategori Kegiatan</label>
                  <input
                    type="text"
                    name="category"
                    value={typeof formData.category === 'object' ? (formData.category?.name || '') : (formData.category || formData.category_name || '')}
                    onChange={handleChange}
                    placeholder="Contoh: Kegiatan Naray, Fasilitas & Layanan, Edukasi Medis, Bakti Sosial"
                  />
                </div>

                {(formData.type === 'video' || entity === 'video') ? (
                  <>
                    <div className="admin-form-full">
                      <label>Link Video YouTube (Watch / Embed URL) <span className="req">*</span></label>
                      <input
                        type="text"
                        name="url"
                        value={formData.url || formData.youtubeEmbed || ''}
                        onChange={handleChange}
                        placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                        required
                      />
                      {(formData.url || formData.youtubeEmbed) && (
                        <div style={{ marginTop: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: '600', color: '#078F83', marginRight: '6px' }}>Link Terdaftar:</span>
                          <a href={formData.url || formData.youtubeEmbed} target="_blank" rel="noreferrer" style={{ color: '#2563EB', wordBreak: 'break-all' }}>
                            {formData.url || formData.youtubeEmbed}
                          </a>
                        </div>
                      )}
                    </div>

                    <ImageUploadField
                      label="Unggah Thumbnail Kustom Video (Opsional)"
                      value={formData.thumbnail_url || formData.image || ''}
                      folder="media"
                      onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, thumbnail_url: uploadedUrl, image: uploadedUrl }))}
                      helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP ringan untuk sampul video."
                    />
                  </>
                ) : (
                  <ImageUploadField
                    label="Unggah Foto Kegiatan / Dokumentasi"
                    value={formData.url || formData.image || ''}
                    folder="media"
                    required={true}
                    onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, url: uploadedUrl, image: uploadedUrl }))}
                    helperText="Format: JPG, PNG, WEBP. Otomatis dikompresi menjadi WebP super ringan & aman."
                  />
                )}

                <div className="admin-form-full">
                  <label>Deskripsi Singkat Kegiatan</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description || formData.desc || ''}
                    onChange={handleChange}
                    placeholder="Tuliskan keterangan singkat mengenai kegiatan, narasumber, atau konteks dokumentasi..."
                  />
                </div>
              </>
            )}

            {/* ── BANNER SLIDE FIELDS ── */}
            {entity === 'banner' && (
              <>
                <div className="admin-form-half">
                  <label>Teks Badge / Label Kecil <span className="req">*</span></label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Akreditasi Paripurna KARS"
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Gaya &amp; Warna Badge</label>
                  <select
                    name="badgeType"
                    value={formData.badgeType || 'primary'}
                    onChange={handleChange}
                  >
                    <option value="primary">Standar / Medis (Hijau Toska)</option>
                    <option value="emergency">Kegawatdaruratan (Merah UGD)</option>
                  </select>
                </div>

                <div className="admin-form-full">
                  <label>Judul Utama Slide Banner <span className="req">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Pelayanan Medis Spesialis dan Rawat Inap Terpadu di Dumai"
                    required
                  />
                </div>

                <div className="admin-form-full">
                  <label>Sub-Judul / Sorotan (Highlight)</label>
                  <input
                    type="text"
                    name="highlight"
                    value={formData.highlight || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Didukung 19 Dokter Spesialis dan Fasilitas Diagnostik Lengkap"
                  />
                </div>

                <div className="admin-form-full">
                  <label>Deskripsi Lengkap Slide <span className="req">*</span></label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Tuliskan penjelasan layanan atau pesan untuk pengunjung rumah sakit..."
                    required
                  />
                </div>

                <div className="admin-form-half">
                  <label>Teks Tombol Aksi Utama (CTA 1)</label>
                  <input
                    type="text"
                    name="ctaPrimary"
                    value={formData.ctaPrimary || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Lihat Jadwal Dokter atau Hubungi UGD 24 Jam"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Teks Tombol Aksi Sekunder (CTA 2)</label>
                  <input
                    type="text"
                    name="ctaSecondary"
                    value={formData.ctaSecondary || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Lihat 13 Poliklinik"
                  />
                </div>

                <div className="admin-form-half">
                  <label>Arah Scroll Tombol Sekunder (Target Section)</label>
                  <select
                    name="targetSection"
                    value={formData.targetSection || 'poliklinik'}
                    onChange={handleChange}
                  >
                    <option value="poliklinik">Poliklinik Spesialis</option>
                    <option value="dokter">Jadwal &amp; Data Dokter</option>
                    <option value="rawat-inap">Kamar Rawat Inap</option>
                    <option value="mcu">Paket Medical Check Up (MCU)</option>
                    <option value="fasilitas">Fasilitas &amp; Layanan Medis</option>
                    <option value="artikel">Berita &amp; Artikel Kesehatan</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Unggah Gambar Latar Belakang Slide (Banner)"
                  value={formData.image || formData.image_url || ''}
                  folder="banners"
                  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, image: uploadedUrl, image_url: uploadedUrl }))}
                  helperText="Format: JPG, PNG, WEBP. Kompresi otomatis WebP modern. Rekomendasi rasio lanskap 16:9."
                />
              </>
            )}

          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-save-crud" disabled={loading}>
              {loading ? (
                <span className="admin-spinner-small" />
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Data Baru'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>

      {/* ── Micro-Modal Tambah Spesialisasi Baru Langsung ── */}
      {showAddSpecModal && (
        <div
          className="fixed inset-0 z-[10050] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => { if (!isAddingSpec) { setShowAddSpecModal(false); setSpecError(''); } }}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 leading-tight">
                    Tambah Spesialisasi Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tersimpan langsung ke database dan otomatis terpilih
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isAddingSpec}
                onClick={() => { setShowAddSpecModal(false); setSpecError(''); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {specError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{specError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Spesialisasi <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={newSpecInputRef}
                  type="text"
                  value={newSpecName}
                  onChange={(e) => {
                    setNewSpecName(e.target.value);
                    if (specError) setSpecError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAddSpecialization();
                    }
                  }}
                  placeholder="Contoh: Spesialis Bedah Onkologi / Sp.B(K)Onk"
                  disabled={isAddingSpec}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Ketik nama gelar atau sub-spesialis dokter yang akan ditambahkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowAddSpecModal(false); setSpecError(''); }}
                disabled={isAddingSpec}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleQuickAddSpecialization}
                disabled={isAddingSpec || !newSpecName.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAddingSpec ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Simpan &amp; Pilih</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
