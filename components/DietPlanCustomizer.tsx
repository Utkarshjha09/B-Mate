import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from './ui/AppCard';
import { DietPlanLogo } from './ui/DietPlanLogo';
import { MealLogo } from './ui/MealLogo';
import { ItemIcon } from './ui/ItemIcon';
import { LoadingState } from './ui/LoadingState';
import { PrimaryButton } from './ui/PrimaryButton';
import { PlusIcon, LeafIcon } from './ui/SvgIcons';
import { COLORS } from '../lib/constants';
import { appService, fallbackData } from '../services/appService';
import { MacroItem, DietPlan, DietPlanItem } from '../types/app';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface DietPlanCustomizerProps {
  onClose: () => void;
  onSavePlan?: (plan: DietPlan) => void;
}

export function DietPlanCustomizer({ onClose, onSavePlan }: DietPlanCustomizerProps) {
  const [macroItems, setMacroItems] = useState<MacroItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('protein');
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [dietItems, setDietItems] = useState<(DietPlanItem & { item: MacroItem })[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const categories = ['protein', 'carb', 'vegetable', 'fruit', 'grain', 'dairy'];

  useEffect(() => {
    loadMacroItems();
  }, []);

  const loadMacroItems = async () => {
    setLoading(true);
    try {
      const result = await appService.getMacroItems();
      if (result.error) {
        setMacroItems(fallbackData.macroItems);
      } else {
        setMacroItems((result.data as MacroItem[]) ?? fallbackData.macroItems);
      }
    } catch {
      setMacroItems(fallbackData.macroItems);
    }
    setLoading(false);
  };

  const filteredItems = macroItems.filter((item) => item.category === selectedCategory);

  const addItemToPlan = (item: MacroItem) => {
    // Always add as a new entry, even if it already exists
    setDietItems([
      ...dietItems,
      {
        macro_item_id: item.id,
        meal_type: selectedMealType,
        quantity: 1,
        item
      }
    ]);
  };

  const removeItemFromPlan = (index: number) => {
    setDietItems(dietItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let totalCalories = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    dietItems.forEach((item) => {
      totalCalories += item.item.calories * item.quantity;
      totalProtein += item.item.protein * item.quantity;
      totalCarbs += item.item.carbs * item.quantity;
      totalFat += item.item.fat * item.quantity;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const handleSavePlan = async () => {
    const totals = calculateTotals();
    const plan: DietPlan = {
      id: `plan_${Date.now()}`,
      user_id: 'current_user',
      name: `Custom Diet Plan - ${new Date().toLocaleDateString()}`,
      items: dietItems.map(({ item, ...rest }) => ({ ...rest, macroItem: item })),
      total_calories: totals.totalCalories,
      total_protein: totals.totalProtein,
      total_carbs: totals.totalCarbs,
      total_fat: totals.totalFat
    };

    if (onSavePlan) {
      onSavePlan(plan);
    }
    onClose();
  };

  const totals = calculateTotals();
  
  // Calculate price based on items (default: ₹50 per item)
  const totalPrice = dietItems.length * 50;

  if (loading) {
    return <LoadingState label="Loading food items..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <DietPlanLogo size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Build Your Diet</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentWrapper}>
        {!showSummary && (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
          <View style={styles.mealTypeSelector}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
              <Pressable
                key={meal}
                onPress={() => setSelectedMealType(meal)}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal && styles.mealTypeButtonActive
                ]}
              >
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <MealLogo mealType={meal} size={32} selected={selectedMealType === meal} />
                </View>
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === meal && styles.mealTypeTextActive
                  ]}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  selectedCategory === item && styles.categoryChipActive
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === item && styles.categoryChipTextActive
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            )}
            scrollEnabled={false}
          />

          <View style={styles.foodListContainer}>
            {filteredItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 30).duration(250)}
              >
                <AppCard style={styles.foodItemCard}>
                  <View style={styles.foodItemHeader}>
                    <View style={styles.foodItemTitleWrap}>
                      <ItemIcon itemId={item.id} size={44} />
                      <View style={styles.foodItemNameWrap}>
                        <Text style={styles.foodItemName}>{item.name}</Text>
                        <Text style={styles.servingSize}>{item.serving_size}</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => addItemToPlan(item)}
                      style={styles.addButton}
                    >
                      <PlusIcon size={28} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}

                  <View style={styles.macroGrid}>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{item.protein.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{item.carbs.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroValue}>{item.fat.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={styles.macroValue}>{item.calories}</Text>
                    </View>
                  </View>
                </AppCard>
              </Animated.View>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {showSummary && (() => {
        const totals = calculateTotals();
        return (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={styles.summaryHeader}>
              <Pressable onPress={() => setShowSummary(false)}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
              </Pressable>
              <Text style={styles.summaryTitle}>Your Diet Plan</Text>
              <View style={{ width: 24 }} />
            </View>

            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
              const mealItems = dietItems.filter((di) => di.meal_type === mealType);
              if (mealItems.length === 0) return null;

              const mealTotals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
              };

              mealItems.forEach((item) => {
                mealTotals.calories += item.item.calories * item.quantity;
                mealTotals.protein += item.item.protein * item.quantity;
                mealTotals.carbs += item.item.carbs * item.quantity;
                mealTotals.fat += item.item.fat * item.quantity;
              });

              return (
                <View key={mealType} style={styles.mealSection}>
                  <View style={styles.mealSectionHeader}>
                    <MealLogo mealType={mealType} size={28} selected={true} />
                    <Text style={styles.mealSectionTitle}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                  </View>

                  {mealItems.map((item, index) => (
                    <View key={`${item.macro_item_id}-${index}`} style={styles.summaryItem}>
                      <View style={styles.summaryItemLeft}>
                        <ItemIcon itemId={item.item.id} size={36} />
                        <View style={styles.summaryItemInfo}>
                          <Text style={styles.summaryItemName}>{item.item.name}</Text>
                          <Text style={styles.summaryItemDetail}>
                            {item.quantity} × {item.item.serving_size}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.summaryItemCalories}>{(item.item.calories * item.quantity).toFixed(0)} cal</Text>
                    </View>
                  ))}

                  <View style={styles.mealMacroGrid}>
                    <View style={styles.mealMacroCell}>
                      <Text style={styles.mealMacroLabel}>Protein</Text>
                      <Text style={styles.mealMacroValue}>{mealTotals.protein.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.mealMacroCell}>
                      <Text style={styles.mealMacroLabel}>Carbs</Text>
                      <Text style={styles.mealMacroValue}>{mealTotals.carbs.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.mealMacroCell}>
                      <Text style={styles.mealMacroLabel}>Fat</Text>
                      <Text style={styles.mealMacroValue}>{mealTotals.fat.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.mealMacroCell}>
                      <Text style={styles.mealMacroLabel}>Calories</Text>
                      <Text style={styles.mealMacroValue}>{mealTotals.calories.toFixed(0)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.summaryTotalsSection}>
              <Text style={styles.summaryTotalsTitle}>Daily Totals</Text>
              <View style={styles.summaryTotalsMacroGrid}>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Protein</Text>
                  <Text style={styles.summaryTotalValue}>{totals.totalProtein.toFixed(1)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Carbs</Text>
                  <Text style={styles.summaryTotalValue}>{totals.totalCarbs.toFixed(1)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Fat</Text>
                  <Text style={styles.summaryTotalValue}>{totals.totalFat.toFixed(1)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Calories</Text>
                  <Text style={styles.summaryTotalValue}>{totals.totalCalories.toFixed(0)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryMonthlySection}>
              <Text style={styles.summaryTotalsTitle}>Monthly Totals (Estimated)</Text>
              <View style={styles.summaryTotalsMacroGrid}>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Protein</Text>
                  <Text style={styles.summaryTotalValue}>{(totals.totalProtein * 30).toFixed(0)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Carbs</Text>
                  <Text style={styles.summaryTotalValue}>{(totals.totalCarbs * 30).toFixed(0)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Fat</Text>
                  <Text style={styles.summaryTotalValue}>{(totals.totalFat * 30).toFixed(0)}g</Text>
                </View>
                <View style={styles.summaryTotalCell}>
                  <Text style={styles.summaryTotalLabel}>Calories</Text>
                  <Text style={styles.summaryTotalValue}>{(totals.totalCalories * 30).toFixed(0)}</Text>
                </View>
              </View>
            </View>

            <PrimaryButton
              label="Create Diet Plan"
              onPress={handleSavePlan}
              style={styles.saveButton}
            />
            <View style={{ height: 20 }} />
          </ScrollView>
        );
      })()}

      {dietItems.length > 0 && !showSummary && (
        <View style={styles.selectedPanel}>
          <ScrollView 
            style={styles.selectedPanelScroll} 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <Pressable
              onPress={() => setIsPanelExpanded((prev) => !prev)}
              style={styles.toggleButton}
            >
              <View style={styles.toggleLeft}>
                <MaterialCommunityIcons
                  name={isPanelExpanded ? 'chevron-down' : 'chevron-up'}
                  size={20}
                  color={COLORS.text}
                />
                <Text style={styles.toggleText}>
                  {dietItems.length} item{dietItems.length !== 1 ? 's' : ''} added
                </Text>
              </View>
              <Pressable
                onPress={() => setShowSummary(true)}
                style={styles.inlineSummaryButton}
              >
                <Text style={styles.inlineSummaryText}>View Summary</Text>
              </Pressable>
            </Pressable>

            {isPanelExpanded && (
              <View style={styles.selectedItems}>
                {dietItems.map((item, index) => (
                  <View key={`${item.macro_item_id}-${item.meal_type}-${index}`} style={styles.selectedItem}>
                    <View style={styles.selectedItemInfo}>
                      <Text style={styles.selectedItemName}>{item.item.name}</Text>
                      <Text style={styles.selectedItemMeal}>{item.meal_type}</Text>
                    </View>
                    <Pressable
                      onPress={() => removeItemFromPlan(index)}
                      style={styles.removeButton}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}

                <View style={styles.pricingCard}>
                  <Text style={styles.pricingTitle}>Pricing</Text>
                  <View style={styles.priceRow}>
                    <View style={styles.priceCell}>
                      <Text style={styles.priceLabel}>Daily</Text>
                      <Text style={styles.priceValue}>₹{(totalPrice).toFixed(0)}</Text>
                    </View>
                    <View style={styles.priceCell}>
                      <Text style={styles.priceLabel}>Monthly</Text>
                      <Text style={styles.priceValue}>₹{(totalPrice * 30).toFixed(0)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.totalsCard}>
                  <Text style={styles.totalsTitle}>Daily Totals</Text>
                  <View style={styles.totalsGrid}>
                    <View style={styles.totalCell}>
                      <Text style={styles.totalLabel}>Calories</Text>
                      <Text style={styles.totalValue}>{totals.totalCalories.toFixed(0)}</Text>
                    </View>
                    <View style={styles.totalCell}>
                      <Text style={styles.totalLabel}>Protein</Text>
                      <Text style={styles.totalValue}>{totals.totalProtein.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.totalCell}>
                      <Text style={styles.totalLabel}>Carbs</Text>
                      <Text style={styles.totalValue}>{totals.totalCarbs.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.totalCell}>
                      <Text style={styles.totalLabel}>Fat</Text>
                      <Text style={styles.totalValue}>{totals.totalFat.toFixed(1)}g</Text>
                    </View>
                  </View>
                </View>

                <PrimaryButton
                  label="Save Diet Plan"
                  onPress={handleSavePlan}
                  style={styles.saveButton}
                />
              </View>
            )}
          </ScrollView>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  contentWrapper: { flex: 1, flexDirection: 'column' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTitleWrap: { alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  mealTypeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 70
  },
  mealTypeButtonActive: { backgroundColor: COLORS.primary },
  mealTypeText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  mealTypeTextActive: { color: '#FFFFFF' },
  categoryList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: '#FFFFFF' },
  scrollContainer: { flex: 1, minHeight: 0 },
  foodListContainer: { paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  foodList: { paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  foodItemCard: { padding: 12, gap: 10 },
  foodItemTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  foodItemNameWrap: { flex: 1, gap: 4 },
  foodItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodItemName: { color: COLORS.text, fontSize: 15, fontWeight: '800', flex: 1 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800'
  },
  mealSection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  mealSectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 6
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  summaryItemInfo: {
    gap: 2,
    flex: 1
  },
  summaryItemName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700'
  },
  summaryItemDetail: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500'
  },
  summaryItemCalories: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  mealMacroGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  mealMacroCell: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center'
  },
  mealMacroLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600'
  },
  mealMacroValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  summaryTotalsSection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    gap: 12
  },
  summaryMonthlySection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#FDF2F8',
    gap: 12
  },
  summaryTotalsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800'
  },
  summaryTotalsMacroGrid: {
    flexDirection: 'row',
    gap: 8
  },
  summaryTotalCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  summaryTotalLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600'
  },
  summaryTotalValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: -2
  },
  servingSize: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  description: { color: COLORS.muted, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  macroGrid: { flexDirection: 'row', gap: 8 },
  macroCell: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8, alignItems: 'center' },
  macroLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  macroValue: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginTop: 2 },
  selectedPanel: { 
    maxHeight: '45%',
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 12
  },
  toggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  inlineSummaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  inlineSummaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  selectedItems: { paddingHorizontal: 12, paddingTop: 12, gap: 8 },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  selectedItemInfo: { flex: 1 },
  selectedItemName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  selectedItemMeal: { color: COLORS.muted, fontSize: 11, fontWeight: '500', marginTop: 2 },
  selectedItemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedItemQty: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  removeButton: { padding: 6 },
  totalsCard: {
    backgroundColor: '#F3EDFF',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 8,
    marginHorizontal: 12
  },
  totalsTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  totalsGrid: { flexDirection: 'row', gap: 8 },
  totalCell: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  totalLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  totalValue: { color: COLORS.primary, fontSize: 14, fontWeight: '800', marginTop: 2 },
  saveButton: { marginHorizontal: 12, marginVertical: 12 },
  itemsCounterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#BBFBAA'
  },
  counterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22C55E'
  },
  viewSummaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  viewSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  viewSummaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 12,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  viewSummaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  selectedPanelScroll: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    paddingBottom: 16
  },
  pricingCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  pricingTitle: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8
  },
  priceCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  priceLabel: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4
  },
  priceValue: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800'
  }
});
