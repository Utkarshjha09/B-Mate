import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AppOrder, CartItem, FoodItem, LaundryService, SubscriptionPlan, WaterProduct, Mess, DailyMenuItem, MacroItem, DietPlan, LaundryItem, TimeSlot } from '../types/app';

const BYPASS_CART_KEY = 'bmate.local.cart';
const PRICE_MULTIPLIER = 0.75;

function discountedPrice(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value * PRICE_MULTIPLIER));
}

async function getLocalCart() {
  const raw = await AsyncStorage.getItem(BYPASS_CART_KEY);
  if (!raw) {
    return [] as CartItem[];
  }
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

async function setLocalCart(items: CartItem[]) {
  await AsyncStorage.setItem(BYPASS_CART_KEY, JSON.stringify(items));
}

function shouldUseLocalCart(userId: string) {
  return userId.startsWith('bypass-');
}

function isCartTableMissing(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const message = String((error as { message?: string }).message || '').toLowerCase();
  return message.includes('could not find the table') || message.includes('relation "cart" does not exist');
}

async function readLocalUserCart(userId: string) {
  const localItems = await getLocalCart();
  return localItems.filter((item) => item.user_id === userId);
}

async function upsertLocalCartItem(userId: string, itemId: number, quantity: number, itemType: 'food' | 'water') {
  const localItems = await getLocalCart();
  const existing = localItems.findIndex(
    (item) => item.user_id === userId && Number(item.item_id) === Number(itemId) && item.item_type === itemType
  );
  const nextItem: CartItem = {
    id: Date.now(),
    user_id: userId,
    item_id: itemId,
    quantity,
    item_type: itemType
  };
  if (existing >= 0) {
    localItems[existing] = { ...localItems[existing], quantity };
  } else {
    localItems.push(nextItem);
  }
  await setLocalCart(localItems);
  return nextItem;
}

async function removeLocalCartItem(userId: string, itemId: number, itemType: 'food' | 'water') {
  const localItems = await getLocalCart();
  const filtered = localItems.filter(
    (item) => !(item.user_id === userId && Number(item.item_id) === Number(itemId) && item.item_type === itemType)
  );
  await setLocalCart(filtered);
}

async function clearLocalUserCart(userId: string) {
  const localItems = await getLocalCart();
  const filtered = localItems.filter((item) => item.user_id !== userId);
  await setLocalCart(filtered);
}

export const appService = {
  async getFoodItems() {
    const response = await supabase.from('food_items').select('*').order('id');
    if (response.data) {
      response.data = (response.data as FoodItem[]).map((item) => ({
        ...item,
        price: discountedPrice(item.price)
      }));
    }
    return response;
  },

  async getSubscriptions() {
    const response = await supabase.from('subscriptions').select('*').order('id');
    if (response.data) {
      response.data = (response.data as SubscriptionPlan[]).map((plan) => ({
        ...plan,
        price_weekly: discountedPrice(plan.price_weekly),
        price_monthly: discountedPrice(plan.price_monthly)
      }));
    }
    return response;
  },

  async getMesses() {
    const response = await supabase.from('messes').select('*').order('id');
    if (response.data) {
      response.data = (response.data as Mess[]).map((mess) => ({
        ...mess,
        charges_per_week: discountedPrice(mess.charges_per_week)
      }));
    }
    return response;
  },

  async getDailyMenu(messId: number) {
    return supabase.from('daily_menu').select('*').eq('mess_id', messId).order('category');
  },

  async getLaundryServices() {
    const response = await supabase.from('laundry_services').select('*').order('id');
    if (response.data) {
      response.data = (response.data as LaundryService[]).map((service) => ({
        ...service,
        price: discountedPrice(service.price)
      }));
    }
    return response;
  },

  async getLaundryItems() {
    const response = await supabase.from('laundry_items').select('*').order('id');
    if (response.data) {
      response.data = (response.data as LaundryItem[]).map((item) => ({
        ...item,
        price: discountedPrice(item.price)
      }));
    }
    return response;
  },

  async getTimeSlots() {
    return supabase.from('time_slots').select('*').order('date', { ascending: true });
  },

  async getWaterProducts() {
    const response = await supabase.from('water_products').select('*').order('id');
    if (response.data) {
      response.data = (response.data as WaterProduct[]).map((item) => ({
        ...item,
        price: discountedPrice(item.price)
      }));
    }
    return response;
  },

  async getCart(userId: string) {
    if (shouldUseLocalCart(userId)) {
      return { data: await readLocalUserCart(userId), error: null };
    }
    const response = await supabase.from('cart').select('*').eq('user_id', userId);
    if (response.error && isCartTableMissing(response.error)) {
      return { data: await readLocalUserCart(userId), error: null };
    }
    return response;
  },

  async setCartItem(userId: string, itemId: number, quantity: number, itemType: 'food' | 'water') {
    if (shouldUseLocalCart(userId)) {
      const nextItem = await upsertLocalCartItem(userId, itemId, quantity, itemType);
      return { data: nextItem, error: null };
    }
    const response = await supabase
      .from('cart')
      .upsert({ user_id: userId, item_id: itemId, quantity, item_type: itemType }, { onConflict: 'user_id,item_id,item_type' });
    if (response.error && isCartTableMissing(response.error)) {
      const nextItem = await upsertLocalCartItem(userId, itemId, quantity, itemType);
      return { data: nextItem, error: null };
    }
    return response;
  },

  async removeCartItem(userId: string, itemId: number, itemType: 'food' | 'water') {
    if (shouldUseLocalCart(userId)) {
      await removeLocalCartItem(userId, itemId, itemType);
      return { data: null, error: null };
    }
    const response = await supabase.from('cart').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType);
    if (response.error && isCartTableMissing(response.error)) {
      await removeLocalCartItem(userId, itemId, itemType);
      return { data: null, error: null };
    }
    return response;
  },

  async clearCart(userId: string) {
    if (shouldUseLocalCart(userId)) {
      await clearLocalUserCart(userId);
      return { data: null, error: null };
    }
    const response = await supabase.from('cart').delete().eq('user_id', userId);
    if (response.error && isCartTableMissing(response.error)) {
      await clearLocalUserCart(userId);
      return { data: null, error: null };
    }
    return response;
  },

  async createOrder(order: Omit<AppOrder, 'id'>) {
    return supabase.from('orders').insert(order).select().single();
  },

  async getMacroItems() {
    return supabase.from('macro_items').select('*').order('category');
  },

  async getMacroItemsByCategory(category: string) {
    return supabase.from('macro_items').select('*').eq('category', category).order('name');
  },

  async createDietPlan(plan: Omit<DietPlan, 'id' | 'created_at'>) {
    return supabase.from('diet_plans').insert(plan).select().single();
  },

  async getDietPlans(userId: string) {
    return supabase.from('diet_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  },

  async updateDietPlan(planId: string, updates: Partial<DietPlan>) {
    return supabase.from('diet_plans').update(updates).eq('id', planId).select().single();
  },

  async deleteDietPlan(planId: string) {
    return supabase.from('diet_plans').delete().eq('id', planId);
  }
};

export const fallbackData = {
  foodItems: [
    {
      id: 1,
      name: "Today's Basic Meal",
      price: 49,
      image: 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?auto=format&fit=crop&w=900&q=80',
      tags: ['Budget Friendly', 'Veg'],
      rating: 4.2,
      calories: 450,
      prep_time: '30-45 min'
    },
    {
      id: 2,
      name: 'Special Veg Meal',
      price: 89,
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=900&q=80',
      tags: ['Veg', 'Special'],
      rating: 4.8,
      calories: 650,
      prep_time: '35-50 min'
    },
    {
      id: 3,
      name: 'Paneer Rice Bowl',
      price: 79,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      tags: ['High Protein', 'Veg'],
      rating: 4.6,
      calories: 520,
      prep_time: '20-30 min'
    },
    {
      id: 4,
      name: 'Chicken Thali',
      price: 99,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
      tags: ['Non-Veg', 'Popular'],
      rating: 4.7,
      calories: 690,
      prep_time: '30-40 min'
    },
    {
      id: 5,
      name: 'South Indian Combo',
      price: 69,
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=900&q=80',
      tags: ['Light', 'Veg'],
      rating: 4.4,
      calories: 410,
      prep_time: '20-25 min'
    },
    {
      id: 6,
      name: 'Egg Protein Box',
      price: 74,
      image: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=900&q=80',
      tags: ['Protein', 'Budget'],
      rating: 4.3,
      calories: 470,
      prep_time: '15-25 min'
    },
    {
      id: 7,
      name: 'Veg Wrap Meal',
      price: 59,
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
      tags: ['Snack Meal', 'Veg'],
      rating: 4.2,
      calories: 360,
      prep_time: '15-20 min'
    },
    {
      id: 8,
      name: 'Fruit + Yogurt Bowl',
      price: 54,
      image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
      tags: ['Healthy', 'Breakfast'],
      rating: 4.5,
      calories: 310,
      prep_time: '10-15 min'
    }
  ] satisfies FoodItem[],
  subscriptions: [
    {
      id: 1,
      type: 'Starter Plan',
      price_weekly: 299,
      price_monthly: 1099
    },
    {
      id: 2,
      type: 'Smart Plan',
      price_weekly: 499,
      price_monthly: 1799
    },
    {
      id: 3,
      type: 'Pro Plan',
      price_weekly: 699,
      price_monthly: 2499
    }
  ] satisfies SubscriptionPlan[],
  messes: [
    {
      id: 1,
      name: 'North Campus Mess',
      rating: 4.5,
      charges_per_week: 520,
      image: 'https://images.unsplash.com/photo-1517521318897-7d2850a30c90?auto=format&fit=crop&w=900&q=80',
      description: 'Budget friendly quality meals'
    },
    {
      id: 2,
      name: 'South Campus Mess',
      rating: 4.3,
      charges_per_week: 560,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      description: 'Premium dining experience'
    },
    {
      id: 3,
      name: 'East Wing Mess',
      rating: 4.7,
      charges_per_week: 490,
      image: 'https://images.unsplash.com/photo-1504674900949-f282474e37ff?auto=format&fit=crop&w=900&q=80',
      description: 'Homestyle authentic meals'
    }
  ] satisfies Mess[],
  dailyMenu: [
    {
      id: 1,
      mess_id: 1,
      item_name: 'Butter Naan & Paneer Butter Masala',
      category: 'lunch' as const,
      is_special: true,
      description: 'Creamy paneer in rich tomato sauce with butter naan'
    },
    {
      id: 2,
      mess_id: 1,
      item_name: 'Dal Fry',
      category: 'lunch' as const,
      is_special: false,
      description: 'Lightly spiced lentils'
    },
    {
      id: 3,
      mess_id: 1,
      item_name: 'Rice & Salad',
      category: 'lunch' as const,
      is_special: false
    },
    {
      id: 4,
      mess_id: 2,
      item_name: 'Tandoori Chicken',
      category: 'dinner' as const,
      is_special: true,
      description: 'Smoky tandoori chicken with mint yogurt'
    },
    {
      id: 5,
      mess_id: 2,
      item_name: 'Biryani',
      category: 'dinner' as const,
      is_special: false
    },
    {
      id: 6,
      mess_id: 3,
      item_name: 'Poha + Sprouts',
      category: 'breakfast' as const,
      is_special: false,
      description: 'Light and healthy breakfast combo'
    },
    {
      id: 7,
      mess_id: 3,
      item_name: 'Rajma Rice',
      category: 'lunch' as const,
      is_special: true,
      description: 'Protein rich rajma with steamed rice'
    },
    {
      id: 8,
      mess_id: 3,
      item_name: 'Roti + Mixed Veg + Dal',
      category: 'dinner' as const,
      is_special: false,
      description: 'Balanced dinner plate'
    }
  ] satisfies DailyMenuItem[],
  laundryServices: [
    {
      id: 1,
      name: 'Wash & Fold',
      price: 19,
      description: 'Everyday clothes'
    },
    {
      id: 2,
      name: 'Extra Items',
      price: 0,
      description: 'Bedsheet, Blanket, etc.'
    },
    {
      id: 3,
      name: 'Dry Cleaning',
      price: 89,
      description: 'Suits, dresses, delicate fabrics'
    }
  ] satisfies LaundryService[],
  waterProducts: [
    {
      id: 1,
      name: 'Chilled Water Container',
      volume: '20 Liters',
      temp: 'Chilled (5C)',
      price: 59,
      image: 'https://images.unsplash.com/photo-1624392294437-8fc9f876f4d3?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 2,
      name: 'Regular Water Container',
      volume: '20 Liters',
      temp: 'Room Temp',
      price: 29,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 3,
      name: 'Insulated Hot Water',
      volume: '5 Liters',
      temp: 'Hot (80C)',
      price: 95,
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'
    }
  ] satisfies WaterProduct[],
  macroItems: [
    {
      id: 1,
      name: 'Chicken Breast',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 31,
      carbs: 0,
      fat: 3,
      calories: 165,
      serving_size: '100g',
      description: 'Lean protein source'
    },
    {
      id: 2,
      name: 'Egg Whites',
      image: 'https://images.unsplash.com/photo-1585551868-44d7a22f6126?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 11,
      carbs: 1,
      fat: 0.4,
      calories: 52,
      serving_size: '100g'
    },
    {
      id: 3,
      name: 'Greek Yogurt',
      image: 'https://images.unsplash.com/photo-1488477452480-a6461f184b0d?auto=format&fit=crop&w=900&q=80',
      category: 'dairy' as const,
      protein: 10,
      carbs: 3,
      fat: 5,
      calories: 100,
      serving_size: '100g',
      description: 'High protein dairy'
    },
    {
      id: 4,
      name: 'Brown Rice',
      image: 'https://images.unsplash.com/photo-1586852212519-c21eb51cb549?auto=format&fit=crop&w=900&q=80',
      category: 'grain' as const,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      calories: 111,
      serving_size: '100g cooked',
      description: 'Whole grain carbs'
    },
    {
      id: 5,
      name: 'Oats',
      image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=80',
      category: 'grain' as const,
      protein: 2.4,
      carbs: 27,
      fat: 1.4,
      calories: 150,
      serving_size: '40g dry',
      description: 'Fiber rich grain'
    },
    {
      id: 6,
      name: 'Sweet Potato',
      image: 'https://images.unsplash.com/photo-1565299624946-b28974340ae0?auto=format&fit=crop&w=900&q=80',
      category: 'carb' as const,
      protein: 0.9,
      carbs: 20,
      fat: 0.1,
      calories: 86,
      serving_size: '100g',
      description: 'Complex carbs with nutrients'
    },
    {
      id: 7,
      name: 'Broccoli',
      image: 'https://images.unsplash.com/photo-1552693206-0c51c6f1a02f?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 2.8,
      carbs: 7,
      fat: 0.4,
      calories: 34,
      serving_size: '100g',
      description: 'Low calorie vegetable'
    },
    {
      id: 8,
      name: 'Spinach',
      image: 'https://images.unsplash.com/photo-1585518419759-66baaa01b387?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 2.7,
      carbs: 3.6,
      fat: 0.4,
      calories: 23,
      serving_size: '100g',
      description: 'Nutrient dense'
    },
    {
      id: 9,
      name: 'Banana',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb3f854d5c8?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 1.1,
      carbs: 27,
      fat: 0.3,
      calories: 89,
      serving_size: '100g',
      description: 'Natural carbs & potassium'
    },
    {
      id: 10,
      name: 'Almonds',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac1d675c66?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 21,
      carbs: 22,
      fat: 50,
      calories: 579,
      serving_size: '100g',
      description: 'Healthy fats and protein'
    },
    {
      id: 11,
      name: 'Apple',
      image: 'https://images.unsplash.com/photo-1560806674-d257a56036d3?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.3,
      carbs: 25,
      fat: 0.2,
      calories: 95,
      serving_size: '1 medium',
      description: 'Fiber and antioxidants'
    },
    {
      id: 12,
      name: 'Orange',
      image: 'https://images.unsplash.com/photo-1585556799139-f0f5cbf35aea?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.9,
      carbs: 12,
      fat: 0.2,
      calories: 47,
      serving_size: '1 medium',
      description: 'Vitamin C rich'
    },
    {
      id: 13,
      name: 'Blueberries',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac1d675c66?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.7,
      carbs: 14,
      fat: 0.3,
      calories: 57,
      serving_size: '100g',
      description: 'Antioxidant powerhouse'
    },
    {
      id: 14,
      name: 'Grapes',
      image: 'https://images.unsplash.com/photo-1585314317133-70ae40827e60?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.6,
      carbs: 17,
      fat: 0.2,
      calories: 67,
      serving_size: '100g',
      description: 'Quick energy carbs'
    },
    {
      id: 15,
      name: 'Watermelon',
      image: 'https://images.unsplash.com/photo-1585322156881-e8e5c3a5c6ee?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.6,
      carbs: 12,
      fat: 0.2,
      calories: 46,
      serving_size: '100g',
      description: 'Hydrating with vitamins'
    },
    {
      id: 16,
      name: 'Mango',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac1d675c66?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 0.8,
      carbs: 25,
      fat: 0.4,
      calories: 99,
      serving_size: '100g',
      description: 'Tropical fruit goodness'
    },
    {
      id: 17,
      name: 'Kiwi',
      image: 'https://images.unsplash.com/photo-1585314317133-70ae40827e60?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 1.1,
      carbs: 14,
      fat: 0.5,
      calories: 61,
      serving_size: '100g',
      description: 'Enzyme and vitamin rich'
    },
    {
      id: 18,
      name: 'Tomato',
      image: 'https://images.unsplash.com/photo-1592923926686-3d6d20e1e87b?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      calories: 18,
      serving_size: '100g',
      description: 'Lycopene and vitamins'
    },
    {
      id: 19,
      name: 'Carrots',
      image: 'https://images.unsplash.com/photo-1584298589523-8e3e5d09d800?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      calories: 41,
      serving_size: '100g',
      description: 'Beta carotene rich'
    },
    {
      id: 20,
      name: 'Bell Pepper',
      image: 'https://images.unsplash.com/photo-1592923926686-3d6d20e1e87b?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 1,
      carbs: 6,
      fat: 0.3,
      calories: 31,
      serving_size: '100g',
      description: 'Colorful and crunchy'
    },
    {
      id: 21,
      name: 'Cucumber',
      image: 'https://images.unsplash.com/photo-1589927961901-db931fb34bbb?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 0.7,
      carbs: 4,
      fat: 0.1,
      calories: 16,
      serving_size: '100g',
      description: 'Hydrating vegetable'
    },
    {
      id: 22,
      name: 'Mushroom',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 2.3,
      carbs: 3.3,
      fat: 0.3,
      calories: 22,
      serving_size: '100g',
      description: 'Low calorie protein'
    },
    {
      id: 23,
      name: 'Fish (Salmon)',
      image: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 25,
      carbs: 0,
      fat: 13,
      calories: 208,
      serving_size: '100g',
      description: 'Omega-3 fatty acids'
    },
    {
      id: 24,
      name: 'Tofu',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac1d675c66?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 15,
      carbs: 2,
      fat: 9,
      calories: 144,
      serving_size: '100g',
      description: 'Plant-based protein'
    },
    {
      id: 25,
      name: 'Lentils',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 9,
      carbs: 20,
      fat: 0.4,
      calories: 116,
      serving_size: '100g cooked',
      description: 'Protein and fiber'
    },
    {
      id: 26,
      name: 'Cottage Cheese',
      image: 'https://images.unsplash.com/photo-1452195152171-5c0ee6dcb718?auto=format&fit=crop&w=900&q=80',
      category: 'dairy' as const,
      protein: 11,
      carbs: 3.4,
      fat: 4.3,
      calories: 98,
      serving_size: '100g',
      description: 'Creamy protein source'
    },
    {
      id: 27,
      name: 'Milk (Low-fat)',
      image: 'https://images.unsplash.com/photo-1550583874-b592591ae338?auto=format&fit=crop&w=900&q=80',
      category: 'dairy' as const,
      protein: 3.4,
      carbs: 4.8,
      fat: 1.5,
      calories: 49,
      serving_size: '100ml',
      description: 'Calcium rich'
    },
    {
      id: 28,
      name: 'Whole Wheat Bread',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
      category: 'grain' as const,
      protein: 3.6,
      carbs: 41,
      fat: 1.5,
      calories: 193,
      serving_size: '1 slice',
      description: 'Fiber and sustenance'
    },
    {
      id: 29,
      name: 'Quinoa',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      category: 'grain' as const,
      protein: 8,
      carbs: 39,
      fat: 4,
      calories: 222,
      serving_size: '100g cooked',
      description: 'Complete amino acids'
    },
    {
      id: 30,
      name: 'Pumpkin',
      image: 'https://images.unsplash.com/photo-1473093295203-cad00df16e50?auto=format&fit=crop&w=900&q=80',
      category: 'vegetable' as const,
      protein: 1,
      carbs: 9,
      fat: 0.1,
      calories: 26,
      serving_size: '100g',
      description: 'Beta carotene packed'
    },
    {
      id: 31,
      name: 'Avocado',
      image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 2,
      carbs: 9,
      fat: 15,
      calories: 160,
      serving_size: '100g',
      description: 'Healthy fats for satiety'
    },
    {
      id: 32,
      name: 'Chickpeas',
      image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 8.9,
      carbs: 27,
      fat: 2.6,
      calories: 164,
      serving_size: '100g cooked',
      description: 'Plant protein plus fiber'
    },
    {
      id: 33,
      name: 'Paneer Cubes',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
      category: 'dairy' as const,
      protein: 18,
      carbs: 1.2,
      fat: 20,
      calories: 265,
      serving_size: '100g',
      description: 'High protein dairy option'
    },
    {
      id: 34,
      name: 'Peanut Butter',
      image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80',
      category: 'protein' as const,
      protein: 25,
      carbs: 20,
      fat: 50,
      calories: 588,
      serving_size: '100g',
      description: 'Energy-dense spread'
    },
    {
      id: 35,
      name: 'Cottage Cheese Sandwich',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
      category: 'grain' as const,
      protein: 12,
      carbs: 30,
      fat: 8,
      calories: 245,
      serving_size: '1 sandwich',
      description: 'Quick balanced meal'
    },
    {
      id: 36,
      name: 'Mixed Seeds',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
      category: 'fruit' as const,
      protein: 20,
      carbs: 18,
      fat: 42,
      calories: 510,
      serving_size: '100g',
      description: 'Nutrient-dense snack mix'
    }
  ] satisfies MacroItem[],
  recentOrders: [
    {
      id: 1,
      user_id: 'fallback',
      type: 'laundry',
      total: 60,
      status: 'completed',
      created_at: 'Yesterday'
    }
  ] as AppOrder[],
  laundryItems: [
    {
      id: 1,
      name: 'Shirt/T-Shirt',
      price: 60,
      type: 'wash_ironing' as const,
      description: 'Cotton/Polyester blend'
    },
    {
      id: 2,
      name: 'Denim/Jeans',
      price: 80,
      type: 'wash_ironing' as const,
      description: 'Heavy fabric'
    },
    {
      id: 3,
      name: 'Pants/Trousers',
      price: 70,
      type: 'wash_ironing' as const,
      description: 'Casual or formal'
    },
    {
      id: 4,
      name: 'Shorts',
      price: 50,
      type: 'wash_ironing' as const,
      description: 'Summer wear'
    },
    {
      id: 5,
      name: 'Sweater/Hoodie',
      price: 100,
      type: 'wash_ironing' as const,
      description: 'Knit wear'
    },
    {
      id: 6,
      name: 'Jacket/Blazer',
      price: 150,
      type: 'wash_ironing' as const,
      description: 'Formal wear'
    },
    {
      id: 7,
      name: 'Bedsheet Set',
      price: 120,
      type: 'wash_ironing' as const,
      description: 'Double/Single'
    },
    {
      id: 8,
      name: 'Pillowcase (2)',
      price: 40,
      type: 'wash_ironing' as const
    },
    {
      id: 9,
      name: 'Suit',
      price: 250,
      type: 'dry_cleaning' as const,
      description: 'Full suit cleaning'
    },
    {
      id: 10,
      name: 'Formal Dress',
      price: 300,
      type: 'dry_cleaning' as const,
      description: 'Evening/party wear'
    },
    {
      id: 11,
      name: 'Blazer',
      price: 180,
      type: 'dry_cleaning' as const,
      description: 'Professional cleaning'
    },
    {
      id: 12,
      name: 'Coat/Overcoat',
      price: 200,
      type: 'dry_cleaning' as const
    },
    {
      id: 13,
      name: 'Wedding Dress',
      price: 500,
      type: 'dry_cleaning' as const,
      description: 'Specialty cleaning'
    },
    {
      id: 14,
      name: 'Silk/Delicate Items',
      price: 150,
      type: 'dry_cleaning' as const,
      description: 'Premium fabrics'
    }
  ] as LaundryItem[],
  timeSlots: [
    {
      id: 'slot-1',
      date: new Date().toISOString().split('T')[0],
      start_time: '08:00 AM',
      end_time: '10:00 AM',
      available: true
    },
    {
      id: 'slot-2',
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      available: true
    },
    {
      id: 'slot-3',
      date: new Date().toISOString().split('T')[0],
      start_time: '02:00 PM',
      end_time: '04:00 PM',
      available: false
    },
    {
      id: 'slot-4',
      date: new Date().toISOString().split('T')[0],
      start_time: '04:00 PM',
      end_time: '06:00 PM',
      available: true
    },
    {
      id: 'slot-5',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      start_time: '08:00 AM',
      end_time: '10:00 AM',
      available: true
    },
    {
      id: 'slot-6',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      available: true
    },
    {
      id: 'slot-7',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      start_time: '08:00 AM',
      end_time: '10:00 AM',
      available: true
    }
  ] as TimeSlot[],
  cart: [] as CartItem[]
};
