import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseSet } from '../hooks/supabaseset';

type AuthContextType = {
  user: any | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useSupabaseSet();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('admin_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await client.from('admins').select('*').eq('username', username).maybeSingle();
      if (error) return { ok: false, message: error.message };
      if (!data) return { ok: false, message: 'Invalid credentials' };

      const hash = (data as any).password_hash as string | undefined;
      if (!hash) return { ok: false, message: 'Invalid credentials' };

      // If stored value looks like a bcrypt hash, compare with bcrypt.
      let match = false;
      if (typeof hash === 'string' && /^\$2[aby]\$/.test(hash)) {
        const bcrypt = (await import('bcryptjs')).default;
        match = await bcrypt.compare(password, hash);
      } else {
        // Fallback: some installs may have plain-text passwords stored.
        match = password === hash;
      }

      if (!match) return { ok: false, message: 'Invalid credentials' };

      const sessionUser = { id: (data as any).id, username: (data as any).username };
      localStorage.setItem('admin_session', JSON.stringify({ user: sessionUser }));
      setUser(sessionUser);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: String(e.message || e) };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
