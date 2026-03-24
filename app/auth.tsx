import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppLogo } from '../components/ui/AppLogo';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

async function openAuthSessionWithTimeout(url: string, redirectUri: string, timeoutMs = 45000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('OAuth timed out. Please try again.')), timeoutMs);
  });

  try {
    return await Promise.race([WebBrowser.openAuthSessionAsync(url, redirectUri), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, loading, error, session, enableQuickBypass } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<null | 'google' | 'github' | 'apple'>(null);

  const canSubmit = useMemo(() => {
    if (!email || !password) {
      return false;
    }
    if (!isLogin && !name) {
      return false;
    }
    return true;
  }, [email, password, name, isLogin]);

  useEffect(() => {
    if (session?.user) {
      router.replace('/(tabs)');
    }
  }, [session?.user?.id, router]);

  const onSubmit = async () => {
    setBusy(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(name.trim(), email.trim(), password);
        Alert.alert('Account created', 'If email verification is enabled, please verify your email and then log in.');
        setIsLogin(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSocialSignIn = async (provider: 'google' | 'github' | 'apple') => {
    setOauthBusy(provider);
    try {
      const redirectTo = 'bmate://auth';

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (oauthError) {
        throw oauthError;
      }

      if (!data?.url) {
        throw new Error('OAuth URL was not generated. Check provider setup in Supabase.');
      }

      const oauthUrl = new URL(data.url);
      // Force app deep-link callback to avoid provider/site-url fallback to localhost.
      oauthUrl.searchParams.set('redirect_to', redirectTo);

      const authResult = await openAuthSessionWithTimeout(oauthUrl.toString(), redirectTo);
      if (authResult.type !== 'success' || !authResult.url) {
        Alert.alert(
          'Login cancelled',
          'Provider did not return to app. If browser opened localhost:3000, add bmate://auth and bmate://profile to Supabase Auth -> URL Configuration -> Redirect URLs.'
        );
        return;
      }

      const callbackUrl = new URL(authResult.url);
      const code = callbackUrl.searchParams.get('code');
      const errorDescription =
        callbackUrl.searchParams.get('error_description') || callbackUrl.searchParams.get('error');

      if (errorDescription) {
        throw new Error(errorDescription);
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          throw exchangeError;
        }
        return;
      }

      // Some providers/mobile flows return tokens in URL fragment instead of ?code
      const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const tokenError = hashParams.get('error_description') || hashParams.get('error');

      if (tokenError) {
        throw new Error(tokenError);
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (sessionError) {
          throw sessionError;
        }
        return;
      }

      throw new Error('Authorization callback did not include a code or access token.');
    } catch (oauthError) {
      Alert.alert('Social login failed', oauthError instanceof Error ? oauthError.message : 'Unable to start social login.');
    } finally {
      setOauthBusy(null);
    }
  };

  const onQuickBypass = async () => {
    try {
      await enableQuickBypass();
      router.replace('/(tabs)');
    } catch (bypassError) {
      Alert.alert('Bypass failed', bypassError instanceof Error ? bypassError.message : 'Unable to enable quick bypass');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <LinearGradient colors={['#FFFFFF', '#F5F7FC']} style={styles.card}>
          <View style={styles.logoWrap}>
            <AppLogo size={72} />
          </View>
          <Text style={styles.heading}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          <Text style={styles.subheading}>B Mate Student Services</Text>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#A8B0BF"
              />
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A8B0BF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#A8B0BF"
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#7B2FF7"
                />
              </Pressable>
            </View>

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit || busy || loading}
              style={({ pressed }) => [styles.loginButtonShell, pressed && styles.loginButtonPressed, (!canSubmit || busy || loading) && styles.loginButtonDisabled]}
            >
              <LinearGradient colors={['#7B2FF7', '#3A1C71']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>{busy ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>Or continue with Google, Github, Apple</Text>
              <View style={styles.socialRow}>
                <Pressable
                  style={[styles.socialButton, oauthBusy === 'google' && styles.socialButtonBusy]}
                  onPress={() => onSocialSignIn('google')}
                  disabled={Boolean(oauthBusy)}
                >
                  <GoogleLogo />
                </Pressable>
                <Pressable
                  style={[styles.socialButton, oauthBusy === 'github' && styles.socialButtonBusy]}
                  onPress={() => onSocialSignIn('github')}
                  disabled={Boolean(oauthBusy)}
                >
                  <GithubLogo />
                </Pressable>
                <Pressable
                  style={[styles.socialButton, oauthBusy === 'apple' && styles.socialButtonBusy]}
                  onPress={() => onSocialSignIn('apple')}
                  disabled={Boolean(oauthBusy)}
                >
                  <AppleLogo />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={onQuickBypass} style={styles.bypassButton}>
              <Text style={styles.bypassText}>Quick Bypass Login (Temporary)</Text>
            </Pressable>

            <Pressable onPress={() => setIsLogin((value) => !value)}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
              </Text>
            </Pressable>

            <Text style={styles.agreement}>By continuing, you agree to B Mate Terms & Privacy.</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d="M17.64 9.2c0-.63-.06-1.24-.16-1.82H9v3.44h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.6z"
        fill="#4285F4"
      />
      <Path
        d="M9 18c2.43 0 4.48-.8 5.98-2.2l-2.9-2.26c-.8.54-1.82.86-3.08.86-2.36 0-4.35-1.6-5.06-3.74H.96v2.33A9 9 0 009 18z"
        fill="#34A853"
      />
      <Path
        d="M3.94 10.66A5.4 5.4 0 013.66 9c0-.58.1-1.13.28-1.66V5H.96A9 9 0 000 9c0 1.46.35 2.85.96 4.0l2.98-2.34z"
        fill="#FBBC05"
      />
      <Path
        d="M9 3.58c1.32 0 2.5.45 3.42 1.33l2.56-2.56C13.47.95 11.42 0 9 0A9 9 0 00.96 5l2.98 2.34C4.65 5.2 6.64 3.58 9 3.58z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function GithubLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 2a10 10 0 00-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.36-1.2-3.36-1.2-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.88 1.52 2.3 1.08 2.86.82.09-.64.35-1.08.64-1.33-2.22-.26-4.56-1.12-4.56-4.96 0-1.1.39-2 1.03-2.72-.1-.25-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0112 6.8a9.5 9.5 0 012.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.4.2 2.45.1 2.7.64.72 1.03 1.62 1.03 2.72 0 3.85-2.34 4.7-4.57 4.96.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function AppleLogo() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M16.6 12.5c0-2 1.65-3 1.72-3.05a3.7 3.7 0 00-2.9-1.58c-1.24-.13-2.42.72-3.05.72-.63 0-1.6-.7-2.63-.68-1.35.02-2.6.8-3.3 2-.7 1.2-.9 3.1-.23 4.74.66 1.6 1.6 3.4 2.77 3.35 1.12-.05 1.55-.7 2.9-.7 1.36 0 1.75.7 2.92.67 1.2-.02 1.96-1.6 2.6-3.22.37-.93.53-1.83.54-1.88-.03-.01-3.34-1.28-3.34-5.07z"
        fill="#FFFFFF"
      />
      <Path d="M14.6 6.5c.54-.66.9-1.58.8-2.5-.78.03-1.72.52-2.28 1.18-.5.58-.93 1.5-.82 2.38.87.07 1.76-.45 2.3-1.06z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECEFFC'
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  card: {
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 26,
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 10
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 10
  },
  heading: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 34,
    color: '#5A189A'
  },
  subheading: {
    textAlign: 'center',
    marginTop: 4,
    color: '#7C8799',
    fontWeight: '600',
    fontSize: 12
  },
  form: {
    marginTop: 20
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 14,
    shadowColor: '#D6BCFA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    color: '#1E293B',
    fontWeight: '600'
  },
  passwordContainer: {
    position: 'relative',
    marginTop: 14
  },
  passwordInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingRight: 50,
    borderRadius: 20,
    shadowColor: '#D6BCFA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    color: '#1E293B',
    fontWeight: '600'
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 8
  },
  forgotWrap: {
    marginTop: 10,
    marginLeft: 8
  },
  forgotLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600'
  },
  loginButtonShell: {
    marginTop: 18,
    borderRadius: 20,
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 7
  },
  loginButton: {
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center'
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15
  },
  loginButtonPressed: {
    transform: [{ scale: 0.98 }]
  },
  loginButtonDisabled: {
    opacity: 0.55
  },
  socialContainer: {
    marginTop: 24
  },
  socialTitle: {
    textAlign: 'center',
    fontSize: 10,
    color: '#8C97A9',
    fontWeight: '600'
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 8
  },
  socialButton: {
    backgroundColor: '#1E1B4B',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5
  },
  socialButtonBusy: {
    opacity: 0.5
  },
  bypassButton: {
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    backgroundColor: '#FAF5FF',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14
  },
  bypassText: {
    color: '#6B21A8',
    fontSize: 12,
    fontWeight: '700'
  },
  switchText: {
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
    fontSize: 12
  },
  agreement: {
    textAlign: 'center',
    marginTop: 12,
    color: '#8C97A9',
    fontSize: 10,
    fontWeight: '500'
  },
  error: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '700',
    textAlign: 'center'
  }
});
