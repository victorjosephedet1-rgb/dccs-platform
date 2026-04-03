import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
