import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { GRADIENTS } from '../../lib/constants';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, style, disabled }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.shell, style, disabled && styles.disabled]}>
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  disabled: {
    opacity: 0.45
  }
});
