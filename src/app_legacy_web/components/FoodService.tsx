import React, { useState } from 'react';
import { Plus, Star, Clock, Info, Utensils, ChevronRight, CalendarCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const FoodService: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('daily');

  const categories = [
    { id: 'daily', label: 'Daily Menu' },
    { id: 'subs', label: 'Subscriptions' },
    { id: 'diet', label: 'Diet Plans' },
  ];

  const meals = [
    {
      id: 1,
      name: "Today's Basic Meal",
      calories: '450 kcal',
      price: '₹60',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0aGFsaXxlbnwxfHx8fDE3NzAzNTg2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Budget Friendly', 'Veg']
    },
    {
      id: 2,
      name: 'Special Veg Meal',
      calories: '600 kcal',
      price: '₹110',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1722715917813-fa234efa4a2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGxlYXZlcyUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQyODUzNzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      tags: ['Premium', 'Pure Veg']
    },
    {
      id: 3,
      name: 'Special Non-Veg Meal',
      calories: '750 kcal',
      price: '₹110',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwY3Vycnl8ZW58MXx8fHwxNzcwMzU4NjAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Spicy', 'Chicken']
    }
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-slate-200 to-slate-100 p-6 sticky top-0 z-10 shadow-sm border-b border-gray-300">
        <h1 className="text-2xl font-bold text-purple-900">B mate Food</h1>
        <p className="text-gray-500 text-sm">Delicious meals at student prices</p>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {activeCategory === 'daily' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Featured Today</h2>
              <button className="text-purple-600 text-sm font-medium hover:underline">See All</button>
            </div>
            
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <div className="h-40 w-full relative">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-gray-800 shadow-sm">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {meal.rating}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{meal.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {meal.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-bold text-lg text-purple-700">{meal.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Info size={14} />
                      {meal.calories}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      30-45 min
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 active:scale-95 transform shadow-lg shadow-purple-200">
                    <Plus size={18} />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeCategory === 'subs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Utensils size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Basic Meal Plan</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-gray-800 mb-1">1 Meal / Day</h4>
                  <p className="text-xs text-gray-500 mb-3">Perfect for lunch or dinner</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 text-center">
                      <div className="text-xs text-gray-400 uppercase font-bold">Weekly</div>
                      <div className="font-bold text-purple-700">₹399</div>
                    </div>
                    <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 text-center">
                      <div className="text-xs text-gray-400 uppercase font-bold">Monthly</div>
                      <div className="font-bold text-purple-700">₹1599</div>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-white border border-purple-200 text-purple-700 py-2 rounded-lg text-sm font-medium hover:bg-purple-50">Select</button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-gray-800 mb-1">2 Meals / Day</h4>
                  <p className="text-xs text-gray-500 mb-3">Lunch & Dinner sorted</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 text-center">
                      <div className="text-xs text-gray-400 uppercase font-bold">Weekly</div>
                      <div className="font-bold text-purple-700">₹749</div>
                    </div>
                    <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 text-center">
                      <div className="text-xs text-gray-400 uppercase font-bold">Monthly</div>
                      <div className="font-bold text-purple-700">₹2999</div>
                    </div>
                  </div>
                   <button className="w-full mt-3 bg-white border border-purple-200 text-purple-700 py-2 rounded-lg text-sm font-medium hover:bg-purple-50">Select</button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 p-2 rounded-lg text-purple-300">
                  <CalendarCheck size={20} />
                </div>
                <h3 className="text-lg font-bold">Customizable Meal</h3>
              </div>
              <p className="text-sm text-purple-200 mb-6">Build your own plan. Choose dishes, days, and times.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs text-purple-300 uppercase font-bold mb-1">Weekly</div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xl">₹</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs text-purple-300 uppercase font-bold mb-1">Monthly</div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xl">₹</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-white text-purple-900 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors">
                Start Customizing
              </button>
            </div>
          </div>
        )}

        {activeCategory === 'diet' && (
          <div className="text-center py-12 text-gray-500">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Utensils size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Custom Diet Plans</h3>
            <p className="max-w-xs mx-auto text-sm">Create a personalized meal plan based on your caloric needs and dietary restrictions.</p>
            <button className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-purple-200">
              Start Customizing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};