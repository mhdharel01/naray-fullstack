import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function ToastNotification({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 max-w-md bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="alert"
    >
      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
      <span className="text-xs sm:text-sm font-medium leading-snug flex-1">{message}</span>
      <button 
        type="button"
        className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0" 
        onClick={onClose}
        aria-label="Tutup Notifikasi"
      >
        <X size={15} />
      </button>
    </div>
  );
}
