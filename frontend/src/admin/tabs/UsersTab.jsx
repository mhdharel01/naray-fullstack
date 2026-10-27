import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Lock,
  Mail,
  User as UserIcon,
  AlertTriangle,
  Info,
  Clock,
  Shield,
  Briefcase,
  Megaphone,
  AtSign
} from 'lucide-react';
import { useHospitalData } from '../../context/HospitalDataContext';

export default function UsersTab({ onShowToast }) {
  const {
    adminUser,
    adminUsers = [],
    adminUserStats,
    isLoadingAdminUsers,
    fetchAdminUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminToggleUserStatus
  } = useHospitalData();

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEdit: false,
    user: null
  });

  const [formState, setFormState] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    user: null,
    isDeleting: false
  });

  // Action status loading tracker (by ID)
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Load users on mount
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminUsers();
    setTimeout(() => setIsRefreshing(false), 500);
    if (typeof onShowToast === 'function') {
      onShowToast('Daftar pengguna & hak akses berhasil diperbarui.');
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return (adminUsers || []).filter(u => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesUsername = (u.username || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesEmail) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const isAct = statusFilter === 'active';
        if (Boolean(u.is_active) !== isAct) return false;
      }
      return true;
    });
  }, [adminUsers, search, roleFilter, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormState({
      name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'admin',
      is_active: true
    });
    setFormErrors({});
    setShowPassword(false);
    setModalState({ isOpen: true, isEdit: false, user: null });
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setFormState({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      role: user.role || 'admin',
      is_active: Boolean(user.is_active)
    });
    setFormErrors({});
    setShowPassword(false);
    setModalState({ isOpen: true, isEdit: true, user });
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formState.name.trim()) errors.name = 'Nama lengkap wajib diisi.';

    if (!formState.username.trim()) {
      errors.username = 'Username / Nama Pengguna wajib diisi.';
    } else if (formState.username.trim().length < 3) {
      errors.username = 'Username minimal 3 karakter.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formState.username.trim())) {
      errors.username = 'Username hanya boleh huruf, angka, titik (.), strip (-), atau underscore (_).';
    }

    if (!formState.email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }

    if (!modalState.isEdit) {
      if (!formState.password) {
        errors.password = 'Kata sandi wajib diisi untuk akun baru.';
      } else if (formState.password.length < 6) {
        errors.password = 'Kata sandi minimal 6 karakter.';
      }
      if (formState.password !== formState.password_confirmation) {
        errors.password_confirmation = 'Konfirmasi kata sandi tidak cocok.';
      }
    } else {
      if (formState.password) {
        if (formState.password.length < 6) {
          errors.password = 'Kata sandi baru minimal 6 karakter.';
        }
        if (formState.password !== formState.password_confirmation) {
          errors.password_confirmation = 'Konfirmasi kata sandi tidak cocok.';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form Handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      name: formState.name.trim(),
      username: formState.username.trim().toLowerCase(),
      email: formState.email.trim().toLowerCase(),
      role: formState.role,
      is_active: formState.is_active
    };

    if (formState.password) {
      payload.password = formState.password;
    }

    try {
      let res;
      if (modalState.isEdit) {
        res = await adminUpdateUser(modalState.user.id, payload);
      } else {
        res = await adminCreateUser(payload);
      }

      if (res?.success) {
        setModalState({ isOpen: false, isEdit: false, user: null });
        if (typeof onShowToast === 'function') {
          onShowToast(res.message || (modalState.isEdit ? 'Pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan.'));
        }
      } else {
        if (res?.errors && Object.keys(res.errors).length > 0) {
          const flatErrors = {};
          Object.keys(res.errors).forEach(key => {
            flatErrors[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key];
          });
          setFormErrors(prev => ({ ...prev, ...flatErrors }));
        }
        if (typeof onShowToast === 'function') {
          onShowToast(res?.message || 'Gagal menyimpan data pengguna.', 'error');
        }
      }
    } catch (err) {
      if (err?.errors && Object.keys(err.errors).length > 0) {
        const flatErrors = {};
        Object.keys(err.errors).forEach(key => {
          flatErrors[key] = Array.isArray(err.errors[key]) ? err.errors[key][0] : err.errors[key];
        });
        setFormErrors(prev => ({ ...prev, ...flatErrors }));
      }
      if (typeof onShowToast === 'function') {
        onShowToast(err.message || 'Terjadi kesalahan sistem.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = async (user) => {
    if (adminUser?.id === user.id) {
      if (typeof onShowToast === 'function') {
        onShowToast('Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif.', 'error');
      }
      return;
    }

    setActionLoadingId(user.id);
    try {
      const res = await adminToggleUserStatus(user.id);
      if (res?.success) {
        if (typeof onShowToast === 'function') {
          onShowToast(res.message || 'Status akun berhasil diperbarui.');
        }
      } else {
        if (typeof onShowToast === 'function') {
          onShowToast(res?.message || 'Gagal mengubah status akun.', 'error');
        }
      }
    } catch (err) {
      if (typeof onShowToast === 'function') {
        onShowToast(err.message || 'Gagal mengubah status akun.', 'error');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User Handler
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user) return;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));

    try {
      const res = await adminDeleteUser(deleteConfirm.user.id);
      if (res?.success) {
        setDeleteConfirm({ isOpen: false, user: null, isDeleting: false });
        if (typeof onShowToast === 'function') {
          onShowToast(res.message || 'Akun pengguna berhasil dihapus.');
        }
      } else {
        setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
        if (typeof onShowToast === 'function') {
          onShowToast(res?.message || 'Gagal menghapus pengguna.', 'error');
        }
      }
    } catch (err) {
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
      if (typeof onShowToast === 'function') {
        onShowToast(err.message || 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header & Action Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/15 border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-indigo-400" />
              Role-Based Access Control (RBAC)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
              Hak Akses & Pengguna Admin
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed m-0">
              Kelola akun administrator Naray Hospital dengan pembagian hak akses terisolasi untuk <strong>Super Admin</strong>, <strong>Admin Operasional</strong>, dan <strong>Tim Marketing</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingAdminUsers}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 text-slate-200 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Segarkan data pengguna"
            >
              <RefreshCw size={15} className={isRefreshing || isLoadingAdminUsers ? 'animate-spin text-teal-400' : 'text-slate-300'} />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-teal-900/30 active:scale-95 transition-all border border-teal-400/30 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Pengguna Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Admin */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Akun</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
              {adminUserStats?.total ?? adminUsers.length}
            </span>
          </div>
        </div>

        {/* Super Admin */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Super Admin</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
              {adminUserStats?.super_admin ?? adminUsers.filter(u => u.role === 'super_admin').length}
            </span>
          </div>
        </div>

        {/* Admin Operasional */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
            <Stethoscope size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block">Operasional</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
              {adminUserStats?.operasional ?? adminUsers.filter(u => u.role === 'admin').length}
            </span>
          </div>
        </div>

        {/* Marketing MCU */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">Marketing MCU</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
              {adminUserStats?.marketing ?? adminUsers.filter(u => u.role === 'marketing').length}
            </span>
          </div>
        </div>

        {/* Akun Aktif */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Akun Aktif</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
              {adminUserStats?.active ?? adminUsers.filter(u => u.is_active).length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau email admin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm bg-slate-50/50 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Reset
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-slate-500 shrink-0 hidden sm:inline flex items-center gap-1">
              <Filter size={13} /> Role:
            </span>
            {[
              { id: 'all', label: 'Semua Role' },
              { id: 'super_admin', label: 'Super Admin' },
              { id: 'admin', label: 'Operasional' },
              { id: 'marketing', label: 'Marketing' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleFilter(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  roleFilter === r.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'active', label: 'Aktif' },
              { id: 'inactive', label: 'Non-aktif' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === s.id
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Card: User List ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoadingAdminUsers && adminUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="animate-spin text-teal-600 mx-auto" size={28} />
            <p className="text-sm text-slate-500 font-medium">Sedang memuat data pengguna admin...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-700 m-0">Tidak Ada Pengguna Ditemukan</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto m-0">
              {search || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Tidak ada akun yang sesuai dengan filter pencarian Anda. Coba reset filter.'
                : 'Belum ada akun pengguna admin yang terdaftar di sistem.'}
            </p>
            {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Pengguna & Akun</th>
                  <th className="py-3.5 px-4 sm:px-6">Peran & Wewenang (Role)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Status Akun</th>
                  <th className="py-3.5 px-4 sm:px-6 hidden md:table-cell">Login Terakhir</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredUsers.map((u) => {
                  const isCurrentLoggedUser = adminUser?.id === u.id;
                  const isSuperAdminRole = u.role === 'super_admin';
                  const isMarketingRole = u.role === 'marketing';

                  // Badge Colors per role
                  const roleBadgeConfig = isSuperAdminRole ? {
                    label: 'Super Admin',
                    bg: 'bg-amber-500/10 text-amber-700 border-amber-300/80 dark:border-amber-700',
                    icon: ShieldCheck,
                    desc: 'Akses Penuh Semua Modul'
                  } : isMarketingRole ? {
                    label: 'Marketing & MCU',
                    bg: 'bg-purple-500/10 text-purple-700 border-purple-300/80',
                    icon: Megaphone,
                    desc: 'MCU, Artikel, Galeri & Banner'
                  } : {
                    label: 'Admin Operasional',
                    bg: 'bg-teal-500/10 text-teal-700 border-teal-300/80',
                    icon: Stethoscope,
                    desc: 'Dokter, Jadwal, Cuti & Kamar'
                  };

                  const RoleIcon = roleBadgeConfig.icon;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        !u.is_active ? 'opacity-65 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isSuperAdminRole
                              ? 'bg-amber-100 text-amber-800 border-amber-300/60'
                              : isMarketingRole
                              ? 'bg-purple-100 text-purple-800 border-purple-300/60'
                              : 'bg-teal-100 text-teal-800 border-teal-300/60'
                          }`}>
                            {(u.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 truncate block">
                                {u.name}
                              </span>
                              {u.username && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-teal-700 border border-slate-200">
                                  @{u.username}
                                </span>
                              )}
                              {isCurrentLoggedUser && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white tracking-wide shrink-0">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 text-xs flex items-center gap-1.5 truncate mt-0.5">
                              <Mail size={12} className="shrink-0 text-slate-400" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeConfig.bg}`}>
                            <RoleIcon size={13} className="shrink-0" />
                            {roleBadgeConfig.label}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {roleBadgeConfig.desc}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoadingId === u.id || isCurrentLoggedUser}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isCurrentLoggedUser
                              ? 'cursor-not-allowed bg-emerald-50 text-emerald-700 border-emerald-200'
                              : u.is_active
                              ? 'cursor-pointer bg-emerald-500/10 text-emerald-700 border-emerald-300/80 hover:bg-emerald-500/20 active:scale-95'
                              : 'cursor-pointer bg-rose-500/10 text-rose-700 border-rose-300/80 hover:bg-rose-500/20 active:scale-95'
                          }`}
                          title={isCurrentLoggedUser ? 'Anda tidak dapat menonaktifkan akun sendiri' : 'Klik untuk ubah status akun'}
                        >
                          {actionLoadingId === u.id ? (
                            <RefreshCw size={12} className="animate-spin text-slate-600" />
                          ) : u.is_active ? (
                            <UserCheck size={13} className="text-emerald-600" />
                          ) : (
                            <UserX size={13} className="text-rose-600" />
                          )}
                          <span>{u.is_active ? 'Aktif' : 'Dinonaktifkan'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{formatDate(u.last_login_at || u.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit / Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit profil / reset password"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ isOpen: true, user: u, isDeleting: false })}
                            disabled={isCurrentLoggedUser}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrentLoggedUser
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={isCurrentLoggedUser ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus akun pengguna'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Dialog: Tambah / Edit Pengguna Admin ── */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  {modalState.isEdit ? 'Perbarui Hak Akses' : 'Akun Administrator Baru'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                  {modalState.isEdit ? `Edit Pengguna: ${modalState.user?.name}` : 'Tambah Pengguna Admin'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, isEdit: false, user: null })}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5" noValidate autoComplete="off">
              {/* Role Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Peran / Hak Akses (Role) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Super Admin */}
                  <label
                    className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formState.role === 'super_admin'
                        ? 'border-amber-500 bg-amber-500/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={formState.role === 'super_admin'}
                      onChange={() => setFormState(prev => ({ ...prev, role: 'super_admin' }))}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <ShieldCheck size={15} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Super Admin</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug m-0">
                      Akses tak terbatas ke semua menu, pengguna & pengaturan.
                    </p>
                  </label>

                  {/* Admin Operasional */}
                  <label
                    className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formState.role === 'admin'
                        ? 'border-teal-500 bg-teal-500/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formState.role === 'admin'}
                      onChange={() => setFormState(prev => ({ ...prev, role: 'admin' }))}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Stethoscope size={15} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Operasional</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug m-0">
                      Fokus dokter, jadwal dinas, cuti, poli, kamar & rawat inap.
                    </p>
                  </label>

                  {/* Marketing MCU */}
                  <label
                    className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formState.role === 'marketing'
                        ? 'border-purple-500 bg-purple-500/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="marketing"
                      checked={formState.role === 'marketing'}
                      onChange={() => setFormState(prev => ({ ...prev, role: 'marketing' }))}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Megaphone size={15} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Marketing</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug m-0">
                      Paket MCU, promosi, artikel edukasi, galeri, video & banner.
                    </p>
                  </label>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormState(prev => {
                        const next = { ...prev, name: newName };
                        // Suggest username for new user if username hasn't been set manually
                        if (!modalState.isEdit && (!prev.username || prev.username === prev.name.toLowerCase().replace(/[^a-z0-9._-]/g, ''))) {
                          next.username = newName.toLowerCase().replace(/[^a-z0-9._-]/g, '');
                        }
                        return next;
                      });
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                    }}
                    placeholder="Contoh: drg. Ahmad Fauzi / Staf Operasional"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50/50 transition-all ${
                      formErrors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                    } focus:ring-2`}
                  />
                </div>
                {formErrors.name && <p className="text-xs text-rose-600 m-0">{formErrors.name}</p>}
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Username / ID Pengguna (Untuk Login) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formState.username}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s+/g, '');
                      setFormState(prev => ({ ...prev, username: val }));
                      if (formErrors.username) setFormErrors(prev => ({ ...prev, username: null }));
                    }}
                    placeholder="Contoh: admin, harel, operasional1"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono bg-slate-50/50 transition-all ${
                      formErrors.username ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                    } focus:ring-2`}
                  />
                </div>
                {formErrors.username ? (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 m-0 animate-in fade-in">
                    <AlertTriangle size={13} className="shrink-0 text-rose-500" />
                    <span>{formErrors.username}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 m-0">
                    ID unik untuk login admin (huruf kecil, angka, titik, strip, underscore tanpa spasi).
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Alamat Email (Untuk Login) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={formState.email}
                    onChange={(e) => {
                      setFormState(prev => ({ ...prev, email: e.target.value }));
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                    }}
                    placeholder="nama@narayhospital.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50/50 transition-all ${
                      formErrors.email ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                    } focus:ring-2`}
                  />
                </div>
                {formErrors.email ? (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 m-0 animate-in fade-in">
                    <AlertTriangle size={13} className="shrink-0 text-rose-500" />
                    <span>{formErrors.email}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 m-0">
                    Alamat email harus unik dan akan digunakan sebagai identitas login akun staf.
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {modalState.isEdit ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Akun'} {!modalState.isEdit && <span className="text-rose-500">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Sembunyikan' : 'Lihat Sandi'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formState.password}
                      onChange={(e) => {
                        setFormState(prev => ({ ...prev, password: e.target.value }));
                        if (formErrors.password) setFormErrors(prev => ({ ...prev, password: null }));
                      }}
                      placeholder={modalState.isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all ${
                        formErrors.password ? 'border-rose-400' : 'border-slate-200 focus:border-teal-500'
                      }`}
                    />
                    {formErrors.password && <p className="text-[11px] text-rose-600 m-0">{formErrors.password}</p>}
                  </div>

                  <div className="space-y-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formState.password_confirmation}
                      onChange={(e) => {
                        setFormState(prev => ({ ...prev, password_confirmation: e.target.value }));
                        if (formErrors.password_confirmation) setFormErrors(prev => ({ ...prev, password_confirmation: null }));
                      }}
                      placeholder="Ketik ulang kata sandi"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all ${
                        formErrors.password_confirmation ? 'border-rose-400' : 'border-slate-200 focus:border-teal-500'
                      }`}
                    />
                    {formErrors.password_confirmation && (
                      <p className="text-[11px] text-rose-600 m-0">{formErrors.password_confirmation}</p>
                    )}
                  </div>
                </div>
                {modalState.isEdit && (
                  <p className="text-[11px] text-slate-500 m-0">
                    💡 Biarkan kedua kotak kata sandi kosong jika pengguna tidak ingin mengubah kata sandi lama miliknya.
                  </p>
                )}
              </div>

              {/* Active Status Checkbox */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                <input
                  type="checkbox"
                  id="user-is-active"
                  checked={formState.is_active}
                  onChange={(e) => setFormState(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <label htmlFor="user-is-active" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer select-none">
                  Akun Aktif (Dapat Login ke Portal Admin)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, isEdit: false, user: null })}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-900/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{modalState.isEdit ? 'Simpan Perubahan' : 'Buat Akun Pengguna'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Dialog: Konfirmasi Hapus Pengguna ── */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 m-0">Hapus Akun Pengguna Admin?</h3>
              <p className="text-xs sm:text-sm text-slate-600 m-0 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteConfirm.user?.name}</strong> ({deleteConfirm.user?.email})? Pengguna ini tidak akan lagi dapat login ke Portal Admin.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, user: null, isDeleting: false })}
                disabled={deleteConfirm.isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirm.isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteConfirm.isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Akun</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
