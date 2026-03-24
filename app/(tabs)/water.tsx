import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../../components/ui/AppCard';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { AppImage } from '../../components/ui/AppImage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, GRADIENTS } from '../../lib/constants';
import { appService, fallbackData } from '../../services/appService';
import { WaterProduct } from '../../types/app';

type WaterTab = 'one-time' | 'subs';

export default function WaterScreen() {
  const { user, isBypassEnabled } = useAuth();
  const cartUserId = user?.id ?? (isBypassEnabled ? 'bypass-user' : null);
  const router = useRouter();
  const [active, setActive] = useState<WaterTab>('one-time');
  const [products, setProducts] = useState<WaterProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await appService.getWaterProducts();
      if (response.error) {
        throw new Error(response.error.message || 'Network request failed');
      }
      setProducts((response.data as WaterProduct[]) ?? fallbackData.waterProducts);
      if (cartUserId) {
        const cartResponse = await appService.getCart(cartUserId);
        const waterQuantities = ((cartResponse.data as any[]) ?? []).reduce<Record<number, number>>((acc, row) => {
          if (row.item_type === 'water') {
            acc[Number(row.item_id)] = Number(row.quantity) || 0;
          }
          return acc;
        }, {});
        setQuantities(waterQuantities);
      }
      setOfflineMode(false);
    } catch {
      setProducts(fallbackData.waterProducts);
      setOfflineMode(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) {
        return;
      }
      await loadData();
    };

    load();
    return () => {
      mounted = false;
    };
  }, [cartUserId]);

  const tabs = useMemo(
    () => [
      { key: 'one-time', label: 'One-time Order' },
      { key: 'subs', label: 'Subscriptions' }
    ],
    []
  );

  const updateQuantity = async (item: WaterProduct, delta: number) => {
    const current = quantities[item.id] || 0;
    const next = Math.max(current + delta, 0);

    setQuantities((prev) => ({ ...prev, [item.id]: next }));

    if (!cartUserId) {
      return;
    }

    if (next === 0) {
      const { error: removeError } = await appService.removeCartItem(cartUserId, item.id, 'water');
      if (removeError) {
        setQuantities((prev) => ({ ...prev, [item.id]: current }));
        Alert.alert('Cart update failed', removeError.message || 'Could not remove item from cart');
      }
    } else {
      const { error: setError } = await appService.setCartItem(cartUserId, item.id, next, 'water');
      if (setError) {
        setQuantities((prev) => ({ ...prev, [item.id]: current }));
        Alert.alert('Cart update failed', setError.message || 'Could not update cart');
      }
    }
  };

  const total = useMemo(
    () => products.reduce((sum, item) => sum + (quantities[item.id] || 0) * item.price, 0),
    [products, quantities]
  );

  if (loading) {
    return <LoadingState label="Loading water products..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GradientHeader title="Water Supply" subtitle="Hydration delivered to your door." />
      <View style={styles.tabWrap}>
        <SegmentedTabs tabs={tabs} active={active} onChange={(key) => setActive(key as WaterTab)} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: total > 0 ? 120 : 24 }]}>
        {offlineMode ? <Text style={styles.offlineNote}>Offline mode: showing demo data</Text> : null}

        {products.map((product, index) => (
          <Animated.View key={product.id} entering={FadeInDown.delay(index * 70).duration(280)}>
            <AppCard style={styles.productCard}>
              <AppImage uri={product.image} style={styles.productImage} />
              <View style={styles.productBody}>
                <Text style={styles.productTitle}>{product.name}</Text>
                <Text style={styles.productTemp}>{product.temp}</Text>
                <Text style={styles.productVolume}>{product.volume}</Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.price}>₹{product.price}</Text>

                  {active === 'one-time' ? (
                    (quantities[product.id] || 0) === 0 ? (
                      <Pressable style={styles.addButton} onPress={() => updateQuantity(product, 1)}>
                        <Text style={styles.addText}>Add</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.qtyRow}>
                        <Pressable onPress={() => updateQuantity(product, -1)}>
                          <Text style={styles.qtyAction}>-</Text>
                        </Pressable>
                        <Text style={styles.qtyValue}>{quantities[product.id] || 0}</Text>
                        <Pressable onPress={() => updateQuantity(product, 1)}>
                          <Text style={styles.qtyAction}>+</Text>
                        </Pressable>
                      </View>
                    )
                  ) : (
                    <PrimaryButton label="Subscribe" style={styles.subscribeMini} />
                  )}
                </View>
              </View>
            </AppCard>
          </Animated.View>
        ))}
      </ScrollView>

      {active === 'one-time' && total > 0 && (
        <View style={styles.checkoutWrap}>
          <LinearGradient colors={GRADIENTS.checkout} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkoutBar}>
            <View style={styles.checkoutLeft}>
              <View style={styles.cartIconWrap}>
                <MaterialCommunityIcons name="cart-outline" color="#FFFFFF" size={20} />
              </View>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>
            <PrimaryButton label="Checkout" style={styles.checkoutButton} onPress={() => router.push('/(tabs)/cart')} />
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F8' },
  tabWrap: { marginTop: -18, paddingHorizontal: 16 },
  content: { padding: 16, gap: 12 },
  offlineNote: {
    color: '#7C8799',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4
  },
  productCard: { padding: 10, flexDirection: 'row', gap: 10 },
  productImage: { width: 74, height: 74, borderRadius: 12, backgroundColor: '#E2E8F0' },
  productBody: { flex: 1 },
  productTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  productTemp: { color: '#64748B', fontSize: 12, marginTop: 2, fontWeight: '500' },
  productVolume: { color: '#94A3B8', fontSize: 12, marginTop: 2, fontWeight: '500' },
  bottomRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  addButton: { backgroundColor: '#1E293B', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 6 },
  addText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    gap: 14,
    height: 33
  },
  qtyAction: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  qtyValue: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  subscribeMini: { width: 120 },
  checkoutWrap: { position: 'absolute', left: 12, right: 12, bottom: 80 },
  checkoutBar: { borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#7B2FF7', alignItems: 'center', justifyContent: 'center' },
  totalLabel: { color: '#A5B4FC', fontSize: 12, fontWeight: '500' },
  totalValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  checkoutButton: { width: 130 }
});
