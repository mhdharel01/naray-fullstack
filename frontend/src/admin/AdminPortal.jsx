import React, { useState, useMemo, useEffect } from 'react';
import './admin.css';
import {
  ShieldCheck, LayoutDashboard,
  Users, CalendarDays, BedDouble, Activity,
  LogOut, Menu, Stethoscope, ExternalLink, RefreshCw,
  Sparkles, Package, Building2, Check,
  Image as ImageIcon,
  CalendarOff, UserCheck, AlertCircle, X, FileText
} from 'lucide-react';
import { useHospitalData, DEFAULT_LEADERSHIP_MESSAGE, DEFAULT_BANNER_SLIDES } from '../context/HospitalDataContext';
import AdminLogin from './AdminLogin';
import AdminDeleteModal from './components/AdminDeleteModal';
import AdminCrudModal from './components/AdminCrudModal';
import { DoctorScheduleModal } from './DoctorScheduleModal';
import { DoctorScheduleStatusPage } from './DoctorScheduleStatusPage';
import { DoctorLeaveModal } from './DoctorLeaveModal';

// ── Tab Components ──
import DashboardTab from './tabs/DashboardTab';
import ArticlesTab from './tabs/ArticlesTab';
import DoctorsTab from './tabs/DoctorsTab';
import SchedulesTab from './tabs/SchedulesTab';
import LeavesTab from './tabs/LeavesTab';
import PoliTab from './tabs/PoliTab';
import McuTab from './tabs/McuTab';
import RoomsTab from './tabs/RoomsTab';
import FacilitiesTab from './tabs/FacilitiesTab';
import GalleryTab from './tabs/GalleryTab';
import BannersTab from './tabs/BannersTab';
import LeadershipTab from './tabs/LeadershipTab';
import UsersTab from './tabs/UsersTab';

