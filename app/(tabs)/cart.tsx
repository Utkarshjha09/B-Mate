import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../../components/ui/AppCard';
import { AppImage } from '../../components/ui/AppImage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../lib/constants';
import { appService, fallbackData } from '../../services/appService';
import { CartItem, FoodItem, WaterProduct } from '../../types/app';

type DisplayCartItem = {
  id: string;
  itemId: number;
  itemType: 'food' | 'water';
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export default function CartScreen() {
  const { user, isBypassEnabled } = useAuth();
  const cartUserId = user?.id ?? (isBypassEnabled ? 'bypass-user' : null);
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [waterItems, setWaterItems] = useState<WaterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
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

  const loadCart = async () => {
    if (!cartUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [cartRes, foodRes, waterRes] = await withTimeout(
        Promise.all([appService.getCart(cartUserId), appService.getFoodItems(), appService.getWaterProducts()]),
        3500,
        'Cart data request timed out'
      );

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
    loadCart();
  }, [cartUserId]);

  const mappedItems = useMemo<DisplayCartItem[]>(() => {
    return cartItems
      .map((item) => {
        const itemId = Number(item.item_id);
        const source =
          item.item_type === 'food'
            ? foodItems.find((f) => Number(f.id) === itemId)
            : waterItems.find((w) => Number(w.id) === itemId);

        if (!source) {
          return null;
        }

        return {
          id: `${item.item_type}-${item.item_id}`,
          itemId,
          itemType: item.item_type,
          name: source.name,
          image: source.image,
          price: source.price,
          quantity: Number(item.quantity) || 0
        };
      })
      .filter((entry): entry is DisplayCartItem => Boolean(entry));
  }, [cartItems, foodItems, waterItems]);

  const subtotal = useMemo(() => mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [mappedItems]);
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  const updateQuantity = async (item: DisplayCartItem, delta: number) => {
    if (!cartUserId) {
      return;
    }

    const current = item.quantity;
    const next = Math.max(current + delta, 0);
    const key = `${item.itemType}-${item.itemId}`;
    setSavingKey(key);

    try {
      if (next === 0) {
        await appService.removeCartItem(cartUserId, item.itemId, item.itemType);
        setCartItems((prev) =>
          prev.filter((entry) => !(entry.item_type === item.itemType && Number(entry.item_id) === item.itemId))
        );
      } else {
        await appService.setCartItem(cartUserId, item.itemId, next, item.itemType);
        setCartItems((prev) =>
          prev.map((entry) =>
            entry.item_type === item.itemType && Number(entry.item_id) === item.itemId
              ? { ...entry, quantity: next }
              : entry
          )
        );
      }
    } catch (error) {
      Alert.alert('Cart update failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading cart..." />;
  }

  if (!cartUserId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sign in to view your cart</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: mappedItems.length ? 140 : 24 }]}>
        <Text style={styles.title}>Your Cart</Text>

        {mappedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Add meals or water items to continue.</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {mappedItems.map((item) => (
              <AppCard key={item.id} style={styles.itemCard}>
                <AppImage uri={item.image} style={styles.itemImage} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.itemType === 'food' ? 'Food' : 'Water'}</Text>
                  <Text style={styles.itemPrice}>Rs {item.price}</Text>
                </View>
                <View style={styles.qtyWrap}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item, -1)}
                    disabled={savingKey === item.id}
                  >
                    <Text style={styles.qtyAction}>-</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item, 1)}
                    disabled={savingKey === item.id}
                  >
                    <Text style={styles.qtyAction}>+</Text>
                  </Pressable>
                </View>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>

      {mappedItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>Rs {subtotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery</Text>
            <Text style={styles.totalValue}>Rs {deliveryFee}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>Rs {total}</Text>
          </View>
          <PrimaryButton label="Proceed to Payment" onPress={() => router.push('/payment')} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { padding: 16 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 10 },
  listWrap: { gap: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  itemImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E2E8F0' },
  itemBody: { flex: 1 },
  itemName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  itemMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  itemPrice: { color: COLORS.primary, fontSize: 15, fontWeight: '800', marginTop: 5 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  qtyAction: { color: COLORS.primary, fontSize: 18, fontWeight: '700', marginTop: -2 },
  qtyValue: { minWidth: 18, textAlign: 'center', fontWeight: '700', color: COLORS.text },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 6
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  totalValue: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  grandTotal: { marginBottom: 8 },
  grandLabel: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  grandValue: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  emptySub: { color: COLORS.muted, marginTop: 8, textAlign: 'center' }
});
