import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import PaquetesPage from './pages/PaquetesPage';
import PakkPage from './pages/PakkPage';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="service/:id" element={<ServiceDetailPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="paquetes" element={<PaquetesPage />} />
              <Route path="pakk" element={<PakkPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
