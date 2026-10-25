import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin/admin-inpage.css';

// Components
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { QuickSearchWidget } from './components/QuickSearchWidget';
import { NarayIdentitySection } from './components/NarayIdentitySection';
import { CentersOfExcellence } from './components/CentersOfExcellence';
import { FeaturedDoctorsSection } from './components/FeaturedDoctorsSection';
import { HospitalServicesDiscovery } from './components/HospitalServicesDiscovery';
import { HospitalNewsSection } from './components/HospitalNewsSection';
import { Footer } from './components/Footer';

// Admin In-Page Components
import { AdminBar } from './components/AdminBar';
import { AdminEditModal } from './components/AdminEditModal';

// Modals & Floating Widgets
import { EmergencyModal } from './components/EmergencyModal';
import { CenterDetailModal } from './components/CenterDetailModal';
import { PackageDetailModal } from './components/PackageDetailModal';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { FloatingSpeedDial } from './components/FloatingSpeedDial';
import { ToastNotification } from './components/ToastNotification';

export default function App() {
  const navigate = useNavigate();

  // Global States
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Modal States
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [activeCenterModal, setActiveCenterModal] = useState(null);
  const [activePackageModal, setActivePackageModal] = useState(null);
  const [activeArticleModal, setActiveArticleModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Admin In-Page Edit State
  const [activeEditItemState, setActiveEditItemState] = useState(null); // { type, item, isNew }

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Handlers
  const handleSelectBranchFromTop = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId !== 'all') {
      showToast(`Menampilkan informasi untuk cabang terpilih`);
    }
  };

  const handleScrollToSection = (sectionId) => {
    if (sectionId === 'dokter') {
      const el = document.getElementById('dokter-unggulan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigate('/dokter-jadwal');
      return;
    }
    if (sectionId === 'poliklinik') {
      navigate('/dokter-jadwal');
      return;
    }
    if (sectionId === 'pusat-unggulan' || sectionId === 'layanan-unggulan') {
      const el = document.getElementById('layanan-unggulan') || document.getElementById('pusat-unggulan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigate('/layanan-medis');
      return;
    }
    if (sectionId === 'rawat-inap') {
      const el = document.getElementById('rawat-inap');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigate('/kamar-rawat-inap');
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEditItem = (type, item, isNew = false) => {
    setActiveEditItemState({ type, item, isNew });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans w-full max-w-full">
      {/* 0. Sticky Admin Status Banner (Only visible when Admin Mode is active) */}
      <AdminBar onShowToast={showToast} />

      {/* 1. Top Bar */}
      <TopBar 
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranchFromTop}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 2. Sticky Navbar */}
      <Navbar 
        onSearchDoctorClick={() => navigate('/dokter-jadwal')}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 3. Hero Carousel Banner */}
      <HeroBanner 
        onScrollToSection={handleScrollToSection}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 4. Floating 5 Quick Actions Bar & Fast Doctor Search (Matching RSU Dadi Keluarga Reference) */}
      <QuickSearchWidget 
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 5. Pusat Layanan Unggulan Terpadu (8 Integrated Healthcare Services Grid) */}
      <CentersOfExcellence 
        onSelectCenter={(center) => setActiveCenterModal(center)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 6. Dokter Spesialis Pilihan Kota Dumai (Tim Dokter Medis Berpengalaman) */}
      <FeaturedDoctorsSection />

      {/* 7. Sambutan Kepemimpinan & Komitmen Mutu Klinis (Membangun Reputasi & Akreditasi) */}
      <NarayIdentitySection />

      {/* 8. Fasilitas Pilihan & Program Unggulan (Directs to /kamar-rawat-inap & /paket-mcu) */}
      <HospitalServicesDiscovery 
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 9. Berita & Edukasi Kesehatan Keluarga (Dinamis dari Database) */}
      <HospitalNewsSection 
        onSelectArticle={(article) => setActiveArticleModal(article)}
      />

      {/* 10. Comprehensive Footer */}
      <Footer 
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Floating Speed Dial (WhatsApp, Emergency, Hotline) */}
      <FloatingSpeedDial 
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Toast Notification */}
      <ToastNotification 
        message={toastMessage} 
        onClose={() => setToastMessage('')} 
      />

      {/* ================= MODALS ================= */}

      {/* Admin In-Page Universal Item Edit/Create Modal */}
      {activeEditItemState && (
        <AdminEditModal
          editState={activeEditItemState}
          onClose={() => setActiveEditItemState(null)}
          onShowToast={showToast}
        />
      )}

      {/* Modal 2: Emergency & Ambulance 24 Hours */}
      {isEmergencyOpen && (
        <EmergencyModal 
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {/* Modal 3: Center of Excellence Detail Modal */}
      {activeCenterModal && (
        <CenterDetailModal 
          center={activeCenterModal}
          onClose={() => setActiveCenterModal(null)}
          onSelectDoctor={(doc) => {
            setActiveCenterModal(null);
            navigate(`/dokter/${doc.slug || doc.id || encodeURIComponent(doc.name || '')}`);
          }}
        />
      )}

      {/* Modal 4: Medical Check Up Package Detail Modal */}
      {activePackageModal && (
        <PackageDetailModal 
          pkg={activePackageModal}
          onClose={() => setActivePackageModal(null)}
        />
      )}

      {/* Modal 5: Article Detail Reader Modal */}
      {activeArticleModal && (
        <ArticleDetailModal 
          article={activeArticleModal}
          onClose={() => setActiveArticleModal(null)}
        />
      )}
    </div>
  );
}
