import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { UserProfile } from '../types/app';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isBypassEnabled: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableQuickBypass: () => Promise<void>;
  disableQuickBypass: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isBypassEnabled, setIsBypassEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const initialSession = await authService.getSession();
        const bypassFlag = await AsyncStorage.getItem(STORAGE_KEYS.authBypass);
        if (!mounted) {
          return;
        }
        setSession(initialSession);
        setIsBypassEnabled(bypassFlag === '1');
        if (initialSession?.user?.id) {
          const fetchedProfile = await authService.fetchProfile(initialSession.user.id);
          setProfile(fetchedProfile);
          if (fetchedProfile) {
            await AsyncStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(fetchedProfile));
          }
        } else {
          const cachedProfile = await AsyncStorage.getItem(STORAGE_KEYS.userProfile);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) {
        return;
      }
      setSession(nextSession);
      await authService.saveSession(nextSession);
      if (nextSession?.user?.id) {
        setIsBypassEnabled(false);
        await AsyncStorage.removeItem(STORAGE_KEYS.authBypass);
        const fetchedProfile = await authService.fetchProfile(nextSession.user.id);
        setProfile(fetchedProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await authService.signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
    setIsBypassEnabled(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.authBypass);
  };

  const signUp = async (name: string, email: string, password: string) => {
    setError(null);
    const { error: signUpError } = await authService.signUp(name, email, password);
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
    setIsBypassEnabled(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.authBypass);
  };

  const enableQuickBypass = async () => {
    setError(null);
    setIsBypassEnabled(true);
    await AsyncStorage.setItem(STORAGE_KEYS.authBypass, '1');
  };

  const disableQuickBypass = async () => {
    setIsBypassEnabled(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.authBypass);
  };

  const signOut = async () => {
    setError(null);

    if (isBypassEnabled) {
      await disableQuickBypass();
      setSession(null);
      setProfile(null);
      return;
    }

    const { error: signOutError } = await authService.signOut();
    if (signOutError) {
      setError(signOutError.message);
      throw signOutError;
    }
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isBypassEnabled,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      enableQuickBypass,
      disableQuickBypass
    }),
    [session, profile, isBypassEnabled, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
