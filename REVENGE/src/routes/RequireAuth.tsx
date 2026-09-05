import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { LoadingState } from '../components/ui/states';

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking your session…" />;
  if (!profile) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
