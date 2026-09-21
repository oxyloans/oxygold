import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import TokenManager from '../utils/tokenManager';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = TokenManager.getInstance().isLoggedIn();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
