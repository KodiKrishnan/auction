import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Route guest to the correct login page based on role requirement
    const fallback = allowedRole === "OWNER" ? "/owner/register" : "/traveller/register";
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Retrieve user role from session or user object
  const userRole = sessionStorage.getItem("role") || user.role;

  if (allowedRole && userRole !== allowedRole) {
    // Redirect wrong roles to their respective dashboards
    return <Navigate to={userRole === "OWNER" ? "/owner/dashboard" : "/traveller/properties"} replace />;
  }

  return children;
}