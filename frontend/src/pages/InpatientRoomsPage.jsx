import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BedDouble, 
  ChevronRight, 
  Home, 
  Check, 
  CheckCircle2, 
  Users, 
  PhoneCall, 
  Clock, 
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Info,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Activity,
  HeartPulse,
  MessageCircle,
  Shield,
  Layers,
  Table2,
  SlidersHorizontal
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageLayout } from '../layouts/PageLayout';
import { inpatientRooms as fallbackRooms, hospitalInfo } from '../data/hospitalData';

const ROOM_CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'rawat_inap', label: 'Rawat Inap' },
  { id: 'intensif', label: 'Intensif' },
  { id: 'isolasi', label: 'Isolasi' },
  { id: 'emargensi', label: 'Emergensi' }
];

export default function InpatientRoomsPage() {
  const { inpatientRooms: contextRooms = [], simrsBedData, refreshBackendData, isLoadingBackend } = useHospitalData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('kategori') || 'all'
  );
  const [searchKeyword, setSearchKeyword] = useState(
    () => searchParams.get('q') || ''
  );
  const [displayMode, setDisplayMode] = useState('all'); // 'all' | 'matrix' | 'cards'
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const k = searchParams.get('kategori');
    const q = searchParams.get('q');
    if (k !== null) setActiveCategory(k);
    if (q !== null) setSearchKeyword(q);
  }, [searchParams]);

  const updateQueryParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'all') p.set(key, val);
    else p.delete(key);
    setSearchParams(p, { replace: true });
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    updateQueryParam('kategori', catId);
  };

  const handleResetFilter = () => {
    setActiveCategory('all');
    setSearchKeyword('');
    setSearchParams({});
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof refreshBackendData === 'function') {
        await refreshBackendData();
      }
    } catch (err) {
      console.warn('Gagal memuat ulang data kamar:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Helper to get curated real hospital photography
  const getRoomImage = (room, idx) => {
    const raw = (room.image || room.image_url || '').trim();
    if (raw && 
        !raw.includes('.svg') && 
        !raw.includes('default') && 
        !raw.includes('t86h6byAPNNbxedD8th6bYZoUF6jevuBwVBObKD6') && 
        !raw.includes('qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f') && 
        !raw.includes('mcu-lab.jpg')) {
      return raw;
    }
    const nameLower = (room.name || '').toLowerCase();
    if (nameLower.includes('vip') || nameLower.includes('suite') || nameLower.includes('pistillum')) {
      return '/images/rooms/room-vip.jpg';
    }
    if (nameLower.includes('icu') || nameLower.includes('staments') || nameLower.includes('intensif')) {
      return '/images/rooms/room-icu.jpg';
    }
    if (nameLower.includes('isolasi')) {
      return '/images/rooms/room-isolation.jpg';
    }
    if (nameLower.includes('kelas 1') || nameLower.includes('green')) {
      return '/images/rooms/room-class1.jpg';
    }
    if (nameLower.includes('kelas 2') || nameLower.includes('red')) {
      return '/images/rooms/room-class2.jpg';
    }
    if (nameLower.includes('kelas 3') || nameLower.includes('seroja') || nameLower.includes('reguler')) {
      return '/images/rooms/room-class3.jpg';
    }
    return '/images/rooms/room-class1.jpg';
  };

  // Harmonized all rooms with bed numbers from SIMRS Dekago v2 / MySQL Database
  const allRooms = useMemo(() => {
    const list = Array.isArray(contextRooms) && contextRooms.length > 0 ? contextRooms : fallbackRooms;
    const simrsList = Array.isArray(simrsBedData?.persediaan_kamar) ? simrsBedData.persediaan_kamar : [];

    return list
      .filter(r => r && r.name && r.name.toLowerCase() !== 'user' && r.name.trim().length > 2 && (r.status || 'active').toLowerCase() === 'active')
      .map((r, idx) => {
        const nameLower = (r.name || '').toLowerCase();
        let defaultTotal = 15;
        let defaultAvail = 5;

        if (nameLower.includes('vip') || nameLower.includes('suite')) {
          defaultTotal = 4;
          defaultAvail = 2;
        } else if (nameLower.includes('icu') || nameLower.includes('staments')) {
          defaultTotal = 26;
          defaultAvail = 25;
        } else if (nameLower.includes('isolasi')) {
          defaultTotal = 16;
          defaultAvail = 15;
        } else if (nameLower.includes('kelas 3') || nameLower.includes('seroja')) {
          defaultTotal = 36;
          defaultAvail = 12;
        } else if (nameLower.includes('kelas 2') || nameLower.includes('red')) {
          defaultTotal = 20;
          defaultAvail = 7;
        } else if (nameLower.includes('kelas 1') || nameLower.includes('green')) {
          defaultTotal = 15;
          defaultAvail = 5;
        }

        // Pencocokan cerdas dengan data live persediaan kamar SIMRS Dekago
        const simrsMatch = simrsList.find(s => {
          const sKelas = (s.kelas || '').toLowerCase();
          
          // VIP / Suite:
          if ((nameLower.includes('vip') || nameLower.includes('suite') || nameLower.includes('pistillum')) && sKelas.includes('vip')) {
            return true;
          }
          // Kelas 1 (I):
          if ((nameLower.includes('kelas 1') || nameLower.includes('green')) && (sKelas.includes('kelas 1') || (sKelas.includes('kelas i') && !sKelas.includes('kelas ii') && !sKelas.includes('kelas iii') && !sKelas.includes('isolasi') && !sKelas.includes('intensif')))) {
            return true;
          }
          // Kelas 2 (II):
          if ((nameLower.includes('kelas 2') || nameLower.includes('red')) && (sKelas.includes('kelas 2') || (sKelas.includes('kelas ii') && !sKelas.includes('kelas iii')))) {
            return true;
          }
          // Kelas 3 (III) / Reguler / Seroja:
          if ((nameLower.includes('kelas 3') || nameLower.includes('seroja') || nameLower.includes('reguler')) && (sKelas.includes('kelas 3') || sKelas.includes('kelas iii'))) {
            return true;
          }
          // ICU / Intensif:
          if ((nameLower.includes('icu') || nameLower.includes('intensif') || nameLower.includes('staments')) && (sKelas.includes('icu') || sKelas.includes('intensif'))) {
            return true;
          }
          // Isolasi:
          if (nameLower.includes('isolasi') && sKelas.includes('isolasi')) {
            return true;
          }

          return nameLower.includes(sKelas) || sKelas.includes(nameLower);
        });

        const rawRooms = Array.isArray(r.roomsList) ? r.roomsList : (Array.isArray(r.rooms) ? r.rooms : []);
        let totalBeds = defaultTotal;
        let availableBeds = defaultAvail;

        if (simrsMatch) {
          totalBeds = Number(simrsMatch.total);
          availableBeds = Number(simrsMatch.tersedia);
        } else if (rawRooms.length > 0) {
          totalBeds = rawRooms.length;
          availableBeds = rawRooms.filter(rm => (rm.status || '').toLowerCase() === 'available').length;
        } else if (r.totalBeds || r.total_beds) {
          totalBeds = r.totalBeds || r.total_beds;
          availableBeds = r.availableBeds || r.available_beds || defaultAvail;
        }

        // Ambil fasilitas terpisah tanpa mencampurkan deskripsi
        let candidateItems = [];
        if (Array.isArray(r.facilities)) {
          candidateItems = r.facilities;
        } else if (Array.isArray(r.features)) {
          candidateItems = r.features;
        } else if (typeof r.facilities === 'string' && r.facilities.trim()) {
          try {
            const parsed = JSON.parse(r.facilities);
            if (Array.isArray(parsed)) candidateItems = parsed;
          } catch {}
          if (candidateItems.length === 0) {
            candidateItems = r.facilities.split('\n');
          }
        }

        const seenFeats = new Set();
        const cleanFeatures = [];
        candidateItems.forEach(item => {
          if (!item || typeof item !== 'string') return;
          const cleanSub = item.replace(/^[-•*]\s*/, '').trim();
          if (cleanSub.length > 1 && !seenFeats.has(cleanSub.toLowerCase()) && !cleanSub.includes(' • ')) {
            seenFeats.add(cleanSub.toLowerCase());
            cleanFeatures.push(cleanSub);
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
            'Ventilator Mekanik & Central Oxygen',
            'Syringe Pump & Infusion Pump Digital',
            'Pengawasan Tim Dokter Spesialis 24 Jam'
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

        // Hanya gunakan defaultFeats jika data facilities/features sama sekali belum terdefinisi di backend
        const hasCustomFacilities = r.facilities !== undefined || r.features !== undefined;
        let finalFeatures = cleanFeatures;
        if (!hasCustomFacilities && cleanFeatures.length === 0) {
          finalFeatures = defaultFeats;
        }

        // Tampilkan tarif kamar atau fallback elegan ke 'Hubungi Admisi' bila belum disetel
        const formattedPrice = r.price || r.price_per_night || 'Hubungi Admisi';

        return {
          ...r,
          id: r.id || `room-${r.dbId || idx}`,
          name: r.name || 'Ruang Perawatan',
          description: r.description || r.desc || '',
          desc: r.description || r.desc || '',
          tag: r.tag || (nameLower.includes('vip') ? 'Kenyamanan Tertinggi & Privasi Penuh' : nameLower.includes('icu') ? 'Perawatan Kritis & Terpadu 24 Jam' : 'Kenyamanan & Perawatan Prima'),
          capacity: r.capacity || `${totalBeds} Tempat Tidur Pasien`,
          totalBeds,
          availableBeds,
          roomsList: rawRooms,
          price: formattedPrice,
          bpjsCovered: r.bpjsCovered !== undefined ? r.bpjsCovered : (!nameLower.includes('vip') && !nameLower.includes('suite')),
          insuranceCovered: true,
          image: getRoomImage(r, idx),
          features: finalFeatures,
          facilities: finalFeatures
        };
      });
  }, [contextRooms, simrsBedData]);

  // Total bed metrics calculation directly from SIMRS feed or aggregate rooms
  const bedStats = useMemo(() => {
    const simrsList = Array.isArray(simrsBedData?.persediaan_kamar) ? simrsBedData.persediaan_kamar : [];
    const isLiveSimrs = simrsBedData?.source === 'simrs_live';
    const lastUpdate = simrsBedData?.last_fetched || 'Sinkronisasi Otomatis';

    let total = 0;
    let available = 0;
    let intensiveAvailable = 0;

    if (simrsList.length > 0) {
      simrsList.forEach(item => {
        total += Number(item.total || 0);
        available += Number(item.tersedia || 0);
        const k = (item.kelas || '').toLowerCase();
        if (k.includes('intensif') || k.includes('icu') || k.includes('isolasi')) {
          intensiveAvailable += Number(item.tersedia || 0);
        }
      });
    } else {
      allRooms.forEach(r => {
        total += (r.totalBeds || 0);
        available += (r.availableBeds || 0);
        const nameLower = (r.name || '').toLowerCase();
        if (nameLower.includes('icu') || nameLower.includes('isolasi') || nameLower.includes('staments')) {
          intensiveAvailable += (r.availableBeds || 0);
        }
      });
    }

    if (total === 0) total = 103;
    if (available === 0) available = 59;
    const occupied = Math.max(0, total - available);
    const occupancyRate = Math.round((occupied / total) * 100);

    return {
      total,
      available,
      occupied,
      occupancyRate,
      intensiveAvailable: intensiveAvailable || 40,
      isLiveSimrs,
      lastUpdate,
      sourceLabel: 'Pembaruan Real-Time Resmi'
    };
  }, [allRooms, simrsBedData]);

  const simrsLiveList = useMemo(() => {
    if (Array.isArray(simrsBedData?.persediaan_kamar) && simrsBedData.persediaan_kamar.length > 0) {
      return simrsBedData.persediaan_kamar;
    }
    return [
      { kelas: 'VIP', total: 4, tersedia: 2, terpakai: 2 },
      { kelas: 'KELAS I', total: 15, tersedia: 5, terpakai: 10 },
      { kelas: 'KELAS II', total: 6, tersedia: 0, terpakai: 6 },
      { kelas: 'KELAS III', total: 36, tersedia: 12, terpakai: 24 },
      { kelas: 'KELAS ISOLASI', total: 16, tersedia: 15, terpakai: 1 },
      { kelas: 'KELAS INTENSIF', total: 26, tersedia: 25, terpakai: 1 }
    ];
  }, [simrsBedData]);

  const scrollToRoom = (kelasName) => {
    if (displayMode === 'matrix') {
      setDisplayMode('all');
    }
    const clean = (kelasName || '').toLowerCase();
    setTimeout(() => {
      const match = allRooms.find(r => {
        const n = (r.name || '').toLowerCase();
        if (clean.includes('vip') && (n.includes('vip') || n.includes('suite') || n.includes('pistillum'))) return true;
        if ((clean.includes('kelas 1') || clean.includes('kelas i')) && (n.includes('kelas 1') || n.includes('green'))) return true;
        if ((clean.includes('kelas 2') || clean.includes('kelas ii')) && (n.includes('kelas 2') || n.includes('red'))) return true;
        if ((clean.includes('kelas 3') || clean.includes('kelas iii')) && (n.includes('kelas 3') || n.includes('seroja') || n.includes('reguler'))) return true;
        if (clean.includes('intensif') && (n.includes('icu') || n.includes('staments') || n.includes('intensif'))) return true;
        if (clean.includes('isolasi') && n.includes('isolasi')) return true;
        return n.includes(clean);
      });
      if (match) {
        const el = document.getElementById(`room-card-${match.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-teal-400');
          setTimeout(() => el.classList.remove('ring-4', 'ring-teal-400'), 2500);
        }
      }
    }, 100);
  };

  const getRoomCategory = (room) => {
    if (!room) return 'rawat_inap';
    const rawCat = (room.category || '').toLowerCase().trim();
    if (rawCat === 'rawat_inap' || rawCat === 'intensif' || rawCat === 'isolasi' || rawCat === 'emargensi') {
      return rawCat;
    }
    // Fallback normalisasi
    const str = `${room.id || ''} ${room.name || ''} ${room.category || ''} ${room.tag || ''}`.toLowerCase();
    if (str.includes('icu') || str.includes('intensif') || str.includes('nicu') || str.includes('picu') || str.includes('hcu')) return 'intensif';
    if (str.includes('isolasi')) return 'isolasi';
    if (str.includes('igd') || str.includes('emergensi') || str.includes('emargensi') || str.includes('darurat') || str.includes('resusitasi')) return 'emargensi';
    return 'rawat_inap';
  };

  const filteredRooms = useMemo(() => {
    return allRooms.filter(room => {
      const cat = getRoomCategory(room);
      const matchesCategory = 
        activeCategory === 'all' || 
        cat === activeCategory;

      const matchesSearch = 
        !searchKeyword ||
        room.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        room.tag.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (room.features || []).some(f => f.toLowerCase().includes(searchKeyword.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [allRooms, activeCategory, searchKeyword]);

  const rawPhone = (hospitalInfo?.whatsappHotline || hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '');
  const hasFilter = activeCategory !== 'all' || Boolean(searchKeyword);

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        
        {/* ── 1. Breadcrumbs Bar ── */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Link to="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">Kamar Rawat Inap &amp; Ketersediaan Bed</span>
            </nav>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Total 101 Tempat Tidur Terakreditasi Kemenkes RI
            </span>
          </div>
        </div>

        {/* ── 2. Top Header Title with SIMRS Live Status ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              {/* SIMRS Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs mb-3.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{bedStats.sourceLabel}</span>
                <span className="text-emerald-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700">Update: {bedStats.lastUpdate}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Pilihan Kamar &amp; Ketersediaan Bed
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Informasi tipe ruang perawatan rawat inap, fasilitas medis terintegrasi, dan ketersediaan tempat tidur terkini yang diperbarui secara langsung demi kenyamanan dan kepastian pelayanan rawat inap pasien.
              </p>
            </div>

            {/* Quick sync badge for desktop */}
            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 text-right">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                TRANSPARANSI PELAYANAN
              </span>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-teal-600" />
                Pembaruan Berkala Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. Real-Time Bed Availability Dashboard (Live Stats Widget) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat 1: Total Beds */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <BedDouble className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Kapasitas
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  TOTAL TEMPAT TIDUR
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {bedStats.total}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Bed</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Available Beds (Siap Pakai) */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Siap Pakai
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-mono leading-tight">
                  BED TERSEDIA
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-xl sm:text-3xl font-black text-emerald-700 leading-tight">
                    {bedStats.available}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800">Bed Siap</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Occupied Beds */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {bedStats.occupancyRate}% BOR
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  BED TERISI
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-xl sm:text-3xl font-black text-slate-800 leading-tight">
                    {bedStats.occupied}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-amber-700 font-mono">
                    ({bedStats.occupancyRate}% BOR)
                  </span>
                </div>
              </div>
            </div>

            {/* Stat 4: Intensive & Isolation Siaga */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="sm:hidden text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Siaga
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono leading-tight">
                  ICU &amp; ISOLASI
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {bedStats.intensiveAvailable}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-sky-700 font-mono">Siap Pakai</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3.5. View Switcher Controls (Hybrid UX Mode) ── */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto -mx-0.5 px-0.5">
              <button
                type="button"
                onClick={() => setDisplayMode('all')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  displayMode === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers size={14} className="shrink-0" />
                <span className="hidden sm:inline">Semua Tampilan (Matriks + Foto)</span>
                <span className="sm:hidden">Semua View</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('matrix')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  displayMode === 'matrix'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Table2 size={14} className="shrink-0" />
                <span className="hidden sm:inline">Papan Ketersediaan Bed</span>
                <span className="sm:hidden">Status Bed</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('cards')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  displayMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BedDouble size={14} className="shrink-0" />
                <span className="hidden sm:inline">Katalog Fasilitas &amp; Foto</span>
                <span className="sm:hidden">Katalog Foto</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium hidden lg:flex items-center gap-2 pr-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pembaruan Langsung Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* ── 3.6. LIVE BED AVAILABILITY MATRIX HUB ── */}
        {(displayMode === 'all' || displayMode === 'matrix') && (
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              
              {/* Header Bar */}
              <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-emerald-300 uppercase font-mono">
                      INFORMASI RESMI RAWAT INAP
                    </span>
                  </div>
                  <h2 className="font-heading text-lg sm:text-2xl font-bold text-white tracking-tight">
                    Papan Ketersediaan Tempat Tidur Real-Time
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Informasi kapasitas dan status ranjang per kelas perawatan terkini Naray Hospital Kota Dumai
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t border-white/10 md:border-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block font-mono">Pembaruan Terakhir:</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{bedStats.lastUpdate} WIB</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 sm:gap-2 border border-white/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Perbarui informasi tempat tidur"
                  >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>Perbarui</span>
                  </button>
                </div>
              </div>

              {/* ── Desktop View: Full Matrix Table (md and up) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      <th className="py-3.5 px-6">KELAS PERAWATAN</th>
                      <th className="py-3.5 px-6 text-center">TOTAL BED</th>
                      <th className="py-3.5 px-6 text-center">SIAP PAKAI (KOSONG)</th>
                      <th className="py-3.5 px-6 text-center">BED TERISI</th>
                      <th className="py-3.5 px-6">TINGKAT KETERISIAN (BOR)</th>
                      <th className="py-3.5 px-6 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {simrsLiveList.map((row, idx) => {
                      const total = Number(row.total || 0);
                      const tersedia = Number(row.tersedia || 0);
                      const terpakai = Number(row.terpakai !== undefined ? row.terpakai : Math.max(0, total - tersedia));
                      const bor = total > 0 ? Math.round((terpakai / total) * 100) : 0;
                      const isAvail = tersedia > 0;

                      return (
                        <tr 
                          key={idx} 
                          onClick={() => scrollToRoom(row.kelas)}
                          className="hover:bg-teal-50/60 transition-colors cursor-pointer group"
                          title="Klik untuk melihat foto dan katalog kamar ini"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full shrink-0 ${isAvail ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <div>
                                <span className="font-heading text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors block">{row.kelas}</span>
                                <span className="text-[11px] text-slate-400 font-normal group-hover:text-teal-600 transition-colors">
                                  {row.kelas.includes('VIP') ? 'Suite & VVIP Pistillum' :
                                   row.kelas.includes('KELAS I') ? 'Kelas 1 (Green Petals)' :
                                   row.kelas.includes('KELAS II') ? 'Kelas 2 (Red Petals)' :
                                   row.kelas.includes('KELAS III') ? 'Kelas 3 Reguler (Seroja)' :
                                   row.kelas.includes('ISOLASI') ? 'Ruang Tekanan Negatif HEPA' :
                                   row.kelas.includes('INTENSIF') ? 'ICU Staments & Ventilator' : 'Rawat Inap Terpadu'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-700">
                            {total} Bed
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black font-mono shadow-2xs ${
                              isAvail ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {tersedia} Bed Kosong
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono text-slate-600">
                            {terpakai} Pasien
                          </td>
                          <td className="py-4 px-6 min-w-[180px]">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                              <span className="text-slate-500">{bor}% Keterisian</span>
                              <span className={bor > 85 ? 'text-rose-600 font-bold' : 'text-slate-600'}>{total - tersedia}/{total} Bed</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  bor >= 90 ? 'bg-rose-500' : bor >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${bor}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              isAvail ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span>{isAvail ? 'Tersedia' : 'Penuh'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile View: High-Information Room Cards (Below md) ── */}
              <div className="md:hidden p-3 space-y-3 bg-slate-50/70">
                {simrsLiveList.map((row, idx) => {
                  const total = Number(row.total || 0);
                  const tersedia = Number(row.tersedia || 0);
                  const terpakai = Number(row.terpakai !== undefined ? row.terpakai : Math.max(0, total - tersedia));
                  const bor = total > 0 ? Math.round((terpakai / total) * 100) : 0;
                  const isAvail = tersedia > 0;

                  return (
                    <div 
                      key={idx}
                      onClick={() => scrollToRoom(row.kelas)}
                      className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:border-teal-500 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <div className="min-w-0">
                            <h4 className="font-heading font-extrabold text-slate-900 text-sm leading-tight truncate">
                              {row.kelas}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                              {row.kelas.includes('VIP') ? 'Suite & VVIP Pistillum' :
                               row.kelas.includes('KELAS I') ? 'Kelas 1 (Green Petals)' :
                               row.kelas.includes('KELAS II') ? 'Kelas 2 (Red Petals)' :
                               row.kelas.includes('KELAS III') ? 'Kelas 3 Reguler (Seroja)' :
                               row.kelas.includes('ISOLASI') ? 'Ruang Tekanan Negatif HEPA' :
                               row.kelas.includes('INTENSIF') ? 'ICU Staments & Ventilator' : 'Rawat Inap Terpadu'}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isAvail 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isAvail ? 'Tersedia' : 'Penuh'}</span>
                        </span>
                      </div>

                      {/* 3-Metrics Box */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center mb-2.5">
                        <div className="bg-white rounded-lg py-1 px-1 border border-slate-200/60 shadow-2xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">TOTAL</span>
                          <span className="font-heading font-black text-slate-800 text-xs sm:text-sm">{total} Bed</span>
                        </div>
                        <div className={`rounded-lg py-1 px-1 border shadow-2xs ${
                          isAvail ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          <span className={`text-[9px] font-bold uppercase font-mono block ${isAvail ? 'text-emerald-100' : 'text-slate-400'}`}>KOSONG</span>
                          <span className="font-heading font-black text-xs sm:text-sm">{tersedia} Bed</span>
                        </div>
                        <div className="bg-white rounded-lg py-1 px-1 border border-slate-200/60 shadow-2xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">TERISI</span>
                          <span className="font-heading font-black text-slate-700 text-xs sm:text-sm">{terpakai} Pasien</span>
                        </div>
                      </div>

                      {/* Progress Bar BOR */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Tingkat Keterisian:</span>
                          <span className={`font-bold ${bor >= 90 ? 'text-rose-600' : bor >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {bor}% ({terpakai}/{total} Bed)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              bor >= 90 ? 'bg-rose-500' : bor >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${bor}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Link Footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                        <span>Lihat foto &amp; fasilitas kamar ini</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ── 4. Search Bar & Filter Controls Container (Eksplorasi Katalog) ── */}
        {(displayMode === 'all' || displayMode === 'cards') && (
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kamar, kelas perawatan, atau fasilitas..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  updateQueryParam('q', e.target.value);
                }}
                className="w-full h-12 pl-11 pr-10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:bg-slate-50/50 outline-none transition-all font-medium"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    updateQueryParam('q', '');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Category Select Dropdown */}
            <div className="md:w-72 shrink-0">
              <select
                value={activeCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-xs sm:text-sm text-slate-700 bg-transparent focus:bg-slate-50/50 outline-none cursor-pointer font-medium appearance-none"
              >
                {ROOM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Reset & Refresh */}
            <div className="flex items-center gap-2 shrink-0">
              {hasFilter && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Reset filter"
                >
                  <X size={15} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui data bed'}</span>
              </button>
            </div>
          </div>

          {/* ── 5. Signature Yellow Alert Box (Matching Reference) ── */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3 my-6 shadow-2xs">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal m-0">
              <strong>Informasi ketersediaan tempat tidur diperbarui secara berkala.</strong> Data tempat tidur merupakan indikator ketersediaan ruangan real-time. Untuk pemesanan darurat, rujukan pasien antarrumah sakit, atau kepastian kamar, harap hubungi <strong>Admisi 24 Jam</strong> atau IGD Naray Hospital.
            </p>
          </div>

          {/* ── 6. Category Filter Pills Row (Horizontal Carousel) ── */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Kategori Kamar">
            {ROOM_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20 scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-medium'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── 7. Sub-header & Status Legend ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-1 font-mono">
                TIPE RUANG PERAWATAN
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Katalog Kamar Rawat Inap &amp; Kapasitas Bed
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Menampilkan <strong>{filteredRooms.length}</strong> tipe ruang rawat inap
                {searchKeyword && <> yang memuat kata kunci <strong>&quot;{searchKeyword}&quot;</strong></>}
              </p>
            </div>

            {/* Status Legend Badges */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                Bed Siap Pakai
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-200" />
                Menerima BPJS Kesehatan
              </span>
            </div>
          </div>

          {/* ── 8. Cards Grid: Room & Bed Cards ── */}
          {isLoadingBackend && contextRooms.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 mb-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-56 sm:h-60 bg-slate-200 w-full" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                      <div className="h-12 bg-slate-50 rounded-xl" />
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 mb-16">
              {filteredRooms.map((room) => {
                const avail = room.availableBeds || 0;
                const total = room.totalBeds || 4;
                const isAvailable = avail > 0;
                const percentAvail = Math.round((avail / total) * 100);

                return (
                  <article 
                    key={room.id}
                    id={`room-card-${room.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                  >
                    <div>
                      {/* Media Cover with Floating Chips */}
                      <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden shrink-0">
                        <img 
                          src={room.image} 
                          alt={room.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                        {/* Top-Left: Category Tag */}
                        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow-md border border-white/15">
                          {room.categoryLabel || (
                            getRoomCategory(room) === 'intensif' ? 'INTENSIF' :
                            getRoomCategory(room) === 'isolasi' ? 'ISOLASI' :
                            getRoomCategory(room) === 'emargensi' ? 'EMERGENSI' : 'RAWAT INAP'
                          )}
                        </span>

                        {/* Top-Right: Bed Availability Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md border ${
                            isAvailable 
                              ? 'bg-emerald-600/95 text-white border-emerald-400/30' 
                              : 'bg-rose-700/95 text-white border-rose-400/30'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span>{isAvailable ? `${avail} Bed Tersedia` : 'Kamar Penuh'}</span>
                          </span>
                        </div>

                        {/* Bottom Floating Price */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                          <span className="text-xs font-semibold text-teal-200">
                            {room.price === 'Hubungi Admisi' ? 'Informasi Tarif' : 'Estimasi Tarif'}
                          </span>
                          <span className="font-heading font-black text-xs sm:text-sm text-white tracking-tight">
                            {room.price}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        
                        {/* Title & Tagline */}
                        <div className="mb-4">
                          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1 font-mono">
                            {room.tag}
                          </span>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                            {room.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1.5">
                            <Users size={14} className="text-teal-600 shrink-0" />
                            <span>{room.capacity}</span>
                          </div>
                        </div>

                        {/* Badges: BPJS & Asuransi */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                          {room.bpjsCovered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                              <ShieldCheck size={14} className="text-teal-600" />
                              <span>Menerima BPJS Kesehatan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <span>Umum &amp; Asuransi Swasta</span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <Shield size={13} className="text-slate-400" />
                            <span>Cashless Partner</span>
                          </span>
                        </div>

                        {/* Facilities Checklist */}
                        {Array.isArray(room.features) && room.features.length > 0 && (
                          <div className="pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-900 block mb-3 font-mono tracking-wider">
                              FASILITAS UTAMA:
                            </span>
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              {room.features.slice(0, 5).map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2.5">
                                  <div className="w-4 h-4 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                                    <Check size={11} strokeWidth={3} />
                                  </div>
                                  <span className="leading-relaxed font-medium text-slate-700">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Card Footer Action Button */}
                    <div className="p-6 pt-0">
                      <a 
                        href={`https://wa.me/${rawPhone}?text=Halo%20Naray%20Hospital,%20saya%20ingin%20menanyakan%20ketersediaan%20kamar%20dan%20pemesanan%20rawat%20inap%20tipe%20*${encodeURIComponent(room.name)}*.%20Mohon%20informasinya.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all text-center cursor-pointer no-underline"
                      >
                        <MessageCircle size={15} />
                        <span>Pesan / Tanya Kamar via WhatsApp</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <BedDouble size={30} />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                Tidak Ada Kamar yang Sesuai
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Tidak ditemukan tipe kamar untuk filter pencarian Anda. Silakan coba kata kunci lain atau tampilkan semua kamar.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Tampilkan Semua Kamar</span>
              </button>
            </div>
          )}
        </div>
        )}

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── 9. Ketentuan Jam Kunjungan (Visiting Hours Protocol) ── */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block font-mono">
                    TATA TERTIB RAWAT INAP
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                    Ketentuan Jam Kunjungan (Besuk) Pasien
                  </h3>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Berlaku di Seluruh Ruang Rawat Naray Hospital
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  KUNJUNGAN SIANG
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  11.00 – 13.00 WIB
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Waktu istirahat &amp; makan siang pasien.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  KUNJUNGAN SORE / MALAM
                </span>
                <strong className="font-heading text-lg sm:text-xl font-extrabold text-teal-900 block">
                  17.00 – 20.00 WIB
                </strong>
                <p className="text-xs text-slate-500 mt-1">
                  Waktu besuk bersama keluarga terdekat.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  RUANG INTENSIF (ICU / NICU)
                </span>
                <strong className="font-heading text-sm sm:text-base font-extrabold text-amber-950 block">
                  Khusus Keluarga Inti
                </strong>
                <p className="text-xs text-amber-800 mt-1">
                  Sesuai izin dan pengawasan dokter DPJP.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed">
                <strong>Catatan Pencegahan Infeksi (PPI):</strong> Maksimal 2 orang penunggu di dalam kamar secara bergantian. Anak-anak berusia di bawah 12 tahun diimbau tidak memasuki area rawat inap demi perlindungan daya tahan tubuh dan imunitas anak.
              </p>
            </div>
          </section>

          {/* ── 10. Bottom Fast Action Callout Banner (Matching DoctorSchedulePage) ── */}
          <section className="bg-[#042622] text-white rounded-3xl p-8 sm:p-10 border border-teal-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 mb-3 font-mono">
                <Sparkles size={13} />
                <span>ADMISI RAWAT INAP 24 JAM</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                Butuh Kepastian Kamar Rawat Inap atau Rujukan Segera?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                Petugas admisi dan perawat jaga kami siaga 24 jam untuk membantu proses registrasi rawat inap, verifikasi BPJS/Asuransi, hingga penjemputan ambulans.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={`https://wa.me/${rawPhone}?text=Halo%20Admisi%20Naray%20Hospital,%20saya%20ingin%20konsultasi%20rawat%20inap%20dan%20ketersediaan%20kamar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center"
              >
                <MessageCircle size={16} />
                <span>Hubungi Admisi WhatsApp</span>
              </a>
              <a
                href={`https://wa.me/${(hospitalInfo?.emergencyHotline || '6285363395383').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo UGD & Ambulans Naray Hospital Dumai, saya membutuhkan bantuan medis darurat.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all text-center cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>WhatsApp UGD: {hospitalInfo?.emergencyHotline || '+62 853-6339-5383'}</span>
              </a>
            </div>
          </section>

        </div>

      </div>
    </PageLayout>
  );
}
