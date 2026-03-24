import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../lib/constants';
import { LightningLoader } from './LightningLoader';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <LightningLoader size={80} color={COLORS.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  label: {
    marginTop: 16,
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '500'
  }
});
