import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHospitalData } from '../context/HospitalDataContext';
import {
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Mail,
  User,
  Lock,
  ArrowLeft
} from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const { loginAdmin } = useHospitalData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Mohon lengkapi email/ID dan kata sandi Anda.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin(username.trim(), password);
      setLoading(false);
      if (res?.success) {
        if (typeof onLogin === 'function') onLogin();
      } else {
        setError(res?.message || 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.');
      }
    } catch (err) {
      setLoading(false);
      setError('Terjadi kendala saat menghubungi server autentikasi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      {/* Background Decorative Ambient Glows matching Naray Medical theme */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        
        {/* Main Authentication Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-7 sm:p-9 relative overflow-hidden backdrop-blur-xs">
          {/* Subtle Top Medical Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

          {/* Header Branding (Identical to Hospital Homepage) */}
          <div className="flex flex-col items-center text-center mb-7 pt-2">
            <Link 
              to="/" 
              className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-2xl p-1.5 transition-transform duration-200 hover:scale-[1.02]"
              aria-label="Kembali ke Beranda Naray Hospital"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                <img 
                  src="/images/logo/logo.jpeg" 
                  alt="Logo Naray Hospital Dumai" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-black text-2xl leading-none tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  NARAY
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-teal-600 uppercase font-mono mt-0.5">
                  HOSPITAL DUMAI
                </span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-bold tracking-wide mt-5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Portal Administrasi Staf &amp; RME</span>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
              Masuk ke Mode Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Otentikasi kredensial untuk mengelola jadwal dokter, kamar, artikel &amp; layanan medis.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200" role="alert">
                <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Username / Nama Pengguna / Email
              </label>
              <div className="relative rounded-2xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  id="admin-username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60"
                  placeholder="Masukkan username atau email admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi Keamanan
                </label>
              </div>
              <div className="relative rounded-2xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="admin-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm rounded-2xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60 font-sans"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 pb-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600">Ingat sesi di perangkat</span>
              </label>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                <ShieldCheck size={13} className="text-teal-600" />
                <span>256-Bit SSL</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:pointer-events-none text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk ke Dashboard Administrasi</span>
                </>
              )}
            </button>
          </form>

          {/* Security Banner (Professional Hospital Compliance) */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left">
              <strong className="text-xs font-bold text-slate-800 block">Akses Terproteksi &amp; Audit Trail</strong>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Khusus personel medis dan staf berwenang Naray Hospital Dumai. Segala aktivitas operasional tercatat dalam log audit sistem.
              </p>
            </div>
          </div>

          {/* Return to Public Portal */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-teal-700 transition-colors py-1.5 px-3 rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Halaman Pasien</span>
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6 font-mono">
          &copy; {new Date().getFullYear()} Naray Hospital Dumai &bull; Sistem Terintegrasi SIMRS Dekago
        </p>
      </div>
    </div>
  );
}
