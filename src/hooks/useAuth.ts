import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { UserSession } from '../types/business';

export function useAuth() {
  const [session, setSession] = useState<UserSession>({
    userId: '',
    email: '',
    phone: '',
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

  const createBusiness = async (name: string, category: string, neighborhood: string, city: string, phone: string) => {
    const s = await api.createBusiness(name, category, neighborhood, city, phone);
    setSession(s);
    return s;
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    const s = await api.signUp(email, pass, fullName);
    setSession(s);
    return s;
  };

  const getMyBusinesses = async () => {
    return await api.getMyBusinesses();
  };

  const getAccountLimits = async () => {
    return await api.getAccountLimits();
  };

  const switchBusiness = (businessId: string) => {
    if (!session) return;
    localStorage.setItem('sc_active_business_id', businessId);
    const newSession = { ...session, activeBusinessId: businessId };
    setSession(newSession);
    if (!isSupabaseConfigured) {
      localStorage.setItem('sc_local_session', JSON.stringify(newSession));
    }
  };

  const resetPassword = async (email: string) => {
    await api.resetPassword(email);
  };

  const signOut = async () => {
    await api.signOut();
    setSession({
      userId: '',
      email: '',
      phone: '',
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
    resetPassword,
    createBusiness,
    getMyBusinesses,
    getAccountLimits,
    switchBusiness,
    refreshSession,
  };
}
