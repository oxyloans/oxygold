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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (!isPartnerLoggedIn()) {
        return <Navigate to="/partner/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Sidebar />

            <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'pl-50' : 'pl-0'}`}>
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-6">
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
