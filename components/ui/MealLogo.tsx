import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Rect, Line } from 'react-native-svg';

interface MealLogoProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  size?: number;
  selected?: boolean;
}

export function MealLogo({ mealType, size = 40, selected = false }: MealLogoProps) {
  const color = selected ? '#FFFFFF' : '#9CA3AF';

  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {mealType === 'breakfast' && (
          <G>
            {/* Cup */}
            <Path d="M 16 20 L 15 50 Q 15 55 20 55 L 44 55 Q 49 55 49 50 L 48 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Handle */}
            <Path d="M 49 28 Q 56 28 56 35 Q 56 42 49 42" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Steam */}
            <Path d="M 24 12 Q 26 18 24 24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
            <Path d="M 32 8 Q 34 14 32 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
            <Path d="M 40 12 Q 42 18 40 24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </G>
        )}
        {mealType === 'lunch' && (
          <G>
            {/* Fork */}
            <Path d="M 20 16 L 20 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M 16 20 L 16 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M 20 20 L 20 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M 24 20 L 24 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Knife */}
            <Path d="M 40 16 L 48 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M 42 16 L 50 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="48" cy="48" r="2" fill={color} />
          </G>
        )}
        {mealType === 'dinner' && (
          <G>
            {/* Plate */}
            <Circle cx="32" cy="36" r="18" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="32" cy="36" r="14" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Food on plate */}
            <Circle cx="25" cy="32" r="4" fill={color} opacity="0.7" />
            <Circle cx="35" cy="30" r="4" fill={color} opacity="0.7" />
            <Circle cx="32" cy="42" r="4" fill={color} opacity="0.7" />
            <Path d="M 26 40 Q 32 45 38 40" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
          </G>
        )}
        {mealType === 'snack' && (
          <G>
            {/* Apple */}
            <Circle cx="28" cy="28" r="12" fill={color} opacity="0.7" />
            <Path d="M 28 16 Q 30 10 28 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M 28 16 L 32 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            {/* Banana */}
            <Path d="M 42 28 Q 48 25 50 32 Q 48 38 42 38" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
            <Circle cx="43" cy="28" r="1.5" fill={color} />
            <Circle cx="49" cy="32" r="1.5" fill={color} />
          </G>
        )}
      </Svg>
    </View>
  );
}
