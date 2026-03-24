import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../lib/constants';

interface CustomBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type TabItem = {
  id: string;
  icon: 'home' | 'food' | 'laundry' | 'water' | 'cart' | 'profile';
  label: string;
};

const tabs: TabItem[] = [
  { id: 'index', icon: 'home', label: 'Home' },
  { id: 'food', icon: 'food', label: 'Food' },
  { id: 'laundry', icon: 'laundry', label: 'Laundry' },
  { id: 'water', icon: 'water', label: 'Water' },
  { id: 'cart', icon: 'cart', label: 'Cart' },
  { id: 'profile', icon: 'profile', label: 'Profile' },
];

export function CustomBottomNav({ activeTab, onTabChange }: CustomBottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {tabs.map((tab) => (
          <BottomTabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

function BottomTabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const iconColor = isActive ? COLORS.primary : '#667085';

  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <TabIcon icon={tab.icon} color={iconColor} />
      </View>
      {isActive && <View style={styles.underline} />}
      <Text style={[styles.label, { color: isActive ? COLORS.primary : '#667085' }]}>{tab.label}</Text>
    </Pressable>
  );
}

function TabIcon({ icon, color }: { icon: TabItem['icon']; color: string }) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  if (icon === 'home') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path {...strokeProps} d="M4 10.5L12 4l8 6.5" />
        <Path {...strokeProps} d="M6.5 9.8V19h11V9.8" />
        <Path {...strokeProps} d="M10 19v-4h4v4" />
      </Svg>
    );
  }

  if (icon === 'food') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path {...strokeProps} d="M7 4v8M10 4v8M7 8h3M8.5 12v8" />
        <Path {...strokeProps} d="M15 4c2 2.2 2 5.8 0 8v8" />
      </Svg>
    );
  }

  if (icon === 'laundry') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path {...strokeProps} d="M8 6l2-2h4l2 2h3v4l-2 2v8H7v-8L5 10V6z" />
      </Svg>
    );
  }

  if (icon === 'water') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path {...strokeProps} d="M12 4c3 4 5 6.3 5 9a5 5 0 11-10 0c0-2.7 2-5 5-9z" />
      </Svg>
    );
  }

  if (icon === 'cart') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path {...strokeProps} d="M4 5h2l2 10h9l2-7H7" />
        <Circle cx="10" cy="18.5" r="1.5" {...strokeProps} />
        <Circle cx="17" cy="18.5" r="1.5" {...strokeProps} />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="3" {...strokeProps} />
      <Path {...strokeProps} d="M5.5 19c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 10,
    paddingTop: 8,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    marginBottom: 3,
  },
  underline: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
