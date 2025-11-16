import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-3">
          <Link to="/admin/settings" className="px-3 py-1 bg-indigo-600 text-white rounded">Edit Credentials</Link>
          <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/settings" className="block p-6 bg-white rounded shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Site Settings</h3>
          <p className="text-sm text-gray-600">Edit site images, contact details and branding.</p>
        </Link>

        <Link to="/paquetes" className="block p-6 bg-white rounded shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Paquetes</h3>
          <p className="text-sm text-gray-600">Manage tours and packages.</p>
        </Link>

        <Link to="/admingallery" className="block p-6 bg-white rounded shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Admin Gallery</h3>
          <p className="text-sm text-gray-600">Manage public gallery images.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
