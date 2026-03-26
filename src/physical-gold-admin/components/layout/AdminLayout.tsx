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

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (!isAdminLoggedIn()) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Sidebar />

            <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'pl-50' : 'pl-0'}`}>
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-6">
                    <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="catalog-upload" element={<CatalogUpload />} />
                        <Route path="products" element={<Products />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
