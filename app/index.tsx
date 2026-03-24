import { Redirect } from 'expo-router';
import React from 'react';

import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../hooks/useAuth';

export default function EntryPoint() {
  const { session, loading, isBypassEnabled } = useAuth();

  if (loading) {
    return <LoadingState label="Restoring your session..." />;
  }

  if (session?.user || isBypassEnabled) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}
