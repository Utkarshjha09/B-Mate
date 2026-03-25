import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../hooks/useAuth';

// Hermes on some Android builds may not expose WeakRef yet; provide a minimal fallback
// so navigation can initialize instead of crashing on startup.
if (typeof (globalThis as any).WeakRef === 'undefined') {
  class WeakRefFallback<T extends object> {
    private value: T;
    constructor(value: T) {
      this.value = value;
    }
    deref() {
      return this.value;
    }
  }

  (globalThis as any).WeakRef = WeakRefFallback;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="community-chat" />
            <Stack.Screen name="community-chat/[groupId]" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
