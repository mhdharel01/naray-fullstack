import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPortal from './admin/AdminPortal.jsx'
import { HospitalDataProvider } from './context/HospitalDataContext.jsx'

// Sub-pages with dedicated URLs
import DoctorSchedulePage from './pages/DoctorSchedulePage.jsx'
import DoctorDetailPage from './pages/DoctorDetailPage.jsx'
import McuPackagePage from './pages/McuPackagePage.jsx'
import GalleryVideoPage from './pages/GalleryVideoPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import ArticleDetailPage from './pages/ArticleDetailPage.jsx'
import PoliklinikPage from './pages/PoliklinikPage.jsx'
import MedicalServicesPage from './pages/MedicalServicesPage.jsx'
import InpatientRoomsPage from './pages/InpatientRoomsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ContactPage from './pages/ContactPage.jsx'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Global ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#F8FAFC',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Terjadi Kesalahan pada Aplikasi
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'Gagal memuat komponen aplikasi.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch(e) {}
                  window.location.reload();
                }}
                style={{
                  background: '#078F83',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Reset Cache &amp; Muat Ulang
              </button>
              <a
                href="/"
                style={{
                  background: '#F1F5F9',
                  color: '#334155',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Ke Beranda
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HospitalDataProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/admin" element={<AdminPortal />} />
            {/* Sub-pages with unique URLs */}
            <Route path="/poliklinik" element={<Navigate to="/dokter-jadwal" replace />} />
            <Route path="/dokter-jadwal" element={<DoctorSchedulePage />} />
            <Route path="/dokter/:slug" element={<DoctorDetailPage />} />
            <Route path="/dokter-detail/:slug" element={<DoctorDetailPage />} />
            <Route path="/layanan-medis" element={<MedicalServicesPage />} />
            <Route path="/kamar-rawat-inap" element={<InpatientRoomsPage />} />
            <Route path="/kamar" element={<InpatientRoomsPage />} />
            <Route path="/paket-mcu" element={<McuPackagePage />} />
            <Route path="/galeri-video" element={<GalleryVideoPage />} />
            <Route path="/berita-artikel" element={<ArticlePage />} />
            <Route path="/berita-artikel/:slug" element={<ArticleDetailPage />} />
            <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
            <Route path="/berita/:slug" element={<ArticleDetailPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/tentang-kami" element={<ProfilePage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="/hubungi-kami" element={<ContactPage />} />
            {/* Main homepage catches all other paths */}
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </HospitalDataProvider>
    </ErrorBoundary>
  </StrictMode>,
)

