import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Alert,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppCard } from '../../components/ui/AppCard';
import { AppLogo } from '../../components/ui/AppLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { AUTH_PROFILE_LINK_REDIRECT_URI } from '../../lib/authRedirects';

WebBrowser.maybeCompleteAuthSession();

async function openAuthSessionWithTimeout(url: string, redirectUri: string, timeoutMs = 45000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('OAuth timed out. Please try again.')), timeoutMs);
  });

  try {
    console.log('Opening auth session with URL:', url);
    console.log('Expected redirect URI:', redirectUri);
    const result = await Promise.race([WebBrowser.openAuthSessionAsync(url, redirectUri), timeoutPromise]);
    console.log('Auth session result:', result);
    return result;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [hostel, setHostel] = useState('');
  const [room, setRoom] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(1990, 0, 1));
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const DatePickerComponent = useMemo(() => {
    try {
      return require('@react-native-community/datetimepicker').default;
    } catch {
      return null;
    }
  }, []);

  const toStorageDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toDisplayDate = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const parseDobToDate = (value: string): Date | null => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const countryCodes = [
    { code: '+1', country: '🇺🇸 USA' },
    { code: '+44', country: '🇬🇧 UK' },
    { code: '+91', country: '🇮🇳 India' },
    { code: '+86', country: '🇨🇳 China' },
    { code: '+81', country: '🇯🇵 Japan' },
    { code: '+49', country: '🇩🇪 Germany' },
    { code: '+33', country: '🇫🇷 France' },
    { code: '+39', country: '🇮🇹 Italy' },
    { code: '+34', country: '🇪🇸 Spain' },
    { code: '+61', country: '🇦🇺 Australia' },
    { code: '+64', country: '🇳🇿 New Zealand' },
    { code: '+27', country: '🇿🇦 South Africa' },
  ];

  useEffect(() => {
    setName(profile?.name || user?.user_metadata?.name || '');
    setEmail(profile?.email || user?.email || '');
    const dobValue = profile?.dob || user?.user_metadata?.dob || '';
    setDob(dobValue);
    setPhone(profile?.phone || user?.user_metadata?.phone || '');
    setHostel(profile?.hostel || user?.user_metadata?.hostel || '');
    setRoom(profile?.room || user?.user_metadata?.room || '');
    setCountryCode(profile?.country_code || user?.user_metadata?.country_code || '+91');
    if (dobValue) {
      const parsedDate = parseDobToDate(dobValue);
      setSelectedDate(parsedDate ?? new Date(1990, 0, 1));
    }
  }, [profile?.name, profile?.email, user?.email, user?.user_metadata]);

  const redirectUri = useMemo(() => AUTH_PROFILE_LINK_REDIRECT_URI, []);
  const linkedProviders = useMemo(() => user?.identities?.map((identity) => identity.provider) ?? [], [user?.identities]);

  useEffect(() => {
    if (!linkingProvider) {
      return;
    }

    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState !== 'active' || !linkingProvider) {
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        const providers = data.user?.identities?.map((identity) => identity.provider) ?? [];

        if (providers.includes(linkingProvider)) {
          const providerLabel = linkingProvider === 'github' ? 'GitHub' : linkingProvider === 'apple' ? 'Apple' : 'Google';
          Alert.alert('Linked', `${providerLabel} account linked successfully.`);
        }
      } finally {
        setLinkingProvider(null);
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => {
      sub.remove();
    };
  }, [linkingProvider]);

  const onSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Logout failed', error instanceof Error ? error.message : 'Unable to sign out');
    }
  };

  const onSaveDetails = async () => {
    if (savingDetails) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Session missing', 'Please login again and try saving details.');
      return;
    }

    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert('Invalid DOB', 'Please select date from calendar.');
      return;
    }

    setSavingDetails(true);
    try {
      const profileResult = await withTimeout(
        Promise.resolve(
          supabase
            .from('users')
            .upsert(
              {
                id: user.id,
                name: name.trim(),
                email: email.trim(),
                dob: dob.trim(),
                phone: phone.trim(),
                country_code: countryCode,
                hostel: hostel.trim(),
                room: room.trim(),
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            )
        ),
        20000,
        'Profile update timed out. Please check network and retry.'
      );

      if (profileResult.error) {
        throw profileResult.error;
      }

      Alert.alert(
        'Profile updated',
        'Your details were updated successfully.'
      );
      setIsEditingDetails(false);
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error
          ? `${error.message}\n\nIf this is the first run, apply latest SQL in supabase/schema.sql to add profile columns.`
          : 'Unable to update profile'
      );
    } finally {
      setSavingDetails(false);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing password', 'Please enter new password and confirm password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password should be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'Confirm password does not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password changed', 'Your password has been updated.');
    } catch (error) {
      Alert.alert('Password update failed', error instanceof Error ? error.message : 'Unable to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const onLinkProvider = async (provider: 'google' | 'github' | 'apple') => {
    if (linkedProviders.includes(provider)) {
      return;
    }
    setLinkingProvider(provider);
    try {
      if (!user?.id) {
        throw new Error('No active session. Please log in again before linking accounts.');
      }

      const sourceUserId = user.id;
      const { data: activeSessionData } = await supabase.auth.getSession();
      const sourceSession = activeSessionData.session;

      const providerLabel = provider === 'github' ? 'GitHub' : provider === 'apple' ? 'Apple' : 'Google';
      const authApi = supabase.auth as unknown as {
        linkIdentity?: (params: {
          provider: 'google' | 'github' | 'apple';
          options?: { redirectTo?: string; skipBrowserRedirect?: boolean; queryParams?: Record<string, string> };
        }) => Promise<{ data: { url?: string } | null; error: Error | null }>;
      };

      if (!authApi.linkIdentity) {
        throw new Error('Account linking is not available in current auth SDK. Update Supabase client to use provider linking.');
      }

      const oauthRequest = await authApi.linkIdentity({
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: { link: '1' }
        }
      });

      console.log('OAuth request result:', oauthRequest);

      if (oauthRequest.error) {
        throw oauthRequest.error;
      }

      if (!oauthRequest.data?.url) {
        throw new Error('OAuth URL was not generated. Check provider setup in Supabase.');
      }

      const oauthUrl = new URL(oauthRequest.data.url);
      // Force app deep-link callback to avoid provider/site-url fallback to localhost.
      oauthUrl.searchParams.set('redirect_to', redirectUri);

      console.log('Final OAuth URL:', oauthUrl.toString());
      console.log('Redirect URI:', redirectUri);

      const authResult = await openAuthSessionWithTimeout(oauthUrl.toString(), redirectUri);
      console.log('Auth result type:', authResult.type);
      console.log('Auth result:', authResult);
      if (authResult.type !== 'success' || !authResult.url) {
        const { data: latestUserData } = await supabase.auth.getUser();
        const latestUserId = latestUserData.user?.id;
        if (latestUserId && latestUserId !== sourceUserId) {
          if (sourceSession?.access_token && sourceSession?.refresh_token) {
            await supabase.auth.setSession({
              access_token: sourceSession.access_token,
              refresh_token: sourceSession.refresh_token
            });
          }
          throw new Error(`${providerLabel} is already linked with another account. Link blocked to prevent duplicate login.`);
        }

        const latestProviders = latestUserData.user?.identities?.map((identity) => identity.provider) ?? [];
        if (latestProviders.includes(provider)) {
          Alert.alert('Linked', `${providerLabel} account linked successfully.`);
          return;
        }

        Alert.alert(
          'Link cancelled',
          'Provider did not return to app. Make sure bmate://profile and bmate://auth are added to Supabase Auth -> URL Configuration -> Redirect URLs, then rebuild the app.'
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
      } else {
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
        }
      }

      const { data: finalUserData } = await supabase.auth.getUser();
      const finalUserId = finalUserData.user?.id;
      if (!finalUserId || finalUserId !== sourceUserId) {
        if (sourceSession?.access_token && sourceSession?.refresh_token) {
          await supabase.auth.setSession({
            access_token: sourceSession.access_token,
            refresh_token: sourceSession.refresh_token
          });
        }
        throw new Error(`${providerLabel} is already linked with another account. Link blocked to prevent duplicate login.`);
      }

      Alert.alert('Linked', `${providerLabel} account linked successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to link account';
      const normalized = message.toLowerCase();

      if (normalized.includes('manual linking is disabled')) {
        Alert.alert(
          'Linking disabled in Supabase',
          `Please enable Manual Linking in Supabase Auth settings, then try linking ${provider === 'github' ? 'GitHub' : provider === 'apple' ? 'Apple' : 'Google'} again.\n\nSupabase: Authentication -> Providers -> Enable Manual Linking`
        );
      } else if (provider === 'apple') {
        Alert.alert(
          'Apple link failed',
          `${message}\n\nAlso confirm Apple provider is fully configured in Supabase (Service ID, Team ID, Key ID, private key, and redirect URL).`
        );
      } else {
        Alert.alert('Link failed', message);
      }
    } finally {
      setLinkingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80' }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient colors={['rgba(17,24,39,0.55)', 'rgba(17,24,39,0.82)']} style={styles.heroOverlay}>
            <View style={styles.heroLogoWrap}>
              <AppLogo size={42} />
            </View>
            <View style={styles.identityRow}>
              <View style={styles.avatarWrap}>
                <AppLogo size={52} />
              </View>
              <View>
                <Text style={styles.name}>{name || 'Student Mate'}</Text>
                <Text style={styles.college}>{email || 'student@college.edu'}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* My Details Card */}
        <AppCard style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>My Details</Text>
            <Pressable onPress={() => setIsEditingDetails(!isEditingDetails)} style={styles.editScroll}>
              <Text style={styles.editButtonText}>{isEditingDetails ? 'Cancel' : 'Edit Detail'}</Text>
            </Pressable>
          </View>

          {isEditingDetails ? (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Date of Birth</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateInputText}>
                  {dob ? toDisplayDate(dob) : 'Select your date of birth'}
                </Text>
              </Pressable>

              <Text style={styles.label}>Phone</Text>
              <View style={styles.phoneContainer}>
                <Pressable
                  onPress={() => setShowCountryPicker(true)}
                  style={styles.countryCodeButton}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.primary} />
                </Pressable>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  style={styles.phoneInput}
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.label}>Hostel</Text>
              <TextInput
                value={hostel}
                onChangeText={setHostel}
                placeholder="Hostel name"
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Room</Text>
              <TextInput
                value={room}
                onChangeText={setRoom}
                placeholder="Room no."
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />

              <PrimaryButton
                label={savingDetails ? 'Saving...' : 'Save Details'}
                onPress={onSaveDetails}
                disabled={savingDetails}
                style={styles.actionBtn}
              />
            </>
          ) : (
            <View style={styles.detailsGrid}>
              <DetailRow label="Name" value={name || 'Not set'} />
              <DetailRow label="Email" value={email || 'Not set'} />
              <DetailRow label="Date of Birth" value={dob || 'Not set'} />
              <DetailRow label="Phone" value={phone || 'Not set'} />
              <DetailRow label="Hostel" value={hostel || 'Not set'} />
              <DetailRow label="Room" value={room || 'Not set'} />
            </View>
          )}
        </AppCard>

        {/* Linked Accounts */}
        <AppCard style={styles.formCard}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <View style={styles.providerRow}>
            {[
              { key: 'google', label: 'Google' },
              { key: 'github', label: 'GitHub' },
              { key: 'apple', label: 'Apple' }
            ].map((provider) => {
              const isLinked = linkedProviders.includes(provider.key);
              return (
                <Pressable
                  key={provider.key}
                  style={[
                    styles.providerButton,
                    isLinked ? styles.providerButtonLinked : styles.providerButtonNeutral
                  ]}
                  onPress={() => onLinkProvider(provider.key as 'google' | 'github' | 'apple')}
                  disabled={isLinked || linkingProvider === provider.key}
                >
                  <View style={styles.providerTop}>
                    <ProviderLogo provider={provider.key as 'google' | 'github' | 'apple'} />
                    <Text style={[styles.providerLabel, isLinked && styles.providerLabelLinked]}>
                      {provider.label}
                    </Text>
                  </View>
                  <Text style={styles.providerStatus}>
                    {isLinked ? 'Linked' : linkingProvider === provider.key ? 'Linking...' : 'Tap to connect'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        {/* Change Password Button */}
        <Pressable
          style={styles.changePasswordButton}
          onPress={() => setShowChangePasswordModal(true)}
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable style={styles.logoutButton} onPress={onSignOut}>
          <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowChangePasswordModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setShowChangePasswordModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                  style={styles.passwordInput}
                  placeholderTextColor="#94A3B8"
                />
                <Pressable
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.passwordEyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showNewPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  style={styles.passwordInput}
                  placeholderTextColor="#94A3B8"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordEyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>

              <PrimaryButton
                label={savingPassword ? 'Updating...' : 'Update Password'}
                onPress={onChangePassword}
                disabled={savingPassword}
                style={styles.actionBtn}
              />

              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowChangePasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <SafeAreaView style={styles.countryPickerContainer} edges={['bottom']}>
          <Pressable
            style={styles.countryPickerBackdrop}
            onPress={() => setShowCountryPicker(false)}
          />
          <View style={styles.countryPickerContent}>
            <View style={styles.countryPickerHeader}>
              <Text style={styles.countryPickerTitle}>Select Country Code</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </Pressable>
            </View>
            <ScrollView style={styles.countryPickerList}>
              {countryCodes.map((item) => (
                <Pressable
                  key={item.code}
                  style={[styles.countryItem, countryCode === item.code && styles.countryItemSelected]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={[styles.countryItemText, countryCode === item.code && styles.countryItemTextSelected]}>
                    {item.country} {item.code}
                  </Text>
                  {countryCode === item.code && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <SafeAreaView style={styles.datePickerContainer} edges={['bottom']}>
          <Pressable
            style={styles.datePickerBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </Pressable>
            </View>
            <View style={styles.datePickerBody}>
              {DatePickerComponent ? (
                <DatePickerComponent
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  maximumDate={new Date()}
                  onChange={(_: unknown, date?: Date) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (date) {
                      setSelectedDate(date);
                      setDob(toStorageDate(date));
                    }
                  }}
                />
              ) : (
                <View style={styles.datePickerFallbackWrap}>
                  <Text style={styles.datePickerFallbackText}>Calendar unavailable on this build.</Text>
                  <TextInput
                    value={dob ? toDisplayDate(dob) : ''}
                    onChangeText={(value) => {
                      const trimmed = value.trim();
                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
                        const [day, month, year] = trimmed.split('/');
                        setDob(`${year}-${month}-${day}`);
                      }
                    }}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#94A3B8"
                    style={styles.datePickerFallbackInput}
                  />
                </View>
              )}
            </View>
            {Platform.OS === 'ios' && (
              <Pressable
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerButtonText}>Done</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProviderLogo({ provider }: { provider: 'google' | 'github' | 'apple' }) {
  if (provider === 'google') {
    return (
      <Svg width={16} height={16} viewBox="0 0 18 18">
        <Path
          d="M17.64 9.2c0-.63-.06-1.24-.16-1.82H9v3.44h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.6z"
          fill="#4285F4"
        />
        <Path
          d="M9 18c2.43 0 4.48-.8 5.98-2.2l-2.9-2.26c-.8.54-1.82.86-3.08.86-2.36 0-4.35-1.6-5.06-3.74H.96v2.33A9 9 0 009 18z"
          fill="#34A853"
        />
        <Path
          d="M3.94 10.66A5.4 5.4 0 013.66 9c0-.58.1-1.13.28-1.66V5H.96A9 9 0 000 9c0 1.46.35 2.85.96 4l2.98-2.34z"
          fill="#FBBC05"
        />
        <Path
          d="M9 3.58c1.32 0 2.5.45 3.42 1.33l2.56-2.56C13.47.95 11.42 0 9 0A9 9 0 00.96 5l2.98 2.34C4.65 5.2 6.64 3.58 9 3.58z"
          fill="#EA4335"
        />
      </Svg>
    );
  }

  if (provider === 'github') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Path
          d="M12 2a10 10 0 00-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.36-1.2-3.36-1.2-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.88 1.52 2.3 1.08 2.86.82.09-.64.35-1.08.64-1.33-2.22-.26-4.56-1.12-4.56-4.96 0-1.1.39-2 1.03-2.72-.1-.25-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0112 6.8a9.5 9.5 0 012.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.4.2 2.45.1 2.7.64.72 1.03 1.62 1.03 2.72 0 3.85-2.34 4.7-4.57 4.96.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z"
          fill="#0F172A"
        />
      </Svg>
    );
  }

  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M16.6 12.5c0-2 1.65-3 1.72-3.05a3.7 3.7 0 00-2.9-1.58c-1.24-.13-2.42.72-3.05.72-.63 0-1.6-.7-2.63-.68-1.35.02-2.6.8-3.3 2-.7 1.2-.9 3.1-.23 4.74.66 1.6 1.6 3.4 2.77 3.35 1.12-.05 1.55-.7 2.9-.7 1.36 0 1.75.7 2.92.67 1.2-.02 1.96-1.6 2.6-3.22.37-.93.53-1.83.54-1.88-.03-.01-3.34-1.28-3.34-5.07z"
        fill="#111827"
      />
      <Path
        d="M14.6 6.5c.54-.66.9-1.58.8-2.5-.78.03-1.72.52-2.28 1.18-.5.58-.93 1.5-.82 2.38.87.07 1.76-.45 2.3-1.06z"
        fill="#111827"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { padding: 14, gap: 14 },
  hero: { height: 150, borderRadius: 18, overflow: 'hidden' },
  heroImage: { borderRadius: 18 },
  heroOverlay: { flex: 1, justifyContent: 'flex-end', padding: 14 },
  heroLogoWrap: { position: 'absolute', top: 10, right: 10, opacity: 0.95 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  college: { color: '#E2E8F0', fontSize: 11, letterSpacing: 0.3, fontWeight: '700' },
  formCard: { padding: 14, gap: 8 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  editScroll: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#E0E7FF', borderRadius: 8 },
  editButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  detailsGrid: { gap: 12, marginBottom: 8 },
  detailRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  label: { color: '#475569', fontSize: 12, fontWeight: '700', marginTop: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontWeight: '600'
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingRight: 45,
    paddingVertical: 10,
    color: COLORS.text,
    fontWeight: '600'
  },
  passwordEyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 8
  },
  actionBtn: {
    marginTop: 10
  },
  providerRow: { flexDirection: 'row', gap: 10 },
  providerTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  providerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  providerButtonNeutral: {
    backgroundColor: '#FFFFFF'
  },
  providerButtonLinked: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C4B5FD'
  },
  providerLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#475569'
  },
  providerLabelLinked: {
    color: COLORS.primary
  },
  providerStatus: {
    fontSize: 11,
    marginTop: 4,
    color: '#94A3B8',
    fontWeight: '600'
  },
  changePasswordButton: {
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14
  },
  changePasswordText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
    paddingVertical: 14
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBackdrop: { flex: 1 },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalBody: { paddingHorizontal: 16, gap: 8 },
  cancelButton: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  cancelButtonText: { color: '#475569', fontWeight: '700', fontSize: 14 },
  // Date & Country Picker styles
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInputText: {
    flex: 1,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 90,
  },
  countryCodeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  // Country Picker Modal
  countryPickerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  countryPickerBackdrop: { flex: 1 },
  countryPickerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  countryPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  countryPickerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  countryPickerList: { paddingHorizontal: 16, paddingVertical: 12 },
  countryItem: { paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  countryItemSelected: { backgroundColor: '#EEF2FF', borderRadius: 8, borderBottomWidth: 0, marginVertical: 4 },
  countryItemText: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  countryItemTextSelected: { color: COLORS.primary, fontWeight: '700' },
  // Date Picker Modal
  datePickerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  datePickerBackdrop: { flex: 1 },
  datePickerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  datePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  datePickerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  datePickerBody: { paddingHorizontal: 8, paddingVertical: 10, alignItems: 'center' },
  datePickerFallbackWrap: { width: '100%', paddingHorizontal: 12, gap: 8 },
  datePickerFallbackText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  datePickerFallbackInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontWeight: '600'
  },
  datePickerLabel: { color: '#475569', fontSize: 12, fontWeight: '700' },
  datePickerInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, color: COLORS.text, fontWeight: '600', fontSize: 14 },
  datePickerHint: { color: '#94A3B8', fontSize: 11, fontWeight: '500', marginTop: 4 },
  datePickerButton: { backgroundColor: COLORS.primary, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, paddingVertical: 12, alignItems: 'center' },
  datePickerButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
