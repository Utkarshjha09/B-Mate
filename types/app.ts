export type UserProfile = {
  id: string;
  name: string;
  email: string;
  dob?: string | null;
  phone?: string | null;
  country_code?: string | null;
  hostel?: string | null;
  room?: string | null;
  updated_at?: string | null;
};

export type FoodItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  tags: string[];
  rating: number;
  calories?: number;
  prep_time?: string;
};

export type SubscriptionPlan = {
  id: number;
  type: string;
  price_weekly: number;
  price_monthly: number;
};

export type LaundryItem = {
  id: number;
  name: string;
  price: number;
  type: 'wash_ironing' | 'dry_cleaning';
  description?: string;
  image?: string;
};

export type LaundryService = {
  id: number;
  name: string;
  price: number;
  description?: string;
};

export type LaundryBooking = {
  id?: string;
  user_id?: string;
  items: LaundryCartItem[];
  selected_slot: TimeSlot;
  total_price: number;
  status?: 'pending' | 'confirmed' | 'completed';
  created_at?: string;
};

export type LaundryCartItem = {
  item_id: number;
  item_name: string;
  type: 'wash_ironing' | 'dry_cleaning';
  quantity: number;
  price_per_unit: number;
  subtotal: number;
};

export type TimeSlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
};

export type WaterProduct = {
  id: number;
  name: string;
  volume: string;
  temp: string;
  price: number;
  image: string;
};

export type CartItem = {
  id: number;
  user_id: string;
  item_id: number;
  quantity: number;
  item_type: 'food' | 'water';
};

export type AppOrder = {
  id: number;
  user_id: string;
  type: 'food' | 'water' | 'laundry';
  total: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  created_at?: string;
};

export type Mess = {
  id: number;
  name: string;
  rating: number;
  charges_per_week: number;
  image?: string;
  description?: string;
};

export type DailyMenuItem = {
  id: number;
  mess_id: number;
  item_name: string;
  category: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  diet_type?: 'veg' | 'non_veg';
  is_special: boolean;
  description?: string;
  image?: string;
};

export type MacroItem = {
  id: number;
  name: string;
  image: string;
  category: 'protein' | 'carb' | 'vegetable' | 'fruit' | 'grain' | 'dairy';
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  calories: number;
  serving_size: string; // e.g., "100g", "1 cup"
  description?: string;
};

export type DietPlanItem = {
  macro_item_id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  macroItem?: MacroItem;  // Full item details for display
};

export type DietPlan = {
  id: string;
  user_id: string;
  name: string;
  items: DietPlanItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at?: string;
};
