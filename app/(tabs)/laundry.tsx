import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppCard } from '../../components/ui/AppCard';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { LoadingState } from '../../components/ui/LoadingState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { ChevronDownIcon, ChevronUpIcon, WashingMachineIcon, HangerIcon, PlusIcon, CommunityChatIcon } from '../../components/ui/SvgIcons';
import { COLORS } from '../../lib/constants';
import { appService, fallbackData } from '../../services/appService';
import { LaundryItem, TimeSlot } from '../../types/app';

type LaundryTab = 'new' | 'active' | 'plans';

interface LaundryCartItem extends LaundryItem {
  quantity: number;
}

interface ActiveBooking {
  id: string;
  items: LaundryCartItem[];
  selectedSlot: TimeSlot;
  totalPrice: number;
  status: 'picked_up' | 'in_progress' | 'delivering' | 'completed';
  createdAt: Date;
}

export default function LaundryScreen() {
  const router = useRouter();
  const [active, setActive] = useState<LaundryTab>('new');
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [cartItems, setCartItems] = useState<LaundryCartItem[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [expandedSections, setExpandedSections] = useState({ wash_ironing: true, dry_cleaning: false });
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, slotsRes] = await withTimeout(
        Promise.all([appService.getLaundryItems(), appService.getTimeSlots()]),
        3500,
        'Laundry data request timed out'
      );

      if (itemsRes.error) {
        throw new Error(itemsRes.error.message || 'Failed to load items');
      }
      if (slotsRes.error) {
        throw new Error(slotsRes.error.message || 'Failed to load slots');
      }

      setLaundryItems((itemsRes.data as LaundryItem[]) ?? fallbackData.laundryItems);
      setTimeSlots((slotsRes.data as TimeSlot[]) ?? fallbackData.timeSlots);
      setOfflineMode(false);
    } catch {
      setLaundryItems(fallbackData.laundryItems);
      setTimeSlots(fallbackData.timeSlots);
      setOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      await loadData();
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const tabs = useMemo(
    () => [
      { key: 'new', label: 'New Order' },
      { key: 'active', label: 'Active' },
      { key: 'plans', label: 'Plans' }
    ],
    []
  );

  const addToCart = (item: LaundryItem) => {
    const existing = cartItems.find((ci) => ci.id === item.id);
    if (existing) {
      setCartItems(cartItems.map((ci) => (ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci)));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((ci) => ci.id !== itemId));
    } else {
      setCartItems(cartItems.map((ci) => (ci.id === itemId ? { ...ci, quantity } : ci)));
    }
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(cartItems.filter((ci) => ci.id !== itemId));
  };

  const toggleSection = (section: 'wash_ironing' | 'dry_cleaning') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleBooking = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart');
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert('Select Time Slot', 'Please select a time slot');
      return;
    }

    const newBooking: ActiveBooking = {
      id: `booking_${Date.now()}`,
      items: cartItems,
      selectedSlot,
      totalPrice,
      status: 'picked_up',
      createdAt: new Date()
    };

    setActiveBookings((prev) => [newBooking, ...prev]);
    Alert.alert('Success', `Booking confirmed for ${selectedSlot.date} ${selectedSlot.start_time}`);
    setCartItems([]);
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  const updateBookingStatus = (bookingId: string, newStatus: ActiveBooking['status']) => {
    setActiveBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  const cancelBooking = (bookingId: string) => {
    setActiveBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
  };

  const washIroningItems = laundryItems.filter((item) => item.type === 'wash_ironing');
  const dryCleaningItems = laundryItems.filter((item) => item.type === 'dry_cleaning');

  if (loading) {
    return <LoadingState label="Loading laundry services..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GradientHeader title="Laundry Service" subtitle="We pick up, wash, and deliver." />
      <Pressable style={styles.chatIconButton} onPress={() => router.push('/community-chat')}>
        <CommunityChatIcon size={18} color="#6D28D9" />
      </Pressable>
      <View style={styles.tabWrap}>
        <SegmentedTabs tabs={tabs} active={active} onChange={(key) => setActive(key as LaundryTab)} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {offlineMode && <Text style={styles.offlineNote}>Offline mode: showing demo data</Text>}

        {active === 'new' && (
          <View style={styles.block}>
            {/* Wash & Ironing Section */}
            <View>
              <Pressable
                onPress={() => toggleSection('wash_ironing')}
                style={styles.sectionHeaderContainer}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionIcon}>
                    <WashingMachineIcon size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sectionTitle}>Wash & Ironing</Text>
                  <Text style={styles.itemCountBadge}>{washIroningItems.length}</Text>
                </View>
                {expandedSections.wash_ironing ? (
                  <ChevronUpIcon size={24} color={COLORS.primary} />
                ) : (
                  <ChevronDownIcon size={24} color={COLORS.primary} />
                )}
              </Pressable>

              {expandedSections.wash_ironing && (
                <View style={styles.itemsGrid}>
                  {washIroningItems.map((item, index) => (
                    <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(260)}>
                      <AppCard style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                          </View>
                          <Pressable onPress={() => addToCart(item)} style={styles.plusButton}>
                            <PlusIcon size={20} color="#FFFFFF" />
                          </Pressable>
                        </View>
                        <Text style={styles.itemPrice}>Rs {item.price}</Text>
                      </AppCard>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>

            {/* Dry Cleaning Section */}
            <View style={{ marginTop: 20 }}>
              <Pressable
                onPress={() => toggleSection('dry_cleaning')}
                style={styles.sectionHeaderContainer}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIcon, styles.dryCleaningIcon]}>
                    <HangerIcon size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sectionTitle}>Dry Cleaning</Text>
                  <Text style={styles.itemCountBadge}>{dryCleaningItems.length}</Text>
                </View>
                {expandedSections.dry_cleaning ? (
                  <ChevronUpIcon size={24} color={COLORS.primary} />
                ) : (
                  <ChevronDownIcon size={24} color={COLORS.primary} />
                )}
              </Pressable>

              {expandedSections.dry_cleaning && (
                <View style={styles.itemsGrid}>
                  {dryCleaningItems.map((item, index) => (
                    <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(260)}>
                      <AppCard style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                          </View>
                          <Pressable onPress={() => addToCart(item)} style={styles.plusButton}>
                            <PlusIcon size={20} color="#FFFFFF" />
                          </Pressable>
                        </View>
                        <Text style={styles.itemPrice}>Rs {item.price}</Text>
                      </AppCard>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {active === 'active' && (
          <View style={styles.block}>
            {activeBookings.length === 0 ? (
              <AppCard style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No Active Bookings</Text>
                <Text style={styles.emptyStateText}>Your bookings will appear here. Start by adding clothes and confirming a pickup slot.</Text>
              </AppCard>
            ) : (
              activeBookings.map((booking, index) => {
                const statusColor =
                  booking.status === 'picked_up'
                    ? '#10B981'
                    : booking.status === 'in_progress'
                      ? '#F59E0B'
                      : booking.status === 'delivering'
                        ? '#3B82F6'
                        : '#6B7280';

                return (
                  <Animated.View
                    key={booking.id}
                    entering={FadeInDown.delay(index * 50).duration(320)}
                  >
                    <AppCard style={styles.bookingCard}>
                      <View style={styles.bookingHeader}>
                        <View>
                          <Text style={styles.bookingId}>{booking.id.substring(0, 13)}...</Text>
                          <Text style={[styles.bookingStatus, { color: statusColor }]}>
                            {booking.status === 'picked_up'
                              ? 'Picked Up'
                              : booking.status === 'in_progress'
                                ? 'Processing'
                                : booking.status === 'delivering'
                                  ? 'Delivering'
                                  : 'Completed'}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => cancelBooking(booking.id)}
                          style={styles.cancelBtn}
                        >
                          <MaterialCommunityIcons name="close" size={20} color="#EF4444" />
                        </Pressable>
                      </View>

                      <View style={styles.bookingDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Pickup Date:</Text>
                          <Text style={styles.detailValue}>{booking.selectedSlot.date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Time:</Text>
                          <Text style={styles.detailValue}>
                            {booking.selectedSlot.start_time} - {booking.selectedSlot.end_time}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Total Price:</Text>
                          <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '800' }]}>
                            Rs {booking.totalPrice}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemsList}>
                        <Text style={styles.itemsTitle}>Items ({booking.items.length})</Text>
                        {booking.items.map((item) => (
                          <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.bookingItemName}>{item.name}</Text>
                            <Text style={styles.itemQty}>×{item.quantity}</Text>
                          </View>
                        ))}
                      </View>

                      {booking.status !== 'completed' && (
                        <View style={styles.statusActions}>
                          {booking.status === 'picked_up' && (
                            <Pressable
                              onPress={() => updateBookingStatus(booking.id, 'in_progress')}
                              style={styles.actionBtn}
                            >
                              <Text style={styles.actionBtnText}>Mark as Processing</Text>
                            </Pressable>
                          )}
                          {booking.status === 'in_progress' && (
                            <Pressable
                              onPress={() => updateBookingStatus(booking.id, 'delivering')}
                              style={styles.actionBtn}
                            >
                              <Text style={styles.actionBtnText}>Mark as Delivering</Text>
                            </Pressable>
                          )}
                          {booking.status === 'delivering' && (
                            <Pressable
                              onPress={() => updateBookingStatus(booking.id, 'completed')}
                              style={styles.actionBtn}
                            >
                              <Text style={styles.actionBtnText}>Mark as Completed</Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                    </AppCard>
                  </Animated.View>
                );
              })
            )}
          </View>
        )}

        {active === 'plans' && (
          <AppCard style={styles.planCard}>
            <Text style={styles.planChip}>Most Popular</Text>
            <Text style={styles.planName}>Student Saver</Text>
            <Text style={styles.planSub}>Monthly Laundry Subscription</Text>
            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>Rs 249</Text>
              <Text style={styles.planMonth}>/ month</Text>
            </View>
            <Text style={styles.planPoint}>12 pairs of clothes</Text>
            <Text style={styles.planPoint}>Wash & Fold service</Text>
            <Text style={styles.planPoint}>Schedule pickups anytime</Text>
            <Pressable style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Subscribe Now</Text>
            </Pressable>
          </AppCard>
        )}
      </ScrollView>

      {/* Cart Panel */}
      {cartItems.length > 0 && active === 'new' && (
        <View style={styles.cartPanel}>
          <ScrollView style={styles.cartItemsContainer} horizontal showsHorizontalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItemBadge}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <View style={styles.cartItemControls}>
                  <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <MaterialCommunityIcons name="minus" size={16} color={COLORS.primary} />
                  </Pressable>
                  <Text style={styles.cartItemQty}>{item.quantity}</Text>
                  <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <MaterialCommunityIcons name="plus" size={16} color={COLORS.primary} />
                  </Pressable>
                  <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                    <MaterialCommunityIcons name="close" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartFooter}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>Rs {totalPrice}</Text>
            </View>
            <PrimaryButton label="Continue to Book" onPress={handleBooking} style={{ flex: 1, marginLeft: 12 }} />
          </View>
        </View>
      )}

      {/* Booking Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowBookingModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Select Pickup Slot</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.slotsContainer} contentContainerStyle={styles.slotsContent}>
            {timeSlots.map((slot) => (
              <Pressable
                key={slot.id}
                onPress={() => setSelectedSlot(slot)}
                disabled={!slot.available}
                style={[
                  styles.slotCard,
                  selectedSlot?.id === slot.id && styles.slotCardSelected,
                  !slot.available && styles.slotCardDisabled
                ]}
              >
                <View style={styles.slotInfo}>
                  <Text style={styles.slotDate}>{new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                  <Text style={styles.slotTime}>
                    {slot.start_time} - {slot.end_time}
                  </Text>
                </View>
                {!slot.available && <Text style={styles.slotBadge}>Booked</Text>}
                {selectedSlot?.id === slot.id && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />}
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <PrimaryButton label="Confirm Booking" onPress={handleConfirmBooking} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ECEFF5' },
  chatIconButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabWrap: { marginTop: -18, paddingHorizontal: 16 },
  content: { padding: 16, paddingBottom: 100 },
  offlineNote: { color: '#7C8799', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  block: { gap: 20 },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dryCleaningIcon: {
    backgroundColor: '#DC2626'
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, flex: 1 },
  itemCountBadge: {
    backgroundColor: '#F3EDFF',
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  itemsGrid: { gap: 12, marginBottom: 12 },
  itemCard: {
    padding: 12,
    gap: 8,
    borderRadius: 12
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  itemDesc: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  cartItemsContainer: { minHeight: 60, marginBottom: 12 },
  cartItemBadge: {
    backgroundColor: '#F3EDFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF'
  },
  cartItemName: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cartItemControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartItemQty: { fontSize: 11, fontWeight: '600', color: COLORS.primary, minWidth: 16, textAlign: 'center' },
  removeBtn: { marginLeft: 6, padding: 2 },
  cartFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12, color: COLORS.muted },
  totalPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  modalContainer: { flex: 1, backgroundColor: '#ECEFF5' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  slotsContainer: { flex: 1 },
  slotsContent: { padding: 16, gap: 10 },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0'
  },
  slotCardSelected: { borderColor: COLORS.primary, backgroundColor: '#F3EDFF' },
  slotCardDisabled: { opacity: 0.5 },
  slotInfo: { flex: 1 },
  slotDate: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  slotTime: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  slotBadge: { fontSize: 11, fontWeight: '600', color: '#EF4444' },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  statusCard: { padding: 14, gap: 12 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: '#94A3B8', fontWeight: '700', fontSize: 12 },
  badge: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
    backgroundColor: '#F3EDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dotDone: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  dotCurrent: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  dotPending: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1' },
  timelineTitle: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  timelineSub: { color: COLORS.muted, marginTop: 2, fontSize: 12, fontWeight: '500' },
  planCard: { backgroundColor: '#251D48', borderColor: '#3B2D71', padding: 16, gap: 8 },
  planChip: {
    alignSelf: 'flex-start',
    color: '#1F2937',
    backgroundColor: '#FDE68A',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  planName: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  planSub: { color: '#E2E8F0', fontSize: 13, fontWeight: '500' },
  planPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 3 },
  planPrice: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  planMonth: { color: '#CBD5E1', fontWeight: '600', fontSize: 13 },
  planPoint: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  subscribeButton: { marginTop: 8, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', paddingVertical: 12 },
  subscribeText: { color: '#3A1C71', fontWeight: '800', fontSize: 15 },
  emptyStateCard: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyStateText: { color: COLORS.muted, fontSize: 13, fontWeight: '500', textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  bookingCard: { padding: 14, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  bookingStatus: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  cancelBtn: { padding: 8 },
  bookingDetails: { gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  detailValue: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  itemsList: { gap: 6 },
  itemsTitle: { color: COLORS.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, backgroundColor: '#F8FAFC', borderRadius: 6 },
  bookingItemName: { color: COLORS.text, fontSize: 12, fontWeight: '600', flex: 1 },
  itemQty: { color: COLORS.primary, fontSize: 12, fontWeight: '800' },
  statusActions: { gap: 8 },
  actionBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }
});

