import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  hospitalInfo as fallbackHospitalInfo
} from '../data/hospitalData';

const HospitalDataContext = createContext(null);

const STORAGE_KEYS = {
  IS_ADMIN: 'naray_is_admin',
  ADMIN_TOKEN: 'naray_admin_token',
  ADMIN_USER: 'naray_admin_user',
  ADMIN_CACHED_APPOINTMENTS: 'naray_admin_cached_appointments',
  ADMIN_CACHED_STATS: 'naray_admin_cached_stats',
};

const getStoredData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Gagal membaca data dari localStorage untuk ${key}:`, e);
  }
  return fallback;
};

// Clean up legacy dummy data cached in localStorage
if (typeof window !== 'undefined') {
  [
    'naray_data_poliklinik',
    'naray_data_doctors',
    'naray_data_centers',
    'naray_data_facilities',
    'naray_data_rooms',
    'naray_data_packages',
    'naray_data_gallery',
    'naray_data_videos',
    'naray_data_articles'
  ].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) { }
  });
}

export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
  }
  return import.meta.env.PROD ? '' : 'http://127.0.0.1:8000';
};

export const formatImageUrl = (url, fallback = '/images/default-image.svg') => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const clean = url.trim();
  if (clean.includes('unsplash.com')) return fallback;
  if (clean.includes('t86h6byAPNNbxedD8th6bYZoUF6jevuBwVBObKD6') || clean.includes('qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f')) {
    return fallback;
  }
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }
  const base = getBackendBaseUrl();
  if (clean.startsWith('/storage/')) {
    return `${base}${clean}`;
  }
  if (clean.startsWith('storage/')) {
    return `${base}/${clean}`;
  }
  if (clean.startsWith('/uploads/')) {
    return `${base}/storage${clean}`;
  }
  return clean;
};

export const DEFAULT_SPECIALIZATIONS = [
  { id: 1, name: 'UGD & Dokter Umum', slug: 'ugd-dokter-umum' },
  { id: 2, name: 'Penyakit Dalam', slug: 'penyakit-dalam' },
  { id: 3, name: 'Gigi & Mulut', slug: 'gigi-mulut' },
  { id: 4, name: 'Paru & Pernapasan', slug: 'paru-pernapasan' },
  { id: 5, name: 'Kulit & Kelamin', slug: 'kulit-kelamin' },
  { id: 6, name: 'THT-KL', slug: 'tht-kl' },
  { id: 7, name: 'Anak & Pediatrik', slug: 'anak-pediatrik' },
  { id: 8, name: 'Bedah', slug: 'bedah' },
  { id: 9, name: 'Mata', slug: 'mata' },
  { id: 10, name: 'Kebidanan & Kandungan', slug: 'kebidanan-kandungan' },
  { id: 11, name: 'Jantung & Pembuluh Darah', slug: 'jantung-pembuluh-darah' },
  { id: 12, name: 'Saraf & Neurologi', slug: 'saraf-neurologi' },
  { id: 13, name: 'Psikiatri & Jiwa', slug: 'psikiatri-jiwa' },
  { id: 14, name: 'Geriatri & Rehabilitasi', slug: 'geriatri-rehabilitasi' },
];

export const DEFAULT_BANNER_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Akreditasi Paripurna KARS',
    badgeType: 'primary',
    title: 'Pelayanan Medis Spesialis dan Rawat Inap Terpadu di Dumai',
    highlight: 'Didukung 19 Dokter Spesialis dan Fasilitas Diagnostik Lengkap',
    description: 'Naray Hospital melayani masyarakat Kota Dumai dengan 13 poliklinik spesialis, instalasi gawat darurat 24 jam, serta ruang perawatan berstandar keselamatan pasien Kemenkes RI.',
    ctaPrimary: 'Lihat Jadwal Dokter',
    ctaSecondary: 'Pilihan Kamar Rawat Inap',
    targetSection: 'rawat-inap',
    image: '/images/banners/Bro9UO8SWXZbT9jdPdzY8P9XRzuuQcPtukXsYzbJ.webp'
  },
  {
    id: 'slide-2',
    badge: 'Instalasi Gawat Darurat 24 Jam',
    badgeType: 'emergency',
    title: 'Siaga Tanggap Darurat Medis dan Ambulans 24 Jam',
    highlight: 'Dokter Jaga Bersertifikasi Trauma dan Ruang Resusitasi',
    description: 'Penanganan gawat darurat didukung ruang resusitasi, fasilitas perawatan intensif ICU, serta armada ambulans siaga di kawasan Dumai Barat untuk pertolongan medis segera.',
    ctaPrimary: 'Hubungi UGD 24 Jam',
    ctaSecondary: 'Pilihan Kamar Rawat Inap',
    targetSection: 'rawat-inap',
    isEmergencyPrimary: true,
    image: '/images/discovery/diagnostic-center.jpg'
  },
  {
    id: 'slide-3',
    badge: '19 Dokter Spesialis Tetap',
    badgeType: 'primary',
    title: 'Pemeriksaan Dokter Spesialis Lengkap untuk Keluarga',
    highlight: 'Jadwal Praktik Mingguan dan Rekam Medis Terintegrasi',
    description: 'Layanan konsultasi spesialis jantung, anak, kebidanan dan kandungan, penyakit dalam, paru, hingga bedah dengan sistem antrean teratur dan fasilitas laboratorium 24 jam.',
    ctaPrimary: 'Cari Jadwal Praktik',
    ctaSecondary: 'Pusat Layanan Medis',
    targetSection: 'dokter',
    image: '/images/discovery/mcu-lab.jpg'
  }
];

export const DEFAULT_LEADERSHIP_MESSAGE = {
  name: 'dr. Direktur & Komite Medis',
  title: 'Naray Hospital Kota Dumai, Riau',
  quote: 'Bagi kami, setiap pasien adalah anggota keluarga yang sedang membutuhkan pertolongan. Dokter dan perawat kami hadir tidak hanya membawa keahlian medis, tetapi juga rasa hormat dan empati terhadap kenyamanan pasien selama masa perawatan.',
  badgeTitle: 'Pesan Kepemimpinan Medis',
  badgeSubtitle: 'Dedikasi Pelayanan Kesehatan Kota Dumai',
  image: '/images/doctors/doctor-male-default.jpg'
};

export function HospitalDataProvider({ children }) {
  // 1. Admin Authentication State
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminAppointments, setAdminAppointments] = useState(() => getStoredData(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS, []));
  const [adminDashboardStats, setAdminDashboardStats] = useState(() => getStoredData(STORAGE_KEYS.ADMIN_CACHED_STATS, null));
  const [isLoadingAdminAppointments, setIsLoadingAdminAppointments] = useState(false);

  // 1b. Admin Users & RBAC Management (Super Admin)
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUserStats, setAdminUserStats] = useState(null);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);

  // 2. Data Collections (Murni dari Database Backend & SIMRS - Anti Data Mentah Palsu)
  const [poliklinikList, setPoliklinikList] = useState([]);
  const [specializationsList, setSpecializationsList] = useState(DEFAULT_SPECIALIZATIONS);
  const [doctors, setDoctors] = useState([]);
  const [centersOfExcellence, setCentersOfExcellence] = useState([]);
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [inpatientRooms, setInpatientRooms] = useState([]);
  const [mcuPackages, setMcuPackages] = useState([]);
  const [galleryActivities, setGalleryActivities] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [healthArticles, setHealthArticles] = useState([]);
  const [doctorLeaves, setDoctorLeaves] = useState([]);
  const [simrsBedData, setSimrsBedData] = useState(null);
  const [simrsDoctorSchedules, setSimrsDoctorSchedules] = useState(null);
  const [simrsSurgeryData, setSimrsSurgeryData] = useState(null);
  const [bannerSlides, setBannerSlides] = useState(() => getStoredData('naray_banner_slides', DEFAULT_BANNER_SLIDES));
  const [leadershipMessage, setLeadershipMessage] = useState(() => getStoredData('naray_leadership_message', DEFAULT_LEADERSHIP_MESSAGE));
  const [hospitalInfo, setHospitalInfo] = useState(() => fallbackHospitalInfo);

  // Backend Connection States
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  const DAY_NUM_TO_NAME = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu',
    0: 'Minggu',
  };
  const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const DAY_NAME_TO_NUM = {
    'minggu': 0,
    'senin': 1,
    'selasa': 2,
    'rabu': 3,
    'kamis': 4,
    'jumat': 5,
    'sabtu': 6,
  };

  // Helper untuk mengecek apakah suatu hari spesifik masuk dalam rentang tanggal cuti
  const rangeIncludesDayOfWeek = (startDateStr, endDateStr, targetDayNum) => {
    if (!startDateStr || !endDateStr || targetDayNum === undefined || targetDayNum === null) return false;
    const normalizedTarget = Number(targetDayNum) === 0 ? 7 : Number(targetDayNum);

    const sStr = typeof startDateStr === 'string' ? startDateStr.slice(0, 10) : '';
    const eStr = typeof endDateStr === 'string' ? endDateStr.slice(0, 10) : '';
    if (!sStr || !eStr) return false;

    const start = new Date(sStr + 'T00:00:00');
    const end = new Date(eStr + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays >= 6) return true; // Rentang 7 hari berturut-turut mencakup semua hari dalam seminggu

    const curr = new Date(start);
    while (curr <= end) {
      const jsDay = curr.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      const dayNum = jsDay === 0 ? 7 : jsDay;
      if (dayNum === normalizedTarget) return true;
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };

  // Helper pencocokan nama dokter antara DB dan SIMRS Dekago (Read Only)
  const matchDoctorName = (name1, name2) => {
    if (!name1 || !name2) return false;
    const clean = s => String(s).toLowerCase()
      .replace(/^(dr\.|drg\.|prof\.)/gi, '')
      .replace(/,.*$/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
    const t1 = clean(name1).split(/\s+/).filter(w => w.length >= 3);
    const t2 = clean(name2).split(/\s+/).filter(w => w.length >= 3);
    if (t1.length === 0 || t2.length === 0) return false;
    const common = t1.filter(w => t2.some(x => x.includes(w) || w.includes(x)));
    return common.length >= Math.min(2, Math.min(t1.length, t2.length));
  };

  // Helper Mappers untuk Normalisasi Data Backend ke Format UI
  const mapDoctor = (d, currentSpecs = specializationsList, currentLeaves = doctorLeaves, simrsSchedules = simrsDoctorSchedules) => {
    const rawSchedules = Array.isArray(d.schedules) ? d.schedules : [];
    const activeSchedules = rawSchedules.filter(s => s.status !== 'inactive');
    const practiceDays = activeSchedules.map(s => Number(s.day_of_week)).filter(Boolean);

    const specId = Number(d.specialization_id || d.specialization?.id || 1);
    const lookupList = Array.isArray(currentSpecs) && currentSpecs.length > 0 ? currentSpecs : DEFAULT_SPECIALIZATIONS;
    const specObj = d.specialization || lookupList.find(s => Number(s.id) === specId);
    const specName = specObj?.name || d.specialization?.name || 'Dokter Spesialis';

    // 1. Cek apakah ada jadwal live dari SIMRS Dekago (Read-Only Live Sync)
    let simrsDoctorItems = [];
    if (simrsSchedules && Array.isArray(simrsSchedules.jadwal_dokter)) {
      for (const dayItem of simrsSchedules.jadwal_dokter) {
        const dow = Number(dayItem.day_of_week); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
        const dayNum = dow === 0 ? 7 : dow; // Standarisasi 1=Senin, ..., 7=Minggu
        for (const item of (dayItem.jadwal || [])) {
          if (item.dokter && matchDoctorName(d.name, item.dokter.nama)) {
            simrsDoctorItems.push({
              day_of_week: dayNum,
              raw_dow: dow,
              start_time: item.start_time,
              end_time: item.end_time,
              cuti_simrs: Boolean(item.cuti),
              ruangan: item.ruangan?.nama || 'Poli Spesialis',
              simrs_avatar: item.dokter?.avatar_url
            });
          }
        }
      }
    }

    let availableDays = [];
    let formattedSchedules = [];

    if (simrsDoctorItems.length > 0) {
      // Menggunakan data live SIMRS Dekago
      const dayNums = Array.from(new Set(simrsDoctorItems.map(s => s.day_of_week)))
        .sort((a, b) => a - b);
      availableDays = dayNums.map(num => DAY_NUM_TO_NAME[num]).filter(Boolean);

      formattedSchedules = simrsDoctorItems.map((s, idx) => {
        const dayName = DAY_NUM_TO_NAME[s.day_of_week] || 'Senin';
        const start = s.start_time ? s.start_time.slice(0, 5) : '08:00';
        const end = s.end_time ? s.end_time.slice(0, 5) : '14:00';
        const poliName = s.ruangan || specName;
        return {
          id: `simrs-${d.id}-${idx}`,
          day: dayName,
          day_of_week: s.day_of_week,
          time: `${start} - ${end} WIB`,
          rawStartTime: start,
          rawEndTime: end,
          room: poliName.startsWith('Poli') ? poliName : `Poliklinik ${poliName}`,
          poliklinikId: d.polikliniks && d.polikliniks[0]?.id ? d.polikliniks[0].id : 1,
          status: 'active',
          isPracticing: true,
          source: 'simrs'
        };
      });
    } else if (rawSchedules.length > 0) {
      // Fallback ke jadwal database lokal
      const activeDayNames = Array.from(new Set(practiceDays.map(num => DAY_NUM_TO_NAME[num]).filter(Boolean)))
        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
      availableDays = activeDayNames;

      formattedSchedules = rawSchedules.map(s => {
        const dayName = DAY_NUM_TO_NAME[s.day_of_week] || 'Senin';
        const start = s.start_time ? s.start_time.slice(0, 5) : '09:00';
        const end = s.end_time ? s.end_time.slice(0, 5) : '14:00';
        const poliName = s.poliklinik?.name || specName;
        const schStatus = s.status || 'active';
        const dayNum = Number(s.day_of_week) || (DAY_NAME_TO_NUM[String(dayName).toLowerCase()] === 0 ? 7 : (DAY_NAME_TO_NUM[String(dayName).toLowerCase()] ?? 1));
        return {
          id: s.id,
          day: dayName,
          day_of_week: dayNum,
          time: `${start} - ${end} WIB`,
          rawStartTime: start,
          rawEndTime: end,
          room: poliName.startsWith('Poli') ? poliName : `Poliklinik ${poliName}`,
          poliklinikId: s.poliklinik_id || s.poliklinik?.id,
          status: schStatus,
          isPracticing: schStatus === 'active',
          source: 'database'
        };
      });
    } else {
      availableDays = [];
      formattedSchedules = [];
    }

    const firstSchedule = formattedSchedules[0] || {};
    const practiceStartTime = firstSchedule.rawStartTime || '08:00';
    const practiceEndTime = firstSchedule.rawEndTime || '14:00';
    const assignedPoliId = firstSchedule.poliklinikId || (d.polikliniks && d.polikliniks[0]?.id) || 1;

    // Date-Based Doctor Leave (Cuti Berdasarkan Rentang Tanggal di Database Web Kita)
    // OTOMATIS MENIMPA (OVERRIDE) JADWAL SIMRS jika sedang aktif!
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const docLeaves = (Array.isArray(d.leaves) && d.leaves.length > 0)
      ? d.leaves
      : (currentLeaves || []).filter(l => String(l.doctor_id) === String(d.id || d.dbId));

    const activeTodayLeave = docLeaves.find(l => {
      if (l.status === 'cancelled' || l.status === 'rejected') return false;
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
      return s && e && s <= todayStr && todayStr <= e;
    });

    const upcomingLeaves = docLeaves.filter(l => {
      if (l.status === 'cancelled' || l.status === 'rejected') return false;
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      return s && s > todayStr;
    }).sort((a, b) => (a.start_date > b.start_date ? 1 : -1));

    const doctorStatus = d.status || 'active';
    const hasActiveSchedules = formattedSchedules.some(s => s.status === 'active');

    // JIKA DOKTER CUTI DI DATABASE WEB KITA -> OVERRIDE STATUS!
    const isOnLeave = Boolean(activeTodayLeave);
    const isPracticing = doctorStatus === 'active' && hasActiveSchedules && !isOnLeave;

    let practiceStatusText = 'Praktik';
    if (doctorStatus === 'inactive') {
      practiceStatusText = 'Tidak Praktik';
    } else if (isOnLeave) {
      practiceStatusText = 'Sedang Cuti';
    } else if (!hasActiveSchedules) {
      practiceStatusText = 'Tidak Praktik';
    }

    // Jika cuti aktif, beri penanda ke seluruh jadwal
    if (isOnLeave && activeTodayLeave) {
      formattedSchedules = formattedSchedules.map(sch => ({
        ...sch,
        isLeaveOverride: true,
        leaveReason: activeTodayLeave.reason,
        leaveUntil: activeTodayLeave.end_date
      }));
    }

    const docSlug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `dokter-${d.id}`);

      const isDefaultAvatar = (url) => !url || 
        typeof url !== 'string' || 
        !url.trim() || 
        url.includes('default') || 
        url.includes('.svg') || 
        url.includes('SL99Oz3WyX0Wj5ZKUhthIhEg5VlDMqnLDPe685B4');

      const simrsAvatar = simrsDoctorItems.find(s => 
        s.simrs_avatar && typeof s.simrs_avatar === 'string' && s.simrs_avatar.trim() !== '' && !isDefaultAvatar(s.simrs_avatar)
      )?.simrs_avatar;

      const isDocFemale = /siti|indah|atikanur|asri|levina|nurul|dwi|ayu|putri|rahma|desi/i.test(d.name || '');
      const defaultDocAvatar = isDocFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
      
      let effectivePhoto = d.photo_url || d.photo;
      // Jika di DB fotonya kosong atau default, tapi SIMRS punya avatar asli:
      if (isDefaultAvatar(effectivePhoto) && simrsAvatar) {
        effectivePhoto = simrsAvatar;
      }
      if (isDefaultAvatar(effectivePhoto)) {
        effectivePhoto = defaultDocAvatar;
      }

      return {
        id: d.id,
        dbId: d.id,
        slug: docSlug,
        name: d.name,
        specialty: specName,
        specialtyGroup: specName,
        subSpecialty: d.bio?.includes('Sub-Spesialisasi:') ? d.bio.split('Sub-Spesialisasi:')[1]?.trim() : specName,
        branchId: d.branch?.id || 'naray-dumai-utama',
        branchName: d.branch?.name || 'Naray Hospital Dumai',
        experience: 'Dokter Spesialis Naray Hospital',
        education: d.bio?.includes('Pendidikan:') ? d.bio.split('Pendidikan:')[1]?.split('\n')[0]?.trim() : 'Fakultas Kedokteran',
        rating: 4.9,
        reviewCount: 150 + d.id * 7,
        photo: formatImageUrl(effectivePhoto, defaultDocAvatar),
        photo_url: effectivePhoto,
      availableDays,
      schedules: formattedSchedules,
      practiceDays: practiceDays.length > 0 ? practiceDays : [1, 2, 3, 4, 5],
      practiceStartTime,
      practiceEndTime,
      poliklinik_id: assignedPoliId,
      specialization_id: specId,
      specialization: specObj || { id: specId, name: specName },
      branch_id: d.branch_id || d.branch?.id || 1,
      phone: d.phone || '',
      email: d.email || '',
      status: doctorStatus,
      isOnLeave,
      currentLeave: activeTodayLeave || null,
      upcomingLeaves,
      leaves: docLeaves,
      isPracticing,
      practiceStatusText,
      bio: d.bio?.split('\n')[0] || `${d.name} adalah dokter spesialis berpengalaman di Naray Hospital Dumai.`
    };
  };

  // Helper untuk auto-discover dokter baru yang ada di feed SIMRS Dekago tetapi belum terdaftar di master database web
  const extractSimrsNewDoctors = (simrsSchedules, existingDoctors = [], currentSpecs = specializationsList) => {
    if (!simrsSchedules || !Array.isArray(simrsSchedules.jadwal_dokter)) return [];

    const newDocsMap = new Map();

    for (const dayItem of simrsSchedules.jadwal_dokter) {
      const dow = Number(dayItem.day_of_week);
      const dayNum = dow === 0 ? 7 : dow;
      const dayName = DAY_NUM_TO_NAME[dayNum] || 'Senin';

      for (const item of (dayItem.jadwal || [])) {
        const rawName = item.dokter?.nama?.trim();
        if (!rawName) continue;

        // Cek apakah dokter ini sudah ada di master database
        const alreadyExists = existingDoctors.some(d => matchDoctorName(d.name, rawName));
        if (alreadyExists) continue;

        const docSimrsId = item.dokter.id || rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!newDocsMap.has(docSimrsId)) {
          const poliName = item.ruangan?.nama || 'Poli Spesialis';
          const cleanSpec = poliName.replace(/^Poli\s+/i, '').trim();
          const isFemale = /siti|indah|atikanur|asri|levina|nurul|dwi|ayu|putri|rahma|desi/i.test(rawName);

          newDocsMap.set(docSimrsId, {
            id: `simrs-${docSimrsId}`,
            dbId: `simrs-${docSimrsId}`,
            slug: rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: rawName,
            specialty: cleanSpec || 'Dokter Spesialis',
            specialtyGroup: cleanSpec || 'Dokter Spesialis',
            subSpecialty: cleanSpec,
            branchId: 'naray-dumai-utama',
            branchName: 'Naray Hospital Dumai',
            experience: 'Dokter Spesialis Naray Hospital',
            education: 'Fakultas Kedokteran',
            rating: 4.9,
            reviewCount: 150,
            photo: formatImageUrl(item.dokter?.avatar_url, isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg'),
            photo_url: item.dokter?.avatar_url || '',
            availableDays: [],
            schedules: [],
            practiceDays: [],
            practiceStartTime: '08:00',
            practiceEndTime: '14:00',
            poliklinik_id: 1,
            specialization_id: 1,
            specialization: { id: 1, name: cleanSpec },
            branch_id: 1,
            phone: '0765-31234',
            email: 'info@narayhospital.com',
            status: 'active',
            isOnLeave: Boolean(item.cuti),
            currentLeave: null,
            upcomingLeaves: [],
            leaves: [],
            isPracticing: !Boolean(item.cuti),
            practiceStatusText: Boolean(item.cuti) ? 'Sedang Cuti' : 'Praktik',
            bio: `${rawName} adalah dokter spesialis berdedikasi di Naray Hospital Dumai, memberikan pelayanan kesehatan prima secara profesional.`,
            source: 'simrs_auto_discovered'
          });
        }

        const docObj = newDocsMap.get(docSimrsId);
        
        // Update photo jika ada avatar_url valid dari SIMRS
        const itemAvatar = item.dokter?.avatar_url;
        if (docObj && itemAvatar && typeof itemAvatar === 'string' && itemAvatar.trim() !== '') {
          const isDef = (u) => !u || u.includes('default') || u.includes('.svg');
          if (!docObj.photo_url || isDef(docObj.photo_url)) {
            docObj.photo_url = itemAvatar;
            docObj.photo = formatImageUrl(itemAvatar, docObj.photo);
          }
        }

        const start = item.start_time ? item.start_time.slice(0, 5) : '08:00';
        const end = item.end_time ? item.end_time.slice(0, 5) : '14:00';
        const roomName = item.ruangan?.nama || docObj.specialty;

        if (!docObj.availableDays.includes(dayName)) {
          docObj.availableDays.push(dayName);
          docObj.practiceDays.push(dayNum);
        }

        docObj.schedules.push({
          id: `simrs-sch-${docSimrsId}-${dayNum}-${docObj.schedules.length}`,
          day: dayName,
          day_of_week: dayNum,
          time: `${start} - ${end} WIB`,
          rawStartTime: start,
          rawEndTime: end,
          room: roomName.startsWith('Poli') ? roomName : `Poliklinik ${roomName}`,
          poliklinikId: 1,
          status: 'active',
          isPracticing: !Boolean(item.cuti),
          source: 'simrs'
        });
      }
    }

    return Array.from(newDocsMap.values());
  };

  const mapPoliklinik = (p) => ({
    id: `poli-${p.id}`,
    dbId: p.id,
    backendId: p.id,
    name: p.name,
    icon: '🩺',
    desc: p.description || 'Layanan konsultasi dan pengobatan terpadu.'
  });

  const mapArticle = (a) => {
    let catName = 'Kesehatan Umum';
    if (typeof a.category === 'string') {
      catName = a.category;
    } else if (a.category && typeof a.category === 'object' && a.category.name) {
      catName = a.category.name;
    }

    const artSlug = a.slug || (a.title ? a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `art-${a.id}`);

    return {
      id: artSlug,
      slug: artSlug,
      dbId: a.id,
      title: a.title,
      author: a.author || 'Tim Medis Naray Hospital',
      category: catName,
      date: a.published_at ? new Date(a.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : (a.date || 'Terbaru'),
      readTime: a.read_time || a.readTime || '4 Menit Baca',
      image: formatImageUrl(a.thumbnail_url || a.image, '/images/discovery/diagnostic-center.jpg'),
      thumbnail_url: a.thumbnail_url || '',
      summary: a.summary || (a.content ? a.content.slice(0, 160) + '...' : ''),
      snippet: a.summary || (a.content ? a.content.slice(0, 160) + '...' : ''),
      content: a.content
    };
  };

  const mapFacility = (f) => {
    const cat = f.description?.includes('Kategori:') ? f.description.split('Kategori:')[1].split('\n')[0].trim() : 'Fasilitas Medis';
    const cleanDesc = f.description?.replace(/Kategori:.*\n?/, '') || 'Fasilitas modern Naray Hospital.';
    return {
      id: `fac-${f.id}`,
      dbId: f.id,
      name: f.name,
      category: cat,
      type: f.type || 'advanced',
      status: f.status || 'active',
      image: formatImageUrl(f.image_url || f.image, '/images/default-image.svg'),
      image_url: f.image_url || '',
      description: cleanDesc,
      desc: cleanDesc
    };
  };

  const mapCenter = (c) => {
    const lines = (c.description || '').split('\n').map(l => l.trim()).filter(Boolean);
    const tagline = lines.length > 1 ? lines[0] : (c.description || 'Pusat Layanan Medis Terpadu');
    const desc = lines.length > 1 ? lines.slice(1).join('\n') : (c.description || 'Pelayanan komprehensif didukung dokter spesialis dan peralatan mutakhir.');
    return {
      id: c.slug || `center-${c.id}`,
      dbId: c.id,
      title: c.name,
      name: c.name,
      shortTitle: c.name,
      icon: 'HeartPulse',
      tagline: tagline,
      description: desc,
      image: formatImageUrl(c.image_url || c.image, '/images/default-image.svg'),
      image_url: c.image_url || '',
      stats: 'Layanan Unggulan',
      technologies: ['Teknologi Medis Terkini', 'Sistem Digital Terpadu'],
      services: ['Konsultasi Spesialis', 'Tindakan Terpadu'],
      doctorsCount: 3
    };
  };

  const mapRoom = (r) => {
    const nameLower = (r.name || '').toLowerCase();
    
    // Tiered price fallback if DB price is missing or set to flat default
    let defaultPrice = 500000;
    if (nameLower.includes('vip') || nameLower.includes('suite') || nameLower.includes('pistillum')) {
      defaultPrice = 1500000;
    } else if (nameLower.includes('icu') || nameLower.includes('staments') || nameLower.includes('intensif')) {
      defaultPrice = 1250000;
    } else if (nameLower.includes('kelas 1') || nameLower.includes('green')) {
      defaultPrice = 750000;
    } else if (nameLower.includes('kelas 2') || nameLower.includes('red')) {
      defaultPrice = 500000;
    } else if (nameLower.includes('kelas 3') || nameLower.includes('seroja') || nameLower.includes('reguler')) {
      defaultPrice = 250000;
    } else if (nameLower.includes('isolasi')) {
      defaultPrice = 850000;
    }

    const priceNum = Number(r.price_per_night) || defaultPrice;
    const priceStr = `Rp ${priceNum.toLocaleString('id-ID')} / malam`;

    // Sanitize and deduplicate facilities/features
    let rawDesc = (r.description || '')
      .replace(/Wi-FiTempat Tidur/g, 'Wi-Fi\nTempat Tidur')
      .replace(/Wi-FiKamar Mandi/g, 'Wi-Fi\nKamar Mandi');

    const descLines = rawDesc.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateFeatures = [];
    descLines.forEach(l => {
      const cleanLine = l.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 2) {
        candidateFeatures.push(cleanLine);
      }
    });

    // Case-insensitive deduplication
    const seenFeats = new Set();
    const cleanFeatures = [];
    candidateFeatures.forEach(f => {
      const low = f.toLowerCase();
      if (!seenFeats.has(low)) {
        seenFeats.add(low);
        cleanFeatures.push(f);
      }
    });

    let defaultFeats = [
      'Tempat Tidur Pasien Ergonomis',
      'Nurse Call System 24 Jam',
      'Pendingin Ruangan (AC)',
      'Kamar Mandi Bersih'
    ];
    if (nameLower.includes('vip') || nameLower.includes('suite')) {
      defaultFeats = [
        'Tempat Tidur Elektrik Ergonomis Multi-Posisi',
        'Smart TV 55 Inch & Akses Wi-Fi Cepat',
        'Kamar Mandi Pribadi & Water Heater',
        'Sofa Bed Keluarga & Kulkas Mini',
        'Nurse Call 24 Jam di Sisi Bed'
      ];
    } else if (nameLower.includes('icu') || nameLower.includes('staments') || nameLower.includes('intensif')) {
      defaultFeats = [
        'Tempat Tidur ICU Elektrik Multiposisi',
        'Bedside Monitor Multi-Parameter 24 Jam',
        'Ventilator Mekanik & Pasokan Central Oxygen',
        'Syringe Pump & Infusion Pump Digital',
        'Pengawasan Dokter Intensivis & Tim ICU 24 Jam'
      ];
    } else if (nameLower.includes('kelas 1') || nameLower.includes('green')) {
      defaultFeats = [
        'Tempat Tidur Pasien Elektrik Ergonomis',
        'Tirai Penyekat Privasi Antarpasien',
        'Pendingin Ruangan (AC) & Smart TV',
        'Kamar Mandi Dalam Higienis & Water Heater',
        'Nurse Call System 24 Jam Siaga'
      ];
    } else if (nameLower.includes('kelas 2') || nameLower.includes('red')) {
      defaultFeats = [
        'Tempat Tidur Pasien dengan Pengatur Sandaran',
        'Tirai Penyekat Privasi di Setiap Bed',
        'Pendingin Ruangan (AC) Sentral',
        'Bed Side Cabinet & Meja Pasien Lipat',
        'Nurse Call System Terintegrasi'
      ];
    } else if (nameLower.includes('kelas 3') || nameLower.includes('seroja')) {
      defaultFeats = [
        'Ranjang Pasien Medis dengan Tirai Penyekat',
        'Pendingin Ruangan (AC) & Sirkulasi Udara Baik',
        'Kamar Mandi Bersih dengan Pegangan Pengaman',
        'Standar Rawat Inap Standar (KRIS) BPJS',
        'Nurse Call System di Sisi Bed'
      ];
    } else if (nameLower.includes('isolasi')) {
      defaultFeats = [
        'Ruang Bertekanan Negatif dengan HEPA Filter',
        'Ruang Antara (Anteroom) Standar PPI Kemenkes',
        'Bed Pasien Khusus dengan Monitor Parameter',
        'Kamar Mandi Khusus Ruang Isolasi',
        'Pengawasan Medis 24 Jam & Kaca Observasi'
      ];
    }

    const feats = cleanFeatures.length >= 3 ? cleanFeatures : defaultFeats;
    const cleanDesc = cleanFeatures.join(' • ');

    let cat = 'standard';
    let totalBeds = 14;
    let availableBeds = 5;
    let fallbackImg = '/images/rooms/room-class1.jpg';

    if (nameLower.includes('vip') || nameLower.includes('suite') || nameLower.includes('pistillum')) {
      cat = 'vip';
      totalBeds = 4;
      availableBeds = 2;
      fallbackImg = '/images/rooms/room-vip.jpg';
    } else if (nameLower.includes('icu') || nameLower.includes('staments') || nameLower.includes('intensif')) {
      cat = 'intensive';
      totalBeds = 26;
      availableBeds = 25;
      fallbackImg = '/images/rooms/room-icu.jpg';
    } else if (nameLower.includes('isolasi')) {
      cat = 'intensive';
      totalBeds = 16;
      availableBeds = 15;
      fallbackImg = '/images/rooms/room-isolation.jpg';
    } else if (nameLower.includes('kelas 3') || nameLower.includes('seroja')) {
      cat = 'reguler';
      totalBeds = 36;
      availableBeds = 12;
      fallbackImg = '/images/rooms/room-class3.jpg';
    } else if (nameLower.includes('kelas 2') || nameLower.includes('red')) {
      cat = 'standard';
      totalBeds = 20;
      availableBeds = 7;
      fallbackImg = '/images/rooms/room-class2.jpg';
    } else if (nameLower.includes('kelas 1') || nameLower.includes('green')) {
      cat = 'standard';
      totalBeds = 15;
      availableBeds = 5;
      fallbackImg = '/images/rooms/room-class1.jpg';
    }

    const roomSlug = r.slug || (r.name ? r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `kamar-${r.id}`);

    const rawRooms = Array.isArray(r.rooms) ? r.rooms : [];
    const actualTotalBeds = rawRooms.length > 0 ? rawRooms.length : (r.total_beds || totalBeds);
    const actualAvailableBeds = rawRooms.length > 0 
      ? rawRooms.filter(rm => (rm.status || '').toLowerCase() === 'available').length 
      : (r.available_beds || availableBeds);

    return {
      id: `room-${r.id}`,
      slug: roomSlug,
      dbId: r.id,
      name: r.name,
      category: cat,
      tag: r.tag || (cat === 'vip' ? 'Kenyamanan Tertinggi & Privasi Penuh' : cat === 'intensive' ? 'Perawatan Kritis & Terpadu 24 Jam' : 'Kenyamanan & Perawatan Terbaik'),
      tagline: r.tag || 'Kenyamanan & Perawatan Terbaik',
      capacity: r.capacity || `${actualTotalBeds} Tempat Tidur Pasien`,
      totalBeds: actualTotalBeds,
      availableBeds: actualAvailableBeds,
      roomsList: rawRooms,
      price: priceStr,
      price_per_night: priceNum,
      bpjsCovered: !cat.includes('vip'),
      insuranceCovered: true,
      image: formatImageUrl(r.image_url || r.image, fallbackImg),
      image_url: r.image_url || '',
      description: cleanDesc,
      features: feats,
      facilities: feats,
      target: 'Pasien Rawat Inap'
    };
  };

  const mapMcu = (m) => {
    const priceNum = Number(m.price) || 0;
    let dbHighlight = '';
    let dbItems = [];
    if (m.description) {
      const lines = m.description.split('\n').map(l => l.trim()).filter(Boolean);
      const itemLines = lines.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));
      const highlightLines = lines.filter(l => !l.startsWith('-') && !l.startsWith('•') && !l.startsWith('*'));
      if (highlightLines.length > 0) {
        dbHighlight = highlightLines.join(' ');
      }
      if (itemLines.length > 0) {
        dbItems = itemLines.map(l => l.replace(/^[-•*]\s*/, ''));
      }
    }

    return {
      id: m.slug || `mcu-${m.id}`,
      dbId: m.id,
      name: m.name,
      badge: 'Paket Rekomendasi',
      price: priceNum ? `Rp ${priceNum.toLocaleString('id-ID')}` : 'Hubungi Naray Care',
      originalPrice: priceNum ? `Rp ${(priceNum * 1.25).toLocaleString('id-ID')}` : '',
      duration: '2 - 3 Jam',
      target: 'Pemeriksaan Kesehatan Berkala',
      highlight: dbHighlight || m.name,
      image: formatImageUrl(m.image_url || m.image, '/images/default-image.svg'),
      image_url: m.image_url || '',
      items: dbItems.length > 0 ? dbItems : ['Pemeriksaan Fisik Dokter Spesialis', 'Pemeriksaan Laboratorium Lengkap', 'Resume Medis Komprehensif']
    };
  };

  const parseMedia = (rawMedia) => {
    const dbPhotos = [];
    const dbVideos = [];
    if (!Array.isArray(rawMedia)) return { dbPhotos, dbVideos };

    rawMedia.forEach(m => {
      let catName = 'Kegiatan Naray';
      if (typeof m.category === 'string') {
        catName = m.category;
      } else if (m.category && typeof m.category === 'object' && m.category.name) {
        catName = m.category.name;
      } else if (m.description) {
        catName = m.description.slice(0, 30);
      }

      if (m.type === 'video') {
        dbVideos.push({
          id: `vid-${m.id}`,
          dbId: m.id,
          title: m.title,
          category: catName,
          youtubeEmbed: m.url,
          desc: m.description || ''
        });
      } else {
        dbPhotos.push({
          id: `gal-${m.id}`,
          dbId: m.id,
          title: m.title,
          date: m.created_at
            ? new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Terbaru',
          category: catName,
          image: formatImageUrl(m.url || m.image, '/images/default-image.svg'),
          url: m.url || '',
          desc: m.description || ''
        });
      }
    });
    return { dbPhotos, dbVideos };
  };

  const loadBackendData = async () => {
    setIsLoadingBackend(true);
    try {
      // 1. Single Batch Init Endpoint (Hanya 1x request HTTP: pangkas load time dari 3s jadi ~300ms)
      const initRes = await api.getAppInit();
      if (initRes?.success && initRes?.data) {
        const d = initRes.data;
        const leaves = Array.isArray(d.doctor_leaves) ? d.doctor_leaves : [];
        setDoctorLeaves(leaves);

        if (d.simrs_doctor_schedules) {
          setSimrsDoctorSchedules(d.simrs_doctor_schedules);
        }

        if (Array.isArray(d.specializations) && d.specializations.length > 0) {
          setSpecializationsList(d.specializations);
        }

        const activeSpecs = Array.isArray(d.specializations) && d.specializations.length > 0
          ? d.specializations
          : specializationsList;

        if (Array.isArray(d.doctors) && d.doctors.length > 0) {
          const mappedDocs = d.doctors.map(doc => mapDoctor(doc, activeSpecs, leaves, d.simrs_doctor_schedules));
          const autoSimrsDocs = extractSimrsNewDoctors(d.simrs_doctor_schedules, mappedDocs, activeSpecs);
          setDoctors([...mappedDocs, ...autoSimrsDocs]);
        }
        if (Array.isArray(d.polikliniks) && d.polikliniks.length > 0) {
          setPoliklinikList(d.polikliniks.map(mapPoliklinik));
        }
        if (Array.isArray(d.articles) && d.articles.length > 0) {
          setHealthArticles(d.articles.map(mapArticle));
        }
        if (Array.isArray(d.facilities) && d.facilities.length > 0) {
          setFacilitiesData(d.facilities.map(mapFacility));
        }
        if (Array.isArray(d.centers) && d.centers.length > 0) {
          setCentersOfExcellence(d.centers.map(mapCenter));
        }
        if (Array.isArray(d.room_types) && d.room_types.length > 0) {
          setInpatientRooms(d.room_types.map(mapRoom));
        }
        if (d.simrs_beds) {
          setSimrsBedData(d.simrs_beds);
        }
        if (d.simrs_surgeries) {
          setSimrsSurgeryData(d.simrs_surgeries);
        }
        if (Array.isArray(d.mcu_packages) && d.mcu_packages.length > 0) {
          setMcuPackages(d.mcu_packages.map(mapMcu));
        }
        if (Array.isArray(d.media) && d.media.length > 0) {
          const { dbPhotos, dbVideos } = parseMedia(d.media);
          if (dbPhotos.length > 0) setGalleryActivities(dbPhotos);
          if (dbVideos.length > 0) setVideoList(dbVideos);
        }
        if (d.hospital_info) {
          setHospitalInfo(prev => ({
            ...prev,
            ...d.hospital_info,
            name: d.hospital_info.name || prev.name,
            address: d.hospital_info.address || prev.address,
            phone: d.hospital_info.phone || prev.phone,
            callCenter: d.hospital_info.phone || prev.callCenter,
            emergencyHotline: d.hospital_info.emergency_hotline || prev.emergencyHotline,
            whatsappHotline: d.hospital_info.phone || prev.whatsappHotline,
            operatingHours: d.hospital_info.operating_hours || prev.operatingHours,
            description: d.hospital_info.description || prev.description,
          }));
        }
        setIsBackendConnected(true);
        setIsLoadingBackend(false);
        return;
      }
    } catch (batchErr) {
      console.warn('[HospitalDataContext] Batch init gagal, fallback ke individual requests:', batchErr.message);
      try {
        const [docRes, poliRes, artRes, facRes, centerRes, roomRes, mcuRes, mediaRes, specRes] = await Promise.allSettled([
          api.getDoctors({ per_page: 50 }),
          api.getPolikliniks({ per_page: 50 }),
          api.getArticles({ per_page: 20 }),
          api.getFacilities({ per_page: 30 }),
          api.getCentersOfExcellence(),
          api.getRoomTypes(),
          api.getMcuPackages(),
          api.getMedia({ per_page: 50 }),
          api.getSpecializations()
        ]);

        let connected = false;
        let activeSpecs = specializationsList;
        if (specRes.status === 'fulfilled' && specRes.value?.data) {
          const list = specRes.value.data.data || specRes.value.data;
          if (Array.isArray(list) && list.length > 0) {
            activeSpecs = list;
            setSpecializationsList(list);
          }
        }
        if (docRes.status === 'fulfilled' && Array.isArray(docRes.value?.data?.data) && docRes.value.data.data.length > 0) {
          connected = true;
          const mapped = docRes.value.data.data.map(d => mapDoctor(d, activeSpecs));
          const autoSimrs = extractSimrsNewDoctors(simrsDoctorSchedules, mapped, activeSpecs);
          setDoctors([...mapped, ...autoSimrs]);
        }
        if (poliRes.status === 'fulfilled' && Array.isArray(poliRes.value?.data?.data)) {
          connected = true;
          setPoliklinikList(poliRes.value.data.data.map(mapPoliklinik));
        }
        if (artRes.status === 'fulfilled' && Array.isArray(artRes.value?.data?.data)) {
          connected = true;
          setHealthArticles(artRes.value.data.data.map(mapArticle));
        }
        if (facRes.status === 'fulfilled' && Array.isArray(facRes.value?.data?.data)) {
          connected = true;
          setFacilitiesData(facRes.value.data.data.map(mapFacility));
        }
        if (centerRes.status === 'fulfilled' && Array.isArray(centerRes.value?.data?.data)) {
          connected = true;
          setCentersOfExcellence(centerRes.value.data.data.map(mapCenter));
        }
        if (roomRes.status === 'fulfilled' && Array.isArray(roomRes.value?.data?.data) && roomRes.value.data.data.length > 0) {
          connected = true;
          setInpatientRooms(roomRes.value.data.data.map(mapRoom));
        }
        if (mcuRes.status === 'fulfilled' && Array.isArray(mcuRes.value?.data?.data)) {
          connected = true;
          setMcuPackages(mcuRes.value.data.data.map(mapMcu));
        }
        if (mediaRes.status === 'fulfilled' && mediaRes.value?.data) {
          connected = true;
          const rawMedia = mediaRes.value.data.data?.data || mediaRes.value.data.data || [];
          if (Array.isArray(rawMedia) && rawMedia.length > 0) {
            const { dbPhotos, dbVideos } = parseMedia(rawMedia);
            if (dbPhotos.length > 0) setGalleryActivities(dbPhotos);
            if (dbVideos.length > 0) setVideoList(dbVideos);
          }
        }
        setIsBackendConnected(connected);
      } catch (err) {
        console.warn('[HospitalDataContext] Gagal mengambil data backend:', err);
        setIsBackendConnected(false);
      }
    } finally {
      setIsLoadingBackend(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Sync admin state only (not data collections)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
  }, [isAdmin]);

  // Auth Methods with Backend Sanctum Integration
  const loginAdmin = async (identifier, password) => {
    if (!identifier || !password) {
      return { success: false, message: 'Mohon isi email dan kata sandi Anda.' };
    }

    // Normalise identifier: allow typing 'admin' as shortcut for admin@narayhospital.com
    const email = identifier.includes('@')
      ? identifier.trim()
      : (identifier.trim().toLowerCase() === 'admin' ? 'admin@narayhospital.com' : identifier.trim());

    try {
      const res = await api.adminLogin({ email, password });
      if (res.success && res.data?.token) {
        const token = res.data.token;
        const user = res.data.admin;
        setAdminToken(token);
        setAdminUser(user);
        setIsAdmin(true);
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');

        // Immediately preload admin data via 1x batch request
        fetchAdminInit();
        return { success: true, user };
      }
      return { success: false, message: res?.message || 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' };
    } catch (err) {
      console.warn('[HospitalDataContext] Autentikasi admin gagal:', err.message);
      return { success: false, message: err.message || 'Kredensial tidak valid. Pastikan email dan kata sandi Anda sudah benar.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      if (adminToken) {
        await api.adminLogout().catch(() => { });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsAdmin(false);
      setAdminToken(null);
      setAdminUser(null);
      setAdminAppointments([]);
      setAdminDashboardStats(null);
      localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_CACHED_STATS);
    }
  };

  // Batch Admin Init: Mengambil appointments + dashboard stats dalam 1 request tunggal (~200ms)
  const fetchAdminInit = async () => {
    setIsLoadingAdminAppointments(true);
    try {
      const res = await api.adminGetInit();
      if (res?.success && res?.data) {
        const { stats, appointments } = res.data;
        if (stats) {
          setAdminDashboardStats(stats);
          try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_STATS, JSON.stringify(stats)); } catch (e) { }
        }
        if (Array.isArray(appointments)) {
          setAdminAppointments(appointments);
          try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS, JSON.stringify(appointments)); } catch (e) { }
        }
        return res.data;
      }
    } catch (err) {
      console.warn('[HospitalDataContext] Batch admin init gagal, fallback ke individual fetch:', err.message);
      await Promise.allSettled([
        fetchAdminAppointments(),
        fetchAdminDashboardStats()
      ]);
    } finally {
      setIsLoadingAdminAppointments(false);
    }
  };

  // Individual Admin Data Fetchers (Fallback & Custom Params)
  const fetchAdminAppointments = async (params = {}) => {
    setIsLoadingAdminAppointments(true);
    try {
      const res = await api.adminGetAppointments(params);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setAdminAppointments(list);
        try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS, JSON.stringify(list)); } catch (e) { }
        return list;
      }
    } catch (err) {
      console.warn('[HospitalDataContext] Gagal mengambil appointments dari API admin:', err);
    } finally {
      setIsLoadingAdminAppointments(false);
    }
    return [];
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const res = await api.adminUpdateAppointmentStatus(id, status);
      if (res.success && res.data) {
        setAdminAppointments(prev => {
          const next = prev.map(item => item.id === id ? { ...item, status: res.data.status || status } : item);
          try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS, JSON.stringify(next)); } catch (e) { }
          return next;
        });
        fetchAdminInit(); // Refresh stats & list in background
        return { success: true, data: res.data };
      }
    } catch (err) {
      console.warn(`[HospitalDataContext] Gagal mengubah status appointment #${id}:`, err);
      // Local memory fallback update
      setAdminAppointments(prev =>
        prev.map(item => item.id === id ? { ...item, status } : item)
      );
      return { success: false, message: err.message };
    }
  };

  const adminDeleteAppointment = async (id) => {
    try {
      await api.adminDeleteAppointment(id);
      setAdminAppointments(prev => {
        const next = prev.filter(item => item.id !== id);
        try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_APPOINTMENTS, JSON.stringify(next)); } catch (e) { }
        return next;
      });
      fetchAdminInit();
      return { success: true };
    } catch (err) {
      console.warn(`[HospitalDataContext] Gagal menghapus appointment #${id}:`, err);
      // Optimistic local removal anyway
      setAdminAppointments(prev => prev.filter(item => item.id !== id));
      return { success: false, message: err.message };
    }
  };

  const fetchAdminDashboardStats = async () => {
    try {
      const res = await api.adminGetDashboardStats();
      if (res.success && res.data) {
        setAdminDashboardStats(res.data);
        try { localStorage.setItem(STORAGE_KEYS.ADMIN_CACHED_STATS, JSON.stringify(res.data)); } catch (e) { }
        return res.data;
      }
    } catch (err) {
      console.warn('[HospitalDataContext] Gagal mengambil admin dashboard stats:', err);
    }
    return null;
  };

  // ── Admin User Management & RBAC Handlers ──
  const fetchAdminUsers = async (params = {}) => {
    setIsLoadingAdminUsers(true);
    try {
      const res = await api.adminGetUsers(params);
      if (res?.success) {
        setAdminUsers(res.data || []);
        if (res.stats) setAdminUserStats(res.stats);
        return res;
      }
    } catch (err) {
      console.warn('[HospitalDataContext] Gagal memuat daftar admin users:', err);
    } finally {
      setIsLoadingAdminUsers(false);
    }
    return { success: false, data: [] };
  };

  const adminCreateUser = async (data) => {
    try {
      const res = await api.adminCreateUser(data);
      if (res?.success && res.data) {
        setAdminUsers(prev => [res.data, ...prev]);
        fetchAdminUsers();
        return res;
      }
      return res || { success: false, message: 'Gagal membuat pengguna admin' };
    } catch (err) {
      return { 
        success: false, 
        message: err.message || 'Terjadi kesalahan sistem',
        errors: err.errors || {}
      };
    }
  };

  const adminUpdateUser = async (id, data) => {
    try {
      const res = await api.adminUpdateUser(id, data);
      if (res?.success && res.data) {
        setAdminUsers(prev => prev.map(u => u.id === id ? res.data : u));
        if (adminUser && adminUser.id === id) {
          setAdminUser(res.data);
          try { localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(res.data)); } catch (e) { }
        }
        fetchAdminUsers();
        return res;
      }
      return res || { success: false, message: 'Gagal memperbarui data pengguna' };
    } catch (err) {
      return { 
        success: false, 
        message: err.message || 'Terjadi kesalahan sistem',
        errors: err.errors || {}
      };
    }
  };

  const adminDeleteUser = async (id) => {
    try {
      const res = await api.adminDeleteUser(id);
      if (res?.success) {
        setAdminUsers(prev => prev.filter(u => u.id !== id));
        fetchAdminUsers();
        return res;
      }
      return res || { success: false, message: 'Gagal menghapus pengguna' };
    } catch (err) {
      return { success: false, message: err.message || 'Terjadi kesalahan sistem' };
    }
  };

  const adminToggleUserStatus = async (id) => {
    try {
      const res = await api.adminToggleUserStatus(id);
      if (res?.success && res.data) {
        setAdminUsers(prev => prev.map(u => u.id === id ? res.data : u));
        fetchAdminUsers();
        return res;
      }
      return res || { success: false, message: 'Gagal mengubah status pengguna' };
    } catch (err) {
      return { success: false, message: err.message || 'Terjadi kesalahan sistem' };
    }
  };

  // Auto-fetch admin data when valid admin token exists
  useEffect(() => {
    if (isAdmin) {
      if (adminToken) {
        fetchAdminInit();
      } else {
        setIsAdmin(false);
      }
    }
  }, [adminToken, isAdmin]);

  // Helper pembuatan spesialisasi baru langsung ke database MySQL
  const createSpecialization = async (nameOrPayload) => {
    try {
      const payload = typeof nameOrPayload === 'string'
        ? { name: nameOrPayload.trim() }
        : { ...nameOrPayload, name: (nameOrPayload.name || '').trim() };

      if (!payload.name) {
        return { success: false, message: 'Nama spesialisasi tidak boleh kosong.' };
      }

      const res = await api.adminCreateSpecialization(payload);
      if (res?.data) {
        const newSpec = res.data;
        setSpecializationsList(prev => {
          const list = Array.isArray(prev) ? prev : [];
          const exists = list.some(s => Number(s.id) === Number(newSpec.id));
          if (exists) {
            return list.map(s => Number(s.id) === Number(newSpec.id) ? { ...s, ...newSpec } : s);
          }
          return [...list, newSpec].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });
        return { success: true, data: newSpec, message: res.message || 'Spesialisasi berhasil disimpan.' };
      }
      return { success: false, message: res?.message || 'Gagal menyimpan spesialisasi ke database.' };
    } catch (err) {
      return { success: false, message: err.message || 'Gagal menyimpan spesialisasi ke database.' };
    }
  };

  // Backend-Connected Admin CRUD Handlers
  const adminCreate = async (entity, payload) => {
    try {
      let res;
      switch (entity) {
        case 'specialization': {
          return await createSpecialization(payload);
        }
        case 'article': {
          const body = {
            title: payload.title,
            slug: payload.slug || undefined,
            content: payload.content || payload.excerpt || payload.title,
            thumbnail_url: payload.thumbnail_url || payload.image || payload.thumbnail,
            status: payload.status || 'published',
            category_id: payload.category_id || 1,
          };
          res = await api.adminCreateArticle(body);
          if (res?.data) {
            const mapped = mapArticle(res.data);
            const createdDbId = mapped.dbId || mapped.id;
            const clientFinalId = createdDbId ? `art-${createdDbId}` : (payload.id || `art-${Date.now()}`);
            saveItem('article', { ...mapped, id: clientFinalId, dbId: createdDbId });
            loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
            return { success: true, data: mapped };
          }
          break;
        }
        case 'doctor': {
          const specId = Number(payload.specialization_id) || 1;
          const body = {
            name: payload.name,
            specialization_id: specId,
            branch_id: Number(payload.branch_id) || 1,
            phone: payload.phone || null,
            email: payload.email || null,
            photo_url: payload.photo_url || payload.photo || null,
            bio: payload.bio || '',
            status: payload.status || 'active',
            practice_days: Array.isArray(payload.practice_days) ? payload.practice_days : [1, 2, 3, 4, 5],
            start_time: payload.start_time || '09:00',
            end_time: payload.end_time || '14:00',
            poliklinik_id: payload.poliklinik_id ? Number(payload.poliklinik_id) : 1,
          };
          res = await api.adminCreateDoctor(body);
          const rawDoc = res?.data || { ...payload, specialization_id: specId };
          const mappedDoc = mapDoctor(rawDoc, specializationsList);
          const createdDbId = mappedDoc.id || rawDoc.id;
          const clientFinalId = createdDbId ? `doctor-${createdDbId}` : (payload.id || `doctor-${Date.now()}`);
          saveItem('doctor', { ...mappedDoc, id: clientFinalId, dbId: createdDbId });
          loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
          return { success: true, data: mappedDoc };
        }
        case 'poliklinik': {
          const body = {
            name: payload.name,
            description: payload.description || payload.desc || '',
            branch_id: 1,
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
          };
          res = await api.adminCreatePoliklinik(body);
          break;
        }
        case 'mcu': {
          const priceNum = Number(String(payload.price).replace(/[^0-9]/g, '')) || 500000;
          let description = payload.highlight || '';
          if (Array.isArray(payload.items) && payload.items.length > 0) {
            description += '\n' + payload.items.map(i => `- ${i}`).join('\n');
          } else if (payload.description) {
            description = payload.description;
          }
          const body = {
            name: payload.name,
            slug: payload.slug || undefined,
            price: priceNum,
            description,
            image_url: payload.image_url || null,
            status: payload.status || 'active',
          };
          res = await api.adminCreateMcuPackage(body);
          break;
        }
        case 'room': {
          const priceNum = Number(String(payload.price || payload.price_per_night).replace(/[^0-9]/g, '')) || 750000;
          let descText = payload.description || '';
          if (Array.isArray(payload.facilities) && payload.facilities.length > 0) {
            descText = (payload.description || '') + '\n' + payload.facilities.map(f => `- ${f}`).join('\n');
          }
          const body = {
            name: payload.name,
            capacity: payload.capacity || '1 - 2 Pasien per Kamar',
            description: descText,
            price_per_night: priceNum,
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminCreateRoomType(body);
          if (res?.data) {
            const mapped = mapRoom(res.data);
            const createdDbId = mapped.dbId || mapped.id;
            const clientFinalId = createdDbId ? `room-${createdDbId}` : (payload.id || `room-${Date.now()}`);
            saveItem('room', { ...mapped, id: clientFinalId, dbId: createdDbId });
            loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
            return { success: true, data: mapped };
          }
          break;
        }
        case 'facility': {
          const body = {
            name: payload.name,
            description: payload.description || '',
            type: payload.type || 'advanced',
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminCreateFacility(body);
          break;
        }
        case 'center': {
          const titleStr = payload.title || payload.name || 'Pusat Unggulan';
          const slugStr = payload.slug || titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `center-${Date.now()}`;
          const body = {
            name: titleStr,
            slug: slugStr,
            description: (payload.tagline ? `${payload.tagline}\n` : '') + (payload.description || ''),
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminCreateCenterOfExcellence(body);
          break;
        }
        case 'gallery':
        case 'video':
        case 'media': {
          const isVideo = payload.type === 'video' || entity === 'video';
          const mediaUrl = isVideo
            ? (payload.url || payload.youtubeEmbed || '')
            : (payload.url || payload.image || '');
          const body = {
            type: isVideo ? 'video' : 'image',
            title: payload.title || (isVideo ? 'Video Naray' : 'Foto Kegiatan'),
            url: mediaUrl,
            description: payload.description || payload.desc || '',
            category_id: payload.category_id || 1,
            status: payload.status || 'active',
          };
          res = await api.adminCreateMedia(body);
          break;
        }
      }

      // Instant optimistic local update & non-blocking background sync
      const createdItem = res?.data || payload;
      const createdDbId = createdItem.id;
      const clientFinalId = createdDbId ? `${entity}-${createdDbId}` : (payload.id || `${entity}-${Date.now()}`);

      let itemToSave = { ...payload, ...createdItem, id: clientFinalId, dbId: createdDbId };
      if (typeof itemToSave.category === 'object') {
        itemToSave.category = itemToSave.category?.name || payload.category || 'Kegiatan Naray';
      }
      if (typeof itemToSave.specialtyGroup === 'object') {
        itemToSave.specialtyGroup = itemToSave.specialtyGroup?.name || 'Dokter Spesialis';
      }
      if (typeof itemToSave.specialty === 'object') {
        itemToSave.specialty = itemToSave.specialty?.name || 'Spesialis';
      }
      saveItem(entity, itemToSave);
      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));

      return { success: true, data: res?.data || res };
    } catch (err) {
      console.warn(`[HospitalDataContext] Gagal adminCreate (${entity}):`, err);
      saveItem(entity, payload);
      return { success: false, message: err.message };
    }
  };

  const cleanNumericId = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return null;
    const match = String(val).match(/\d+$/);
    return match ? Number(match[0]) : val;
  };

  const adminUpdate = async (entity, id, payload) => {
    try {
      let res;
      const rawTargetId = payload.dbId || payload.id || id;
      const targetId = cleanNumericId(rawTargetId);
      switch (entity) {
        case 'article': {
          const body = {
            title: payload.title,
            slug: payload.slug || undefined,
            content: payload.content || payload.excerpt || payload.title,
            thumbnail_url: payload.thumbnail_url || payload.image || payload.thumbnail,
            status: payload.status || 'published',
            category_id: payload.category_id || 1,
          };
          res = await api.adminUpdateArticle(targetId, body);
          const rawArt = res?.data || { ...payload, id: targetId, dbId: targetId };
          const mapped = mapArticle(rawArt);
          if (body.thumbnail_url) {
            mapped.image = formatImageUrl(body.thumbnail_url, '/images/default-image.svg');
            mapped.thumbnail_url = body.thumbnail_url;
          }
          saveItem('article', { ...mapped, id: rawTargetId, dbId: targetId }, true);
          loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
          return { success: true, data: mapped };
        }
        case 'doctor': {
          const specId = Number(payload.specialization_id) || 1;
          const body = {
            name: payload.name,
            specialization_id: specId,
            branch_id: Number(payload.branch_id) || 1,
            phone: payload.phone || null,
            email: payload.email || null,
            photo_url: payload.photo_url || payload.photo || null,
            bio: payload.bio || '',
            status: payload.status || 'active',
            practice_days: Array.isArray(payload.practice_days) ? payload.practice_days : undefined,
            start_time: payload.start_time || undefined,
            end_time: payload.end_time || undefined,
            poliklinik_id: payload.poliklinik_id ? Number(payload.poliklinik_id) : undefined,
          };
          res = await api.adminUpdateDoctor(targetId, body);
          const rawDoc = res?.data || { ...payload, id: targetId, dbId: targetId, specialization_id: specId };
          const mappedDoc = mapDoctor(rawDoc, specializationsList);
          if (body.photo_url) {
            mappedDoc.photo = formatImageUrl(body.photo_url, '/images/default-doctor.svg');
            mappedDoc.photo_url = body.photo_url;
          }
          saveItem('doctor', { ...mappedDoc, id: rawTargetId, dbId: targetId }, true);
          loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
          return { success: true, data: mappedDoc };
        }
        case 'poliklinik': {
          const body = {
            name: payload.name,
            description: payload.description || payload.desc || '',
            branch_id: 1,
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
          };
          res = await api.adminUpdatePoliklinik(targetId, body);
          break;
        }
        case 'mcu': {
          const priceNum = Number(String(payload.price).replace(/[^0-9]/g, '')) || 500000;
          let description = payload.highlight || '';
          if (Array.isArray(payload.items) && payload.items.length > 0) {
            description += '\n' + payload.items.map(i => `- ${i}`).join('\n');
          } else if (payload.description) {
            description = payload.description;
          }
          const body = {
            name: payload.name,
            slug: payload.slug || undefined,
            price: priceNum,
            description,
            image_url: payload.image_url || null,
            status: payload.status || 'active',
          };
          res = await api.adminUpdateMcuPackage(targetId, body);
          break;
        }
        case 'room': {
          const priceNum = Number(String(payload.price || payload.price_per_night).replace(/[^0-9]/g, '')) || 750000;
          let descText = payload.description || '';
          if (Array.isArray(payload.facilities) && payload.facilities.length > 0) {
            descText = (payload.description || '') + '\n' + payload.facilities.map(f => `- ${f}`).join('\n');
          }
          const body = {
            name: payload.name,
            capacity: payload.capacity || '1 - 2 Pasien per Kamar',
            description: descText,
            price_per_night: priceNum,
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminUpdateRoomType(targetId, body);
          if (res?.data) {
            const mapped = mapRoom(res.data);
            if (body.image_url) {
              mapped.image = formatImageUrl(body.image_url, '/images/default-image.svg');
              mapped.image_url = body.image_url;
            }
            saveItem('room', { ...mapped, id: rawTargetId, dbId: targetId }, true);
            loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
            return { success: true, data: mapped };
          }
          break;
        }
        case 'facility': {
          const body = {
            name: payload.name,
            description: payload.description || '',
            type: payload.type || 'advanced',
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminUpdateFacility(targetId, body);
          break;
        }
        case 'center': {
          const titleStr = payload.title || payload.name || 'Pusat Unggulan';
          const body = {
            name: titleStr,
            slug: payload.slug || titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `center-${targetId}`,
            description: (payload.tagline ? `${payload.tagline}\n` : '') + (payload.description || ''),
            image_url: payload.image_url || payload.image || null,
            status: payload.status || 'active',
            branch_id: 1,
          };
          res = await api.adminUpdateCenterOfExcellence(targetId, body);
          break;
        }
        case 'gallery':
        case 'video':
        case 'media': {
          const isVideo = payload.type === 'video' || entity === 'video';
          const mediaUrl = isVideo
            ? (payload.url || payload.youtubeEmbed || '')
            : (payload.url || payload.image || '');
          const body = {
            type: isVideo ? 'video' : 'image',
            title: payload.title,
            url: mediaUrl,
            description: payload.description || payload.desc || '',
            category_id: payload.category_id || 1,
            status: payload.status || 'active',
          };
          res = await api.adminUpdateMedia(targetId, body);
          break;
        }
        default:
          saveItem(entity, { ...payload, id }, true);
          return { success: true };
      }

      // Instant optimistic local update & non-blocking background sync
      const updatedItem = res?.data || payload;
      let itemToSave = { ...payload, ...updatedItem, id: rawTargetId, dbId: targetId };
      if (payload.image_url) {
        itemToSave.image = formatImageUrl(payload.image_url, '/images/default-image.svg');
        itemToSave.image_url = payload.image_url;
      }
      if (payload.photo_url) {
        itemToSave.photo = formatImageUrl(payload.photo_url, '/images/default-doctor.svg');
        itemToSave.photo_url = payload.photo_url;
      }
      if (payload.thumbnail_url) {
        itemToSave.image = formatImageUrl(payload.thumbnail_url, '/images/default-image.svg');
        itemToSave.thumbnail_url = payload.thumbnail_url;
      }
      if (payload.url) {
        itemToSave.image = formatImageUrl(payload.url, '/images/default-image.svg');
        itemToSave.url = payload.url;
      }
      if (typeof itemToSave.category === 'object') {
        itemToSave.category = itemToSave.category?.name || payload.category || 'Kegiatan Naray';
      }
      if (typeof itemToSave.specialtyGroup === 'object') {
        itemToSave.specialtyGroup = itemToSave.specialtyGroup?.name || 'Dokter Spesialis';
      }
      if (typeof itemToSave.specialty === 'object') {
        itemToSave.specialty = itemToSave.specialty?.name || 'Spesialis';
      }
      saveItem(entity, itemToSave, true);
      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));

      return { success: true, data: res?.data || res };
    } catch (err) {
      console.warn(`[HospitalDataContext] Gagal adminUpdate (${entity}):`, err);
      saveItem(entity, { ...payload, id }, true);
      return { success: false, message: err.message };
    }
  };

  const adminDelete = async (entity, id, dbId) => {
    try {
      const rawTargetId = dbId || id;
      const targetId = cleanNumericId(rawTargetId);
      switch (entity) {
        case 'article':
          await api.adminDeleteArticle(targetId);
          break;
        case 'doctor':
          await api.adminDeleteDoctor(targetId);
          break;
        case 'poliklinik':
          await api.adminDeletePoliklinik(targetId);
          break;
        case 'mcu':
          await api.adminDeleteMcuPackage(targetId);
          break;
        case 'room':
          await api.adminDeleteRoomType(targetId);
          break;
        case 'facility':
          await api.adminDeleteFacility(targetId);
          break;
        case 'center':
          await api.adminDeleteCenterOfExcellence(targetId);
          break;
        case 'gallery':
        case 'video':
        case 'media':
          await api.adminDeleteMedia(targetId);
          break;
        default:
          break;
      }
      deleteItem(entity, id);
      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true };
    } catch (err) {
      console.warn(`[HospitalDataContext] Gagal adminDelete (${entity}):`, err);
      deleteItem(entity, id);
      return { success: false, message: err.message };
    }
  };

  // ── DOCTOR SCHEDULES DEDICATED CRUD ──
  const doctorSchedules = useMemo(() => {
    const list = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    (doctors || []).forEach(doc => {
      (doc.schedules || []).forEach((sch, idx) => {
        const schId = sch.id || `${doc.id || doc.dbId}-sch-${idx}`;
        const schDbId = typeof sch.id === 'number' ? sch.id : null;
        const docDbId = doc.dbId || (typeof doc.id === 'number' ? doc.id : null);
        const dayNum = typeof sch.day_of_week === 'number'
          ? (sch.day_of_week === 0 ? 7 : sch.day_of_week)
          : (DAY_NAME_TO_NUM[String(sch.day || '').toLowerCase()] === 0 ? 7 : (DAY_NAME_TO_NUM[String(sch.day || '').toLowerCase()] ?? 1));

        // Cari apakah ada cuti/tidak praktik yang berlaku hari ini KHUSUS untuk sesi jadwal ini
        const scheduleLeaveToday = (doctorLeaves || []).find(l => {
          if (l.status === 'cancelled') return false;
          const matchDoc = String(l.doctor_id) === String(docDbId || doc.id);
          if (!matchDoc) return false;

          // 1. Jika cuti terikat ke spesifik schedule ID:
          if (l.doctor_schedule_id && schDbId) {
            if (String(l.doctor_schedule_id) !== String(schDbId)) return false;
          } else if (!l.doctor_schedule_id) {
            // 2. Jika cuti untuk seluruh sesi dokter, hanya berlaku bila hari jadwal ini termasuk dalam rentang tanggal cuti
            const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
            const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
            if (!rangeIncludesDayOfWeek(s, e, dayNum)) return false;
          }

          // 3. Pastikan cuti sedang berlangsung hari ini
          const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
          const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
          return s && e && s <= todayStr && todayStr <= e;
        });

        // Cari juga apakah ada cuti mendatang (upcoming) untuk sesi jadwal ini
        const scheduleLeaveUpcoming = (doctorLeaves || []).find(l => {
          if (l.status === 'cancelled') return false;
          const matchDoc = String(l.doctor_id) === String(docDbId || doc.id);
          if (!matchDoc) return false;

          if (l.doctor_schedule_id && schDbId) {
            if (String(l.doctor_schedule_id) !== String(schDbId)) return false;
          } else if (!l.doctor_schedule_id) {
            const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
            const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
            if (!rangeIncludesDayOfWeek(s, e, dayNum)) return false;
          }

          const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
          return s && s > todayStr;
        });

        const isSlotOnLeave = Boolean(scheduleLeaveToday);

        list.push({
          id: schId,
          dbId: schDbId,
          doctorId: doc.id,
          doctorDbId: docDbId,
          doctorName: doc.name,
          doctorPhoto: doc.photo || doc.photo_url,
          doctorSpecialty: doc.specialty || doc.specialization?.name || 'Spesialis',
          day: sch.day || 'Senin',
          day_of_week: dayNum,
          time: sch.time || `${sch.rawStartTime || '09:00'} - ${sch.rawEndTime || '14:00'} WIB`,
          startTime: sch.rawStartTime || (sch.time ? sch.time.split(' - ')[0] : '09:00'),
          endTime: sch.rawEndTime || (sch.time ? sch.time.split(' - ')[1]?.replace(' WIB', '') : '14:00'),
          room: sch.room || `Poliklinik ${doc.specialty || 'Spesialis'}`,
          poliklinikId: sch.poliklinikId || doc.assignedPoliId || 1,
          status: sch.status || 'active',
          doctorStatus: doc.status || 'active',
          doctorIsOnLeave: isSlotOnLeave,
          doctorCurrentLeave: scheduleLeaveToday || null,
          doctorUpcomingLeave: scheduleLeaveUpcoming || null,
          isPracticing: (sch.status || 'active') === 'active' && (doc.status || 'active') === 'active' && !isSlotOnLeave,
        });
      });
    });
    return list;
  }, [doctors, doctorLeaves]);

  const createDoctorSchedule = async (scheduleData) => {
    try {
      const docDbId = cleanNumericId(scheduleData.doctor_id || scheduleData.doctorId || scheduleData.doctorDbId);
      const poliDbId = cleanNumericId(scheduleData.poliklinik_id || scheduleData.poliklinikId) || 1;
      const dayNum = typeof scheduleData.day_of_week === 'number'
        ? scheduleData.day_of_week
        : (DAY_NAME_TO_NUM[String(scheduleData.day || '').toLowerCase()] ?? 1);
      const startTime = (scheduleData.start_time || scheduleData.startTime || '09:00').slice(0, 5);
      const endTime = (scheduleData.end_time || scheduleData.endTime || '14:00').slice(0, 5);
      const status = scheduleData.status || 'active';

      let apiRes;
      try {
        apiRes = await api.adminCreateDoctorSchedule({
          doctor_id: docDbId,
          poliklinik_id: poliDbId,
          day_of_week: dayNum,
          start_time: startTime,
          end_time: endTime,
          status,
        });
      } catch (err) {
        console.warn('[HospitalDataContext] Gagal simpan ke backend schedule:', err.message);
      }

      const newSchId = apiRes?.data?.id || `sch-${Date.now()}`;
      const dayName = DAY_NUM_TO_NAME[dayNum] || 'Senin';
      const poliObj = poliklinikList.find(p => p.dbId === poliDbId || p.id === poliDbId) || { name: 'Poliklinik Spesialis' };
      const poliName = poliObj.name.startsWith('Poliklinik') ? poliObj.name : `Poliklinik ${poliObj.name}`;

      const newScheduleItem = {
        id: newSchId,
        day: dayName,
        time: `${startTime} - ${endTime} WIB`,
        rawStartTime: startTime,
        rawEndTime: endTime,
        room: poliName,
        poliklinikId: poliDbId,
        status,
      };

      setDoctors(prev => prev.map(doc => {
        if (doc.id === scheduleData.doctorId || doc.dbId === docDbId) {
          const currentSchedules = Array.isArray(doc.schedules) ? doc.schedules : [];
          const updatedSchedules = [...currentSchedules, newScheduleItem];
          const availableDays = Array.from(new Set([...(doc.availableDays || []), dayName]))
            .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
          return {
            ...doc,
            schedules: updatedSchedules,
            availableDays,
          };
        }
        return doc;
      }));

      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true, message: 'Jadwal praktik dokter berhasil ditambahkan' };
    } catch (err) {
      console.error('[HospitalDataContext] createDoctorSchedule error:', err);
      return { success: false, message: err.message };
    }
  };

  const updateDoctorSchedule = async (scheduleId, scheduleData, explicitDbId) => {
    try {
      const targetId = cleanNumericId(explicitDbId || scheduleData?.dbId || scheduleId);
      const docDbId = cleanNumericId(scheduleData.doctor_id || scheduleData.doctorId || scheduleData.doctorDbId);
      const poliDbId = cleanNumericId(scheduleData.poliklinik_id || scheduleData.poliklinikId) || 1;
      const dayNum = typeof scheduleData.day_of_week === 'number'
        ? scheduleData.day_of_week
        : (DAY_NAME_TO_NUM[String(scheduleData.day || '').toLowerCase()] ?? 1);
      const startTime = (scheduleData.start_time || scheduleData.startTime || '09:00').slice(0, 5);
      const endTime = (scheduleData.end_time || scheduleData.endTime || '14:00').slice(0, 5);
      const status = scheduleData.status || 'active';

      if (targetId) {
        try {
          await api.adminUpdateDoctorSchedule(targetId, {
            doctor_id: docDbId,
            poliklinik_id: poliDbId,
            day_of_week: dayNum,
            start_time: startTime,
            end_time: endTime,
            status,
          });
        } catch (err) {
          console.warn('[HospitalDataContext] Gagal update ke backend schedule:', err.message);
        }
      }

      const dayName = DAY_NUM_TO_NAME[dayNum] || 'Senin';
      const poliObj = poliklinikList.find(p => p.dbId === poliDbId || p.id === poliDbId) || { name: 'Poliklinik Spesialis' };
      const poliName = poliObj.name.startsWith('Poliklinik') ? poliObj.name : `Poliklinik ${poliObj.name}`;

      setDoctors(prev => prev.map(doc => {
        const currentSchedules = Array.isArray(doc.schedules) ? doc.schedules : [];
        const hasSchedule = currentSchedules.some(s => s.id === scheduleId || s.id === targetId);

        if (hasSchedule) {
          const updatedSchedules = currentSchedules.map(s => {
            if (s.id === scheduleId || s.id === targetId) {
              return {
                ...s,
                day: dayName,
                time: `${startTime} - ${endTime} WIB`,
                rawStartTime: startTime,
                rawEndTime: endTime,
                room: poliName,
                poliklinikId: poliDbId,
                status,
              };
            }
            return s;
          });
          const availableDays = Array.from(new Set(updatedSchedules.map(s => s.day).filter(Boolean)))
            .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
          return {
            ...doc,
            schedules: updatedSchedules,
            availableDays,
          };
        }
        return doc;
      }));

      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true, message: 'Jadwal praktik dokter berhasil diperbarui' };
    } catch (err) {
      console.error('[HospitalDataContext] updateDoctorSchedule error:', err);
      return { success: false, message: err.message };
    }
  };

  const deleteDoctorSchedule = async (scheduleId, dbId) => {
    try {
      const targetId = cleanNumericId(dbId || scheduleId);
      if (targetId) {
        try {
          await api.adminDeleteDoctorSchedule(targetId);
        } catch (err) {
          console.warn('[HospitalDataContext] Gagal delete ke backend schedule:', err.message);
        }
      }

      setDoctors(prev => prev.map(doc => {
        const currentSchedules = Array.isArray(doc.schedules) ? doc.schedules : [];
        const filteredSchedules = currentSchedules.filter(s => s.id !== scheduleId && s.id !== targetId);
        const availableDays = Array.from(new Set(filteredSchedules.map(s => s.day).filter(Boolean)))
          .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
        return {
          ...doc,
          schedules: filteredSchedules,
          availableDays,
        };
      }));

      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true, message: 'Jadwal praktik berhasil dihapus' };
    } catch (err) {
      console.error('[HospitalDataContext] deleteDoctorSchedule error:', err);
      return { success: false, message: err.message };
    }
  };

  const toggleDoctorStatus = async (doctor) => {
    const currentStatus = doctor.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const targetId = cleanNumericId(doctor.dbId || doctor.id);

    // Optimistic local update
    setDoctors(prev => prev.map(d => {
      if (d.id === doctor.id || (targetId && d.dbId === targetId)) {
        const hasActiveSchedules = (d.schedules || []).some(s => s.status === 'active');
        const isPracticing = newStatus === 'active' && hasActiveSchedules;
        return {
          ...d,
          status: newStatus,
          isPracticing,
          practiceStatusText: isPracticing ? 'Praktik' : 'Tidak Praktik',
        };
      }
      return d;
    }));

    try {
      if (targetId) {
        await api.adminUpdateDoctor(targetId, {
          name: doctor.name,
          specialization_id: doctor.specialization_id || doctor.specialization?.id || 1,
          branch_id: doctor.branch_id || 1,
          status: newStatus,
        });
      }
      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true, newStatus };
    } catch (err) {
      console.warn('[HospitalDataContext] Gagal toggleDoctorStatus:', err);
      setDoctors(prev => prev.map(d => (d.id === doctor.id || (targetId && d.dbId === targetId) ? { ...d, status: currentStatus } : d)));
      return { success: false, message: err.message };
    }
  };

  const toggleScheduleStatus = async (schedule) => {
    const currentStatus = schedule.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return updateDoctorSchedule(schedule.id, { ...schedule, status: newStatus }, schedule.dbId);
  };

  // ── DOCTOR LEAVES (CUTI DOKTER BERBASIS RENTANG TANGGAL) ──
  const fetchDoctorLeaves = async (params = {}) => {
    try {
      const res = await api.adminGetDoctorLeaves(params);
      if (res?.success && Array.isArray(res.data)) {
        setDoctorLeaves(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('[HospitalDataContext] Gagal fetchDoctorLeaves:', err);
    }
    return [];
  };

  const adminCreateDoctorLeave = async (leaveData) => {
    try {
      const docDbId = cleanNumericId(leaveData.doctor_id || leaveData.doctorId || leaveData.doctorDbId);
      const scheduleDbId = cleanNumericId(leaveData.doctor_schedule_id || leaveData.doctorScheduleId || leaveData.scheduleId);
      const res = await api.adminCreateDoctorLeave({
        doctor_id: docDbId,
        doctor_schedule_id: scheduleDbId || null,
        start_date: leaveData.start_date || leaveData.startDate,
        end_date: leaveData.end_date || leaveData.endDate || leaveData.start_date || leaveData.startDate,
        reason: leaveData.reason || 'Cuti Tahunan',
        notes: leaveData.notes || '',
        status: leaveData.status || 'active',
      });
      if (res?.success && res.data) {
        setDoctorLeaves(prev => [res.data, ...prev]);
        loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || 'Gagal menambahkan cuti dokter');
    } catch (err) {
      console.error('[HospitalDataContext] adminCreateDoctorLeave error:', err);
      return { success: false, message: err.message };
    }
  };

  const adminUpdateDoctorLeave = async (id, leaveData) => {
    try {
      const targetId = cleanNumericId(id || leaveData.id);
      const res = await api.adminUpdateDoctorLeave(targetId, {
        doctor_id: cleanNumericId(leaveData.doctor_id || leaveData.doctorId),
        start_date: leaveData.start_date || leaveData.startDate,
        end_date: leaveData.end_date || leaveData.endDate,
        reason: leaveData.reason,
        notes: leaveData.notes,
        status: leaveData.status,
      });
      if (res?.success && res.data) {
        setDoctorLeaves(prev => prev.map(l => (l.id === targetId ? res.data : l)));
        loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || 'Gagal memperbarui cuti dokter');
    } catch (err) {
      console.error('[HospitalDataContext] adminUpdateDoctorLeave error:', err);
      return { success: false, message: err.message };
    }
  };

  const adminDeleteDoctorLeave = async (id) => {
    try {
      const targetId = cleanNumericId(id);
      await api.adminDeleteDoctorLeave(targetId);
      setDoctorLeaves(prev => prev.filter(l => l.id !== targetId));
      loadBackendData().catch(e => console.warn('[HospitalDataContext] Background sync failed:', e));
      return { success: true };
    } catch (err) {
      console.error('[HospitalDataContext] adminDeleteDoctorLeave error:', err);
      return { success: false, message: err.message };
    }
  };

  // Helper pencocokan item fleksibel (mendukung ID numerik murni, string id ber-prefix, dbId, dan slug)
  const isMatchItem = (a, b) => {
    if (!a || !b) return false;
    if (a.id === b.id || String(a.id) === String(b.id)) return true;
    if (a.dbId && b.dbId && Number(a.dbId) === Number(b.dbId)) return true;
    if (a.dbId && (String(b.id).endsWith(`-${a.dbId}`) || String(b.id) === String(a.dbId))) return true;
    if (b.dbId && (String(a.id).endsWith(`-${b.dbId}`) || String(a.id) === String(b.dbId))) return true;
    if (a.slug && b.slug && a.slug === b.slug) return true;
    return false;
  };

  // CRUD Universal Handler (Local & Backend Sync)
  const saveItem = (entityType, itemData, skipBackendSync = false) => {
    const isNew = !itemData.id || itemData.isNew;
    const finalId = itemData.id && !itemData.isNew ? itemData.id : `${entityType}-${Date.now()}`;
    const cleanItem = { ...itemData, id: finalId };
    delete cleanItem.isNew;

    switch (entityType) {
      case 'poliklinik':
        setPoliklinikList(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [...prev, cleanItem];
        });
        break;

      case 'doctor':
        setDoctors(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [cleanItem, ...prev];
        });
        break;

      case 'center':
        setCentersOfExcellence(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [...prev, cleanItem];
        });
        break;

      case 'facility':
        setFacilitiesData(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [...prev, cleanItem];
        });
        break;

      case 'room':
        setInpatientRooms(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [...prev, cleanItem];
        });
        break;

      case 'mcu':
      case 'package':
        setMcuPackages(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cleanItem };
            return next;
          }
          return [...prev, cleanItem];
        });
        break;

      case 'gallery':
      case 'media': {
        const catName = typeof cleanItem.category === 'object'
          ? (cleanItem.category?.name || 'Kegiatan Naray')
          : (cleanItem.category || 'Kegiatan Naray');
        const normalized = { ...cleanItem, category: catName };
        if (normalized.type === 'video' || normalized.youtubeEmbed) {
          setVideoList(prev => {
            const idx = prev.findIndex(x => isMatchItem(x, normalized));
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...normalized };
              return next;
            }
            return [normalized, ...prev];
          });
        } else {
          setGalleryActivities(prev => {
            const idx = prev.findIndex(x => isMatchItem(x, normalized));
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...normalized };
              return next;
            }
            return [normalized, ...prev];
          });
        }
        break;
      }

      case 'video': {
        const catName = typeof cleanItem.category === 'object'
          ? (cleanItem.category?.name || 'Edukasi Pasien')
          : (cleanItem.category || 'Edukasi Pasien');
        const normalized = { ...cleanItem, category: catName };
        setVideoList(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, normalized));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...normalized };
            return next;
          }
          return [normalized, ...prev];
        });
        break;
      }

      case 'article': {
        const catName = typeof cleanItem.category === 'object'
          ? (cleanItem.category?.name || 'Kesehatan Umum')
          : (cleanItem.category || 'Kesehatan Umum');
        const normalized = { ...cleanItem, category: catName };
        setHealthArticles(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, normalized));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...normalized };
            return next;
          }
          return [normalized, ...prev];
        });
        break;
      }

      case 'banner':
      case 'banners': {
        setBannerSlides(prev => {
          const idx = prev.findIndex(x => isMatchItem(x, cleanItem));
          let updated;
          if (idx >= 0) {
            updated = [...prev];
            updated[idx] = { ...updated[idx], ...cleanItem };
          } else {
            updated = [...prev, { ...cleanItem, id: cleanItem.id || `slide-${Date.now()}` }];
          }
          try {
            localStorage.setItem('naray_banner_slides', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed saving banner slides:', e);
          }
          return updated;
        });
        break;
      }

      case 'leadership':
      case 'leadershipMessage': {
        setLeadershipMessage(prev => {
          const updated = { ...prev, ...cleanItem };
          try {
            localStorage.setItem('naray_leadership_message', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed saving leadership message:', e);
          }
          return updated;
        });
        break;
      }

      default:
        console.warn('Unknown entityType:', entityType);
    }

    // Jika dipanggil dari komponen luar (misal AdminEditModal), simpan otomatis ke backend
    if (!skipBackendSync) {
      const targetId = cleanItem.dbId || cleanNumericId(cleanItem.id);
      if (targetId && !isNew) {
        adminUpdate(entityType, targetId, cleanItem).catch(err => {
          console.warn(`[HospitalDataContext] Background saveItem sync failed for ${entityType}:`, err);
        });
      } else if (isNew) {
        adminCreate(entityType, cleanItem).catch(err => {
          console.warn(`[HospitalDataContext] Background saveItem create failed for ${entityType}:`, err);
        });
      }
    }
  };

  const deleteItem = (entityType, id) => {
    switch (entityType) {
      case 'poliklinik':
        setPoliklinikList(prev => prev.filter(x => x.id !== id));
        break;
      case 'doctor':
        setDoctors(prev => prev.filter(x => x.id !== id));
        break;
      case 'center':
        setCentersOfExcellence(prev => prev.filter(x => x.id !== id));
        break;
      case 'facility':
        setFacilitiesData(prev => prev.filter(x => x.id !== id));
        break;
      case 'room':
        setInpatientRooms(prev => prev.filter(x => x.id !== id));
        break;
      case 'mcu':
      case 'package':
        setMcuPackages(prev => prev.filter(x => x.id !== id));
        break;
      case 'media':
      case 'gallery':
        setGalleryActivities(prev => prev.filter(x => x.id !== id));
        setVideoList(prev => prev.filter(x => x.id !== id));
        break;
      case 'video':
        setVideoList(prev => prev.filter(x => x.id !== id));
        break;
      case 'article':
        setHealthArticles(prev => prev.filter(x => x.id !== id));
        break;
      case 'banner':
      case 'banners':
        setBannerSlides(prev => {
          const updated = prev.filter(x => x.id !== id);
          try {
            localStorage.setItem('naray_banner_slides', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed saving banner slides:', e);
          }
          return updated;
        });
        break;
      default:
        console.warn('Unknown entityType:', entityType);
    }
  };

  const resetToDefaultData = () => {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.IS_ADMIN && k !== STORAGE_KEYS.ADMIN_TOKEN && k !== STORAGE_KEYS.ADMIN_USER) {
        try { localStorage.removeItem(k); } catch (e) { }
      }
    });
    try { localStorage.removeItem('naray_banner_slides'); } catch (e) { }
    try { localStorage.removeItem('naray_leadership_message'); } catch (e) { }
    setBannerSlides(DEFAULT_BANNER_SLIDES);
    setLeadershipMessage(DEFAULT_LEADERSHIP_MESSAGE);
    loadBackendData();
  };

  const refreshSurgeryData = async (force = true) => {
    try {
      const res = await api.getSurgerySchedules({ force: force ? '1' : '0' });
      if (res?.data) {
        setSimrsSurgeryData(res.data);
        return res.data;
      }
    } catch (e) {
      console.warn('Failed refreshing surgery schedule:', e);
    }
    return null;
  };

  return (
    <HospitalDataContext.Provider
      value={{
        isAdmin,
        adminToken,
        adminUser,
        adminAppointments,
        adminDashboardStats,
        isLoadingAdminAppointments,
        fetchAdminAppointments,
        fetchAdminInit,
        updateAppointmentStatus,
        adminDeleteAppointment,
        fetchAdminDashboardStats,
        loginAdmin,
        logoutAdmin,
        adminUsers,
        adminUserStats,
        isLoadingAdminUsers,
        fetchAdminUsers,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminToggleUserStatus,
        poliklinikList,
        specializationsList,
        setSpecializationsList,
        createSpecialization,
        doctors,
        centersOfExcellence,
        facilitiesData,
        facilities: facilitiesData,
        inpatientRooms,
        simrsBedData,
        simrsDoctorSchedules,
        simrsSurgeryData,
        refreshSurgeryData,
        mcuPackages,
        galleryActivities,
        videoList,
        healthArticles,
        bannerSlides,
        setBannerSlides,
        leadershipMessage,
        setLeadershipMessage,
        isBackendConnected,
        isLoadingBackend,
        refreshBackendData: loadBackendData,
        adminCreate,
        adminUpdate,
        adminDelete,
        doctorSchedules,
        createDoctorSchedule,
        updateDoctorSchedule,
        deleteDoctorSchedule,
        toggleDoctorStatus,
        toggleScheduleStatus,
        doctorLeaves,
        fetchDoctorLeaves,
        adminCreateDoctorLeave,
        adminUpdateDoctorLeave,
        adminDeleteDoctorLeave,
        saveItem,
        deleteItem,
        resetToDefaultData,
        formatImageUrl,
        getBackendBaseUrl,
        hospitalInfo,
        setHospitalInfo,
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
}

export function useHospitalData() {
  const context = useContext(HospitalDataContext);
  if (!context) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
}
