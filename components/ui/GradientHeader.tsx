import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GRADIENTS } from '../../lib/constants';

type GradientHeaderProps = {
  title: string;
  subtitle: string;
};

export function GradientHeader({ title, subtitle }: GradientHeaderProps) {
  return (
    <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.glow} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800'
  },
  subtitle: {
    color: '#E9D5FF',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500'
  },
  glow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)'
  }
});
