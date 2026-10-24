import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingSpeedDial } from '../components/FloatingSpeedDial';
import { EmergencyModal } from '../components/EmergencyModal';
import { ToastNotification } from '../components/ToastNotification';
import { AdminBar } from '../components/AdminBar';

/**
 * PageLayout — shared shell for all sub-pages (Dokter, MCU, Galeri, Artikel).
 * Renders TopBar + Navbar + children + Footer + floating widgets.
 */
export function PageLayout({ children }) {
  const navigate = useNavigate();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => setToastMessage(msg);

  return (
    <div className="naray-app-root">
      {/* Admin Bar */}
      <AdminBar onShowToast={showToast} />

      {/* Top Bar */}
      <TopBar onOpenEmergency={() => setIsEmergencyOpen(true)} />

      {/* Sticky Navbar */}
      <Navbar
        onSearchDoctorClick={() => navigate('/dokter-jadwal')}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Page Content */}
      <main className="subpage-main">
        {typeof children === 'function'
          ? children({})
          : children}
      </main>

      {/* Footer */}
      <Footer
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Floating Speed Dial */}
      <FloatingSpeedDial
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Toast */}
      <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Emergency Modal */}
      {isEmergencyOpen && (
        <EmergencyModal onClose={() => setIsEmergencyOpen(false)} />
      )}
    </div>
  );
}
