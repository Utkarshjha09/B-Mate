import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText, Rect, Ellipse, Line, Polygon } from 'react-native-svg';

interface ItemIconProps {
  itemId: number;
  size?: number;
}

export function ItemIcon({ itemId, size = 44 }: ItemIconProps) {
  const color = '#7C3AED'; // Primary purple

  const iconMap: { [key: number]: React.ComponentType<any> } = {
    1: ChickenIcon,
    2: EggIcon,
    3: YogurtIcon,
    4: RiceIcon,
    5: OatsIcon,
    6: PotatoIcon,
    7: BroccoliIcon,
    8: SpinachIcon,
    9: BananaIcon,
    10: AlmondsIcon,
    11: AppleIcon,
    12: OrangeIcon,
    13: BlueberryIcon,
    14: GrapeIcon,
    15: WatermelonIcon,
    16: MangoIcon,
    17: KiwiIcon,
    18: TomatoIcon,
    19: CarrotIcon,
    20: PepperIcon,
    21: CucumberIcon,
    22: MushroomIcon,
    23: FishIcon,
    24: TofuIcon,
    25: LentilsIcon,
    26: CheeseIcon,
    27: MilkIcon,
    28: BreadIcon,
    29: QuinoaIcon,
    30: PumpkinIcon,
  };

  const IconComponent = iconMap[itemId];
  if (!IconComponent) return null;

  return <IconComponent size={size} color={color} />;
}

// Individual SVG Icons

function ChickenIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Chicken leg */}
      <Path
        d="M40 35 L35 60 Q35 70 45 75 L50 45 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M60 35 L65 60 Q65 70 55 75 L50 45 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Body */}
      <Ellipse cx="50" cy="35" rx="12" ry="15" fill={color} />
    </Svg>
  );
}

function EggIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Egg shape */}
      <Path
        d="M50 20 Q65 30 65 50 Q65 70 50 80 Q35 70 35 50 Q35 30 50 20 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Highlight */}
      <Ellipse cx="45" cy="40" rx="6" ry="8" fill="white" opacity="0.4" />
    </Svg>
  );
}

function YogurtIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Cup */}
      <Path d="M35 35 L32 65 Q32 72 38 75 L62 75 Q68 72 68 65 L65 35 Z" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Yogurt content */}
      <Ellipse cx="50" cy="55" rx="14" ry="10" fill="white" opacity="0.3" />
    </Svg>
  );
}

function RiceIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Bowl */}
      <Path d="M30 50 Q30 65 50 70 Q70 65 70 50" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Rice grains */}
      {[...Array(8)].map((_, i) => (
        <Rect key={i} x={35 + i * 3.5} y={50 + (i % 2) * 3} width="2" height="8" fill="white" opacity="0.6" />
      ))}
    </Svg>
  );
}

function OatsIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Bowl with oats */}
      <Ellipse cx="50" cy="55" rx="18" ry="12" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      {[...Array(6)].map((_, i) => (
        <Circle key={i} cx={35 + (i % 3) * 10} cy={48 + Math.floor(i / 3) * 8} r="2.5" fill={color} />
      ))}
    </Svg>
  );
}

function PotatoIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Potato shape */}
      <Path
        d="M35 40 Q30 50 35 65 Q50 75 65 65 Q70 50 65 40 Q50 32 35 40 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Eyes/bumps */}
      {[...Array(4)].map((_, i) => (
        <Circle key={i} cx={38 + i * 8} cy={50 + (i % 2) * 6} r="1.5" fill="white" opacity="0.5" />
      ))}
    </Svg>
  );
}

function BroccoliIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Stalk */}
      <Rect x="45" y="55" width="10" height="20" fill={color} opacity="0.6" />
      {/* Florets */}
      {[...Array(5)].map((_, i) => (
        <Circle
          key={i}
          cx={45 + (i % 2) * 12}
          cy={45 - i * 6}
          r={6 - i}
          fill={color}
        />
      ))}
    </Svg>
  );
}

function SpinachIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Top left leaf */}
      <Path d="M35 35 Q30 40 35 50 Q40 45 40 35 Z" fill={color} stroke={color} strokeWidth="1" />
      {/* Top right leaf */}
      <Path d="M65 35 Q70 40 65 50 Q60 45 60 35 Z" fill={color} stroke={color} strokeWidth="1" />
      {/* Bottom left leaf */}
      <Path d="M35 65 Q30 60 35 50 Q40 55 40 65 Z" fill={color} stroke={color} strokeWidth="1" />
      {/* Bottom right leaf */}
      <Path d="M65 65 Q70 60 65 50 Q60 55 60 65 Z" fill={color} stroke={color} strokeWidth="1" />
      {/* Center stem */}
      <Rect x="48" y="40" width="4" height="20" fill={color} opacity="0.7" />
    </Svg>
  );
}

function BananaIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Banana */}
      <Path
        d="M35 60 Q50 30 70 35 Q75 40 70 50 Q50 60 35 70 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Segments */}
      <Line x1="45" y1="55" x2="60" y2="40" stroke="white" strokeWidth="1" opacity="0.5" />
      <Line x1="50" y1="62" x2="63" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
    </Svg>
  );
}

function AlmondsIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Almonds */}
      {[...Array(4)].map((_, i) => (
        <Path
          key={i}
          d={`M${45 + i * 7} 40 Q${48 + i * 7} 35 ${50 + i * 7} 40 Q${48 + i * 7} 60 ${45 + i * 7} 60 Q${42 + i * 7} 55 ${42 + i * 7} 50 Z`}
          fill={color}
          opacity="0.7 + i * 0.1"
          stroke={color}
          strokeWidth="1"
        />
      ))}
    </Svg>
  );
}

function AppleIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Apple body */}
      <Circle cx="45" cy="55" r="15" fill={color} />
      <Circle cx="55" cy="55" r="15" fill={color} />
      <Ellipse cx="50" cy="50" rx="14" ry="16" fill={color} />
      {/* Stem */}
      <Rect x="48" y="30" width="4" height="12" fill={color} opacity="0.7" />
      {/* Leaf */}
      <Path d="M54 38 Q58 35 60 40 Q58 42 54 41 Z" fill={color} opacity="0.7" />
    </Svg>
  );
}

function OrangeIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Orange */}
      <Circle cx="50" cy="55" r="16" fill={color} />
      {/* Segments */}
      {[...Array(6)].map((_, i) => (
        <Line
          key={i}
          x1="50"
          y1="55"
          x2={50 + Math.cos((i * Math.PI) / 3) * 16}
          y2={55 + Math.sin((i * Math.PI) / 3) * 16}
          stroke="white"
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
      {/* Leaf */}
      <Path d="M60 40 Q68 35 70 45 Q65 48 60 45 Z" fill={color} opacity="0.7" />
    </Svg>
  );
}

function BlueberryIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Berries */}
      {[...Array(6)].map((_, i) => (
        <Circle
          key={i}
          cx={35 + (i % 3) * 12}
          cy={45 + Math.floor(i / 3) * 12}
          r="5"
          fill={color}
          opacity="0.8 - i * 0.1"
        />
      ))}
      {/* Top crown bumps */}
      <Circle cx="50" cy="44" r="1.5" fill={color} opacity="0.5" />
    </Svg>
  );
}

function GrapeIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Grape bunch */}
      {[...Array(7)].map((_, i) => (
        <Circle
          key={i}
          cx={40 + (i % 3) * 8}
          cy={40 + Math.floor(i / 3) * 8}
          r="4.5"
          fill={color}
          opacity="0.9 - i * 0.1"
        />
      ))}
      {/* Stem */}
      <Rect x="48" y="55" width="2" height="15" fill={color} opacity="0.6" />
    </Svg>
  );
}

function WatermelonIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Melon body */}
      <Circle cx="50" cy="52" r="14" fill={color} />
      {/* Segments */}
      <Path d="M50 38 Q58 42 58 52 Q58 62 50 66 Q42 62 42 52 Q42 42 50 38 Z" fill="white" opacity="0.3" />
      {/* Seeds */}
      {[...Array(4)].map((_, i) => (
        <Circle key={i} cx={45 + i * 5} cy={50 + (i % 2) * 4} r="1.5" fill={color} opacity="0.6" />
      ))}
    </Svg>
  );
}

function MangoIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Mango shape */}
      <Path
        d="M50 30 Q65 40 65 55 Q65 70 50 75 Q35 70 35 55 Q35 40 50 30 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Highlight */}
      <Ellipse cx="45" cy="45" rx="7" ry="10" fill="white" opacity="0.3" />
    </Svg>
  );
}

function KiwiIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Kiwi circle */}
      <Circle cx="50" cy="52" r="15" fill={color} />
      {/* Cross section lines */}
      <Line x1="35" y1="52" x2="65" y2="52" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <Line x1="50" y1="37" x2="50" y2="67" stroke="white" strokeWidth="1.5" opacity="0.6" />
      {/* Seeds */}
      {[...Array(8)].map((_, i) => (
        <Circle
          key={i}
          cx={50 + Math.cos((i * Math.PI) / 4) * 6}
          cy={52 + Math.sin((i * Math.PI) / 4) * 6}
          r="1"
          fill="white"
          opacity="0.5"
        />
      ))}
    </Svg>
  );
}

function TomatoIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Tomato */}
      <Circle cx="45" cy="55" r="13" fill={color} />
      <Circle cx="55" cy="55" r="13" fill={color} />
      <Circle cx="50" cy="48" r="11" fill={color} />
      {/* Stem */}
      <Rect x="48" y="35" width="4" height="8" fill="#16A34A" opacity="0.7" />
      {/* Leaf */}
      <Path d="M54 38 Q60 36 62 42 Q58 42 54 40 Z" fill="#16A34A" />
    </Svg>
  );
}

function CarrotIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Carrot body */}
      <Path
        d="M40 35 L60 35 L55 70 L45 70 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Top greens */}
      {[...Array(3)].map((_, i) => (
        <Path
          key={i}
          d={`M${45 + i * 7} 35 Q${48 + i * 7} 20 ${50 + i * 7} 25`}
          stroke="#16A34A"
          strokeWidth="2"
          fill="none"
        />
      ))}
    </Svg>
  );
}

function PepperIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Pepper shape */}
      <Path
        d="M40 40 Q35 50 40 65 Q50 75 60 65 Q65 50 60 40 Q50 35 40 40 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Stem */}
      <Rect x="48" y="32" width="4" height="8" fill="#16A34A" opacity="0.7" />
      {/* Shine */}
      <Ellipse cx="45" cy="50" rx="6" ry="10" fill="white" opacity="0.2" />
    </Svg>
  );
}

function CucumberIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Cucumber body */}
      <Path
        d="M35 45 Q40 40 50 38 Q60 40 65 45 L62 60 Q50 68 38 60 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Bumps */}
      {[...Array(6)].map((_, i) => (
        <Circle key={i} cx={38 + i * 5} cy={50} r="1.2" fill="white" opacity="0.4" />
      ))}
    </Svg>
  );
}

function MushroomIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Cap */}
      <Ellipse cx="50" cy="42" rx="16" ry="14" fill={color} />
      {/* Stem */}
      <Rect x="46" y="55" width="8" height="18" fill={color} opacity="0.6" />
      {/* Gills */}
      {[...Array(5)].map((_, i) => (
        <Line
          key={i}
          x1={40 + i * 5}
          y1="55"
          x2={38 + i * 5}
          y2="62"
          stroke="white"
          strokeWidth="0.8"
          opacity="0.4"
        />
      ))}
    </Svg>
  );
}

function FishIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Body */}
      <Ellipse cx="50" cy="50" rx="16" ry="12" fill={color} />
      {/* Head */}
      <Circle cx="35" cy="50" r="10" fill={color} />
      {/* Tail */}
      <Polygon points="70,45 85,35 85,65" fill={color} />
      {/* Eye */}
      <Circle cx="32" cy="48" r="2" fill="white" opacity="0.6" />
      {/* Fin */}
      <Path d="M50 38 Q55 30 58 38" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
    </Svg>
  );
}

function TofuIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Tofu cube */}
      <Rect x="35" y="40" width="30" height="30" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Texture holes */}
      {[...Array(9)].map((_, i) => (
        <Circle
          key={i}
          cx={40 + (i % 3) * 10}
          cy={45 + Math.floor(i / 3) * 10}
          r="1.5"
          fill="white"
          opacity="0.3"
        />
      ))}
    </Svg>
  );
}

function LentilsIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Bowl */}
      <Path d="M30 50 Q30 65 50 72 Q70 65 70 50" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      {/* Lentils */}
      {[...Array(12)].map((_, i) => (
        <Circle
          key={i}
          cx={32 + (i % 4) * 9}
          cy={50 + Math.floor(i / 4) * 7}
          r="2.5"
          fill={color}
          opacity="0.8"
        />
      ))}
    </Svg>
  );
}

function CheeseIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Cheese block */}
      <Path
        d="M35 40 L65 40 L62 65 Q50 72 38 65 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Holes */}
      {[...Array(6)].map((_, i) => (
        <Circle
          key={i}
          cx={40 + (i % 3) * 10}
          cy={48 + Math.floor(i / 3) * 10}
          r="2"
          fill="white"
          opacity="0.4"
        />
      ))}
    </Svg>
  );
}

function MilkIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Glass */}
      <Path d="M38 35 L36 70 Q36 75 42 75 L58 75 Q64 75 64 70 L62 35 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      {/* Milk */}
      <Path d="M39 50 L61 50 L58 70 Q50 74 42 70 Z" fill={color} opacity="0.5" />
      {/* Shine */}
      <Rect x="44" y="40" width="3" height="25" fill="white" opacity="0.3" />
    </Svg>
  );
}

function BreadIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Bread slice */}
      <Rect x="35" y="35" width="30" height="40" rx="3" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Grid texture */}
      {[...Array(3)].map((_, i) => (
        <Line key={`h${i}`} x1="38" y1={45 + i * 8} x2="62" y2={45 + i * 8} stroke="white" strokeWidth="0.8" opacity="0.4" />
      ))}
      {[...Array(3)].map((_, i) => (
        <Line key={`v${i}`} x1={42 + i * 8} y1="38" x2={42 + i * 8} y2="72" stroke="white" strokeWidth="0.8" opacity="0.4" />
      ))}
    </Svg>
  );
}

function QuinoaIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Bowl */}
      <Path d="M30 52 Q30 68 50 74 Q70 68 70 52" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      {/* Seeds */}
      {[...Array(15)].map((_, i) => (
        <Circle
          key={i}
          cx={32 + (i % 5) * 7.5}
          cy={52 + Math.floor(i / 5) * 6}
          r="1.8"
          fill={color}
          opacity="0.8"
        />
      ))}
    </Svg>
  );
}

function PumpkinIcon({ size, color }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={color} opacity="0.1" />
      {/* Pumpkin body */}
      <Circle cx="50" cy="52" r="16" fill={color} />
      {/* Segments */}
      {[...Array(6)].map((_, i) => (
        <Path
          key={i}
          d={`M50 52 L${50 + Math.cos((i * Math.PI) / 3) * 16} ${52 + Math.sin((i * Math.PI) / 3) * 16}`}
          stroke="white"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}
      {/* Stem */}
      <Rect x="48" y="32" width="4" height="12" fill="#16A34A" opacity="0.7" />
      {/* Leaf */}
      <Path d="M54 38 Q62 32 65 42 Q60 45 54 40 Z" fill="#16A34A" opacity="0.6" />
    </Svg>
  );
}
