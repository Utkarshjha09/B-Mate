import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../lib/constants';
import { PrimaryButton } from './PrimaryButton';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton label="Retry" onPress={onRetry} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800'
  },
  message: {
    color: COLORS.muted,
    textAlign: 'center',
    fontWeight: '500'
  },
  button: {
    width: 180,
    marginTop: 8
  }
});
