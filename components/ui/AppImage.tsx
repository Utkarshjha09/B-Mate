import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

type AppImageProps = {
  uri?: string;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
};

export function AppImage({ uri, style, resizeMode = 'cover' }: AppImageProps) {
  const [hasError, setHasError] = useState(false);
  const shouldShowFallback = useMemo(() => !uri || hasError, [uri, hasError]);

  if (shouldShowFallback) {
    return (
      <View style={[style as any, styles.fallback]}>
        <MaterialCommunityIcons name="image-off-outline" size={22} color="#94A3B8" />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} resizeMode={resizeMode} onError={() => setHasError(true)} />;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB'
  }
});
