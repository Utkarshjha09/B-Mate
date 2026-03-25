import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/ui/AppCard';
import { LoadingState } from '../components/ui/LoadingState';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../lib/constants';
import { appService, fallbackData } from '../services/appService';
import { CartItem, FoodItem, WaterProduct } from '../types/app';

type PaymentMethod = 'upi' | 'card' | 'cod';

export default function PaymentScreen() {
  const { user, isBypassEnabled } = useAuth();
  const cartUserId = user?.id ?? (isBypassEnabled ? 'bypass-user' : null);
  const params = useLocalSearchParams<{
    directType?: string;
    directTitle?: string;
    directAmount?: string;
    directPeriod?: string;
  }>();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [waterItems, setWaterItems] = useState<WaterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('upi');

  const directAmount = Number(params.directAmount || 0);
  const isDirectPayment = Number.isFinite(directAmount) && directAmount > 0;

  const loadData = async () => {
    if (isDirectPayment) {
      setLoading(false);
      return;
    }

    if (!cartUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [cartRes, foodRes, waterRes] = await Promise.all([
        appService.getCart(cartUserId),
        appService.getFoodItems(),
        appService.getWaterProducts()
      ]);

      setCartItems((cartRes.data as CartItem[]) ?? []);
      setFoodItems((foodRes.data as FoodItem[]) ?? fallbackData.foodItems);
      setWaterItems((waterRes.data as WaterProduct[]) ?? fallbackData.waterProducts);
    } catch {
      setCartItems([]);
      setFoodItems(fallbackData.foodItems);
      setWaterItems(fallbackData.waterProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cartUserId, isDirectPayment]);

  const summary = useMemo(() => {
    const foodById = new Map(foodItems.map((f) => [f.id, f]));
    const waterById = new Map(waterItems.map((w) => [w.id, w]));

    let foodTotal = 0;
    let waterTotal = 0;
    let quantity = 0;

    cartItems.forEach((item) => {
      if (item.item_type === 'food') {
        const source = foodById.get(Number(item.item_id));
        if (source) {
          const itemQty = Number(item.quantity) || 0;
          foodTotal += source.price * itemQty;
          quantity += itemQty;
        }
      } else {
        const source = waterById.get(Number(item.item_id));
        if (source) {
          const itemQty = Number(item.quantity) || 0;
          waterTotal += source.price * itemQty;
          quantity += itemQty;
        }
      }
    });

    const subtotal = foodTotal + waterTotal;
    const delivery = subtotal > 0 ? 10 : 0;
    const total = subtotal + delivery;
    return { foodTotal, waterTotal, quantity, subtotal, delivery, total };
  }, [cartItems, foodItems, waterItems]);

  const placeOrder = async () => {
    if (isDirectPayment) {
      setPlacingOrder(true);
      try {
        if (cartUserId && !cartUserId.startsWith('bypass-')) {
          const { error } = await appService.createOrder({
            user_id: cartUserId,
            type: 'food',
            total: directAmount,
            status: 'pending'
          });
          if (error) {
            throw error;
          }
        }
        Alert.alert('Payment Successful', `${params.directTitle || 'Subscription'} activated.`);
        router.replace('/(tabs)/food');
      } catch (error) {
        Alert.alert('Payment failed', error instanceof Error ? error.message : 'Please try again.');
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    if (!cartUserId || summary.total <= 0) {
      return;
    }

    setPlacingOrder(true);
    try {
      if (summary.foodTotal > 0 && !cartUserId.startsWith('bypass-')) {
        const { error } = await appService.createOrder({
          user_id: cartUserId,
          type: 'food',
          total: summary.foodTotal,
          status: 'pending'
        });
        if (error) {
          throw error;
        }
      }

      if (summary.waterTotal > 0 && !cartUserId.startsWith('bypass-')) {
        const { error } = await appService.createOrder({
          user_id: cartUserId,
          type: 'water',
          total: summary.waterTotal,
          status: 'pending'
        });
        if (error) {
          throw error;
        }
      }

      const { error: clearError } = await appService.clearCart(cartUserId);
      if (clearError) {
        throw clearError;
      }

      Alert.alert('Payment Successful', `Order placed using ${method.toUpperCase()}.`);
      router.replace('/(tabs)/cart');
    } catch (error) {
      Alert.alert('Payment failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <LoadingState label="Preparing payment..." />;
  }

  if (!cartUserId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.notice}>Please log in to continue with payment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Payment</Text>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {isDirectPayment ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Plan</Text>
                <Text style={styles.value}>{params.directTitle || 'Custom Subscription'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Billing</Text>
                <Text style={styles.value}>{params.directPeriod || 'monthly'}</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.totalLabel}>Payable Total</Text>
                <Text style={styles.totalValue}>Rs {directAmount}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Items</Text>
                <Text style={styles.value}>{summary.quantity}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>Rs {summary.subtotal}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Delivery</Text>
                <Text style={styles.value}>Rs {summary.delivery}</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.totalLabel}>Payable Total</Text>
                <Text style={styles.totalValue}>Rs {summary.total}</Text>
              </View>
            </>
          )}
        </AppCard>

        <AppCard style={styles.methodsCard}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <MethodOption title="UPI" selected={method === 'upi'} onPress={() => setMethod('upi')} />
          <MethodOption title="Card" selected={method === 'card'} onPress={() => setMethod('card')} />
          <MethodOption title="Cash on Delivery" selected={method === 'cod'} onPress={() => setMethod('cod')} />
        </AppCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={placingOrder ? 'Processing...' : isDirectPayment ? 'Pay & Activate Subscription' : 'Pay & Place Order'}
          onPress={placeOrder}
          disabled={placingOrder || (!isDirectPayment && summary.total <= 0)}
        />
      </View>
    </SafeAreaView>
  );
}

function MethodOption({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.methodRow, selected && styles.methodRowActive]} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioActive]} />
      <Text style={[styles.methodText, selected && styles.methodTextActive]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { padding: 16, gap: 12, paddingBottom: 120 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  summaryCard: { padding: 14, gap: 8 },
  methodsCard: { padding: 14, gap: 8 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.muted, fontSize: 13, fontWeight: '500' },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  totalRow: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabel: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  totalValue: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  methodRow: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  methodRowActive: {
    borderColor: '#C4B5FD',
    backgroundColor: '#F5F3FF'
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1'
  },
  radioActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  methodText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14
  },
  methodTextActive: {
    color: COLORS.primary
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14
  },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notice: { color: COLORS.text, fontWeight: '700' }
});
