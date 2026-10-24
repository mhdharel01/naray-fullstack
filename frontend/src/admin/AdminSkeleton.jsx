import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Fullscreen / Container Branded Loading Screen
 * Digunakan saat inisialisasi awal admin portal agar tidak menampilkan data mentah palsu
 */
export function AdminLoadingScreen({ message = 'Memuat Data Administrasi Naray Hospital...' }) {
  return (
    <div className="admin-loading-screen-wrap">
      <div className="admin-loading-box">
        <div className="admin-loading-emblem-wrap">
          <div className="admin-loading-pulse-ring" />
          <div className="admin-loading-emblem">
            <ShieldCheck size={36} color="#FFFFFF" />
          </div>
        </div>

        <h3 className="admin-loading-title">Naray Hospital Dumai</h3>
        <p className="admin-loading-subtitle">{message}</p>

        <div className="admin-loading-bar-wrap">
          <div className="admin-loading-bar-fill" />
        </div>

        <span className="admin-loading-note">Sinkronisasi Real-Time dengan MySQL &amp; SIMRS Dekago</span>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader untuk 4 Kartu KPI Statistik Dashboard
 */
export function AdminStatsSkeleton({ count = 4 }) {
  return (
    <div className="admin-stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-stat-card admin-skeleton-card">
          <div className="admin-skeleton-icon" />
          <div className="admin-stat-info">
            <div className="admin-skeleton-line short" />
            <div className="admin-skeleton-line tiny" />
          </div>
          <div className="admin-skeleton-badge" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Loader untuk Baris Tabel (Dokter, Jadwal, Kamar, Artikel, dll.)
 */
export function AdminTableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="admin-table-skeleton-wrap">
      <div className="admin-table-skeleton-header">
        <div className="admin-skeleton-line medium" />
        <div className="admin-skeleton-badge" />
      </div>
      <div className="admin-table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c}>
                  <div className="admin-skeleton-line header-col" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="admin-skeleton-row">
                <td>
                  <div className="admin-skeleton-user-cell">
                    <div className="admin-skeleton-avatar" />
                    <div className="admin-skeleton-text-group">
                      <div className="admin-skeleton-line title" />
                      <div className="admin-skeleton-line sub" />
                    </div>
                  </div>
                </td>
                {Array.from({ length: cols - 1 }).map((_, c) => (
                  <td key={c}>
                    <div className="admin-skeleton-line cell" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader untuk Grid Card (Paket MCU, Layanan Unggulan, Galeri)
 */
export function AdminCardGridSkeleton({ count = 6 }) {
  return (
    <div className="admin-card-grid-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-grid-skeleton-item">
          <div className="admin-skeleton-img" />
          <div className="admin-grid-skeleton-body">
            <div className="admin-skeleton-line badge-line" />
            <div className="admin-skeleton-line title-line" />
            <div className="admin-skeleton-line desc-line" />
            <div className="admin-skeleton-line desc-line short" />
            <div className="admin-grid-skeleton-footer">
              <div className="admin-skeleton-line footer-left" />
              <div className="admin-skeleton-badge" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  AdminLoadingScreen,
  AdminStatsSkeleton,
  AdminTableSkeleton,
  AdminCardGridSkeleton
};
