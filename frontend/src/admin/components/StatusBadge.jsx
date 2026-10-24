import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Terkonfirmasi', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    waiting:   { label: 'Menunggu',      cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    pending:   { label: 'Pending',       cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    cancelled: { label: 'Dibatalkan',    cls: 'bg-rose-50 text-rose-700 border-rose-300', dot: 'bg-rose-500' },
    active:    { label: 'Aktif / Praktik', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    inactive:  { label: 'Nonaktif',      cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    published: { label: 'Terbit',        cls: 'bg-teal-50 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
    draft:     { label: 'Draf',          cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    leave:     { label: 'Sedang Cuti',   cls: 'bg-rose-50 text-rose-700 border-rose-300', dot: 'bg-rose-500 animate-pulse' },
  };

  const s = map[status] || {
    label: status,
    cls: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono border shadow-2xs ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      <span>{s.label}</span>
    </span>
  );
}
