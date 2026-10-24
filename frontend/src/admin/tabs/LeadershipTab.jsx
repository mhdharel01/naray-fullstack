import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  UserCheck,
  Building2,
  ExternalLink,
  Info,
  ShieldCheck,
  Eye,
  Quote,
  HeartHandshake,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import ImageUploadField from '../ImageUploadField';

export default function LeadershipTab({
  leadershipForm = {},
  setLeadershipForm,
  DEFAULT_LEADERSHIP_MESSAGE = {},
  saveItem,
  showToast,
  formatImageUrl
}) {
  const [activePreviewMode, setActivePreviewMode] = useState('home'); // 'home' | 'profile'

  // Safety values
  const currentLeader = {
    ...DEFAULT_LEADERSHIP_MESSAGE,
    ...leadershipForm
  };

  const leaderImageSrc = formatImageUrl
    ? formatImageUrl(currentLeader.image, '/images/doctors/doctor-male-default.jpg')
    : (currentLeader.image || '/images/doctors/doctor-male-default.jpg');

  const handleSave = () => {
    if (!saveItem) return;
    saveItem('leadership', currentLeader);
    if (showToast) {
      showToast('Pesan kepemimpinan medis berhasil disimpan & langsung aktif di Beranda & Halaman Profil!');
    }
  };

  const handleReset = () => {
    if (!DEFAULT_LEADERSHIP_MESSAGE) return;
    const confirmReset = window.confirm(
      'Kembalikan pesan kepemimpinan medis ke teks dan foto standar bawaan Naray Hospital?'
    );
    if (!confirmReset) return;

    if (setLeadershipForm) setLeadershipForm(DEFAULT_LEADERSHIP_MESSAGE);
    if (saveItem) saveItem('leadership', DEFAULT_LEADERSHIP_MESSAGE);
    if (showToast) {
      showToast('Pesan kepemimpinan berhasil dikembalikan ke standar awal.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ── TOP HERO BANNER & CONTEXT EXPLANATION ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-heading font-bold uppercase tracking-wider">
              <Award size={14} className="text-teal-300" />
              <span>Identitas &amp; Komitmen Klinis Rumah Sakit</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Pesan Kepemimpinan Medis (Direktur &amp; Komite Medis)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Pengaturan ini mengelola kutipan komitmen pelayanan, nama pimpinan rumah sakit, gelar, serta foto resmi yang ditampilkan langsung kepada publik pada <strong>dua halaman utama</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-heading font-bold border border-slate-600/80 transition-all cursor-pointer shadow-xs"
              title="Reset ke setelan bawaan rumah sakit"
            >
              <RefreshCw size={14} />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-heading font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Check size={17} strokeWidth={2.5} />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* ── WHERE THIS CONNECTS (PAGE CONNECTIONS STRIP) ── */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-400/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider block">Halaman 1: Beranda Pasien</span>
                <strong className="text-xs sm:text-sm text-white group-hover:text-teal-300 transition-colors">
                  Bagian Standar Mutu &amp; Identitas Naray (/)
                </strong>
              </div>
            </div>
            <ExternalLink size={15} className="text-slate-400 group-hover:text-teal-300 transition-colors shrink-0" />
          </a>

          <a
            href="/profil"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-400/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-[11px] text-sky-300 font-bold uppercase tracking-wider block">Halaman 2: Profil Rumah Sakit</span>
                <strong className="text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors">
                  Section Pesan Kepemimpinan Medis (/profil)
                </strong>
              </div>
            </div>
            <ExternalLink size={15} className="text-slate-400 group-hover:text-sky-300 transition-colors shrink-0" />
          </a>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: FORM (KIRI) & DUAL LIVE PREVIEW (KANAN) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 leading-tight">
                Formulir Komitmen Klinis &amp; Data Pimpinan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perubahan pada form ini akan tersimpan otomatis ke context rumah sakit dan langsung tampil di kedua halaman
              </p>
            </div>
          </div>

          {/* Preview Tab Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setActivePreviewMode('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePreviewMode === 'home'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={13} className={activePreviewMode === 'home' ? 'text-teal-600' : ''} />
              <span>Pratinjau Beranda (/)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewMode('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePreviewMode === 'profile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={13} className={activePreviewMode === 'profile' ? 'text-teal-600' : ''} />
              <span>Pratinjau Profil (/profil)</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: EDIT FORM (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama &amp; Gelar Pimpinan Medis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentLeader.name || ''}
                  onChange={e => setLeadershipForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: dr. Direktur & Komite Medis"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sub-judul / Asal Institusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentLeader.title || ''}
                  onChange={e => setLeadershipForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Naray Hospital Kota Dumai, Riau"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <ImageUploadField
              label="Unggah Foto Resmi Pimpinan Medis / Direktur"
              value={currentLeader.image || ''}
              folder="avatars"
              onChange={uploadedUrl => setLeadershipForm(prev => ({ ...prev, image: uploadedUrl }))}
              helperText="Rekomendasi rasio potret (3:4 atau 4:3) jas dokter resmi. Otomatis dikompres & dipusatkan."
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kutipan Pesan / Komitmen Pelayanan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(currentLeader.quote || '').length} karakter
                </span>
              </div>
              <textarea
                rows={4}
                value={currentLeader.quote || ''}
                onChange={e => setLeadershipForm(prev => ({ ...prev, quote: e.target.value }))}
                placeholder="Tulis pesan komitmen pelayanan kesehatan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Kutipan ini akan dibungkus tanda petik ganda (&quot;...&quot;) di halaman publik.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Label Badge Header
                </label>
                <input
                  type="text"
                  value={currentLeader.badgeTitle || ''}
                  onChange={e => setLeadershipForm(prev => ({ ...prev, badgeTitle: e.target.value }))}
                  placeholder="Pesan Kepemimpinan Medis"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Keterangan Sub-Badge
                </label>
                <input
                  type="text"
                  value={currentLeader.badgeSubtitle || ''}
                  onChange={e => setLeadershipForm(prev => ({ ...prev, badgeSubtitle: e.target.value }))}
                  placeholder="Dedikasi Pelayanan Kesehatan Kota Dumai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-heading font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={18} />
                <span>Simpan Perubahan Pesan Sekarang</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: LIVE INTERACTIVE WYSIWYG PREVIEW (5 COLS) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye size={14} className="text-teal-600" />
                <span>Pratinjau: {activePreviewMode === 'home' ? 'Beranda Pasien (/)' : 'Halaman Profil (/profil)'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live WYSIWYG
              </span>
            </div>

            {/* PREVIEW CONTAINER 1: HOMEPAGE (NarayIdentitySection Card) */}
            {activePreviewMode === 'home' && (
              <div className="bg-slate-100/70 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Tampilan di Beranda Utama:</span>
                  <a href="/" target="_blank" rel="noreferrer" className="text-teal-700 font-bold hover:underline inline-flex items-center gap-0.5">
                    Buka Halaman <ExternalLink size={10} />
                  </a>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                    <img
                      src={leaderImageSrc}
                      alt={currentLeader.name || 'Direktur'}
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.currentTarget.src = '/images/default-doctor.svg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/30 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <strong className="block font-heading text-base font-bold leading-tight">
                        {currentLeader.name || 'dr. Direktur & Komite Medis'}
                      </strong>
                      <span className="text-[11px] text-teal-300 font-medium">
                        {currentLeader.title || 'Naray Hospital Kota Dumai, Riau'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4 bg-white">
                    <p className="text-xs text-slate-600 leading-relaxed italic m-0">
                      &quot;{currentLeader.quote || 'Bagi kami, setiap pasien adalah anggota keluarga yang sedang membutuhkan pertolongan.'}&quot;
                    </p>
                    <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-slate-900 leading-tight">
                          {currentLeader.badgeTitle || 'Pesan Kepemimpinan Medis'}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {currentLeader.badgeSubtitle || 'Dedikasi Pelayanan Kesehatan Kota Dumai'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 2: PROFILE PAGE (/profil Section 7) */}
            {activePreviewMode === 'profile' && (
              <div className="bg-slate-100/70 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Tampilan di Halaman Profil:</span>
                  <a href="/profil" target="_blank" rel="noreferrer" className="text-teal-700 font-bold hover:underline inline-flex items-center gap-0.5">
                    Buka Halaman <ExternalLink size={10} />
                  </a>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                      <img
                        src={leaderImageSrc}
                        alt={currentLeader.name || 'Direktur'}
                        className="w-full h-full object-cover object-top"
                        onError={e => { e.currentTarget.src = '/images/default-doctor.svg'; }}
                      />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 block font-mono">
                        {currentLeader.badgeTitle || 'PESAN KEPEMIMPINAN MEDIS'}
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900 leading-snug">
                        &quot;Bagi Kami, Setiap Pasien Adalah Bagian dari Keluarga Besar Naray&quot;
                      </h4>
                      <div>
                        <strong className="block font-heading text-xs font-bold text-slate-900">
                          {currentLeader.name || 'dr. Direktur & Komite Medis'}
                        </strong>
                        <span className="text-[11px] text-teal-700 font-medium block">
                          {currentLeader.title || 'Naray Hospital Kota Dumai, Riau'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <blockquote className="text-xs text-slate-600 leading-relaxed italic border-l-3 border-teal-500 pl-3 py-1 bg-slate-50/70 rounded-r-lg">
                    {currentLeader.quote || 'Bagi kami, setiap pasien adalah anggota keluarga yang sedang membutuhkan pertolongan.'}
                  </blockquote>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER GUIDE / INTEGRATION INFO ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={17} />
        </div>
        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
          <h5 className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
            Bagaimana Pesan Ini Berdampak Pada Kepercayaan Pasien?
          </h5>
          <p>
            Pesan kepemimpinan medis adalah representasi etika kedokteran dan jaminan mutu klinis rumah sakit. Menampilkan foto dokter/direktur yang ramah dan pesan empati terbukti meningkatkan keyakinan pasien hingga 40% sebelum mereka memesan jadwal temu dokter spesialis.
          </p>
        </div>
      </div>
    </div>
  );
}
