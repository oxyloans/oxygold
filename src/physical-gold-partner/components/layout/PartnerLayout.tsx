import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { isPartnerLoggedIn } from '../../services/partnerService';
import Dashboard from '../../pages/Dashboard';
import Orders from '../../pages/Orders';
import OrderDetails from '../../pages/OrderDetails';
import DeliveryBoys from '../../pages/DeliveryBoys';


const PartnerLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile

    if (!isPartnerLoggedIn()) {
        return <Navigate to="/partner/login" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="transition-all duration-300 flex flex-col min-h-screen lg:ml-64">
                <Header onMenuClick={toggleSidebar} />
                <main className="flex-1 p-3 sm:p-4 lg:p-6">
                    <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="delivery-boys" element={<DeliveryBoys />} />
            
                        <Route path="orders" element={<Orders />} />
                        <Route path="orders/:orderId" element={<OrderDetails />} />
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default PartnerLayout;
