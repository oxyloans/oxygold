import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getPartnerAdminToken } from "../services/partnerAdminService";

export const PartnerAdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getPartnerAdminToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/partner-admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PartnerAdminProtectedRoute;
