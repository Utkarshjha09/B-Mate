import React from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedProps } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function LightningLoader({ size = 80, color = '#9333EA' }: { size?: number; color?: string }) {
  const strokeDashoffset = useSharedValue(80);

  React.useEffect(() => {
    strokeDashoffset.value = withRepeat(
      withTiming(0, { duration: 1500 }),
      -1,
      true
    );
  }, [strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M13 10V3L4 14h7v7l9-11h-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="80"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
