import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { COLORS } from '../../lib/constants';

export function AppCard(props: ViewProps) {
  const { style, ...rest } = props;
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  }
});
