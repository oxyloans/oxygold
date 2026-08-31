import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { isAdminLoggedIn } from '../../services/adminService';
import Dashboard from '../../pages/Dashboard';
import Orders from '../../pages/Orders';
import CatalogUpload from '../../pages/CatalogUpload';
import Products from '../../pages/Products';
import Settings from '../../pages/Settings';
import Users from '../../pages/Users';
import Helpdesk from '../../pages/Helpdesk';
import DeliveryTeam from '../../pages/DeliveryTeam';
import Reviews from '../../pages/Reviews';
import DeliveryPricing from '../../pages/DeliveryPricing';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-portal min-h-screen bg-[#FCFBF8] font-sans text-slate-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col transition-all duration-300 lg:pl-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 md:px-5 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="catalog-upload" element={<CatalogUpload />} />
              <Route path="products" element={<Products />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<Users />} />
              <Route path="helpdesk" element={<Helpdesk />} />
              <Route path="delivery" element={<DeliveryTeam />} />
              <Route path="delivery-pricing" element={<DeliveryPricing />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
