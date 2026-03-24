import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../../components/ui/AppCard';
import { AppImage } from '../../components/ui/AppImage';
import { DietPlanCustomizer } from '../../components/DietPlanCustomizer';
import { LoadingState } from '../../components/ui/LoadingState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { CheckCircleIcon, LeafIcon, NutritionIcon, PlusIcon, TrashIcon } from '../../components/ui/SvgIcons';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../lib/constants';
import { appService, fallbackData } from '../../services/appService';
import { FoodItem, SubscriptionPlan, Mess, DailyMenuItem, DietPlan } from '../../types/app';

type FoodTab = 'daily' | 'subs' | 'diet' | 'mess';

export default function FoodScreen() {
  const { user, isBypassEnabled } = useAuth();
  const cartUserId = user?.id ?? (isBypassEnabled ? 'bypass-user' : null);
  const [active, setActive] = useState<FoodTab>('daily');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [messMenuOpen, setMessMenuOpen] = useState(false);
  const [messMenu, setMessMenu] = useState<DailyMenuItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [dietCustomizerOpen, setDietCustomizerOpen] = useState(false);
  const [savedDietPlans, setSavedDietPlans] = useState<DietPlan[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodRes, planRes, messRes] = await Promise.all([
        appService.getFoodItems(),
        appService.getSubscriptions(),
        appService.getMesses()
      ]);
      if (foodRes.error || planRes.error || messRes.error) {
        throw new Error(foodRes.error?.message || planRes.error?.message || messRes.error?.message || 'Network request failed');
      }
      setItems((foodRes.data as FoodItem[]) ?? fallbackData.foodItems);
      setPlans((planRes.data as SubscriptionPlan[]) ?? fallbackData.subscriptions);
      setMesses((messRes.data as Mess[]) ?? fallbackData.messes);
      if (cartUserId) {
        const cartResponse = await appService.getCart(cartUserId);
        const foodQuantities = ((cartResponse.data as any[]) ?? []).reduce<Record<number, number>>((acc, row) => {
          if (row.item_type === 'food') {
            acc[Number(row.item_id)] = Number(row.quantity) || 0;
          }
          return acc;
        }, {});
        setCartQuantities(foodQuantities);
      }
      setOfflineMode(false);
    } catch {
      setItems(fallbackData.foodItems);
      setPlans(fallbackData.subscriptions);
      setMesses(fallbackData.messes);
      setOfflineMode(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      await loadData();
    };

    load();

    return () => {
      mounted = false;
    };
  }, [cartUserId]);

  const addToCart = async (item: FoodItem) => {
    if (!cartUserId) {
      return;
    }
    const next = (cartQuantities[item.id] || 0) + 1;
    setCartQuantities((prev) => ({ ...prev, [item.id]: next }));
    const { error: cartError } = await appService.setCartItem(cartUserId, item.id, next, 'food');
    if (cartError) {
      setCartQuantities((prev) => ({ ...prev, [item.id]: next - 1 }));
      Alert.alert('Cart update failed', cartError.message || 'Could not add item to cart');
    }
  };

  const openMessMenu = async (mess: Mess) => {
    setSelectedMess(mess);
    try {
      const result = await appService.getDailyMenu(mess.id);
      if (result.error) {
        setMessMenu(fallbackData.dailyMenu.filter(item => item.mess_id === mess.id));
      } else {
        setMessMenu((result.data as DailyMenuItem[]) ?? fallbackData.dailyMenu.filter(item => item.mess_id === mess.id));
      }
    } catch {
      setMessMenu(fallbackData.dailyMenu.filter(item => item.mess_id === mess.id));
    }
    setMessMenuOpen(true);
  };

  const toggleLike = (itemId: number) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const handleSaveDietPlan = (plan: DietPlan) => {
    setSavedDietPlans((prev) => [plan, ...prev]);
    Alert.alert('Success', 'Diet plan saved successfully!');
  };

  const deleteDietPlan = (planId: string) => {
    Alert.alert(
      'Delete Diet Plan',
      'Are you sure you want to delete this diet plan?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setSavedDietPlans((prev) => prev.filter((p) => p.id !== planId));
            Alert.alert('Success', 'Diet plan deleted successfully!');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const tabs = useMemo(
    () => [
      { key: 'daily', label: 'Daily Menu' },
      { key: 'mess', label: 'Messes' },
      { key: 'subs', label: 'Subscriptions' },
      { key: 'diet', label: 'Diet Plans' }
    ],
    []
  );

  if (loading) {
    return <LoadingState label="Loading food menu..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headWrap}>
        <Text style={styles.headline}>B mate Food</Text>
        <Text style={styles.subtitle}>Delicious meals at student prices</Text>
        <SegmentedTabs tabs={tabs} active={active} onChange={(key) => setActive(key as FoodTab)} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {offlineMode ? <Text style={styles.offlineNote}>Offline mode: showing demo data</Text> : null}

        {active === 'daily' && (
          <View style={styles.block}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Featured Today</Text>
              <Text style={styles.link}>See All</Text>
            </View>

            {items.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 60).duration(320)}>
                <AppCard style={styles.foodCard}>
                  <AppImage uri={item.image} style={styles.cardImage} />
                  <View style={styles.ratingPill}>
                    <MaterialCommunityIcons name="star" color="#F59E0B" size={13} />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.price}>₹{item.price}</Text>
                    </View>
                    <View style={styles.tagsRow}>
                      {item.tags?.map((tag) => (
                        <Text key={`${item.id}-${tag}`} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{item.calories ?? 450} kcal</Text>
                      <Text style={styles.metaText}>{item.prep_time ?? '30-45 min'}</Text>
                    </View>
                    <PrimaryButton
                      label={cartQuantities[item.id] ? `Add to Cart (${cartQuantities[item.id]})` : 'Add to Cart'}
                      onPress={() => addToCart(item)}
                    />
                  </View>
                </AppCard>
              </Animated.View>
            ))}
          </View>
        )}

        {active === 'mess' && (
          <View style={styles.block}>
            {messes.map((mess, index) => (
              <Animated.View key={mess.id} entering={FadeInDown.delay(index * 60).duration(320)}>
                <Pressable onPress={() => openMessMenu(mess)}>
                  <AppCard style={styles.messCard}>
                    <View style={styles.messHeader}>
                      <View style={styles.messInfo}>
                        <Text style={styles.messName}>{mess.name}</Text>
                        <Text style={styles.messDescription}>{mess.description}</Text>
                      </View>
                      <View style={styles.messRating}>
                        <MaterialCommunityIcons name="star" color="#F59E0B" size={16} />
                        <Text style={styles.messRatingText}>{mess.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                    <View style={styles.messFooter}>
                      <Text style={styles.chargeLabel}>Per Week</Text>
                      <Text style={styles.chargeAmount}>₹{mess.charges_per_week}</Text>
                    </View>
                  </AppCard>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        {active === 'subs' && (
          <View style={styles.block}>
            {plans.map((plan) => (
              <AppCard key={plan.id} style={styles.planCard}>
                <View style={styles.planHead}>
                  <View style={styles.iconPill}>
                    <MaterialCommunityIcons name="silverware-fork-knife" color={COLORS.primary} size={16} />
                  </View>
                  <Text style={styles.planTitle}>{plan.type}</Text>
                </View>

                <View style={styles.innerPlanCard}>
                  <Text style={styles.planSubtitle}>1 Meal / Day</Text>
                  <Text style={styles.planHelp}>Perfect for lunch or dinner</Text>
                  <View style={styles.priceGrid}>
                    <View style={styles.priceCell}>
                      <Text style={styles.smallLabel}>WEEKLY</Text>
                      <Text style={styles.cellPrice}>₹{plan.price_weekly}</Text>
                    </View>
                    <View style={styles.priceCell}>
                      <Text style={styles.smallLabel}>MONTHLY</Text>
                      <Text style={styles.cellPrice}>₹{plan.price_monthly}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.ghostButton}>
                    <Text style={styles.ghostLabel}>Select</Text>
                  </Pressable>
                </View>
              </AppCard>
            ))}

            <AppCard style={styles.customMealCard}>
              <Text style={styles.customMealTitle}>Customizable Meal</Text>
              <Text style={styles.customMealSub}>Build your own plan. Choose dishes, days, and times.</Text>
              <PrimaryButton label="Start Customizing" />
            </AppCard>
          </View>
        )}

        {active === 'diet' && !dietCustomizerOpen && (
          <View style={styles.block}>
            {savedDietPlans.length === 0 && (
              <View style={styles.dietHeader}>
                <View style={styles.dietIconWrap}>
                  <NutritionIcon size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.dietTitle}>Custom Diet Plans</Text>
                <Text style={styles.dietSub}>Create a personalized meal plan based on your caloric needs and dietary restrictions.</Text>
                <PrimaryButton
                  label="Start Customizing"
                  style={styles.dietButton}
                  onPress={() => setDietCustomizerOpen(true)}
                />
              </View>
            )}

            {savedDietPlans.length > 0 && (
              <View style={styles.savedPlansContainer}>
                <View style={styles.yourPlansHeader}>
                  <View style={styles.yourPlansIconWrap}>
                  <CheckCircleIcon size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.savedPlansTitle}>Your Diet Plans</Text>
                  <Pressable onPress={() => setDietCustomizerOpen(true)} style={styles.addNewPlanBtn}>
                    <PlusIcon size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
                {savedDietPlans.map((plan, index) => {
                  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
                  
                  return (
                    <Animated.View
                      key={plan.id}
                      entering={FadeInDown.delay(index * 50).duration(320)}
                    >
                      <AppCard style={styles.planDetailsCard}>
                        {/* Header with Plan Name and Delete */}
                        <View style={styles.planHeaderRow}>
                          <View style={styles.planNameGroup}>
                            <LeafIcon size={20} color={COLORS.primary} />
                            <Text style={styles.planName}>{plan.name}</Text>
                          </View>
                          <Pressable onPress={() => deleteDietPlan(plan.id)} style={styles.deleteBtnLarge}>
                            <TrashIcon size={24} color="#EF4444" />
                          </Pressable>
                        </View>

                        {/* Meal Plan Table */}
                        <View style={styles.mealPlanTable}>
                          {mealTypes.map((mealType) => {
                            const mealItems = plan.items.filter((item) => item.meal_type === mealType);
                            if (mealItems.length === 0) return null;

                            return (
                              <View key={mealType} style={styles.mealSection}>
                                <Text style={styles.mealSectionTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                                
                                {mealItems.map((planItem, itemIndex) => (
                                  <View key={itemIndex} style={styles.mealItemRow}>
                                    <View style={styles.itemNameCol}>
                                      <Text style={styles.itemName}>
                                        {planItem.macroItem?.name || `Item ${planItem.macro_item_id}`}
                                      </Text>
                                    </View>
                                    <View style={styles.macrosRow}>
                                      <View style={styles.macroCell}>
                                        <Text style={styles.macroLabel}>Carbs</Text>
                                        <Text style={styles.macroValue}>
                                          {((planItem.macroItem?.carbs || 0) * planItem.quantity).toFixed(0)}g
                                        </Text>
                                      </View>
                                      <View style={styles.macroCell}>
                                        <Text style={styles.macroLabel}>Protein</Text>
                                        <Text style={styles.macroValue}>
                                          {((planItem.macroItem?.protein || 0) * planItem.quantity).toFixed(0)}g
                                        </Text>
                                      </View>
                                      <View style={styles.macroCell}>
                                        <Text style={styles.macroLabel}>Fat</Text>
                                        <Text style={styles.macroValue}>
                                          {((planItem.macroItem?.fat || 0) * planItem.quantity).toFixed(0)}g
                                        </Text>
                                      </View>
                                      <View style={styles.macroCell}>
                                        <Text style={styles.macroLabel}>Cal</Text>
                                        <Text style={styles.macroValue}>
                                          {((planItem.macroItem?.calories || 0) * planItem.quantity).toFixed(0)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            );
                          })}
                        </View>

                        {/* Totals Summary */}
                        <View style={styles.totalsSummary}>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalItemLabel}>Total Calories</Text>
                            <Text style={styles.totalItemValue}>{plan.total_calories.toFixed(0)}</Text>
                          </View>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalItemLabel}>Protein</Text>
                            <Text style={styles.totalItemValue}>{plan.total_protein.toFixed(1)}g</Text>
                          </View>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalItemLabel}>Carbs</Text>
                            <Text style={styles.totalItemValue}>{plan.total_carbs.toFixed(1)}g</Text>
                          </View>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalItemLabel}>Fat</Text>
                            <Text style={styles.totalItemValue}>{plan.total_fat.toFixed(1)}g</Text>
                          </View>
                        </View>
                      </AppCard>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Mess Menu Modal */}
      <Modal
        visible={messMenuOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMessMenuOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setMessMenuOpen(false)}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.modalTitle}>{selectedMess?.name}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.messDetailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailRowItem}>
                  <MaterialCommunityIcons name="star" size={20} color="#F59E0B" />
                  <Text style={styles.detailText}>{selectedMess?.rating.toFixed(1)} Rating</Text>
                </View>
                <View style={styles.detailRowItem}>
                  <MaterialCommunityIcons name="currency-inr" size={20} color={COLORS.primary} />
                  <Text style={styles.detailText}>₹{selectedMess?.charges_per_week}/week</Text>
                </View>
              </View>
            </View>

            <Text style={styles.menuTitle}>Today's Menu</Text>

            {messMenu.length === 0 ? (
              <Text style={styles.emptyMenuText}>No menu available for today</Text>
            ) : (
              messMenu.map((item) => (
                <View key={item.id} style={styles.menuItemCard}>
                  <View style={styles.menuItemHeader}>
                    <View style={styles.menuItemTitleWrap}>
                      <Text style={styles.menuItemName}>{item.item_name}</Text>
                      {item.is_special && (
                        <View style={styles.specialBadge}>
                          <Text style={styles.specialBadgeText}>Special</Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      onPress={() => toggleLike(item.id)}
                      style={styles.likeButton}
                    >
                      <MaterialCommunityIcons
                        name={likedItems.has(item.id) ? 'heart' : 'heart-outline'}
                        size={22}
                        color={likedItems.has(item.id) ? '#EF4444' : '#CBD5E1'}
                      />
                    </Pressable>
                  </View>
                  {item.description && (
                    <Text style={styles.menuItemDesc}>{item.description}</Text>
                  )}
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Diet Plan Customizer Modal */}
      <Modal
        visible={dietCustomizerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setDietCustomizerOpen(false)}
      >
        <DietPlanCustomizer
          onClose={() => setDietCustomizerOpen(false)}
          onSavePlan={handleSaveDietPlan}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  headWrap: {
    backgroundColor: '#E9EDF3',
    borderBottomWidth: 1,
    borderBottomColor: '#D4DAE2',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10
  },
  headline: { color: '#4C1D95', fontSize: 38, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  content: { padding: 14, paddingBottom: 26 },
  offlineNote: {
    color: '#7C8799',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8
  },
  block: { gap: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  link: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  foodCard: { overflow: 'hidden' },
  cardImage: { width: '100%', height: 180 },
  ratingPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  cardBody: { padding: 12, gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodName: { color: COLORS.text, fontSize: 16, fontWeight: '800', flexShrink: 1 },
  price: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '600'
  },
  metaRow: { flexDirection: 'row', gap: 14 },
  metaText: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  messCard: { padding: 12, gap: 10 },
  messHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  messInfo: { flex: 1, gap: 4 },
  messName: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  messDescription: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  messRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  messRatingText: { color: '#92400E', fontWeight: '700', fontSize: 12 },
  messFooter: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chargeLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  chargeAmount: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  planCard: { padding: 12, gap: 10 },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconPill: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3EDFF', alignItems: 'center', justifyContent: 'center' },
  planTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  innerPlanCard: { borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, backgroundColor: '#F8FAFC', gap: 8 },
  planSubtitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  planHelp: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  priceGrid: { flexDirection: 'row', gap: 10 },
  priceCell: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', alignItems: 'center', paddingVertical: 8 },
  smallLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '800' },
  cellPrice: { fontSize: 24, color: COLORS.primary, fontWeight: '800' },
  ghostButton: { borderRadius: 10, borderWidth: 1, borderColor: '#D8B4FE', paddingVertical: 9, alignItems: 'center' },
  ghostLabel: { color: COLORS.primary, fontWeight: '700' },
  customMealCard: { backgroundColor: '#3A1C71', padding: 14, gap: 8 },
  customMealTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  customMealSub: { color: '#E9D5FF', fontSize: 13, fontWeight: '500' },
  dietHeader: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 10 },
  dietIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dietTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  dietSub: { color: COLORS.muted, textAlign: 'center', fontSize: 14, maxWidth: 280, lineHeight: 20, fontWeight: '500' },
  dietButton: { width: 230, marginTop: 8 },
  savedPlansContainer: { marginTop: 12, gap: 12 },
  yourPlansHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 12, marginBottom: 8 },
  yourPlansIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  savedPlansTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', flex: 1 },
  addNewPlanBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  planDetailsCard: { padding: 12, gap: 12 },
  planNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  planNameGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  planName: { color: COLORS.text, fontSize: 15, fontWeight: '800', flex: 1 },
  deleteBtn: { padding: 8 },
  deleteBtnLarge: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  totalsGrid: { flexDirection: 'row', gap: 8 },
  mealPlanTable: { gap: 16, marginVertical: 12 },
  mealSection: { gap: 8 },
  mealSectionTitle: { color: COLORS.primary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  mealItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  itemNameCol: { flex: 1, marginRight: 12 },
  itemName: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  macrosRow: { flexDirection: 'row', gap: 6 },
  macroCell: { alignItems: 'center', minWidth: 45 },
  macroLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '600', marginBottom: 2 },
  macroValue: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  totalsSummary: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalItem: { flex: 1, backgroundColor: '#F3EDFF', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF' },
  totalItemLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  totalItemValue: { color: COLORS.primary, fontSize: 14, fontWeight: '800', marginTop: 4 },
  modalSafeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', flex: 1, textAlign: 'center' },
  modalContent: { padding: 14, paddingBottom: 26 },
  messDetailCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  detailRowItem: { alignItems: 'center', gap: 6 },
  detailText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  menuTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  emptyMenuText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  menuItemCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  menuItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  menuItemTitleWrap: { flex: 1, gap: 6 },
  menuItemName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  specialBadge: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  specialBadgeText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  likeButton: { padding: 4 },
  menuItemDesc: { color: COLORS.muted, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  categoryBadge: { backgroundColor: '#F3EDFF', color: COLORS.primary, fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }
});
