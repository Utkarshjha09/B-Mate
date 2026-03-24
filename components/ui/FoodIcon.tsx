import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Rect, Ellipse, Polygon, Line } from 'react-native-svg';

interface FoodIconProps {
  foodType: 'protein' | 'carb' | 'vegetable' | 'fruit' | 'grain' | 'dairy';
  size?: number;
}

export function FoodIcon({ foodType, size = 48 }: FoodIconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {foodType === 'protein' && (
          <G>
            {/* Chicken leg */}
            <Ellipse cx="32" cy="20" rx="10" ry="12" fill="#FF8C42" />
            <Path d="M 28 32 Q 26 45 24 55" stroke="#D4691F" strokeWidth="3" strokeLinecap="round" fill="none" />
            <Path d="M 32 32 Q 30 45 28 55" stroke="#D4691F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M 36 32 Q 38 45 40 55" stroke="#D4691F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </G>
        )}
        {foodType === 'carb' && (
          <G>
            {/* Bread loaf */}
            <Rect x="14" y="24" width="36" height="28" rx="4" fill="#D4A574" />
            <Path d="M 18 30 Q 18 26 22 26 Q 26 26 26 30" fill="#C9956D" />
            <Path d="M 30 30 Q 30 26 34 26 Q 38 26 38 30" fill="#C9956D" />
            <Path d="M 42 30 Q 42 26 46 26 Q 50 26 50 30" fill="#C9956D" />
          </G>
        )}
        {foodType === 'vegetable' && (
          <G>
            {/* Carrot */}
            <Path d="M 32 14 L 40 48" stroke="#FF8C42" strokeWidth="8" strokeLinecap="round" />
            {/* Leaves */}
            <Path d="M 40 14 L 38 8 M 40 14 L 45 10 M 40 14 L 42 8" stroke="#22B14C" strokeWidth="2" strokeLinecap="round" />
          </G>
        )}
        {foodType === 'fruit' && (
          <G>
            {/* Apple */}
            <Circle cx="32" cy="32" r="14" fill="#DC3545" />
            <Path d="M 32 18 L 34 12" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />
            <Path d="M 31 19 Q 36 18 38 22" stroke="#7CCA62" strokeWidth="2" fill="none" strokeLinecap="round" />
            <Circle cx="29" cy="34" r="2" fill="#AA2832" opacity="0.6" />
          </G>
        )}
        {foodType === 'grain' && (
          <G>
            {/* Bowl of rice / grain */}
            <Path d="M 16 38 Q 16 52 24 54 L 40 54 Q 48 52 48 38" fill="#E8D4B8" stroke="#D4C5A9" strokeWidth="2" />
            <Ellipse cx="32" cy="38" rx="16" ry="6" fill="#F5E6D3" stroke="#D4C5A9" strokeWidth="1.5" />
            {/* Grains */}
            <Circle cx="25" cy="42" r="2" fill="#D4A574" />
            <Circle cx="32" cy="40" r="2" fill="#D4A574" />
            <Circle cx="39" cy="42" r="2" fill="#D4A574" />
            <Circle cx="28" cy="48" r="1.5" fill="#C9956D" opacity="0.7" />
            <Circle cx="36" cy="47" r="1.5" fill="#C9956D" opacity="0.7" />
          </G>
        )}
        {foodType === 'dairy' && (
          <G>
            {/* Milk glass */}
            <Path d="M 20 24 L 18 50 Q 18 54 22 54 L 42 54 Q 46 54 46 50 L 44 24" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2" />
            <Path d="M 20 24 L 44 24" stroke="#E0E0E0" strokeWidth="2" />
            {/* Milk inside */}
            <Path d="M 21 35 Q 21 32 44 32 L 44 50 Q 44 52 42 52 L 22 52 Q 20 52 20 50 L 21 35" fill="#FFF8E7" opacity="0.8" />
          </G>
        )}
      </Svg>
    </View>
  );
}
