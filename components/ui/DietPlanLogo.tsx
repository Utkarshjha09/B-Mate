import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, G, Text as SvgText } from 'react-native-svg';

interface DietPlanLogoProps {
  size?: number;
  color?: string;
}

export function DietPlanLogo({ size = 80, color = '#7C3AED' }: DietPlanLogoProps) {
  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Outer circle background */}
        <Circle cx="100" cy="100" r="95" fill={color} opacity="0.1" stroke={color} strokeWidth="2" />

        {/* Main circle */}
        <Circle cx="100" cy="100" r="85" fill={color} />

        {/* Apple (top left) */}
        <G>
          <Circle cx="70" cy="60" r="15" fill="#FF6B6B" />
          <Path d="M 70 45 Q 75 40 75 35" stroke="#8B4513" strokeWidth="2" fill="none" />
        </G>

        {/* Carrot (bottom left) */}
        <G>
          <Path d="M 50 120 L 65 135 L 65 145 L 50 140 Z" fill="#FF8C42" />
          <Path d="M 65 135 L 70 130 M 65 135 L 68 132 M 65 135 L 66 137" stroke="#90EE90" strokeWidth="1.5" />
        </G>

        {/* Egg (top right) */}
        <G>
          <Circle cx="130" cy="55" r="12" fill="#FFE082" />
          <Circle cx="130" cy="55" r="8" fill="#FFF9C4" />
        </G>

        {/* Protein/Muscle (bottom right) */}
        <G>
          <Circle cx="150" cy="125" r="12" fill="#E8B4E8" />
          <Path d="M 142 125 L 158 125 M 150 117 L 150 133" stroke="#FFFFFF" strokeWidth="2" />
        </G>

        {/* Center plate/bowl */}
        <G>
          <Rect x="85" y="85" width="30" height="25" rx="3" fill="#FFFFFF" opacity="0.3" stroke="#FFFFFF" strokeWidth="2" />
          <Path d="M 90 95 Q 100 100 110 95" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <Circle cx="100" cy="97" r="2" fill="#FFFFFF" />
          <Circle cx="95" cy="100" r="2" fill="#FFFFFF" />
          <Circle cx="105" cy="100" r="2" fill="#FFFFFF" />
        </G>

        {/* Icons around center */}
        {/* Water droplet */}
        <Path
          d="M 100 140 Q 98 145 100 150 Q 102 145 100 140 Z"
          fill="#87CEEB"
          opacity="0.7"
        />
      </Svg>
    </View>
  );
}