function AdminDashboard({ onLogout }) {
  const {
    doctors = [],
    doctorSchedules = [],
    createDoctorSchedule,
    updateDoctorSchedule,
    deleteDoctorSchedule,
    toggleDoctorStatus,
    toggleScheduleStatus,
    doctorLeaves = [],
    adminCreateDoctorLeave,
    adminDeleteDoctorLeave,
    poliklinikList = [],
    specializationsList = [],
    createSpecialization,
    inpatientRooms = [],
    mcuPackages = [],
    healthArticles = [],
    facilities = [],
    centersOfExcellence = [],
    galleryActivities = [],
    videoList = [],
    adminUser,
    adminUsers = [],
    adminAppointments = [],
    adminDashboardStats,
    isLoadingAdminAppointments,
    updateAppointmentStatus,
    adminCreate,
    adminUpdate,
    adminDelete,
    adminDeleteAppointment,
    adminSyncPolikliniksFromSimrs,
    adminCleanStalePolikliniks,
    simrsDoctorSchedules,
    bannerSlides = [],
    setBannerSlides,
    saveBannerSlides,
    leadershipMessage,
    saveLeadershipData,
    saveItem,
    deleteItem,
    refreshBackendData,
    formatImageUrl
  } = useHospitalData();

  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sub-tabs & Filter States
  const [doctorFilterPoli, setDoctorFilterPoli] = useState('all');
  const [doctorFilterSpecialization, setDoctorFilterSpecialization] = useState('all');
  const [doctorFilterStatus, setDoctorFilterStatus] = useState('all');
  const [scheduleFilterDay, setScheduleFilterDay] = useState('all');
  const [scheduleFilterPoli, setScheduleFilterPoli] = useState('all');
  const [scheduleFilterDoctor, setScheduleFilterDoctor] = useState('all');
  const [scheduleFilterStatus, setScheduleFilterStatus] = useState('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleSubTab, setScheduleSubTab] = useState('routine');
  const [leaveFilterStatus, setLeaveFilterStatus] = useState('all');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [serviceSubTab, setServiceSubTab] = useState('centers');
  const [facilityViewMode, setFacilityViewMode] = useState('table');
  const [facilityCategoryFilter, setFacilityCategoryFilter] = useState('all');

  // Leadership Form State
  const [leadershipForm, setLeadershipForm] = useState(() => leadershipMessage || DEFAULT_LEADERSHIP_MESSAGE);

  useEffect(() => {
    if (leadershipMessage) {
      setLeadershipForm(leadershipMessage);
    }
  }, [leadershipMessage]);

  // Modal Dialog States
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, item: null });
  const [leaveModal, setLeaveModal] = useState({ isOpen: false, doctorId: null });
  const [doctorStatusPage, setDoctorStatusPage] = useState({
    isOpen: false,
    schedule: null,
    doctor: null,
    returnTab: 'schedules'
  });
  const [crudModal, setCrudModal] = useState({ isOpen: false, entity: null, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, entity: null, item: null, title: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync Handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (typeof refreshBackendData === 'function') {
        await refreshBackendData(true);
      }
      showToast('Sinkronisasi database & SIMRS Dekago berhasil diperbarui.');
    } catch {
      showToast('Gagal melakukan sinkronisasi data.', 'error');
    } finally {
      setTimeout(() => setIsSyncing(false), 700);
    }
  };

  // Schedule Navigation
  const openDoctorStatusPage = (schedule, doctor, returnTab = 'schedules') => {
    setDoctorStatusPage({
      isOpen: true,
      schedule: schedule || null,
      doctor: doctor || null,
      returnTab
    });
  };

  const closeDoctorStatusPage = () => {
    const ret = doctorStatusPage.returnTab || 'schedules';
    setDoctorStatusPage({ isOpen: false, schedule: null, doctor: null, returnTab: 'schedules' });
    setActiveTab(ret);
  };

  // Doctor & Schedule Quick Toggles
  const handleToggleDoctor = async (doc) => {
    const res = await toggleDoctorStatus(doc);
    if (res?.success) {
      showToast(res.newStatus === 'active' ? `Dokter ${doc.name} kini berstatus Praktik.` : `Dokter ${doc.name} kini berstatus Tidak Praktik (Cuti).`);
    } else {
      showToast(res?.message || 'Gagal mengubah status dokter.', 'error');
    }
  };

  const handleToggleSchedule = async (sch) => {
    const res = await toggleScheduleStatus(sch);
    if (res?.success) {
      const nextStatus = (sch.status || 'active') === 'active' ? 'Tidak Praktik' : 'Praktik';
      showToast(`Sesi jadwal ${sch.doctorName} (${sch.day}) diubah menjadi ${nextStatus}.`);
    } else {
      showToast(res?.message || 'Gagal mengubah status jadwal.', 'error');
    }
  };

  const handleOpenCreateSchedule = (presetDoctorId = null) => {
    setScheduleModal({
      isOpen: true,
      item: presetDoctorId ? { doctorId: presetDoctorId, doctorDbId: presetDoctorId } : null,
    });
  };

  const handleOpenEditSchedule = (sch) => {
    setScheduleModal({ isOpen: true, item: sch });
  };

  const handleSaveSchedule = async (payload, scheduleId, dbId) => {
    if (scheduleModal.item && (scheduleId || dbId || scheduleModal.item.id)) {
      const targetId = scheduleId || scheduleModal.item.id;
      const targetDbId = dbId || scheduleModal.item.dbId;
      const res = await updateDoctorSchedule(targetId, payload, targetDbId);
      if (res.success) {
        showToast('Jadwal dokter berhasil diperbarui.');
        setScheduleModal({ isOpen: false, item: null });
      } else {
        throw new Error(res.message || 'Gagal memperbarui jadwal.');
      }
    } else {
      const res = await createDoctorSchedule(payload);
      if (res.success) {
        showToast('Jadwal dokter berhasil ditambahkan!');
        setScheduleModal({ isOpen: false, item: null });
      } else {
        throw new Error(res.message || 'Gagal menambahkan jadwal.');
      }
    }
  };

  // CRUD Handlers
  const handleOpenCreate = (entity) => {
    setCrudModal({ isOpen: true, entity, item: null });
  };

  const handleOpenEdit = (entity, item) => {
    setCrudModal({ isOpen: true, entity, item });
  };

  const handleSaveModal = async (arg1, arg2, arg3, arg4) => {
    let entity, payload, explicitId, explicitDbId;
    if (typeof arg1 === 'string') {
      entity = arg1;
      payload = arg2;
      explicitId = arg3;
      explicitDbId = arg4;
    } else {
      payload = arg1;
      entity = arg2 || crudModal.entity;
      explicitId = arg3;
      explicitDbId = arg4;
    }

    const item = crudModal.item;
    const isEdit = Boolean(item && (item.id || item.dbId || explicitId || explicitDbId));
    let result;

    if (entity === 'banner') {
      const slideId = explicitId || item?.id || `slide-${Date.now()}`;
      saveItem('banner', { ...payload, id: slideId });
      showToast('Slide banner beranda berhasil disimpan!');
      setCrudModal({ isOpen: false, entity: null, item: null });
      return;
    }

    if (isEdit) {
      const targetId = explicitDbId || explicitId || item?.dbId || item?.id;
      result = await adminUpdate(entity, targetId, payload);
      if (result.success) {
        showToast(`Data ${entity} berhasil diperbarui.`);
        setCrudModal({ isOpen: false, entity: null, item: null });
      } else {
        throw new Error(result.message || 'Gagal menyimpan perubahan.');
      }
    } else {
      result = await adminCreate(entity, payload);
      if (result.success) {
        showToast(`Data ${entity} berhasil ditambahkan!`);
        setCrudModal({ isOpen: false, entity: null, item: null });
      } else {
        throw new Error(result.message || 'Gagal menambahkan data baru.');
      }
    }
  };

  const promptDelete = (entity, item, title) => {
    setDeleteDialog({
      isOpen: true,
      entity,
      item,
      title: title || item.title || item.name || 'item ini'
    });
  };

  const handleConfirmDelete = async () => {
    const { entity, item } = deleteDialog;
    if (!item) return;

    setIsDeleting(true);
    let res;
    if (entity === 'banner') {
      deleteItem('banner', item.id);
      res = { success: true };
    } else if (entity === 'appointment') {
      res = await adminDeleteAppointment(item.id);
    } else if (entity === 'doctor_schedule') {
      res = await deleteDoctorSchedule(item.id, item.dbId);
    } else {
      res = await adminDelete(entity, item.id, item.dbId);
    }
    setIsDeleting(false);

    if (res.success) {
      showToast(`Data ${entity} berhasil dihapus.`);
      setDeleteDialog({ isOpen: false, entity: null, item: null, title: '' });
    } else {
      showToast(res.message || 'Gagal menghapus data.', 'error');
    }
  };

  // Computations
  const todayIndo = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  }, []);

  const todayYMD = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const activeTodayLeaves = useMemo(() => {
    return (doctorLeaves || []).filter(l => {
      if (l.status === 'cancelled' || l.status === 'rejected') return false;
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      const e = typeof l.end_date === 'string' ? l.end_date.slice(0, 10) : '';
      return s && e && s <= todayYMD && todayYMD <= e;
    });
  }, [doctorLeaves, todayYMD]);

  const upcomingLeaves = useMemo(() => {
    return (doctorLeaves || []).filter(l => {
      if (l.status === 'cancelled' || l.status === 'rejected') return false;
      const s = typeof l.start_date === 'string' ? l.start_date.slice(0, 10) : '';
      return s && s > todayYMD;
    });
  }, [doctorLeaves, todayYMD]);

  const scheduledDoctorCount = useMemo(() => {
    const docIds = new Set((doctorSchedules || []).map(s => String(s.doctorDbId || s.doctorId || '')));
    return docIds.size;
  }, [doctorSchedules]);

  const schedulesTodayCount = useMemo(() => {
    return (doctorSchedules || []).filter(s => String(s.day || '').toLowerCase() === String(todayIndo || '').toLowerCase()).length;
  }, [doctorSchedules, todayIndo]);

  const activePoliCount = useMemo(() => {
    const poliIds = new Set((doctorSchedules || []).map(s => String(s.poliklinikId || '')));
    return poliIds.size;
  }, [doctorSchedules]);

  const activeSchedulesCount = useMemo(() => {
    return (doctorSchedules || []).filter(s => s.status === 'active').length;
  }, [doctorSchedules]);

  const onLeaveSchedulesCount = useMemo(() => {
    return (doctorSchedules || []).filter(s => s.doctorIsOnLeave).length;
  }, [doctorSchedules]);

  const filteredSchedules = useMemo(() => {
    return (doctorSchedules || []).filter(sch => {
      if (!sch) return false;
      if (scheduleFilterStatus === 'active' && sch.status !== 'active') return false;
      if (scheduleFilterStatus === 'inactive' && sch.status === 'active') return false;
      if (scheduleFilterStatus === 'on_leave' && !sch.doctorIsOnLeave) return false;
      if (scheduleFilterDay !== 'all' && String(sch.day || '').toLowerCase() !== String(scheduleFilterDay).toLowerCase()) return false;
      if (scheduleFilterPoli !== 'all' && String(sch.poliklinikId) !== String(scheduleFilterPoli)) return false;
      if (scheduleFilterDoctor !== 'all' && String(sch.doctorDbId || sch.doctorId) !== String(scheduleFilterDoctor)) return false;
      if (scheduleSearch) {
        const q = scheduleSearch.toLowerCase();
        const docName = String(sch.doctorName || '').toLowerCase();
        const docSpec = String(sch.doctorSpecialty || '').toLowerCase();
        const room = String(sch.room || '').toLowerCase();
        const day = String(sch.day || '').toLowerCase();
        if (!docName.includes(q) && !docSpec.includes(q) && !room.includes(q) && !day.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [doctorSchedules, scheduleFilterStatus, scheduleFilterDay, scheduleFilterPoli, scheduleFilterDoctor, scheduleSearch]);

  const allMediaList = useMemo(() => {
    const photos = (galleryActivities || []).map(g => {
      const cat = typeof g.category === 'object' ? (g.category?.name || 'Kegiatan Naray') : (g.category || 'Kegiatan Naray');
      const normalizedStatus = (g.status || 'active').toLowerCase();
      return {
        ...g,
        type: 'photo',
        displayType: 'Foto Kegiatan',
        url: g.image || g.url,
        category: cat,
        categoryName: cat,
        status: normalizedStatus,
        is_active: normalizedStatus === 'active'
      };
    });
    const videos = (videoList || []).map(v => {
      const cat = typeof v.category === 'object' ? (v.category?.name || 'Edukasi Pasien') : (v.category || 'Edukasi Pasien');
      const normalizedStatus = (v.status || 'active').toLowerCase();
      return {
        ...v,
        type: 'video',
        displayType: 'Video YouTube',
        url: v.youtubeEmbed || v.url,
        category: cat,
        categoryName: cat,
        status: normalizedStatus,
        is_active: normalizedStatus === 'active'
      };
    });
    return [...photos, ...videos];
  }, [galleryActivities, videoList]);

  const filteredMediaList = useMemo(() => {
    return allMediaList.filter(item => {
      const matchType = mediaTypeFilter === 'all' ? true : item.type === mediaTypeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        item.title?.toLowerCase().includes(q) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q)) ||
        (item.desc && item.desc.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [allMediaList, mediaTypeFilter, searchQuery]);

  const categoriesList = useMemo(() => [
    { id: 1, name: 'Tips Kesehatan' },
    { id: 2, name: 'Info Medis' },
    { id: 3, name: 'Layanan Rumah Sakit' },
    { id: 4, name: 'Gaya Hidup Sehat' },
  ], []);

  const liveStats = useMemo(() => {
    const docCount = adminDashboardStats?.active_doctors ?? (doctors?.length || 0);
    const totalMedia = (galleryActivities?.length || 0) + (videoList?.length || 0);

    return [
      { label: 'Dokter Aktif', value: String(docCount), icon: Stethoscope, change: `${poliklinikList?.length || 0} Poli`, positive: true, color: '#078F83' },
      { label: 'Cuti Dokter (Mandiri)', value: `${activeTodayLeaves.length} Hari Ini`, icon: CalendarOff, change: `${upcomingLeaves.length} Mendatang (Override SIMRS)`, positive: activeTodayLeaves.length === 0, color: '#F59E0B' },
      { label: 'Paket MCU & Kamar', value: `${mcuPackages?.length || 0} / ${inpatientRooms?.length || 0}`, icon: Package, change: 'Aktif di Web', positive: true, color: '#3B82F6' },
      { label: 'Galeri & Video', value: String(totalMedia), icon: ImageIcon, change: `${galleryActivities?.length || 0} Foto • ${videoList?.length || 0} Video`, positive: true, color: '#EC4899' },
    ];
  }, [adminDashboardStats, doctors, poliklinikList, mcuPackages, inpatientRooms, galleryActivities, videoList, activeTodayLeaves, upcomingLeaves]);

  // ── Role-Based Access Control (RBAC) Navigation ──
  const userRole = adminUser?.role || 'super_admin';

  const allNavItems = [
    { id: 'dashboard',    label: 'Dashboard',             icon: LayoutDashboard, count: null, section: 'UTAMA', roles: ['super_admin', 'admin', 'marketing'] },
    { id: 'doctors',      label: 'Dokter & Jadwal Dinas', icon: Stethoscope,     count: doctors?.length || 0, badge: activeTodayLeaves.length > 0 ? `${activeTodayLeaves.length} Cuti` : null, section: 'PELAYANAN & DOKTER', roles: ['super_admin', 'admin'] },
    { id: 'poli',         label: 'Poliklinik',            icon: Activity,        count: poliklinikList?.length || 0, section: 'PELAYANAN & DOKTER', roles: ['super_admin', 'admin'] },
    { id: 'rooms',        label: 'Kamar Rawat',           icon: BedDouble,       count: inpatientRooms?.length || 0, section: 'PELAYANAN & DOKTER', roles: ['super_admin', 'admin'] },
    { id: 'facilities',   label: 'Layanan Medis',         icon: Building2,       count: (facilities?.length || 0) + (centersOfExcellence?.length || 0), section: 'PELAYANAN & DOKTER', roles: ['super_admin', 'admin'] },
    { id: 'mcu',          label: 'Paket MCU',             icon: Package,         count: mcuPackages?.length || 0, section: 'MARKETING & KONTEN', roles: ['super_admin', 'marketing'] },
    { id: 'articles',     label: 'Berita & Artikel',      icon: FileText,        count: healthArticles?.length || 0, section: 'MARKETING & KONTEN', roles: ['super_admin', 'marketing'] },
    { id: 'gallery',      label: 'Galeri & Video',        icon: ImageIcon,       count: (galleryActivities?.length || 0) + (videoList?.length || 0), section: 'MARKETING & KONTEN', roles: ['super_admin', 'marketing'] },
    { id: 'banners',      label: 'Banner Slide Home',     icon: Sparkles,        count: bannerSlides?.length || 3, section: 'MARKETING & KONTEN', roles: ['super_admin', 'marketing'] },
    { id: 'leadership',   label: 'Pesan Pimpinan Medis',  icon: UserCheck,       count: null, section: 'MARKETING & KONTEN', roles: ['super_admin', 'marketing'] },
    { id: 'users',        label: 'Hak Akses Pengguna',    icon: ShieldCheck,     count: adminUsers?.length || null, section: 'KEAMANAN & PENGGUNA', roles: ['super_admin'] },
  ];

  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      if (userRole === 'super_admin') return true;
      return item.roles.includes(userRole);
    });
  }, [userRole, doctors, activeTodayLeaves, poliklinikList, inpatientRooms, facilities, centersOfExcellence, mcuPackages, healthArticles, galleryActivities, videoList, bannerSlides, adminUsers]);

  // Tab Guard: Jika tab aktif tidak diizinkan untuk peran saat ini, kembalikan ke dashboard
  useEffect(() => {
    const isAllowed = navItems.some(item => item.id === activeTab);
    if (!isAllowed) {
      setActiveTab('dashboard');
    }
  }, [navItems, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 backdrop-blur-md text-emerald-100 border-emerald-700/80 shadow-emerald-950/20'
              : 'bg-rose-900/95 backdrop-blur-md text-rose-100 border-rose-700/80 shadow-rose-950/20'
          }`}
          role="status"
        >
          {toast.type === 'success' ? (
            <Check className="text-emerald-400 shrink-0" size={18} />
          ) : (
            <AlertCircle className="text-rose-400 shrink-0" size={18} />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800/90 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Mobile Admin"
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-black text-sm text-white leading-none">
                NARAY ADMIN
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-teal-400 font-mono mt-0.5">
                ENTERPRISE CMS
              </span>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800" aria-label="Menu Admin Mobile">
          {(() => {
            let lastSection = null;
            return navItems.map((item) => {
              const isDoctorGroup = ['doctors', 'schedules', 'leaves'].includes(activeTab);
              const isActive = (item.id === 'doctors' ? isDoctorGroup : activeTab === item.id) && !doctorStatusPage.isOpen;
              const showSection = item.section && item.section !== lastSection;
              lastSection = item.section;

              return (
                <React.Fragment key={item.id}>
                  {showSection && (
                    <div className="pt-3 pb-1 px-3">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-500 font-mono uppercase">
                        {item.section}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 font-extrabold border-l-[3px] border-teal-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-[3px] border-transparent'
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSearchQuery('');
                      setDoctorStatusPage({ isOpen: false, schedule: null, doctor: null, returnTab: item.id });
                      setMobileSidebarOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon size={18} className={isActive ? 'text-teal-400' : 'text-slate-400'} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-teal-500/25 text-teal-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-900/90">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink size={16} className="text-teal-400" />
            <span>Lihat Website Publik</span>
          </a>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            onClick={() => {
              setMobileSidebarOpen(false);
              setShowLogoutConfirm(true);
            }}
          >
            <LogOut size={16} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800/80 transition-all duration-300 ease-in-out relative z-30 select-none ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
        aria-label="Sidebar Navigasi Admin"
      >
        <div className={`h-16 px-4 flex items-center border-b border-slate-800/80 ${
          sidebarOpen ? 'justify-between' : 'justify-center'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <ShieldCheck size={22} />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col text-left truncate">
                <span className="font-heading font-black text-sm text-white leading-none tracking-tight">
                  NARAY ADMIN
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-teal-400 font-mono mt-1">
                  ENTERPRISE CMS
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              type="button"
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Kecilkan Menu"
              aria-label="Kecilkan Menu"
            >
              <Menu size={17} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800" aria-label="Menu Admin">
          {(() => {
            let lastSection = null;
            return navItems.map((item) => {
              const isDoctorGroup = ['doctors', 'schedules', 'leaves'].includes(activeTab);
              const isActive = (item.id === 'doctors' ? isDoctorGroup : activeTab === item.id) && !doctorStatusPage.isOpen;
              const showSection = sidebarOpen && item.section && item.section !== lastSection;
              lastSection = item.section;

              return (
                <React.Fragment key={item.id}>
                  {showSection && (
                    <div className="pt-3 pb-1 px-3">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-500 font-mono uppercase">
                        {item.section}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all group relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 font-extrabold border-l-[3px] border-teal-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border-l-[3px] border-transparent'
                  } ${!sidebarOpen ? 'justify-center px-0' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                    setDoctorStatusPage({ isOpen: false, schedule: null, doctor: null, returnTab: item.id });
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon
                    size={19}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between text-left truncate">
                      <span className="truncate">{item.label}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.badge}
                          </span>
                        )}
                        {item.count !== null && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-teal-500/25 text-teal-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          });
        })()}
      </nav>

        <div className="p-3 border-t border-slate-800/90 space-y-1 bg-slate-900/60">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              !sidebarOpen ? 'justify-center px-0' : ''
            }`}
            title="Buka Halaman Utama Pasien"
          >
            <ExternalLink size={17} className="text-teal-400 shrink-0" />
            {sidebarOpen && <span>Lihat Website</span>}
          </a>
          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer ${
              !sidebarOpen ? 'justify-center px-0' : ''
            }`}
            onClick={() => setShowLogoutConfirm(true)}
            title="Keluar dari Portal Admin"
          >
            <LogOut size={17} className="shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Container ── */}
      <div className="admin-main flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden bg-slate-50">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 sm:h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka Menu Admin"
            >
              <Menu size={20} />
            </button>

            {!sidebarOpen && (
              <button
                type="button"
                className="hidden lg:flex w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer shrink-0"
                onClick={() => setSidebarOpen(true)}
                title="Buka Menu Sidebar"
                aria-label="Buka Menu Sidebar"
              >
                <Menu size={18} />
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base sm:text-xl text-slate-900 truncate leading-tight">
                  {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-[11px] font-bold shrink-0">
                  Internal CMS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block truncate mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs"
                title="Jadwal disinkronkan langsung dari SIMRS Dekago (Read-Only)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SIMRS Live</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-2xs"
                title="Database Web MySQL aktif untuk Cuti Mandiri, Banner, MCU, Kamar & Profil"
              >
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>DB MySQL Aktif</span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Sinkronisasi Ulang Data Database & SIMRS"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin text-teal-600' : ''} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Sinkron Data'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
              title="Buka Website Pasien Naray Hospital"
            >
              <ExternalLink size={14} />
              <span>Lihat Web</span>
            </a>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs shrink-0 ${
                userRole === 'super_admin'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white'
                  : userRole === 'marketing'
                  ? 'bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white'
                  : 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white'
              }`}>
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left max-w-[150px] truncate">
                <strong className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {adminUser?.name || 'Administrator'}
                </strong>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    userRole === 'super_admin'
                      ? 'bg-amber-100 text-amber-800'
                      : userRole === 'marketing'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {adminUser?.role_label || (userRole === 'super_admin' ? 'Super Admin' : userRole === 'marketing' ? 'Marketing' : 'Operasional')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {doctorStatusPage.isOpen ? (
            <DoctorScheduleStatusPage
              initialSchedule={doctorStatusPage.schedule}
              initialDoctor={doctorStatusPage.doctor || doctors[0]}
              doctors={doctors}
              doctorSchedules={doctorSchedules}
              doctorLeaves={doctorLeaves}
              onBack={closeDoctorStatusPage}
              onSetTemporaryLeave={adminCreateDoctorLeave}
              onCancelTemporaryLeave={adminDeleteDoctorLeave}
              showToast={showToast}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  doctorSchedules={doctorSchedules}
                  doctorLeaves={doctorLeaves}
                  poliklinikList={poliklinikList}
                  activeTodayLeaves={activeTodayLeaves}
                  upcomingLeaves={upcomingLeaves}
                  doctors={doctors}
                  inpatientRooms={inpatientRooms}
                  mcuPackages={mcuPackages}
                  healthArticles={healthArticles}
                  adminAppointments={adminAppointments}
                  isLoadingAdminAppointments={isLoadingAdminAppointments}
                  updatingId={updatingId}
                  liveStats={liveStats}
                  updateAppointmentStatus={updateAppointmentStatus}
                  promptDelete={promptDelete}
                  setActiveTab={setActiveTab}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenCreateSchedule={handleOpenCreateSchedule}
                  setLeaveModal={setLeaveModal}
                  showToast={showToast}
                  setUpdatingId={setUpdatingId}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'articles' && (
                <ArticlesTab
                  healthArticles={healthArticles}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {['doctors', 'schedules', 'leaves'].includes(activeTab) && (
                <DoctorsTab
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  doctors={doctors}
                  poliklinikList={poliklinikList}
                  specializationsList={specializationsList}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  doctorFilterPoli={doctorFilterPoli}
                  setDoctorFilterPoli={setDoctorFilterPoli}
                  doctorFilterSpecialization={doctorFilterSpecialization}
                  setDoctorFilterSpecialization={setDoctorFilterSpecialization}
                  doctorFilterStatus={doctorFilterStatus}
                  setDoctorFilterStatus={setDoctorFilterStatus}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  handleToggleDoctor={handleToggleDoctor}
                  doctorSchedules={doctorSchedules}
                  activeSchedulesCount={activeSchedulesCount}
                  onLeaveSchedulesCount={onLeaveSchedulesCount}
                  scheduledDoctorCount={scheduledDoctorCount}
                  schedulesTodayCount={schedulesTodayCount}
                  todayIndo={todayIndo}
                  activePoliCount={activePoliCount}
                  scheduleSearch={scheduleSearch}
                  setScheduleSearch={setScheduleSearch}
                  scheduleFilterStatus={scheduleFilterStatus}
                  setScheduleFilterStatus={setScheduleFilterStatus}
                  scheduleFilterDay={scheduleFilterDay}
                  setScheduleFilterDay={setScheduleFilterDay}
                  scheduleFilterPoli={scheduleFilterPoli}
                  setScheduleFilterPoli={setScheduleFilterPoli}
                  scheduleFilterDoctor={scheduleFilterDoctor}
                  setScheduleFilterDoctor={setScheduleFilterDoctor}
                  filteredSchedules={filteredSchedules}
                  handleOpenCreateSchedule={handleOpenCreateSchedule}
                  handleOpenEditSchedule={handleOpenEditSchedule}
                  doctorLeaves={doctorLeaves}
                  activeTodayLeaves={activeTodayLeaves}
                  upcomingLeaves={upcomingLeaves}
                  todayYMD={todayYMD}
                  leaveSearch={leaveSearch}
                  setLeaveSearch={setLeaveSearch}
                  leaveFilterStatus={leaveFilterStatus}
                  setLeaveFilterStatus={setLeaveFilterStatus}
                  adminDeleteDoctorLeave={adminDeleteDoctorLeave}
                  setLeaveModal={setLeaveModal}
                  openDoctorStatusPage={openDoctorStatusPage}
                  showToast={showToast}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'poli' && (
                <PoliTab
                  poliklinikList={poliklinikList}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  adminSyncPolikliniksFromSimrs={adminSyncPolikliniksFromSimrs}
                  adminCleanStalePolikliniks={adminCleanStalePolikliniks}
                  simrsDoctorSchedules={simrsDoctorSchedules}
                  showToast={showToast}
                />
              )}

              {activeTab === 'mcu' && (
                <McuTab
                  mcuPackages={mcuPackages}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                />
              )}

              {activeTab === 'rooms' && (
                <RoomsTab
                  inpatientRooms={inpatientRooms}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'facilities' && (
                <FacilitiesTab
                  centersOfExcellence={centersOfExcellence}
                  facilities={facilities}
                  serviceSubTab={serviceSubTab}
                  setServiceSubTab={setServiceSubTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  facilityCategoryFilter={facilityCategoryFilter}
                  setFacilityCategoryFilter={setFacilityCategoryFilter}
                  facilityViewMode={facilityViewMode}
                  setFacilityViewMode={setFacilityViewMode}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryTab
                  filteredMediaList={filteredMediaList}
                  mediaTypeFilter={mediaTypeFilter}
                  setMediaTypeFilter={setMediaTypeFilter}
                  allMediaList={allMediaList}
                  galleryActivities={galleryActivities}
                  videoList={videoList}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleOpenCreate={handleOpenCreate}
                  handleOpenEdit={handleOpenEdit}
                  promptDelete={promptDelete}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'banners' && (
                <BannersTab
                  bannerSlides={bannerSlides}
                  setBannerSlides={setBannerSlides}
                  saveBannerSlides={saveBannerSlides}
                  DEFAULT_BANNER_SLIDES={DEFAULT_BANNER_SLIDES}
                  showToast={showToast}
                  setCrudModal={setCrudModal}
                  promptDelete={promptDelete}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'leadership' && (
                <LeadershipTab
                  leadershipForm={leadershipForm}
                  setLeadershipForm={setLeadershipForm}
                  DEFAULT_LEADERSHIP_MESSAGE={DEFAULT_LEADERSHIP_MESSAGE}
                  saveItem={saveItem}
                  showToast={showToast}
                  formatImageUrl={formatImageUrl}
                />
              )}

              {activeTab === 'users' && userRole === 'super_admin' && (
                <UsersTab onShowToast={showToast} />
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Dynamic Universal CRUD Modal ── */}
      {crudModal.isOpen && (
        <AdminCrudModal
          isOpen={crudModal.isOpen}
          entity={crudModal.entity}
          item={crudModal.item}
          categories={categoriesList}
          specializations={specializationsList}
          polikliniks={poliklinikList}
          onClose={() => setCrudModal({ isOpen: false, entity: null, item: null })}
          onSave={handleSaveModal}
          onAddSpecialization={createSpecialization}
        />
      )}

      {/* ── Universal Delete Confirm Dialog ── */}
      <AdminDeleteModal
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.title}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, entity: null, item: null, title: '' })}
      />

      {/* ── Dedicated Doctor Schedule Modal ── */}
      {scheduleModal.isOpen && (
        <DoctorScheduleModal
          isOpen={scheduleModal.isOpen}
          onClose={() => setScheduleModal({ isOpen: false, item: null })}
          scheduleItem={scheduleModal.item}
          doctors={doctors}
          polikliniks={poliklinikList}
          onSave={handleSaveSchedule}
        />
      )}

      {/* ── Dedicated Doctor Leave Modal ── */}
      <DoctorLeaveModal
        isOpen={leaveModal.isOpen}
        onClose={() => setLeaveModal({ isOpen: false, doctorId: null })}
        doctors={doctors}
        doctorSchedules={doctorSchedules}
        doctorLeaves={doctorLeaves}
        presetDoctorId={leaveModal.doctorId}
        onCreateLeave={adminCreateDoctorLeave}
        onDeleteLeave={adminDeleteDoctorLeave}
        showToast={showToast}
      />

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900 text-center">
              Konfirmasi Keluar Sesi
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin keluar dari Portal Administrasi? Pastikan seluruh perubahan data telah tersimpan.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root Export ──
export default function AdminPortal() {
  const { isAdmin, logoutAdmin } = useHospitalData();
  return isAdmin
    ? <AdminDashboard onLogout={logoutAdmin} />
    : <AdminLogin onLogin={() => {}} />;
}
