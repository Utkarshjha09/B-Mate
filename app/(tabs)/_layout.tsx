import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { CustomBottomNav } from '../../components/ui/CustomBottomNav';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../hooks/useAuth';

export default function TabLayout() {
  const { session, isBypassEnabled, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return <LoadingState label="Checking session..." />;
  }

  if (!session?.user && !isBypassEnabled) {
    return <Redirect href="/auth" />;
  }

  const activeTab = pathname?.startsWith('/food')
    ? 'food'
    : pathname?.startsWith('/laundry')
      ? 'laundry'
      : pathname?.startsWith('/water')
        ? 'water'
        : pathname?.startsWith('/cart')
          ? 'cart'
          : pathname?.startsWith('/profile')
            ? 'profile'
            : 'index';

  const handleTabChange = (tab: string) => {
    if (tab === 'food') {
      router.push('/food');
      return;
    }
    if (tab === 'laundry') {
      router.push('/laundry');
      return;
    }
    if (tab === 'water') {
      router.push('/water');
      return;
    }
    if (tab === 'cart') {
      router.push('/cart');
      return;
    }
    if (tab === 'profile') {
      router.push('/profile');
      return;
    }
    router.push('/');
  };

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <CustomBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
