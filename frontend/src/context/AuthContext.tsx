import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { maritimeService, DEFAULT_ROLE_PERMISSIONS } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permissionCode: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (role: 'admin' | 'agent_maritime' | 'capitainerie') => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeInterfacePermissions = (user: User): User => ({
  ...user,
  permissions: user.role === 'agent_maritime'
    ? DEFAULT_ROLE_PERMISSIONS.agent_maritime
    : (user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || []),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('maritime_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return normalizeInterfacePermissions(u);
      } catch {}
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('maritime_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const can = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'agent_maritime' && permissionCode === 'visites.delete') return true;
    if (user.role === 'agent_maritime') {
      return DEFAULT_ROLE_PERMISSIONS.agent_maritime.includes(permissionCode);
    }
    if (user.role === 'admin' && permissionCode === 'visites.create') return false;
    if (user.role === 'admin') return true; // Admin has access to all other functions
    const permissions = user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    return permissions.includes(permissionCode) || permissions.includes('*');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await maritimeService.login(email, password);
      const normalizedUser = normalizeInterfacePermissions(res.user);
      setUser(normalizedUser);
      setToken(res.token);
      localStorage.setItem('maritime_user', JSON.stringify(normalizedUser));
      localStorage.setItem('maritime_token', res.token);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('maritime_user');
    localStorage.removeItem('maritime_token');
  };

  const switchDemoUser = (role: 'admin' | 'agent_maritime' | 'capitainerie') => {
    let demoUser: User;
    if (role === 'admin') {
      demoUser = {
        id: 1,
        name: 'Direction Régionale ANP Casablanca',
        email: 'admin@portcasablanca.ma',
        role: 'admin',
        is_active: true,
        service: 'Agence Nationale des Ports (ANP)',
        permissions: DEFAULT_ROLE_PERMISSIONS.admin,
      };
    } else if (role === 'capitainerie') {
      demoUser = {
        id: 3,
        name: 'Capitainerie du Port de Casablanca (VTS)',
        email: 'capitainerie@portcasablanca.ma',
        role: 'capitainerie',
        is_active: true,
        service: 'Capitainerie ANP • Contrôle Mouvements Rade & Bassins',
        permissions: DEFAULT_ROLE_PERMISSIONS.capitainerie,
      };
    } else {
      demoUser = {
        id: 2,
        name: 'CMA CGM Maroc (Consignation)',
        email: 'agent@portcasablanca.ma',
        role: 'agent_maritime',
        is_active: true,
        service: 'Agence Maritime & Consignation Casablanca (Bd des Almohades)',
        permissions: DEFAULT_ROLE_PERMISSIONS.agent_maritime,
      };
    }
    const normalizedUser = normalizeInterfacePermissions(demoUser);
    setUser(normalizedUser);
    setToken('demo_token_' + role);
    localStorage.setItem('maritime_user', JSON.stringify(normalizedUser));
    localStorage.setItem('maritime_token', 'demo_token_' + role);
  };

  const refreshUser = () => {
    const saved = localStorage.getItem('maritime_user');
    if (saved) {
      try {
        setUser(normalizeInterfacePermissions(JSON.parse(saved)));
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        can,
        login,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
