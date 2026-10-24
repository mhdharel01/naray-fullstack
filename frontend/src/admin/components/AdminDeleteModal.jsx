import React from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminDeleteModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} />
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-900 text-center">
          Konfirmasi Penghapusan
        </h3>
        <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
          Apakah Anda yakin ingin menghapus <strong className="text-slate-800 font-bold">"{title}"</strong>? Data ini akan dihapus secara permanen dari sistem dan database.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Ya, Hapus Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
