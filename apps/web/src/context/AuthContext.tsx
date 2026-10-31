import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSummary } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: UserSummary | null;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (email: string, pass: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('regulaflow_theme');
      return (saved as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('regulaflow_theme', theme);
    } catch (e) {
      // storage quota or private browsing note
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('regulaflow_token');
        const savedUser = localStorage.getItem('regulaflow_user');

        if (token && savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && typeof parsed === 'object') {
              setUser(parsed);
            }

            // Verify session with a 2.5-second timeout to avoid any network hanging
            const verifyPromise = authService.me();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth check timeout')), 2500)
            );

            const res = (await Promise.race([verifyPromise, timeoutPromise])) as any;
            if (res?.data?.user) {
              setUser(res.data.user);
              localStorage.setItem('regulaflow_user', JSON.stringify(res.data.user));
            }
          } catch (e: any) {
            if (e?.response?.status === 401) {
              localStorage.removeItem('regulaflow_token');
              localStorage.removeItem('regulaflow_user');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (globalErr) {
        console.error('[AuthContext] Session init error:', globalErr);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email.trim(), pass);
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('regulaflow_token', res.data.token);
        localStorage.setItem('regulaflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        throw new Error('Invalid response payload from server');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await authService.demoLogin(role);
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('regulaflow_token', res.data.token);
        localStorage.setItem('regulaflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        throw new Error('Invalid response payload from server');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      // non-blocking
    } finally {
      localStorage.removeItem('regulaflow_token');
      localStorage.removeItem('regulaflow_user');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toggleTheme,
        login,
        switchDemoRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
