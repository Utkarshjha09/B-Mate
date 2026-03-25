import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/ui/AppCard';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import {
  CareerIcon,
  CommunityChatIcon,
  EventsIcon,
  HelpDeskIcon,
  MessMenuIcon,
  NutritionIcon
} from '../components/ui/SvgIcons';
import { COLORS } from '../lib/constants';

const groups = [
  {
    id: 'freshers',
    name: 'Freshers Help Desk',
    description: 'Hostel setup, timetable, and first-week guidance.',
    icon: 'help'
  },
  {
    id: 'food-lovers',
    name: 'Food & Mess Reviews',
    description: 'Daily menu ratings, deals, and recommendations.',
    icon: 'food'
  },
  {
    id: 'study-circle',
    name: 'Study Circle',
    description: 'Peer learning, doubt solving, and exam prep.',
    icon: 'study'
  },
  {
    id: 'placements',
    name: 'Placements & Internships',
    description: 'Openings, referrals, resume reviews, and interview prep.',
    icon: 'career'
  },
  {
    id: 'events',
    name: 'Campus Events',
    description: 'Hackathons, fests, coding clubs, and meetup updates.',
    icon: 'events'
  }
];

export default function CommunityChatScreen() {
  const router = useRouter();
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});

  const openGroupChat = (group: { id: string; name: string }) => {
    router.push({
      pathname: '/community-chat/[groupId]',
      params: { groupId: group.id, name: group.name }
    });
  };

  const joinGroup = (group: { name: string; id: string }) => {
    setJoinedGroups((prev) => ({ ...prev, [group.id]: true }));
    openGroupChat(group);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
        </Pressable>
        <View style={styles.titleRow}>
          <CommunityChatIcon size={18} color={COLORS.text} />
          <Text style={styles.title}>Community Chat</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <CommunityChatIcon size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Connect with your campus community</Text>
          <Text style={styles.heroSub}>Join topic groups, ask questions, and share updates with students.</Text>
        </AppCard>

        {groups.map((group) => (
          <AppCard key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeaderRow}>
              <View style={styles.groupIconWrap}>
                {group.icon === 'food' ? <MessMenuIcon size={16} color={COLORS.primary} /> : null}
                {group.icon === 'study' ? <NutritionIcon size={16} color={COLORS.primary} /> : null}
                {group.icon === 'career' ? <CareerIcon size={16} color={COLORS.primary} /> : null}
                {group.icon === 'events' ? <EventsIcon size={16} color={COLORS.primary} /> : null}
                {group.icon === 'help' ? <HelpDeskIcon size={16} color={COLORS.primary} /> : null}
              </View>
              <Text style={styles.groupName}>{group.name}</Text>
            </View>
            <Text style={styles.groupDescription}>{group.description}</Text>
            <PrimaryButton
              label={joinedGroups[group.id] ? 'Open Chat' : 'Join Chat'}
              onPress={() => (joinedGroups[group.id] ? openGroupChat(group) : joinGroup(group))}
              style={styles.joinButton}
            />
          </AppCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heroCard: { backgroundColor: '#3B1B73', padding: 14, gap: 8 },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED'
  },
  heroTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  heroSub: { color: '#DDD6FE', fontSize: 13, fontWeight: '500' },
  groupCard: { padding: 12, gap: 8 },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  groupDescription: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  joinButton: { marginTop: 2 }
});
