import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AdminGallery from './pages/AdminGallery';
import AdminVideos from './pages/AdminVideos';
import AdminMeetingPoints from './pages/AdminMeetingPoints';
import PoliticaCancelacion from './pages/PoliticaCancelacion';
import PaquetesPage from './pages/PaquetesPage';
import PakkPage from './pages/PakkPage';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="service/:id" element={<ServiceDetailPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="politica-de-cancelacion" element={<PoliticaCancelacion />} />
                <Route path="pakk" element={<PakkPage />} />
                {/* Protected admin routes */}
                <Route path="admin-login" element={<AdminLogin />} />
                <Route path="admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="admin/settings" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="admin/videos" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
                <Route path="admin/meeting-points" element={<ProtectedRoute><AdminMeetingPoints /></ProtectedRoute>} />
                <Route path="admingallery" element={<ProtectedRoute><AdminGallery /></ProtectedRoute>} />
                <Route path="paquetes" element={<ProtectedRoute><PakkPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
