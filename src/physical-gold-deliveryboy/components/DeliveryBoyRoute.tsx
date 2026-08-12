import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isDeliveryBoyLoggedIn } from '../services/deliveryBoyService';

const DeliveryBoyRoute: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(isDeliveryBoyLoggedIn());
  useEffect(() => {
    const handleExpiredSession = () => setLoggedIn(false);
    window.addEventListener('delivery-session-expired', handleExpiredSession);
    return () => window.removeEventListener('delivery-session-expired', handleExpiredSession);
  }, []);
  return loggedIn ? <Outlet /> : <Navigate to="/delivery-boy/login" replace />;
};

export default DeliveryBoyRoute;
