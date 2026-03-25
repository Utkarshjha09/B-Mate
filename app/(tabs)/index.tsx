import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppCard } from '../../components/ui/AppCard';
import { AppLogo } from '../../components/ui/AppLogo';
import { CommunityChatIcon } from '../../components/ui/SvgIcons';
import { COLORS, GRADIENTS } from '../../lib/constants';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <AppLogo size={40} />
              <View>
                <Text style={styles.brandName}>B Mate</Text>
                <Text style={styles.brandTag}>Student Services</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/community-chat')} style={styles.chatIconButton}>
              <CommunityChatIcon size={18} color="#6D28D9" />
            </Pressable>
          </View>
          <Text style={styles.greeting}>Good Morning, Mate!</Text>
          <Text style={styles.subtle}>Welcome to B mate. What do you need?</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(tabs)/food')} activeOpacity={0.9}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.highlightCard}>
            <View style={styles.highlightIconWrap}>
              <FoodIcon color="#FFFFFF" size={22} />
            </View>
            <Text style={styles.highlightTitle}>Hungry?</Text>
            <Text style={styles.highlightSubtitle}>Order meals or manage your diet plan.</Text>
            <Text style={styles.highlightLink}>Browse Menu  {'\u2192'}</Text>
            <View style={styles.watermarkWrap}>
              <FoodIcon color="rgba(255,255,255,0.13)" size={94} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.twoCol}>
          <TouchableOpacity style={styles.flexOne} activeOpacity={0.9} onPress={() => router.push('/(tabs)/laundry')}>
            <LinearGradient colors={['#32435D', '#1C2434']} style={styles.moduleCard}>
              <View style={styles.moduleIconBubble}>
                <LaundryIcon color="#E7EEF8" size={18} />
              </View>
              <Text style={styles.moduleTitle}>Laundry</Text>
              <Text style={styles.moduleSubtitle}>Pickup & Delivery</Text>
              <View style={styles.moduleMarkWrap}>
                <LaundryIcon color="rgba(255,255,255,0.09)" size={76} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flexOne} activeOpacity={0.9} onPress={() => router.push('/(tabs)/water')}>
            <LinearGradient colors={['#2F63F5', '#214ABA']} style={styles.moduleCard}>
              <View style={styles.moduleIconBubble}>
                <WaterIcon color="#E7EEFF" size={18} />
              </View>
              <Text style={styles.moduleTitle}>Water</Text>
              <Text style={styles.moduleSubtitle}>Refills & Cans</Text>
              <View style={styles.moduleMarkWrap}>
                <WaterIcon color="rgba(255,255,255,0.11)" size={74} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <AppCard style={styles.recentCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Animated.View entering={FadeInDown.duration(350)} style={styles.recentRow}>
            <View style={[styles.recentIcon, { backgroundColor: '#F3EDFF' }]}>
              <LaundryIcon color={COLORS.primary} size={16} />
            </View>
            <View style={styles.recentTextWrap}>
              <Text style={styles.recentText}>Laundry Pickup</Text>
              <Text style={styles.recentSubText}>Yesterday</Text>
            </View>
            <Text style={styles.recentStatus}>Done</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.recentRow}>
            <View style={[styles.recentIcon, { backgroundColor: '#EEF2FF' }]}>
              <FoodIcon color="#475569" size={16} />
            </View>
            <View style={styles.recentTextWrap}>
              <Text style={styles.recentText}>Today's Basic Meal</Text>
              <Text style={styles.recentSubText}>2 days ago</Text>
            </View>
            <Text style={styles.recentPrice}>Rs 60</Text>
          </Animated.View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ECEFF5' },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  header: { marginTop: 8, marginBottom: 14 },
  headerTop: { marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: '#312E81', fontSize: 16, fontWeight: '800' },
  brandTag: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  chatIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C4B5FD'
  },
  greeting: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: COLORS.text },
  subtle: { marginTop: 6, fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  highlightCard: { borderRadius: 22, padding: 20, minHeight: 248, overflow: 'hidden' },
  highlightIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)'
  },
  highlightTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 20, marginTop: 16, letterSpacing: -0.4 },
  highlightSubtitle: { color: '#F4E9FF', fontWeight: '500', marginTop: 6, fontSize: 15, maxWidth: '80%' },
  highlightLink: { color: '#FFFFFF', marginTop: 18, fontWeight: '800', fontSize: 14 },
  watermarkWrap: { position: 'absolute', right: 18, bottom: -2 },
  twoCol: { flexDirection: 'row', gap: 12, marginTop: 16 },
  flexOne: { flex: 1 },
  moduleCard: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 146,
    overflow: 'hidden'
  },
  moduleIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moduleTitle: { marginTop: 12, fontSize: 16, color: '#FFFFFF', fontWeight: '800' },
  moduleSubtitle: { marginTop: 4, fontSize: 13, color: '#DCE4F2', fontWeight: '500' },
  moduleMarkWrap: { position: 'absolute', right: 4, bottom: -2 },
  recentCard: { marginTop: 16, padding: 14, gap: 12 },
  sectionTitle: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  recentRow: { flexDirection: 'row', alignItems: 'center' },
  recentIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  recentTextWrap: { flex: 1, marginLeft: 10 },
  recentText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  recentSubText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  recentStatus: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
  recentPrice: { color: '#475569', fontSize: 12, fontWeight: '700' }
});

function FoodIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4v8M10 4v8M7 8h3M8.5 12v8M15 4c2 2.2 2 5.8 0 8v8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function LaundryIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 6l2-2h4l2 2h3v4l-2 2v8H7v-8L5 10V6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function WaterIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4c3 4 5 6.3 5 9a5 5 0 11-10 0c0-2.7 2-5 5-9z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
