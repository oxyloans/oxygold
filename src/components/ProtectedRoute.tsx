import React from 'react';
import { Navigate } from 'react-router-dom';
import TokenManager from '../utils/tokenManager';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = TokenManager.getInstance().isLoggedIn();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
