import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardLink } from '../utils/roleHelper';

/**
 * ProtectedRoute Wrapper
 * Ensures that unauthenticated users cannot open any dashboard or private page.
 * If user is not logged in, redirects them straight to /login.
 * Optionally validates user role.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">Checking StaySync authentication...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, verify match
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardLink(user)} replace />;
  }

  return children;
}
