import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '../types';
import * as authService from '../services/auth';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: Profile['role']) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const value: AuthContextValue = {
    profile,
    loading,
    signIn: async (email, password) => setProfile(await authService.signIn(email, password)),
    signUp: async (email, password, fullName, role) => setProfile(await authService.signUp(email, password, fullName, role)),
    signOut: async () => {
      await authService.signOut();
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
