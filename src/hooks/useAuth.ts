import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { UserSession } from '../types/business';

export function useAuth() {
  const [session, setSession] = useState<UserSession>({
    userId: '',
    email: '',
    name: '',
    isAuthenticated: false,
    activeBusinessId: '',
    role: 'owner',
  });
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const current = await api.getSession();
      setSession(current);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
        await refreshSession();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    const s = await api.signIn(email, pass);
    setSession(s);
    return s;
  };

  const signUp = async (email: string, pass: string, fullName: string, businessName: string) => {
    const s = await api.signUp(email, pass, fullName, businessName);
    setSession(s);
    return s;
  };

  const signOut = async () => {
    await api.signOut();
    setSession({
      userId: '',
      email: '',
      name: '',
      isAuthenticated: false,
      activeBusinessId: '',
      role: 'owner',
    });
  };

  return {
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
