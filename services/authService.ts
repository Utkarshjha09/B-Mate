import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

import { STORAGE_KEYS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/app';

export const authService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(name: string, email: string, password: string) {
    const signUpResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (signUpResponse.error || !signUpResponse.data.user) {
      return signUpResponse;
    }

    const user = signUpResponse.data.user;
    await supabase.from('users').upsert({ id: user.id, name, email }, { onConflict: 'id' });

    return signUpResponse;
  },

  async signOut() {
    await AsyncStorage.multiRemove([STORAGE_KEYS.authSession, STORAGE_KEYS.userProfile]);
    return supabase.auth.signOut();
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      return data.session;
    }

    const fallback = await AsyncStorage.getItem(STORAGE_KEYS.authSession);
    if (!fallback) {
      return null;
    }

    try {
      return JSON.parse(fallback) as Session;
    } catch {
      return null;
    }
  },

  async saveSession(session: Session | null) {
    if (session) {
      await AsyncStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
      return;
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.authSession);
  },

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) {
      return null;
    }

    return data as UserProfile;
  }
};
