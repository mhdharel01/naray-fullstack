import React, { useState } from 'react';
import { ShieldCheck, LogIn, Eye, EyeOff, AlertCircle, X, Lock, Mail, User } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function AdminLoginModal({ isOpen, onClose, onShowToast }) {
  const { loginAdmin } = useHospitalData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Mohon masukkan username/email dan kata sandi.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(username.trim(), password);
      setLoading(false);
      if (res.success) {
        if (onShowToast) onShowToast('Login Admin Berhasil! Terhubung dengan Backend API.');
        onClose();
      } else {
        setError(res.message || 'Username/email atau kata sandi tidak sesuai.');
      }
    } catch (err) {
      setLoading(false);
      setError('Terjadi kendala koneksi ke server. Silakan coba lagi.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/20 p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Medical Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        {/* Close Button */}
        <button 
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          onClick={onClose} 
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Header Branding (Identical to Hospital Homepage) */}
        <div className="flex items-center gap-3 mb-4 pt-1">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center shrink-0">
            <img 
              src="/images/logo/logo.jpeg" 
              alt="Logo Naray Hospital Dumai" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-black text-xl leading-none tracking-tight text-slate-900">
              NARAY
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 uppercase font-mono mt-0.5">
              HOSPITAL DUMAI
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-[11px] font-bold tracking-wide mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Portal Administrasi Cepat</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Masuk ke Mode Admin
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Autentikasi akun berwenang untuk mengelola jadwal dokter, kamar, dan layanan rumah sakit.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150" role="alert">
            <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Username / Nama Pengguna / Email
            </label>
            <div className="relative rounded-2xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username atau email admin"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Kata Sandi
            </label>
            <div className="relative rounded-2xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
                aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck size={14} className="text-teal-600 shrink-0" />
            <span>Sesi Terenkripsi SSL 256-Bit. Akses khusus staf resmi.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer" 
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/20 hover:shadow-teal-700/30 transition-all duration-200 flex items-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:pointer-events-none text-xs sm:text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Masuk ke Mode Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
