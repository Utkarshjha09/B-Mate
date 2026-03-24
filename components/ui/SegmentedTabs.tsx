import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../lib/constants';

type Tab = {
  key: string;
  label: string;
};

type SegmentedTabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export function SegmentedTabs({ tabs, active, onChange }: SegmentedTabsProps) {
  return (
    <View style={styles.shell}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={[styles.tabButton, isActive && styles.activeTab]}>
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10
  },
  activeTab: {
    backgroundColor: '#F3EDFF'
  },
  tabLabel: {
    fontSize: 13,
    color: COLORS.tabInactive,
    fontWeight: '600'
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '700'
  }
});
