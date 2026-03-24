import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type AppLogoProps = {
  size?: number;
};

export function AppLogo({ size = 84 }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image source={require('../../assets/app-icon.png')} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  }
});

