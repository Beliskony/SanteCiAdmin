// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { AdminUser, AdminPermission } from '../types/IAdmin';

interface AuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (identifiantLogin: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.get<{ data: AdminUser }>('/admin/me')
      .then((res) => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(identifiantLogin: string, password: string) {
    const res = await api.post<{ data: { accessToken: string; refreshToken: string; user: AdminUser } }>(
      '/admin/login',
      { identifiantLogin, password },
      { skipAuth: true }
    );
    localStorage.setItem('admin_access_token', res.data.accessToken);
    localStorage.setItem('admin_refresh_token', res.data.refreshToken);
    setAdmin(res.data.user);
  }

  async function logout() {
    try {
      await api.post('/admin/logout');
    } catch {
      // même si l'appel échoue, on nettoie quand même la session côté client
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      setAdmin(null);
    }
  }

  function hasPermission(permission: AdminPermission): boolean {
    if (!admin) return false;
    if (admin.role === 'superadmin') return true;
    return admin.permissions.includes(permission);
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}