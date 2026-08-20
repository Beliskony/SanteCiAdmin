// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AdminPermission } from '../types/IAdmin';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: AdminPermission;
  superAdminOnly?: boolean;
}

export function ProtectedRoute({ children, requiredPermission, superAdminOnly }: ProtectedRouteProps) {
  const { admin, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Pas de session → login, avec redirection de retour après connexion
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Compte suspendu/bloqué entre-temps (détecté au chargement via /admin/me,
  // ou après un refresh qui a lui-même échoué) → retour au login
  if (admin.status.accountStatus !== 'active') {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && admin.role !== 'superadmin') {
    return <Navigate to="/dashboard/forbidden" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard/forbidden" replace />;
  }

  return <>{children}</>;
}